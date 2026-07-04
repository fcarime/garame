import { useState, useEffect, useRef } from "react";
import { getAvatarStyle } from "./avatars";
import { randomOpponent } from "./names";
import { playStartSound } from "./audio";

export default function Matchmaking({ pseudo = "Vous", myAvatarId = 0, onMatchFound, onCancel }) {
  // Adversaire et durée de recherche tirés une seule fois au montage
  const opponentRef = useRef(randomOpponent());
  const delayRef = useRef(3000 + Math.floor(Math.random() * 2000)); // 3–5 s
  const [elapsed, setElapsed] = useState(0);
  const [found, setFound] = useState(false);
  const onFoundRef = useRef(onMatchFound);
  useEffect(() => { onFoundRef.current = onMatchFound; }, [onMatchFound]);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Date.now() - start), 80);
    const matchTimer = setTimeout(() => {
      setFound(true);
      playStartSound(); // coupe la musique, joue le jingle de début, puis la relance
      // Laisse voir « adversaire trouvé » un court instant avant de lancer la partie
      setTimeout(() => onFoundRef.current?.(opponentRef.current), 1100);
    }, delayRef.current);
    return () => { clearInterval(timer); clearTimeout(matchTimer); };
  }, []);

  const opponent = opponentRef.current;
  const progress = found ? 100 : Math.min((elapsed / delayRef.current) * 100, 96);
  const seconds = Math.floor(elapsed / 1000);
  const timeLabel = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  const badge = (icon, text, color) => (
    <div style={{
      display: "flex", alignItems: "center", gap: "5px",
      padding: "6px 12px", borderRadius: "20px",
      background: "rgba(15,23,42,0.7)",
      border: `1px solid ${color}33`,
      color, fontSize: "10px", fontWeight: "700",
      letterSpacing: "0.5px",
    }}>
      <span>{icon}</span> {text}
    </div>
  );

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: "#0F172A",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px", boxSizing: "border-box",
      position: "relative",
    }}>
      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          linear-gradient(rgba(0,217,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,217,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: "440px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "20px",
      }}>
        {/* Titre */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "10px", color: "#475569", fontWeight: "700",
            letterSpacing: "4px", textTransform: "uppercase", marginBottom: "6px",
          }}>
            La Garame
          </div>
          <div style={{
            fontSize: "clamp(20px, 5vw, 26px)", fontWeight: "800", color: "#fff",
            lineHeight: 1.2,
          }}>
            {found ? "Adversaire trouvé !" : "Recherche de partie"}
          </div>
        </div>

        {/* Carte de matching */}
        <div style={{
          width: "100%",
          background: "rgba(30,41,59,0.55)",
          border: "1px solid rgba(0,217,255,0.12)",
          borderRadius: "20px",
          padding: "28px 20px 22px",
          backdropFilter: "blur(10px)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
          boxSizing: "border-box",
        }}>
          {/* VOUS vs ADVERSAIRE */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: "10px" }}>
            {/* Joueur */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: 1 }}>
              <div style={{
                ...getAvatarStyle(myAvatarId, 74),
                border: "3px solid #00D9FF",
                boxShadow: "0 0 18px rgba(0,217,255,0.4)",
              }} />
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff", textAlign: "center", maxWidth: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {pseudo || "Vous"}
              </div>
              <div style={{
                padding: "3px 10px", borderRadius: "12px",
                background: "rgba(0,217,255,0.15)", color: "#00D9FF",
                fontSize: "9px", fontWeight: "800", letterSpacing: "1.5px",
              }}>VOUS</div>
            </div>

            {/* VS */}
            <div style={{
              width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #6366F1, #A78BFA)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: "900", color: "#fff",
              boxShadow: "0 0 16px rgba(167,139,250,0.5)",
            }}>VS</div>

            {/* Adversaire */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: 1 }}>
              {found ? (
                <div style={{
                  ...getAvatarStyle(opponent.avatarId, 74),
                  border: "3px solid #A78BFA",
                  boxShadow: "0 0 18px rgba(167,139,250,0.45)",
                }} />
              ) : (
                <div style={{
                  width: "74px", height: "74px", borderRadius: "50%",
                  background: "rgba(167,139,250,0.12)",
                  border: "3px solid rgba(167,139,250,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "5px",
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: "7px", height: "7px", borderRadius: "50%",
                      background: "#A78BFA",
                      animation: "mmPulse 1s ease-in-out infinite",
                      animationDelay: `${i * 0.18}s`,
                    }} />
                  ))}
                </div>
              )}
              <div style={{ fontSize: "13px", fontWeight: "700", color: found ? "#fff" : "rgba(255,255,255,0.5)", textAlign: "center", maxWidth: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {found ? opponent.name : "En attente…"}
              </div>
              <div style={{
                padding: "3px 10px", borderRadius: "12px",
                background: "rgba(167,139,250,0.15)", color: "#A78BFA",
                fontSize: "9px", fontWeight: "800", letterSpacing: "1.5px",
              }}>ADVERSAIRE</div>
            </div>
          </div>

          {/* Barre de progression */}
          <div style={{ marginTop: "22px" }}>
            <div style={{
              width: "100%", height: "4px", borderRadius: "4px",
              background: "rgba(255,255,255,0.08)", overflow: "hidden",
            }}>
              <div style={{
                height: "100%", width: `${progress}%`,
                background: "linear-gradient(90deg, #00D9FF, #A78BFA)",
                borderRadius: "4px",
                transition: "width 0.2s linear",
              }} />
            </div>
            <div style={{
              marginTop: "10px", textAlign: "center",
              fontSize: "11px", color: "rgba(255,255,255,0.4)",
            }}>
              🕐 {timeLabel} · {found ? "La partie commence…" : "En attente d'un adversaire"}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
          {badge("🎟️", "Sans mise", "#4ADE80")}
          {badge("⚔️", "1 VS 1", "#00D9FF")}
          {badge("🎴", "Partie rapide", "#A78BFA")}
        </div>

        {/* Annuler */}
        {!found && (
          <button onClick={onCancel} style={{
            padding: "11px 26px", borderRadius: "10px",
            border: "1px solid rgba(239,68,68,0.4)",
            background: "rgba(239,68,68,0.08)",
            color: "#F87171", fontSize: "12px", fontWeight: "700",
            letterSpacing: "0.5px", cursor: "pointer",
            touchAction: "manipulation",
          }}>
            ✕ Annuler la recherche
          </button>
        )}
      </div>

      <style>{`
        @keyframes mmPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%      { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
