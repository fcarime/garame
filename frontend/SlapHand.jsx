// Main cartoon coral (style « joueur qui abat ses cartes ») pour les effets KORA / 33 Export.
export default function SlapHand({ size = 86 }) {
  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 140 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.45))" }}
    >
      {/* Lignes de mouvement */}
      <g stroke="#E85D53" strokeWidth="5" strokeLinecap="round" opacity="0.85">
        <path d="M22 42 L5 37" />
        <path d="M20 58 L2 59" />
        <path d="M26 74 L8 82" />
      </g>

      {/* Doigts + paume + pouce */}
      <g stroke="#C94A42" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
        <rect x="46" y="18" width="18" height="72" rx="9" fill="#F0726B" />
        <rect x="66" y="10" width="18" height="80" rx="9" fill="#F0726B" />
        <rect x="86" y="16" width="18" height="74" rx="9" fill="#F0726B" />
        <rect x="105" y="28" width="17" height="62" rx="8.5" fill="#F0726B" />
        {/* Pouce */}
        <path d="M44 92 C24 92 17 109 26 123 C34 135 53 131 57 116 Z" fill="#F0726B" />
        {/* Paume */}
        <path d="M42 74 C40 61 53 59 65 60 L112 65 C127 67 125 92 118 109 C109 132 83 147 59 141 C39 136 44 108 42 92 Z" fill="#F0726B" />
      </g>

      {/* Reflets clairs */}
      <g fill="#F8A79F" opacity="0.9">
        <ellipse cx="80" cy="105" rx="20" ry="14" />
        <ellipse cx="40" cy="112" rx="7" ry="9" />
      </g>
    </svg>
  );
}
