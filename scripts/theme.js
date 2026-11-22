/* =========================================================
   SocialFlow AI — Alternância de Tema (Escuro / Claro)
   Mantém o azul-marinho (#10172A) como padrão e salva a
   preferência de leitura no navegador.
   ========================================================= */

(function () {
  const KEY = "socialflow_theme_v1";

  const SUN_SVG =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="4"/>' +
      '<line x1="12" y1="2" x2="12" y2="4"/>' +
      '<line x1="12" y1="20" x2="12" y2="22"/>' +
      '<line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/>' +
      '<line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/>' +
      '<line x1="2" y1="12" x2="4" y2="12"/>' +
      '<line x1="20" y1="12" x2="22" y2="12"/>' +
      '<line x1="6.34" y1="17.66" x2="4.93" y2="19.07"/>' +
      '<line x1="19.07" y1="4.93" x2="17.66" y2="6.34"/>' +
    "</svg>";

  const MOON_SVG =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' +
    "</svg>";

  function applyTheme(theme) {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.innerHTML = theme === "light" ? MOON_SVG : SUN_SVG;
      btn.title = theme === "light" ? "Mudar para tema escuro" : "Mudar para tema claro";
      btn.setAttribute("aria-label", btn.title);
    }
  }

  let saved = "dark";
  try {
    saved = window.localStorage.getItem(KEY) || "dark";
  } catch (e) { /* ignorar */ }
  applyTheme(saved);

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(saved);
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      saved = next;
      applyTheme(next);
      try {
        window.localStorage.setItem(KEY, next);
      } catch (e) { /* ignorar */ }
    });
  });
})();
