import { FashionGallery } from "./modules/fashion-gallery.js";
import { loadPortfolioDriveManifest } from "./modules/drive-manifest.js";
import {
  HOME_LOADING_MAX_MS,
  dismissHomeLoading,
  homeLoadingFlags,
  setHomeLoadingStartNow,
} from "./modules/home-loading.js";

let gallery;

function scheduleHomeLoadingMaxTimeout() {
  window.setTimeout(() => {
    const el = document.getElementById("homeLoadingOverlay");
    if (!el || homeLoadingFlags.dismissScheduled) return;
    homeLoadingFlags.dismissScheduled = true;
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

async function fashionGalleryBoot() {
  setHomeLoadingStartNow();
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
    homeLoadingFlags.dismissScheduled = true;
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
