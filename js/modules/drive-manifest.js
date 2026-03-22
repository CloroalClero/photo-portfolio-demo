import { reorderPortfolioProjectsToCanonicalOrder } from "./pf-helpers.js";

/**
 * Se in portfolio/portfolio-config.js è impostato __PORTFOLIO_CONFIG__.driveManifestUrl (URL App web
 * Google Apps Script), carica progetti + ID file Drive prima di avviare la galleria.
 */
export async function loadPortfolioDriveManifest() {
  const cfg =
    (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
  const url =
    (typeof cfg.driveManifestUrl === "string" && cfg.driveManifestUrl.trim()) ||
    (typeof window.__PORTFOLIO_DRIVE_MANIFEST_URL__ === "string" &&
      window.__PORTFOLIO_DRIVE_MANIFEST_URL__.trim()) ||
    "";
  if (!url) return;
  let res;
  const manifestTimeoutMs = 20000;
  try {
    if (typeof AbortController !== "undefined") {
      const ctrl = new AbortController();
      const t = window.setTimeout(() => {
        if (typeof DOMException !== "undefined") {
          ctrl.abort(
            new DOMException(
              "Timeout manifest Drive (" + manifestTimeoutMs + "ms)",
              "TimeoutError"
            )
          );
        } else {
          ctrl.abort();
        }
      }, manifestTimeoutMs);
      try {
        res = await fetch(url, {
          method: "GET",
          redirect: "follow",
          signal: ctrl.signal
        });
      } finally {
        window.clearTimeout(t);
      }
    } else {
      res = await fetch(url, { method: "GET", redirect: "follow" });
    }
  } catch (err) {
    if (err && err.name === "AbortError") {
      console.warn(
        "Portfolio: manifest Drive non disponibile (timeout o rete). Restano i dati già caricati da portfolio/projects."
      );
      return;
    }
    throw err;
  }
  if (!res.ok) {
    throw new Error(`Manifest Drive: HTTP ${res.status}`);
  }
  const data = await res.json();
  if (!data.projects || !Array.isArray(data.projects)) {
    throw new Error("Manifest Drive: manca projects[]");
  }
  /* Merge: il JSON Drive sovrascrive i data.js locali. Usa __PORTFOLIO_LAYOUT_PATCH_BY_ID__
   * (portfolio-config.js) per ripristinare layout/testi non presenti sul manifest (es. l-isola → layout "isola"). */
  const patchMap =
    (typeof window !== "undefined" && window.__PORTFOLIO_LAYOUT_PATCH_BY_ID__) ||
    {};
  window.__PORTFOLIO_PROJECTS__ = data.projects.map((p) =>
    Object.assign({}, p, patchMap[p.id] || {})
  );
  reorderPortfolioProjectsToCanonicalOrder();
  if (data.config && typeof data.config === "object") {
    window.__PORTFOLIO_CONFIG__ = Object.assign(
      {},
      window.__PORTFOLIO_CONFIG__ || {},
      data.config
    );
  }
}
