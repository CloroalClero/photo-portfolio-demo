// Register GSAP plugins
gsap.registerPlugin(CustomEase, Flip);

/** Drift casuale delle card e “formation wave” in griglia (false = griglia ferma). */
const ENABLE_GRID_CARD_DRIFT = false;

/**
 * Breakpoint allineato a style-mobile.css (max-width: 900px).
 * script-mobile.js / script-desktop.js impostano __PF_IS_MOBILE_LAYOUT__ prima del bundle.
 */
function pfMobileLayout() {
  if (typeof window.__PF_IS_MOBILE_LAYOUT__ === "boolean") {
    return window.__PF_IS_MOBILE_LAYOUT__;
  }
  return typeof window.matchMedia === "function"
    ? window.matchMedia("(max-width: 900px)").matches
    : window.innerWidth <= 900;
}

/**
 * Allinea __PORTFOLIO_PROJECTS__ a __PORTFOLIO_PROJECT_ORDER__ (N.1… come da registry).
 * Progetti non listati in ORDER restano in coda (es. voci solo da manifest Drive).
 */
function reorderPortfolioProjectsToCanonicalOrder() {
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
function portfolioProjectDataDir(projectId) {
  const key = String(projectId).replace(/[^a-zA-Z0-9_-]/g, "");
  if (!key) return "";
  const map = window.__PORTFOLIO_PROJECT_PATH_BY_ID__;
  const rel = map && map[key];
  return rel
    ? `portfolio/projects/${rel}`
    : `portfolio/projects/${key}`;
}

class FashionGallery {
  constructor() {
    // DOM elements
    this.viewport = document.getElementById("viewport");
    this.canvasWrapper = document.getElementById("canvasWrapper");
    this.canvasScaleInner = document.getElementById("canvasScaleInner");
    this.gridContainer = document.getElementById("gridContainer");
    this.splitScreenContainer = document.getElementById("splitScreenContainer");
    this.imageTitleOverlay = document.getElementById("imageTitleOverlay");
    this.closeButton = document.getElementById("closeButton");
    this.controlsContainer = document.getElementById("controlsContainer");
    this.soundToggle = document.getElementById("soundToggle");
    this.aboutSection = document.getElementById("about");
    this.aboutNavLink = document.getElementById("aboutNavLink");
    this.projectConceptEl = document.getElementById("projectConceptView");
    this.projectConceptGrid = document.getElementById("projectConceptGrid");
    this.conceptHeroItemData = null;
    this.projectHorizontalEl = document.getElementById("projectHorizontalView");
    this.projectHorizontalTrack = document.getElementById("projectHorizontalTrack");
    this.projectEditorialEl = document.getElementById("projectEditorialView");
    this.projectEditorialLeft = document.getElementById("projectEditorialLeft");
    this.projectEditorialRight = document.getElementById("projectEditorialRight");
    this.projectEditorialMobileGallery =
      document.getElementById("projectEditorialMobileGallery");
    // Create custom eases
    this.customEase = CustomEase.create("smooth", ".87,0,.13,1");
    this.centerEase = CustomEase.create("center", ".25,.46,.45,.94");
    // Configuration
    this.config = {
      itemSize: 320,
      baseGap: 16,
      rows: 8,
      cols: 12,
      currentZoom: 0.6,
      currentGap: 32,
      zoomLevelLocked: true
    };
    // State
    this.zoomState = {
      isActive: false,
      selectedItem: null,
      flipAnimation: null,
      scalingOverlay: null
    };
    this.gridItems = [];
    this.formationWaveTimer = null;
    this.gridDimensions = {};
    this.lastValidPosition = {
      x: 0,
      y: 0
    };
    this.draggable = null;
    this.viewportObserver = null;
    /** Vista serie su mobile: colonna unica, celle larghe (feed) */
    this.mobileProjectFeedActive = false;
    // Initialize sound system
    this.initSoundSystem();
    this.activeProjectId = null;
    // Initialize image data
    this.initImageData();
  }
  initSoundSystem() {
    this.soundSystem = {
      enabled: false,
      sounds: {
        click: new Audio("https://assets.codepen.io/7558/glitch-fx-001.mp3"),
        open: new Audio("https://assets.codepen.io/7558/click-glitch-001.mp3"),
        close: new Audio("https://assets.codepen.io/7558/click-glitch-001.mp3"),
        "zoom-in": new Audio(
          "https://assets.codepen.io/7558/whoosh-fx-001.mp3"
        ),
        "zoom-out": new Audio(
          "https://assets.codepen.io/7558/whoosh-fx-001.mp3"
        ),
        "drag-start": new Audio(
          "https://assets.codepen.io/7558/preloader-2s-001.mp3"
        ),
        "drag-end": new Audio(
          "https://assets.codepen.io/7558/preloader-2s-001.mp3"
        )
      },
      play: (soundName) => {
        if (!this.soundSystem.enabled || !this.soundSystem.sounds[soundName])
          return;
        try {
          const audio = this.soundSystem.sounds[soundName];
          audio.currentTime = 0;
          audio.play().catch(() => {});
        } catch (e) {
          // Silently handle audio errors
        }
      },
      toggle: () => {
        this.soundSystem.enabled = !this.soundSystem.enabled;
        if (this.soundToggle) {
          this.soundToggle.classList.toggle("active", this.soundSystem.enabled);
        }
        // Prevent visual conflicts during sound toggle
        if (this.zoomState.isActive) return;
        if (this.soundSystem.enabled) {
          // Delay sound to prevent flashing during visual updates
          setTimeout(() => {
            this.soundSystem.play("click");
          }, 50);
        }
      }
    };
    // Preload sounds
    Object.values(this.soundSystem.sounds).forEach((audio) => {
      audio.preload = "auto";
      audio.volume = 0.3;
    });
    // Initialize sound wave canvas animation
    this.initSoundWave();
  }
  initSoundWave() {
    const canvas = document.getElementById("soundWaveCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = 32;
    const height = 16;
    const centerY = Math.floor(height / 2);
    let startTime = Date.now();
    let currentAmplitude = this.soundSystem.enabled ? 1 : 0;
    const interpolateColor = (color1, color2, factor) => {
      const r1 = parseInt(color1.substring(1, 3), 16);
      const g1 = parseInt(color1.substring(3, 5), 16);
      const b1 = parseInt(color1.substring(5, 7), 16);
      const r2 = parseInt(color2.substring(1, 3), 16);
      const g2 = parseInt(color2.substring(3, 5), 16);
      const b2 = parseInt(color2.substring(5, 7), 16);
      const r = Math.round(r1 + factor * (r2 - r1))
        .toString(16)
        .padStart(2, "0");
      const g = Math.round(g1 + factor * (g2 - g1))
        .toString(16)
        .padStart(2, "0");
      const b = Math.round(b1 + factor * (b2 - b1))
        .toString(16)
        .padStart(2, "0");
      return `#${r}${g}${b}`;
    };
    const animate = () => {
      const targetAmplitude = this.soundSystem.enabled ? 1 : 0;
      currentAmplitude += (targetAmplitude - currentAmplitude) * 0.08;
      ctx.clearRect(0, 0, width, height);
      const time = (Date.now() - startTime) / 1000;
      const muteFactor = 1 - currentAmplitude;
      const primaryColor = "#2C1B14";
      const accentColor = "#A64B23";
      const muteColor = "#D9C4AA";
      if (!this.soundSystem.enabled && currentAmplitude < 0.01) {
        ctx.fillStyle = muteColor;
        ctx.fillRect(0, centerY, width, 2);
      } else {
        ctx.fillStyle = interpolateColor(primaryColor, muteColor, muteFactor);
        for (let i = 0; i < width; i++) {
          const x = i - width / 2;
          const e = Math.exp((-x * x) / 50);
          const y =
            centerY +
            Math.cos(x * 0.4 - time * 8) * e * height * 0.35 * currentAmplitude;
          ctx.fillRect(i, Math.round(y), 1, 2);
        }
        ctx.fillStyle = interpolateColor(accentColor, muteColor, muteFactor);
        for (let i = 0; i < width; i++) {
          const x = i - width / 2;
          const e = Math.exp((-x * x) / 80);
          const y =
            centerY +
            Math.cos(x * 0.3 - time * 5) * e * height * 0.25 * currentAmplitude;
          ctx.fillRect(i, Math.round(y), 1, 2);
        }
      }
      requestAnimationFrame(animate);
    };
    animate();
  }
  initImageData() {
    this.catalog = [];
    if (
      typeof window !== "undefined" &&
      Array.isArray(window.__PORTFOLIO_PROJECTS__) &&
      window.__PORTFOLIO_PROJECTS__.length > 0
    ) {
      reorderPortfolioProjectsToCanonicalOrder();
    }
    this.useLocalPortfolio =
      typeof window !== "undefined" &&
      Array.isArray(window.__PORTFOLIO_PROJECTS__) &&
      window.__PORTFOLIO_PROJECTS__.length > 0;

    if (this.useLocalPortfolio) {
      window.__PORTFOLIO_PROJECTS__.forEach((project) => {
        const files = project.images || [];
        const n = files.length;
        files.forEach((raw, indexInProject) => {
          const resolved = this.resolvePortfolioImage(project, raw);
          this.catalog.push({
            type: "local",
            projectId: project.id,
            projectTitle: project.title,
            folder: project.folder,
            file: resolved.file,
            url: resolved.url,
            fullImageUrl: resolved.fullImageUrl,
            indexInProject,
            projectImageCount: n
          });
        });
      });
      this.fashionImages = [];
      this.imageData = [];
      return;
    }

    this.fashionImages = [];
    for (let i = 1; i <= 14; i++) {
      const paddedNumber = String(i).padStart(2, "0");
      this.fashionImages.push(
        `https://assets.codepen.io/7558/orange-portrait_${paddedNumber}.jpg`
      );
    }
    this.imageData = [
      {
        number: "01",
        title: "Begin Before You’re Ready",
        description:
          "The work starts when you notice the quiet pull. Breathe once, clear the room inside you, and move one pixel forward."
      },
      {
        number: "02",
        title: "Negative Space, Positive Signal",
        description:
          "Leave room around the idea. In the silence, the design answers back and shows you what to remove."
      },
      {
        number: "03",
        title: "Friction Is a Teacher",
        description:
          "When the line resists, listen. Constraints are coordinates—plot them, then chart a cleaner route."
      },
      {
        number: "04",
        title: "Golden Minute",
        description:
          "Catch the light while it’s honest. One honest frame beats a hundred almosts."
      },
      {
        number: "05",
        title: "Shadow Carries Form",
        description:
          "The dark reveals the edge. Let contrast articulate what you mean but can’t yet say."
      },
      {
        number: "06",
        title: "City Breath",
        description:
          "Steel, glass, heartbeat. Edit until the street’s rhythm fits inside a single grid."
      },
      {
        number: "07",
        title: "Soft Focus, Sharp Intent",
        description:
          "Blur the noise, not the purpose. What matters remains in crisp relief."
      },
      {
        number: "08",
        title: "Time-Tested, Future-Ready",
        description:
          "Classics survive because they serve. Keep the spine, tune the surface, respect the lineage."
      },
      {
        number: "09",
        title: "Grace Under Revision",
        description:
          "Drafts don’t apologize. They evolve. Let elegance emerge through cuts, not flourishes."
      },
      {
        number: "10",
        title: "Style That Outlasts Seasons",
        description:
          "Trends talk. Principles walk. Build on principles and let trends accessorize."
      },
      {
        number: "11",
        title: "Edges and Experiments",
        description:
          "Push just past comfort. Leave a fingerprint the algorithm can’t fake."
      },
      {
        number: "12",
        title: "Portrait of Attention",
        description:
          "Form is what you see. Presence is what you feel. Aim for presence."
      },
      {
        number: "13",
        title: "Light Speaks First",
        description:
          "Expose for truth. Shadows are sentences, highlights the punctuation."
      },
      {
        number: "14",
        title: "Contemporary Is a Moving Target",
        description:
          "Design for now by listening deeper than now. The signal is older than the feed."
      },
      {
        number: "15",
        title: "Vision, Then Precision",
        description:
          "Dream wide, ship tight. Let imagination roam and execution walk in single-point focus."
      },
      {
        number: "16",
        title: "Geometry of Poise",
        description:
          "Angles carry attitude. Align posture, light, and line until the frame breathes."
      },
      {
        number: "17",
        title: "Natural Light, Natural Truth",
        description:
          "Open the window and remove the mask. Authenticity needs less wattage, more honesty."
      },
      {
        number: "18",
        title: "Studio: The Controlled Wild",
        description:
          "Dial every knob, then listen for the unscripted moment. Keep the lens ready."
      },
      {
        number: "19",
        title: "Invent the Angle",
        description:
          "Rotate the problem ninety degrees. Fresh perspective isn’t luck—it’s a habit."
      },
      {
        number: "20",
        title: "Editorial Nerve",
        description:
          "Carry yourself like you belong, then earn it with craft. The camera can tell."
      },
      {
        number: "21",
        title: "Profession Is Practice",
        description:
          "Repeat the fundamentals until they disappear. Mastery is subtle on purpose."
      },
      {
        number: "22",
        title: "Final Frame, Open Door",
        description:
          "Endings are launchpads. Archive the take, thank the light, and start again at one."
      }
    ];
  }
  /** Prefisso opzionale per asset statici (vedi __PORTFOLIO_CONFIG__.basePath nel README). */
  getPortfolioAssetBase() {
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const raw =
      cfg.basePath != null
        ? cfg.basePath
        : typeof window !== "undefined"
          ? window.__PORTFOLIO_BASE_PATH__
          : "";
    if (raw == null || String(raw).trim() === "") return "";
    let s = String(raw).trim().replace(/\\/g, "/");
    if (!s.endsWith("/")) s += "/";
    return s;
  }
  mediaProjectUrl(folder, file) {
    const base = this.getPortfolioAssetBase();
    const path = `media/projects/${folder}/${file}`;
    return base ? `${base}${path}` : path;
  }
  /**
   * Local: raw è il nome file (string) o { file: "nome.jpg" }.
   * Google Drive: imposta window.__PORTFOLIO_CONFIG__.imagesFrom = "drive" e metti in images
   * l’ID file (string) o { driveId: "ID", file: "etichetta.jpg" } nello stesso ordine dei file locali.
   */
  resolvePortfolioImage(project, raw) {
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const from = cfg.imagesFrom || "local";

    if (from === "drive") {
      const id =
        typeof raw === "string"
          ? raw.trim()
          : (raw && (raw.driveId || raw.id || raw.fileId)) || "";
      const file =
        typeof raw === "object" && raw && raw.file
          ? raw.file
          : `img-${(id || "x").slice(0, 8)}`;
      const enc = id ? encodeURIComponent(id) : "";
      const thumbTpl =
        cfg.driveThumbnailTemplate ||
        "https://drive.google.com/thumbnail?id={id}&sz=w1200";
      const fullTpl =
        cfg.driveFullTemplate ||
        (cfg.driveUrlTemplate
          ? cfg.driveUrlTemplate
          : "https://drive.google.com/thumbnail?id={id}&sz=w3840");
      const fullImageUrl = enc ? fullTpl.split("{id}").join(enc) : "";
      const useThumb = cfg.useThumbnailsInGrid !== false;
      const url =
        enc && useThumb
          ? thumbTpl.split("{id}").join(enc)
          : fullImageUrl;
      return { url, fullImageUrl: fullImageUrl || url, file };
    }

    const file = typeof raw === "string" ? raw : raw && raw.file;
    const url = this.mediaProjectUrl(project.folder, file);
    return { url, fullImageUrl: url, file };
  }
  /** GSAP scale/translate: sul nodo interno se c’è, altrimenti sul wrapper (retrocompatibile). */
  getCanvasTransformTarget() {
    return this.canvasScaleInner || this.canvasWrapper;
  }
  /**
   * Mobile + progetto: wrapper = dimensioni già moltiplicate per zoom (box visivo),
   * inner = griglia logica; così margin:auto centra davvero le foto, non un rettangolo vuoto.
   */
  applyCanvasLayoutSizing() {
    if (!this.canvasWrapper || this.gridDimensions.width == null) return;
    const gw = this.gridDimensions.width;
    const gh = this.gridDimensions.height;
    const z = this.config.currentZoom;
    const mobileProj = this.isMobileProjectCanvasScrollLayout();

    if (this.canvasScaleInner) {
      this.canvasScaleInner.style.width = `${gw}px`;
      this.canvasScaleInner.style.height = `${gh}px`;
    }
    if (this.canvasScaleInner && mobileProj) {
      this.canvasWrapper.style.width = `${gw * z}px`;
      this.canvasWrapper.style.height = `${gh * z}px`;
    } else {
      this.canvasWrapper.style.width = `${gw}px`;
      this.canvasWrapper.style.height = `${gh}px`;
    }
  }
  getDisplayItems() {
    if (!this.useLocalPortfolio) return [];
    if (!this.activeProjectId) return this.catalog;
    const pid = String(this.activeProjectId);
    return this.catalog.filter((e) => String(e.projectId) === pid);
  }
  /** Mobile + griglia standard progetto: layout a colonna (no concept / NUDE strip). */
  mobileProjectFeedContext() {
    return (
      this.useLocalPortfolio &&
      this.isProjectFilterActive() &&
      !this.isProjectConceptLayoutActive() &&
      !this.isProjectHorizontalMixedActive() &&
      pfMobileLayout()
    );
  }
  getMobileFeedCellSize() {
    const vw = typeof window !== "undefined" ? window.innerWidth : 400;
    const pad = 28;
    return Math.max(300, Math.min(560, Math.round(vw - pad * 2)));
  }
  layoutCellSize() {
    return this.mobileProjectFeedActive
      ? this.getMobileFeedCellSize()
      : this.config.itemSize;
  }
  swapProjectMobileStylesheet(projectId) {
    document
      .querySelectorAll("link[data-project-mobile-css]")
      .forEach((el) => el.remove());
    if (!projectId || !pfMobileLayout()) return;
    const id = String(projectId).replace(/[^a-zA-Z0-9_-]/g, "");
    if (!id) return;
    const base = portfolioProjectDataDir(projectId);
    if (!base) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${base}/mobile.css`;
    link.setAttribute("data-project-mobile-css", id);
    link.onerror = () => link.remove();
    document.head.appendChild(link);
  }
  getDisplayItemsForGrid() {
    if (this.useLocalPortfolio) {
      const list = this.getDisplayItems();
      if (this.isProjectFilterActive()) {
        const sorted = [...list].sort(
          (a, b) => (a.indexInProject ?? 0) - (b.indexInProject ?? 0)
        );
        const n = sorted.length;
        this.mobileProjectFeedActive = this.mobileProjectFeedContext();
        if (this.mobileProjectFeedActive) {
          this.config.cols = 1;
        } else {
          this.config.cols = this.getProjectViewColumnCount(n);
        }
        if (
          !this.isProjectConceptLayoutActive() &&
          !this.isProjectHorizontalMixedActive()
        ) {
          const { rows } = this.computeGridPlacementsProject(
            sorted,
            this.config.cols
          );
          this.config.currentZoom = this.computeProjectViewFitZoom(
            this.config.cols,
            rows
          );
        }
        this.config.rows = Math.max(1, Math.ceil(n / this.config.cols) || 1);
        return sorted;
      }
      this.config.currentZoom = 0.6;
      this.config.cols = 12;
      this.config.rows = Math.max(
        1,
        Math.ceil(list.length / this.config.cols)
      );
      return list;
    }
    this.config.rows = 8;
    this.config.cols = 12;
    const len = this.config.rows * this.config.cols;
    return Array.from({ length: len }, (_, i) => ({
      type: "remote",
      url: this.fashionImages[i % this.fashionImages.length],
      overlayIndex: i
    }));
  }
  shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  /**
   * Pixel width/height di una card che occupa spanCols×spanRows celle (gap tra celle incluso).
   */
  getItemSpanPixels(spanCols, spanRows, gap = this.config.currentGap) {
    const s = this.layoutCellSize();
    return {
      w: spanCols * s + (spanCols - 1) * gap,
      h: spanRows * s + (spanRows - 1) * gap
    };
  }
  applyItemLayoutMetrics(itemData, gap = this.config.currentGap) {
    const sc = itemData.spanCols || 1;
    const sr = itemData.spanRows || 1;
    const { w, h } = this.getItemSpanPixels(sc, sr, gap);
    const s = this.layoutCellSize();
    itemData.pixelWidth = w;
    itemData.pixelHeight = h;
    itemData.baseX = itemData.col * (s + gap);
    itemData.baseY = itemData.row * (s + gap);
    const el = itemData.element;
    if (el) {
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
    }
  }
  /**
   * Colonne per vista singola serie: adatta a viewport e numero di immagini (griglia compatta).
   */
  getProjectViewColumnCount(n) {
    if (n <= 1) return 1;
    const vw =
      typeof window !== "undefined" ? window.innerWidth : 1100;
    const s = this.config.itemSize;
    /* Stima colonne senza dipendere dallo zoom attuale: assume zoom fit ~0.28–0.45 su mobile. */
    const refZ = 0.38;
    const gap = this.calculateGapForZoom(refZ);
    const cellScreen = (s + gap) * refZ;
    const maxByViewport = Math.max(
      1,
      Math.min(10, Math.floor((vw * 0.92) / Math.max(1, cellScreen)))
    );
    const byCount =
      n <= 4 ? Math.min(n, 2) : n <= 9 ? 3 : n <= 16 ? 4 : n <= 25 ? 5 : 6;
    const bySqrt = Math.ceil(Math.sqrt(n * 1.2));
    let cols = Math.min(
      n,
      maxByViewport,
      Math.max(1, Math.max(byCount, Math.min(bySqrt, 8)))
    );
    /* Desktop largo: preferisci aside (≥4 col) se entra in viewport stimata a zoom moderato. */
    const refZDesk = 0.58;
    const gapD = this.calculateGapForZoom(refZDesk);
    const maxDesk = Math.max(
      1,
      Math.min(10, Math.floor((vw * 0.92) / ((s + gapD) * refZDesk)))
    );
    if (cols === 3 && maxDesk >= 4 && n >= 4) {
      cols = 4;
    }
    /* Mobile: più colonne = meno righe → griglia che entra meglio in altezza (scroll orizz. se serve). */
    if (vw <= 640 && n >= 8) {
      cols = Math.max(cols, Math.min(4, maxByViewport, n));
    }
    return cols;
  }
  /**
   * Zoom iniziale in vista singolo progetto (griglia standard) così lead + blurb + thumbs entrano nel viewport.
   */
  computeProjectViewFitZoom(cols, rows) {
    const c = Math.max(1, cols);
    const r = Math.max(1, rows);
    const vw =
      typeof window !== "undefined" ? window.innerWidth : 1100;
    let vh =
      typeof window !== "undefined" ? window.innerHeight : 800;
    if (typeof window !== "undefined" && window.visualViewport) {
      vh = window.visualViewport.height;
    }
    const s = this.layoutCellSize();
    const marginX = 24;
    const chromeY = vw < 700 ? 100 : 88;
    const availW = Math.max(200, vw - marginX * 2);
    const availH = Math.max(220, vh - chromeY);
    const isNarrow = pfMobileLayout();
    const candidates = [
      0.92, 0.86, 0.8, 0.74, 0.68, 0.64, 0.6, 0.56, 0.52, 0.48, 0.44, 0.4,
      0.38, 0.36, 0.34, 0.32, 0.3, 0.28, 0.26, 0.24, 0.22, 0.2, 0.18, 0.16
    ];
    let bestZ = 0.16;
    for (let i = 0; i < candidates.length; i++) {
      const z = candidates[i];
      const g = this.calculateGapForZoom(z);
      const gw = c * (s + g) - g;
      const gh = r * (s + g) - g;
      if (gw * z > availW) continue;
      if (!isNarrow && gh * z > availH) continue;
      bestZ = z;
      break;
    }
    let out = Math.max(isNarrow ? 0.28 : 0.2, Math.min(0.95, bestZ));
    if (this.mobileProjectFeedActive) {
      const g0 = this.calculateGapForZoom(out);
      const gw = c * (s + g0) - g0;
      if (gw > 0 && gw <= availW + 1) {
        const zFitW = availW / gw;
        out = Math.min(1, Math.max(out, Math.min(zFitW, 1)));
      }
    }
    return out;
  }
  /**
   * Testo breve serie: campo `summary` nel record progetto (vedi portfolio/projects/README.md),
   * oppure `blurb` opzionale se `summary` è vuoto.
   */
  getProjectSummaryText(projectId) {
    const list = window.__PORTFOLIO_PROJECTS__;
    const p = Array.isArray(list)
      ? list.find((x) => String(x.id) === String(projectId))
      : null;
    if (!p) return "";
    if (typeof p.summary === "string" && p.summary.trim()) {
      return p.summary.trim();
    }
    if (typeof p.blurb === "string" && p.blurb.trim()) {
      return p.blurb.trim();
    }
    return "";
  }
  /**
   * Vista progetto: copertina 2×2 + testo; composizione adattiva per colonne (niente colonna testo da 1 cella stretta).
   * — ≥4 col: foto | testo affiancato (testo ≥2 celle).
   * — 3 col: foto 2×2 + fascia testo sotto 3×2 (leggibilità).
   * — 2 col: pila 2×2 + 2×2 (simmetria con la copertina).
   * — 1 col: verticale 1×2 + 1×2 testo.
   */
  computeGridPlacementsProject(items, cols) {
    const c = Math.max(1, cols);
    const placements = [];
    if (!items.length) {
      return { rows: 1, placements: [] };
    }
    const projectId = items[0].projectId;
    if (this.mobileProjectFeedActive && c === 1) {
      return this.computeGridPlacementsProjectMobileFeed(items, projectId);
    }
    const projRec = (window.__PORTFOLIO_PROJECTS__ || []).find(
      (p) => String(p.id) === String(projectId)
    );
    const rawBlurbRows =
      projRec && typeof projRec.blurbSpanRows === "number"
        ? projRec.blurbSpanRows
        : 2;
    const blurbSpanRows = Math.min(8, Math.max(2, Math.floor(rawBlurbRows)));
    const rest = items.slice(1);
    let contentStartRow = 0;

    if (c >= 4) {
      placements.push({
        kind: "lead",
        entry: items[0],
        row: 0,
        col: 0,
        spanCols: 2,
        spanRows: 2
      });
      placements.push({
        kind: "blurb",
        projectId,
        blurbLayout: "aside",
        row: 0,
        col: 2,
        spanCols: c - 2,
        spanRows: blurbSpanRows
      });
      contentStartRow = Math.max(2, blurbSpanRows);
    } else if (c === 3) {
      placements.push({
        kind: "lead",
        entry: items[0],
        row: 0,
        col: 0,
        spanCols: 2,
        spanRows: 2
      });
      placements.push({
        kind: "blurb",
        projectId,
        blurbLayout: "band",
        row: 2,
        col: 0,
        spanCols: 3,
        spanRows: blurbSpanRows
      });
      contentStartRow = 2 + blurbSpanRows;
    } else if (c === 2) {
      placements.push({
        kind: "lead",
        entry: items[0],
        row: 0,
        col: 0,
        spanCols: 2,
        spanRows: 2
      });
      placements.push({
        kind: "blurb",
        projectId,
        blurbLayout: "stack",
        row: 2,
        col: 0,
        spanCols: 2,
        spanRows: blurbSpanRows
      });
      contentStartRow = 2 + blurbSpanRows;
    } else {
      placements.push({
        kind: "lead",
        entry: items[0],
        row: 0,
        col: 0,
        spanCols: 1,
        spanRows: 2
      });
      placements.push({
        kind: "blurb",
        projectId,
        blurbLayout: "stack",
        row: 2,
        col: 0,
        spanCols: 1,
        spanRows: blurbSpanRows
      });
      contentStartRow = 2 + blurbSpanRows;
    }

    for (let i = 0; i < rest.length; i++) {
      const row = contentStartRow + Math.floor(i / c);
      const col = i % c;
      placements.push({
        kind: "thumb",
        entry: rest[i],
        row,
        col,
        spanCols: 1,
        spanRows: 1
      });
    }

    let maxBottomRow = 0;
    for (const p of placements) {
      maxBottomRow = Math.max(maxBottomRow, p.row + p.spanRows);
    }
    return { rows: Math.max(1, maxBottomRow), placements };
  }
  /**
   * Mobile feed: copertina alta, blurb a fascia, poi thumbs a colonna (stessa logica celle, cols=1).
   */
  computeGridPlacementsProjectMobileFeed(items, projectId) {
    const placements = [];
    const rest = items.slice(1);
    placements.push({
      kind: "lead",
      entry: items[0],
      row: 0,
      col: 0,
      spanCols: 1,
      spanRows: 2
    });
    placements.push({
      kind: "blurb",
      projectId,
      blurbLayout: "band",
      row: 2,
      col: 0,
      spanCols: 1,
      spanRows: 2
    });
    const contentStartRow = 4;
    for (let i = 0; i < rest.length; i++) {
      placements.push({
        kind: "thumb",
        entry: rest[i],
        row: contentStartRow + i,
        col: 0,
        spanCols: 1,
        spanRows: 1
      });
    }
    let maxBottomRow = 0;
    for (const p of placements) {
      maxBottomRow = Math.max(maxBottomRow, p.row + p.spanRows);
    }
    return { rows: Math.max(1, maxBottomRow), placements };
  }
  /**
   * Posiziona le card su una griglia; alcune sono 2×2 celle (~4× area) in modo casuale.
   */
  computeGridPlacements(items) {
    const cols = this.config.cols;
    const occupied = new Set();
    const key = (r, c) => `${r},${c}`;
    const isFree = (r, c, w, h) => {
      if (c + w > cols) return false;
      for (let dr = 0; dr < h; dr++) {
        for (let dc = 0; dc < w; dc++) {
          if (occupied.has(key(r + dr, c + dc))) return false;
        }
      }
      return true;
    };
    const mark = (r, c, w, h) => {
      for (let dr = 0; dr < h; dr++) {
        for (let dc = 0; dc < w; dc++) {
          occupied.add(key(r + dr, c + dc));
        }
      }
    };
    const placements = [];
    let maxBottomRow = 0;
    const maxScanRows = Math.max(
      Math.ceil(items.length / cols) * 4 + 16,
      cols * 6
    );
    const largeChance = 0.11;

    for (const entry of items) {
      const wantLarge = Math.random() < largeChance;
      let placed = false;
      for (let r = 0; r < maxScanRows && !placed; r++) {
        for (let c = 0; c < cols && !placed; c++) {
          if (wantLarge && isFree(r, c, 2, 2)) {
            mark(r, c, 2, 2);
            placements.push({
              entry,
              row: r,
              col: c,
              spanCols: 2,
              spanRows: 2
            });
            maxBottomRow = Math.max(maxBottomRow, r + 2);
            placed = true;
          } else if (isFree(r, c, 1, 1)) {
            mark(r, c, 1, 1);
            placements.push({
              entry,
              row: r,
              col: c,
              spanCols: 1,
              spanRows: 1
            });
            maxBottomRow = Math.max(maxBottomRow, r + 1);
            placed = true;
          }
        }
      }
    }

    return { rows: Math.max(1, maxBottomRow), placements };
  }
  buildOverlayMeta(entry) {
    if (entry.type === "remote") {
      const data =
        this.imageData[entry.overlayIndex % this.imageData.length];
      return {
        number: data.number,
        title: data.title,
        description: data.description
      };
    }
    const num = String(entry.indexInProject + 1).padStart(2, "0");
    const blurb =
      this.getProjectSummaryText(entry.projectId) || "Serie fotografica.";
    const description = `${blurb} · ${entry.indexInProject + 1} di ${entry.projectImageCount}`;
    return {
      number: num,
      title: entry.projectTitle,
      description
    };
  }
  closeHeaderPanels() {
    document.querySelectorAll("details.header-panel").forEach((d) => {
      d.open = false;
    });
  }
  /** Una singola serie selezionata: niente drift né formation sulle card. */
  projectOrdinalInPortfolio(projectId) {
    const key = String(projectId);
    const map = window.__PORTFOLIO_PROJECT_ORDINAL_BY_ID__;
    if (map && map[key] != null) return map[key];
    const list = window.__PORTFOLIO_PROJECTS__;
    if (!Array.isArray(list)) return 1;
    const idx = list.findIndex((p) => String(p.id) === key);
    return idx >= 0 ? idx + 1 : 1;
  }
  projectConceptMetaLine(entry) {
    const list = window.__PORTFOLIO_PROJECTS__;
    const p = Array.isArray(list)
      ? list.find((x) => String(x.id) === String(entry.projectId))
      : null;
    if (p && p.locationLine) return p.locationLine;
    return String(new Date().getFullYear());
  }
  teardownProjectConceptView() {
    document.body.classList.remove("project-concept-active");
    this.conceptHeroItemData = null;
    const root = this.projectConceptEl;
    if (root) {
      root.hidden = true;
      root.setAttribute("hidden", "");
      root.setAttribute("aria-hidden", "true");
    }
    if (this.projectConceptGrid) this.projectConceptGrid.innerHTML = "";
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "visible", pointerEvents: "auto" });
    }
  }
  appendConceptGridCard(gridEl, entry, variant, itemIndex) {
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `project-concept__card project-concept__card--${variant}`;
    const img = document.createElement("img");
    img.decoding = "async";
    if (driveImages) img.referrerPolicy = "no-referrer";
    const slides = this.buildSlideshowSlides(entry);
    const slide0 = slides[0];
    img.src = slide0.url;
    img.alt = slide0.alt;
    img.loading = "lazy";
    btn.appendChild(img);
    gridEl.appendChild(btn);
    const itemData = {
      element: btn,
      img,
      slideViewport: btn,
      slideTrack: null,
      slideshowSlides: slides,
      currentSlideIndex: 0,
      slideDelay: null,
      slideTween: null,
      slideshowPaused: true,
      slidePauseMul: 1,
      slideSpeedMul: 1,
      slideChaos: 0,
      slideshowResumeStaggerDone: true,
      driftTween: null,
      driftDelay: null,
      driftSuspended: true,
      driftFormationIdle: true,
      driftGridX: 0,
      driftGridY: 0,
      row: 0,
      col: 0,
      spanCols: 1,
      spanRows: 1,
      baseX: 0,
      baseY: 0,
      imageUrl: slide0.url,
      fullImageUrl: slide0.fullImageUrl,
      index: itemIndex,
      overlayMeta: this.buildOverlayMeta(
        slide0.catalogEntry ||
          (entry.type === "remote"
            ? {
                type: "remote",
                overlayIndex:
                  slide0.overlayIndex ?? entry.overlayIndex ?? itemIndex
              }
            : entry)
      )
    };
    this.gridItems.push(itemData);
  }
  buildProjectConceptView() {
    const root = this.projectConceptEl;
    const grid = this.projectConceptGrid;
    const heroImg = document.getElementById("projectConceptHeroImg");
    const heroBtn = document.getElementById("projectConceptHeroBtn");
    if (!root || !grid || !heroImg || !heroBtn) return;

    this.gridContainer.innerHTML = "";
    this.gridItems = [];
    this.conceptHeroItemData = null;

    const rawItems = this.getDisplayItemsForGrid();
    const entries = [...rawItems].sort(
      (a, b) => (a.indexInProject ?? 0) - (b.indexInProject ?? 0)
    );

    root.hidden = false;
    root.removeAttribute("hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-concept-active");
    gsap.set(this.viewport, { visibility: "hidden", pointerEvents: "none" });

    if (!entries.length) {
      heroImg.removeAttribute("src");
      return;
    }

    const first = entries[0];
    const slides0 = this.buildSlideshowSlides(first);
    const s0 = slides0[0];
    heroImg.src = s0.url;
    heroImg.alt = s0.alt;
    heroImg.loading = "eager";

    const numEl = document.getElementById("projectConceptNum");
    const nameEl = document.getElementById("projectConceptName");
    const metaEl = document.getElementById("projectConceptMeta");
    const ord = this.projectOrdinalInPortfolio(first.projectId);
    if (numEl) numEl.textContent = `N.${ord}`;
    if (nameEl) nameEl.textContent = (first.projectTitle || "").toUpperCase();
    if (metaEl) metaEl.textContent = this.projectConceptMetaLine(first);
    const sumEl = document.getElementById("projectConceptSummary");
    if (sumEl) {
      const st = this.getProjectSummaryText(first.projectId);
      sumEl.textContent = st;
      sumEl.hidden = !st;
    }

    this.conceptHeroItemData = {
      element: heroBtn,
      img: heroImg,
      slideViewport: heroBtn,
      slideTrack: null,
      slideshowSlides: slides0,
      currentSlideIndex: 0,
      slideDelay: null,
      slideTween: null,
      slideshowPaused: true,
      slidePauseMul: 1,
      slideSpeedMul: 1,
      slideChaos: 0,
      slideshowResumeStaggerDone: true,
      driftTween: null,
      driftDelay: null,
      driftSuspended: true,
      driftFormationIdle: true,
      driftGridX: 0,
      driftGridY: 0,
      row: 0,
      col: 0,
      spanCols: 1,
      spanRows: 1,
      baseX: 0,
      baseY: 0,
      imageUrl: s0.url,
      fullImageUrl: s0.fullImageUrl,
      index: 0,
      overlayMeta: this.buildOverlayMeta(
        s0.catalogEntry ||
          (first.type === "remote"
            ? { type: "remote", overlayIndex: first.overlayIndex ?? 0 }
            : first)
      )
    };

    const rest = entries.slice(1);
    let gi = 0;
    const portraitN = Math.min(6, rest.length);
    for (let i = 0; i < portraitN; i++) {
      this.appendConceptGridCard(grid, rest[i], "portrait", gi++);
    }
    let j = portraitN;
    while (j + 1 < rest.length) {
      this.appendConceptGridCard(grid, rest[j], "landscape", gi++);
      this.appendConceptGridCard(grid, rest[j + 1], "landscape", gi++);
      j += 2;
    }
    if (j < rest.length) {
      this.appendConceptGridCard(grid, rest[j], "landscape-wide", gi++);
    }
  }
  isProjectFilterActive() {
    return (
      this.useLocalPortfolio &&
      this.activeProjectId != null &&
      String(this.activeProjectId).length > 0
    );
  }
  /**
   * Mobile + vista griglia progetto: il viewport centra il wrapper con flex/margin;
   * GSAP x/y sul nodo scalato devono restare 0 (altrimenti si somma un offset da “absolute center”).
   */
  isMobileProjectCanvasScrollLayout() {
    if (!this.isProjectFilterActive()) return false;
    if (this.zoomState.isActive) return false;
    if (this.isProjectConceptLayoutActive()) return false;
    if (this.isProjectHorizontalMixedActive()) return false;
    if (this.isProjectEditorialLayoutActive()) return false;
    if (typeof window === "undefined") return false;
    return pfMobileLayout();
  }
  /** Solo progetti con `layout: "concept"` in __PORTFOLIO_PROJECTS__ (es. Anca & Edward). */
  getActiveProjectRecord() {
    if (!this.isProjectFilterActive()) return null;
    const list = window.__PORTFOLIO_PROJECTS__;
    if (!Array.isArray(list)) return null;
    return (
      list.find((p) => String(p.id) === String(this.activeProjectId)) || null
    );
  }
  isProjectConceptLayoutActive() {
    const p = this.getActiveProjectRecord();
    return !!(p && p.layout === "concept");
  }
  /** NUDE: fascia orizzontale scorrevole con card 1×1 e 4×4. */
  isProjectHorizontalMixedActive() {
    const p = this.getActiveProjectRecord();
    if (!p) return false;
    if (p.layout === "horizontal-mixed") return true;
    return String(p.id) === "nude";
  }
  /** Pagina progetto: titolo grande + testo + foto su due colonne laterali (desktop). */
  isProjectEditorialLayoutActive() {
    const p = this.getActiveProjectRecord();
    return !!(p && p.layout === "editorial");
  }
  teardownProjectEditorialView() {
    document.body.classList.remove("project-editorial-active");
    const root = this.projectEditorialEl;
    if (root) {
      root.hidden = true;
      root.setAttribute("hidden", "");
      root.setAttribute("aria-hidden", "true");
    }
    if (this.projectEditorialLeft) this.projectEditorialLeft.innerHTML = "";
    if (this.projectEditorialRight) this.projectEditorialRight.innerHTML = "";
    if (this.projectEditorialMobileGallery) {
      this.projectEditorialMobileGallery.innerHTML = "";
      this.projectEditorialMobileGallery.hidden = true;
    }
    const art = document.getElementById("projectEditorialArticle");
    if (art) art.innerHTML = "";
    const fin = document.getElementById("projectEditorialFinale");
    if (fin) fin.innerHTML = "";
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "visible", pointerEvents: "auto" });
    }
  }
  pickEditorialCardVariant(index, total) {
    if (total <= 0) return "portrait";
    const portraitN = Math.min(6, total);
    if (index < portraitN) return "portrait";
    const offset = index - portraitN;
    if (offset % 2 === 0 && index + 1 < total) return "landscape";
    return "landscape-wide";
  }
  appendEditorialCard(containerEl, entry, variant, itemIndex) {
    if (!containerEl) return;
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `project-editorial__card project-editorial__card--${variant}`;
    const img = document.createElement("img");
    img.decoding = "async";
    if (driveImages) img.referrerPolicy = "no-referrer";
    const slides = this.buildSlideshowSlides(entry);
    const slide0 = slides[0];
    img.src = slide0.url;
    img.alt = slide0.alt;
    img.loading = variant === "finale" ? "eager" : "lazy";
    btn.appendChild(img);
    containerEl.appendChild(btn);
    const itemData = {
      element: btn,
      img,
      slideViewport: btn,
      slideTrack: null,
      slideshowSlides: slides,
      currentSlideIndex: 0,
      slideDelay: null,
      slideTween: null,
      slideshowPaused: true,
      slidePauseMul: 1,
      slideSpeedMul: 1,
      slideChaos: 0,
      slideshowResumeStaggerDone: true,
      driftTween: null,
      driftDelay: null,
      driftSuspended: true,
      driftFormationIdle: true,
      driftGridX: 0,
      driftGridY: 0,
      row: 0,
      col: 0,
      spanCols: 1,
      spanRows: 1,
      baseX: 0,
      baseY: 0,
      imageUrl: slide0.url,
      fullImageUrl: slide0.fullImageUrl,
      index: itemIndex,
      overlayMeta: this.buildOverlayMeta(
        slide0.catalogEntry ||
          (entry.type === "remote"
            ? {
                type: "remote",
                overlayIndex:
                  slide0.overlayIndex ?? entry.overlayIndex ?? itemIndex
              }
            : entry)
      )
    };
    this.gridItems.push(itemData);
  }
  buildProjectEditorialView() {
    const root = this.projectEditorialEl;
    const left = this.projectEditorialLeft;
    const right = this.projectEditorialRight;
    const mobileGal = this.projectEditorialMobileGallery;
    const kickerEl = document.getElementById("projectEditorialKicker");
    const titleEl = document.getElementById("projectEditorialTitle");
    const articleEl = document.getElementById("projectEditorialArticle");
    if (!root || !articleEl) return;

    this.gridContainer.innerHTML = "";
    this.gridItems = [];

    const rawItems = this.getDisplayItemsForGrid();
    const entries = [...rawItems].sort(
      (a, b) => (a.indexInProject ?? 0) - (b.indexInProject ?? 0)
    );
    const rec = this.getActiveProjectRecord();
    const pid = entries[0]?.projectId;
    const ord = pid != null ? this.projectOrdinalInPortfolio(pid) : 1;
    if (kickerEl) kickerEl.textContent = `N.${ord}`;
    if (titleEl) titleEl.textContent = rec?.title || "";
    const summary = pid != null ? this.getProjectSummaryText(pid) : "";
    articleEl.innerHTML = "";
    const paras = summary
      .split(/\n\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const blocks = paras.length ? paras : [summary.trim()].filter(Boolean);
    blocks.forEach((para, idx) => {
      const p = document.createElement("p");
      p.className = "project-editorial__p";
      if (idx > 0) p.classList.add("project-editorial__p--after");
      p.textContent = para;
      articleEl.appendChild(p);
    });

    if (left) left.innerHTML = "";
    if (right) right.innerHTML = "";
    if (mobileGal) {
      mobileGal.innerHTML = "";
      mobileGal.hidden = pfMobileLayout() ? false : true;
    }
    const finaleEl = document.getElementById("projectEditorialFinale");
    if (finaleEl) finaleEl.innerHTML = "";

    const n = entries.length;
    const useMobile = pfMobileLayout();
    const finaleSeparate = n > 1;
    const stripCount = finaleSeparate ? n - 1 : 0;

    for (let i = 0; i < stripCount; i++) {
      const v = this.pickEditorialCardVariant(i, stripCount);
      const target = useMobile
        ? mobileGal
        : i % 2 === 0
          ? left
          : right;
      if (target) this.appendEditorialCard(target, entries[i], v, i);
    }

    if (finaleEl && n > 0) {
      const last = entries[n - 1];
      const lastIdx = n - 1;
      this.appendEditorialCard(finaleEl, last, "finale", lastIdx);
    }

    root.hidden = false;
    root.removeAttribute("hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-editorial-active");
    gsap.set(this.viewport, { visibility: "hidden", pointerEvents: "none" });
  }
  teardownProjectHorizontalView() {
    document.body.classList.remove("project-horizontal-active");
    const root = this.projectHorizontalEl;
    if (root) {
      root.hidden = true;
      root.setAttribute("hidden", "");
      root.setAttribute("aria-hidden", "true");
    }
    if (this.projectHorizontalTrack) this.projectHorizontalTrack.innerHTML = "";
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "visible", pointerEvents: "auto" });
    }
  }
  pickHorizontalMosaicSize(index, total) {
    if (total <= 1) return "4x4";
    if (total === 2) return index === 0 ? "4x4" : "1x1";
    if (index === 0) return "4x4";
    const r = (index * 5 + total * 3) % 13;
    if (r === 0 || r === 3 || r === 7 || r === 11) return "4x4";
    return "1x1";
  }
  appendHorizontalCard(trackEl, entry, sizeClass, itemIndex) {
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `project-h-card project-h-card--${sizeClass}`;
    const img = document.createElement("img");
    img.decoding = "async";
    if (driveImages) img.referrerPolicy = "no-referrer";
    const slides = this.buildSlideshowSlides(entry);
    const slide0 = slides[0];
    img.src = slide0.url;
    img.alt = slide0.alt;
    img.loading = itemIndex < 6 ? "eager" : "lazy";
    btn.appendChild(img);
    trackEl.appendChild(btn);
    const itemData = {
      element: btn,
      img,
      slideViewport: btn,
      slideTrack: null,
      slideshowSlides: slides,
      currentSlideIndex: 0,
      slideDelay: null,
      slideTween: null,
      slideshowPaused: true,
      slidePauseMul: 1,
      slideSpeedMul: 1,
      slideChaos: 0,
      slideshowResumeStaggerDone: true,
      driftTween: null,
      driftDelay: null,
      driftSuspended: true,
      driftFormationIdle: true,
      driftGridX: 0,
      driftGridY: 0,
      row: 0,
      col: 0,
      spanCols: 1,
      spanRows: 1,
      baseX: 0,
      baseY: 0,
      imageUrl: slide0.url,
      fullImageUrl: slide0.fullImageUrl,
      index: itemIndex,
      overlayMeta: this.buildOverlayMeta(
        slide0.catalogEntry ||
          (entry.type === "remote"
            ? {
                type: "remote",
                overlayIndex:
                  slide0.overlayIndex ?? entry.overlayIndex ?? itemIndex
              }
            : entry)
      )
    };
    this.gridItems.push(itemData);
  }
  buildProjectHorizontalView() {
    const root = this.projectHorizontalEl;
    const track = this.projectHorizontalTrack;
    if (!root || !track) return;

    this.gridContainer.innerHTML = "";
    this.gridItems = [];

    const rawItems = this.getDisplayItemsForGrid();
    const entries = [...rawItems].sort(
      (a, b) => (a.indexInProject ?? 0) - (b.indexInProject ?? 0)
    );

    root.hidden = false;
    root.removeAttribute("hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-horizontal-active");
    gsap.set(this.viewport, { visibility: "hidden", pointerEvents: "none" });

    const kickerEl = document.getElementById("projectHorizontalKicker");
    const titleEl = document.getElementById("projectHorizontalTitle");
    const summaryEl = document.getElementById("projectHorizontalSummary");
    const rec = this.getActiveProjectRecord();
    const pid = entries[0]?.projectId;
    const ord = pid != null ? this.projectOrdinalInPortfolio(pid) : 3;
    if (kickerEl) kickerEl.textContent = `N.${ord}`;
    if (titleEl) titleEl.textContent = rec?.title || "";
    if (summaryEl) {
      const s = pid != null ? this.getProjectSummaryText(pid) : "";
      summaryEl.textContent = s;
      summaryEl.hidden = !s;
    }

    track.innerHTML = "";
    const n = entries.length;
    entries.forEach((entry, i) => {
      const size = this.pickHorizontalMosaicSize(i, n);
      this.appendHorizontalCard(track, entry, size, i);
    });
  }
  isAboutOpen() {
    return document.body.classList.contains("about-open");
  }
  _applyAboutOpenState(open) {
    const el = this.aboutSection;
    if (!el) return;
    if (open) {
      document.body.classList.add("about-open");
      el.hidden = false;
      el.setAttribute("aria-hidden", "false");
      if (this.aboutNavLink) {
        this.aboutNavLink.setAttribute("aria-current", "page");
      }
      el.scrollTop = 0;
    } else {
      document.body.classList.remove("about-open");
      el.hidden = true;
      el.setAttribute("aria-hidden", "true");
      if (this.aboutNavLink) {
        this.aboutNavLink.removeAttribute("aria-current");
      }
    }
  }
  openAboutSection(options) {
    const opts = options || {};
    if (this.zoomState.isActive) return;
    this.closeHeaderPanels();
    if (this.isAboutOpen()) return;
    this._applyAboutOpenState(true);
    if (
      !opts.skipHistory &&
      window.history &&
      window.location.hash !== "#about"
    ) {
      window.history.pushState({ about: 1 }, "", "#about");
    }
  }
  closeAboutSection(options) {
    const opts = options || {};
    if (!this.isAboutOpen()) return;
    this._applyAboutOpenState(false);
    if (
      !opts.skipHash &&
      window.location.hash === "#about" &&
      window.history.replaceState
    ) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  }
  buildProjectNav() {
    const projectsPanel = document.getElementById("headerPanelProjects");
    if (projectsPanel) {
      projectsPanel.hidden = !this.useLocalPortfolio;
    }
    const ul = document.getElementById("projectNav");
    if (!ul || !this.useLocalPortfolio) return;
    ul.innerHTML = "";
    const addLink = (label, id) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = label;
      a.dataset.projectId =
        id === null || id === undefined ? "" : String(id);
      a.addEventListener("click", (e) => {
        e.preventDefault();
        this.setActiveProject(id);
      });
      li.appendChild(a);
      ul.appendChild(li);
    };
    addLink("Tutti", null);
    const list = window.__PORTFOLIO_PROJECTS__ || [];
    const byId = {};
    list.forEach((p) => {
      if (p && p.id != null) byId[String(p.id)] = p;
    });
    const sections = window.__PORTFOLIO_MENU_SECTIONS__;
    if (sections && sections.length) {
      sections.forEach((sec, secIdx) => {
        const headingLi = document.createElement("li");
        headingLi.className =
          "projects-nav__section-heading" +
          (secIdx === 0 ? " projects-nav__section-heading--first" : "");
        const labelSpan = document.createElement("span");
        labelSpan.className = "projects-nav__section-label";
        const raw = (sec.label || "").trim();
        labelSpan.textContent = raw.endsWith(":") ? raw : `${raw}:`;
        headingLi.appendChild(labelSpan);
        ul.appendChild(headingLi);
        (sec.ids || []).forEach((pid) => {
          const p = byId[String(pid)];
          if (!p) return;
          const n = this.projectOrdinalInPortfolio(pid);
          const label = `N.${n} ${p.title || p.id}`;
          addLink(label, p.id);
        });
      });
    } else {
      list.forEach((p) => {
        const n = this.projectOrdinalInPortfolio(p.id);
        const label = `N.${n} ${p.title || p.id}`;
        addLink(label, p.id);
      });
    }
    this.highlightActiveProject();
  }
  setActiveProject(projectId) {
    if (!this.useLocalPortfolio) return;
    if (this.zoomState.isActive) return;
    const normalized =
      projectId === null || projectId === undefined || projectId === ""
        ? null
        : String(projectId);
    const changed = this.activeProjectId !== normalized;
    this.activeProjectId = normalized;
    if (normalized) {
      document.body.setAttribute("data-active-project", normalized);
    } else {
      document.body.removeAttribute("data-active-project");
    }
    this.swapProjectMobileStylesheet(normalized);
    this.highlightActiveProject();
    if (changed) {
      this.rebuildGrid();
    }
    document.body.classList.toggle(
      "project-zoom-enabled",
      this.isProjectFilterActive()
    );
    this.closeHeaderPanels();
  }
  highlightActiveProject() {
    const ul = document.getElementById("projectNav");
    if (!ul) return;
    const cur =
      this.activeProjectId == null ? "" : String(this.activeProjectId);
    ul.querySelectorAll("a").forEach((a) => {
      const pid = a.dataset.projectId || "";
      const isAll = cur === "";
      const active =
        (pid === "" && isAll) || (pid !== "" && pid === cur);
      a.classList.toggle("project-link-active", active);
    });
  }
  rebuildGrid() {
    if (!this.useLocalPortfolio) return;
    if (this.zoomState.isActive) return;
    if (this.draggable) {
      this.draggable.kill();
      this.draggable = null;
    }
    if (this.viewportObserver) {
      this.viewportObserver.disconnect();
      this.viewportObserver = null;
    }
    if (this.gridItems.length) {
      gsap.killTweensOf(this.gridItems.map((i) => i.element));
    }
    gsap.killTweensOf(this.getCanvasTransformTarget());
    gsap.killTweensOf(this.canvasWrapper);

    this.generateGridItems();

    if (
      this.isProjectConceptLayoutActive() ||
      this.isProjectHorizontalMixedActive()
    ) {
      this.syncFilteredProjectGridState();
      this.gridItems.forEach((itemData) => {
        gsap.set(itemData.element, { opacity: 1, clearProps: "left,top" });
      });
      if (this.controlsContainer) {
        gsap.set(this.controlsContainer, { opacity: 1 });
        this.controlsContainer.classList.add("visible");
      }
      setTimeout(() => {
        this.initDraggable();
        this.setupViewportObserver();
      }, 400);
      return;
    }

    this.syncFilteredProjectGridState();

    this.config.currentGap = this.calculateGapForZoom(
      this.config.currentZoom
    );
    this.calculateGridDimensions(this.config.currentGap);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { scaledWidth, scaledHeight } = this.gridDimensions;
    const centerX = (vw - scaledWidth) / 2;
    const centerY = (vh - scaledHeight) / 2;
    const mobileProjectScroll = this.isMobileProjectCanvasScrollLayout();
    const tf = this.getCanvasTransformTarget();
    if (mobileProjectScroll) {
      gsap.set(tf, {
        x: 0,
        y: 0,
        scale: this.config.currentZoom
      });
      this.lastValidPosition.x = 0;
      this.lastValidPosition.y = 0;
    } else {
      gsap.set(tf, {
        x: centerX,
        y: centerY,
        scale: this.config.currentZoom
      });
      this.lastValidPosition.x = centerX;
      this.lastValidPosition.y = centerY;
    }
    this.updatePercentageIndicator(this.config.currentZoom);

    if (this.controlsContainer) {
      gsap.set(this.controlsContainer, { opacity: 1 });
      this.controlsContainer.classList.add("visible");
    }

    this.applyGridVisibleAndStartDrift({ entranceControls: false });

    setTimeout(() => {
      this.initDraggable();
      this.setupViewportObserver();
    }, 1500);
  }
  /** Dopo rebuild: assicura zoom/statiche coerenti se è attivo un filtro progetto. */
  syncFilteredProjectGridState() {
    document.body.classList.toggle(
      "project-zoom-enabled",
      this.isProjectFilterActive()
    );
    if (!this.isProjectFilterActive()) return;
    this.clearFormationSchedulingAndFlags();
    this.gridItems.forEach((item) => {
      this.stopGridItemSlideshow(item);
      this.pauseGridItemDrift(item);
    });
  }
  // Custom line splitting function (since we can't use SplitText)
  splitTextIntoLines(element, text) {
    element.innerHTML = "";
    // Split by sentences and create lines
    const sentences = text.split(/(?<=[.!?])\s+/);
    const lines = [];
    // Create temporary div to measure text width
    const temp = document.createElement("div");
    temp.style.cssText = `
          position: absolute;
          visibility: hidden;
          width: ${element.offsetWidth}px;
          font-family: 'PPNeueMontreal', sans-serif;
          font-size: 16px;
          font-weight: 300;
          line-height: 1.4;
        `;
    document.body.appendChild(temp);
    let currentLine = "";
    sentences.forEach((sentence) => {
      const words = sentence.split(" ");
      words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        temp.textContent = testLine;
        if (temp.offsetWidth > element.offsetWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
    });
    if (currentLine) {
      lines.push(currentLine);
    }
    document.body.removeChild(temp);
    // Create line elements
    lines.forEach((lineText) => {
      const lineSpan = document.createElement("span");
      lineSpan.className = "description-line";
      lineSpan.textContent = lineText;
      element.appendChild(lineSpan);
    });
    return element.querySelectorAll(".description-line");
  }
  calculateGapForZoom(zoomLevel) {
    if (zoomLevel >= 1.0) return 16;
    else if (zoomLevel >= 0.6) return 32;
    else return 64;
  }
  calculateGridDimensions(gap = this.config.currentGap) {
    const cell = this.layoutCellSize();
    const totalWidth = this.config.cols * (cell + gap) - gap;
    const totalHeight = this.config.rows * (cell + gap) - gap;
    this.gridDimensions = {
      width: totalWidth,
      height: totalHeight,
      scaledWidth: totalWidth * this.config.currentZoom,
      scaledHeight: totalHeight * this.config.currentZoom,
      gap: gap
    };
    return this.gridDimensions;
  }
  buildSlideshowSlides(entry) {
    const isCatalogRow =
      this.useLocalPortfolio &&
      entry &&
      entry.projectId != null &&
      entry.url &&
      entry.type !== "remote";
    if (isCatalogRow) {
      if (this.isProjectFilterActive()) {
        return [
          {
            url: entry.url,
            fullImageUrl: entry.fullImageUrl || entry.url,
            alt: `${entry.projectTitle} — ${entry.file}`,
            catalogEntry: entry
          }
        ];
      }
      const ep = String(entry.projectId);
      return this.catalog
        .filter((e) => String(e.projectId) === ep)
        .map((e) => ({
          url: e.url,
          fullImageUrl: e.fullImageUrl || e.url,
          alt: `${e.projectTitle} — ${e.file}`,
          catalogEntry: e
        }));
    }
    return this.fashionImages.map((url, overlayIdx) => ({
      url,
      fullImageUrl: url,
      alt: `Fashion Portrait ${overlayIdx + 1}`,
      overlayIndex: overlayIdx,
      type: "remote"
    }));
  }
  snapSlideshowTrack(itemData) {
    const track = itemData.slideTrack;
    const slides = itemData.slideshowSlides;
    if (!track || !slides?.length) return;
    const idx = itemData.currentSlideIndex;
    const s = slides[idx];
    gsap.set(track, { x: 0 });
    const imgs = track.querySelectorAll(".grid-item__slide img");
    const img0 = imgs[0];
    const img1 = imgs[1];
    if (img0 && s) {
      img0.src = s.url;
      img0.alt = s.alt;
      itemData.img = img0;
    }
    if (img1) img1.removeAttribute("src");
  }
  stopGridItemSlideshow(itemData) {
    if (!itemData) return;
    if (itemData.slideDelay) {
      itemData.slideDelay.kill();
      itemData.slideDelay = null;
    }
    if (itemData.slideTween) {
      itemData.slideTween.kill();
      itemData.slideTween = null;
    }
    itemData.slideshowPaused = true;
  }
  pauseGridItemSlideshow(itemData) {
    this.stopGridItemSlideshow(itemData);
    this.snapSlideshowTrack(itemData);
  }
  resumeGridItemSlideshow(itemData) {
    if (this.isProjectFilterActive()) return;
    if (!itemData.slideshowSlides || itemData.slideshowSlides.length <= 1)
      return;
    if (!itemData.slideshowPaused) return;
    itemData.slideshowPaused = false;
    if (!itemData.slideshowResumeStaggerDone) {
      itemData.slideshowResumeStaggerDone = true;
      const stagger = Math.min(1.15, (itemData.index % 48) * 0.021);
      if (itemData.slideDelay) itemData.slideDelay.kill();
      itemData.slideDelay = gsap.delayedCall(stagger, () => {
        itemData.slideDelay = null;
        this.scheduleNextSlideshowAdvance(itemData);
      });
      return;
    }
    this.scheduleNextSlideshowAdvance(itemData);
  }
  /**
   * Slittamento su sottogriglia allineata alla griglia reale (binari): passo = 1/8 cella,
   * così baseX/baseY restano sui binari. Mosse ortogonali; collisioni vietate.
   */
  getTetrisDriftStepPx() {
    return (this.config.itemSize + this.config.currentGap) / 8;
  }
  getTetrisDriftRadiusCells(itemData) {
    const large =
      (itemData.spanCols || 1) > 1 || (itemData.spanRows || 1) > 1;
    return large ? 1 : 2;
  }
  rectsOverlap(a, b) {
    return (
      a.left < b.right &&
      a.right > b.left &&
      a.top < b.bottom &&
      a.bottom > b.top
    );
  }
  getDriftWorldRect(itemData, gx, gy) {
    const S = this.getTetrisDriftStepPx();
    const w = itemData.pixelWidth || this.config.itemSize;
    const h = itemData.pixelHeight || this.config.itemSize;
    const ox = gx * S;
    const oy = gy * S;
    const left = itemData.baseX + ox;
    const top = itemData.baseY + oy;
    return { left, top, right: left + w, bottom: top + h };
  }
  getDriftWorldRectAtOffset(itemData, ox, oy) {
    const w = itemData.pixelWidth || this.config.itemSize;
    const h = itemData.pixelHeight || this.config.itemSize;
    const left = itemData.baseX + ox;
    const top = itemData.baseY + oy;
    return { left, top, right: left + w, bottom: top + h };
  }
  clearFormationSchedulingAndFlags() {
    if (this.formationWaveTimer) {
      this.formationWaveTimer.kill();
      this.formationWaveTimer = null;
    }
    this.gridItems.forEach((m) => {
      if (m.element) gsap.killTweensOf(m.element, "x,y");
      m.driftFormationIdle = false;
      delete m._formationTargetOx;
      delete m._formationTargetOy;
    });
  }
  queueNextFormationWave() {
    if (!ENABLE_GRID_CARD_DRIFT) return;
    if (this.isProjectFilterActive()) return;
    if (this.zoomState.isActive) return;
    if (this.formationWaveTimer) {
      this.formationWaveTimer.kill();
      this.formationWaveTimer = null;
    }
    const delay = 12 + Math.random() * 22;
    this.formationWaveTimer = gsap.delayedCall(delay, () => {
      this.formationWaveTimer = null;
      this.runFormationRowWave();
    });
  }
  /**
   * Parte delle card resta ferma; le altre seguono un path ortogonale (a L) e si allineano in fila.
   */
  runFormationRowWave() {
    if (!ENABLE_GRID_CARD_DRIFT) return;
    if (this.isProjectFilterActive()) return;
    if (this.zoomState.isActive || !this.gridItems.length) {
      this.queueNextFormationWave();
      return;
    }
    const S = this.getTetrisDriftStepPx();
    const m = 80;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      return (
        r.bottom > -m &&
        r.top < vh + m &&
        r.right > -m &&
        r.left < vw + m
      );
    };
    const candidates = this.gridItems.filter(
      (it) =>
        it.element &&
        vis(it.element) &&
        (it.spanCols || 1) === 1 &&
        (it.spanRows || 1) === 1
    );
    if (candidates.length < 5) {
      this.queueNextFormationWave();
      return;
    }
    this.shuffleArray(candidates);
    const lo = Math.max(4, Math.floor(candidates.length * 0.3));
    const hi = Math.min(candidates.length - 2, Math.ceil(candidates.length * 0.58));
    const nMove = lo + Math.floor(Math.random() * Math.max(1, hi - lo + 1));
    const movers = candidates.slice(0, nMove);
    const moverSet = new Set(movers);
    this.gridItems.forEach((it) => {
      if (it.driftDelay) {
        it.driftDelay.kill();
        it.driftDelay = null;
      }
      if (it.driftTween) {
        it.driftTween.kill();
        it.driftTween = null;
      }
      const gx = it.driftGridX || 0;
      const gy = it.driftGridY || 0;
      gsap.set(it.element, { x: gx * S, y: gy * S });
      it.driftFormationIdle = !moverSet.has(it);
    });
    movers.sort(
      (a, b) =>
        a.baseX + (a.pixelWidth || this.config.itemSize) / 2 -
        (b.baseX + (b.pixelWidth || this.config.itemSize) / 2)
    );
    const gridW = this.gridDimensions.width || this.gridContainer?.offsetWidth || 1;
    const gridH = this.gridDimensions.height || this.gridContainer?.offsetHeight || 1;
    const lineCenterY = gridH * (0.26 + Math.random() * 0.48);
    const pitch = Math.max(
      S * 4,
      Math.round(((this.config.itemSize + S) * (0.44 + Math.random() * 0.1)) / S) * S
    );
    const totalW = (movers.length - 1) * pitch;
    let startCx = gridW / 2 - totalW / 2;
    startCx = Math.round(startCx / S) * S;
    const stepDur = 0.1;
    let pending = movers.length;
    const onMoverPathDone = () => {
      pending--;
      if (pending > 0) return;
      const hold = 1.8 + Math.random() * 2.2;
      gsap.delayedCall(hold, () => this.disperseFormationRow(movers));
    };
    movers.forEach((item, i) => {
      const w = item.pixelWidth || this.config.itemSize;
      const h = item.pixelHeight || this.config.itemSize;
      let qx = startCx + i * pitch - item.baseX - w / 2;
      let qy = lineCenterY - item.baseY - h / 2;
      qx = Math.round(qx / S) * S;
      qy = Math.round(qy / S) * S;
      const a = this.getDriftWorldRectAtOffset(item, qx, qy);
      let ok = true;
      for (let j = 0; j < this.gridItems.length; j++) {
        const o = this.gridItems[j];
        if (o === item) continue;
        let b;
        if (moverSet.has(o)) {
          const mi = movers.indexOf(o);
          if (mi < 0 || mi >= i || o._formationTargetOx == null) continue;
          b = this.getDriftWorldRectAtOffset(
            o,
            o._formationTargetOx,
            o._formationTargetOy
          );
        } else {
          b = this.getDriftWorldRect(o, o.driftGridX || 0, o.driftGridY || 0);
        }
        if (this.rectsOverlap(a, b)) {
          ok = false;
          break;
        }
      }
      if (!ok) {
        item.driftFormationIdle = true;
        pending--;
        if (pending === 0) onMoverPathDone();
        return;
      }
      item._formationTargetOx = qx;
      item._formationTargetOy = qy;
      const gx0 = item.driftGridX || 0;
      const gy0 = item.driftGridY || 0;
      const curX = gx0 * S;
      const curY = gy0 * S;
      const horizFirst = Math.random() < 0.5;
      const d1 =
        (Math.abs(horizFirst ? qx - curX : qy - curY) / S) * stepDur + 0.06;
      const d2 =
        (Math.abs(horizFirst ? qy - curY : qx - curX) / S) * stepDur + 0.06;
      const tl = gsap.timeline({
        delay: Math.random() * 0.95,
        onComplete: () => {
          item.driftGridX = Math.round(qx / S);
          item.driftGridY = Math.round(qy / S);
          onMoverPathDone();
        }
      });
      if (horizFirst) {
        tl.to(item.element, { x: qx, y: curY, duration: Math.max(0.08, d1), ease: "none" });
        tl.to(item.element, { x: qx, y: qy, duration: Math.max(0.08, d2), ease: "none" });
      } else {
        tl.to(item.element, { x: curX, y: qy, duration: Math.max(0.08, d1), ease: "none" });
        tl.to(item.element, { x: qx, y: qy, duration: Math.max(0.08, d2), ease: "none" });
      }
    });
  }
  disperseFormationRow(movers) {
    let left = movers.length;
    const doneOne = () => {
      left--;
      if (left > 0) return;
      this.gridItems.forEach((it) => {
        it.driftFormationIdle = false;
        delete it._formationTargetOx;
        delete it._formationTargetOy;
      });
      if (!this.zoomState.isActive) {
        this.gridItems.forEach((it) => {
          if (it.driftSuspended) return;
          if (it.driftTween || it.driftDelay) return;
          const kick = Math.random() * 0.35;
          if (kick > 0.04) {
            it.driftDelay = gsap.delayedCall(kick, () => {
              it.driftDelay = null;
              this.runGridItemSlipStep(it);
            });
          } else {
            this.runGridItemSlipStep(it);
          }
        });
      }
      this.queueNextFormationWave();
    };
    movers.forEach((item) => {
      if (!item.element) {
        doneOne();
        return;
      }
      gsap.to(item.element, {
        x: 0,
        y: 0,
        duration: 0.32 + Math.random() * 0.28,
        ease: "power2.inOut",
        delay: Math.random() * 0.25,
        onComplete: () => {
          item.driftGridX = 0;
          item.driftGridY = 0;
          doneOne();
        }
      });
    });
  }
  driftPlacementCollides(mover, gx, gy) {
    const a = this.getDriftWorldRect(mover, gx, gy);
    for (let i = 0; i < this.gridItems.length; i++) {
      const other = this.gridItems[i];
      if (other === mover || !other.element) continue;
      const ogx = other.driftGridX || 0;
      const ogy = other.driftGridY || 0;
      const b = this.getDriftWorldRect(other, ogx, ogy);
      if (this.rectsOverlap(a, b)) return true;
    }
    return false;
  }
  pauseGridItemDrift(itemData) {
    if (!itemData?.element) return;
    itemData.driftSuspended = true;
    if (itemData.driftDelay) {
      itemData.driftDelay.kill();
      itemData.driftDelay = null;
    }
    if (itemData.driftTween) {
      itemData.driftTween.kill();
      itemData.driftTween = null;
    }
    itemData.driftGridX = 0;
    itemData.driftGridY = 0;
    gsap.set(itemData.element, { x: 0, y: 0 });
  }
  runGridItemSlipStep(itemData) {
    if (!ENABLE_GRID_CARD_DRIFT) return;
    if (this.isProjectFilterActive()) return;
    if (itemData.driftFormationIdle) return;
    if (!itemData?.element || itemData.driftSuspended || this.zoomState.isActive)
      return;
    if (!this.gridItems.includes(itemData)) return;
    const el = itemData.element;
    const step = this.getTetrisDriftStepPx();
    const R = this.getTetrisDriftRadiusCells(itemData);
    let gx = itemData.driftGridX || 0;
    let gy = itemData.driftGridY || 0;
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ];
    const valid = dirs.filter(([dx, dy]) => {
      const nx = gx + dx;
      const ny = gy + dy;
      if (Math.abs(nx) > R || Math.abs(ny) > R) return false;
      return !this.driftPlacementCollides(itemData, nx, ny);
    });
    if (!valid.length) {
      itemData.driftDelay = gsap.delayedCall(0.22 + Math.random() * 0.5, () => {
        itemData.driftDelay = null;
        this.runGridItemSlipStep(itemData);
      });
      return;
    }
    const pick = valid[Math.floor(Math.random() * valid.length)];
    gx += pick[0];
    gy += pick[1];
    itemData.driftGridX = gx;
    itemData.driftGridY = gy;
    const duration = 0.13 + Math.random() * 0.09;
    itemData.driftTween = gsap.to(el, {
      x: gx * step,
      y: gy * step,
      duration,
      ease: "none",
      onComplete: () => {
        itemData.driftTween = null;
        if (itemData.driftSuspended || !itemData.element) return;
        if (this.zoomState.isActive) return;
        if (!this.gridItems.includes(itemData)) return;
        const rest = 0.18 + Math.random() * 0.55;
        const next = () => this.runGridItemSlipStep(itemData);
        itemData.driftDelay = gsap.delayedCall(rest, () => {
          itemData.driftDelay = null;
          next();
        });
      }
    });
  }
  resumeGridItemDrift(itemData) {
    if (!ENABLE_GRID_CARD_DRIFT) return;
    if (!itemData?.element) return;
    if (this.isProjectFilterActive()) return;
    if (itemData.driftFormationIdle) return;
    if (this.zoomState.isActive) return;
    if (itemData.driftTween || itemData.driftDelay) return;
    itemData.driftSuspended = false;
    itemData.driftGridX = 0;
    itemData.driftGridY = 0;
    gsap.set(itemData.element, { x: 0, y: 0 });
    const startIn = Math.random() * 0.45;
    if (startIn > 0.03) {
      itemData.driftDelay = gsap.delayedCall(startIn, () => {
        itemData.driftDelay = null;
        this.runGridItemSlipStep(itemData);
      });
    } else {
      this.runGridItemSlipStep(itemData);
    }
  }
  pauseAllGridItemDrift() {
    this.clearFormationSchedulingAndFlags();
    this.gridItems.forEach((item) => this.pauseGridItemDrift(item));
  }
  startGridDriftForVisibleThumbnails() {
    this.clearFormationSchedulingAndFlags();
    this.gridItems.forEach((item) => this.pauseGridItemDrift(item));
  }
  pickSlideshowTargetIndex(itemData) {
    const n = itemData.slideshowSlides.length;
    const cur = itemData.currentSlideIndex;
    if (n <= 1) return cur;
    if (n === 2) return cur === 0 ? 1 : 0;
    const c = itemData.slideChaos ?? 0.5;
    const r = Math.random();
    if (r < 0.5 - c * 0.12) {
      const forward = Math.random() < 0.62;
      return forward ? (cur + 1) % n : (cur - 1 + n) % n;
    }
    if (r < 0.82 - c * 0.08) {
      let j = cur;
      let guard = 0;
      while (j === cur && guard++ < 12) {
        j = Math.floor(Math.random() * n);
      }
      return j;
    }
    const hop = 2 + Math.floor(Math.random() * Math.min(4, n - 1));
    const dir = Math.random() < 0.5 ? 1 : -1;
    return (cur + dir * hop + n * 8) % n;
  }
  randomSlideshowEase() {
    const eases = [
      "power1.inOut",
      "power2.inOut",
      "power3.inOut",
      "power4.inOut",
      "sine.inOut",
      "expo.inOut",
      "circ.inOut",
      "back.inOut(1.25)"
    ];
    return eases[Math.floor(Math.random() * eases.length)];
  }
  scheduleNextSlideshowAdvance(itemData) {
    if (this.isProjectFilterActive()) return;
    if (!itemData.slideshowSlides || itemData.slideshowSlides.length <= 1)
      return;
    if (itemData.slideDelay) itemData.slideDelay.kill();
    const mul = itemData.slidePauseMul ?? 1;
    const base = 0.65 + Math.random() ** 0.4 * 7.2;
    const jitter = (Math.random() - 0.5) * 2.4;
    const pause = Math.max(0.35, (base + jitter) * mul);
    itemData.slideDelay = gsap.delayedCall(pause, () =>
      this.advanceGridItemSlide(itemData)
    );
  }
  advanceGridItemSlide(itemData) {
    if (this.isProjectFilterActive()) return;
    const { slideTrack, slideshowSlides } = itemData;
    const n = slideshowSlides.length;
    if (n <= 1 || !slideTrack) return;
    itemData.slideDelay = null;
    const w = itemData.pixelWidth || this.config.itemSize;
    gsap.set(slideTrack, { x: 0 });
    const cur = itemData.currentSlideIndex;
    const target = this.pickSlideshowTargetIndex(itemData);
    if (target === cur) {
      this.scheduleNextSlideshowAdvance(itemData);
      return;
    }
    const slides = slideshowSlides;
    const imgs = slideTrack.querySelectorAll(".grid-item__slide img");
    const img0 = imgs[0];
    const img1 = imgs[1];
    if (!img0 || !img1) return;

    const st = slides[target];
    img1.src = st.url;
    img1.alt = st.alt;

    const spd = itemData.slideSpeedMul ?? 1;
    let duration = 0.38 + Math.random() ** 0.85 * 1.15;
    if (Math.random() < 0.14) {
      duration = 0.035 + Math.random() * 0.09;
    } else if (Math.random() < 0.1) {
      duration = 1.05 + Math.random() * 0.55;
    }
    duration /= spd;
    const ease = this.randomSlideshowEase();

    const finishForward = () => {
      img0.src = st.url;
      img0.alt = st.alt;
      gsap.set(slideTrack, { x: 0 });
      img1.removeAttribute("src");
      itemData.currentSlideIndex = target;
      itemData.img = img0;
      itemData.slideTween = null;
      if (Math.random() < 0.09) {
        itemData.slideDelay = gsap.delayedCall(0.12 + Math.random() * 0.22, () =>
          this.advanceGridItemSlide(itemData)
        );
      } else {
        this.scheduleNextSlideshowAdvance(itemData);
      }
    };

    const runAnim = () => {
      itemData.slideTween = gsap.to(slideTrack, {
        x: -w,
        duration,
        ease,
        onComplete: finishForward
      });
    };

    if (img1.complete && img1.naturalWidth > 0) {
      requestAnimationFrame(runAnim);
      return;
    }
    img1.onload = () => {
      img1.onload = null;
      img1.onerror = null;
      requestAnimationFrame(runAnim);
    };
    img1.onerror = () => {
      img1.onload = null;
      img1.onerror = null;
      img1.removeAttribute("src");
      itemData.slideTween = null;
      this.scheduleNextSlideshowAdvance(itemData);
    };
  }
  generateGridItems() {
    this.clearFormationSchedulingAndFlags();
    this.mobileProjectFeedActive = false;
    document.body.classList.remove("mobile-project-feed");
    const projectView = this.isProjectFilterActive();
    const conceptLayout = this.isProjectConceptLayoutActive();
    const horizontalMixed = this.isProjectHorizontalMixedActive();
    const editorialLayout = this.isProjectEditorialLayoutActive();
    if (!projectView) {
      this.teardownProjectConceptView();
      this.teardownProjectHorizontalView();
      this.teardownProjectEditorialView();
    } else {
      if (!conceptLayout) this.teardownProjectConceptView();
      if (!horizontalMixed) this.teardownProjectHorizontalView();
      if (!editorialLayout) this.teardownProjectEditorialView();
    }
    if (projectView && conceptLayout) {
      this.buildProjectConceptView();
      return;
    }
    if (projectView && horizontalMixed) {
      this.buildProjectHorizontalView();
      return;
    }
    if (projectView && editorialLayout) {
      this.buildProjectEditorialView();
      return;
    }
    const rawItems = this.getDisplayItemsForGrid();
    const displayItems = Array.isArray(rawItems) ? [...rawItems] : [];
    if (projectView) {
      displayItems.sort(
        (a, b) => (a.indexInProject ?? 0) - (b.indexInProject ?? 0)
      );
    } else {
      this.shuffleArray(displayItems);
    }
    this.config.currentGap = this.calculateGapForZoom(this.config.currentZoom);
    const { rows, placements } = projectView
      ? this.computeGridPlacementsProject(displayItems, this.config.cols)
      : this.computeGridPlacements(displayItems);
    this.config.rows = rows;
    this.calculateGridDimensions();
    this.applyCanvasLayoutSizing();
    if (this.gridItems.length) {
      this.gridItems.forEach((item) => {
        this.stopGridItemSlideshow(item);
        this.pauseGridItemDrift(item);
      });
    }
    this.gridContainer.innerHTML = "";
    this.gridItems = [];

    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";

    for (let i = 0; i < placements.length; i++) {
      const placement = placements[i];
      const kind = placement.kind || "thumb";
      const { row, col, spanCols, spanRows } = placement;
      const cell = this.layoutCellSize();
      const x = col * (cell + this.config.currentGap);
      const y = row * (cell + this.config.currentGap);

      if (kind === "blurb") {
        const item = document.createElement("div");
        const blurbLayout = placement.blurbLayout || "aside";
        item.className = `grid-item grid-item--project-blurb grid-item--project-blurb--${blurbLayout}`;
        item.dataset.blurbLayout = blurbLayout;
        item.style.left = `${x}px`;
        item.style.top = `${y}px`;
        item.style.opacity = "0";
        const pid = placement.projectId;
        const rec = (window.__PORTFOLIO_PROJECTS__ || []).find(
          (p) => String(p.id) === String(pid)
        );
        const title = rec?.title || "";
        const summary = this.getProjectSummaryText(pid);
        const copy = document.createElement("div");
        copy.className = "grid-item__project-copy";
        const h = document.createElement("h3");
        h.className = "grid-item__project-title";
        h.textContent = title;
        copy.appendChild(h);
        const paras = summary
          .split(/\n\n+/)
          .map((s) => s.trim())
          .filter(Boolean);
        if (paras.length <= 1) {
          const pEl = document.createElement("p");
          pEl.className = "grid-item__project-summary";
          pEl.textContent = summary;
          copy.appendChild(pEl);
        } else {
          paras.forEach((para, idx) => {
            const pEl = document.createElement("p");
            pEl.className = "grid-item__project-summary";
            if (idx > 0) pEl.classList.add("grid-item__project-summary--after");
            pEl.textContent = para;
            copy.appendChild(pEl);
          });
        }
        item.appendChild(copy);
        const itemData = {
          element: item,
          img: null,
          slideViewport: null,
          slideTrack: null,
          slideshowSlides: [],
          currentSlideIndex: 0,
          slideDelay: null,
          slideTween: null,
          slideshowPaused: true,
          projectBlurb: true,
          slidePauseMul: 1,
          slideSpeedMul: 1,
          slideChaos: 0,
          slideshowResumeStaggerDone: true,
          driftTween: null,
          driftDelay: null,
          driftSuspended: true,
          driftFormationIdle: true,
          driftGridX: 0,
          driftGridY: 0,
          row,
          col,
          spanCols,
          spanRows,
          baseX: x,
          baseY: y,
          imageUrl: "",
          fullImageUrl: "",
          index: i,
          overlayMeta: null
        };
        this.applyItemLayoutMetrics(itemData, this.config.currentGap);
        this.gridContainer.appendChild(item);
        this.gridItems.push(itemData);
        continue;
      }

      const entry = placement.entry;
      const isLead = kind === "lead";
      const item = document.createElement("div");
      item.className = [
        "grid-item",
        spanCols > 1 || spanRows > 1 ? "grid-item--large" : "",
        isLead ? "grid-item--project-lead" : ""
      ]
        .filter(Boolean)
        .join(" ");

      item.style.left = `${x}px`;
      item.style.top = `${y}px`;
      item.style.opacity = "0";

      const slides = this.buildSlideshowSlides(entry);
      const slideCount = slides.length;
      const startIdx =
        slideCount > 1 ? Math.floor(Math.random() * slideCount) : 0;

      const viewport = document.createElement("div");
      viewport.className = "grid-item__viewport";
      const track = document.createElement("div");
      track.className = "grid-item__track grid-item__track--duplex";

      for (let si = 0; si < 2; si++) {
        const slideWrap = document.createElement("div");
        slideWrap.className = "grid-item__slide";
        const img = document.createElement("img");
        img.decoding = "async";
        if (driveImages) img.referrerPolicy = "no-referrer";
        if (si === 0) {
          const s0 = slides[startIdx] || slides[0];
          img.src = s0.url;
          img.alt = s0.alt;
          img.loading = "eager";
        } else {
          img.loading = "lazy";
          if (slideCount > 1) {
            const pre = slides[(startIdx + 1) % slideCount];
            img.src = pre.url;
            img.alt = pre.alt;
          }
        }
        slideWrap.appendChild(img);
        track.appendChild(slideWrap);
      }

      viewport.appendChild(track);
      item.appendChild(viewport);
      const vignette = document.createElement("div");
      vignette.className = "grid-item__vignette";
      vignette.setAttribute("aria-hidden", "true");
      item.appendChild(vignette);

      gsap.set(track, { x: 0 });

      const imgs = track.querySelectorAll(".grid-item__slide img");
      const activeImg = imgs[0];
      const slideAtStart = slides[startIdx] || slides[0];
      const itemData = {
        element: item,
        img: activeImg,
        slideViewport: viewport,
        slideTrack: track,
        slideshowSlides: slides,
        currentSlideIndex: startIdx,
        slideDelay: null,
        slideTween: null,
        slideshowPaused: true,
        slidePauseMul: 0.55 + Math.random() * 0.95,
        slideSpeedMul: 0.55 + Math.random() * 0.95,
        slideChaos: Math.random(),
        slideshowResumeStaggerDone: false,
        driftTween: null,
        driftDelay: null,
        driftSuspended: false,
        driftGridX: 0,
        driftGridY: 0,
        row: row,
        col: col,
        spanCols: spanCols,
        spanRows: spanRows,
        baseX: x,
        baseY: y,
        imageUrl: slideAtStart.url,
        fullImageUrl: slideAtStart.fullImageUrl,
        index: i,
        overlayMeta: this.buildOverlayMeta(
          slideAtStart.catalogEntry ||
            (entry.type === "remote"
              ? {
                  type: "remote",
                  overlayIndex:
                    slideAtStart.overlayIndex ?? entry.overlayIndex ?? i
                }
              : entry)
        )
      };

      this.applyItemLayoutMetrics(itemData, this.config.currentGap);

      this.gridContainer.appendChild(item);
      this.gridItems.push(itemData);
    }
    document.body.classList.toggle(
      "mobile-project-feed",
      !!this.mobileProjectFeedActive
    );
  }
  setupViewportObserver() {
    if (this.viewportObserver) {
      this.viewportObserver.disconnect();
    }
    this.viewportObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Skip if this is the currently selected item in zoom mode
          if (
            this.zoomState.selectedItem &&
            entry.target === this.zoomState.selectedItem.element
          ) {
            return;
          }
          const itemData = this.gridItems.find(
            (g) => g.element === entry.target
          );
          if (entry.isIntersecting) {
            entry.target.classList.remove("out-of-view");
            if (this.isProjectFilterActive()) {
              gsap.set(entry.target, { opacity: 1 });
            } else {
              gsap.to(entry.target, {
                opacity: 1,
                duration: 0.6,
                ease: "power2.out"
              });
            }
            if (itemData) {
              if (!this.isProjectFilterActive()) {
                this.resumeGridItemSlideshow(itemData);
              }
            }
          } else {
            if (this.isProjectFilterActive()) {
              /* Vista serie: niente fade a 10% — sembra un filtro nero sulle foto */
              entry.target.classList.remove("out-of-view");
              gsap.set(entry.target, { opacity: 1 });
            } else {
              entry.target.classList.add("out-of-view");
              gsap.to(entry.target, {
                opacity: 0.1,
                duration: 0.6,
                ease: "power2.out"
              });
            }
            if (itemData) {
              this.pauseGridItemSlideshow(itemData);
              this.pauseGridItemDrift(itemData);
            }
          }
        });
      },
      {
        root: this.viewport || null,
        threshold: this.isProjectFilterActive() ? 0.05 : 0.15,
        rootMargin: this.isProjectFilterActive() ? "0px" : "10%"
      }
    );
    // Observe all grid items
    this.gridItems.forEach((item) => {
      this.viewportObserver.observe(item.element);
    });
  }
  updateTitleOverlayForItem(itemData) {
    const meta = itemData.overlayMeta;
    const numberElement = document.querySelector("#imageSlideNumber span");
    const titleElement = document.querySelector("#imageSlideTitle h1");
    const descriptionElement = document.getElementById("imageSlideDescription");
    if (numberElement && titleElement && descriptionElement && meta) {
      numberElement.textContent = meta.number;
      titleElement.textContent = meta.title;
      this.descriptionLines = this.splitTextIntoLines(
        descriptionElement,
        meta.description
      );
    }
  }
  /**
   * Overlay zoom: posiziona subito il box sulla miniatura, carica l’URL HD (Drive thumbnail
   * grande o file locale), poi chiama onReady — così Flip.fit non parte con img vuota/broken.
   */
  createScalingOverlay(sourceImg, fullImageUrl, onReady) {
    const overlay = document.createElement("div");
    overlay.className = "scaling-image-overlay";
    const img = document.createElement("img");
    img.alt = sourceImg.alt;
    img.referrerPolicy = "no-referrer";
    img.decoding = "async";
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    const sourceRect = sourceImg.getBoundingClientRect();
    gsap.set(overlay, {
      left: sourceRect.left,
      top: sourceRect.top,
      width: sourceRect.width,
      height: sourceRect.height,
      opacity: 1
    });

    this.zoomState.scalingOverlay = overlay;

    const preferred = fullImageUrl || sourceImg.src;
    let finished = false;
    const fire = () => {
      if (finished) return;
      finished = true;
      onReady(overlay);
    };

    img.onload = () => fire();
    img.onerror = () => {
      if (img.dataset.fallbackTried === "1") {
        fire();
        return;
      }
      img.dataset.fallbackTried = "1";
      const fallback = sourceImg.src;
      if (fallback && img.src !== fallback) {
        img.src = fallback;
      } else {
        fire();
      }
    };

    img.src = preferred;
    if (img.complete && img.naturalWidth > 0) {
      requestAnimationFrame(fire);
    }
    setTimeout(fire, 12000);

    return overlay;
  }
  /** Dopo Flip.fit (o fallback fullscreen): titoli e overlay zoom. */
  completeZoomOpenUI(selectedItemData) {
    this.updateTitleOverlayForItem(selectedItemData);
    const imageTitleOverlay = this.imageTitleOverlay;
    gsap.set("#imageSlideNumber span", {
      y: 18,
      opacity: 0
    });
    gsap.set("#imageSlideTitle h1", {
      y: 36,
      opacity: 0
    });
    if (this.descriptionLines && this.descriptionLines.length) {
      gsap.set(this.descriptionLines, {
        y: 48,
        opacity: 0
      });
    }
    if (imageTitleOverlay) {
      imageTitleOverlay.classList.add("active");
      gsap.to(imageTitleOverlay, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto"
      });
    }
    gsap.to("#imageSlideNumber span", {
      duration: 0.8,
      y: 0,
      opacity: 1,
      ease: this.customEase,
      delay: 0.1
    });
    gsap.to("#imageSlideTitle h1", {
      duration: 0.8,
      y: 0,
      opacity: 1,
      ease: this.customEase,
      delay: 0.15
    });
    if (this.descriptionLines && this.descriptionLines.length) {
      gsap.to(this.descriptionLines, {
        duration: 0.8,
        y: 0,
        opacity: 1,
        ease: this.customEase,
        delay: 0.2,
        stagger: 0.15
      });
    }
  }
  enterZoomMode(selectedItemData) {
    if (this.zoomState.isActive) return;
    this.zoomState.isActive = true;
    this.zoomState.selectedItem = selectedItemData;
    this.pauseAllGridItemDrift();
    this.gridItems.forEach((item) => this.pauseGridItemSlideshow(item));
    this.soundSystem.play("open");
    // Disable dragging
    if (this.draggable) this.draggable.disable();
    document.body.classList.add("zoom-mode");
    const splitContainer = this.splitScreenContainer;
    splitContainer.classList.add("active");
    gsap.to(splitContainer, {
      opacity: 1,
      duration: 1.2,
      ease: this.customEase
    });

    const startFlip = (overlay) => {
      gsap.set(selectedItemData.img, {
        opacity: 0
      });
      const runFit = () => {
        const target = document.getElementById("zoomTarget");
        void splitContainer.offsetHeight;
        const rect = target ? target.getBoundingClientRect() : null;
        const targetOk =
          rect &&
          rect.width >= 64 &&
          rect.height >= 64 &&
          Number.isFinite(rect.width) &&
          Number.isFinite(rect.height);
        if (!targetOk) {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          gsap.killTweensOf(overlay);
          this.zoomState.flipAnimation = null;
          gsap.set(overlay, { clearProps: "transform" });
          const br = overlay.getBoundingClientRect();
          gsap.fromTo(
            overlay,
            {
              left: br.left,
              top: br.top,
              width: br.width,
              height: br.height
            },
            {
              left: 0,
              top: 0,
              width: vw,
              height: vh,
              duration: 1.05,
              ease: this.customEase,
              onComplete: () => this.completeZoomOpenUI(selectedItemData)
            }
          );
          return;
        }
        this.zoomState.flipAnimation = Flip.fit(overlay, target, {
          duration: 1.2,
          ease: this.customEase,
          absolute: true,
          onComplete: () => this.completeZoomOpenUI(selectedItemData)
        });
      };
      requestAnimationFrame(() => requestAnimationFrame(runFit));
    };

    this.createScalingOverlay(
      selectedItemData.img,
      selectedItemData.fullImageUrl,
      startFlip
    );
    if (this.controlsContainer) {
      this.controlsContainer.classList.add("split-mode");
    }
    gsap.fromTo(
      this.closeButton,
      {
        x: 40,
        opacity: 0
      },
      {
        x: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.9
      }
    );
    this.closeButton.classList.add("active");
    // Add event listeners
    document
      .getElementById("splitLeft")
      .addEventListener("click", this.handleSplitAreaClick.bind(this));
    document
      .getElementById("splitRight")
      .addEventListener("click", this.handleSplitAreaClick.bind(this));
    document.addEventListener("keydown", this.handleZoomKeys.bind(this));
  }
  handleSplitAreaClick(e) {
    if (e.target === e.currentTarget) {
      this.exitZoomMode();
    }
  }
  exitZoomMode() {
    if (
      !this.zoomState.isActive ||
      !this.zoomState.selectedItem ||
      !this.zoomState.scalingOverlay
    )
      return;
    this.soundSystem.play("close");
    document.removeEventListener("keydown", this.handleZoomKeys);
    const splitLeft = document.getElementById("splitLeft");
    const splitRight = document.getElementById("splitRight");
    if (splitLeft)
      splitLeft.removeEventListener("click", this.handleSplitAreaClick);
    if (splitRight)
      splitRight.removeEventListener("click", this.handleSplitAreaClick);
    const splitContainer = this.splitScreenContainer;
    const selectedElement = this.zoomState.selectedItem.element;
    const selectedImg = this.zoomState.selectedItem.img;
    if (this.zoomState.flipAnimation) {
      this.zoomState.flipAnimation.kill();
    }
    // Hide title overlay quickly
    const overlayElement = this.imageTitleOverlay;
    gsap.to(overlayElement, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out"
    });
    gsap.to("#imageSlideNumber span", {
      duration: 0.4,
      y: 24,
      opacity: 0,
      ease: "power2.out"
    });
    gsap.to("#imageSlideTitle h1", {
      duration: 0.4,
      y: 40,
      opacity: 0,
      ease: "power2.out"
    });
    const finishTitleOverlayHide = () => {
      overlayElement.classList.remove("active");
      gsap.set("#imageSlideNumber span", {
        y: 18,
        opacity: 0
      });
      gsap.set("#imageSlideTitle h1", {
        y: 36,
        opacity: 0
      });
      if (this.descriptionLines && this.descriptionLines.length) {
        gsap.set(this.descriptionLines, {
          y: 48,
          opacity: 0
        });
      }
    };
    if (this.descriptionLines) {
      gsap.to(this.descriptionLines, {
        duration: 0.4,
        y: 56,
        opacity: 0,
        ease: "power2.out",
        stagger: -0.05,
        onComplete: finishTitleOverlayHide
      });
    } else {
      gsap.delayedCall(0.45, finishTitleOverlayHide);
    }
    gsap.to(this.closeButton, {
      duration: 0.3,
      opacity: 0,
      x: 40,
      ease: "power2.in"
    });
    splitContainer.classList.remove("active");
    if (this.controlsContainer) {
      this.controlsContainer.classList.remove("split-mode");
    }
    gsap.to(splitContainer, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    });
    Flip.fit(this.zoomState.scalingOverlay, selectedElement, {
      duration: 1.2,
      ease: this.customEase,
      absolute: true,
      onComplete: () => {
        gsap.set(selectedImg, {
          opacity: 1
        });
        if (this.zoomState.scalingOverlay) {
          document.body.removeChild(this.zoomState.scalingOverlay);
          this.zoomState.scalingOverlay = null;
        }
        splitContainer.classList.remove("active");
        document.body.classList.remove("zoom-mode");
        this.closeButton.classList.remove("active");
        if (this.draggable) this.draggable.enable();
        this.zoomState.isActive = false;
        this.zoomState.selectedItem = null;
        this.zoomState.flipAnimation = null;
        this.startGridDriftForVisibleThumbnails();
      }
    });
    if (this.zoomState.scalingOverlay) {
      gsap.to(this.zoomState.scalingOverlay, {
        opacity: 0.4,
        duration: 0.8,
        ease: "power2.out"
      });
    }
  }
  handleZoomKeys(e) {
    if (!this.zoomState.isActive) return;
    if (e.key === "Escape") {
      this.exitZoomMode();
    }
  }
  calculateBounds() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { scaledWidth, scaledHeight } = this.gridDimensions;
    const marginX = this.config.currentGap * this.config.currentZoom;
    const marginY = this.config.currentGap * this.config.currentZoom;
    let minX, maxX, minY, maxY;
    if (scaledWidth <= vw) {
      const centerX = (vw - scaledWidth) / 2;
      minX = maxX = centerX;
    } else {
      maxX = marginX;
      minX = vw - scaledWidth - marginX;
    }
    if (scaledHeight <= vh) {
      const centerY = (vh - scaledHeight) / 2;
      minY = maxY = centerY;
    } else {
      maxY = marginY;
      minY = vh - scaledHeight - marginY;
    }
    return {
      minX,
      maxX,
      minY,
      maxY
    };
  }
  initDraggable() {
    if (this.draggable) {
      this.draggable.kill();
      this.draggable = null;
    }
    /* Home: nessun pan con mouse / touch sulla griglia */
  }
  handleMouseLeave() {
    if (document.body.classList.contains("dragging")) {
      document.body.classList.remove("dragging");
      gsap.to(this.getCanvasTransformTarget(), {
        duration: 0.6,
        x: this.lastValidPosition.x,
        y: this.lastValidPosition.y,
        ease: "power2.out"
      });
      if (this.draggable) {
        this.draggable.endDrag();
      }
    }
  }
  calculateFitZoom() {
    const vw = window.innerWidth;
    const vh = window.innerHeight - 80;
    const currentGap = this.calculateGapForZoom(1.0);
    const gridWidth =
      this.config.cols * (this.config.itemSize + currentGap) - currentGap;
    const gridHeight =
      this.config.rows * (this.config.itemSize + currentGap) - currentGap;
    const margin = 40;
    const availableWidth = vw - margin * 2;
    const availableHeight = vh - margin * 2;
    const zoomToFitWidth = availableWidth / gridWidth;
    const zoomToFitHeight = availableHeight / gridHeight;
    const fitZoom = Math.min(zoomToFitWidth, zoomToFitHeight);
    return Math.max(0.1, Math.min(2.0, fitZoom));
  }
  /** Griglia subito a posto (niente fly-in); reset drift + UI chrome. */
  applyGridVisibleAndStartDrift(options = {}) {
    const entranceControls = options.entranceControls !== false;
    this.gridItems.forEach((itemData) => {
      gsap.set(itemData.element, {
        left: itemData.baseX,
        top: itemData.baseY,
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        zIndex: itemData.spanCols > 1 ? 2 : 1
      });
    });
    this.startGridDriftForVisibleThumbnails();
    if (!this.controlsContainer) return;
    if (!entranceControls) {
      this.controlsContainer.classList.add("visible");
      return;
    }
    const percentageIndicator = this.controlsContainer.querySelector(
      ".percentage-indicator"
    );
    const switchElement = this.controlsContainer.querySelector(".switch");
    const soundToggle = this.controlsContainer.querySelector(".sound-toggle");
    gsap.set(this.controlsContainer, {
      opacity: 0
    });
    if (percentageIndicator) {
      gsap.set(percentageIndicator, {
        x: "-3em"
      });
    }
    if (switchElement) {
      gsap.set(switchElement, {
        y: "2em"
      });
    }
    if (soundToggle) {
      gsap.set(soundToggle, {
        x: "3em"
      });
    }
    const navTimeline = gsap.timeline();
    navTimeline.to(
      this.controlsContainer,
      {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      },
      0
    );
    if (percentageIndicator) {
      navTimeline.to(
        percentageIndicator,
        {
          x: 0,
          duration: 0.2,
          ease: "power2.out"
        },
        0.25
      );
    }
    if (switchElement) {
      navTimeline.to(
        switchElement,
        {
          y: 0,
          duration: 0.2,
          ease: "power2.out"
        },
        0.3
      );
    }
    if (soundToggle) {
      navTimeline.to(
        soundToggle,
        {
          x: 0,
          duration: 0.2,
          ease: "power2.out"
        },
        switchElement ? 0.35 : 0.3
      );
    }
    this.controlsContainer.classList.add("visible");
  }
  autoFitZoom(buttonElement = null) {
    if (this.zoomState.isActive) {
      this.exitZoomMode();
      return;
    }
    if (this.config.zoomLevelLocked) return;
    const fitZoom = this.calculateFitZoom();
    this.config.currentZoom = fitZoom;
    const newGap = this.calculateGapForZoom(fitZoom);
    this.soundSystem.play(fitZoom < 0.6 ? "zoom-out" : "zoom-in");
    this.calculateGridDimensions(this.config.currentGap);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const currentScaledWidth =
      this.gridDimensions.width * this.config.currentZoom;
    const currentScaledHeight =
      this.gridDimensions.height * this.config.currentZoom;
    const mobileScroll = this.isMobileProjectCanvasScrollLayout();
    const centerX = mobileScroll ? 0 : (vw - currentScaledWidth) / 2;
    const centerY = mobileScroll ? 0 : (vh - currentScaledHeight) / 2;
    const tf = this.getCanvasTransformTarget();
    gsap.to(tf, {
      duration: 0.6,
      x: centerX,
      y: centerY,
      ease: this.centerEase,
      onComplete: () => {
        if (newGap !== this.config.currentGap) {
          this.gridItems.forEach((itemData) => {
            this.applyItemLayoutMetrics(itemData, newGap);
            gsap.to(itemData.element, {
              duration: 1.0,
              left: itemData.baseX,
              top: itemData.baseY,
              width: itemData.pixelWidth,
              height: itemData.pixelHeight,
              ease: this.customEase
            });
          });
          const newWidth =
            this.config.cols * (this.config.itemSize + newGap) - newGap;
          const newHeight =
            this.config.rows * (this.config.itemSize + newGap) - newGap;
          gsap.to(this.canvasWrapper, {
            duration: 1.0,
            width: newWidth,
            height: newHeight,
            ease: this.customEase
          });
          this.config.currentGap = newGap;
        }
        this.calculateGridDimensions(newGap);
        const finalScaledWidth = this.gridDimensions.width * fitZoom;
        const finalScaledHeight = this.gridDimensions.height * fitZoom;
        const finalCenterX = mobileScroll
          ? 0
          : (vw - finalScaledWidth) / 2;
        const finalCenterY = mobileScroll
          ? 0
          : (vh - finalScaledHeight) / 2;
        gsap.to(this.getCanvasTransformTarget(), {
          duration: 1.2,
          scale: fitZoom,
          x: finalCenterX,
          y: finalCenterY,
          ease: this.customEase,
          onComplete: () => {
            this.lastValidPosition.x = finalCenterX;
            this.lastValidPosition.y = finalCenterY;
            this.applyCanvasLayoutSizing();
            this.initDraggable();
          }
        });
      }
    });
    this.updatePercentageIndicator(fitZoom);
    document.querySelectorAll(".switch-button").forEach((btn) => {
      btn.classList.remove("switch-button-current");
    });
    if (buttonElement) {
      buttonElement.classList.add("switch-button-current");
    }
  }
  updatePercentageIndicator() {
    const el = document.getElementById("percentageIndicator");
    if (el) el.textContent = "Normale · 60%";
  }
  setZoom(zoomLevel, buttonElement = null) {
    if (this.zoomState.isActive) {
      this.exitZoomMode();
      return;
    }
    if (this.config.zoomLevelLocked) return;
    const newGap = this.calculateGapForZoom(zoomLevel);
    const oldZoom = this.config.currentZoom;
    this.config.currentZoom = zoomLevel;
    this.soundSystem.play(zoomLevel < oldZoom ? "zoom-out" : "zoom-in");
    this.calculateGridDimensions(this.config.currentGap);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const currentScaledWidth = this.gridDimensions.width * oldZoom;
    const currentScaledHeight = this.gridDimensions.height * oldZoom;
    const mobileScroll2 = this.isMobileProjectCanvasScrollLayout();
    const centerX = mobileScroll2 ? 0 : (vw - currentScaledWidth) / 2;
    const centerY = mobileScroll2 ? 0 : (vh - currentScaledHeight) / 2;
    const tf2 = this.getCanvasTransformTarget();
    gsap.to(tf2, {
      duration: 0.6,
      x: centerX,
      y: centerY,
      ease: this.centerEase,
      onComplete: () => {
        if (newGap !== this.config.currentGap) {
          this.gridItems.forEach((itemData) => {
            this.applyItemLayoutMetrics(itemData, newGap);
            gsap.to(itemData.element, {
              duration: 1.2,
              left: itemData.baseX,
              top: itemData.baseY,
              width: itemData.pixelWidth,
              height: itemData.pixelHeight,
              ease: this.customEase
            });
          });
          const newWidth =
            this.config.cols * (this.config.itemSize + newGap) - newGap;
          const newHeight =
            this.config.rows * (this.config.itemSize + newGap) - newGap;
          gsap.to(this.canvasWrapper, {
            duration: 1.2,
            width: newWidth,
            height: newHeight,
            ease: this.customEase
          });
          this.config.currentGap = newGap;
        }
        this.calculateGridDimensions(newGap);
        const finalScaledWidth = this.gridDimensions.width * zoomLevel;
        const finalScaledHeight = this.gridDimensions.height * zoomLevel;
        const finalCenterX = mobileScroll2
          ? 0
          : (vw - finalScaledWidth) / 2;
        const finalCenterY = mobileScroll2
          ? 0
          : (vh - finalScaledHeight) / 2;
        gsap.to(this.getCanvasTransformTarget(), {
          duration: 1.2,
          scale: zoomLevel,
          x: finalCenterX,
          y: finalCenterY,
          ease: this.customEase,
          onComplete: () => {
            this.lastValidPosition.x = finalCenterX;
            this.lastValidPosition.y = finalCenterY;
            this.calculateGridDimensions(newGap);
            this.applyCanvasLayoutSizing();
            this.initDraggable();
          }
        });
      }
    });
    this.updatePercentageIndicator(zoomLevel);
    document.querySelectorAll(".switch-button").forEach((btn) => {
      btn.classList.remove("switch-button-current");
    });
    if (buttonElement) {
      buttonElement.classList.add("switch-button-current");
    } else {
      const buttons = document.querySelectorAll(".switch-button");
      if (zoomLevel === 0.3) buttons[1].classList.add("switch-button-current");
      else if (zoomLevel === 0.6)
        buttons[2].classList.add("switch-button-current");
      else if (zoomLevel === 1.0)
        buttons[3].classList.add("switch-button-current");
    }
  }
  resetPosition() {
    if (this.zoomState.isActive) {
      this.exitZoomMode();
      return;
    }
    if (this.isProjectConceptLayoutActive()) return;
    if (this.isProjectHorizontalMixedActive()) return;
    this.calculateGridDimensions(this.config.currentGap);
    this.applyCanvasLayoutSizing();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { scaledWidth, scaledHeight } = this.gridDimensions;
    const mobileScroll3 = this.isMobileProjectCanvasScrollLayout();
    const centerX = mobileScroll3 ? 0 : (vw - scaledWidth) / 2;
    const centerY = mobileScroll3 ? 0 : (vh - scaledHeight) / 2;
    gsap.to(this.getCanvasTransformTarget(), {
      duration: 1.0,
      x: centerX,
      y: centerY,
      ease: this.centerEase,
      onComplete: () => {
        this.lastValidPosition.x = centerX;
        this.lastValidPosition.y = centerY;
        this.applyCanvasLayoutSizing();
        this.initDraggable();
      }
    });
  }
  init() {
    this.config.currentGap = this.calculateGapForZoom(this.config.currentZoom);
    this.buildProjectNav();
    document.body.classList.remove("project-zoom-enabled");
    this.generateGridItems();

    // Set initial opacity for viewport to hide the flash
    gsap.set(this.viewport, { opacity: 0 });

    this.calculateGridDimensions(this.config.currentGap);
    this.applyCanvasLayoutSizing();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { scaledWidth, scaledHeight } = this.gridDimensions;
    const mobileScroll4 = this.isMobileProjectCanvasScrollLayout();
    const centerX = mobileScroll4 ? 0 : (vw - scaledWidth) / 2;
    const centerY = mobileScroll4 ? 0 : (vh - scaledHeight) / 2;
    gsap.set(this.getCanvasTransformTarget(), {
      scale: this.config.currentZoom,
      x: centerX,
      y: centerY
    });
    this.lastValidPosition.x = centerX;
    this.lastValidPosition.y = centerY;
    this.updatePercentageIndicator(this.config.currentZoom);

    // Setup event listeners
    this.setupEventListeners();

    if (window.location.hash === "#about" && !this.zoomState.isActive) {
      this._applyAboutOpenState(true);
    }

    this.beginGalleryEntrance();
  }
  beginGalleryEntrance() {
    homeLoadingDismissScheduled = true;
    dismissHomeLoading(() => {
      gsap.set(this.viewport, { opacity: 1 });
      this.applyGridVisibleAndStartDrift({ entranceControls: true });
      gsap.to(".header", {
        duration: 0.85,
        opacity: 1,
        ease: "power2.out",
        delay: 0.12
      });
      gsap.to(".footer", {
        duration: 0.9,
        opacity: 1,
        ease: "power2.out",
        delay: 0.2
      });
      setTimeout(() => {
        this.initDraggable();
        this.setupViewportObserver();
      }, 400);
    });
  }
  setupEventListeners() {
    window.addEventListener("resize", () => {
      setTimeout(() => {
        this.resetPosition();
        this.initDraggable();
      }, 100);
    });
    document.addEventListener("mouseleave", () => this.handleMouseLeave());
    this.viewport.addEventListener("mouseleave", () => this.handleMouseLeave());
    this.closeButton.addEventListener("click", () => this.exitZoomMode());
    if (this.soundToggle) {
      this.soundToggle.addEventListener("click", () =>
        this.soundSystem.toggle()
      );
    }

    const onProjectGridActivate = (e) => {
      if (!this.isProjectFilterActive()) return;
      if (this.zoomState.isActive || this.isAboutOpen()) return;
      const cell = e.target.closest(".grid-item");
      if (
        !cell ||
        cell.classList.contains("grid-item--project-blurb") ||
        !this.gridContainer.contains(cell)
      ) {
        return;
      }
      const itemData = this.gridItems.find((g) => g.element === cell);
      if (!itemData) return;
      e.preventDefault();
      this.enterZoomMode(itemData);
    };
    if (this.gridContainer) {
      this.gridContainer.addEventListener("click", onProjectGridActivate);
    }
    if (this.viewport && this.gridContainer) {
      this.viewport.addEventListener("click", onProjectGridActivate, true);
    }

    if (this.projectHorizontalEl) {
      this.projectHorizontalEl.addEventListener("click", (e) => {
        if (!this.isProjectHorizontalMixedActive()) return;
        if (this.zoomState.isActive || this.isAboutOpen()) return;
        const card = e.target.closest(".project-h-card");
        if (
          !card ||
          !this.projectHorizontalTrack ||
          !this.projectHorizontalTrack.contains(card)
        ) {
          return;
        }
        const itemData = this.gridItems.find((g) => g.element === card);
        if (!itemData) return;
        e.preventDefault();
        this.enterZoomMode(itemData);
      });
    }

    if (this.projectEditorialEl) {
      this.projectEditorialEl.addEventListener("click", (e) => {
        if (!this.isProjectEditorialLayoutActive()) return;
        if (this.zoomState.isActive || this.isAboutOpen()) return;
        const card = e.target.closest(".project-editorial__card");
        if (
          !card ||
          !this.projectEditorialEl.contains(card)
        ) {
          return;
        }
        const itemData = this.gridItems.find((g) => g.element === card);
        if (!itemData) return;
        e.preventDefault();
        this.enterZoomMode(itemData);
      });
    }

    if (this.projectConceptEl) {
      this.projectConceptEl.addEventListener("click", (e) => {
        if (!this.isProjectConceptLayoutActive()) return;
        if (this.zoomState.isActive || this.isAboutOpen()) return;
        const heroBtn = e.target.closest("#projectConceptHeroBtn");
        if (heroBtn && this.projectConceptEl.contains(heroBtn)) {
          e.preventDefault();
          if (this.conceptHeroItemData) {
            this.enterZoomMode(this.conceptHeroItemData);
          }
          return;
        }
        const card = e.target.closest(".project-concept__card");
        if (
          !card ||
          !this.projectConceptGrid ||
          !this.projectConceptGrid.contains(card)
        ) {
          return;
        }
        const itemData = this.gridItems.find((g) => g.element === card);
        if (!itemData) return;
        e.preventDefault();
        this.enterZoomMode(itemData);
      });
    }

    document.querySelectorAll("details.header-panel").forEach((details) => {
      details.addEventListener("toggle", () => {
        if (details.open) {
          this.closeAboutSection();
          document.querySelectorAll("details.header-panel").forEach((other) => {
            if (other !== details) other.open = false;
          });
        }
      });
    });

    window.addEventListener("popstate", () => {
      if (window.location.hash === "#about") {
        if (!this.zoomState.isActive) {
          this.closeHeaderPanels();
          if (!this.isAboutOpen()) {
            this._applyAboutOpenState(true);
          }
        }
      } else if (this.isAboutOpen()) {
        this._applyAboutOpenState(false);
      }
    });

    if (this.aboutNavLink) {
      this.aboutNavLink.addEventListener("click", (e) => {
        e.preventDefault();
        if (this.isAboutOpen()) {
          this.closeAboutSection();
        } else {
          this.openAboutSection();
        }
      });
    }
    document.querySelectorAll(".header-panel__backdrop").forEach((btn) => {
      btn.addEventListener("click", () => {
        const d = btn.closest("details");
        if (d) d.open = false;
      });
    });

    document.addEventListener(
      "pointerdown",
      (e) => {
        const openPanel = document.querySelector("details.header-panel[open]");
        if (!openPanel) return;
        if (openPanel.contains(e.target)) return;
        this.closeHeaderPanels();
      },
      true
    );

    const logo = document.getElementById("logoReset");
    if (logo) {
      const onLogo = (e) => {
        if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        if (this.isAboutOpen()) {
          this.closeAboutSection();
          if (this.useLocalPortfolio) {
            this.setActiveProject(null);
          }
          return;
        }
        if (this.useLocalPortfolio) {
          this.setActiveProject(null);
        } else {
          this.closeHeaderPanels();
        }
      };
      logo.addEventListener("click", onLogo);
      logo.addEventListener("keydown", onLogo);
    }

  }
}

/**
 * Se in portfolio/portfolio-config.js è impostato __PORTFOLIO_CONFIG__.driveManifestUrl (URL App web
 * Google Apps Script), carica progetti + ID file Drive prima di avviare la galleria.
 */
async function loadPortfolioDriveManifest() {
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

/** Durata minima loader (maschera caricamenti velocissimi) */
const HOME_LOADING_MIN_MS = 600;
/** Dopo questo tempo il loader viene chiuso in ogni caso (rete bloccata, errori, ecc.) */
const HOME_LOADING_MAX_MS = 14000;
let homeLoadingStart = 0;
let homeLoadingDismissScheduled = false;

function dismissHomeLoading(onDone, options) {
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

function scheduleHomeLoadingMaxTimeout() {
  window.setTimeout(() => {
    const el = document.getElementById("homeLoadingOverlay");
    if (!el || homeLoadingDismissScheduled) return;
    homeLoadingDismissScheduled = true;
    dismissHomeLoading(
      () => {
        if (gallery && gallery.viewport) {
          gsap.set(gallery.viewport, { opacity: 1 });
        }
        try {
          if (gallery && typeof gallery.applyGridVisibleAndStartDrift === "function") {
            gallery.applyGridVisibleAndStartDrift({ entranceControls: true });
          }
          if (gallery && typeof gallery.initDraggable === "function") {
            gallery.initDraggable();
          }
          if (gallery && typeof gallery.setupViewportObserver === "function") {
            gallery.setupViewportObserver();
          }
        } catch (e) {
          console.error(e);
        }
        gsap.to(".header", { duration: 0.6, opacity: 1, ease: "power2.out" });
        gsap.to(".footer", { duration: 0.6, opacity: 1, ease: "power2.out" });
      },
      { force: true }
    );
  }, HOME_LOADING_MAX_MS);
}

let gallery;

async function fashionGalleryBoot() {
  homeLoadingStart = performance.now();
  scheduleHomeLoadingMaxTimeout();
  try {
    await loadPortfolioDriveManifest();
  } catch (err) {
    console.error(err);
  }
  try {
    gallery = new FashionGallery();
    gallery.init();
  } catch (err) {
    console.error(err);
    homeLoadingDismissScheduled = true;
    dismissHomeLoading(() => {
      if (gallery && gallery.viewport) {
        gsap.set(gallery.viewport, { opacity: 1 });
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", fashionGalleryBoot);
} else {
  fashionGalleryBoot();
}
