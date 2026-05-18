export default function PlayerWaitScreen({ playerNumber, message, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(9,14,27,0.96)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        cursor: "pointer",
      }}
    >
      {/* Neon ring */}
      <div style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        padding: "48px 60px",
        background: "rgba(15,23,42,0.9)",
        border: "1px solid rgba(0,217,255,0.4)",
        borderRadius: "24px",
        boxShadow: "0 0 0 1px rgba(0,217,255,0.1), 0 0 40px rgba(0,217,255,0.2), 0 0 80px rgba(0,217,255,0.05)",
        textAlign: "center",
        maxWidth: "90vw",
      }}>
        {/* Corner accents */}
        {[
          { top: 0, left: 0, borderRadius: "16px 0 0 0" },
          { top: 0, right: 0, borderRadius: "0 16px 0 0" },
          { bottom: 0, left: 0, borderRadius: "0 0 0 16px" },
          { bottom: 0, right: 0, borderRadius: "0 0 16px 0" },
        ].map((pos, i) => (
          <div key={i} style={{
            position: "absolute",
            ...pos,
            width: "20px", height: "20px",
            border: `2px solid #00D9FF`,
            borderRight: pos.right !== undefined ? `2px solid #00D9FF` : "none",
            borderLeft: pos.left !== undefined ? `2px solid #00D9FF` : "none",
            borderTop: pos.top !== undefined ? `2px solid #00D9FF` : "none",
            borderBottom: pos.bottom !== undefined ? `2px solid #00D9FF` : "none",
            ...pos,
          }} />
        ))}

        {/* Avatar */}
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "rgba(0,217,255,0.1)",
          border: "2px solid rgba(0,217,255,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          boxShadow: "0 0 20px rgba(0,217,255,0.3)",
        }}>
          {playerNumber === 0 ? "👤" : "👥"}
        </div>

        {/* Player name */}
        <div>
          <div style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "#64748B",
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}>
            JOUEUR
          </div>
          <div style={{
            fontSize: "52px",
            fontWeight: "900",
            color: "#00D9FF",
            letterSpacing: "-1px",
            lineHeight: 1,
            textShadow: "0 0 30px rgba(0,217,255,0.6)",
          }}>
            {playerNumber + 1}
          </div>
        </div>

        {/* Message */}
        <div style={{
          fontSize: "15px",
          color: "#94A3B8",
          fontStyle: "italic",
          letterSpacing: "0.5px",
        }}>
          {message}
        </div>

        {/* Pulsing dots */}
        <div style={{ display: "flex", gap: "10px" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: "8px", height: "8px",
              borderRadius: "50%",
              background: "#00D9FF",
              boxShadow: "0 0 6px #00D9FF",
              animation: `dot 1.2s infinite ${i * 0.25}s`,
            }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes dot {
          0%, 100% { opacity: 0.2; transform: scale(0.7); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
