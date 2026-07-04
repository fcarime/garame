// Audio central : réglages (musique / effets), son de carte, voix, ambiance synthétisée.
import { useSyncExternalStore } from "react";

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
  g.gain.exponentialRampToValueAtTime(0.28, now + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  src.connect(bp).connect(g).connect(ac.destination);
  src.start(now); src.stop(now + dur);
}

// ── Lecture d'un fichier son ponctuel (SFX) ────────────────────────────────
function playFile(src, volume = 1) {
  if (!settings.effects) return;
  try {
    const a = new Audio(src);
    a.volume = volume;
    a.play().catch(() => {});
  } catch {}
}

// Son de manche gagnée
export function playBonusSound() { playFile("/sounds/player_succes_manche.mp3", 0.85); }

// Son de sélection d'un bouton de lancement de partie
export function playSelectSound() { playFile("/sounds/select_button.mp3", 0.7); }

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

// ── Musique de fond (fichier, en boucle, volume bas) ───────────────────────
let musicEl = null;
function startMusic() {
  if (!musicEl) {
    musicEl = new Audio("/sounds/music_ambiance.mp3");
    musicEl.loop = true;
    musicEl.volume = 0.2;
  }
  musicEl.play().catch(() => {});
}

function stopMusic() {
  if (musicEl) { try { musicEl.pause(); } catch {} }
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
