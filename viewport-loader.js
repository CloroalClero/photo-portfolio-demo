/**
 * Carica lo stub mobile/desktop (flag layout), poi js/app.js (ES module).
 * Breakpoint 900px = style-mobile.css (max-width: 900px).
 * Al resize serve un refresh per allineare JS e fogli caricati con media.
 */
(function () {
  var BP =
    typeof window.__PF_BREAKPOINT_PX__ === "number"
      ? window.__PF_BREAKPOINT_PX__
      : 900;
  var anchor = document.currentScript;
  var scriptBase =
    anchor && anchor.src ? String(anchor.src).replace(/[^/]+$/, "") : "";
  var stubSrc = window.matchMedia("(max-width: " + BP + "px)").matches
    ? scriptBase + "js/script-mobile.js"
    : scriptBase + "js/script-desktop.js";

  function append(src, onload) {
    var s = document.createElement("script");
    s.src = src;
    s.async = false;
    if (onload) s.onload = onload;
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(s, anchor.nextSibling);
    } else {
      document.head.appendChild(s);
    }
    anchor = s;
  }

  function appendModule(src) {
    var s = document.createElement("script");
    s.type = "module";
    s.src = src;
    s.async = false;
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(s, anchor.nextSibling);
    } else {
      document.head.appendChild(s);
    }
    anchor = s;
  }

  append(stubSrc, function () {
    appendModule(scriptBase + "js/app.js");
  });
})();
