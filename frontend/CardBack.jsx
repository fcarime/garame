export default function CardBack({ small = false }) {
  return (
    <div style={{
      width: small ? "clamp(28px, 7.5vw, 42px)" : "clamp(36px, 9.5vw, 52px)",
      height: small ? "clamp(40px, 10.5vw, 60px)" : "clamp(52px, 13.5vw, 74px)",
      background: "linear-gradient(145deg, #1E3A5F 0%, #0F2744 50%, #162032 100%)",
      border: "1px solid rgba(0, 217, 255, 0.4)",
      borderRadius: "clamp(4px, 1.2vw, 6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 0 8px rgba(0, 217, 255, 0.2), 0 4px 10px rgba(0,0,0,0.5)",
      userSelect: "none",
      position: "relative",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      {/* Diagonal neon pattern */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 6px,
          rgba(0, 217, 255, 0.06) 6px,
          rgba(0, 217, 255, 0.06) 7px
        )`,
        pointerEvents: "none",
      }} />

      {/* Inner border */}
      <div style={{
        position: "absolute",
        inset: "4px",
        border: "1px solid rgba(0, 217, 255, 0.25)",
        borderRadius: "3px",
        pointerEvents: "none",
      }} />

      {/* Center symbol */}
      <div style={{
        fontSize: small ? "clamp(12px, 3.5vw, 18px)" : "clamp(16px, 4.5vw, 24px)",
        color: "rgba(0, 217, 255, 0.5)",
        zIndex: 1,
        textShadow: "0 0 8px rgba(0, 217, 255, 0.8)",
        lineHeight: 1,
      }}>
        🎴
      </div>
    </div>
  );
}
