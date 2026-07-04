// Plein écran sur mobile (masque la barre d'URL). No-op sur desktop / iOS non supporté.
function isMobile() {
  try {
    return window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  } catch {
    return false;
  }
}

// À appeler dans un geste utilisateur (clic) sinon les navigateurs refusent.
export function enterFullscreen() {
  if (!isMobile()) return;
  try {
    const el = document.documentElement;
    const req =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen;
    if (req) {
      const p = req.call(el);
      if (p && p.catch) p.catch(() => {});
    }
  } catch {}
}

export function exitFullscreen() {
  try {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      const ex = document.exitFullscreen || document.webkitExitFullscreen;
      if (ex) {
        const p = ex.call(document);
        if (p && p.catch) p.catch(() => {});
      }
    }
  } catch {}
}
