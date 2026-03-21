/**
 * Immagini: local → media/projects (root del repo) | drive + manifest (vedi tools/DRIVE-MANIFEST.md).
 * layout: "concept" — hero + griglia a destra.
 * layout: "horizontal-mixed" — NUDE: riga orizzontale scorrevole, card 1×1 e 4×4.
 * summary — descrizione breve in vista progetto.
 * Ordine nell’array = N.1 … N.14 nel menu e in "N. xx" sul layout concept.
 */
window.__PORTFOLIO_CONFIG__ = window.__PORTFOLIO_CONFIG__ || {
  imagesFrom: "local",
  useThumbnailsInGrid: true,
  /** Solo se il sito non è servito dalla cartella che contiene `media/`: es. `"/mio-sito/"` */
  basePath: "",
  driveManifestUrl:
    "https://script.google.com/macros/s/AKfycbzDPttz-8mlW-CgdxvfDr3O_-1Nn-YQhcpRZBt6MV8uVLAku0QEK0uXvayRghIDELm0/exec"
};

window.__PORTFOLIO_PROJECTS__ = [
  {
    id: "florentina",
    folder: "Florentina",
    title: "FLORENTINA",
    summary: "Ritratti e corpo — serie personale.",
    images: [
      "01_mamma.jpg",
      "02_mamma.jpg",
      "03_mamma.jpg",
      "04_mamma.jpg",
      "05_mamma.jpg",
      "06_mamma.jpg",
      "07_mamma.jpg",
      "08_mamma.jpg",
      "09_mamma.jpg",
      "10_mamma.jpg",
      "11_censura_pixel.jpg",
      "12_censura_pixel.jpg",
      "13_censura_pixel.jpg",
      "14_censura_pixel.jpg",
      "15_mamma.jpg",
      "16_mamma.jpg",
      "17_censura_pixel.jpg",
      "18_censura_pixel.jpg",
      "19_mamma.jpg",
      "20_mamma.jpg",
      "21_mamma.jpg",
      "22_mamma.jpg",
      "23_mamma.jpg"
    ]
  },
  {
    id: "binge-drinking",
    folder: "Binge-drinking",
    title: "BINGE DRINKING",
    summary: "Serie in allestimento — aggiungi le immagini in media/projects/Binge-drinking.",
    images: []
  },
  {
    id: "nude",
    folder: "Nude",
    title: "NUDE",
    summary: "Studio — forma e luce.",
    layout: "horizontal-mixed",
    images: ["01_nude.jpg", "02_nude.jpg", "03_nudo.jpg"]
  },
  {
    id: "l-isola",
    folder: "L'isola",
    title: "L'ISOLA",
    summary: "Fuerteventura — paesaggio e presenze.",
    images: [
      "01_fuerteventura.jpg",
      "01_fuerteventura-copertina.jpg",
      "02_fuerteventura.jpg",
      "03_fuerteventura.jpg",
      "17_fuerteventura.jpg",
      "18_fuerteventura.jpg",
      "20_fuerteventura.jpg",
      "31_fuerteventura.jpg",
      "32_fuerteventura.jpg",
      "34_fuerteventura.jpg",
      "35_fuerteventura.jpg",
      "38_fuerteventura.jpg",
      "40_fuerteventura.jpg",
      "42_fuerteventura.jpg",
      "44_fuerteventura.jpg"
    ]
  },
  {
    id: "parigi",
    folder: "parigi",
    title: "PARIS",
    summary: "Strada, dettagli, città.",
    images: [
      "01_parigi.jpg",
      "03_parigi.jpg",
      "04_parigi.jpg",
      "05_parigi.jpg",
      "07_parigi.jpg",
      "09_parigi.jpg",
      "17_parigi.jpg",
      "22_parigi.jpg",
      "25_parigi.jpg"
    ]
  },
  {
    id: "taboo-shooting",
    folder: "taboo-shooting",
    title: "TABOO SHOOTING",
    summary: "Concept — location e still life.",
    images: [
      "albergo_eitico_fenis-1.JPG",
      "albergo_eitico_fenis-2.JPG",
      "albergo_eitico_fenis-3.JPG",
      "albergo_eitico_fenis-4.JPG",
      "albergo_eitico_fenis-5.JPG",
      "albergo_eitico_fenis-9.JPG"
    ]
  },
  {
    id: "moda-shooting",
    folder: "Moda-shooting",
    title: "FASHION",
    summary: "Editoriale e look.",
    images: [
      "01_moda-emanuele.jpg",
      "02_moda-casual.jpg",
      "02_moda-emanuele.jpg",
      "03_moda-emanuele.jpg",
      "04_moda.jpg",
      "05_moda-matilde.jpg",
      "06_moda-casual.jpg",
      "06_moda-matilde.jpg",
      "07_moda-matilde.jpg",
      "08_moda-riccardo.jpg",
      "09_moda-casual.jpg",
      "09_moda-riccardo.jpg",
      "10_moda-riccardo.jpg",
      "11_moda_babacar.jpg",
      "11_moda-casual.jpg",
      "12_moda_babacar.jpg",
      "13_moda_babacar.jpg",
      "14_moda-casual.jpg",
      "14_moda-coppia.jpg",
      "15_moda-coppia.jpg",
      "17_moda-casual.jpg",
      "19_moda-casual.jpg"
    ]
  },
  {
    id: "moda-jump",
    folder: "Moda_jump",
    title: "JUMP",
    summary: "Studio e movimento.",
    images: [
      "01_jump.jpg",
      "02_jump.jpg",
      "03_jump.jpg",
      "04_jump.jpg",
      "05_jump.jpg",
      "06_jump.jpg",
      "07_jump.jpg",
      "08_jump.jpg",
      "09_jump.jpg",
      "10_jump.jpg"
    ]
  },
  {
    id: "gallipoli-day",
    folder: "Gallipoli-day",
    title: "byDAY",
    summary: "Gallipoli alla luce del giorno.",
    images: [
      "09_gallipoli-personal.jpg",
      "10_gallipoli-personal.jpg",
      "23_gallipoli-personal.jpg",
      "24_gallipoli-personal.jpg",
      "27_gallipoli-personal.jpg",
      "28_gallipoli-personal.jpg",
      "33_gallipoli-personal.jpg"
    ]
  },
  {
    id: "gallipoli-night",
    folder: "Gallipoli-night",
    title: "byNIGHT",
    summary: "Gallipoli dopo il tramonto.",
    images: [
      "02_gallipoli-personal.jpg",
      "03_gallipoli-personal.jpg",
      "05_gallipoli-personal.jpg",
      "06_gallipoli-personal.jpg",
      "16_gallipoli-personal.jpg",
      "17_gallipoli-personal.jpg",
      "18_gallipoli-personal.jpg",
      "22_gallipoli-personal.jpg",
      "25_gallipoli-personal.jpg",
      "26_gallipoli-personal.jpg",
      "29_gallipoli-personal.jpg",
      "34_gallipoli-personal.jpg"
    ]
  },
  {
    id: "dj-set",
    folder: "DJ-set",
    title: "DJSET",
    summary: "Serie in allestimento — aggiungi le immagini in media/projects/DJ-set.",
    images: []
  },
  {
    id: "concerti-ernia",
    folder: "concerti-ernia",
    title: "CONCERTI",
    summary: "Live e atmosfera dal palco.",
    images: [
      "09_ernia_gallipoli.jpg",
      "14_ernia_gallipoli.jpg",
      "24_ernia_gallipoli.jpg",
      "27_ernia_gallipoli.jpg",
      "29_ernia_gallipoli.jpg",
      "36_ernia_gallipoli.jpg"
    ]
  },
  {
    id: "laurea-ame",
    folder: "Laurea-ame",
    title: "LAUREE",
    summary: "La giornata della laurea.",
    images: [
      "02_laurea-ame.jpg",
      "14_laurea-ame.jpg",
      "17_laurea-ame.jpg",
      "23_laurea-ame.jpg",
      "43_laurea-ame.jpg",
      "48_laurea-ame.jpg",
      "49_laurea-ame.jpg",
      "50_laurea-ame.jpg",
      "52_laurea-ame.jpg"
    ]
  },
  {
    id: "anca-edward",
    folder: "Anca-edward",
    title: "ANCA & EDWARD",
    locationLine: "Valle d'Aosta, 2025",
    layout: "concept",
    summary: "Ritratti di coppia in ambiente naturale.",
    images: [
      "07_Anca-Edward.jpg",
      "18_Anca-Edward.jpg",
      "33_Anca-Edward.jpg",
      "37_Anca-Edward.jpg",
      "41_Anca-Edward.jpg",
      "49_Anca-Edward.jpg",
      "52_Anca-Edward.jpg",
      "62_Anca-Edward.jpg",
      "67_Anca-Edward.jpg"
    ]
  }
];

/*
 * Dopo il manifest Drive i campi `layout` / `locationLine` non ci sono nel JSON:
 * qui si reintegrano così NUDE resta orizzontale e ANCA resta layout concept.
 */
window.__PORTFOLIO_LAYOUT_PATCH_BY_ID__ = {
  nude: { layout: "horizontal-mixed" },
  "anca-edward": {
    layout: "concept",
    locationLine: "Valle d'Aosta, 2025"
  }
};
