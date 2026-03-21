/**
 * Carica uno tra script-mobile.js e script-desktop.js (solo flag), poi script-shared.js.
 * Breakpoint 900px = style-mobile.css (max-width: 900px).
 * Al resize serve un refresh per allineare JS e fogli caricati con media.
 */
(function () {
  var BP =
    typeof window.__PF_BREAKPOINT_PX__ === "number"
      ? window.__PF_BREAKPOINT_PX__
      : 900;
  var stubSrc = window.matchMedia("(max-width: " + BP + "px)").matches
    ? "script-mobile.js"
    : "script-desktop.js";
  var anchor = document.currentScript;

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

  append(stubSrc, function () {
    append("script-shared.js");
  });
})();
