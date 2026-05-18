export default function Card({ value, suit, onClick, disabled = false }) {
  const isRed = suit === "♥" || suit === "♦";
  const suitColor = isRed ? "#DC2626" : "#1E293B";

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={{
        width: "clamp(44px, 11vw, 62px)",
        height: "clamp(62px, 15.5vw, 90px)",
        background: disabled ? "#1a2436" : "#FFFEF7",
        border: disabled
          ? "1px solid rgba(100,116,139,0.3)"
          : `1px solid ${isRed ? "rgba(220,38,38,0.3)" : "rgba(30,41,59,0.3)"}`,
        borderRadius: "clamp(5px, 1.5vw, 8px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "clamp(2px, 0.6vw, 4px)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        boxShadow: disabled ? "none" : "0 4px 12px rgba(0,0,0,0.4)",
        userSelect: "none",
        position: "relative",
        flexShrink: 0,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        willChange: "transform",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-14px) scale(1.08)";
        e.currentTarget.style.boxShadow = "0 0 0 2px #00D9FF, 0 0 18px rgba(0,217,255,0.6), 0 12px 24px rgba(0,0,0,0.5)";
        e.currentTarget.style.zIndex = "20";
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
        e.currentTarget.style.zIndex = "1";
      }}
      onTouchStart={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-10px) scale(1.06)";
        e.currentTarget.style.boxShadow = "0 0 0 2px #00D9FF, 0 0 14px rgba(0,217,255,0.5)";
        e.currentTarget.style.zIndex = "20";
      }}
      onTouchEnd={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
        e.currentTarget.style.zIndex = "1";
      }}
    >
      {/* Top-left corner */}
      <div style={{ lineHeight: 1, textAlign: "left" }}>
        <div style={{ fontSize: "clamp(10px, 2.8vw, 14px)", fontWeight: "900", color: disabled ? "#334155" : suitColor, lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: "clamp(8px, 2.2vw, 11px)", color: disabled ? "#334155" : suitColor, lineHeight: 1, marginTop: "1px" }}>
          {suit}
        </div>
      </div>

      {/* Center suit */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "clamp(22px, 5.5vw, 34px)",
        color: disabled ? "#334155" : suitColor,
        lineHeight: 1,
      }}>
        {suit}
      </div>

      {/* Bottom-right corner (rotated) */}
      <div style={{ lineHeight: 1, textAlign: "right", transform: "rotate(180deg)" }}>
        <div style={{ fontSize: "clamp(10px, 2.8vw, 14px)", fontWeight: "900", color: disabled ? "#334155" : suitColor, lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: "clamp(8px, 2.2vw, 11px)", color: disabled ? "#334155" : suitColor, lineHeight: 1, marginTop: "1px" }}>
          {suit}
        </div>
      </div>
    </div>
  );
}
