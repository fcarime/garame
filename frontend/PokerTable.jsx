import Card from "./Card";
import tableUrl from "./public/table.png";


export default function PokerTable({ trick, playedCards = [], leadSuit, pot, message, myTurn, gameOver }) {
  return (
    <div className="poker-table-outer" style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: "60px",
    }}>
      <style>{`
        .poker-table-wrapper { width: min(1100px, 95vw); }
        @media (max-width: 600px) {
          .poker-table-wrapper { width: 530vw; }
          .poker-table-outer { padding-top: 10px !important; }
        }
      `}</style>

      {/* ══ TABLE wrapper ══ */}
      <div className="poker-table-wrapper" style={{
        position: "relative",
        width: "min(1100px, 95vw)",
        aspectRatio: "1.6 / 1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>

        {/* Image de la table — seule elle pivote sur mobile */}
        <div className="poker-table-bg" style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${tableUrl})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
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
                      // Décalage assez large pour laisser voir le coin (valeur + fleur agrandis)
                      const step = Math.min(Math.max(window.innerWidth * 0.055, 19), 24);
                      const shift = (old.length - 1 - i) * step;
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
