// ── Persistance SQLite (module intégré node:sqlite, Node 22.5+) ─────────────
// Base fichier locale : survit aux redémarrages du serveur.
// Un utilisateur peut être créé de deux façons :
//   1. via /api/register  → avec passwordHash (compte réel, reconnexion possible)
//   2. via getUser(pseudo) → sans mot de passe (invité online identifié par pseudo)

const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const DB_PATH = path.join(__dirname, "garame.db");
const db = new DatabaseSync(DB_PATH);

const STARTING_BANKROLL = 100000;

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    pseudo_key    TEXT PRIMARY KEY,
    pseudo        TEXT NOT NULL,
    password_hash TEXT,
    bankroll      INTEGER NOT NULL DEFAULT ${STARTING_BANKROLL},
    games_played  INTEGER NOT NULL DEFAULT 0,
    games_won     INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL
  );
`);

const keyOf = (pseudo) => (pseudo ?? "").trim().toLowerCase();

// Convertit une ligne SQLite (snake_case) en objet applicatif (camelCase)
function toUser(row) {
  if (!row) return null;
  return {
    pseudo: row.pseudo,
    passwordHash: row.password_hash ?? null,
    bankroll: row.bankroll,
    gamesPlayed: row.games_played,
    gamesWon: row.games_won,
    createdAt: row.created_at,
  };
}

const stmtSelect = db.prepare("SELECT * FROM users WHERE pseudo_key = ?");
const stmtInsert = db.prepare(`
  INSERT INTO users (pseudo_key, pseudo, password_hash, bankroll, games_played, games_won, created_at)
  VALUES (?, ?, ?, ?, 0, 0, ?)
`);
const stmtSetPassword = db.prepare("UPDATE users SET password_hash = ?, pseudo = ? WHERE pseudo_key = ?");
const stmtSetBankroll = db.prepare("UPDATE users SET bankroll = ? WHERE pseudo_key = ?");
const stmtResult = db.prepare(
  "UPDATE users SET bankroll = ?, games_played = games_played + 1, games_won = games_won + ? WHERE pseudo_key = ?"
);

// Retourne l'utilisateur, ou null s'il n'existe pas (sans le créer)
function findUser(pseudo) {
  const key = keyOf(pseudo);
  if (!key) return null;
  return toUser(stmtSelect.get(key));
}

// Retourne l'utilisateur en le créant s'il n'existe pas (invité passwordless)
function getUser(pseudo) {
  const key = keyOf(pseudo);
  if (!key) return null;
  const existing = stmtSelect.get(key);
  if (existing) return toUser(existing);
  const now = new Date().toISOString();
  stmtInsert.run(key, pseudo.trim(), null, STARTING_BANKROLL, now);
  return toUser(stmtSelect.get(key));
}

// True si un compte avec mot de passe existe déjà pour ce pseudo
function hasAccount(pseudo) {
  const row = stmtSelect.get(keyOf(pseudo));
  return !!(row && row.password_hash);
}

// Crée un compte (ou ajoute un mot de passe à un invité existant). Retourne l'utilisateur.
function createUser(pseudo, passwordHash) {
  const key = keyOf(pseudo);
  const now = new Date().toISOString();
  const existing = stmtSelect.get(key);
  if (existing) {
    stmtSetPassword.run(passwordHash, pseudo.trim(), key);
  } else {
    stmtInsert.run(key, pseudo.trim(), passwordHash, STARTING_BANKROLL, now);
  }
  return toUser(stmtSelect.get(key));
}

// Met à jour uniquement le bankroll
function setBankroll(pseudo, bankroll) {
  const user = getUser(pseudo);
  if (!user) return null;
  stmtSetBankroll.run(bankroll, keyOf(pseudo));
  return findUser(pseudo);
}

// Applique un résultat de partie : winner +amount / loser -amount (atomique)
function applyGameResult(winnerPseudo, loserPseudo, amount) {
  const winner = getUser(winnerPseudo);
  const loser = getUser(loserPseudo);
  const winnerBankroll = winner.bankroll + amount;
  const loserBankroll = Math.max(0, loser.bankroll - amount);
  db.exec("BEGIN");
  try {
    stmtResult.run(winnerBankroll, 1, keyOf(winnerPseudo)); // +1 win
    stmtResult.run(loserBankroll, 0, keyOf(loserPseudo));   // +0 win
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  return { winnerBankroll, loserBankroll };
}

module.exports = {
  STARTING_BANKROLL,
  findUser,
  getUser,
  hasAccount,
  createUser,
  setBankroll,
  applyGameResult,
};
