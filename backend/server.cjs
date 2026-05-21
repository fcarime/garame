const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.json());

// ── Base utilisateurs en mémoire ──────────────────────────────────────────
// Clé : pseudo (string), valeur : { pseudo, bankroll, gamesPlayed, gamesWon }
const users = new Map();

function getUser(pseudo) {
  if (!pseudo) return null;
  const key = pseudo.trim().toLowerCase();
  if (!users.has(key)) {
    users.set(key, { pseudo: pseudo.trim(), bankroll: 100000, gamesPlayed: 0, gamesWon: 0 });
  }
  return users.get(key);
}

// ── REST API utilisateurs ─────────────────────────────────────────────────
app.get("/api/user/:pseudo", (req, res) => {
  const user = getUser(req.params.pseudo);
  if (!user) return res.status(400).json({ error: "pseudo requis" });
  res.json(user);
});

// Synchronisation bankroll depuis localStorage client (si serveur redémarre)
app.post("/api/user/sync", (req, res) => {
  const { pseudo, bankroll } = req.body;
  if (!pseudo) return res.status(400).json({ error: "pseudo requis" });
  const key = pseudo.trim().toLowerCase();
  if (!users.has(key)) {
    users.set(key, { pseudo: pseudo.trim(), bankroll: bankroll ?? 100000, gamesPlayed: 0, gamesWon: 0 });
  }
  res.json(users.get(key));
});

// ── Salles de jeu ─────────────────────────────────────────────────────────
const rooms = {};

io.on("connection", (socket) => {
  console.log("Connecté:", socket.id);

  socket.on("createRoom", ({ pseudo } = {}) => {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    const user = getUser(pseudo);
    rooms[code] = { players: [socket.id], pseudos: [pseudo ?? "Joueur 1"] };
    socket.pseudo = pseudo;
    socket.join(code);
    socket.emit("roomCreated", {
      roomCode: code,
      playerIndex: 0,
      bankroll: user?.bankroll ?? 100000,
    });
    console.log(`Salle ${code} créée par ${pseudo}`);
  });

  socket.on("joinRoom", ({ roomCode, pseudo }) => {
    const room = rooms[roomCode];
    if (!room) return socket.emit("joinError", "Salle introuvable");
    if (room.players.length >= 2) return socket.emit("joinError", "Salle pleine");

    const user = getUser(pseudo);
    room.players.push(socket.id);
    room.pseudos.push(pseudo ?? "Joueur 2");
    socket.pseudo = pseudo;
    socket.join(roomCode);

    // Envoie à celui qui rejoint : son index + pseudo de l'hôte
    socket.emit("roomJoined", {
      roomCode,
      playerIndex: 1,
      opponentPseudo: room.pseudos[0],
      bankroll: user?.bankroll ?? 100000,
    });
    // Envoie à l'hôte : pseudo du joueur qui vient de rejoindre
    socket.to(roomCode).emit("opponentJoined", { opponentPseudo: pseudo ?? "Joueur 2" });
    console.log(`${pseudo} a rejoint la salle ${roomCode}`);
  });

  // Résultat de partie → mise à jour des bankrolls
  socket.on("gameResult", ({ roomCode, winnerPseudo, loserPseudo }) => {
    if (!winnerPseudo || !loserPseudo) return;

    const winner = getUser(winnerPseudo);
    const loser  = getUser(loserPseudo);

    winner.bankroll += 2000;
    winner.gamesWon++;
    winner.gamesPlayed++;
    loser.bankroll = Math.max(0, loser.bankroll - 2000);
    loser.gamesPlayed++;

    io.to(roomCode).emit("bankrollUpdated", {
      [winnerPseudo]: winner.bankroll,
      [loserPseudo]:  loser.bankroll,
    });

    console.log(`Résultat salle ${roomCode} : ${winnerPseudo} +2000 / ${loserPseudo} -2000`);
  });

  // Relais mains début de manche (avec état complet pour resync)
  socket.on("startRound", ({ roomCode, hands, roundStarter, scores, currentRound }) => {
    socket.to(roomCode).emit("roundStarted", { hands, roundStarter, scores, currentRound });
  });

  // Relais victoire spéciale (triple 7 ou main ≤ 21)
  socket.on("specialWin", ({ roomCode, sw, hands, roundStarter, scores, currentRound, potValue }) => {
    socket.to(roomCode).emit("specialWinNotified", { sw, hands, roundStarter, scores, currentRound, potValue });
  });

  // Relais coup joué
  socket.on("playCard", ({ roomCode, card, playerIdx }) => {
    socket.to(roomCode).emit("cardPlayed", { card, playerIdx });
  });

  // Relais redémarrage de partie (host -> remote)
  socket.on("restartGame", ({ roomCode }) => {
    socket.to(roomCode).emit("gameRestarted");
  });

  // Demande de redémarrage par le distant (remote -> host)
  socket.on("requestRestart", ({ roomCode }) => {
    socket.to(roomCode).emit("restartRequested");
  });

  // Le joueur quitte volontairement la partie (← MENU / ACCUEIL)
  socket.on("leaveRoom", ({ roomCode }) => {
    if (!roomCode) return;
    socket.to(roomCode).emit("opponentDisconnected");
    socket.leave(roomCode);
    if (rooms[roomCode]) {
      delete rooms[roomCode];
      console.log(`Salle ${roomCode} fermée (départ volontaire: ${socket.id})`);
    }
  });

  // Demande de reconnexion (pseudo + roomCode après retour sur la page)
  socket.on("rejoinRoom", ({ roomCode, pseudo, playerIndex }) => {
    const room = rooms[roomCode];
    if (!room) return socket.emit("rejoinError", "Salle expirée ou introuvable");

    // Annule le timer de déconnexion si encore en attente
    if (room.reconnectTimer) {
      clearTimeout(room.reconnectTimer);
      room.reconnectTimer = null;
    }

    // Met à jour le socket id du joueur dans la salle
    room.players[playerIndex] = socket.id;
    socket.join(roomCode);

    // Confirme la reconnexion au joueur revenu
    socket.emit("rejoined", { playerIndex, roomCode });
    // Notifie l'adversaire que le joueur est de retour
    socket.to(roomCode).emit("opponentRejoined");
    console.log(`${pseudo} reconnecté à ${roomCode}`);
  });

  // Demande de sync d'état de jeu (envoyé par le joueur reconnecté à l'hôte)
  socket.on("requestGameState", ({ roomCode }) => {
    socket.to(roomCode).emit("gameStateSyncRequest");
  });

  // L'hôte répond avec l'état courant du jeu
  socket.on("sendGameState", ({ roomCode, state }) => {
    socket.to(roomCode).emit("gameStateSync", state);
  });

  socket.on("disconnect", () => {
    for (const [code, room] of Object.entries(rooms)) {
      const idx = room.players.indexOf(socket.id);
      if (idx !== -1) {
        // Marque le slot comme déconnecté temporairement
        room.players[idx] = null;
        // Notifie l'adversaire avec le délai de grâce
        io.to(code).emit("opponentReconnecting", { seconds: 30 });
        console.log(`Joueur déconnecté de ${code}, grâce 30s...`);

        // Ferme la salle seulement après 30 secondes sans reconnexion
        room.reconnectTimer = setTimeout(() => {
          if (rooms[code]) {
            io.to(code).emit("opponentDisconnected");
            delete rooms[code];
            console.log(`Salle ${code} fermée (timeout reconnexion)`);
          }
        }, 30000);
      }
    }
  });
});

// ── Frontend statique ─────────────────────────────────────────────────────
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Serveur Garame sur http://localhost:${PORT}`);
});
