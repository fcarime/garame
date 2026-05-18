import Card from "./Card";

export default function Table({ trick, leadSuit, currentPlayer, players }) {
  const suitSymbol = {
    "♠": "♠",
    "♥": "♥",
    "♦": "♦",
    "♣": "♣"
  };

  return (
    <div style={{
      padding: "12px",
      background: "radial-gradient(ellipse 150% 100% at 50% 0%, #1a5c3a 0%, #0d3d1f 40%, #051a0d 100%)",
      borderRadius: "20px",
      minHeight: "170px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      boxShadow: "inset 0 2px 10px rgba(255, 255, 255, 0.1), 0 8px 20px rgba(0, 0, 0, 0.4)",
      flex: 1,
      border: "3px solid #0d3d1f",
      position: "relative"
    }}>
      {/* Décoration tapis */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: "17px",
        pointerEvents: "none",
        background: `
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 10px,
            rgba(255, 255, 255, 0.02) 10px,
            rgba(255, 255, 255, 0.02) 20px
          )
        `
      }} />

      {/* Titre et couleur demandée */}
      <div style={{
        marginBottom: "10px",
        textAlign: "center",
        position: "relative",
        zIndex: 2
      }}>
        <h3 style={{
          color: "#ffd60a",
          marginBottom: "4px",
          fontSize: "14px",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
          fontWeight: "bold",
          letterSpacing: "1px"
        }}>
          {trick.length === 0 ? "🎴 PLIE EN COURS" : "🎯 CARTES JOUEES"}
        </h3>

        {leadSuit && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            color: "#fff",
            fontSize: "13px",
            fontWeight: "bold",
            backgroundColor: "rgba(255, 214, 10, 0.2)",
            padding: "6px 14px",
            borderRadius: "8px",
            border: "1px solid #ffd60a"
          }}>
            <span>COULEUR DEMANDÉE:</span>
            <span style={{
              fontSize: "18px",
              color: leadSuit === "♥" || leadSuit === "♦" ? "#d62828" : "#fff"
            }}>
              {suitSymbol[leadSuit]}
            </span>
          </div>
        )}
      </div>

      {/* Cartes jouées */}
      <div style={{
        display: "flex",
        gap: "40px",
        justifyContent: "center",
        flexWrap: "wrap",
        minHeight: "110px",
        alignItems: "center",
        position: "relative",
        width: "100%",
        zIndex: 2
      }}>
        {trick.length === 0 ? (
          <div style={{
            color: "#a0a0a0",
            fontSize: "13px",
            fontStyle: "italic",
            opacity: 0.6
          }}>
            En attente des cartes...
          </div>
        ) : (
          trick.map((playedCard, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                animation: `slideIn 0.4s ease-out ${index * 0.2}s both`
              }}
            >
              <div style={{
                padding: "5px 12px",
                backgroundColor: currentPlayer === playedCard.player
                  ? "rgba(82, 183, 136, 0.4)"
                  : "rgba(0, 0, 0, 0.3)",
                border: currentPlayer === playedCard.player
                  ? "2px solid #52b788"
                  : "2px solid rgba(160, 160, 160, 0.5)",
                borderRadius: "6px",
                color: currentPlayer === playedCard.player ? "#52b788" : "#ccc",
                fontWeight: "600",
                fontSize: "10px",
                minWidth: "70px",
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                {playedCard.player === 0 ? "👤 Vous" : "🤖 IA"}
              </div>
              <Card
                value={playedCard.card.value}
                suit={playedCard.card.suit}
              />
            </div>
          ))
        )}
      </div>

      {trick.length > 0 && trick.length < 2 && (
        <div style={{
          marginTop: "10px",
          padding: "8px 14px",
          backgroundColor: "rgba(82, 183, 136, 0.25)",
          border: "1px solid #52b788",
          borderRadius: "6px",
          color: "#52b788",
          fontSize: "11px",
          fontWeight: "600",
          animation: "pulse 2s infinite",
          position: "relative",
          zIndex: 2
        }}>
          ⏳ EN ATTENTE DU JOUEUR...
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
