// 12 avatars africains — spritesheet 4 colonnes × 3 lignes
import avatarsUrl from './public/avatars.png';

export const AVATARS = [
  { id: 0,  name: "Lion",      col: 0, row: 0 },
  { id: 1,  name: "Éléphant",  col: 1, row: 0 },
  { id: 2,  name: "Guépard",   col: 2, row: 0 },
  { id: 3,  name: "Rhino",     col: 3, row: 0 },
  { id: 4,  name: "Girafe",    col: 0, row: 1 },
  { id: 5,  name: "Hippo",     col: 1, row: 1 },
  { id: 6,  name: "Zèbre",     col: 2, row: 1 },
  { id: 7,  name: "Gazelle",   col: 3, row: 1 },
  { id: 8,  name: "Babouin",   col: 0, row: 2 },
  { id: 9,  name: "Fennec",    col: 1, row: 2 },
  { id: 10, name: "Croco",     col: 2, row: 2 },
  { id: 11, name: "Hérisson",  col: 3, row: 2 },
];

// Couleur d'accentuation associée à chaque avatar (pour teinter un nom, etc.)
export const AVATAR_COLORS = [
  "#F59E0B", "#94A3B8", "#FBBF24", "#A78BFA",
  "#F97316", "#60A5FA", "#CBD5E1", "#FCD34D",
  "#F87171", "#FDBA74", "#4ADE80", "#C084FC",
];
export function getAvatarColor(id) {
  return AVATAR_COLORS[id] ?? AVATAR_COLORS[0];
}

// Avatars par défaut selon le rôle
export const DEFAULT_AVATARS = {
  player1: 0,   // Lion
  player2: 6,   // Zèbre
  ai: 10,       // Croco
};

/**
 * Retourne le style CSS pour afficher un avatar depuis la spritesheet.
 * @param {number} id  — identifiant de l'avatar (0–11)
 * @param {number} size — taille en px (largeur = hauteur)
 */
export function getAvatarStyle(id, size = 40) {
  const a = AVATARS[id] ?? AVATARS[0];
  const xPct = (a.col / 3) * 100;
  const yPct = (a.row / 2) * 100;
  return {
    width:  `${size}px`,
    height: `${size}px`,
    backgroundImage:    `url('${avatarsUrl}')`,
    backgroundSize:     "400% 300%",
    backgroundPosition: `${xPct}% ${yPct}%`,
    backgroundRepeat:   "no-repeat",
    borderRadius:       "50%",
    flexShrink: 0,
    imageRendering: "crisp-edges",
  };
}
