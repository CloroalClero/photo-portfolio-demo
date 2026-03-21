import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const projects = [
  {
    id: "florentina",
    folder: "Florentina",
    title: "FLORENTINA",
    layout: "editorial",
    summary:
      "Florentina è la ricostruzione della storia di mia madre, nata a Râmnicu Sărat nel 1968.\n\nGrazie alle immagini dell’archivio di famiglia ritrovate in Romania durante il mio ultimo viaggio, riscopro il suo passato e ricompongo la sua vita, segnata da una persona e un evento in particolare.\n\nA soli diciotto anni, con la vita ancora davanti, Florentina si ritrova al fianco di un uomo violento. I due, coetanei, diventano genitori dopo pochi mesi di relazione e si sposano subito. Seguono sette anni di aggressioni e abusi, finché lei non trova la forza di separarsi. Resta legata alla Romania ancora per qualche anno, fino a quando intravede la possibilità di trasferirsi in Italia per quel lavoro al quale è sempre rimasta fedele e che non ha mai accantonato.\n\nSi trasferisce così in Italia, lasciando il figlio ancora in Romania con la nonna e portandolo con sé solo poco tempo dopo.\n\nAttraverso questo progetto non solo scopro mia madre sotto nuovi punti di vista — come donna, come lavoratrice, come moglie — ma ne comprendo le fragilità e maturo un profondo senso di giustizia nei confronti dell’uomo che ha segnato non solo la sua gioventù, ma la sua vita.",
    images: [
      "01_mamma.webp",
      "02_mamma.webp",
      "03_mamma.webp",
      "04_mamma.webp",
      "05_mamma.webp",
      "06_mamma.webp",
      "07_mamma.webp",
      "08_mamma.webp",
      "09_mamma.webp",
      "10_mamma.webp",
      "11_censura_pixel.webp",
      "12_censura_pixel.webp",
      "13_censura_pixel.webp",
      "14_censura_pixel.webp",
      "15_mamma.webp",
      "16_mamma.webp",
      "17_censura_pixel.webp",
      "18_censura_pixel.webp",
      "19_mamma.webp",
      "20_mamma.webp",
      "21_mamma.webp",
      "22_mamma.webp",
      "23_mamma.webp"
    ]
  },
  {
    id: "binge-drinking",
    folder: "Binge-drinking",
    title: "BINGE DRINKING",
    summary:
      "Serie in allestimento — aggiungi le immagini in media/projects/Binge-drinking.",
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
    summary:
      "Serie in allestimento — aggiungi le immagini in media/projects/DJ-set.",
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

const hdr = `/** Registrato da projects-registry.js — vedi portfolio/projects/README.md */\n`;

/** Allineato a `folder` in `__PORTFOLIO_MENU_SECTIONS__` (projects-registry.js). */
const CATEGORY_BY_ID = {
  florentina: "ricerca-personale",
  "binge-drinking": "ricerca-personale",
  nude: "ricerca-personale",
  "l-isola": "ricerca-personale",
  parigi: "ricerca-personale",
  "taboo-shooting": "ricerca-personale",
  "moda-shooting": "fotografia-di-moda",
  "moda-jump": "fotografia-di-moda",
  "gallipoli-day": "fotografia-di-eventi",
  "gallipoli-night": "fotografia-di-eventi",
  "dj-set": "fotografia-di-eventi",
  "concerti-ernia": "fotografia-di-eventi",
  "laurea-ame": "fotografia-di-eventi",
  "anca-edward": "fotografia-maternity"
};

for (const p of projects) {
  const cat = CATEGORY_BY_ID[p.id];
  if (!cat) {
    console.error("emit-portfolio-projects: manca CATEGORY_BY_ID per", p.id);
    process.exit(1);
  }
  const dir = path.join(root, "portfolio", "projects", cat, p.id);
  fs.mkdirSync(dir, { recursive: true });
  const json = JSON.stringify(p, null, 2);
  const js =
    hdr +
    `(function (W) {\n` +
    `  var R = (W.__PORTFOLIO_PROJECT_REGISTRY__ =\n` +
    `    W.__PORTFOLIO_PROJECT_REGISTRY__ || []);\n` +
    `  R.push(${json});\n` +
    `})(window);\n`;
  fs.writeFileSync(path.join(dir, "data.js"), js);
  const mpath = path.join(dir, "mobile.css");
  if (!fs.existsSync(mpath)) {
    fs.writeFileSync(
      mpath,
      `/* Opzionale: solo mobile con questa serie attiva (body[data-active-project="${p.id}"]) */\n\n`
    );
  }
}

console.log(
  "Emitted",
  projects.length,
  "project folders under portfolio/projects/<categoria>/"
);
