import { useAudio, setAudio } from "./audio";

// Deux boutons : couper/activer la musique et les effets (sons + voix).
// compact = version icône seule (pour l'écran de jeu).
export default function SoundControls({ compact = false }) {
  const audio = useAudio();

  const btn = (on, icon, label, toggle, accent) => (
    <button
      onClick={toggle}
      title={`${label} : ${on ? "activé" : "coupé"}`}
      style={{
        display: "flex", alignItems: "center", gap: compact ? 0 : "6px",
        padding: compact ? "6px" : "6px 12px",
        borderRadius: "20px",
        border: `1px solid ${on ? accent : "rgba(255,255,255,0.15)"}`,
        background: on ? `${accent}22` : "rgba(15,23,42,0.7)",
        color: on ? accent : "rgba(255,255,255,0.4)",
        fontSize: "10px", fontWeight: "700", letterSpacing: "1px",
        textTransform: "uppercase", cursor: "pointer",
        backdropFilter: "blur(8px)",
        touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
        lineHeight: 1,
      }}
    >
      <span style={{ fontSize: compact ? "16px" : "14px", textDecoration: on ? "none" : "line-through" }}>{icon}</span>
      {!compact && <span>{label}</span>}
    </button>
  );

  return (
    <div style={{ display: "flex", gap: compact ? "6px" : "8px", alignItems: "center" }}>
      {btn(audio.music, "🎵", "Musique", () => setAudio({ music: !audio.music }), "#A78BFA")}
      {btn(audio.effects, "🔊", "Effets", () => setAudio({ effects: !audio.effects }), "#00D9FF")}
    </div>
  );
}
