/**
 * Config globale + patch layout dopo manifest Drive.
 * I singoli progetti vivono in portfolio/projects/<categoria>/<id>/data.js
 */
window.__PORTFOLIO_CONFIG__ = window.__PORTFOLIO_CONFIG__ || {
  imagesFrom: "local",
  /** Con imagesFrom "drive": griglia da Drive, zoom da media/projects/&lt;folder&gt; se il manifest ha `file` per ogni immagine. */
  useLocalMediaForZoom: true,
  /** Quante foto zoom precaricare per lato (±). Valori alti + richieste in parallelo saturano il browser. */
  zoomPrefetchNeighborRadius: 4,
  useThumbnailsInGrid: true,
  basePath: "",
  driveManifestUrl:
    "https://script.google.com/macros/s/AKfycbzDPttz-8mlW-CgdxvfDr3O_-1Nn-YQhcpRZBt6MV8uVLAku0QEK0uXvayRghIDELm0/exec",
  /** Locale: sottocartella con stessi nomi file, JPEG ridotti per la griglia (lo zoom usa i file grandi). */
  localThumbnailSubfolder: "",
  /** Quante celle foto caricano subito (eager); il resto è lazy (meno lag con molte immagini). */
  gridImageEagerCount: 14
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

/** Paragrafi vista Nude (Drive: sostituisce il riassunto corto del manifest). */
var __NUDE_PROJECT_SUMMARY_PARAGRAPHS__ = [
  "Nude è un trittico che esplora l'essenza del corpo femminile attraverso la distorsione visiva. Forme, luci e ombre convergono su dettagli quasi astratti: il nudo si legge prima come struttura che come narrazione.",
  "Il bianco e nero intensifica il chiaroscuro — pelle, curve e linee generate dal movimento diventano materia e ritmo sulla superficie dell'immagine.",
  "La sovraesposizione annulla il contesto. Il corpo esce dallo spazio definito e si presenta come entità separata, slegata dalla dimensione materiale circostante.",
  "Si allontana l'idea di corpo come simbolo di bellezza o desiderio. Non è un atto di rappresentazione convenzionale, ma una riduzione a linguaggio visivo essenziale e diretto.",
  "Ogni frammento può essere letto come segno di un altro ordine: geometrie impreviste, tensione che supera le categorie estetiche abituali.",
  "La fotocamera non offre un corpo da ammirare o giudicare, ma una presenza visiva semplice — esistente, libera da connotazioni di valore sociale."
];

/** Testi / layout L'isola: il manifest Drive non invia questi campi → senza patch resta la griglia standard. */
var __L_ISOLA_LAYOUT_PATCH__ = {
  layout: "isola",
  subtitle: "Fuerteventura",
  heroImage: "01_fuerteventura-copertina.webp",
  isolaHeroIntro:
    "Sei mesi vissuti sull'isola, tra deserto e mare: un isolamento fatto di luce, vento e distese. Il paesaggio è la materia centrale del racconto; le figure, rare e volute, fanno parte di quella stessa materia — mai decoro sullo sfondo.",
  summary:
    "Sei mesi sull'isola: deserto, mare, silenzio e poche figure necessarie alla sua vita.",
  isolaTagline:
    "Silenzio, vento, distese aperte — sei mesi letti come permanenza, non come passaggio.",
  isolaEditorialBlocks: [
    "Sei mesi a Fuerteventura: non un episodio ma una permanenza. «L'isola» nasce dal tempo sostenuto sul posto — dalla luce che cambia lentamente sulla stessa distesa, dalle giornate misurate più dall'orizzonte che dall'orologio.",
    "Ho interpretato il luogo nella sua chiave più letterale: isolato, desertico. Il vento e la sabbia tengono lo spazio aperto; le figure umane, rare, sono quelle che servono affinché l'isola continui a vivere — presenti ma mai decorative, parte della materia del paesaggio.",
    "Il colore restituisce calore e peso: tonalità polverose, rocce saline, strisce di verde dove l'acqua resta. Il progetto si completa con un articolo che affianca le immagini: racconto la realtà vissuta e la stratificazione storica del posto, tenendo voce e fotografie intenzionalmente vicine."
  ],
  isolaPullQuote:
    "Il deserto non è vuoto: è pieno di luce, silenzio e respiro."
};

/** Parigi: vista editoriale urbana (manifest Drive senza layout / hero / interludio). */
var __PARIGI_LAYOUT_PATCH__ = {
  layout: "parigi",
  title: "Parigi",
  heroImage: "09_parigi.webp",
  parigiPullLine:
    "La città si legge tra luci che scorrono e geometrie che restano.",
  summary: "Strada, luce, architettura — frammenti urbani."
};

/** Taboo Shooting: reportage documentario (manifest Drive senza testi lunghi / layout). */
var __TABOO_SHOOTING_LAYOUT_PATCH__ = {
  layout: "taboo",
  title: "Taboo Shooting",
  heroImage: "albergo_eitico_fenis-3.webp",
  summary:
    "Reportage all’Albergo Etico di Fènis: lavoro, inclusione e quotidianità concreta.",
  tabooHeroIntro:
    "Nel 2022 ho documentato l’Albergo Etico di Fènis, in Valle d’Aosta: un luogo dove accoglienza e ristorazione convivono con un progetto che impiega ragazzi con sindrome di Down o altre disabilità. Le immagini seguono spazi e gesti del lavoro quotidiano — con attenzione alla presenza di chi è inquadrato, senza cercare effetto.",
  tabooEditorialBlocks: [
    "L’hotel ospita e forma: qui il servizio in sala e in cucina è sostenuto da persone che portano competenze concrete nelle mansioni di ogni giorno. Il contesto non è un’eccezione da esibire, ma una realtà organizzata come tante attività che contano sulle persone — con responsabilità, orari e cura del dettaglio.",
    "Durante gli scatti ho potuto scambiare qualche parola con loro. Da quelle conversazioni è nato il titolo del progetto: una formula diretta su come spesso la disabilità venga letta con superficialità. Non si tratta di amplificare una differenza, ma di correggere uno sguardo confuso.",
    "Queste fotografie nascono dal desiderio di restituire uno scorcio di lavoro e di vita quotidiana che assomiglia a molte altre — turni, rapporto con gli ospiti, gesti ripetuti con attenzione. Una normalità condivisa, raccontata con sobrietà e senza drammatizzare."
  ],
  tabooPullQuote:
    "Dietro il titolo ci sono parole dette con schiettezza: la richiesta di essere visti per quel che si fa, giorno dopo giorno."
};

/** Moda Shooting: editoriale fashion (manifest Drive senza layout / testi lunghi). */
var __MODA_SHOOTING_LAYOUT_PATCH__ = {
  layout: "moda",
  title: "Moda Shooting",
  heroImage: "05_moda-matilde.webp",
  summary:
    "Shooting editoriale 2022–2023: moda, set di corso e collaborazioni tra agenzie e modelli internazionali.",
  modaHeroIntro:
    "Shooting realizzati tra il 2022 e il 2023 nel percorso di fotografia di moda: set costruiti con energia, luce studiata e un’idea chiara di silhouette. Un contesto da editoriale — curato, vivo, pensato per esplorare stile e presenza senza i vincoli di un committente.",
  modaEditorialBlocks: [
    "In studio e in location ho lavorato con modelli e modelle provenienti da Italia, Brasile, Albania e Thailandia, spesso in collaborazione con agenzie italiane. Ogni incontro ha portato accenti diversi: gesti, ritmo, modo di occupare lo spazio — materiale prezioso per costruire immagini contemporanee.",
    "Senza brief commerciale c’è spazio per sperimentare: provare una luce più netta, un’inquadratura più rischiosa, una pausa che diventa gesto. Sul set l’autonomia si bilancia con il lavoro di gruppo — confronto continuo tra idee, ruoli e tempi condivisi.",
    "Il dialogo con figure all’inizio di un percorso professionale ha dato slancio al progetto: fiducia reciproca, piccole correzioni, risate tra uno scatto e l’altro. Il risultato è un linguaggio visivo diretto, attento al corpo e al carattere — moda come pratica collettiva e crescita."
  ],
  modaPullQuote:
    "Set, luce, silhouette — e il gruppo che spinge oltre la prima idea."
};

/** Moda Jump: hero + micro-riga opzionale + galleria a colonna (project-moda-jump.css). */
var __MODA_JUMP_LAYOUT_PATCH__ = {
  layout: "modaJump",
  title: "Moda Jump",
  heroImage: "05_jump.webp",
  summary: "Studio, salto, gesto — sequenza essenziale."
};

/** Gallipoli giorno / pre-festa: luminoso + galleria lenta (project-gallipoli-day.css). */
var __GALLIPOLI_DAY_LAYOUT_PATCH__ = {
  layout: "gallipoliDay",
  title: "Gallipoli – Giorno",
  heroImage: "27_gallipoli-personal.webp",
  summary:
    "Luce del giorno sul mare: calore, attesa, tempo lento — prima della festa.",
  gallipoliDayProjectLabel: "PROJECT 09",
  gallipoliDayHeroTitle: "Gallipoli",
  gallipoliDaySubtitle: "Giorno",
  gallipoliDayHeroTagline:
    "Sole sulla pelle, ore larghe — il momento prima che tutto accenda.",
  gallipoliDayInterlude: "Caldo, luce, respiro — l’attesa che precede la notte."
};

/** Gallipoli notte / festival: hero split notturno + galleria a ritmo (project-gallipoli.css). */
var __GALLIPOLI_FESTIVAL_LAYOUT_PATCH__ = {
  layout: "gallipoliFestival",
  title: "Gallipoli - Notte",
  heroImage: "29_gallipoli-personal.webp",
  summary:
    "Festival estivo sul mare: notte, luci, folla e musica — sequenza editoriale.",
  gallipoliProjectLabel: "PROJECT 10",
  gallipoliHeroTagline:
    "Calore, luci sul palco, corpi in movimento — l’estate che non smette.",
  gallipoliInterlude: "Notte al sud — musica, caos controllato."
};

/** Concerti – Ernia: live cinematografico (project-ernia.css). */
var __ERNIA_LIVE_LAYOUT_PATCH__ = {
  layout: "erniaLive",
  title: "Concerti – Ernia",
  heroImage: "29_ernia_gallipoli.webp",
  summary:
    "Live al palco: presenza, luce, pubblico — sequenza editoriale dal concerto.",
  erniaProjectLabel: "PROJECT 11",
  erniaHeroTagline:
    "Microfono, fumo, silenzi tra un verso e l’altro — tensione prima dell’urlo.",
  erniaInterlude:
    "Palco, presenza, energia — lo sguardo del pubblico inchiodato al centro."
};

/** Laurea – Ame: album personale intimo (project-laurea.css). */
var __LAUREA_ALBUM_LAYOUT_PATCH__ = {
  layout: "laureaAlbum",
  title: "Laurea – Ame",
  heroImage: "23_laurea-ame.webp",
  summary:
    "Un giorno misurato su attese brevi, abbracci e piccole attenzioni — il traguardo condiviso con chi conta.",
  laureaProjectLabel: "PROJECT 12",
  laureaHeroTagline:
    "Un passaggio semplice, custodito tra ritratti e gesti — memoria della giornata, senza rumore in più.",
  laureaEditorialBlocks: [
    "La laurea è anche un ritmo: file in attesa, nomi che scorrono, qualche risata nervosa prima dell’uscita in cortile.",
    "Ho cercato di restare vicina a gesti veri — mani che stringono, sguardi che si incrociano, la calma tra un flash e l’altro.",
    "Niente da dimostrare: solo il peso leggero di un traguardo vissuto in famiglia, con la giornata che scivola verso casa."
  ]
};

window.__PORTFOLIO_LAYOUT_PATCH_BY_ID__ = {
  /**
   * Con driveManifestUrl: layout + summary completi (il JSON Drive non li allinea ai data.js).
   */
  florentina: {
    layout: "editorial",
    summary: __FLORENTINA_EDITORIAL_SUMMARY__
  },
  nude: {
    layout: "horizontal-mixed",
    summaryParagraphs: __NUDE_PROJECT_SUMMARY_PARAGRAPHS__
  },
  "anca-edward": {
    layout: "concept",
    locationLine: "Valle d'Aosta, 2025"
  },
  "l-isola": __L_ISOLA_LAYOUT_PATCH__,
  parigi: __PARIGI_LAYOUT_PATCH__,
  "taboo-shooting": __TABOO_SHOOTING_LAYOUT_PATCH__,
  "moda-shooting": __MODA_SHOOTING_LAYOUT_PATCH__,
  "moda-jump": __MODA_JUMP_LAYOUT_PATCH__,
  "gallipoli-day": __GALLIPOLI_DAY_LAYOUT_PATCH__,
  "gallipoli-night": __GALLIPOLI_FESTIVAL_LAYOUT_PATCH__,
  "concerti-ernia": __ERNIA_LIVE_LAYOUT_PATCH__,
  "laurea-ame": __LAUREA_ALBUM_LAYOUT_PATCH__
};
