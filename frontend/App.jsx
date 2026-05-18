import { useState } from "react";
import GameBoard from "./GameBoard";
import Home from "./Home";
import OnlineLobby from "./OnlineLobby";
import Profile from "./Profile";
import "./App.css";

export default function App() {
  const [screen, setScreen] = useState("home"); // "home" | "onlineLobby" | "game" | "profile"
  const [gameMode, setGameMode] = useState(null);
  const [gameKey, setGameKey] = useState(0);
  const [onlineData, setOnlineData] = useState(null); // { socket, myIndex, roomCode }
  const [playerAvatars, setPlayerAvatars] = useState([0, 6]); // [p1Id, p2Id]

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

  const handleOnlineGameStart = (socket, myIndex, roomCode) => {
    setOnlineData({ socket, myIndex, roomCode });
    setGameKey(prev => prev + 1);
    setScreen("game");
  };

  const handleBackToHome = () => {
    setScreen("home");
    setGameMode(null);
    setOnlineData(null);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a" }}>
      {screen === "home" && (
        <Home onStartGame={handleStartGame} onProfile={() => setScreen("profile")} />
      )}
      {screen === "profile" && (
        <Profile onBack={() => setScreen("home")} avatarId={playerAvatars[0]} />
      )}
      {screen === "onlineLobby" && (
        <OnlineLobby
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
          playerAvatars={playerAvatars}
        />
      )}
    </div>
  );
}
