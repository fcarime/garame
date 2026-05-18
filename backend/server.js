const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("Connecté:", socket.id);

  socket.on("createRoom", () => {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    rooms[code] = { players: [socket.id] };
    socket.join(code);
    socket.emit("roomCreated", { roomCode: code, playerIndex: 0 });
    console.log(`Salle ${code} créée`);
  });

  socket.on("joinRoom", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return socket.emit("joinError", "Salle introuvable");
    if (room.players.length >= 2) return socket.emit("joinError", "Salle pleine");

    room.players.push(socket.id);
    socket.join(roomCode);
    socket.emit("roomJoined", { roomCode, playerIndex: 1 });
    socket.to(roomCode).emit("opponentJoined");
    console.log(`Joueur rejoint salle ${roomCode}`);
  });

  // L'hôte envoie les mains au début de chaque manche
  socket.on("startRound", ({ roomCode, hands, roundStarter }) => {
    socket.to(roomCode).emit("roundStarted", { hands, roundStarter });
  });

  // Relayer le coup joué à l'adversaire seulement
  socket.on("playCard", ({ roomCode, card, playerIdx }) => {
    socket.to(roomCode).emit("cardPlayed", { card, playerIdx });
  });

  socket.on("disconnect", () => {
    for (const [code, room] of Object.entries(rooms)) {
      if (room.players.includes(socket.id)) {
        socket.to(code).emit("opponentDisconnected");
        delete rooms[code];
        console.log(`Salle ${code} fermée`);
      }
    }
  });
});

// Sert le frontend buildé (dist/) si disponible
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Serveur Garame sur http://localhost:${PORT}`);
});
