import { useState, useEffect } from "react";
import GameBoard from "./GameBoard";
import Home from "./Home";
import OnlineLobby from "./OnlineLobby";
import Profile from "./Profile";
import Auth from "./Auth";
import Matchmaking from "./Matchmaking";
import { getSocket } from "./OnlineLobby";
import { armAudioOnFirstGesture } from "./audio";
import "./App.css";

function loadAuth() {
  try { return JSON.parse(localStorage.getItem("garame_auth") || "null"); } catch { return null; }
}

// Navigation persistée (par onglet) pour survivre à un rafraîchissement de page
const NAV_KEY = "garame_nav";
function loadNav() {
  try { return JSON.parse(sessionStorage.getItem(NAV_KEY) || "null"); } catch { return null; }
}
function clearNav() {
  try { sessionStorage.removeItem(NAV_KEY); } catch {}
}

export default function App() {
  const auth = loadAuth();
  const savedNav = auth ? loadNav() : null;
  const [screen, setScreen] = useState(() => (auth ? (savedNav?.screen ?? "home") : "auth")); // "auth" | "home" | "onlineLobby" | "game" | "profile"
  const [gameMode, setGameMode] = useState(savedNav?.gameMode ?? null);
  const [gameKey, setGameKey] = useState(0);
  const [playerAvatars, setPlayerAvatars] = useState(savedNav?.playerAvatars ?? [0, 6]); // [p1Id, p2Id]
  // Vrai uniquement au tout premier montage après un refresh en pleine partie
  const [resumeGame, setResumeGame] = useState(() => savedNav?.screen === "game");
  const [onlineData, setOnlineData] = useState(() => {
    // Reprise d'une partie online après refresh : on recrée le socket, GameBoard rejoint la salle
    if (savedNav?.screen === "game" && savedNav?.gameMode === "online" && savedNav?.online) {
      const { roomCode, myIndex, remotePseudo } = savedNav.online;
      return { socket: getSocket(), myIndex, roomCode, remotePseudo };
    }
    return null;
  }); // { socket, myIndex, roomCode, remotePseudo }
  // Adversaire fictif du mode "Sans mise" (l'IA affichée sous un faux nom)
  const [aiOpponent, setAiOpponent] = useState(savedNav?.aiOpponent ?? null);
  const [localPseudo, setLocalPseudo] = useState(auth?.pseudo ?? "");
  const [bankroll, setBankroll] = useState(auth?.bankroll ?? 100000);

  const fetchBankroll = (pseudo) => {
    if (!pseudo) return;
    fetch(`/api/user/${encodeURIComponent(pseudo)}`)
      .then(r => r.json())
      .then(data => { if (typeof data.bankroll === "number") setBankroll(data.bankroll); })
      .catch(() => {});
  };

  useEffect(() => {
    if (localPseudo) fetchBankroll(localPseudo);
    armAudioOnFirstGesture();
  }, []);

  // Sauvegarde la navigation courante à chaque changement (pour le refresh)
  useEffect(() => {
    if (screen === "auth") { clearNav(); return; }
    const snap = { screen, gameMode, playerAvatars };
    if (gameMode === "online" && onlineData) {
      snap.online = {
        roomCode: onlineData.roomCode,
        myIndex: onlineData.myIndex,
        remotePseudo: onlineData.remotePseudo,
      };
    }
    if (gameMode === "ia" && aiOpponent) snap.aiOpponent = aiOpponent;
    try { sessionStorage.setItem(NAV_KEY, JSON.stringify(snap)); } catch {}
  }, [screen, gameMode, onlineData, playerAvatars, aiOpponent]);

  // Reprise online impossible (salle expirée / serveur redémarré) → retour accueil
  useEffect(() => {
    const socket = onlineData?.socket;
    if (!socket) return;
    const onRejoinError = () => {
      setScreen("home");
      setGameMode(null);
      setOnlineData(null);
      setResumeGame(false);
    };
    socket.on("rejoinError", onRejoinError);
    return () => socket.off("rejoinError", onRejoinError);
  }, [onlineData]);

  const handleAuthSuccess = ({ pseudo, bankroll: br }) => {
    setLocalPseudo(pseudo);
    setBankroll(br);
    setScreen("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("garame_auth");
    clearNav();
    setResumeGame(false);
    setLocalPseudo("");
    setBankroll(100000);
    setScreen("auth");
  };

  const handleStartGame = (mode, avatars) => {
    if (avatars) setPlayerAvatars(avatars);
    setResumeGame(false);
    if (mode === "online") {
      setScreen("onlineLobby");
      setGameMode("online");
    } else if (mode === "ia") {
      // "Sans mise" : recherche d'un adversaire (factice) avant la partie
      setAiOpponent(null);
      setScreen("matchmaking");
    } else {
      setGameMode(mode);
      setGameKey(prev => prev + 1);
      setScreen("game");
    }
  };

  // Adversaire "trouvé" → lance la partie IA sous le faux nom
  const handleMatchFound = (opponent) => {
    setAiOpponent(opponent);
    setResumeGame(false);
    setGameMode("ia");
    setGameKey(prev => prev + 1);
    setScreen("game");
  };

  const handleOnlineGameStart = (socket, myIndex, roomCode, remotePseudo) => {
    setResumeGame(false);
    setOnlineData({ socket, myIndex, roomCode, remotePseudo });
    setGameKey(prev => prev + 1);
    setScreen("game");
  };

  const handleBackToHome = () => {
    fetchBankroll(localPseudo);
    setResumeGame(false);
    setScreen("home");
    setGameMode(null);
    setOnlineData(null);
    setAiOpponent(null);
  };

  // Réinitialise le solde du compte à 100 000 (côté serveur + UI)
  const handleResetBankroll = () => {
    setBankroll(100000);
    if (!localPseudo) return;
    fetch("/api/user/bankroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pseudo: localPseudo, bankroll: 100000 }),
    })
      .then(r => r.json())
      .then(data => { if (typeof data.bankroll === "number") setBankroll(data.bankroll); })
      .catch(() => {});
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a" }}>
      {screen === "auth" && (
        <Auth onAuthSuccess={handleAuthSuccess} />
      )}
      {screen === "home" && (
        <Home
          onStartGame={handleStartGame}
          onProfile={() => setScreen("profile")}
          bankroll={bankroll}
          pseudo={localPseudo}
        />
      )}
      {screen === "profile" && (
        <Profile onBack={() => setScreen("home")} avatarId={playerAvatars[0]} bankroll={bankroll} onLogout={handleLogout} onResetBankroll={handleResetBankroll} />
      )}
      {screen === "matchmaking" && (
        <Matchmaking
          pseudo={localPseudo}
          myAvatarId={playerAvatars[0]}
          onMatchFound={handleMatchFound}
          onCancel={() => setScreen("home")}
        />
      )}
      {screen === "onlineLobby" && (
        <OnlineLobby
          pseudo={localPseudo}
          onGameStart={handleOnlineGameStart}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "game" && (
        <GameBoard
          key={gameKey}
          gameMode={gameMode}
          onBackToHome={handleBackToHome}
          socket={onlineData?.socket ?? null}
          myIndex={onlineData?.myIndex ?? 0}
          roomCode={onlineData?.roomCode ?? null}
          remotePseudo={onlineData?.remotePseudo ?? null}
          localPseudo={localPseudo}
          initialBankroll={bankroll}
          playerAvatars={playerAvatars}
          resumed={resumeGame}
          aiName={aiOpponent?.name ?? null}
          aiAvatarId={aiOpponent?.avatarId ?? null}
        />
      )}
    </div>
  );
}
