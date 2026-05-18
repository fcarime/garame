export default function GameInfo({ pot, scores, round, players }) {
  const avatars = {
    0: "👤",
    1: "🤖"
  };

  const getPlayerColor = (idx) => {
    return idx === 0 ? "#52b788" : "#f77f00";
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "12px",
      paddingBottom: "10px"
    }}>
      {/* Joueurs avec mises */}
      <div style={{
        display: "flex",
        gap: "20px",
        flex: 1
      }}>
        {players.map((player, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              padding: "10px 12px",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "10px",
              border: `2px solid ${getPlayerColor(idx)}`,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              minWidth: "110px"
            }}
          >
            {/* Avatar */}
            <div style={{
              fontSize: "28px",
              lineHeight: "1"
            }}>
              {avatars[idx]}
            </div>

            {/* Nom du joueur */}
            <div style={{
              fontSize: "11px",
              fontWeight: "bold",
              color: "#1a1a1a",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              {idx === 0 ? "Vous" : "IA"}
            </div>

            {/* Score */}
            <div style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: getPlayerColor(idx),
              backgroundColor: `rgba(${getPlayerColor(idx) === "#52b788" ? "82, 183, 136" : "247, 127, 0"}, 0.1)`,
              padding: "6px 12px",
              borderRadius: "6px",
              minWidth: "90px",
              textAlign: "center"
            }}>
              {scores[idx].toLocaleString()}
            </div>

            <div style={{
              fontSize: "9px",
              color: "#666",
              fontWeight: "600"
            }}>
              FCFA
            </div>
          </div>
        ))}
      </div>

      {/* Pot et Manche */}
      <div style={{
        display: "flex",
        gap: "10px",
        alignItems: "stretch"
      }}>
        {/* Pot */}
        <div style={{
          background: "linear-gradient(135deg, #ffd60a 0%, #ffb700 100%)",
          padding: "10px 14px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(255, 214, 10, 0.3)",
          border: "2px solid #ffb700",
          position: "relative",
          overflow: "hidden",
          minWidth: "90px"
        }}>
          <div style={{
            fontSize: "9px",
            color: "#664d00",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "4px"
          }}>
            💰 Pot
          </div>
          <p style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#330000",
            margin: "0"
          }}>
            {pot.toLocaleString()}
          </p>
        </div>

        {/* Manche */}
        <div style={{
          background: "linear-gradient(135deg, #d62828 0%, #f77f00 100%)",
          padding: "10px 14px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(214, 40, 40, 0.3)",
          border: "2px solid #f77f00",
          position: "relative",
          overflow: "hidden",
          minWidth: "80px"
        }}>
          <div style={{
            fontSize: "9px",
            color: "#fff",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "4px"
          }}>
            📊 Manche
          </div>
          <p style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#fff",
            margin: "0"
          }}>
            {round}
          </p>
        </div>
      </div>
    </div>
  );
}
