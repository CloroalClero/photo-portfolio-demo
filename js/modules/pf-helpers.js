/** Drift casuale delle card e “formation wave” in griglia (false = griglia ferma). */
export const ENABLE_GRID_CARD_DRIFT = false;

/**
 * Breakpoint allineato a style-mobile.css (max-width: 900px).
 * script-mobile.js / script-desktop.js impostano __PF_IS_MOBILE_LAYOUT__ prima dell’app.
 */
export function pfMobileLayout() {
  if (typeof window.__PF_IS_MOBILE_LAYOUT__ === "boolean") {
    return window.__PF_IS_MOBILE_LAYOUT__;
  }
  return typeof window.matchMedia === "function"
    ? window.matchMedia("(max-width: 900px)").matches
    : window.innerWidth <= 900;
}

/** Placeholder 1×1 per img editoriali mobile in attesa dell’IntersectionObserver. */
export const PF_EDITORIAL_IMG_PLACEHOLDER =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

/**
 * Allinea __PORTFOLIO_PROJECTS__ a __PORTFOLIO_PROJECT_ORDER__ (N.1… come da registry).
 * Progetti non listati in ORDER restano in coda (es. voci solo da manifest Drive).
 */
export function reorderPortfolioProjectsToCanonicalOrder() {
  const order = window.__PORTFOLIO_PROJECT_ORDER__;
  const list = window.__PORTFOLIO_PROJECTS__;
  if (!Array.isArray(order) || order.length === 0) return;
  if (!Array.isArray(list) || list.length === 0) return;
  const byId = Object.create(null);
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    if (p && p.id != null) byId[String(p.id)] = p;
  }
  const next = [];
  for (let i = 0; i < order.length; i++) {
    const id = String(order[i]);
    const p = byId[id];
    if (p) {
      next.push(p);
      delete byId[id];
    }
  }
  const extra = Object.keys(byId).sort();
  for (let i = 0; i < extra.length; i++) {
    next.push(byId[extra[i]]);
  }
  window.__PORTFOLIO_PROJECTS__ = next;
}

/** Base path URL per `data.js` / `mobile.css` del progetto: `portfolio/projects/<categoria>/<id>`. */
export function portfolioProjectDataDir(projectId) {
  const key = String(projectId).replace(/[^a-zA-Z0-9_-]/g, "");
  if (!key) return "";
  const map = window.__PORTFOLIO_PROJECT_PATH_BY_ID__;
  const rel = map && map[key];
  return rel
    ? `portfolio/projects/${rel}`
    : `portfolio/projects/${key}`;
}
