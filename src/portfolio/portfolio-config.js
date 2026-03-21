/**
 * Config globale + patch layout dopo manifest Drive.
 * I singoli progetti vivono in portfolio/projects/<categoria>/<id>/data.js
 */
window.__PORTFOLIO_CONFIG__ = window.__PORTFOLIO_CONFIG__ || {
  imagesFrom: "local",
  useThumbnailsInGrid: true,
  basePath: "",
  driveManifestUrl:
    "https://script.google.com/macros/s/AKfycbzDPttz-8mlW-CgdxvfDr3O_-1Nn-YQhcpRZBt6MV8uVLAku0QEK0uXvayRghIDELm0/exec"
};

/** Testo completo vista editoriale (il manifest Drive spesso ha solo un riassunto corto). */
var __FLORENTINA_EDITORIAL_SUMMARY__ =
  "Florentina è la ricostruzione della storia di mia\n" +
  "madre, nata a Râmnicu Sărat nel 1968.\n" +
  "\n" +
  "Grazie alle immagini dell'archivio di famiglia\n" +
  "ritrovate in Romania durante il mio ultimo viaggio,\n" +
  "riscopro il suo passato e ricompongo la sua vita,\n" +
  "segnata da una persona e un evento in particolare.\n" +
  "\n" +
  "A soli diciotto anni, con la vita ancora davanti,\n" +
  "Florentina si ritrova al fianco di un uomo violento.\n" +
  "I due, coetanei, diventano genitori dopo pochi\n" +
  "mesi di relazione e si sposano subito. Seguono\n" +
  "sette anni di aggressioni e abusi, finché lei non\n" +
  "trova la forza di separarsi. Resta legata alla Romania\n" +
  "ancora per qualche anno, fino a quando intravede\n" +
  "la possibilità di trasferirsi in Italia per quel lavoro al\n" +
  "quale è sempre rimasta fedele e che non ha mai\n" +
  "accantonato.\n" +
  "\n" +
  "Si trasferisce così in Italia, lasciando il figlio ancora\n" +
  "in Romania con la nonna e portandolo con sé solo\n" +
  "poco tempo dopo.\n" +
  "\n" +
  "Attraverso questo progetto non solo scopro mia\n" +
  "madre sotto nuovi punti di vista — come donna,\n" +
  "come lavoratrice, come moglie — ma ne comprendo\n" +
  "le fragilità e maturo un profondo senso di giustizia\n" +
  "nei confronti dell'uomo che ha segnato non solo la\n" +
  "sua gioventù, ma la sua vita.";

window.__PORTFOLIO_LAYOUT_PATCH_BY_ID__ = {
  /**
   * Con driveManifestUrl: layout + summary completi (il JSON Drive non li allinea ai data.js).
   */
  florentina: {
    layout: "editorial",
    summary: __FLORENTINA_EDITORIAL_SUMMARY__
  },
  nude: { layout: "horizontal-mixed" },
  "anca-edward": {
    layout: "concept",
    locationLine: "Valle d'Aosta, 2025"
  }
};
