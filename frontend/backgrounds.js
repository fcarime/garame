// Fichier à placer dans : garame/public/backgrounds.png
const bgUrl = '/backgrounds.png';

export const BACKGROUNDS = [
  { id: 0,  name: "Savane Dorée",    col: 0, row: 0 },
  { id: 1,  name: "Cascade Bleue",   col: 1, row: 0 },
  { id: 2,  name: "Forêt Émeraude",  col: 2, row: 0 },
  { id: 3,  name: "Volcan Rouge",    col: 3, row: 0 },
  { id: 4,  name: "Nuit Violette",   col: 0, row: 1 },
  { id: 5,  name: "Lac Cristal",     col: 1, row: 1 },
  { id: 6,  name: "Désert Ardent",   col: 2, row: 1 },
  { id: 7,  name: "Prairie Verte",   col: 3, row: 1 },
  { id: 8,  name: "Jungle Jaune",    col: 0, row: 2 },
  { id: 9,  name: "Coucher Ocre",    col: 1, row: 2 },
  { id: 10, name: "Rivière Turquoise", col: 2, row: 2 },
  { id: 11, name: "Crépuscule Mauve", col: 3, row: 2 },
];

// Retourne les propriétés CSS background pour afficher le bon paysage
export function getBackgroundCss(id) {
  const b = BACKGROUNDS[id] ?? BACKGROUNDS[0];
  const xPct = (b.col / 3) * 100;
  const yPct = (b.row / 2) * 100;
  return {
    backgroundImage:    `url('${bgUrl}')`,
    backgroundSize:     "400% 300%",
    backgroundPosition: `${xPct}% ${yPct}%`,
    backgroundRepeat:   "no-repeat",
  };
}

// Couleur d'accentuation associée à chaque background (pour teinter l'UI)
export const BG_ACCENT = [
  "#F59E0B",  // 0 Savane Dorée     → orange chaud
  "#38BDF8",  // 1 Cascade Bleue    → bleu ciel
  "#4ADE80",  // 2 Forêt Émeraude   → vert
  "#F87171",  // 3 Volcan Rouge      → rouge
  "#A78BFA",  // 4 Nuit Violette     → violet
  "#22D3EE",  // 5 Lac Cristal       → cyan
  "#FB923C",  // 6 Désert Ardent     → orange brûlé
  "#86EFAC",  // 7 Prairie Verte     → vert clair
  "#FDE047",  // 8 Jungle Jaune      → jaune
  "#FDBA74",  // 9 Coucher Ocre      → pêche
  "#2DD4BF",  // 10 Rivière Turquoise → turquoise
  "#C084FC",  // 11 Crépuscule Mauve  → mauve
];
