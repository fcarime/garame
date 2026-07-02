// Liste de pseudos fictifs pour simuler le matching en mode "Sans mise".
// L'adversaire est en réalité l'IA, mais affiché sous un de ces noms aléatoires.
export const FAKE_NAMES = [
  "Kwame", "Aya", "Djibril", "Fatou", "Mamadou", "Nana", "Kofi", "Amina",
  "Ibrahima", "Awa", "Cheikh", "Rokhaya", "Ousmane", "Bintou", "Modou",
  "Adjoa", "Seydou", "Mariam", "Abdoulaye", "Kadija", "Souleymane", "Yaa",
  "Moussa", "Aicha", "Lamine", "Coumba", "Boubacar", "Ndeye", "Alassane",
  "Sokhna", "Idrissa", "Fama", "Babacar", "Oumou", "Malick", "Penda",
  "Serigne", "Dieynaba", "Papis", "Ramatoulaye", "Gora", "Astou", "Pape",
  "Khady", "Assane", "Ngone", "Thierno", "Adama", "Elhadji", "Mame",
  "PlayaGabon", "KingLibreville", "GaramePro", "LeStratege", "MisterAce",
  "TontonFlingue", "LaMain237", "BossDuJeu", "CartesFolles", "RoiDuPli",
  "Le_Patron", "JokerCiv", "DameDePique", "As2Coeur", "TripleSept",
  "Corra_Master", "MainBasse", "Le3Fatal", "ExportKing", "PliParfait",
  "Zébu", "Panthère", "Caïman224", "Faucon", "Scorpion", "Cobra",
  "Rafiki", "Simba", "Jengo", "Zuri", "Bahati", "Imani", "Jabari",
  "Nia", "Sefu", "Zola", "Ade", "Chidi", "Emeka", "Ngozi", "Obi",
  "Tunde", "Yemi", "Bola", "Femi", "Dayo", "Kunle", "Sade", "Ife",
  "SpeedGarame", "NoLimit", "GhostPlayer", "SilentWin", "Le_Fantome",
  "Turbo229", "FlashCard", "NightOwl", "Le_Loup", "Vipère", "Requin",
  "Général", "Colonel", "Le_Sniper", "MaxPower", "Diamant", "Le_Boss241",
  "Titan", "Phoenix", "Vortex", "Éclair", "Tempête", "Mystic", "Nova",
  "Le_Prince", "Sultan", "Kaiser", "Legend", "Prodige", "Virtuose",
];

// Retourne un adversaire fictif aléatoire { name, avatarId }
export function randomOpponent() {
  const name = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
  const avatarId = Math.floor(Math.random() * 12);
  return { name, avatarId };
}
