/**
 * Costruisce window.__PORTFOLIO_PROJECTS__ dall’ordine menu e dai data.js caricati prima.
 * Ogni progetto: portfolio/projects/<categoria>/<id>/data.js fa push su __PORTFOLIO_PROJECT_REGISTRY__.
 */
(function (W) {
  var ORDER = [
    "florentina",
    "binge-drinking",
    "nude",
    "l-isola",
    "parigi",
    "taboo-shooting",
    "moda-shooting",
    "moda-jump",
    "gallipoli-day",
    "gallipoli-night",
    "dj-set",
    "concerti-ernia",
    "laurea-ame",
    "anca-edward"
  ];
  var raw = W.__PORTFOLIO_PROJECT_REGISTRY__ || [];
  var byId = {};
  raw.forEach(function (p) {
    if (p && p.id != null) byId[String(p.id)] = p;
  });
  var patch = W.__PORTFOLIO_LAYOUT_PATCH_BY_ID__ || {};
  W.__PORTFOLIO_PROJECTS__ = ORDER.map(function (id) {
    var p = byId[id];
    if (!p) {
      console.warn("[portfolio] Manca data.js per progetto:", id);
      return null;
    }
    return Object.assign({}, p, patch[id] || {});
  }).filter(Boolean);
  /** Ordine canonico griglia / numerazione (N.1 = primo id, ecc.). */
  W.__PORTFOLIO_PROJECT_ORDER__ = ORDER.slice();
  var ordById = {};
  ORDER.forEach(function (id, i) {
    ordById[id] = i + 1;
  });
  W.__PORTFOLIO_PROJECT_ORDINAL_BY_ID__ = ordById;
  /** Sezioni menu Progetti (N.1–N.14 globali = ordine in ORDER sopra). */
  W.__PORTFOLIO_MENU_SECTIONS__ = [
    {
      label: "RICERCA PERSONALE",
      folder: "ricerca-personale",
      ids: [
        "florentina",
        "binge-drinking",
        "nude",
        "l-isola",
        "parigi",
        "taboo-shooting"
      ]
    },
    {
      label: "FOTOGRAFIA DI MODA",
      folder: "fotografia-di-moda",
      ids: ["moda-shooting", "moda-jump"]
    },
    {
      label: "FOTOGRAFIA DI EVENTI",
      folder: "fotografia-di-eventi",
      ids: [
        "gallipoli-day",
        "gallipoli-night",
        "dj-set",
        "concerti-ernia",
        "laurea-ame"
      ]
    },
    {
      label: "FOTOGRAFIA MATERNITY",
      folder: "fotografia-maternity",
      ids: ["anca-edward"]
    }
  ];
  var pathById = {};
  W.__PORTFOLIO_MENU_SECTIONS__.forEach(function (sec) {
    var cat = sec.folder;
    if (!cat) return;
    (sec.ids || []).forEach(function (pid) {
      pathById[String(pid)] = cat + "/" + String(pid);
    });
  });
  W.__PORTFOLIO_PROJECT_PATH_BY_ID__ = pathById;
  delete W.__PORTFOLIO_PROJECT_REGISTRY__;
})(window);
