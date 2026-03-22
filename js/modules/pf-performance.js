/**
 * Profilo prestazioni per dispositivi fascia media/bassa e preferenze utente.
 * Usato per ridurre animazioni, frequenze e carico immagini senza build step.
 */

export function pfPrefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * 0 = nessun vincolo extra, 1 = medio, 2 = basso / risparmio energia-dati.
 * Debug: `window.__PF_FORCE_PERF_TIER__ = 0 | 1 | 2` prima di caricare l’app.
 */
export function pfPerformanceTier() {
  const forced = typeof window !== "undefined" && window.__PF_FORCE_PERF_TIER__;
  if (forced === 0 || forced === 1 || forced === 2) return forced;
  if (pfPrefersReducedMotion()) return 2;
  try {
    const dm = navigator.deviceMemory;
    if (typeof dm === "number" && dm > 0) {
      if (dm <= 2) return 2;
      if (dm <= 4) return 1;
    }
    const hc = navigator.hardwareConcurrency;
    if (typeof hc === "number" && hc > 0) {
      if (hc <= 2) return 2;
      if (hc <= 4) return 1;
    }
  } catch (e) {
    /* ignore */
  }
  const conn =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  if (conn) {
    if (conn.saveData) return 2;
    const et = String(conn.effectiveType || "");
    if (/slow-2g|2g/i.test(et)) return 2;
    if (/3g/i.test(et)) return 1;
  }
  return 0;
}

export function pfSlideshowPauseMultiplier(tier) {
  if (tier >= 2) return 2.4;
  if (tier >= 1) return 1.45;
  return 1;
}

export function pfSlideshowSpeedMultiplier(tier) {
  if (tier >= 2) return 1.65;
  if (tier >= 1) return 1.2;
  return 1;
}

export function pfGridEagerImageCap(defaultCap, tier) {
  if (tier >= 2) return Math.min(defaultCap, 6);
  if (tier >= 1) return Math.min(defaultCap, 10);
  return defaultCap;
}
