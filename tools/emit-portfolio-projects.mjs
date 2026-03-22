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
    summaryParagraphs: [
      "Nude è un trittico che esplora l'essenza del corpo femminile attraverso la distorsione visiva. Forme, luci e ombre convergono su dettagli quasi astratti: il nudo si legge prima come struttura che come narrazione.",
      "Il bianco e nero intensifica il chiaroscuro — pelle, curve e linee generate dal movimento diventano materia e ritmo sulla superficie dell'immagine.",
      "La sovraesposizione annulla il contesto. Il corpo esce dallo spazio definito e si presenta come entità separata, slegata dalla dimensione materiale circostante.",
      "Si allontana l'idea di corpo come simbolo di bellezza o desiderio. Non è un atto di rappresentazione convenzionale, ma una riduzione a linguaggio visivo essenziale e diretto.",
      "Ogni frammento può essere letto come segno di un altro ordine: geometrie impreviste, tensione che supera le categorie estetiche abituali.",
      "La fotocamera non offre un corpo da ammirare o giudicare, ma una presenza visiva semplice — esistente, libera da connotazioni di valore sociale."
    ],
    layout: "horizontal-mixed",
    images: ["01_nude.webp", "02_nude.webp", "03_nudo.webp"]
  },
  {
    id: "l-isola",
    folder: "L'isola",
    title: "L'isola",
    subtitle: "Fuerteventura",
    layout: "isola",
    heroImage: "01_fuerteventura-copertina.webp",
    summary:
      "Sei mesi sull’isola: deserto, mare, silenzio e poche figure necessarie alla sua vita.",
    isolaTagline:
      "Silenzio, vento, distese aperte — sei mesi letti come permanenza, non come passaggio.",
    isolaEditorialBlocks: [
      "Sei mesi a Fuerteventura: non un episodio ma una permanenza. «L'isola» nasce dal tempo sostenuto sul posto — dalla luce che cambia lentamente sulla stessa distesa, dalle giornate misurate più dall’orizzonte che dall’orologio.",
      "Ho interpretato il luogo nella sua chiave più letterale: isolato, desertico. Il vento e la sabbia tengono lo spazio aperto; le figure umane, rare, sono quelle che servono affinché l’isola continui a vivere — presenti ma mai decorative, parte della materia del paesaggio.",
      "Il colore restituisce calore e peso: tonalità polverose, rocce saline, strisce di verde dove l’acqua resta. Il progetto si completa con un articolo che affianca le immagini: racconto la realtà vissuta e la stratificazione storica del posto, tenendo voce e fotografie intenzionalmente vicine."
    ],
    isolaPullQuote:
      "Il deserto non è vuoto: è pieno di luce, silenzio e respiro.",
    images: [
      "01_fuerteventura.webp",
      "01_fuerteventura-copertina.webp",
      "02_fuerteventura.webp",
      "03_fuerteventura.webp",
      "17_fuerteventura.webp",
      "18_fuerteventura.webp",
      "20_fuerteventura.webp",
      "31_fuerteventura.webp",
      "32_fuerteventura.webp",
      "34_fuerteventura.webp",
      "35_fuerteventura.webp",
      "38_fuerteventura.webp",
      "40_fuerteventura.webp",
      "42_fuerteventura.webp",
      "44_fuerteventura.webp"
    ]
  },
  {
    id: "parigi",
    folder: "parigi",
    title: "Parigi",
    layout: "parigi",
    summary: "Strada, luce, architettura — frammenti urbani.",
    heroImage: "09_parigi.webp",
    parigiPullLine:
      "La città si legge tra luci che scorrono e geometrie che restano.",
    images: [
      "01_parigi.webp",
      "03_parigi.webp",
      "04_parigi.webp",
      "05_parigi.webp",
      "07_parigi.webp",
      "09_parigi.webp",
      "17_parigi.webp",
      "22_parigi.webp",
      "25_parigi.webp"
    ]
  },
  {
    id: "taboo-shooting",
    folder: "taboo-shooting",
    title: "Taboo Shooting",
    layout: "taboo",
    summary:
      "Reportage all’Albergo Etico di Fènis: lavoro, inclusione e quotidianità concreta.",
    heroImage: "albergo_eitico_fenis-3.webp",
    tabooHeroIntro:
      "Nel 2022 ho documentato l’Albergo Etico di Fènis, in Valle d’Aosta: un luogo dove accoglienza e ristorazione convivono con un progetto che impiega ragazzi con sindrome di Down o altre disabilità. Le immagini seguono spazi e gesti del lavoro quotidiano — con attenzione alla presenza di chi è inquadrato, senza cercare effetto.",
    tabooEditorialBlocks: [
      "L’hotel ospita e forma: qui il servizio in sala e in cucina è sostenuto da persone che portano competenze concrete nelle mansioni di ogni giorno. Il contesto non è un’eccezione da esibire, ma una realtà organizzata come tante attività che contano sulle persone — con responsabilità, orari e cura del dettaglio.",
      "Durante gli scatti ho potuto scambiare qualche parola con loro. Da quelle conversazioni è nato il titolo del progetto: una formula diretta su come spesso la disabilità venga letta con superficialità. Non si tratta di amplificare una differenza, ma di correggere uno sguardo confuso.",
      "Queste fotografie nascono dal desiderio di restituire uno scorcio di lavoro e di vita quotidiana che assomiglia a molte altre — turni, rapporto con gli ospiti, gesti ripetuti con attenzione. Una normalità condivisa, raccontata con sobrietà e senza drammatizzare."
    ],
    tabooPullQuote:
      "Dietro il titolo ci sono parole dette con schiettezza: la richiesta di essere visti per quel che si fa, giorno dopo giorno.",
    images: [
      "albergo_eitico_fenis-1.webp",
      "albergo_eitico_fenis-2.webp",
      "albergo_eitico_fenis-3.webp",
      "albergo_eitico_fenis-4.webp",
      "albergo_eitico_fenis-5.webp",
      "albergo_eitico_fenis-9.webp"
    ]
  },
  {
    id: "moda-shooting",
    folder: "Moda-shooting",
    title: "Moda Shooting",
    layout: "moda",
    summary:
      "Shooting editoriale 2022–2023: moda, set di corso e collaborazioni tra agenzie e modelli internazionali.",
    heroImage: "05_moda-matilde.webp",
    modaHeroIntro:
      "Shooting realizzati tra il 2022 e il 2023 nel percorso di fotografia di moda: set costruiti con energia, luce studiata e un’idea chiara di silhouette. Un contesto da editoriale — curato, vivo, pensato per esplorare stile e presenza senza i vincoli di un committente.",
    modaEditorialBlocks: [
      "In studio e in location ho lavorato con modelli e modelle provenienti da Italia, Brasile, Albania e Thailandia, spesso in collaborazione con agenzie italiane. Ogni incontro ha portato accenti diversi: gesti, ritmo, modo di occupare lo spazio — materiale prezioso per costruire immagini contemporanee.",
      "Senza brief commerciale c’è spazio per sperimentare: provare una luce più netta, un’inquadratura più rischiosa, una pausa che diventa gesto. Sul set l’autonomia si bilancia con il lavoro di gruppo — confronto continuo tra idee, ruoli e tempi condivisi.",
      "Il dialogo con figure all’inizio di un percorso professionale ha dato slancio al progetto: fiducia reciproca, piccole correzioni, risate tra uno scatto e l’altro. Il risultato è un linguaggio visivo diretto, attento al corpo e al carattere — moda come pratica collettiva e crescita."
    ],
    modaPullQuote:
      "Set, luce, silhouette — e il gruppo che spinge oltre la prima idea.",
    images: [
      "01_moda-emanuele.webp",
      "02_moda-casual.webp",
      "02_moda-emanuele.webp",
      "03_moda-emanuele.webp",
      "04_moda.webp",
      "05_moda-matilde.webp",
      "06_moda-casual.webp",
      "06_moda-matilde.webp",
      "07_moda-matilde.webp",
      "08_moda-riccardo.webp",
      "09_moda-casual.webp",
      "09_moda-riccardo.webp",
      "10_moda-riccardo.webp",
      "11_moda_babacar.webp",
      "11_moda-casual.webp",
      "12_moda_babacar.webp",
      "13_moda_babacar.webp",
      "14_moda-casual.webp",
      "14_moda-coppia.webp",
      "15_moda-coppia.webp",
      "17_moda-casual.webp",
      "19_moda-casual.webp"
    ]
  },
  {
    id: "moda-jump",
    folder: "Moda_jump",
    title: "Moda Jump",
    layout: "modaJump",
    summary: "Studio, salto, gesto — sequenza essenziale.",
    heroImage: "05_jump.webp",
    images: [
      "01_jump.webp",
      "02_jump.webp",
      "03_jump.webp",
      "04_jump.webp",
      "05_jump.webp",
      "06_jump.webp",
      "07_jump.webp",
      "08_jump.webp",
      "09_jump.webp",
      "10_jump.webp"
    ]
  },
  {
    id: "gallipoli-day",
    folder: "Gallipoli-day",
    title: "Gallipoli – Giorno",
    layout: "gallipoliDay",
    summary:
      "Luce del giorno sul mare: calore, attesa, tempo lento — prima della festa.",
    heroImage: "27_gallipoli-personal.webp",
    gallipoliDayProjectLabel: "PROJECT 09",
    gallipoliDayHeroTitle: "Gallipoli",
    gallipoliDaySubtitle: "Giorno",
    gallipoliDayHeroTagline:
      "Sole sulla pelle, ore larghe — il momento prima che tutto accenda.",
    gallipoliDayInterlude:
      "Caldo, luce, respiro — l'attesa che precede la notte.",
    images: [
      "09_gallipoli-personal.webp",
      "10_gallipoli-personal.webp",
      "23_gallipoli-personal.webp",
      "24_gallipoli-personal.webp",
      "27_gallipoli-personal.webp",
      "28_gallipoli-personal.webp",
      "33_gallipoli-personal.webp"
    ]
  },
  {
    id: "gallipoli-night",
    folder: "Gallipoli-night",
    title: "Gallipoli - Notte",
    layout: "gallipoliFestival",
    summary:
      "Festival estivo sul mare: notte, luci, folla e musica — sequenza editoriale.",
    heroImage: "29_gallipoli-personal.webp",
    gallipoliProjectLabel: "PROJECT 10",
    gallipoliHeroTagline:
      "Calore, luci sul palco, corpi in movimento — l'estate che non smette.",
    gallipoliInterlude: "Notte al sud — musica, caos controllato.",
    images: [
      "02_gallipoli-personal.webp",
      "03_gallipoli-personal.webp",
      "05_gallipoli-personal.webp",
      "06_gallipoli-personal.webp",
      "16_gallipoli-personal.webp",
      "17_gallipoli-personal.webp",
      "18_gallipoli-personal.webp",
      "22_gallipoli-personal.webp",
      "25_gallipoli-personal.webp",
      "26_gallipoli-personal.webp",
      "29_gallipoli-personal.webp",
      "34_gallipoli-personal.webp"
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
    title: "Concerti – Ernia",
    layout: "erniaLive",
    summary:
      "Live al palco: presenza, luce, pubblico — sequenza editoriale dal concerto.",
    heroImage: "29_ernia_gallipoli.webp",
    erniaProjectLabel: "PROJECT 11",
    erniaHeroTagline:
      "Microfono, fumo, silenzi tra un verso e l'altro — tensione prima dell'urlo.",
    erniaInterlude:
      "Palco, presenza, energia — lo sguardo del pubblico inchiodato al centro.",
    images: [
      "09_ernia_gallipoli.webp",
      "14_ernia_gallipoli.webp",
      "24_ernia_gallipoli.webp",
      "27_ernia_gallipoli.webp",
      "29_ernia_gallipoli.webp",
      "36_ernia_gallipoli.webp"
    ]
  },
  {
    id: "laurea-ame",
    folder: "Laurea-ame",
    title: "Laurea – Ame",
    layout: "laureaAlbum",
    summary:
      "Un giorno misurato su attese brevi, abbracci e piccole attenzioni — il traguardo condiviso con chi conta.",
    heroImage: "23_laurea-ame.webp",
    laureaProjectLabel: "PROJECT 12",
    laureaHeroTagline:
      "Un passaggio semplice, custodito tra ritratti e gesti — memoria della giornata, senza rumore in più.",
    laureaEditorialBlocks: [
      "La laurea è anche un ritmo: file in attesa, nomi che scorrono, qualche risata nervosa prima dell’uscita in cortile.",
      "Ho cercato di restare vicina a gesti veri — mani che stringono, sguardi che si incrociano, la calma tra un flash e l’altro.",
      "Niente da dimostrare: solo il peso leggero di un traguardo vissuto in famiglia, con la giornata che scivola verso casa."
    ],
    images: [
      "02_laurea-ame.webp",
      "14_laurea-ame.webp",
      "17_laurea-ame.webp",
      "23_laurea-ame.webp",
      "43_laurea-ame.webp",
      "48_laurea-ame.webp",
      "49_laurea-ame.webp",
      "50_laurea-ame.webp",
      "52_laurea-ame.webp"
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
      "07_Anca-Edward.webp",
      "18_Anca-Edward.webp",
      "33_Anca-Edward.webp",
      "37_Anca-Edward.webp",
      "41_Anca-Edward.webp",
      "49_Anca-Edward.webp",
      "52_Anca-Edward.webp",
      "62_Anca-Edward.webp",
      "67_Anca-Edward.webp"
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
