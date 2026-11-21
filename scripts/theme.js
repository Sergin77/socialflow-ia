/* =========================================================
   SocialFlow AI — Alternância de Tema (Escuro / Claro)
   Mantém o azul-marinho (#10172A) como padrão e salva a
   preferência de leitura no navegador.
   ========================================================= */

(function () {
  const KEY = "socialflow_theme_v1";

  function applyTheme(theme) {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.textContent = theme === "light" ? "🌙" : "☀️";
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
