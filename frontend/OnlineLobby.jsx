import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    const serverUrl = import.meta.env.VITE_SERVER_URL || window.location.origin;
    socketInstance = io(serverUrl, { autoConnect: true });
  }
  return socketInstance;
}

export default function OnlineLobby({ pseudo, onGameStart, onBack }) {
  const [screen, setScreen] = useState("menu");
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);

  const onGameStartRef = useRef(onGameStart);
  useEffect(() => { onGameStartRef.current = onGameStart; }, [onGameStart]);
  const roomCodeRef = useRef("");

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onConnectError = () => {
      setConnected(false);
      setError("Impossible de joindre le serveur.");
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    if (socket.connected) setConnected(true);

    const onRoomCreated = ({ roomCode: code }) => {
      roomCodeRef.current = code;
      setRoomCode(code);
      setScreen("waiting");
    };
    const onOpponentJoined = ({ opponentPseudo }) => {
      onGameStartRef.current(socket, 0, roomCodeRef.current, opponentPseudo ?? "Joueur 2");
    };
    const onRoomJoined = ({ roomCode: code, opponentPseudo }) => {
      roomCodeRef.current = code;
      onGameStartRef.current(socket, 1, code, opponentPseudo ?? "Joueur 1");
    };
    const onJoinError = (msg) => setError(msg);

    socket.on("roomCreated", onRoomCreated);
    socket.on("opponentJoined", onOpponentJoined);
    socket.on("roomJoined", onRoomJoined);
    socket.on("joinError", onJoinError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("roomCreated", onRoomCreated);
      socket.off("opponentJoined", onOpponentJoined);
      socket.off("roomJoined", onRoomJoined);
      socket.off("joinError", onJoinError);
    };
  }, []);

  const createRoom = () => { if (connected) { setError(""); getSocket().emit("createRoom", { pseudo }); } };
  const joinRoom  = () => {
    if (!connected) return;
    const code = inputCode.trim().toUpperCase();
    if (!code) return;
    setError("");
    getSocket().emit("joinRoom", { roomCode: code, pseudo });
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      background: "#0F172A",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      boxSizing: "border-box",
      position: "relative",
      overflowX: "hidden",
    }}>

      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          linear-gradient(rgba(167,139,250,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(167,139,250,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: "400px",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "20px",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "clamp(28px, 8vw, 42px)", fontWeight: "900",
            color: "#A78BFA", letterSpacing: "4px",
            textShadow: "0 0 30px rgba(167,139,250,0.5)",
          }}>
            EN LIGNE
          </div>
          {/* Indicateur connexion */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "6px", marginTop: "8px",
            fontSize: "11px", fontWeight: "600",
            color: connected ? "#4ade80" : "#f87171",
          }}>
            <div style={{
              width: "7px", height: "7px", borderRadius: "50%",
              background: connected ? "#4ade80" : "#f87171",
              boxShadow: connected ? "0 0 6px #4ade80" : "none",
            }} />
            {connected ? "Serveur connecté" : "Connexion en cours…"}
          </div>
        </div>

        {screen === "menu" && (
          <>
            {/* Créer une salle */}
            <button
              onClick={createRoom}
              disabled={!connected}
              style={{
                width: "100%",
                padding: "16px",
                background: connected ? "rgba(167,139,250,0.15)" : "rgba(30,41,59,0.4)",
                border: `1px solid ${connected ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "12px",
                color: connected ? "#A78BFA" : "rgba(255,255,255,0.25)",
                fontSize: "clamp(13px, 3.5vw, 15px)", fontWeight: "800",
                letterSpacing: "2px", textTransform: "uppercase",
                cursor: connected ? "pointer" : "not-allowed",
                boxShadow: connected ? "0 0 20px rgba(167,139,250,0.2)" : "none",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
                transition: "all 0.2s",
              }}
            >
              + Créer une salle
            </button>

            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", letterSpacing: "2px" }}>
              — ou —
            </div>

            {/* Rejoindre */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                value={inputCode}
                onChange={e => setInputCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && joinRoom()}
                placeholder="CODE DE SALLE"
                maxLength={6}
                autoCapitalize="characters"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  fontSize: "clamp(18px, 5vw, 24px)",
                  fontWeight: "800",
                  letterSpacing: "6px",
                  borderRadius: "10px",
                  border: "1px solid rgba(167,139,250,0.3)",
                  background: "rgba(30,41,59,0.7)",
                  color: "#A78BFA",
                  textAlign: "center",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={joinRoom}
                disabled={!connected}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: connected ? "rgba(167,139,250,0.2)" : "rgba(30,41,59,0.4)",
                  border: `1px solid ${connected ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "10px",
                  color: connected ? "#A78BFA" : "rgba(255,255,255,0.25)",
                  fontSize: "clamp(12px, 3.2vw, 14px)", fontWeight: "800",
                  letterSpacing: "2px", textTransform: "uppercase",
                  cursor: connected ? "pointer" : "not-allowed",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Rejoindre →
              </button>
            </div>

            {error && (
              <div style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
                fontSize: "12px", fontWeight: "600", textAlign: "center",
                boxSizing: "border-box",
              }}>
                {error}
              </div>
            )}

            <button
              onClick={onBack}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                color: "rgba(255,255,255,0.35)",
                fontSize: "12px", fontWeight: "700",
                padding: "10px 24px",
                cursor: "pointer",
                letterSpacing: "1px",
                touchAction: "manipulation",
              }}
            >
              ← Retour
            </button>
          </>
        )}

        {screen === "waiting" && (
          <>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
              Partage ce code avec ton adversaire
            </div>

            {/* Code affiché */}
            <div
              onClick={copyCode}
              style={{
                width: "100%",
                padding: "24px 16px",
                background: "rgba(167,139,250,0.1)",
                border: "2px solid rgba(167,139,250,0.4)",
                borderRadius: "16px",
                textAlign: "center",
                cursor: "pointer",
                boxSizing: "border-box",
                touchAction: "manipulation",
              }}
            >
              <div style={{
                fontSize: "clamp(36px, 12vw, 56px)",
                fontWeight: "900",
                letterSpacing: "clamp(6px, 3vw, 14px)",
                color: "#A78BFA",
                textShadow: "0 0 20px rgba(167,139,250,0.5)",
                lineHeight: 1,
              }}>
                {roomCode}
              </div>
              <div style={{
                fontSize: "10px", color: "rgba(167,139,250,0.5)",
                marginTop: "10px", letterSpacing: "1px",
              }}>
                {copied ? "✓ COPIÉ !" : "APPUYER POUR COPIER"}
              </div>
            </div>

            {/* Points d'attente */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: "8px", height: "8px",
                  background: "#A78BFA", borderRadius: "50%",
                  animation: `pulse 1.2s infinite ${i * 0.3}s`,
                }} />
              ))}
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginLeft: "4px" }}>
                En attente…
              </span>
            </div>

            <button
              onClick={onBack}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                color: "rgba(255,255,255,0.35)",
                fontSize: "12px", fontWeight: "700",
                padding: "10px 24px",
                cursor: "pointer",
                letterSpacing: "1px",
                touchAction: "manipulation",
              }}
            >
              ← Annuler
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
