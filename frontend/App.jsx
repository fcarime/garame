import { useState, useEffect } from "react";
import GameBoard from "./GameBoard";
import Home from "./Home";
import OnlineLobby from "./OnlineLobby";
import Profile from "./Profile";
import "./App.css";

export default function App() {
  const [screen, setScreen] = useState("home"); // "home" | "onlineLobby" | "game" | "profile"
  const [gameMode, setGameMode] = useState(null);
  const [gameKey, setGameKey] = useState(0);
  const [onlineData, setOnlineData] = useState(null); // { socket, myIndex, roomCode, remotePseudo }
  const [playerAvatars, setPlayerAvatars] = useState([0, 6]); // [p1Id, p2Id]
  const [localPseudo, setLocalPseudo] = useState("");
  const [bankroll, setBankroll] = useState(100000);

  const fetchBankroll = (pseudo) => {
    if (!pseudo) return;
    fetch(`/api/user/${encodeURIComponent(pseudo)}`)
      .then(r => r.json())
      .then(data => { if (typeof data.bankroll === "number") setBankroll(data.bankroll); })
      .catch(() => {});
  };

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("garame_profile") || "{}");
      if (stored.pseudo) {
        setLocalPseudo(stored.pseudo);
        fetchBankroll(stored.pseudo);
      }
    } catch {}
  }, []);

  const handleStartGame = (mode, avatars) => {
    if (avatars) setPlayerAvatars(avatars);
    if (mode === "online") {
      setScreen("onlineLobby");
      setGameMode("online");
    } else {
      setGameMode(mode);
      setGameKey(prev => prev + 1);
      setScreen("game");
    }
  };

  const handleOnlineGameStart = (socket, myIndex, roomCode, remotePseudo) => {
    setOnlineData({ socket, myIndex, roomCode, remotePseudo });
    setGameKey(prev => prev + 1);
    setScreen("game");
  };

  const handleBackToHome = () => {
    fetchBankroll(localPseudo);
    setScreen("home");
    setGameMode(null);
    setOnlineData(null);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a" }}>
      {screen === "home" && (
        <Home
          onStartGame={handleStartGame}
          onProfile={() => setScreen("profile")}
          bankroll={bankroll}
          pseudo={localPseudo}
        />
      )}
      {screen === "profile" && (
        <Profile onBack={() => setScreen("home")} avatarId={playerAvatars[0]} bankroll={bankroll} />
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
        />
      )}
    </div>
  );
}
