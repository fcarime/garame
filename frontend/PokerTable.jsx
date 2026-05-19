import Card from "./Card";


export default function PokerTable({ trick, playedCards = [], leadSuit, pot, message, myTurn, gameOver }) {
  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      perspective: "900px",
      perspectiveOrigin: "50% 30%",
    }}>

      {/* ══ TABLE OVALE BLEUE ══ */}
      <div style={{
        position: "relative",
        width: "min(300px, 82vw)",
        height: "min(60vh, 420px)",

        background: `
          radial-gradient(ellipse at 50% 42%,
            #1a5fc4 0%,
            #0d3e8a 35%,
            #071f50 70%,
            #04122e 100%
          )
        `,

        borderRadius: "50%",
        border: "3px solid #0a2464",
        outline: "1px solid #2060b8",
        outlineOffset: "2px",

        boxShadow: `
          0 0 0 6px #04122e,
          0 0 40px rgba(16,80,200,0.5),
          0 0 80px rgba(16,80,200,0.2),
          inset 0 0 70px rgba(0,0,40,0.6),
          inset 0 2px 12px rgba(80,140,255,0.15)
        `,

        transform: "rotateX(12deg)",
        transformOrigin: "50% 100%",

        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>

        {/* Texture feltée */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%", pointerEvents: "none",
          background: `repeating-linear-gradient(
            45deg,
            transparent, transparent 18px,
            rgba(255,255,255,0.012) 18px, rgba(255,255,255,0.012) 19px
          )`,
        }} />

        {/* Anneau intérieur décoratif */}
        <div style={{
          position: "absolute", inset: "8%", borderRadius: "50%",
          border: "1px solid rgba(80,140,255,0.15)", pointerEvents: "none",
        }} />

        {/* ── CENTRE : POT + CARTES JOUÉES ── */}
        <div style={{
          position: "relative", zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}>
          {/* MESSAGE */}
          {message && (
            <div style={{
              padding: "5px 16px",
              borderRadius: "20px",
              fontSize: "10px", fontWeight: "800",
              textAlign: "center", textTransform: "uppercase", letterSpacing: "1.5px",
              color: gameOver ? "#FCD34D" : myTurn ? "#00D9FF" : "rgba(255,255,255,0.55)",
              background: "rgba(4,18,46,0.85)",
              border: `1px solid ${gameOver ? "rgba(245,158,11,0.5)" : myTurn ? "rgba(0,217,255,0.4)" : "rgba(255,255,255,0.1)"}`,
              boxShadow: myTurn && !gameOver ? "0 0 10px rgba(0,217,255,0.25)" : "none",
              backdropFilter: "blur(8px)",
              maxWidth: "220px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {message}
            </div>
          )}

          {/* POT */}
          <div style={{
            background: "rgba(4,18,46,0.7)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            padding: "3px 14px",
            backdropFilter: "blur(8px)",
          }}>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginRight: "5px" }}>
              Pot:
            </span>
            <span style={{ fontSize: "12px", fontWeight: "900", color: "#F59E0B" }}>
              {pot.toLocaleString()}
            </span>
          </div>

          {/* Cartes : pile des plis passés (gauche) + pli en cours côte à côte (droite) */}
          {playedCards.length === 0 && trick.length === 0 ? (
            <div style={{
              fontSize: "10px", color: "rgba(255,255,255,0.18)",
              fontStyle: "italic", letterSpacing: "1px",
            }}>
              En attente…
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Pile des plis précédents — décalée vers la gauche */}
              {(() => {
                const old = playedCards.slice(0, playedCards.length - trick.length);
                if (old.length === 0) return null;
                return (
                  <div style={{
                    position: "relative",
                    width: "clamp(52px, 13vw, 72px)",
                    height: "clamp(74px, 18.5vw, 104px)",
                    flexShrink: 0,
                  }}>
                    {old.map((p, i) => {
                      const shift = (old.length - 1 - i) * 20;
                      return (
                        <div key={i} style={{
                          position: "absolute",
                          top: "50%", left: "50%",
                          transform: `translate(calc(-50% - ${shift}px), -50%)`,
                          zIndex: i + 1,
                          boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                        }}>
                          <Card value={p.card.value} suit={p.card.suit} />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Pli en cours — 1 ou 2 cartes clairement visibles */}
              {trick.map((p, i) => (
                <div key={i} style={{
                  flexShrink: 0,
                  boxShadow: "0 0 10px rgba(0,217,255,0.55), 0 3px 10px rgba(0,0,0,0.6)",
                  animation: `drop .3s ease ${i * .12}s both`,
                }}>
                  <Card value={p.card.value} suit={p.card.suit} />
                </div>
              ))}
            </div>
          )}

          {/* Couleur demandée — visible dès qu'un pli est en cours */}
          {leadSuit && trick.length > 0 && (
            <div style={{
              fontSize: "9px", fontWeight: "700", color: "rgba(0,217,255,0.8)",
              letterSpacing: "1.5px", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: "5px",
            }}>
              Couleur <span style={{ fontSize: "16px" }}>{leadSuit}</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes drop {
          from { opacity:0; transform:translateY(-12px) scale(.85); }
          to   { opacity:1; transform:translateY(0)     scale(1);   }
        }
      `}</style>
    </div>
  );
}
