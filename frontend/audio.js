// Audio central : réglages (musique / effets), son de carte, voix, sons mp3.
import { useSyncExternalStore } from "react";
// Les mp3 sont importés (comme les images) pour obtenir une URL valide via Vite,
// car frontend/public n'est pas le publicDir servi à la racine.
import musicUrl from "./public/sounds/music_ambiance.mp3";
import bonusUrl from "./public/sounds/player_succes_manche.mp3";
import selectUrl from "./public/sounds/select_button.mp3";
import loseUrl from "./public/sounds/player_lose_partis.mp3";
import startUrl from "./public/sounds/start_partis.mp3";
import export0 from "./public/sounds/export/33export_0.mp3";
import export1 from "./public/sounds/export/33export_1.mp3";
import export2 from "./public/sounds/export/33export_2.mp3";
import koras0 from "./public/sounds/kora/koras_0.mp3";
import koras1 from "./public/sounds/kora/koras_1.mp3";
import koras2 from "./public/sounds/kora/koras_2.mp3";
import koras3 from "./public/sounds/kora/koras_3.mp3";
import koras4 from "./public/sounds/kora/koras_4.mp3";
import tri0 from "./public/sounds/tri_seven/tri_sept_0.mp3";
import tri1 from "./public/sounds/tri_seven/tri_sept_1.mp3";
import tri2 from "./public/sounds/tri_seven/tri_sept_2.mp3";
import vingt0 from "./public/sounds/twinty_one/vingt_un_0.mp3";
import vingt1 from "./public/sounds/twinty_one/vingt_un_1.mp3";
import vingt2 from "./public/sounds/twinty_one/vingt_un_2.mp3";

const EXPORT_SOUNDS = [export0, export1, export2];
const KORAS_SOUNDS = [koras0, koras1, koras2, koras3, koras4];
const TRISEVEN_SOUNDS = [tri0, tri1, tri2];
const UNDER21_SOUNDS = [vingt0, vingt1, vingt2];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const KEY = "garame_audio";

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    if (s && typeof s === "object") return { music: s.music !== false, effects: s.effects !== false };
  } catch {}
  return { music: true, effects: true };
}

let settings = load();
const listeners = new Set();
function save() { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch {} }

// ── Contexte Web Audio (créé à la demande) ─────────────────────────────────
let ctx = null;
function audioCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

// ── Son de carte jouée (bruit filtré, court « snap ») ──────────────────────
export function playCardSound() {
  if (!settings.effects) return;
  const ac = audioCtx();
  if (!ac) return;
  const now = ac.currentTime;
  const dur = 0.09;
  const buffer = ac.createBuffer(1, Math.max(1, Math.floor(ac.sampleRate * dur)), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass"; bp.frequency.value = 1900; bp.Q.value = 0.9;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.5, now + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  src.connect(bp).connect(g).connect(ac.destination);
  src.start(now); src.stop(now + dur);
}

// ── Lecture des mp3 via le même AudioContext (plus fiable que <audio>) ──────
const buffers = new Map(); // src -> AudioBuffer | Promise<AudioBuffer|null>
function loadBuffer(src) {
  const ac = audioCtx();
  if (!ac) return Promise.resolve(null);
  if (buffers.has(src)) return Promise.resolve(buffers.get(src));
  const p = fetch(src)
    .then((r) => r.arrayBuffer())
    .then((ab) => ac.decodeAudioData(ab))
    .then((buf) => { buffers.set(src, buf); return buf; })
    .catch(() => { buffers.delete(src); return null; });
  buffers.set(src, p);
  return p;
}

async function playFile(src, volume = 1) {
  if (!settings.effects) return;
  const ac = audioCtx();
  if (!ac) return;
  const buf = await loadBuffer(src);
  if (!buf) return;
  const source = ac.createBufferSource();
  source.buffer = buf;
  const g = ac.createGain();
  g.gain.value = volume;
  source.connect(g).connect(ac.destination);
  source.start();
}

// Son de manche gagnée
export function playBonusSound() { playFile(bonusUrl, 1.0); }

// Son de sélection d'un bouton de lancement de partie
export function playSelectSound() { playFile(selectUrl, 1.0); }

// Son de partie perdue
export function playLoseSound() { playFile(loseUrl, 1.0); }

// Voix « 33 Export » / « KORAS » (variante aléatoire)
export function playExportSound() { playFile(pick(EXPORT_SOUNDS), 1.0); }
export function playKorasSound() { playFile(pick(KORAS_SOUNDS), 1.0); }

// Victoires spéciales : Triple Sept / Main basse (≤ 21) — variante aléatoire
export function playTripleSevenSound() { playFile(pick(TRISEVEN_SOUNDS), 1.0); }
export function playUnder21Sound() { playFile(pick(UNDER21_SOUNDS), 1.0); }

// Jingle de début de partie : coupe la musique, joue le start, puis relance la musique
export async function playStartSound() {
  if (!settings.effects) return;
  const ac = audioCtx();
  if (!ac) return;
  const buf = await loadBuffer(startUrl);
  if (!buf) return;
  const wasMusic = settings.music;
  stopMusic(); // met la musique de fond en pause pendant le jingle
  const src = ac.createBufferSource();
  src.buffer = buf;
  const g = ac.createGain();
  g.gain.value = 1.0;
  src.connect(g).connect(ac.destination);
  src.onended = () => { if (wasMusic && settings.music) startMusic(); };
  src.start();
}

// ── Voix (KORAS / 33 Export) via synthèse vocale du navigateur ─────────────
export function speak(text) {
  if (!settings.effects) return;
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR"; u.rate = 0.95; u.pitch = 1.05; u.volume = 1;
    synth.speak(u);
  } catch {}
}

