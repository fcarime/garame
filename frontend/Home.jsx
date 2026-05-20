import { useState } from "react";
import { AVATARS, getAvatarStyle, DEFAULT_AVATARS } from "./avatars";

export default function Home({ onStartGame, onProfile, bankroll = 100000, pseudo = "" }) {
  const [selectedAvatars, setSelectedAvatars] = useState([DEFAULT_AVATARS.player1, DEFAULT_AVATARS.player2]);
  const modes = [
    { key: "ia",     icon: "🤖", label: "CONTRE L'IA", sub: "Solo",       color: "#00D9FF", glow: "rgba(0,217,255,0.35)",   border: "rgba(0,217,255,0.5)"   },
    { key: "online", icon: "🌐", label: "EN LIGNE",    sub: "À distance", color: "#A78BFA", glow: "rgba(167,139,250,0.35)", border: "rgba(167,139,250,0.5)" },
  ];

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      background: "#0F172A",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "24px",
      overflowX: "hidden",
      position: "relative",
      padding: "70px 16px 60px",
      boxSizing: "border-box",
    }}>

      {/* Bouton Mon Compte + bankroll — dans le flux de la page */}
      {onProfile && (
        <div style={{
          position: "relative", zIndex: 1,
          width: "100%", maxWidth: "720px",
          display: "flex", justifyContent: "flex-end",
          alignItems: "center", gap: "8px",
        }}>
          <div style={{
            fontSize: "9px", fontWeight: "700", color: "#F59E0B",
            background: "rgba(15,23,42,0.85)",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: "12px",
            padding: "3px 10px",
            backdropFilter: "blur(12px)",
            letterSpacing: "0.5px",
          }}>
            {bankroll.toLocaleString("fr-FR")} FCFA
          </div>
          <button onClick={onProfile} style={{
            padding: "7px 14px",
            borderRadius: "20px",
            border: "1px solid rgba(0,217,255,0.3)",
            background: "rgba(15,23,42,0.85)",
            color: "rgba(0,217,255,0.8)",
            fontSize: "10px", fontWeight: "700",
            letterSpacing: "1.5px", textTransform: "uppercase",
            cursor: "pointer",
            backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", gap: "5px",
            touchAction: "manipulation",
          }}>
            <span>👤</span> {pseudo || "MON COMPTE"}
          </button>
        </div>
      )}

      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          linear-gradient(rgba(0,217,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,217,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }} />

      {/* Titre */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div style={{
          fontSize: "clamp(52px, 16vw, 88px)",
          fontWeight: "900",
          letterSpacing: "clamp(4px, 2vw, 10px)",
          color: "#00D9FF",
          textShadow: "0 0 40px rgba(0,217,255,0.5), 0 0 80px rgba(0,217,255,0.2)",
          lineHeight: 1,
        }}>
          GARAME
        </div>
        <div style={{
          fontSize: "clamp(9px, 2.5vw, 12px)",
          color: "#334155",
          fontWeight: "700",
          letterSpacing: "clamp(2px, 1vw, 4px)",
          textTransform: "uppercase",
          marginTop: "8px",
        }}>
          Jeu de Cartes Traditionnel Africain
        </div>
      </div>

      {/* Boutons de mode */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        justifyContent: "center",
        width: "100%",
        maxWidth: "720px",
      }}>
        {modes.map(mode => (
          <button
            key={mode.key}
            onClick={() => onStartGame(mode.key, selectedAvatars)}
            style={{
              flex: "1 1 clamp(120px, 26vw, 200px)",
              minWidth: "120px",
              maxWidth: "220px",
              padding: "18px 12px",
              background: "rgba(30,41,59,0.8)",
              border: `1px solid ${mode.border}`,
              borderRadius: "14px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              boxShadow: `0 0 20px ${mode.glow}, 0 6px 24px rgba(0,0,0,0.4)`,
              backdropFilter: "blur(8px)",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <div style={{ fontSize: "clamp(26px, 7vw, 36px)", lineHeight: 1 }}>{mode.icon}</div>
            <div>
              <div style={{
                fontSize: "clamp(10px, 2.8vw, 13px)",
                fontWeight: "800",
                color: mode.color,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                textShadow: `0 0 12px ${mode.glow}`,
              }}>
                {mode.label}
              </div>
              <div style={{
                fontSize: "clamp(9px, 2.2vw, 10px)",
                color: "#64748B",
                fontWeight: "600",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginTop: "3px",
              }}>
                {mode.sub}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Avatar picker */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: "480px",
        background: "rgba(30,41,59,0.5)",
        border: "1px solid rgba(0,217,255,0.1)",
        borderRadius: "12px",
        padding: "14px 16px",
        backdropFilter: "blur(8px)",
        boxSizing: "border-box",
      }}>
        <div style={{
          fontSize: "10px", fontWeight: "700", color: "#00D9FF",
          letterSpacing: "2px", textTransform: "uppercase",
          marginBottom: "12px", textAlign: "center",
        }}>
          CHOISIR VOS AVATARS
        </div>

        {[{ label: "JOUEUR 1", playerIdx: 0 }, { label: "JOUEUR 2", playerIdx: 1 }].map(({ label, playerIdx }) => (
          <div key={playerIdx} style={{ marginBottom: playerIdx === 0 ? "12px" : 0 }}>
            <div style={{
              fontSize: "9px", fontWeight: "700", color: "rgba(255,255,255,0.3)",
              letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px",
            }}>
              {label}
            </div>
            <div style={{ display: "flex", gap: "clamp(4px, 1.2vw, 8px)", flexWrap: "wrap" }}>
              {AVATARS.map(avatar => {
                const isSelected = selectedAvatars[playerIdx] === avatar.id;
                const isUsed = selectedAvatars[1 - playerIdx] === avatar.id;
                const size = Math.min(Math.max(Math.floor(window.innerWidth * 0.07), 28), 38);
                return (
                  <div
                    key={avatar.id}
                    title={avatar.name}
                    onClick={() => {
                      if (isUsed) return;
                      setSelectedAvatars(prev => { const n=[...prev]; n[playerIdx]=avatar.id; return n; });
                    }}
                    style={{
                      ...getAvatarStyle(avatar.id, size),
                      cursor: isUsed ? "not-allowed" : "pointer",
                      outline: isSelected ? "2px solid #00D9FF" : "2px solid transparent",
                      outlineOffset: "2px",
                      opacity: isUsed ? 0.25 : 1,
                      boxShadow: isSelected ? "0 0 10px rgba(0,217,255,0.5)" : "none",
                      touchAction: "manipulation",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Règles */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: "480px",
        background: "rgba(30,41,59,0.5)",
        border: "1px solid rgba(0,217,255,0.1)",
        borderRadius: "12px",
        padding: "14px 16px",
        backdropFilter: "blur(8px)",
        boxSizing: "border-box",
      }}>
        <div style={{
          fontSize: "10px", fontWeight: "700", color: "#00D9FF",
          letterSpacing: "2px", textTransform: "uppercase",
          marginBottom: "10px", textAlign: "center",
        }}>
          RÈGLES
        </div>

        {[
          ["📈", "Valeurs : 3 < 4 < 5 < 6 < 7 < 8 < 9"],
          ["🃏", "Suivez la couleur demandée ou jouez librement"],
          ["🎯", "Gagnez le dernier pli pour remporter la manche"],
          ["💰", "3 manches gagnées = 2 000 FCFA remportés"],
        ].map(([icon, text]) => (
          <div key={text} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: "clamp(10px, 2.8vw, 11px)", color: "#64748B", lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}

        <div style={{ margin: "10px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }} />

        <div style={{
          fontSize: "9px", fontWeight: "700", color: "#F59E0B",
          letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px",
        }}>
          VICTOIRES SPÉCIALES
        </div>

        {[
          ["⚡", "#FCD34D", "Triple Sept",    "≥ 3 cartes 7 en main → victoire immédiate"],
          ["🃏", "#00D9FF", "Main Basse",      "Somme des cartes < 21 → victoire immédiate"],
          ["🎯", "#4ade80", "Bonus Dernier 3", "Gagner avec un 3 → manche suivante offerte"],
        ].map(([icon, color, title, text]) => (
          <div key={title} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", flexShrink: 0 }}>{icon}</span>
            <div>
              <span style={{ fontSize: "clamp(9px, 2.5vw, 10px)", fontWeight: "700", color, marginRight: "4px" }}>{title} —</span>
              <span style={{ fontSize: "clamp(9px, 2.5vw, 10px)", color: "#64748B", lineHeight: 1.5 }}>{text}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
