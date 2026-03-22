/** Durata minima loader (maschera caricamenti velocissimi) */
export const HOME_LOADING_MIN_MS = 600;
/** Dopo questo tempo il loader viene chiuso in ogni caso (rete bloccata, errori, ecc.) */
export const HOME_LOADING_MAX_MS = 14000;

let homeLoadingStart = 0;

/** Stato condiviso tra app.js e FashionGallery (evita globali). */
export const homeLoadingFlags = {
  dismissScheduled: false,
};

export function setHomeLoadingStartNow() {
  homeLoadingStart = performance.now();
}

export function dismissHomeLoading(onDone, options) {
  const force = options && options.force;
  const el = document.getElementById("homeLoadingOverlay");
  const done = typeof onDone === "function" ? onDone : function () {};
  if (!el) {
    done();
    return;
  }
  const elapsed = performance.now() - homeLoadingStart;
  const wait = force
    ? 0
    : Math.max(0, HOME_LOADING_MIN_MS - elapsed);
  window.setTimeout(() => {
    el.classList.add("home-loading--exiting");
    el.setAttribute("aria-busy", "false");
    el.setAttribute("aria-hidden", "true");
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      el.removeEventListener("transitionend", onTransitionEnd);
      el.remove();
      done();
    };
    const onTransitionEnd = (e) => {
      if (e.target !== el) return;
      if (e.propertyName !== "opacity") return;
      finish();
    };
    el.addEventListener("transitionend", onTransitionEnd);
    window.setTimeout(finish, 800);
  }, wait);
}