// ── Musique de fond (mp3 en boucle via AudioContext, volume bas) ───────────
let musicBuffer = null;
let musicSource = null;
let musicGain = null;
let musicTimer = null;
let musicStarting = false;
let musicStopped = true;

async function startMusic() {
  const ac = audioCtx();
  if (!ac || !musicStopped || musicStarting) return; // déjà en cours
  musicStarting = true;
  if (!musicBuffer) musicBuffer = await loadBuffer(musicUrl);
  musicStarting = false;
  if (!musicBuffer || !settings.music) return;
  musicStopped = false;
  musicGain = ac.createGain();
  musicGain.gain.value = 0.2;
  musicGain.connect(ac.destination);
  playMusicOnce();
}

// Une passe de la musique, puis relance après une pause de 0,2 s (boucle manuelle)
function playMusicOnce() {
  const ac = audioCtx();
  if (!ac || musicStopped || !musicGain) return;
  const src = ac.createBufferSource();
  src.buffer = musicBuffer;
  src.connect(musicGain);
  src.onended = () => {
    if (musicStopped) return;
    musicTimer = setTimeout(playMusicOnce, 400); // pause de 0,4 s entre les boucles
  };
  musicSource = src;
  src.start();
}

function stopMusic() {
  musicStopped = true;
  if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
  if (musicSource) { try { musicSource.onended = null; musicSource.stop(); } catch {} musicSource = null; }
  if (musicGain) { try { musicGain.disconnect(); } catch {} musicGain = null; }
}

function applyMusic() {
  if (settings.music) startMusic();
  else stopMusic();
}

// ── API réglages ───────────────────────────────────────────────────────────
export function getAudio() { return settings; }
export function setAudio(patch) {
  settings = { ...settings, ...patch };
  save();
  applyMusic();
  listeners.forEach((l) => l(settings));
}
function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function useAudio() {
  return useSyncExternalStore(subscribe, getAudio, getAudio);
}

// Démarre l'ambiance au premier geste utilisateur (politique autoplay des navigateurs)
let armed = false;
export function armAudioOnFirstGesture() {
  if (armed) return;
  armed = true;
  const onGesture = () => {
    audioCtx();
    if (settings.music) startMusic();
    window.removeEventListener("pointerdown", onGesture);
    window.removeEventListener("keydown", onGesture);
  };
  window.addEventListener("pointerdown", onGesture);
  window.addEventListener("keydown", onGesture);
}
