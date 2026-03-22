import {
  ENABLE_GRID_CARD_DRIFT,
  PF_EDITORIAL_IMG_PLACEHOLDER,
  pfMobileLayout,
  portfolioProjectDataDir,
  reorderPortfolioProjectsToCanonicalOrder,
} from "./pf-helpers.js";
import {
  pfGridEagerImageCap,
  pfPerformanceTier,
  pfPrefersReducedMotion,
  pfSlideshowPauseMultiplier,
  pfSlideshowSpeedMultiplier,
} from "./pf-performance.js";
import { dismissHomeLoading, homeLoadingFlags } from "./home-loading.js";

gsap.registerPlugin(CustomEase, Flip);

export class FashionGallery {
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
    this._horizontalRevealIO = null;
    this.projectEditorialEl = document.getElementById("projectEditorialView");
    this.projectEditorialLeft = document.getElementById("projectEditorialLeft");
    this.projectEditorialRight = document.getElementById("projectEditorialRight");
    this.projectEditorialMobileGallery =
      document.getElementById("projectEditorialMobileGallery");
    this.projectIsolaEl = document.getElementById("projectIsolaView");
    this.projectIsolaGallery = document.getElementById("projectIsolaGallery");
    this.isolaHeroItemData = null;
    this._isolaRevealIO = null;
    this.projectParigiEl = document.getElementById("projectParigiView");
    this.projectParigiGallery = document.getElementById("projectParigiGallery");
    this.parigiHeroItemData = null;
    this._parigiRevealIO = null;
    this.projectTabooEl = document.getElementById("projectTabooView");
    this.projectTabooGallery = document.getElementById("projectTabooGallery");
    this.tabooHeroItemData = null;
    this._tabooRevealIO = null;
    this.projectModaEl = document.getElementById("projectModaView");
    this.projectModaGallery = document.getElementById("projectModaGallery");
    this.modaHeroItemData = null;
    this._modaRevealIO = null;
    this.projectModaJumpEl = document.getElementById("projectModaJumpView");
    this.projectModaJumpGallery =
      document.getElementById("projectModaJumpGallery");
    this.modaJumpHeroItemData = null;
    this._modaJumpRevealIO = null;
    this.projectGallipoliEl = document.getElementById("projectGallipoliView");
    this.projectGallipoliGallery =
      document.getElementById("projectGallipoliGallery");
    this.gallipoliHeroItemData = null;
    this._gallipoliRevealIO = null;
    this.projectGallipoliDayEl = document.getElementById(
      "projectGallipoliDayView"
    );
    this.projectGallipoliDayGallery = document.getElementById(
      "projectGallipoliDayGallery"
    );
    this.gallipoliDayHeroItemData = null;
    this._gallipoliDayRevealIO = null;
    this.projectErniaEl = document.getElementById("projectErniaView");
    this.projectErniaGallery = document.getElementById("projectErniaGallery");
    this.erniaHeroItemData = null;
    this._erniaRevealIO = null;
    this.projectLaureaEl = document.getElementById("projectLaureaView");
    this.projectLaureaGallery =
      document.getElementById("projectLaureaGallery");
    this.laureaHeroItemData = null;
    this._laureaRevealIO = null;
    this.perfTier = pfPerformanceTier();
    this.prefersReducedMotion = pfPrefersReducedMotion();
    this._soundWaveRafId = null;
    this._soundWaveIdleTimer = null;
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
    /** Carico differito miniature vista editoriale (mobile, scroll interno). */
    this._editorialImageObserver = null;
    this._handleZoomKeysBound = (e) => this.handleZoomKeys(e);
    this._handleSplitAreaClickBound = (e) => this.handleSplitAreaClick(e);
    this._zoomNavTouchStartBound = (e) => this.onZoomNavTouchStart(e);
    this._zoomNavTouchEndBound = (e) => this.onZoomNavTouchEnd(e);
    this._zoomNavTouchStartX = null;
    this._zoomNavTouchStartY = null;
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
    const soundPreload =
      this.perfTier >= 2 ? "none" : this.perfTier >= 1 ? "metadata" : "auto";
    Object.values(this.soundSystem.sounds).forEach((audio) => {
      audio.preload = soundPreload;
      audio.volume = 0.3;
    });
    // Initialize sound wave canvas animation
    this.initSoundWave();
  }
  initSoundWave() {
    const canvas = document.getElementById("soundWaveCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    const width = 32;
    const height = 16;
    const centerY = Math.floor(height / 2);
    let startTime = Date.now();
    let currentAmplitude = this.soundSystem.enabled ? 1 : 0;
    const muteColor = "#D9C4AA";
    const drawStaticMute = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = muteColor;
      ctx.fillRect(0, centerY, width, 2);
    };
    if (this.prefersReducedMotion || this.perfTier >= 2) {
      drawStaticMute();
      return;
    }
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
    const primaryColor = "#2C1B14";
    const accentColor = "#A64B23";
    const scheduleFrame = (fn) => {
      if (this._soundWaveRafId != null) {
        cancelAnimationFrame(this._soundWaveRafId);
        this._soundWaveRafId = null;
      }
      if (this._soundWaveIdleTimer != null) {
        window.clearTimeout(this._soundWaveIdleTimer);
        this._soundWaveIdleTimer = null;
      }
      if (document.hidden) {
        this._soundWaveIdleTimer = window.setTimeout(fn, 800);
        return;
      }
      const waveActive =
        this.soundSystem.enabled || currentAmplitude >= 0.02;
      if (!waveActive) {
        this._soundWaveIdleTimer = window.setTimeout(fn, 320);
        return;
      }
      if (this.perfTier >= 1) {
        this._soundWaveIdleTimer = window.setTimeout(fn, 36);
        return;
      }
      this._soundWaveRafId = requestAnimationFrame(fn);
    };
    const animate = () => {
      const targetAmplitude = this.soundSystem.enabled ? 1 : 0;
      currentAmplitude += (targetAmplitude - currentAmplitude) * 0.08;
      ctx.clearRect(0, 0, width, height);
      const time = (Date.now() - startTime) / 1000;
      const muteFactor = 1 - currentAmplitude;
      if (!this.soundSystem.enabled && currentAmplitude < 0.01) {
        ctx.fillStyle = muteColor;
        ctx.fillRect(0, centerY, width, 2);
        scheduleFrame(animate);
        return;
      }
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
      scheduleFrame(animate);
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
          const resolved = this.resolvePortfolioImage(
            project,
            raw,
            indexInProject
          );
          this.catalog.push({
            type: "local",
            projectId: project.id,
            projectTitle: project.title,
            folder: project.folder,
            file: resolved.file,
            url: resolved.url,
            fullImageUrl: resolved.fullImageUrl,
            driveFileId: resolved.driveFileId || "",
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
   * Local: raw è il nome file (string), { file, thumb? }, oppure thumb da cartella globale (vedi
   * `localThumbnailSubfolder` in __PORTFOLIO_CONFIG__). La griglia usa `url` (miniatura), lo zoom `fullImageUrl`.
   * Google Drive: imposta window.__PORTFOLIO_CONFIG__.imagesFrom = "drive" e metti in images
   * l’ID file (string) o { driveId: "ID", file: "etichetta.webp" } nello stesso ordine dei file locali.
   * Con useLocalMediaForZoom + file (o localZoomImages), lo zoom usa media/projects/&lt;folder&gt;/&lt;file&gt;.
   */
  resolvePortfolioImage(project, raw, indexInProject) {
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const from = cfg.imagesFrom || "local";
    const idx =
      typeof indexInProject === "number" && indexInProject >= 0
        ? indexInProject
        : 0;

    if (from === "drive") {
      const id =
        typeof raw === "string"
          ? raw.trim()
          : (raw && (raw.driveId || raw.id || raw.fileId)) || "";
      const rawFile =
        typeof raw === "object" && raw && raw.file
          ? String(raw.file).trim()
          : "";
      const localZoomMap =
        (project && project.localZoomImages) ||
        (typeof window !== "undefined" &&
          window.__PORTFOLIO_LOCAL_ZOOM_FILES_BY_ID__ &&
          window.__PORTFOLIO_LOCAL_ZOOM_FILES_BY_ID__[String(project.id)]) ||
        null;
      const nameFromIndex =
        Array.isArray(localZoomMap) && localZoomMap[idx] != null
          ? String(localZoomMap[idx]).trim()
          : "";
      const zoomLocalFile = nameFromIndex || rawFile;
      const file =
        zoomLocalFile ||
        rawFile ||
        (id ? `img-${id.slice(0, 8)}` : "img-x");
      const enc = id ? encodeURIComponent(id) : "";
      const thumbTpl =
        cfg.driveThumbnailTemplate ||
        "https://drive.google.com/thumbnail?id={id}&sz=w1200";
      const fullTpl =
        cfg.driveFullTemplate ||
        (cfg.driveUrlTemplate
          ? cfg.driveUrlTemplate
          : "https://drive.google.com/thumbnail?id={id}&sz=w3840");
      const driveFullRemote = enc ? fullTpl.split("{id}").join(enc) : "";
      const useThumb = cfg.useThumbnailsInGrid !== false;
      const url =
        enc && useThumb
          ? thumbTpl.split("{id}").join(enc)
          : driveFullRemote;
      let fullImageUrl = "";
      if (
        cfg.useLocalMediaForZoom &&
        project &&
        project.folder &&
        zoomLocalFile
      ) {
        fullImageUrl = this.mediaProjectUrl(project.folder, zoomLocalFile);
      } else if (driveFullRemote) {
        fullImageUrl = driveFullRemote;
      } else {
        fullImageUrl = url;
      }
      return {
        url,
        fullImageUrl: fullImageUrl || url,
        file,
        driveFileId: id || ""
      };
    }

    const file =
      typeof raw === "string" ? raw : raw && raw.file ? raw.file : "";
    if (!file) {
      const u = this.mediaProjectUrl(project.folder, "missing.webp");
      return { url: u, fullImageUrl: u, file: "missing.webp", driveFileId: "" };
    }
    const fullUrl = this.mediaProjectUrl(project.folder, file);
    const thumbOverride =
      typeof raw === "object" &&
      raw != null &&
      typeof raw.thumb === "string" &&
      raw.thumb.trim();
    if (thumbOverride) {
      return {
        url: this.mediaProjectUrl(project.folder, thumbOverride.trim()),
        fullImageUrl: fullUrl,
        file,
        driveFileId: ""
      };
    }
    const thumbSub = String(cfg.localThumbnailSubfolder || "")
      .trim()
      .replace(/^\/+|\/+$/g, "");
    if (thumbSub) {
      const thumbRel = `${thumbSub}/${file}`.replace(/\/+/g, "/");
      return {
        url: this.mediaProjectUrl(project.folder, thumbRel),
        fullImageUrl: fullUrl,
        file,
        driveFileId: ""
      };
    }
    return { url: fullUrl, fullImageUrl: fullUrl, file, driveFileId: "" };
  }
  /**
   * Miniatura Drive più stretta per la vista editoriale su mobile (meno MB e meno richieste parallele).
   * Lo zoom usa `getZoomPrimaryImageUrl` (sz intermedia, non w3840).
   */
  getDriveEditorialMobileThumbUrl(driveFileId) {
    const id = String(driveFileId || "").trim();
    if (!id) return "";
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const w = Math.min(
      1600,
      Math.max(400, Number(cfg.driveEditorialMobileThumbWidth) || 720)
    );
    const enc = encodeURIComponent(id);
    return `https://drive.google.com/thumbnail?id=${enc}&sz=w${w}`;
  }
  buildDriveThumbnailByFileId(driveFileId, maxWidth) {
    const id = String(driveFileId || "").trim();
    if (!id) return "";
    const w = Math.min(3840, Math.max(400, Math.round(maxWidth)));
    const enc = encodeURIComponent(id);
    return `https://drive.google.com/thumbnail?id=${enc}&sz=w${w}`;
  }
  /** Slide visibile nella cella (indice aggiornato dallo slideshow). */
  getGridItemCurrentSlide(itemData) {
    const slides = itemData && itemData.slideshowSlides;
    if (!slides || !slides.length) return null;
    const idxRaw = itemData.currentSlideIndex;
    const idx =
      typeof idxRaw === "number" && idxRaw >= 0 && idxRaw < slides.length
        ? idxRaw
        : 0;
    return slides[idx] || slides[0];
  }
  getDriveFileIdFromGridItem(itemData) {
    const s = this.getGridItemCurrentSlide(itemData);
    const cat = s && s.catalogEntry;
    if (!cat) return "";
    return String(cat.driveFileId || "").trim();
  }
  /**
   * Allinea metadati zoom/titoli alla slide corrente (dopo avanzamento slideshow o snap).
   */
  syncGridItemUrlsToCurrentSlide(itemData) {
    const s = this.getGridItemCurrentSlide(itemData);
    if (!s) return;
    itemData.imageUrl = s.url;
    itemData.fullImageUrl = s.fullImageUrl || s.url;
    const metaEntry =
      s.catalogEntry ||
      (s.overlayIndex != null
        ? { type: "remote", overlayIndex: s.overlayIndex }
        : null);
    if (metaEntry) {
      itemData.overlayMeta = this.buildOverlayMeta(metaEntry);
    }
  }
  /**
   * URL usato nello zoom fullscreen: su Drive evita w3840 (lento e “a pezzi” su rete mobile).
   * Usa sempre la slide corrente dello slideshow, non solo quella iniziale.
   */
  getZoomPrimaryImageUrl(itemData) {
    if (!itemData) return "";
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const slide = this.getGridItemCurrentSlide(itemData);
    const fullStr = String(
      (slide && slide.fullImageUrl) || itemData.fullImageUrl || ""
    );
    if (
      cfg.useLocalMediaForZoom &&
      fullStr &&
      fullStr.indexOf("drive.google.com") === -1
    ) {
      return fullStr;
    }
    const drive = cfg.imagesFrom === "drive";
    const id = this.getDriveFileIdFromGridItem(itemData);
    if (drive && id) {
      const mobile = pfMobileLayout();
      const w = mobile
        ? Math.min(
            1920,
            Math.max(800, Number(cfg.driveZoomMobileMaxWidth) || 1440)
          )
        : Math.min(
            3200,
            Math.max(1400, Number(cfg.driveZoomDesktopMaxWidth) || 2560)
          );
      return this.buildDriveThumbnailByFileId(id, w);
    }
    return (
      (slide && slide.fullImageUrl) ||
      itemData.fullImageUrl ||
      itemData.imageUrl ||
      (itemData.img && itemData.img.src) ||
      ""
    );
  }
  /**
   * Thumb griglia / imageUrl: visibile subito nello swipe zoom mentre il full-res (es. webp locale) scarica.
   */
  pickZoomSwapThumbUrl(newItem) {
    if (!newItem) return "";
    const tryU = (u) => {
      const s = String(u || "").trim();
      if (
        !s ||
        s === PF_EDITORIAL_IMG_PLACEHOLDER ||
        s.indexOf("data:") === 0
      ) {
        return "";
      }
      return s;
    };
    const fromImg =
      newItem.img &&
      (newItem.img.currentSrc ||
        (newItem.img.getAttribute && newItem.img.getAttribute("src")));
    const a = tryU(fromImg);
    if (a) return a;
    return tryU(newItem.imageUrl);
  }
  clearZoomPrefetchTimers() {
    const list = this._zoomPrefetchTimers;
    if (!list || !list.length) return;
    for (let k = 0; k < list.length; k++) clearTimeout(list[k]);
    this._zoomPrefetchTimers = [];
  }
  /**
   * Precarica vicini in modo sfalsato: molte richieste parallele saturano il browser (6 conn/host)
   * e la foto corrente resta in coda → schermo nero se lo zoom aspetta il prefetch.
   */
  preloadZoomNeighborImages(centerItem) {
    const items = this.getZoomNavigableGridItems();
    const i = items.indexOf(centerItem);
    if (i < 0) return;
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    let radius = Number(cfg.zoomPrefetchNeighborRadius);
    if (!Number.isFinite(radius) || radius < 1) {
      radius = cfg.useLocalMediaForZoom ? 4 : 2;
    }
    radius = Math.min(12, Math.floor(radius));
    this.clearZoomPrefetchTimers();
    if (!this._zoomPrefetchTimers) this._zoomPrefetchTimers = [];
    const staggerMs = Math.max(
      40,
      Math.min(200, Number(cfg.zoomPrefetchStaggerMs) || 90)
    );
    let farSlot = 0;
    for (let d = -radius; d <= radius; d++) {
      if (d === 0) continue;
      const j = i + d;
      if (j < 0 || j >= items.length) continue;
      const url = this.getZoomPrimaryImageUrl(items[j]);
      if (!url) continue;
      const delay =
        Math.abs(d) <= 2 ? 0 : 50 + farSlot++ * staggerMs;
      const id = setTimeout(() => {
        if (!this.zoomState || !this.zoomState.isActive) return;
        const im = new Image();
        if (String(url).indexOf("drive.google.com") !== -1) {
          im.referrerPolicy = "no-referrer";
        }
        im.decoding = "async";
        im.src = url;
      }, delay);
      this._zoomPrefetchTimers.push(id);
    }
  }
  /** URL mostrato sulla card editoriale (mobile + Drive → thumb ridotta). */
  resolveEditorialCardDisplayUrl(entry, slide0Url) {
    if (
      pfMobileLayout() &&
      entry &&
      entry.driveFileId &&
      ((typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {})
        .imagesFrom === "drive"
    ) {
      const u = this.getDriveEditorialMobileThumbUrl(entry.driveFileId);
      if (u) return u;
    }
    return slide0Url;
  }
  disconnectEditorialImageObserver() {
    if (this._editorialImageObserver) {
      this._editorialImageObserver.disconnect();
      this._editorialImageObserver = null;
    }
  }
  observeEditorialLazyImage(img) {
    if (!img || !this.projectEditorialEl) return;
    if (!this._editorialImageObserver) {
      this._editorialImageObserver = new IntersectionObserver(
        (records) => {
          for (let i = 0; i < records.length; i++) {
            const rec = records[i];
            if (!rec.isIntersecting) continue;
            const el = rec.target;
            const ds = el.dataset.src;
            if (ds) {
              el.src = ds;
              delete el.dataset.src;
            }
            this._editorialImageObserver.unobserve(el);
          }
        },
        {
          root: this.projectEditorialEl,
          rootMargin: "70% 0px",
          threshold: 0.01
        }
      );
    }
    this._editorialImageObserver.observe(img);
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
      !this.isProjectIsolaLayoutActive() &&
      !this.isProjectParigiLayoutActive() &&
      !this.isProjectTabooLayoutActive() &&
      !this.isProjectModaLayoutActive() &&
      !this.isProjectModaJumpLayoutActive() &&
      !this.isProjectGallipoliFestivalLayoutActive() &&
      !this.isProjectGallipoliDayLayoutActive() &&
      !this.isProjectErniaLiveLayoutActive() &&
      !this.isProjectLaureaAlbumLayoutActive() &&
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
          !this.isProjectHorizontalMixedActive() &&
          !this.isProjectIsolaLayoutActive() &&
          !this.isProjectParigiLayoutActive() &&
          !this.isProjectTabooLayoutActive() &&
          !this.isProjectModaLayoutActive() &&
          !this.isProjectModaJumpLayoutActive() &&
          !this.isProjectGallipoliFestivalLayoutActive() &&
          !this.isProjectGallipoliDayLayoutActive() &&
          !this.isProjectErniaLiveLayoutActive() &&
          !this.isProjectLaureaAlbumLayoutActive()
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
    if (Array.isArray(p.summaryParagraphs) && p.summaryParagraphs.length) {
      return p.summaryParagraphs
        .map((x) => String(x).trim())
        .filter(Boolean)
        .join("\n\n");
    }
    if (typeof p.summary === "string" && p.summary.trim()) {
      return p.summary.trim();
    }
    if (typeof p.blurb === "string" && p.blurb.trim()) {
      return p.blurb.trim();
    }
    return "";
  }
  /**
   * Paragrafi lunghi per vista NUDE (horizontal-mixed): da `summaryParagraphs` o da summary spezzato.
   */
  getProjectSummaryParagraphs(projectId) {
    const list = window.__PORTFOLIO_PROJECTS__;
    const p = Array.isArray(list)
      ? list.find((x) => String(x.id) === String(projectId))
      : null;
    if (!p) return [];
    if (Array.isArray(p.summaryParagraphs) && p.summaryParagraphs.length) {
      return p.summaryParagraphs.map((x) => String(x).trim()).filter(Boolean);
    }
    return this.splitSummaryIntoReadableParagraphs(
      this.getProjectSummaryText(projectId)
    );
  }
  splitSummaryIntoReadableParagraphs(s) {
    if (!s || !String(s).trim()) return [];
    const blocks = String(s)
      .split(/\n\n+/)
      .map((b) => b.replace(/\n+/g, " ").trim())
      .filter(Boolean);
    const out = [];
    const maxChunk = 380;
    for (const b of blocks) {
      if (b.length <= maxChunk) {
        out.push(b);
        continue;
      }
      const parts = b.split(/\.\s+/);
      let cur = "";
      for (let i = 0; i < parts.length; i++) {
        const piece = i < parts.length - 1 ? `${parts[i]}.` : parts[i];
        const next = cur ? `${cur} ${piece}`.trim() : piece;
        if (next.length > maxChunk && cur) {
          out.push(cur.trim());
          cur = piece;
        } else {
          cur = next;
        }
      }
      if (cur.trim()) out.push(cur.trim());
    }
    return out;
  }
  teardownProjectHorizontalReveal() {
    if (this._horizontalRevealIO) {
      this._horizontalRevealIO.disconnect();
      this._horizontalRevealIO = null;
    }
    const root = this.projectHorizontalEl;
    if (root) {
      root.dataset.animate = "0";
      root
        .querySelectorAll(".is-inview")
        .forEach((el) => el.classList.remove("is-inview"));
    }
  }
  setupProjectHorizontalScrollReveal() {
    const root = this.projectHorizontalEl;
    if (!root) return;
    this.teardownProjectHorizontalReveal();
    const reduce = this.prefersReducedMotion || this.perfTier >= 2;
    root.dataset.animate = reduce ? "0" : "1";
    const nodes = root.querySelectorAll(".project-h__p, .project-h-card");
    if (reduce) {
      nodes.forEach((el) => el.classList.add("is-inview"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-inview");
            io.unobserve(en.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.12 }
    );
    nodes.forEach((el) => io.observe(el));
    this._horizontalRevealIO = io;
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
    if (this.isProjectIsolaLayoutActive()) return false;
    if (this.isProjectParigiLayoutActive()) return false;
    if (this.isProjectTabooLayoutActive()) return false;
    if (this.isProjectModaLayoutActive()) return false;
    if (this.isProjectModaJumpLayoutActive()) return false;
    if (this.isProjectGallipoliFestivalLayoutActive()) return false;
    if (this.isProjectGallipoliDayLayoutActive()) return false;
    if (this.isProjectErniaLiveLayoutActive()) return false;
    if (this.isProjectLaureaAlbumLayoutActive()) return false;
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
  /** NUDE (horizontal-mixed): layout editoriale 2 colonne + galleria verticale (project-nude-editorial.css). */
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
  /** L'isola / Fuerteventura: hero split editoriale + testo + galleria a ritmo (project-lisola.css). */
  isProjectIsolaLayoutActive() {
    const p = this.getActiveProjectRecord();
    return !!(p && p.layout === "isola");
  }
  /** Parigi: hero minimale + interludio + galleria editoriale urbana (project-parigi.css). */
  isProjectParigiLayoutActive() {
    const p = this.getActiveProjectRecord();
    return !!(p && p.layout === "parigi");
  }
  /** Taboo Shooting: reportage documentario + testo + galleria (project-taboo.css). */
  isProjectTabooLayoutActive() {
    const p = this.getActiveProjectRecord();
    return !!(p && p.layout === "taboo");
  }
  /** Moda Shooting: editoriale fashion + testo + galleria (project-moda.css). */
  isProjectModaLayoutActive() {
    const p = this.getActiveProjectRecord();
    return !!(p && p.layout === "moda");
  }
  /** Moda Jump: hero essenziale + galleria a colonna (project-moda-jump.css). */
  isProjectModaJumpLayoutActive() {
    const p = this.getActiveProjectRecord();
    return !!(p && p.layout === "modaJump");
  }
  /** Gallipoli notte / festival: hero notturno + galleria a ritmo (project-gallipoli.css). */
  isProjectGallipoliFestivalLayoutActive() {
    const p = this.getActiveProjectRecord();
    return !!(p && p.layout === "gallipoliFestival");
  }
  /** Gallipoli giorno / pre-festa (project-gallipoli-day.css). */
  isProjectGallipoliDayLayoutActive() {
    const p = this.getActiveProjectRecord();
    return !!(p && p.layout === "gallipoliDay");
  }
  /** Concerti – Ernia: live editoriale (project-ernia.css). */
  isProjectErniaLiveLayoutActive() {
    const p = this.getActiveProjectRecord();
    return !!(p && p.layout === "erniaLive");
  }
  /** Laurea – Ame: album personale (project-laurea.css). */
  isProjectLaureaAlbumLayoutActive() {
    const p = this.getActiveProjectRecord();
    return !!(p && p.layout === "laureaAlbum");
  }
  /** Su mobile il testo viene spostato sotto la galleria; ripristina il DOM per desktop / teardown. */
  ensureEditorialArticleInMain() {
    const root = this.projectEditorialEl;
    const articleEl = document.getElementById("projectEditorialArticle");
    const main = root?.querySelector(".project-editorial__main");
    if (!articleEl || !main) return;
    if (articleEl.parentNode !== main) {
      main.appendChild(articleEl);
    }
  }
  teardownProjectEditorialView() {
    this.disconnectEditorialImageObserver();
    this.ensureEditorialArticleInMain();
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
  appendEditorialCard(containerEl, entry, variant, itemIndex, editorialOpts) {
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
    let slideIdx = 0;
    if (slides.length && entry && entry.indexInProject != null) {
      const found = slides.findIndex(
        (s) =>
          s.catalogEntry &&
          s.catalogEntry.indexInProject === entry.indexInProject
      );
      if (found >= 0) slideIdx = found;
    }
    const activeSlide = slides[slideIdx] || slides[0];
    const displaySrc = this.resolveEditorialCardDisplayUrl(entry, activeSlide.url);
    const deferLoad =
      editorialOpts &&
      editorialOpts.deferLoad === true &&
      pfMobileLayout() &&
      this.projectEditorialEl;
    if (deferLoad) {
      img.src = PF_EDITORIAL_IMG_PLACEHOLDER;
      img.dataset.src = displaySrc;
      img.loading = "lazy";
    } else {
      img.src = displaySrc;
      img.loading =
        variant === "finale"
          ? "eager"
          : itemIndex < 2 && containerEl === this.projectEditorialMobileGallery
            ? "eager"
            : "lazy";
      if (
        itemIndex === 0 &&
        variant !== "finale" &&
        containerEl === this.projectEditorialMobileGallery
      ) {
        img.setAttribute("fetchpriority", "high");
      }
    }
    if (deferLoad) {
      this.observeEditorialLazyImage(img);
    }
    img.alt = activeSlide.alt;
    btn.appendChild(img);
    containerEl.appendChild(btn);
    const itemData = {
      element: btn,
      img,
      slideViewport: btn,
      slideTrack: null,
      slideshowSlides: slides,
      currentSlideIndex: slideIdx,
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
      imageUrl: displaySrc,
      fullImageUrl: activeSlide.fullImageUrl,
      index: itemIndex,
      overlayMeta: this.buildOverlayMeta(
        activeSlide.catalogEntry ||
          (entry.type === "remote"
            ? {
                type: "remote",
                overlayIndex:
                  activeSlide.overlayIndex ?? entry.overlayIndex ?? itemIndex
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

    this.ensureEditorialArticleInMain();
    this.disconnectEditorialImageObserver();

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
    }
    const finaleEl = document.getElementById("projectEditorialFinale");
    if (finaleEl) finaleEl.innerHTML = "";

    const n = entries.length;
    const useMobile = pfMobileLayout();
    const finaleSeparate = n > 1;
    const stripCount = finaleSeparate ? n - 1 : 0;

    if (mobileGal) {
      mobileGal.hidden = !useMobile || stripCount === 0;
    }

    for (let i = 0; i < stripCount; i++) {
      const v = this.pickEditorialCardVariant(i, stripCount);
      const target = useMobile
        ? mobileGal
        : i % 2 === 0
          ? left
          : right;
      if (target) {
        this.appendEditorialCard(target, entries[i], v, i, {
          deferLoad: useMobile && i >= 2
        });
      }
    }

    if (finaleEl && n > 0) {
      const last = entries[n - 1];
      const lastIdx = n - 1;
      this.appendEditorialCard(finaleEl, last, "finale", lastIdx, {
        deferLoad: useMobile && stripCount > 0
      });
    }

    /* Mobile: titolo in alto, tutte le foto al centro, testo completo in fondo (scroll unico). */
    if (useMobile && articleEl && root) {
      const scroll = root.querySelector(".project-editorial__scroll");
      if (scroll) scroll.appendChild(articleEl);
    }

    root.hidden = false;
    root.removeAttribute("hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-editorial-active");
    gsap.set(this.viewport, { visibility: "hidden", pointerEvents: "none" });
  }
  teardownProjectHorizontalView() {
    document.body.classList.remove("project-horizontal-active");
    this.teardownProjectHorizontalReveal();
    const root = this.projectHorizontalEl;
    if (root) {
      root.hidden = true;
      root.setAttribute("hidden", "");
      root.setAttribute("aria-hidden", "true");
    }
    if (this.projectHorizontalTrack) this.projectHorizontalTrack.innerHTML = "";
    const articleEl = document.getElementById("projectHorizontalArticle");
    if (articleEl) articleEl.innerHTML = "";
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "visible", pointerEvents: "auto" });
    }
  }
  teardownIsolaScrollReveal() {
    if (this._isolaRevealIO) {
      this._isolaRevealIO.disconnect();
      this._isolaRevealIO = null;
    }
  }
  setupIsolaScrollReveal() {
    this.teardownIsolaScrollReveal();
    const root = this.projectIsolaEl;
    if (!root || root.hidden) return;
    const cards = root.querySelectorAll(".project-isola__card");
    const nodes = [...cards];
    nodes.forEach((el, i) => {
      el.classList.remove("is-inview");
      el.style.setProperty(
        "--reveal-delay",
        `${Math.min(i * 0.045, 0.42)}s`
      );
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-inview");
            io.unobserve(en.target);
          }
        });
      },
      { root, rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    nodes.forEach((el) => io.observe(el));
    this._isolaRevealIO = io;
  }
  teardownParigiScrollReveal() {
    if (this._parigiRevealIO) {
      this._parigiRevealIO.disconnect();
      this._parigiRevealIO = null;
    }
  }
  setupParigiScrollReveal() {
    this.teardownParigiScrollReveal();
    const root = this.projectParigiEl;
    if (!root || root.hidden) return;
    const cards = root.querySelectorAll(".project-parigi__card");
    const nodes = [...cards];
    nodes.forEach((el, i) => {
      el.classList.remove("is-inview");
      el.style.setProperty(
        "--reveal-delay",
        `${Math.min(i * 0.05, 0.45)}s`
      );
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-inview");
            io.unobserve(en.target);
          }
        });
      },
      { root, rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    nodes.forEach((el) => io.observe(el));
    this._parigiRevealIO = io;
  }
  /**
   * Ritmo galleria Parigi: panoramica → coppia verticale → panoramica → terzina → chiusura verticale.
   * Solo classi s12 / s6 / s4 + modificatore portrait dove serve.
   */
  pickParigiGalleryClassList(index) {
    const base = [
      { span: "s12", portrait: false },
      { span: "s6", portrait: true },
      { span: "s6", portrait: true },
      { span: "s12", portrait: false },
      { span: "s4", portrait: false },
      { span: "s4", portrait: false },
      { span: "s4", portrait: false },
      { span: "s12", portrait: true }
    ];
    const spec = base[index % base.length];
    let cls = `project-parigi__card--${spec.span}`;
    if (spec.portrait) cls += " project-parigi__card--portrait";
    return cls;
  }
  appendParigiGalleryCard(galleryEl, entry, spanClasses, itemIndex) {
    if (!galleryEl || !entry) return;
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `project-parigi__card ${spanClasses}`;
    const img = document.createElement("img");
    img.decoding = "async";
    if (driveImages) img.referrerPolicy = "no-referrer";
    const slides = this.buildSlideshowSlides(entry);
    const slide0 = slides[0];
    img.src = slide0.url;
    img.alt = slide0.alt;
    img.loading = itemIndex < 4 ? "eager" : "lazy";
    btn.appendChild(img);
    galleryEl.appendChild(btn);
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
  buildProjectParigiView() {
    const root = this.projectParigiEl;
    const galleryEl = this.projectParigiGallery;
    const heroImg = document.getElementById("projectParigiHeroImg");
    const heroBtn = document.getElementById("projectParigiHeroBtn");
    if (!root || !galleryEl || !heroImg) return;

    this.teardownParigiScrollReveal();
    this.gridContainer.innerHTML = "";
    this.gridItems = [];
    this.parigiHeroItemData = null;
    if (heroBtn) heroBtn.disabled = true;

    const rawItems = this.getDisplayItemsForGrid();
    const entries = [...rawItems].sort(
      (a, b) => (a.indexInProject ?? 0) - (b.indexInProject ?? 0)
    );
    const rec = this.getActiveProjectRecord();
    const pid = entries[0]?.projectId;
    const ord = pid != null ? this.projectOrdinalInPortfolio(pid) : 1;

    let heroIdx = 0;
    const heroFile = rec && rec.heroImage;
    if (heroFile) {
      const hi = entries.findIndex(
        (e) => String(e.file || "") === String(heroFile)
      );
      if (hi >= 0) heroIdx = hi;
    }

    const heroEntry = entries[heroIdx] || entries[0];
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    heroImg.decoding = "async";
    if (driveImages) heroImg.referrerPolicy = "no-referrer";
    if (heroEntry) {
      const slidesH = this.buildSlideshowSlides(heroEntry);
      const sh0 = slidesH[0];
      if (sh0) {
        heroImg.src = sh0.url;
        heroImg.alt = sh0.alt || "";
        if (heroBtn) {
          heroBtn.disabled = false;
          this.parigiHeroItemData = {
            element: heroBtn,
            img: heroImg,
            slideViewport: heroBtn,
            slideTrack: null,
            slideshowSlides: slidesH,
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
            imageUrl: sh0.url,
            fullImageUrl: sh0.fullImageUrl,
            index: -1,
            overlayMeta: this.buildOverlayMeta(
              sh0.catalogEntry ||
                (heroEntry.type === "remote"
                  ? {
                      type: "remote",
                      overlayIndex:
                        sh0.overlayIndex ?? heroEntry.overlayIndex ?? 0
                    }
                  : heroEntry)
            )
          };
          this.gridItems.push(this.parigiHeroItemData);
        }
      } else {
        heroImg.removeAttribute("src");
        heroImg.alt = "";
      }
    } else {
      heroImg.removeAttribute("src");
      heroImg.alt = "";
    }

    const eyebrowEl = document.getElementById("projectParigiEyebrow");
    if (eyebrowEl) {
      const label =
        rec && rec.parigiProjectLabel && String(rec.parigiProjectLabel).trim();
      eyebrowEl.textContent =
        label || `PROJECT ${String(ord).padStart(2, "0")}`;
    }
    const titleEl = document.getElementById("projectParigiTitle");
    if (titleEl) titleEl.textContent = (rec && rec.title) || "";

    const interWrap = document.getElementById("projectParigiInterludeWrap");
    const interEl = document.getElementById("projectParigiInterlude");
    const line =
      rec && rec.parigiPullLine && String(rec.parigiPullLine).trim();
    if (interWrap && interEl) {
      if (line) {
        interEl.textContent = line;
        interWrap.hidden = false;
      } else {
        interEl.textContent = "";
        interWrap.hidden = true;
      }
    }

    galleryEl.innerHTML = "";
    const galleryEntries =
      entries.length <= 1 ? [] : entries.filter((_, i) => i !== heroIdx);
    galleryEntries.forEach((entry, i) => {
      const spanCls = this.pickParigiGalleryClassList(i);
      this.appendParigiGalleryCard(galleryEl, entry, spanCls, i);
    });

    root.hidden = false;
    root.removeAttribute("hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-parigi-active");
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "hidden", pointerEvents: "none" });
    }
    this.setupParigiScrollReveal();
  }
  teardownProjectParigiView() {
    this.teardownParigiScrollReveal();
    this.parigiHeroItemData = null;
    document.body.classList.remove("project-parigi-active");
    const root = this.projectParigiEl;
    if (root) {
      root.hidden = true;
      root.setAttribute("hidden", "");
      root.setAttribute("aria-hidden", "true");
    }
    if (this.projectParigiGallery) this.projectParigiGallery.innerHTML = "";
    const heroBtnEl = document.getElementById("projectParigiHeroBtn");
    if (heroBtnEl) heroBtnEl.disabled = true;
    const heroImg = document.getElementById("projectParigiHeroImg");
    if (heroImg) {
      heroImg.removeAttribute("src");
      heroImg.alt = "";
    }
    const interW = document.getElementById("projectParigiInterludeWrap");
    const interP = document.getElementById("projectParigiInterlude");
    if (interP) interP.textContent = "";
    if (interW) interW.hidden = true;
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "visible", pointerEvents: "auto" });
    }
  }
  teardownModaJumpScrollReveal() {
    if (this._modaJumpRevealIO) {
      this._modaJumpRevealIO.disconnect();
      this._modaJumpRevealIO = null;
    }
  }
  setupModaJumpScrollReveal() {
    this.teardownModaJumpScrollReveal();
    const root = this.projectModaJumpEl;
    if (!root || root.hidden) return;
    const cards = root.querySelectorAll(".project-moda-jump__card");
    const nodes = [...cards];
    nodes.forEach((el, i) => {
      el.classList.remove("is-inview");
      el.style.setProperty(
        "--reveal-delay",
        `${Math.min(i * 0.055, 0.48)}s`
      );
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-inview");
            io.unobserve(en.target);
          }
        });
      },
      { root, rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    nodes.forEach((el) => io.observe(el));
    this._modaJumpRevealIO = io;
  }
  appendModaJumpGalleryCard(galleryEl, entry, itemIndex) {
    if (!galleryEl || !entry) return;
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "project-moda-jump__card";
    const img = document.createElement("img");
    img.decoding = "async";
    if (driveImages) img.referrerPolicy = "no-referrer";
    const slides = this.buildSlideshowSlides(entry);
    const slide0 = slides[0];
    img.src = slide0.url;
    img.alt = slide0.alt;
    img.loading = itemIndex < 4 ? "eager" : "lazy";
    btn.appendChild(img);
    galleryEl.appendChild(btn);
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
  buildProjectModaJumpView() {
    const root = this.projectModaJumpEl;
    const galleryEl = this.projectModaJumpGallery;
    const heroImg = document.getElementById("projectModaJumpHeroImg");
    const heroBtn = document.getElementById("projectModaJumpHeroBtn");
    if (!root || !galleryEl || !heroImg) return;

    this.teardownModaJumpScrollReveal();
    this.gridContainer.innerHTML = "";
    this.gridItems = [];
    this.modaJumpHeroItemData = null;
    if (heroBtn) heroBtn.disabled = true;

    const rawItems = this.getDisplayItemsForGrid();
    const entries = [...rawItems].sort(
      (a, b) => (a.indexInProject ?? 0) - (b.indexInProject ?? 0)
    );
    const rec = this.getActiveProjectRecord();
    const pid = entries[0]?.projectId;
    const ord = pid != null ? this.projectOrdinalInPortfolio(pid) : 1;

    let heroIdx = 0;
    const heroFile = rec && rec.heroImage;
    if (heroFile) {
      const hi = entries.findIndex(
        (e) => String(e.file || "") === String(heroFile)
      );
      if (hi >= 0) heroIdx = hi;
    }

    const heroEntry = entries[heroIdx] || entries[0];
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    heroImg.decoding = "async";
    if (driveImages) heroImg.referrerPolicy = "no-referrer";
    if (heroEntry) {
      const slidesH = this.buildSlideshowSlides(heroEntry);
      const sh0 = slidesH[0];
      if (sh0) {
        heroImg.src = sh0.url;
        heroImg.alt = sh0.alt || "";
        if (heroBtn) {
          heroBtn.disabled = false;
          this.modaJumpHeroItemData = {
            element: heroBtn,
            img: heroImg,
            slideViewport: heroBtn,
            slideTrack: null,
            slideshowSlides: slidesH,
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
            imageUrl: sh0.url,
            fullImageUrl: sh0.fullImageUrl,
            index: -1,
            overlayMeta: this.buildOverlayMeta(
              sh0.catalogEntry ||
                (heroEntry.type === "remote"
                  ? {
                      type: "remote",
                      overlayIndex:
                        sh0.overlayIndex ?? heroEntry.overlayIndex ?? 0
                    }
                  : heroEntry)
            )
          };
          this.gridItems.push(this.modaJumpHeroItemData);
        }
      } else {
        heroImg.removeAttribute("src");
        heroImg.alt = "";
      }
    } else {
      heroImg.removeAttribute("src");
      heroImg.alt = "";
    }

    const eyebrowEl = document.getElementById("projectModaJumpEyebrow");
    if (eyebrowEl) {
      const label =
        rec &&
        rec.modaJumpProjectLabel &&
        String(rec.modaJumpProjectLabel).trim();
      eyebrowEl.textContent =
        label || `PROJECT ${String(ord).padStart(2, "0")}`;
    }
    const titleEl = document.getElementById("projectModaJumpTitle");
    if (titleEl) titleEl.textContent = (rec && rec.title) || "";

    const interWrap = document.getElementById("projectModaJumpInterludeWrap");
    const interEl = document.getElementById("projectModaJumpInterlude");
    const line =
      rec && rec.modaJumpMicroLine && String(rec.modaJumpMicroLine).trim();
    if (interWrap && interEl) {
      if (line) {
        interEl.textContent = line;
        interWrap.hidden = false;
      } else {
        interEl.textContent = "";
        interWrap.hidden = true;
      }
    }

    galleryEl.innerHTML = "";
    const galleryEntries =
      entries.length <= 1 ? [] : entries.filter((_, i) => i !== heroIdx);
    galleryEntries.forEach((entry, i) => {
      this.appendModaJumpGalleryCard(galleryEl, entry, i);
    });

    root.hidden = false;
    root.removeAttribute("hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-moda-jump-active");
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "hidden", pointerEvents: "none" });
    }
    this.setupModaJumpScrollReveal();
  }
  teardownProjectModaJumpView() {
    this.teardownModaJumpScrollReveal();
    this.modaJumpHeroItemData = null;
    document.body.classList.remove("project-moda-jump-active");
    const root = this.projectModaJumpEl;
    if (root) {
      root.hidden = true;
      root.setAttribute("hidden", "");
      root.setAttribute("aria-hidden", "true");
    }
    if (this.projectModaJumpGallery) this.projectModaJumpGallery.innerHTML = "";
    const heroBtnEl = document.getElementById("projectModaJumpHeroBtn");
    if (heroBtnEl) heroBtnEl.disabled = true;
    const heroImg = document.getElementById("projectModaJumpHeroImg");
    if (heroImg) {
      heroImg.removeAttribute("src");
      heroImg.alt = "";
    }
    const interW = document.getElementById("projectModaJumpInterludeWrap");
    const interP = document.getElementById("projectModaJumpInterlude");
    if (interP) interP.textContent = "";
    if (interW) interW.hidden = true;
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "visible", pointerEvents: "auto" });
    }
  }
  teardownGallipoliScrollReveal() {
    if (this._gallipoliRevealIO) {
      this._gallipoliRevealIO.disconnect();
      this._gallipoliRevealIO = null;
    }
  }
  setupGallipoliScrollReveal() {
    this.teardownGallipoliScrollReveal();
    const root = this.projectGallipoliEl;
    if (!root || root.hidden) return;
    const cards = root.querySelectorAll(".project-gallipoli__card");
    const nodes = [...cards];
    nodes.forEach((el, i) => {
      el.classList.remove("is-inview");
      el.style.setProperty(
        "--reveal-delay",
        `${Math.min(i * 0.038, 0.36)}s`
      );
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-inview");
            io.unobserve(en.target);
          }
        });
      },
      { root, rootMargin: "0px 0px -5% 0px", threshold: 0.05 }
    );
    nodes.forEach((el) => io.observe(el));
    this._gallipoliRevealIO = io;
  }
  /**
   * Ritmo galleria Gallipoli: full → coppie → vert+wide → trio → chiusure alternate.
   */
  pickGallipoliGalleryClassList(index) {
    const pattern = [
      "project-gallipoli__card--full",
      "project-gallipoli__card--half",
      "project-gallipoli__card--half",
      "project-gallipoli__card--tall",
      "project-gallipoli__card--wide",
      "project-gallipoli__card--full",
      "project-gallipoli__card--feature",
      "project-gallipoli__card--vert",
      "project-gallipoli__card--third",
      "project-gallipoli__card--third",
      "project-gallipoli__card--third",
      "project-gallipoli__card--half",
      "project-gallipoli__card--half",
      "project-gallipoli__card--full",
      "project-gallipoli__card--wide",
      "project-gallipoli__card--tall"
    ];
    return pattern[index % pattern.length];
  }
  appendGallipoliGalleryCard(galleryEl, entry, spanClasses, itemIndex) {
    if (!galleryEl || !entry) return;
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `project-gallipoli__card ${spanClasses}`;
    const img = document.createElement("img");
    img.decoding = "async";
    if (driveImages) img.referrerPolicy = "no-referrer";
    const slides = this.buildSlideshowSlides(entry);
    const slide0 = slides[0];
    img.src = slide0.url;
    img.alt = slide0.alt;
    img.loading = itemIndex < 6 ? "eager" : "lazy";
    btn.appendChild(img);
    galleryEl.appendChild(btn);
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
  buildProjectGallipoliView() {
    const root = this.projectGallipoliEl;
    const galleryEl = this.projectGallipoliGallery;
    const heroImg = document.getElementById("projectGallipoliHeroImg");
    const heroBtn = document.getElementById("projectGallipoliHeroBtn");
    if (!root || !galleryEl || !heroImg) return;

    this.teardownGallipoliScrollReveal();
    this.gridContainer.innerHTML = "";
    this.gridItems = [];
    this.gallipoliHeroItemData = null;
    if (heroBtn) heroBtn.disabled = true;

    const rawItems = this.getDisplayItemsForGrid();
    const entries = [...rawItems].sort(
      (a, b) => (a.indexInProject ?? 0) - (b.indexInProject ?? 0)
    );
    const rec = this.getActiveProjectRecord();
    const pid = entries[0]?.projectId;
    const ord = pid != null ? this.projectOrdinalInPortfolio(pid) : 1;

    let heroIdx = 0;
    const heroFile = rec && rec.heroImage;
    if (heroFile) {
      const hi = entries.findIndex(
        (e) => String(e.file || "") === String(heroFile)
      );
      if (hi >= 0) heroIdx = hi;
    }

    const heroEntry = entries[heroIdx] || entries[0];
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    heroImg.decoding = "async";
    if (driveImages) heroImg.referrerPolicy = "no-referrer";
    if (heroEntry) {
      const slidesH = this.buildSlideshowSlides(heroEntry);
      const sh0 = slidesH[0];
      if (sh0) {
        heroImg.src = sh0.url;
        heroImg.alt = sh0.alt || "";
        if (heroBtn) {
          heroBtn.disabled = false;
          this.gallipoliHeroItemData = {
            element: heroBtn,
            img: heroImg,
            slideViewport: heroBtn,
            slideTrack: null,
            slideshowSlides: slidesH,
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
            imageUrl: sh0.url,
            fullImageUrl: sh0.fullImageUrl,
            index: -1,
            overlayMeta: this.buildOverlayMeta(
              sh0.catalogEntry ||
                (heroEntry.type === "remote"
                  ? {
                      type: "remote",
                      overlayIndex:
                        sh0.overlayIndex ?? heroEntry.overlayIndex ?? 0
                    }
                  : heroEntry)
            )
          };
          this.gridItems.push(this.gallipoliHeroItemData);
        }
      } else {
        heroImg.removeAttribute("src");
        heroImg.alt = "";
      }
    } else {
      heroImg.removeAttribute("src");
      heroImg.alt = "";
    }

    const eyebrowEl = document.getElementById("projectGallipoliEyebrow");
    if (eyebrowEl) {
      const label =
        rec &&
        rec.gallipoliProjectLabel &&
        String(rec.gallipoliProjectLabel).trim();
      eyebrowEl.textContent =
        label || `PROJECT ${String(ord).padStart(2, "0")}`;
    }
    const titleEl = document.getElementById("projectGallipoliTitle");
    if (titleEl) titleEl.textContent = (rec && rec.title) || "";

    const tagEl = document.getElementById("projectGallipoliTagline");
    if (tagEl) {
      const tag =
        rec &&
        rec.gallipoliHeroTagline &&
        String(rec.gallipoliHeroTagline).trim();
      if (tag) {
        tagEl.textContent = tag;
        tagEl.removeAttribute("hidden");
      } else {
        tagEl.textContent = "";
        tagEl.setAttribute("hidden", "");
      }
    }

    const interWrap = document.getElementById("projectGallipoliInterludeWrap");
    const interEl = document.getElementById("projectGallipoliInterlude");
    const line =
      rec && rec.gallipoliInterlude && String(rec.gallipoliInterlude).trim();
    if (interWrap && interEl) {
      if (line) {
        interEl.textContent = line;
        interWrap.hidden = false;
      } else {
        interEl.textContent = "";
        interWrap.hidden = true;
      }
    }

    galleryEl.innerHTML = "";
    const galleryEntries =
      entries.length <= 1 ? [] : entries.filter((_, i) => i !== heroIdx);
    galleryEntries.forEach((entry, i) => {
      const spanCls = this.pickGallipoliGalleryClassList(i);
      this.appendGallipoliGalleryCard(galleryEl, entry, spanCls, i);
    });

    root.hidden = false;
    root.removeAttribute("hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-gallipoli-active");
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "hidden", pointerEvents: "none" });
    }
    this.setupGallipoliScrollReveal();
  }
  teardownProjectGallipoliView() {
    this.teardownGallipoliScrollReveal();
    this.gallipoliHeroItemData = null;
    document.body.classList.remove("project-gallipoli-active");
    const root = this.projectGallipoliEl;
    if (root) {
      root.hidden = true;
      root.setAttribute("hidden", "");
      root.setAttribute("aria-hidden", "true");
    }
    if (this.projectGallipoliGallery) this.projectGallipoliGallery.innerHTML = "";
    const heroBtnEl = document.getElementById("projectGallipoliHeroBtn");
    if (heroBtnEl) heroBtnEl.disabled = true;
    const heroImg = document.getElementById("projectGallipoliHeroImg");
    if (heroImg) {
      heroImg.removeAttribute("src");
      heroImg.alt = "";
    }
    const tagEl = document.getElementById("projectGallipoliTagline");
    if (tagEl) {
      tagEl.textContent = "";
      tagEl.removeAttribute("hidden");
    }
    const interW = document.getElementById("projectGallipoliInterludeWrap");
    const interP = document.getElementById("projectGallipoliInterlude");
    if (interP) interP.textContent = "";
    if (interW) interW.hidden = true;
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "visible", pointerEvents: "auto" });
    }
  }
  teardownGallipoliDayScrollReveal() {
    if (this._gallipoliDayRevealIO) {
      this._gallipoliDayRevealIO.disconnect();
      this._gallipoliDayRevealIO = null;
    }
  }
  setupGallipoliDayScrollReveal() {
    this.teardownGallipoliDayScrollReveal();
    const root = this.projectGallipoliDayEl;
    if (!root || root.hidden) return;
    const cards = root.querySelectorAll(".project-gallipoli-day__card");
    const nodes = [...cards];
    nodes.forEach((el, i) => {
      el.classList.remove("is-inview");
      el.style.setProperty(
        "--reveal-delay",
        `${Math.min(i * 0.065, 0.55)}s`
      );
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-inview");
            io.unobserve(en.target);
          }
        });
      },
      { root, rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    nodes.forEach((el) => io.observe(el));
    this._gallipoliDayRevealIO = io;
  }
  pickGallipoliDayGalleryClassList(index) {
    const pattern = [
      "project-gallipoli-day__card--full",
      "project-gallipoli-day__card--full",
      "project-gallipoli-day__card--half",
      "project-gallipoli-day__card--half",
      "project-gallipoli-day__card--full",
      "project-gallipoli-day__card--tall",
      "project-gallipoli-day__card--wide",
      "project-gallipoli-day__card--full",
      "project-gallipoli-day__card--half",
      "project-gallipoli-day__card--half"
    ];
    return pattern[index % pattern.length];
  }
  appendGallipoliDayGalleryCard(galleryEl, entry, spanClasses, itemIndex) {
    if (!galleryEl || !entry) return;
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `project-gallipoli-day__card ${spanClasses}`;
    const img = document.createElement("img");
    img.decoding = "async";
    if (driveImages) img.referrerPolicy = "no-referrer";
    const slides = this.buildSlideshowSlides(entry);
    const slide0 = slides[0];
    img.src = slide0.url;
    img.alt = slide0.alt;
    img.loading = itemIndex < 5 ? "eager" : "lazy";
    btn.appendChild(img);
    galleryEl.appendChild(btn);
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
  buildProjectGallipoliDayView() {
    const root = this.projectGallipoliDayEl;
    const galleryEl = this.projectGallipoliDayGallery;
    const heroImg = document.getElementById("projectGallipoliDayHeroImg");
    const heroBtn = document.getElementById("projectGallipoliDayHeroBtn");
    if (!root || !galleryEl || !heroImg) return;

    this.teardownGallipoliDayScrollReveal();
    this.gridContainer.innerHTML = "";
    this.gridItems = [];
    this.gallipoliDayHeroItemData = null;
    if (heroBtn) heroBtn.disabled = true;

    const rawItems = this.getDisplayItemsForGrid();
    const entries = [...rawItems].sort(
      (a, b) => (a.indexInProject ?? 0) - (b.indexInProject ?? 0)
    );
    const rec = this.getActiveProjectRecord();
    const pid = entries[0]?.projectId;
    const ord = pid != null ? this.projectOrdinalInPortfolio(pid) : 1;

    let heroIdx = 0;
    const heroFile = rec && rec.heroImage;
    if (heroFile) {
      const hi = entries.findIndex(
        (e) => String(e.file || "") === String(heroFile)
      );
      if (hi >= 0) heroIdx = hi;
    }

    const heroEntry = entries[heroIdx] || entries[0];
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    heroImg.decoding = "async";
    if (driveImages) heroImg.referrerPolicy = "no-referrer";
    if (heroEntry) {
      const slidesH = this.buildSlideshowSlides(heroEntry);
      const sh0 = slidesH[0];
      if (sh0) {
        heroImg.src = sh0.url;
        heroImg.alt = sh0.alt || "";
        if (heroBtn) {
          heroBtn.disabled = false;
          this.gallipoliDayHeroItemData = {
            element: heroBtn,
            img: heroImg,
            slideViewport: heroBtn,
            slideTrack: null,
            slideshowSlides: slidesH,
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
            imageUrl: sh0.url,
            fullImageUrl: sh0.fullImageUrl,
            index: -1,
            overlayMeta: this.buildOverlayMeta(
              sh0.catalogEntry ||
                (heroEntry.type === "remote"
                  ? {
                      type: "remote",
                      overlayIndex:
                        sh0.overlayIndex ?? heroEntry.overlayIndex ?? 0
                    }
                  : heroEntry)
            )
          };
          this.gridItems.push(this.gallipoliDayHeroItemData);
        }
      } else {
        heroImg.removeAttribute("src");
        heroImg.alt = "";
      }
    } else {
      heroImg.removeAttribute("src");
      heroImg.alt = "";
    }

    const eyebrowEl = document.getElementById("projectGallipoliDayEyebrow");
    if (eyebrowEl) {
      const label =
        rec &&
        rec.gallipoliDayProjectLabel &&
        String(rec.gallipoliDayProjectLabel).trim();
      eyebrowEl.textContent =
        label || `PROJECT ${String(ord).padStart(2, "0")}`;
    }
    const titleEl = document.getElementById("projectGallipoliDayTitle");
    if (titleEl) {
      const ht =
        rec &&
        rec.gallipoliDayHeroTitle &&
        String(rec.gallipoliDayHeroTitle).trim();
      titleEl.textContent = ht || (rec && rec.title) || "";
    }
    const subEl = document.getElementById("projectGallipoliDaySubtitle");
    if (subEl) {
      const st =
        rec &&
        rec.gallipoliDaySubtitle &&
        String(rec.gallipoliDaySubtitle).trim();
      if (st) {
        subEl.textContent = st;
        subEl.removeAttribute("hidden");
      } else {
        subEl.textContent = "";
        subEl.setAttribute("hidden", "");
      }
    }
    const tagEl = document.getElementById("projectGallipoliDayTagline");
    if (tagEl) {
      const tag =
        rec &&
        rec.gallipoliDayHeroTagline &&
        String(rec.gallipoliDayHeroTagline).trim();
      if (tag) {
        tagEl.textContent = tag;
        tagEl.removeAttribute("hidden");
      } else {
        tagEl.textContent = "";
        tagEl.setAttribute("hidden", "");
      }
    }

    const interWrap = document.getElementById(
      "projectGallipoliDayInterludeWrap"
    );
    const interEl = document.getElementById("projectGallipoliDayInterlude");
    const line =
      rec &&
      rec.gallipoliDayInterlude &&
      String(rec.gallipoliDayInterlude).trim();
    if (interWrap && interEl) {
      if (line) {
        interEl.textContent = line;
        interWrap.hidden = false;
      } else {
        interEl.textContent = "";
        interWrap.hidden = true;
      }
    }

    galleryEl.innerHTML = "";
    const galleryEntries =
      entries.length <= 1 ? [] : entries.filter((_, i) => i !== heroIdx);
    galleryEntries.forEach((entry, i) => {
      const spanCls = this.pickGallipoliDayGalleryClassList(i);
      this.appendGallipoliDayGalleryCard(galleryEl, entry, spanCls, i);
    });

    root.hidden = false;
    root.removeAttribute("hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-gallipoli-day-active");
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "hidden", pointerEvents: "none" });
    }
    this.setupGallipoliDayScrollReveal();
  }
  teardownProjectGallipoliDayView() {
    this.teardownGallipoliDayScrollReveal();
    this.gallipoliDayHeroItemData = null;
    document.body.classList.remove("project-gallipoli-day-active");
    const root = this.projectGallipoliDayEl;
    if (root) {
      root.hidden = true;
      root.setAttribute("hidden", "");
      root.setAttribute("aria-hidden", "true");
    }
    if (this.projectGallipoliDayGallery) {
      this.projectGallipoliDayGallery.innerHTML = "";
    }
    const heroBtnEl = document.getElementById("projectGallipoliDayHeroBtn");
    if (heroBtnEl) heroBtnEl.disabled = true;
    const heroImg = document.getElementById("projectGallipoliDayHeroImg");
    if (heroImg) {
      heroImg.removeAttribute("src");
      heroImg.alt = "";
    }
    const subEl = document.getElementById("projectGallipoliDaySubtitle");
    if (subEl) {
      subEl.textContent = "";
      subEl.removeAttribute("hidden");
    }
    const tagEl = document.getElementById("projectGallipoliDayTagline");
    if (tagEl) {
      tagEl.textContent = "";
      tagEl.removeAttribute("hidden");
    }
    const interW = document.getElementById("projectGallipoliDayInterludeWrap");
    const interP = document.getElementById("projectGallipoliDayInterlude");
    if (interP) interP.textContent = "";
    if (interW) interW.hidden = true;
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "visible", pointerEvents: "auto" });
    }
  }
  teardownErniaScrollReveal() {
    if (this._erniaRevealIO) {
      this._erniaRevealIO.disconnect();
      this._erniaRevealIO = null;
    }
  }
  setupErniaScrollReveal() {
    this.teardownErniaScrollReveal();
    const root = this.projectErniaEl;
    if (!root || root.hidden) return;
    const cards = root.querySelectorAll(".project-ernia__card");
    const nodes = [...cards];
    nodes.forEach((el, i) => {
      el.classList.remove("is-inview");
      el.style.setProperty(
        "--reveal-delay",
        `${Math.min(i * 0.042, 0.38)}s`
      );
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-inview");
            io.unobserve(en.target);
          }
        });
      },
      { root, rootMargin: "0px 0px -6% 0px", threshold: 0.055 }
    );
    nodes.forEach((el) => io.observe(el));
    this._erniaRevealIO = io;
  }
  pickErniaGalleryClassList(index) {
    const pattern = [
      "project-ernia__card--full",
      "project-ernia__card--tall",
      "project-ernia__card--wide",
      "project-ernia__card--full",
      "project-ernia__card--half",
      "project-ernia__card--half",
      "project-ernia__card--stage",
      "project-ernia__card--side"
    ];
    return pattern[index % pattern.length];
  }
  appendErniaGalleryCard(galleryEl, entry, spanClasses, itemIndex) {
    if (!galleryEl || !entry) return;
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `project-ernia__card ${spanClasses}`;
    const img = document.createElement("img");
    img.decoding = "async";
    if (driveImages) img.referrerPolicy = "no-referrer";
    const slides = this.buildSlideshowSlides(entry);
    const slide0 = slides[0];
    img.src = slide0.url;
    img.alt = slide0.alt;
    img.loading = itemIndex < 5 ? "eager" : "lazy";
    btn.appendChild(img);
    galleryEl.appendChild(btn);
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
  buildProjectErniaView() {
    const root = this.projectErniaEl;
    const galleryEl = this.projectErniaGallery;
    const heroImg = document.getElementById("projectErniaHeroImg");
    const heroBtn = document.getElementById("projectErniaHeroBtn");
    if (!root || !galleryEl || !heroImg) return;

    this.teardownErniaScrollReveal();
    this.gridContainer.innerHTML = "";
    this.gridItems = [];
    this.erniaHeroItemData = null;
    if (heroBtn) heroBtn.disabled = true;

    const rawItems = this.getDisplayItemsForGrid();
    const entries = [...rawItems].sort(
      (a, b) => (a.indexInProject ?? 0) - (b.indexInProject ?? 0)
    );
    const rec = this.getActiveProjectRecord();
    const pid = entries[0]?.projectId;
    const ord = pid != null ? this.projectOrdinalInPortfolio(pid) : 1;

    let heroIdx = 0;
    const heroFile = rec && rec.heroImage;
    if (heroFile) {
      const hi = entries.findIndex(
        (e) => String(e.file || "") === String(heroFile)
      );
      if (hi >= 0) heroIdx = hi;
    }

    const heroEntry = entries[heroIdx] || entries[0];
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    heroImg.decoding = "async";
    if (driveImages) heroImg.referrerPolicy = "no-referrer";
    if (heroEntry) {
      const slidesH = this.buildSlideshowSlides(heroEntry);
      const sh0 = slidesH[0];
      if (sh0) {
        heroImg.src = sh0.url;
        heroImg.alt = sh0.alt || "";
        if (heroBtn) {
          heroBtn.disabled = false;
          this.erniaHeroItemData = {
            element: heroBtn,
            img: heroImg,
            slideViewport: heroBtn,
            slideTrack: null,
            slideshowSlides: slidesH,
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
            imageUrl: sh0.url,
            fullImageUrl: sh0.fullImageUrl,
            index: -1,
            overlayMeta: this.buildOverlayMeta(
              sh0.catalogEntry ||
                (heroEntry.type === "remote"
                  ? {
                      type: "remote",
                      overlayIndex:
                        sh0.overlayIndex ?? heroEntry.overlayIndex ?? 0
                    }
                  : heroEntry)
            )
          };
          this.gridItems.push(this.erniaHeroItemData);
        }
      } else {
        heroImg.removeAttribute("src");
        heroImg.alt = "";
      }
    } else {
      heroImg.removeAttribute("src");
      heroImg.alt = "";
    }

    const eyebrowEl = document.getElementById("projectErniaEyebrow");
    if (eyebrowEl) {
      const label =
        rec && rec.erniaProjectLabel && String(rec.erniaProjectLabel).trim();
      eyebrowEl.textContent =
        label || `PROJECT ${String(ord).padStart(2, "0")}`;
    }
    const titleEl = document.getElementById("projectErniaTitle");
    if (titleEl) titleEl.textContent = (rec && rec.title) || "";

    const tagEl = document.getElementById("projectErniaTagline");
    if (tagEl) {
      const tag =
        rec && rec.erniaHeroTagline && String(rec.erniaHeroTagline).trim();
      if (tag) {
        tagEl.textContent = tag;
        tagEl.removeAttribute("hidden");
      } else {
        tagEl.textContent = "";
        tagEl.setAttribute("hidden", "");
      }
    }

    const interWrap = document.getElementById("projectErniaInterludeWrap");
    const interEl = document.getElementById("projectErniaInterlude");
    const line =
      rec && rec.erniaInterlude && String(rec.erniaInterlude).trim();
    if (interWrap && interEl) {
      if (line) {
        interEl.textContent = line;
        interWrap.hidden = false;
      } else {
        interEl.textContent = "";
        interWrap.hidden = true;
      }
    }

    galleryEl.innerHTML = "";
    const galleryEntries =
      entries.length <= 1 ? [] : entries.filter((_, i) => i !== heroIdx);
    galleryEntries.forEach((entry, i) => {
      const spanCls = this.pickErniaGalleryClassList(i);
      this.appendErniaGalleryCard(galleryEl, entry, spanCls, i);
    });

    root.hidden = false;
    root.removeAttribute("hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-ernia-active");
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "hidden", pointerEvents: "none" });
    }
    this.setupErniaScrollReveal();
  }
  teardownProjectErniaView() {
    this.teardownErniaScrollReveal();
    this.erniaHeroItemData = null;
    document.body.classList.remove("project-ernia-active");
    const root = this.projectErniaEl;
    if (root) {
      root.hidden = true;
      root.setAttribute("hidden", "");
      root.setAttribute("aria-hidden", "true");
    }
    if (this.projectErniaGallery) this.projectErniaGallery.innerHTML = "";
    const heroBtnEl = document.getElementById("projectErniaHeroBtn");
    if (heroBtnEl) heroBtnEl.disabled = true;
    const heroImg = document.getElementById("projectErniaHeroImg");
    if (heroImg) {
      heroImg.removeAttribute("src");
      heroImg.alt = "";
    }
    const tagEl = document.getElementById("projectErniaTagline");
    if (tagEl) {
      tagEl.textContent = "";
      tagEl.removeAttribute("hidden");
    }
    const interW = document.getElementById("projectErniaInterludeWrap");
    const interP = document.getElementById("projectErniaInterlude");
    if (interP) interP.textContent = "";
    if (interW) interW.hidden = true;
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "visible", pointerEvents: "auto" });
    }
  }
  teardownLaureaScrollReveal() {
    if (this._laureaRevealIO) {
      this._laureaRevealIO.disconnect();
      this._laureaRevealIO = null;
    }
  }
  setupLaureaScrollReveal() {
    this.teardownLaureaScrollReveal();
    const root = this.projectLaureaEl;
    if (!root || root.hidden) return;
    const cards = root.querySelectorAll(".project-laurea__card");
    const nodes = [...cards];
    nodes.forEach((el, i) => {
      el.classList.remove("is-inview");
      el.style.setProperty(
        "--reveal-delay",
        `${Math.min(i * 0.07, 0.55)}s`
      );
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-inview");
            io.unobserve(en.target);
          }
        });
      },
      { root, rootMargin: "0px 0px -6% 0px", threshold: 0.055 }
    );
    nodes.forEach((el) => io.observe(el));
    this._laureaRevealIO = io;
  }
  appendLaureaGalleryCard(galleryEl, entry, itemIndex) {
    if (!galleryEl || !entry) return;
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "project-laurea__card";
    const img = document.createElement("img");
    img.decoding = "async";
    if (driveImages) img.referrerPolicy = "no-referrer";
    const slides = this.buildSlideshowSlides(entry);
    const slide0 = slides[0];
    img.src = slide0.url;
    img.alt = slide0.alt;
    img.loading = itemIndex < 4 ? "eager" : "lazy";
    btn.appendChild(img);
    galleryEl.appendChild(btn);
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
  buildProjectLaureaView() {
    const root = this.projectLaureaEl;
    const galleryEl = this.projectLaureaGallery;
    const heroImg = document.getElementById("projectLaureaHeroImg");
    const heroBtn = document.getElementById("projectLaureaHeroBtn");
    if (!root || !galleryEl || !heroImg) return;

    this.teardownLaureaScrollReveal();
    this.gridContainer.innerHTML = "";
    this.gridItems = [];
    this.laureaHeroItemData = null;
    if (heroBtn) heroBtn.disabled = true;

    const rawItems = this.getDisplayItemsForGrid();
    const entries = [...rawItems].sort(
      (a, b) => (a.indexInProject ?? 0) - (b.indexInProject ?? 0)
    );
    const rec = this.getActiveProjectRecord();
    const pid = entries[0]?.projectId;
    const ord = pid != null ? this.projectOrdinalInPortfolio(pid) : 1;

    let heroIdx = 0;
    const heroFile = rec && rec.heroImage;
    if (heroFile) {
      const hi = entries.findIndex(
        (e) => String(e.file || "") === String(heroFile)
      );
      if (hi >= 0) heroIdx = hi;
    }

    const heroEntry = entries[heroIdx] || entries[0];
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    heroImg.decoding = "async";
    if (driveImages) heroImg.referrerPolicy = "no-referrer";
    if (heroEntry) {
      const slidesH = this.buildSlideshowSlides(heroEntry);
      const sh0 = slidesH[0];
      if (sh0) {
        heroImg.src = sh0.url;
        heroImg.alt = sh0.alt || "";
        if (heroBtn) {
          heroBtn.disabled = false;
          this.laureaHeroItemData = {
            element: heroBtn,
            img: heroImg,
            slideViewport: heroBtn,
            slideTrack: null,
            slideshowSlides: slidesH,
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
            imageUrl: sh0.url,
            fullImageUrl: sh0.fullImageUrl,
            index: -1,
            overlayMeta: this.buildOverlayMeta(
              sh0.catalogEntry ||
                (heroEntry.type === "remote"
                  ? {
                      type: "remote",
                      overlayIndex:
                        sh0.overlayIndex ?? heroEntry.overlayIndex ?? 0
                    }
                  : heroEntry)
            )
          };
          this.gridItems.push(this.laureaHeroItemData);
        }
      } else {
        heroImg.removeAttribute("src");
        heroImg.alt = "";
      }
    } else {
      heroImg.removeAttribute("src");
      heroImg.alt = "";
    }

    const eyebrowEl = document.getElementById("projectLaureaEyebrow");
    if (eyebrowEl) {
      const label =
        rec && rec.laureaProjectLabel && String(rec.laureaProjectLabel).trim();
      eyebrowEl.textContent =
        label || `PROJECT ${String(ord).padStart(2, "0")}`;
    }
    const titleEl = document.getElementById("projectLaureaTitle");
    if (titleEl) titleEl.textContent = (rec && rec.title) || "";

    const tagEl = document.getElementById("projectLaureaTagline");
    if (tagEl) {
      const tag =
        rec && rec.laureaHeroTagline && String(rec.laureaHeroTagline).trim();
      if (tag) {
        tagEl.textContent = tag;
        tagEl.removeAttribute("hidden");
      } else {
        tagEl.textContent = "";
        tagEl.setAttribute("hidden", "");
      }
    }

    const proseEl = document.getElementById("projectLaureaProse");
    const proseWrap = document.getElementById("projectLaureaProseWrap");
    if (proseEl && proseWrap) {
      proseEl.innerHTML = "";
      let blocks = [];
      if (rec && Array.isArray(rec.laureaEditorialBlocks)) {
        blocks = rec.laureaEditorialBlocks
          .map((s) => String(s).trim())
          .filter(Boolean)
          .slice(0, 3);
      }
      if (!blocks.length && rec && rec.summary) {
        blocks = String(rec.summary)
          .split(/\n\n+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 3);
      }
      if (blocks.length) {
        blocks.forEach((text) => {
          const p = document.createElement("p");
          p.textContent = text;
          proseEl.appendChild(p);
        });
        proseWrap.hidden = false;
        proseWrap.removeAttribute("hidden");
      } else {
        proseWrap.hidden = true;
        proseWrap.setAttribute("hidden", "");
      }
    }

    galleryEl.innerHTML = "";
    const galleryEntries =
      entries.length <= 1 ? [] : entries.filter((_, i) => i !== heroIdx);
    galleryEntries.forEach((entry, i) => {
      this.appendLaureaGalleryCard(galleryEl, entry, i);
    });

    root.hidden = false;
    root.removeAttribute("hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-laurea-active");
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "hidden", pointerEvents: "none" });
    }
    this.setupLaureaScrollReveal();
  }
  teardownProjectLaureaView() {
    this.teardownLaureaScrollReveal();
    this.laureaHeroItemData = null;
    document.body.classList.remove("project-laurea-active");
    const root = this.projectLaureaEl;
    if (root) {
      root.hidden = true;
      root.setAttribute("hidden", "");
      root.setAttribute("aria-hidden", "true");
    }
    if (this.projectLaureaGallery) this.projectLaureaGallery.innerHTML = "";
    const heroBtnEl = document.getElementById("projectLaureaHeroBtn");
    if (heroBtnEl) heroBtnEl.disabled = true;
    const heroImg = document.getElementById("projectLaureaHeroImg");
    if (heroImg) {
      heroImg.removeAttribute("src");
      heroImg.alt = "";
    }
    const tagEl = document.getElementById("projectLaureaTagline");
    if (tagEl) {
      tagEl.textContent = "";
      tagEl.removeAttribute("hidden");
    }
    const proseEl = document.getElementById("projectLaureaProse");
    const proseWrap = document.getElementById("projectLaureaProseWrap");
    if (proseEl) proseEl.innerHTML = "";
    if (proseWrap) {
      proseWrap.hidden = true;
      proseWrap.setAttribute("hidden", "");
    }
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "visible", pointerEvents: "auto" });
    }
  }
  teardownTabooScrollReveal() {
    if (this._tabooRevealIO) {
      this._tabooRevealIO.disconnect();
      this._tabooRevealIO = null;
    }
  }
  setupTabooScrollReveal() {
    this.teardownTabooScrollReveal();
    const root = this.projectTabooEl;
    if (!root || root.hidden) return;
    const cards = root.querySelectorAll(".project-taboo__card");
    const nodes = [...cards];
    nodes.forEach((el, i) => {
      el.classList.remove("is-inview");
      el.style.setProperty(
        "--reveal-delay",
        `${Math.min(i * 0.048, 0.4)}s`
      );
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-inview");
            io.unobserve(en.target);
          }
        });
      },
      { root, rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    nodes.forEach((el) => io.observe(el));
    this._tabooRevealIO = io;
  }
  /**
   * Ritmo galleria Taboo: panoramiche e coppie, qualche verticale; niente terzine dense.
   */
  pickTabooGalleryClassList(index) {
    const base = [
      { span: "s12", portrait: false },
      { span: "s6", portrait: false },
      { span: "s6", portrait: false },
      { span: "s12", portrait: true },
      { span: "s12", portrait: false },
      { span: "s6", portrait: true },
      { span: "s6", portrait: true }
    ];
    const spec = base[index % base.length];
    let cls = `project-taboo__card--${spec.span}`;
    if (spec.portrait) cls += " project-taboo__card--portrait";
    return cls;
  }
  appendTabooGalleryCard(galleryEl, entry, spanClasses, itemIndex) {
    if (!galleryEl || !entry) return;
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `project-taboo__card ${spanClasses}`;
    const img = document.createElement("img");
    img.decoding = "async";
    if (driveImages) img.referrerPolicy = "no-referrer";
    const slides = this.buildSlideshowSlides(entry);
    const slide0 = slides[0];
    img.src = slide0.url;
    img.alt = slide0.alt;
    img.loading = itemIndex < 4 ? "eager" : "lazy";
    btn.appendChild(img);
    galleryEl.appendChild(btn);
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
  buildProjectTabooView() {
    const root = this.projectTabooEl;
    const galleryEl = this.projectTabooGallery;
    const heroImg = document.getElementById("projectTabooHeroImg");
    const heroBtn = document.getElementById("projectTabooHeroBtn");
    if (!root || !galleryEl || !heroImg) return;

    this.teardownTabooScrollReveal();
    this.gridContainer.innerHTML = "";
    this.gridItems = [];
    this.tabooHeroItemData = null;
    if (heroBtn) heroBtn.disabled = true;

    const rawItems = this.getDisplayItemsForGrid();
    const entries = [...rawItems].sort(
      (a, b) => (a.indexInProject ?? 0) - (b.indexInProject ?? 0)
    );
    const rec = this.getActiveProjectRecord();
    const pid = entries[0]?.projectId;
    const ord = pid != null ? this.projectOrdinalInPortfolio(pid) : 1;

    let heroIdx = 0;
    const heroFile = rec && rec.heroImage;
    if (heroFile) {
      const hi = entries.findIndex(
        (e) => String(e.file || "") === String(heroFile)
      );
      if (hi >= 0) heroIdx = hi;
    }

    const heroEntry = entries[heroIdx] || entries[0];
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    heroImg.decoding = "async";
    if (driveImages) heroImg.referrerPolicy = "no-referrer";
    if (heroEntry) {
      const slidesH = this.buildSlideshowSlides(heroEntry);
      const sh0 = slidesH[0];
      if (sh0) {
        heroImg.src = sh0.url;
        heroImg.alt = sh0.alt || "";
        if (heroBtn) {
          heroBtn.disabled = false;
          this.tabooHeroItemData = {
            element: heroBtn,
            img: heroImg,
            slideViewport: heroBtn,
            slideTrack: null,
            slideshowSlides: slidesH,
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
            imageUrl: sh0.url,
            fullImageUrl: sh0.fullImageUrl,
            index: -1,
            overlayMeta: this.buildOverlayMeta(
              sh0.catalogEntry ||
                (heroEntry.type === "remote"
                  ? {
                      type: "remote",
                      overlayIndex:
                        sh0.overlayIndex ?? heroEntry.overlayIndex ?? 0
                    }
                  : heroEntry)
            )
          };
          this.gridItems.push(this.tabooHeroItemData);
        }
      } else {
        heroImg.removeAttribute("src");
        heroImg.alt = "";
      }
    } else {
      heroImg.removeAttribute("src");
      heroImg.alt = "";
    }

    const eyebrowEl = document.getElementById("projectTabooEyebrow");
    if (eyebrowEl) {
      const label =
        rec && rec.tabooProjectLabel && String(rec.tabooProjectLabel).trim();
      eyebrowEl.textContent =
        label || `PROJECT ${String(ord).padStart(2, "0")}`;
    }
    const titleEl = document.getElementById("projectTabooTitle");
    if (titleEl) titleEl.textContent = (rec && rec.title) || "";
    const introEl = document.getElementById("projectTabooHeroIntro");
    if (introEl) {
      const custom =
        rec && rec.tabooHeroIntro && String(rec.tabooHeroIntro).trim();
      introEl.textContent =
        custom ||
        "Reportage nel 2022 all’Albergo Etico di Fènis: un luogo dove accoglienza e lavoro si intrecciano ogni giorno. Le immagini restituiscono contesto e presenza, senza effetto spettacolo.";
    }

    const editorialEl = document.getElementById("projectTabooEditorial");
    let editorialBlocks = [];
    if (
      rec &&
      Array.isArray(rec.tabooEditorialBlocks) &&
      rec.tabooEditorialBlocks.length
    ) {
      editorialBlocks = rec.tabooEditorialBlocks
        .map((s) => String(s).trim())
        .filter(Boolean);
    } else {
      const summary = (rec && rec.summary && String(rec.summary).trim()) || "";
      editorialBlocks = summary
        ? summary
            .split(/\n\n+/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
    }
    if (editorialEl) {
      editorialEl.innerHTML = "";
      const edRoles = [
        "project-taboo__ed-p--lead",
        "project-taboo__ed-p--note",
        "project-taboo__ed-p--outro"
      ];
      editorialBlocks.forEach((t, i) => {
        const p = document.createElement("p");
        p.className = "project-taboo__ed-p";
        if (edRoles[i]) p.classList.add(edRoles[i]);
        p.textContent = t;
        editorialEl.appendChild(p);
      });
    }

    const pullWrap = document.getElementById("projectTabooPullWrap");
    const pullEl = document.getElementById("projectTabooPullQuote");
    const pullText =
      rec && rec.tabooPullQuote && String(rec.tabooPullQuote).trim();
    if (pullWrap && pullEl) {
      if (pullText) {
        pullEl.textContent = pullText;
        pullWrap.hidden = false;
      } else {
        pullEl.textContent = "";
        pullWrap.hidden = true;
      }
    }

    galleryEl.innerHTML = "";
    const galleryEntries =
      entries.length <= 1 ? [] : entries.filter((_, i) => i !== heroIdx);
    galleryEntries.forEach((entry, i) => {
      const spanCls = this.pickTabooGalleryClassList(i);
      this.appendTabooGalleryCard(galleryEl, entry, spanCls, i);
    });

    root.hidden = false;
    root.removeAttribute("hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-taboo-active");
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "hidden", pointerEvents: "none" });
    }
    this.setupTabooScrollReveal();
  }
  teardownProjectTabooView() {
    this.teardownTabooScrollReveal();
    this.tabooHeroItemData = null;
    document.body.classList.remove("project-taboo-active");
    const root = this.projectTabooEl;
    if (root) {
      root.hidden = true;
      root.setAttribute("hidden", "");
      root.setAttribute("aria-hidden", "true");
    }
    if (this.projectTabooGallery) this.projectTabooGallery.innerHTML = "";
    const heroBtnEl = document.getElementById("projectTabooHeroBtn");
    if (heroBtnEl) heroBtnEl.disabled = true;
    const heroImg = document.getElementById("projectTabooHeroImg");
    if (heroImg) {
      heroImg.removeAttribute("src");
      heroImg.alt = "";
    }
    const heroIntro = document.getElementById("projectTabooHeroIntro");
    if (heroIntro) heroIntro.textContent = "";
    const editorialInner = document.getElementById("projectTabooEditorial");
    if (editorialInner) editorialInner.innerHTML = "";
    const pullW = document.getElementById("projectTabooPullWrap");
    const pullQ = document.getElementById("projectTabooPullQuote");
    if (pullQ) pullQ.textContent = "";
    if (pullW) pullW.hidden = true;
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "visible", pointerEvents: "auto" });
    }
  }
  teardownModaScrollReveal() {
    if (this._modaRevealIO) {
      this._modaRevealIO.disconnect();
      this._modaRevealIO = null;
    }
  }
  setupModaScrollReveal() {
    this.teardownModaScrollReveal();
    const root = this.projectModaEl;
    if (!root || root.hidden) return;
    const cards = root.querySelectorAll(".project-moda__card");
    const nodes = [...cards];
    nodes.forEach((el, i) => {
      el.classList.remove("is-inview");
      el.style.setProperty(
        "--reveal-delay",
        `${Math.min(i * 0.042, 0.38)}s`
      );
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-inview");
            io.unobserve(en.target);
          }
        });
      },
      { root, rootMargin: "0px 0px -5% 0px", threshold: 0.06 }
    );
    nodes.forEach((el) => io.observe(el));
    this._modaRevealIO = io;
  }
  /**
   * Galleria Moda: ritmo da rivista — doppie verticali, full, verticale hero, coppie orizzontali.
   */
  pickModaGalleryClassList(index) {
    const base = [
      { span: "s6", portrait: true },
      { span: "s6", portrait: true },
      { span: "s12", portrait: false },
      { span: "s12", portrait: true },
      { span: "s6", portrait: false },
      { span: "s6", portrait: false },
      { span: "s6", portrait: true },
      { span: "s6", portrait: true },
      { span: "s12", portrait: false },
      { span: "s12", portrait: true }
    ];
    const spec = base[index % base.length];
    let cls = `project-moda__card--${spec.span}`;
    if (spec.portrait) cls += " project-moda__card--portrait";
    return cls;
  }
  appendModaGalleryCard(galleryEl, entry, spanClasses, itemIndex) {
    if (!galleryEl || !entry) return;
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `project-moda__card ${spanClasses}`;
    const img = document.createElement("img");
    img.decoding = "async";
    if (driveImages) img.referrerPolicy = "no-referrer";
    const slides = this.buildSlideshowSlides(entry);
    const slide0 = slides[0];
    img.src = slide0.url;
    img.alt = slide0.alt;
    img.loading = itemIndex < 5 ? "eager" : "lazy";
    btn.appendChild(img);
    galleryEl.appendChild(btn);
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
  buildProjectModaView() {
    const root = this.projectModaEl;
    const galleryEl = this.projectModaGallery;
    const heroImg = document.getElementById("projectModaHeroImg");
    const heroBtn = document.getElementById("projectModaHeroBtn");
    if (!root || !galleryEl || !heroImg) return;

    this.teardownModaScrollReveal();
    this.gridContainer.innerHTML = "";
    this.gridItems = [];
    this.modaHeroItemData = null;
    if (heroBtn) heroBtn.disabled = true;

    const rawItems = this.getDisplayItemsForGrid();
    const entries = [...rawItems].sort(
      (a, b) => (a.indexInProject ?? 0) - (b.indexInProject ?? 0)
    );
    const rec = this.getActiveProjectRecord();
    const pid = entries[0]?.projectId;
    const ord = pid != null ? this.projectOrdinalInPortfolio(pid) : 1;

    let heroIdx = 0;
    const heroFile = rec && rec.heroImage;
    if (heroFile) {
      const hi = entries.findIndex(
        (e) => String(e.file || "") === String(heroFile)
      );
      if (hi >= 0) heroIdx = hi;
    }

    const heroEntry = entries[heroIdx] || entries[0];
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    heroImg.decoding = "async";
    if (driveImages) heroImg.referrerPolicy = "no-referrer";
    if (heroEntry) {
      const slidesH = this.buildSlideshowSlides(heroEntry);
      const sh0 = slidesH[0];
      if (sh0) {
        heroImg.src = sh0.url;
        heroImg.alt = sh0.alt || "";
        if (heroBtn) {
          heroBtn.disabled = false;
          this.modaHeroItemData = {
            element: heroBtn,
            img: heroImg,
            slideViewport: heroBtn,
            slideTrack: null,
            slideshowSlides: slidesH,
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
            imageUrl: sh0.url,
            fullImageUrl: sh0.fullImageUrl,
            index: -1,
            overlayMeta: this.buildOverlayMeta(
              sh0.catalogEntry ||
                (heroEntry.type === "remote"
                  ? {
                      type: "remote",
                      overlayIndex:
                        sh0.overlayIndex ?? heroEntry.overlayIndex ?? 0
                    }
                  : heroEntry)
            )
          };
          this.gridItems.push(this.modaHeroItemData);
        }
      } else {
        heroImg.removeAttribute("src");
        heroImg.alt = "";
      }
    } else {
      heroImg.removeAttribute("src");
      heroImg.alt = "";
    }

    const eyebrowEl = document.getElementById("projectModaEyebrow");
    if (eyebrowEl) {
      const label =
        rec && rec.modaProjectLabel && String(rec.modaProjectLabel).trim();
      eyebrowEl.textContent =
        label || `PROJECT ${String(ord).padStart(2, "0")}`;
    }
    const titleEl = document.getElementById("projectModaTitle");
    if (titleEl) titleEl.textContent = (rec && rec.title) || "";
    const introEl = document.getElementById("projectModaHeroIntro");
    if (introEl) {
      const custom =
        rec && rec.modaHeroIntro && String(rec.modaHeroIntro).trim();
      introEl.textContent =
        custom ||
        "Shooting editoriale tra il 2022 e il 2023: set da corso di fotografia di moda, luce e silhouette al centro — spazio per esplorare stile e presenza.";
    }

    const editorialEl = document.getElementById("projectModaEditorial");
    let editorialBlocks = [];
    if (
      rec &&
      Array.isArray(rec.modaEditorialBlocks) &&
      rec.modaEditorialBlocks.length
    ) {
      editorialBlocks = rec.modaEditorialBlocks
        .map((s) => String(s).trim())
        .filter(Boolean);
    } else {
      const summary = (rec && rec.summary && String(rec.summary).trim()) || "";
      editorialBlocks = summary
        ? summary
            .split(/\n\n+/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
    }
    if (editorialEl) {
      editorialEl.innerHTML = "";
      const edRoles = [
        "project-moda__ed-p--lead",
        "project-moda__ed-p--note",
        "project-moda__ed-p--outro"
      ];
      editorialBlocks.forEach((t, i) => {
        const p = document.createElement("p");
        p.className = "project-moda__ed-p";
        if (edRoles[i]) p.classList.add(edRoles[i]);
        p.textContent = t;
        editorialEl.appendChild(p);
      });
    }

    const pullWrap = document.getElementById("projectModaPullWrap");
    const pullEl = document.getElementById("projectModaPullQuote");
    const pullText =
      rec && rec.modaPullQuote && String(rec.modaPullQuote).trim();
    if (pullWrap && pullEl) {
      if (pullText) {
        pullEl.textContent = pullText;
        pullWrap.hidden = false;
      } else {
        pullEl.textContent = "";
        pullWrap.hidden = true;
      }
    }

    galleryEl.innerHTML = "";
    const galleryEntries =
      entries.length <= 1 ? [] : entries.filter((_, i) => i !== heroIdx);
    galleryEntries.forEach((entry, i) => {
      const spanCls = this.pickModaGalleryClassList(i);
      this.appendModaGalleryCard(galleryEl, entry, spanCls, i);
    });

    root.hidden = false;
    root.removeAttribute("hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-moda-active");
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "hidden", pointerEvents: "none" });
    }
    this.setupModaScrollReveal();
  }
  teardownProjectModaView() {
    this.teardownModaScrollReveal();
    this.modaHeroItemData = null;
    document.body.classList.remove("project-moda-active");
    const root = this.projectModaEl;
    if (root) {
      root.hidden = true;
      root.setAttribute("hidden", "");
      root.setAttribute("aria-hidden", "true");
    }
    if (this.projectModaGallery) this.projectModaGallery.innerHTML = "";
    const heroBtnEl = document.getElementById("projectModaHeroBtn");
    if (heroBtnEl) heroBtnEl.disabled = true;
    const heroImg = document.getElementById("projectModaHeroImg");
    if (heroImg) {
      heroImg.removeAttribute("src");
      heroImg.alt = "";
    }
    const heroIntro = document.getElementById("projectModaHeroIntro");
    if (heroIntro) heroIntro.textContent = "";
    const editorialInner = document.getElementById("projectModaEditorial");
    if (editorialInner) editorialInner.innerHTML = "";
    const pullW = document.getElementById("projectModaPullWrap");
    const pullQ = document.getElementById("projectModaPullQuote");
    if (pullQ) pullQ.textContent = "";
    if (pullW) pullW.hidden = true;
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "visible", pointerEvents: "auto" });
    }
  }
  pickIsolaGallerySpan(index) {
    /*
     * Solo s12 / s6 / s4: righe complete con celle coerenti (no strisce sottili, no dense).
     * Ritmo: apertura full → coppie 4:3 → terzine quadrate → full → …
     */
    const pattern = [
      "project-isola__card--s12",
      "project-isola__card--s6",
      "project-isola__card--s6",
      "project-isola__card--s4",
      "project-isola__card--s4",
      "project-isola__card--s4",
      "project-isola__card--s12",
      "project-isola__card--s6",
      "project-isola__card--s6",
      "project-isola__card--s4",
      "project-isola__card--s4",
      "project-isola__card--s4",
      "project-isola__card--s12",
      "project-isola__card--s6",
      "project-isola__card--s6",
      "project-isola__card--s12",
      "project-isola__card--s4",
      "project-isola__card--s4",
      "project-isola__card--s4",
      "project-isola__card--s6",
      "project-isola__card--s6"
    ];
    return pattern[index % pattern.length];
  }
  appendIsolaGalleryCard(galleryEl, entry, spanClass, itemIndex) {
    if (!galleryEl || !entry) return;
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `project-isola__card ${spanClass}`;
    const img = document.createElement("img");
    img.decoding = "async";
    if (driveImages) img.referrerPolicy = "no-referrer";
    const slides = this.buildSlideshowSlides(entry);
    const slide0 = slides[0];
    img.src = slide0.url;
    img.alt = slide0.alt;
    img.loading = itemIndex < 4 ? "eager" : "lazy";
    btn.appendChild(img);
    galleryEl.appendChild(btn);
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
  buildProjectIsolaView() {
    const root = this.projectIsolaEl;
    const galleryEl = this.projectIsolaGallery;
    const heroImg = document.getElementById("projectIsolaHeroImg");
    const heroBtn = document.getElementById("projectIsolaHeroBtn");
    if (!root || !galleryEl || !heroImg) return;

    this.teardownIsolaScrollReveal();
    this.gridContainer.innerHTML = "";
    this.gridItems = [];
    this.isolaHeroItemData = null;
    if (heroBtn) heroBtn.disabled = true;

    const rawItems = this.getDisplayItemsForGrid();
    const entries = [...rawItems].sort(
      (a, b) => (a.indexInProject ?? 0) - (b.indexInProject ?? 0)
    );
    const rec = this.getActiveProjectRecord();
    const pid = entries[0]?.projectId;
    const ord = pid != null ? this.projectOrdinalInPortfolio(pid) : 1;

    let heroIdx = 0;
    const heroFile = rec && rec.heroImage;
    if (heroFile) {
      const hi = entries.findIndex(
        (e) => String(e.file || "") === String(heroFile)
      );
      if (hi >= 0) heroIdx = hi;
    } else {
      const ci = entries.findIndex((e) =>
        /copertina/i.test(String(e.file || ""))
      );
      if (ci >= 0) heroIdx = ci;
    }

    const heroEntry = entries[heroIdx] || entries[0];
    const cfg =
      (typeof window !== "undefined" && window.__PORTFOLIO_CONFIG__) || {};
    const driveImages = cfg.imagesFrom === "drive";
    heroImg.decoding = "async";
    if (driveImages) heroImg.referrerPolicy = "no-referrer";
    if (heroEntry) {
      const slidesH = this.buildSlideshowSlides(heroEntry);
      const sh0 = slidesH[0];
      if (sh0) {
        heroImg.src = sh0.url;
        heroImg.alt = sh0.alt || "";
        if (heroBtn) {
          heroBtn.disabled = false;
          this.isolaHeroItemData = {
            element: heroBtn,
            img: heroImg,
            slideViewport: heroBtn,
            slideTrack: null,
            slideshowSlides: slidesH,
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
            imageUrl: sh0.url,
            fullImageUrl: sh0.fullImageUrl,
            index: -1,
            overlayMeta: this.buildOverlayMeta(
              sh0.catalogEntry ||
                (heroEntry.type === "remote"
                  ? {
                      type: "remote",
                      overlayIndex:
                        sh0.overlayIndex ?? heroEntry.overlayIndex ?? 0
                    }
                  : heroEntry)
            )
          };
          this.gridItems.push(this.isolaHeroItemData);
        }
      } else {
        heroImg.removeAttribute("src");
        heroImg.alt = "";
      }
    } else {
      heroImg.removeAttribute("src");
      heroImg.alt = "";
    }

    const eyebrowEl = document.getElementById("projectIsolaEyebrow");
    if (eyebrowEl) {
      const label =
        rec && rec.isolaProjectLabel && String(rec.isolaProjectLabel).trim();
      eyebrowEl.textContent =
        label || `PROJECT ${String(ord).padStart(2, "0")}`;
    }
    const titleEl = document.getElementById("projectIsolaTitle");
    if (titleEl) titleEl.textContent = (rec && rec.title) || "";
    const subEl = document.getElementById("projectIsolaSubtitle");
    if (subEl) {
      subEl.textContent = (rec && rec.subtitle) || "";
      subEl.hidden = !rec?.subtitle;
    }
    const introEl = document.getElementById("projectIsolaHeroIntro");
    if (introEl) {
      const custom =
        rec && rec.isolaHeroIntro && String(rec.isolaHeroIntro).trim();
      introEl.textContent =
        custom ||
        "Sei mesi vissuti sull'isola, tra deserto e mare: un isolamento fatto di luce, vento e distese. Il paesaggio è la materia centrale del racconto; le figure, rare e volute, fanno parte di quella stessa materia — mai decoro sullo sfondo.";
    }

    const tagEl = document.getElementById("projectIsolaTagline");
    if (tagEl) {
      tagEl.textContent = "";
      tagEl.hidden = true;
    }

    const edKickerEl = document.getElementById("projectIsolaEdKicker");
    if (edKickerEl) {
      const k =
        rec && rec.isolaEdKicker && String(rec.isolaEdKicker).trim();
      edKickerEl.textContent = k || "";
      edKickerEl.hidden = !k;
    }

    const editorialEl = document.getElementById("projectIsolaEditorial");
    let editorialBlocks = [];
    if (
      rec &&
      Array.isArray(rec.isolaEditorialBlocks) &&
      rec.isolaEditorialBlocks.length
    ) {
      editorialBlocks = rec.isolaEditorialBlocks
        .map((s) => String(s).trim())
        .filter(Boolean);
    } else {
      const fromIntro =
        (rec &&
          rec.isolaIntro &&
          rec.isolaIntro
            .split(/\n\n+/)
            .map((s) => s.trim())
            .filter(Boolean)) ||
        [];
      const fromBody =
        (rec &&
          Array.isArray(rec.isolaBodyParagraphs) &&
          rec.isolaBodyParagraphs
            .map((s) => String(s).trim())
            .filter(Boolean)) ||
        [];
      editorialBlocks = [...fromIntro, ...fromBody].slice(0, 3);
    }
    if (editorialEl) {
      editorialEl.innerHTML = "";
      const edRoles = [
        "project-isola__ed-p--lead",
        "project-isola__ed-p--note",
        "project-isola__ed-p--outro"
      ];
      editorialBlocks.forEach((t, i) => {
        const p = document.createElement("p");
        p.className = "project-isola__ed-p";
        if (edRoles[i]) p.classList.add(edRoles[i]);
        p.textContent = t;
        editorialEl.appendChild(p);
      });
    }

    const pullWrap = document.getElementById("projectIsolaPullWrap");
    const pullEl = document.getElementById("projectIsolaPullQuote");
    const pullText =
      rec && rec.isolaPullQuote && String(rec.isolaPullQuote).trim();
    if (pullWrap && pullEl) {
      if (pullText) {
        pullEl.textContent = pullText;
        pullWrap.hidden = false;
      } else {
        pullEl.textContent = "";
        pullWrap.hidden = true;
      }
    }

    galleryEl.innerHTML = "";
    const galleryEntries =
      entries.length <= 1
        ? []
        : entries.filter((_, i) => i !== heroIdx);
    galleryEntries.forEach((entry, i) => {
      const span = this.pickIsolaGallerySpan(i);
      this.appendIsolaGalleryCard(galleryEl, entry, span, i);
    });

    root.hidden = false;
    root.removeAttribute("hidden");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-isola-active");
    if (this.viewport) {
      gsap.set(this.viewport, { visibility: "hidden", pointerEvents: "none" });
    }
    this.setupIsolaScrollReveal();
  }
  teardownProjectIsolaView() {
    this.teardownIsolaScrollReveal();
    this.isolaHeroItemData = null;
    document.body.classList.remove("project-isola-active");
    const root = this.projectIsolaEl;
    if (root) {
      root.hidden = true;
      root.setAttribute("hidden", "");
      root.setAttribute("aria-hidden", "true");
    }
    if (this.projectIsolaGallery) this.projectIsolaGallery.innerHTML = "";
    const heroBtnEl = document.getElementById("projectIsolaHeroBtn");
    if (heroBtnEl) heroBtnEl.disabled = true;
    const heroImg = document.getElementById("projectIsolaHeroImg");
    if (heroImg) {
      heroImg.removeAttribute("src");
      heroImg.alt = "";
    }
    const heroIntro = document.getElementById("projectIsolaHeroIntro");
    if (heroIntro) heroIntro.textContent = "";
    const editorialInner = document.getElementById("projectIsolaEditorial");
    if (editorialInner) editorialInner.innerHTML = "";
    const pullW = document.getElementById("projectIsolaPullWrap");
    if (pullW) pullW.hidden = true;
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

    const eyebrowEl = document.getElementById("projectHorizontalEyebrow");
    const kickerEl = document.getElementById("projectHorizontalKicker");
    const titleEl = document.getElementById("projectHorizontalTitle");
    const articleEl = document.getElementById("projectHorizontalArticle");
    const rec = this.getActiveProjectRecord();
    const pid = entries[0]?.projectId;
    const ord = pid != null ? this.projectOrdinalInPortfolio(pid) : 3;
    if (eyebrowEl) eyebrowEl.textContent = "Serie";
    if (kickerEl) {
      kickerEl.textContent = `Progetto ${String(ord).padStart(2, "0")}`;
    }
    if (titleEl) titleEl.textContent = rec?.title || "";
    const paras =
      pid != null ? this.getProjectSummaryParagraphs(pid) : [];
    if (articleEl) {
      articleEl.innerHTML = "";
      paras.forEach((text, i) => {
        const p = document.createElement("p");
        p.className = "project-h__p";
        p.style.setProperty("--reveal-delay", `${0.05 + i * 0.07}s`);
        p.textContent = text;
        articleEl.appendChild(p);
      });
    }

    track.innerHTML = "";
    const n = entries.length;
    entries.forEach((entry, i) => {
      const size = this.pickHorizontalMosaicSize(i, n);
      this.appendHorizontalCard(track, entry, size, i);
    });
    track.querySelectorAll(".project-h-card").forEach((btn, i) => {
      btn.style.setProperty(
        "--reveal-delay",
        `${0.08 + (paras.length + i) * 0.065}s`
      );
    });

    this.setupProjectHorizontalScrollReveal();
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
      this.isProjectHorizontalMixedActive() ||
      this.isProjectIsolaLayoutActive() ||
      this.isProjectParigiLayoutActive() ||
      this.isProjectTabooLayoutActive() ||
      this.isProjectModaLayoutActive() ||
      this.isProjectModaJumpLayoutActive() ||
      this.isProjectGallipoliFestivalLayoutActive() ||
      this.isProjectGallipoliDayLayoutActive() ||
      this.isProjectErniaLiveLayoutActive() ||
      this.isProjectLaureaAlbumLayoutActive()
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

    const afterRebuildMs =
      this.perfTier >= 2 ? 380 : this.perfTier >= 1 ? 720 : 1500;
    setTimeout(() => {
      this.initDraggable();
      this.setupViewportObserver();
    }, afterRebuildMs);
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
    this.syncGridItemUrlsToCurrentSlide(itemData);
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
    const mul =
      (itemData.slidePauseMul ?? 1) *
      pfSlideshowPauseMultiplier(this.perfTier);
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

    if (this.prefersReducedMotion || this.perfTier >= 2) {
      img0.src = st.url;
      img0.alt = st.alt;
      gsap.set(slideTrack, { x: 0 });
      img1.removeAttribute("src");
      itemData.currentSlideIndex = target;
      itemData.img = img0;
      this.syncGridItemUrlsToCurrentSlide(itemData);
      itemData.slideTween = null;
      if (Math.random() < 0.09) {
        itemData.slideDelay = gsap.delayedCall(0.12 + Math.random() * 0.22, () =>
          this.advanceGridItemSlide(itemData)
        );
      } else {
        this.scheduleNextSlideshowAdvance(itemData);
      }
      return;
    }

    const spd =
      (itemData.slideSpeedMul ?? 1) *
      pfSlideshowSpeedMultiplier(this.perfTier);
    let duration = 0.38 + Math.random() ** 0.85 * 1.15;
    if (Math.random() < 0.14) {
      duration = 0.035 + Math.random() * 0.09;
    } else if (Math.random() < 0.1) {
      duration = 1.05 + Math.random() * 0.55;
    }
    duration /= spd;
    if (this.perfTier >= 1) {
      duration = Math.min(duration, 0.55);
    }
    const ease =
      this.perfTier >= 1 ? "power2.inOut" : this.randomSlideshowEase();

    const finishForward = () => {
      img0.src = st.url;
      img0.alt = st.alt;
      gsap.set(slideTrack, { x: 0 });
      img1.removeAttribute("src");
      itemData.currentSlideIndex = target;
      itemData.img = img0;
      this.syncGridItemUrlsToCurrentSlide(itemData);
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
    const isolaLayout = this.isProjectIsolaLayoutActive();
    const parigiLayout = this.isProjectParigiLayoutActive();
    const tabooLayout = this.isProjectTabooLayoutActive();
    const modaJumpLayout = this.isProjectModaJumpLayoutActive();
    const gallipoliDayLayout = this.isProjectGallipoliDayLayoutActive();
    const gallipoliFestivalLayout = this.isProjectGallipoliFestivalLayoutActive();
    const erniaLiveLayout = this.isProjectErniaLiveLayoutActive();
    const laureaAlbumLayout = this.isProjectLaureaAlbumLayoutActive();
    const modaLayout = this.isProjectModaLayoutActive();
    if (!projectView) {
      this.teardownProjectConceptView();
      this.teardownProjectHorizontalView();
      this.teardownProjectEditorialView();
      this.teardownProjectIsolaView();
      this.teardownProjectParigiView();
      this.teardownProjectTabooView();
      this.teardownProjectModaJumpView();
      this.teardownProjectGallipoliDayView();
      this.teardownProjectGallipoliView();
      this.teardownProjectErniaView();
      this.teardownProjectLaureaView();
      this.teardownProjectModaView();
    } else {
      if (!conceptLayout) this.teardownProjectConceptView();
      if (!horizontalMixed) this.teardownProjectHorizontalView();
      if (!editorialLayout) this.teardownProjectEditorialView();
      if (!isolaLayout) this.teardownProjectIsolaView();
      if (!parigiLayout) this.teardownProjectParigiView();
      if (!tabooLayout) this.teardownProjectTabooView();
      if (!modaJumpLayout) this.teardownProjectModaJumpView();
      if (!gallipoliDayLayout) this.teardownProjectGallipoliDayView();
      if (!gallipoliFestivalLayout) this.teardownProjectGallipoliView();
      if (!erniaLiveLayout) this.teardownProjectErniaView();
      if (!laureaAlbumLayout) this.teardownProjectLaureaView();
      if (!modaLayout) this.teardownProjectModaView();
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
    if (projectView && isolaLayout) {
      this.buildProjectIsolaView();
      return;
    }
    if (projectView && parigiLayout) {
      this.buildProjectParigiView();
      return;
    }
    if (projectView && tabooLayout) {
      this.buildProjectTabooView();
      return;
    }
    if (projectView && modaJumpLayout) {
      this.buildProjectModaJumpView();
      return;
    }
    if (projectView && gallipoliDayLayout) {
      this.buildProjectGallipoliDayView();
      return;
    }
    if (projectView && gallipoliFestivalLayout) {
      this.buildProjectGallipoliView();
      return;
    }
    if (projectView && erniaLiveLayout) {
      this.buildProjectErniaView();
      return;
    }
    if (projectView && laureaAlbumLayout) {
      this.buildProjectLaureaView();
      return;
    }
    if (projectView && modaLayout) {
      this.buildProjectModaView();
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
    const gridEagerDefault =
      cfg.gridImageEagerCount != null
        ? Math.max(0, Math.floor(Number(cfg.gridImageEagerCount)))
        : 14;
    const gridEagerCap = pfGridEagerImageCap(gridEagerDefault, this.perfTier);
    let gridThumbLoadIndex = 0;

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
          img.loading =
            gridThumbLoadIndex < gridEagerCap ? "eager" : "lazy";
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
      gridThumbLoadIndex += 1;
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
    const fadeInDur =
      this.prefersReducedMotion || this.perfTier >= 2
        ? 0
        : this.perfTier >= 1
          ? 0.32
          : 0.6;
    const fadeOutDur =
      this.prefersReducedMotion || this.perfTier >= 2
        ? 0
        : this.perfTier >= 1
          ? 0.28
          : 0.6;
    const ioRootMargin =
      this.isProjectFilterActive()
        ? "0px"
        : this.perfTier >= 2
          ? "5%"
          : this.perfTier >= 1
            ? "8%"
            : "10%";
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
            } else if (fadeInDur <= 0) {
              gsap.set(entry.target, { opacity: 1 });
            } else {
              gsap.to(entry.target, {
                opacity: 1,
                duration: fadeInDur,
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
              if (fadeOutDur <= 0) {
                gsap.set(entry.target, { opacity: 0.1 });
              } else {
                gsap.to(entry.target, {
                  opacity: 0.1,
                  duration: fadeOutDur,
                  ease: "power2.out"
                });
              }
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
        rootMargin: ioRootMargin
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
   * Overlay zoom: con Drive mostra subito la miniatura già in cache (griglia), poi passa
   * a un thumbnail intermedio (non w3840) per meno attesa e meno rendering progressivo.
   */
  createScalingOverlay(sourceImg, primaryUrl, onReady) {
    const overlay = document.createElement("div");
    overlay.className = "scaling-image-overlay";
    const img = document.createElement("img");
    img.alt = sourceImg.alt;
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

    const quickUrl =
      sourceImg &&
      (sourceImg.currentSrc ||
        sourceImg.src ||
        (sourceImg.getAttribute && sourceImg.getAttribute("src")));
    const primary = primaryUrl || quickUrl || "";
    const quickUrlIsDrive =
      quickUrl && String(quickUrl).indexOf("drive.google.com") !== -1;
    if (quickUrlIsDrive) {
      img.referrerPolicy = "no-referrer";
    }
    const useInstantThumb =
      quickUrlIsDrive &&
      quickUrl &&
      primary &&
      quickUrl !== primary &&
      String(quickUrl).indexOf("data:") !== 0;

    let finished = false;
    const fire = () => {
      if (finished) return;
      finished = true;
      onReady(overlay);
    };

    const upgradeIfNeeded = () => {
      if (!primary || img.src === primary) return;
      const loader = new Image();
      if (String(primary).indexOf("drive.google.com") !== -1) {
        loader.referrerPolicy = "no-referrer";
      }
      loader.onload = () => {
        if (this.zoomState.scalingOverlay !== overlay) return;
        if (String(primary).indexOf("drive.google.com") === -1) {
          img.removeAttribute("referrerpolicy");
        } else {
          img.referrerPolicy = "no-referrer";
        }
        img.src = primary;
      };
      loader.src = primary;
    };

    const onDecodedFire = () => {
      const after = () => {
        fire();
        upgradeIfNeeded();
      };
      if (img.decode) {
        img.decode().then(after).catch(after);
      } else {
        after();
      }
    };

    img.onload = () => onDecodedFire();
    img.onerror = () => {
      if (useInstantThumb && img.dataset.zoomTriedPrimary !== "1") {
        img.dataset.zoomTriedPrimary = "1";
        img.src = primary;
        return;
      }
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

    if (useInstantThumb) {
      img.src = quickUrl;
      if (img.complete && img.naturalWidth > 0) {
        requestAnimationFrame(() => onDecodedFire());
      }
    } else {
      img.src = primary;
      if (img.complete && img.naturalWidth > 0) {
        requestAnimationFrame(() => onDecodedFire());
      }
    }
    setTimeout(fire, 12000);

    return overlay;
  }
  clearZoomTitleDescriptionRelax() {
    if (this.imageTitleOverlay) {
      this.imageTitleOverlay.classList.remove("image-title-overlay--relaxed");
    }
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
    this.preloadZoomNeighborImages(selectedItemData);
  }
  /** Item della vista corrente su cui ha senso avanzare nello zoom (ordine di griglia / serie). */
  getZoomNavigableGridItems() {
    const out = [];
    for (let i = 0; i < this.gridItems.length; i++) {
      const g = this.gridItems[i];
      if (!g || !g.img || !g.element) continue;
      const el = g.element;
      if (el.closest && el.closest(".grid-item--project-blurb")) continue;
      if (!g.fullImageUrl && !g.slideshowSlides?.length) continue;
      out.push(g);
    }
    return out;
  }
  navigateZoomByDelta(delta) {
    if (!this.zoomState.isActive || !this.zoomState.selectedItem) return;
    const items = this.getZoomNavigableGridItems();
    if (items.length < 2) return;
    let i = items.indexOf(this.zoomState.selectedItem);
    if (i < 0) i = 0;
    const j = i + delta;
    if (j < 0 || j >= items.length) return;
    this.swapZoomToItem(items[j]);
  }
  refreshZoomTitleForZoomItem(itemData) {
    this.clearZoomTitleDescriptionRelax();
    gsap.killTweensOf("#imageSlideNumber span, #imageSlideTitle h1");
    if (this.descriptionLines && this.descriptionLines.length) {
      gsap.killTweensOf(this.descriptionLines);
    }
    this.updateTitleOverlayForItem(itemData);
    if (this.imageTitleOverlay) {
      this.imageTitleOverlay.classList.add("active");
    }
    gsap.fromTo(
      "#imageSlideNumber span",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
    );
    gsap.fromTo(
      "#imageSlideTitle h1",
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.38,
        ease: "power2.out",
        delay: 0.04
      }
    );
    if (this.descriptionLines && this.descriptionLines.length) {
      gsap.fromTo(
        this.descriptionLines,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.34,
          stagger: 0.06,
          delay: 0.1,
          ease: "power2.out"
        }
      );
    }
  }
  clearZoomOverlayHoldBackground(overlayEl) {
    if (!overlayEl || !overlayEl.style) return;
    overlayEl.style.backgroundImage = "";
    overlayEl.style.backgroundSize = "";
    overlayEl.style.backgroundPosition = "";
    overlayEl.style.backgroundRepeat = "";
  }
  swapZoomToItem(newItem) {
    const overlay = this.zoomState.scalingOverlay;
    if (
      !overlay ||
      !newItem ||
      !this.zoomState.isActive ||
      newItem === this.zoomState.selectedItem
    ) {
      return;
    }
    const items = this.getZoomNavigableGridItems();
    if (items.indexOf(newItem) < 0) return;
    const img = overlay.querySelector("img");
    if (!img) return;
    const fullUrl = this.getZoomPrimaryImageUrl(newItem);
    if (!fullUrl) return;

    this._zoomSwapGen = (this._zoomSwapGen || 0) + 1;
    const myGen = this._zoomSwapGen;

    const warm = new Image();
    if (String(fullUrl).indexOf("drive.google.com") !== -1) {
      warm.referrerPolicy = "no-referrer";
    }
    warm.src = fullUrl;

    const prev = this.zoomState.selectedItem;
    if (prev && prev.img) {
      gsap.set(prev.img, { opacity: 1 });
    }
    if (newItem.img) {
      gsap.set(newItem.img, { opacity: 0 });
    }

    const thumbUrl = this.pickZoomSwapThumbUrl(newItem);
    const useInstantThumb =
      thumbUrl &&
      thumbUrl !== fullUrl &&
      String(thumbUrl).indexOf("data:") !== 0;

    gsap.killTweensOf(img);
    img.alt = (newItem.img && newItem.img.alt) || "";

    const applyReferrerForUrl = (url) => {
      if (String(url).indexOf("drive.google.com") !== -1) {
        img.referrerPolicy = "no-referrer";
      } else {
        img.removeAttribute("referrerpolicy");
      }
    };

    const fadeInVisible = () => {
      if (myGen !== this._zoomSwapGen) return;
      gsap.to(img, {
        opacity: 1,
        duration: 0.14,
        ease: "power2.out"
      });
    };

    if (useInstantThumb) {
      this.clearZoomOverlayHoldBackground(overlay);
      applyReferrerForUrl(thumbUrl);
      gsap.set(img, { opacity: 1 });
      img.onerror = () => {
        if (myGen !== this._zoomSwapGen) return;
        applyReferrerForUrl(fullUrl);
        img.src = fullUrl;
      };
      img.onload = null;
      img.src = thumbUrl;

      const loader = new Image();
      if (String(fullUrl).indexOf("drive.google.com") !== -1) {
        loader.referrerPolicy = "no-referrer";
      }
      const swapToFull = () => {
        if (myGen !== this._zoomSwapGen) return;
        applyReferrerForUrl(fullUrl);
        overlay.style.backgroundImage =
          "url(" + JSON.stringify(String(thumbUrl)) + ")";
        overlay.style.backgroundSize = "cover";
        overlay.style.backgroundPosition = "center center";
        overlay.style.backgroundRepeat = "no-repeat";
        gsap.set(img, { opacity: 0 });
        let fullSwapDone = false;
        const finishFull = () => {
          if (fullSwapDone || myGen !== this._zoomSwapGen) return;
          fullSwapDone = true;
          this.clearZoomOverlayHoldBackground(overlay);
          gsap.set(img, { opacity: 1 });
          img.onload = null;
          img.onerror = null;
        };
        const revertThumb = () => {
          if (fullSwapDone || myGen !== this._zoomSwapGen) return;
          fullSwapDone = true;
          this.clearZoomOverlayHoldBackground(overlay);
          applyReferrerForUrl(thumbUrl);
          img.onload = null;
          img.onerror = null;
          gsap.set(img, { opacity: 1 });
          img.src = thumbUrl;
        };
        img.onload = finishFull;
        img.onerror = revertThumb;
        img.src = fullUrl;
        if (img.complete && img.naturalWidth > 0) {
          finishFull();
        }
      };
      loader.onload = () => {
        if (myGen !== this._zoomSwapGen) return;
        if (!loader.naturalWidth) return;
        swapToFull();
      };
      loader.onerror = () => {};
      loader.src = fullUrl;
      if (loader.complete && loader.naturalWidth > 0) {
        swapToFull();
      }
    } else if (thumbUrl && thumbUrl === fullUrl) {
      applyReferrerForUrl(fullUrl);
      gsap.set(img, { opacity: 1 });
      img.src = fullUrl;
    } else {
      applyReferrerForUrl(fullUrl);
      gsap.set(img, { opacity: 0 });
      let shown = false;
      const fadeIn = () => {
        if (shown || myGen !== this._zoomSwapGen) return;
        shown = true;
        fadeInVisible();
      };
      img.onload = () => fadeIn();
      img.onerror = () => fadeIn();
      img.src = fullUrl;
      if (img.complete && img.naturalWidth > 0) {
        fadeIn();
      }
      const safetyMs = 14000;
      setTimeout(() => {
        if (myGen !== this._zoomSwapGen) return;
        fadeIn();
      }, safetyMs);
    }

    this.zoomState.selectedItem = newItem;
    this.refreshZoomTitleForZoomItem(newItem);
    this.preloadZoomNeighborImages(newItem);
  }
  attachZoomNavigationControls() {
    const ov = this.zoomState.scalingOverlay;
    if (!ov) return;
    ov.addEventListener("touchstart", this._zoomNavTouchStartBound, {
      passive: true
    });
    ov.addEventListener("touchend", this._zoomNavTouchEndBound, {
      passive: true
    });
  }
  detachZoomNavigationControls() {
    const ov = this.zoomState.scalingOverlay;
    if (!ov) return;
    ov.removeEventListener("touchstart", this._zoomNavTouchStartBound);
    ov.removeEventListener("touchend", this._zoomNavTouchEndBound);
    this._zoomNavTouchStartX = null;
    this._zoomNavTouchStartY = null;
  }
  onZoomNavTouchStart(e) {
    if (!this.zoomState.isActive || !e.touches || e.touches.length !== 1) {
      return;
    }
    this._zoomNavTouchStartX = e.touches[0].clientX;
    this._zoomNavTouchStartY = e.touches[0].clientY;
  }
  onZoomNavTouchEnd(e) {
    if (!this.zoomState.isActive || this._zoomNavTouchStartX == null) {
      return;
    }
    const t = e.changedTouches && e.changedTouches[0];
    if (!t) {
      this._zoomNavTouchStartX = null;
      this._zoomNavTouchStartY = null;
      return;
    }
    const dx = t.clientX - this._zoomNavTouchStartX;
    const dy = t.clientY - (this._zoomNavTouchStartY || 0);
    this._zoomNavTouchStartX = null;
    this._zoomNavTouchStartY = null;
    const threshold = 52;
    if (Math.abs(dx) < threshold) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.15) return;
    if (dx < 0) {
      this.navigateZoomByDelta(1);
    } else {
      this.navigateZoomByDelta(-1);
    }
  }
  enterZoomMode(selectedItemData) {
    if (this.zoomState.isActive) return;
    this.clearZoomTitleDescriptionRelax();
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
      this.getZoomPrimaryImageUrl(selectedItemData),
      startFlip
    );
    this.attachZoomNavigationControls();
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
    const splitLeft = document.getElementById("splitLeft");
    const splitRight = document.getElementById("splitRight");
    if (splitLeft) {
      splitLeft.addEventListener("click", this._handleSplitAreaClickBound);
    }
    if (splitRight) {
      splitRight.addEventListener("click", this._handleSplitAreaClickBound);
    }
    document.addEventListener("keydown", this._handleZoomKeysBound);
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
    this.clearZoomPrefetchTimers();
    this.clearZoomTitleDescriptionRelax();
    this.clearZoomOverlayHoldBackground(this.zoomState.scalingOverlay);
    this.soundSystem.play("close");
    this.detachZoomNavigationControls();
    document.removeEventListener("keydown", this._handleZoomKeysBound);
    const splitLeft = document.getElementById("splitLeft");
    const splitRight = document.getElementById("splitRight");
    if (splitLeft) {
      splitLeft.removeEventListener("click", this._handleSplitAreaClickBound);
    }
    if (splitRight) {
      splitRight.removeEventListener("click", this._handleSplitAreaClickBound);
    }
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
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      this.navigateZoomByDelta(-1);
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      this.navigateZoomByDelta(1);
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
    if (this.prefersReducedMotion || this.perfTier >= 2) {
      gsap.set(this.controlsContainer, { opacity: 1 });
      if (percentageIndicator) gsap.set(percentageIndicator, { x: 0 });
      if (switchElement) gsap.set(switchElement, { y: 0 });
      if (soundToggle) gsap.set(soundToggle, { x: 0 });
      this.controlsContainer.classList.add("visible");
      return;
    }
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
    const navDur = this.perfTier >= 1 ? 0.32 : 0.5;
    const pieceDur = this.perfTier >= 1 ? 0.14 : 0.2;
    const navTimeline = gsap.timeline();
    navTimeline.to(
      this.controlsContainer,
      {
        opacity: 1,
        duration: navDur,
        ease: "power2.out"
      },
      0
    );
    if (percentageIndicator) {
      navTimeline.to(
        percentageIndicator,
        {
          x: 0,
          duration: pieceDur,
          ease: "power2.out"
        },
        this.perfTier >= 1 ? 0.12 : 0.25
      );
    }
    if (switchElement) {
      navTimeline.to(
        switchElement,
        {
          y: 0,
          duration: pieceDur,
          ease: "power2.out"
        },
        this.perfTier >= 1 ? 0.14 : 0.3
      );
    }
    if (soundToggle) {
      navTimeline.to(
        soundToggle,
        {
          x: 0,
          duration: pieceDur,
          ease: "power2.out"
        },
        switchElement
          ? this.perfTier >= 1
            ? 0.16
            : 0.35
          : this.perfTier >= 1
            ? 0.14
            : 0.3
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
    if (this.isProjectIsolaLayoutActive()) return;
    if (this.isProjectParigiLayoutActive()) return;
    if (this.isProjectTabooLayoutActive()) return;
    if (this.isProjectModaJumpLayoutActive()) return;
    if (this.isProjectGallipoliFestivalLayoutActive()) return;
    if (this.isProjectGallipoliDayLayoutActive()) return;
    if (this.isProjectErniaLiveLayoutActive()) return;
    if (this.isProjectLaureaAlbumLayoutActive()) return;
    if (this.isProjectModaLayoutActive()) return;
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
    homeLoadingFlags.dismissScheduled = true;
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
        if (
          this.isProjectEditorialLayoutActive() &&
          this.projectEditorialEl &&
          !this.projectEditorialEl.hidden &&
          !(this.zoomState && this.zoomState.isActive)
        ) {
          this.buildProjectEditorialView();
        }
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

    if (this.projectIsolaEl) {
      this.projectIsolaEl.addEventListener("click", (e) => {
        if (!this.isProjectIsolaLayoutActive()) return;
        if (this.zoomState.isActive || this.isAboutOpen()) return;
        const heroHit = e.target.closest("#projectIsolaHeroBtn");
        if (heroHit && this.projectIsolaEl.contains(heroHit)) {
          e.preventDefault();
          if (this.isolaHeroItemData) {
            this.enterZoomMode(this.isolaHeroItemData);
          }
          return;
        }
        const card = e.target.closest(".project-isola__card");
        if (
          !card ||
          !this.projectIsolaGallery ||
          !this.projectIsolaGallery.contains(card)
        ) {
          return;
        }
        const itemData = this.gridItems.find((g) => g.element === card);
        if (!itemData) return;
        e.preventDefault();
        this.enterZoomMode(itemData);
      });
    }

    if (this.projectParigiEl) {
      this.projectParigiEl.addEventListener("click", (e) => {
        if (!this.isProjectParigiLayoutActive()) return;
        if (this.zoomState.isActive || this.isAboutOpen()) return;
        const heroHit = e.target.closest("#projectParigiHeroBtn");
        if (heroHit && this.projectParigiEl.contains(heroHit)) {
          e.preventDefault();
          if (this.parigiHeroItemData) {
            this.enterZoomMode(this.parigiHeroItemData);
          }
          return;
        }
        const card = e.target.closest(".project-parigi__card");
        if (
          !card ||
          !this.projectParigiGallery ||
          !this.projectParigiGallery.contains(card)
        ) {
          return;
        }
        const itemData = this.gridItems.find((g) => g.element === card);
        if (!itemData) return;
        e.preventDefault();
        this.enterZoomMode(itemData);
      });
    }

    if (this.projectModaJumpEl) {
      this.projectModaJumpEl.addEventListener("click", (e) => {
        if (!this.isProjectModaJumpLayoutActive()) return;
        if (this.zoomState.isActive || this.isAboutOpen()) return;
        const heroHit = e.target.closest("#projectModaJumpHeroBtn");
        if (heroHit && this.projectModaJumpEl.contains(heroHit)) {
          e.preventDefault();
          if (this.modaJumpHeroItemData) {
            this.enterZoomMode(this.modaJumpHeroItemData);
          }
          return;
        }
        const card = e.target.closest(".project-moda-jump__card");
        if (
          !card ||
          !this.projectModaJumpGallery ||
          !this.projectModaJumpGallery.contains(card)
        ) {
          return;
        }
        const itemData = this.gridItems.find((g) => g.element === card);
        if (!itemData) return;
        e.preventDefault();
        this.enterZoomMode(itemData);
      });
    }

    if (this.projectGallipoliDayEl) {
      this.projectGallipoliDayEl.addEventListener("click", (e) => {
        if (!this.isProjectGallipoliDayLayoutActive()) return;
        if (this.zoomState.isActive || this.isAboutOpen()) return;
        const heroHit = e.target.closest("#projectGallipoliDayHeroBtn");
        if (heroHit && this.projectGallipoliDayEl.contains(heroHit)) {
          e.preventDefault();
          if (this.gallipoliDayHeroItemData) {
            this.enterZoomMode(this.gallipoliDayHeroItemData);
          }
          return;
        }
        const card = e.target.closest(".project-gallipoli-day__card");
        if (
          !card ||
          !this.projectGallipoliDayGallery ||
          !this.projectGallipoliDayGallery.contains(card)
        ) {
          return;
        }
        const itemData = this.gridItems.find((g) => g.element === card);
        if (!itemData) return;
        e.preventDefault();
        this.enterZoomMode(itemData);
      });
    }

    if (this.projectGallipoliEl) {
      this.projectGallipoliEl.addEventListener("click", (e) => {
        if (!this.isProjectGallipoliFestivalLayoutActive()) return;
        if (this.zoomState.isActive || this.isAboutOpen()) return;
        const heroHit = e.target.closest("#projectGallipoliHeroBtn");
        if (heroHit && this.projectGallipoliEl.contains(heroHit)) {
          e.preventDefault();
          if (this.gallipoliHeroItemData) {
            this.enterZoomMode(this.gallipoliHeroItemData);
          }
          return;
        }
        const card = e.target.closest(".project-gallipoli__card");
        if (
          !card ||
          !this.projectGallipoliGallery ||
          !this.projectGallipoliGallery.contains(card)
        ) {
          return;
        }
        const itemData = this.gridItems.find((g) => g.element === card);
        if (!itemData) return;
        e.preventDefault();
        this.enterZoomMode(itemData);
      });
    }

    if (this.projectErniaEl) {
      this.projectErniaEl.addEventListener("click", (e) => {
        if (!this.isProjectErniaLiveLayoutActive()) return;
        if (this.zoomState.isActive || this.isAboutOpen()) return;
        const heroHit = e.target.closest("#projectErniaHeroBtn");
        if (heroHit && this.projectErniaEl.contains(heroHit)) {
          e.preventDefault();
          if (this.erniaHeroItemData) {
            this.enterZoomMode(this.erniaHeroItemData);
          }
          return;
        }
        const card = e.target.closest(".project-ernia__card");
        if (
          !card ||
          !this.projectErniaGallery ||
          !this.projectErniaGallery.contains(card)
        ) {
          return;
        }
        const itemData = this.gridItems.find((g) => g.element === card);
        if (!itemData) return;
        e.preventDefault();
        this.enterZoomMode(itemData);
      });
    }

    if (this.projectLaureaEl) {
      this.projectLaureaEl.addEventListener("click", (e) => {
        if (!this.isProjectLaureaAlbumLayoutActive()) return;
        if (this.zoomState.isActive || this.isAboutOpen()) return;
        const heroHit = e.target.closest("#projectLaureaHeroBtn");
        if (heroHit && this.projectLaureaEl.contains(heroHit)) {
          e.preventDefault();
          if (this.laureaHeroItemData) {
            this.enterZoomMode(this.laureaHeroItemData);
          }
          return;
        }
        const card = e.target.closest(".project-laurea__card");
        if (
          !card ||
          !this.projectLaureaGallery ||
          !this.projectLaureaGallery.contains(card)
        ) {
          return;
        }
        const itemData = this.gridItems.find((g) => g.element === card);
        if (!itemData) return;
        e.preventDefault();
        this.enterZoomMode(itemData);
      });
    }

    if (this.projectTabooEl) {
      this.projectTabooEl.addEventListener("click", (e) => {
        if (!this.isProjectTabooLayoutActive()) return;
        if (this.zoomState.isActive || this.isAboutOpen()) return;
        const heroHit = e.target.closest("#projectTabooHeroBtn");
        if (heroHit && this.projectTabooEl.contains(heroHit)) {
          e.preventDefault();
          if (this.tabooHeroItemData) {
            this.enterZoomMode(this.tabooHeroItemData);
          }
          return;
        }
        const card = e.target.closest(".project-taboo__card");
        if (
          !card ||
          !this.projectTabooGallery ||
          !this.projectTabooGallery.contains(card)
        ) {
          return;
        }
        const itemData = this.gridItems.find((g) => g.element === card);
        if (!itemData) return;
        e.preventDefault();
        this.enterZoomMode(itemData);
      });
    }

    if (this.projectModaEl) {
      this.projectModaEl.addEventListener("click", (e) => {
        if (!this.isProjectModaLayoutActive()) return;
        if (this.zoomState.isActive || this.isAboutOpen()) return;
        const heroHit = e.target.closest("#projectModaHeroBtn");
        if (heroHit && this.projectModaEl.contains(heroHit)) {
          e.preventDefault();
          if (this.modaHeroItemData) {
            this.enterZoomMode(this.modaHeroItemData);
          }
          return;
        }
        const card = e.target.closest(".project-moda__card");
        if (
          !card ||
          !this.projectModaGallery ||
          !this.projectModaGallery.contains(card)
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