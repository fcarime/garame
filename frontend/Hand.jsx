import Card from "./Card";

export default function Hand({ cards, onPlay, validCards, playerName = "Vous" }) {
  const isValidSet = validCards && validCards.length > 0;
  const total = cards.length;
  const mid = (total - 1) / 2;

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "6px",
        padding: "0 2px",
      }}>
        <span style={{
          fontSize: "clamp(9px, 2.5vw, 11px)",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "2px",
          color: "#00D9FF",
        }}>
          {playerName}
        </span>
        <span style={{
          fontSize: "clamp(9px, 2.2vw, 10px)",
          fontWeight: "700",
          color: "#0F172A",
          background: "#00D9FF",
          padding: "2px 7px",
          borderRadius: "10px",
          letterSpacing: "0.5px",
        }}>
          {cards.length}
        </span>
      </div>

      {/* Cards fan */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: "clamp(2px, 1vw, 6px)",
        padding: "6px 0 2px",
        minHeight: "clamp(72px, 18vw, 100px)",
      }}>
        {cards.length === 0 ? (
          <div style={{ color: "#334155", fontSize: "13px", fontStyle: "italic" }}>
            Main vide
          </div>
        ) : (
          cards.map((card, index) => {
            const isValid = !isValidSet || validCards.some(vc => vc.suit === card.suit && vc.value === card.value);
            const rotation = (index - mid) * 2.5;
            const lift = Math.pow(index - mid, 2) * 1.5;
            return (
              <div
                key={`${card.value}${card.suit}${index}`}
                style={{
                  transform: `rotate(${rotation}deg) translateY(${lift}px)`,
                  transformOrigin: "50% 120%",
                  zIndex: index + 1,
                }}
              >
                <Card
                  value={card.value}
                  suit={card.suit}
                  onClick={() => onPlay(index)}
                  disabled={!isValid}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Hint */}
      {isValidSet && (
        <div style={{
          marginTop: "6px",
          padding: "4px 10px",
          background: "rgba(0, 217, 255, 0.08)",
          border: "1px solid rgba(0, 217, 255, 0.3)",
          borderRadius: "6px",
          fontSize: "clamp(8px, 2.2vw, 10px)",
          color: "#00D9FF",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "1px",
          textAlign: "center",
        }}>
          Jouez la couleur {validCards[0]?.suit}
        </div>
      )}
    </div>
  );
}
