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

// ── Son de bonus / manche gagnée (carillon ascendant) ─────────────────────
export function playBonusSound() {
  if (!settings.effects) return;
  const ac = audioCtx();
  if (!ac) return;
  const now = ac.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 · E5 · G5 · C6
  const master = ac.createGain();
  master.gain.value = 0.5;
  master.connect(ac.destination);
  notes.forEach((f, i) => {
    const t = now + i * 0.1;
    const osc = ac.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = f;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + 0.55);
  });
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

// ── Musique d'ambiance synthétisée (pad doux en boucle) ────────────────────
let musicTimer = null;
let musicGain = null;
let chordIdx = 0;
const CHORDS = [
  [220.00, 277.18, 329.63],
  [196.00, 246.94, 293.66],
  [174.61, 220.00, 261.63],
  [164.81, 207.65, 246.94],
];

function playChord() {
  const ac = audioCtx();
  if (!ac || !musicGain) return;
  const now = ac.currentTime;
  const chord = CHORDS[chordIdx % CHORDS.length];
  chordIdx++;
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass"; lp.frequency.value = 850;
  lp.connect(musicGain);
  chord.forEach((freq, i) => {
    const osc = ac.createOscillator();
    osc.type = i === 0 ? "sine" : "triangle";
    osc.frequency.value = freq;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.12, now + 1.2);   // attaque douce
    g.gain.linearRampToValueAtTime(0.0001, now + 3.6); // relâche
    osc.connect(g).connect(lp);
    osc.start(now); osc.stop(now + 3.8);
  });
}

function startMusic() {
  const ac = audioCtx();
  if (!ac || musicTimer) return;
  musicGain = ac.createGain();
  musicGain.gain.value = 0.4; // volume global bas (« pas trop fort »)
  musicGain.connect(ac.destination);
  chordIdx = 0;
  playChord();
  musicTimer = setInterval(playChord, 3400);
}

function stopMusic() {
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  if (musicGain) {
    try {
      const ac = audioCtx();
      if (ac) musicGain.gain.setTargetAtTime(0.0001, ac.currentTime, 0.4);
      const g = musicGain;
      setTimeout(() => { try { g.disconnect(); } catch {} }, 1200);
    } catch {}
    musicGain = null;
  }
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
