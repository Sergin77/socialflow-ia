/* =========================================================
   SocialFlow AI — Histórico (history.js)
   Lista todos os conteúdos com busca e filtros.
   ========================================================= */

(function () {
  const A = SFApp;

  // Remove acentos e deixa minúsculo, para a busca achar "salao" e "Salão"
  function normalize(text) {
    return String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function renderHistory() {
    const all = SFStore.getPosts();
    const search = normalize(A.$("#hist-search").value.trim());
    const type = A.$("#hist-type").value;
    const status = A.$("#hist-status").value;

    const filtered = all.filter(function (p) {
      const matchesSearch = !search || normalize(p.title + " " + p.caption + " " + p.hashtags).includes(search);
      const matchesType = !type || p.content_type === type;
      const matchesStatus = !status || p.status === status;
      return matchesSearch && matchesType && matchesStatus;
    });

    A.$("#hist-count").textContent = all.length
      ? "Mostrando " + filtered.length + " de " + all.length + " conteúdo(s)."
      : "";

    const list = A.$("#history-list");
    if (!all.length) {
      list.innerHTML =
        '<div class="empty-state">Nada salvo ainda.<br>' +
        'Gere uma <a href="#legendas">legenda</a>, ideias de <a href="#reels">Reels</a> ' +
        'ou carregue exemplos em <a href="#configuracoes">Configurações</a>.</div>';
      return;
    }
    if (!filtered.length) {
      list.innerHTML = '<div class="empty-state">Nenhum conteúdo encontrado com esses filtros.</div>';
      return;
    }
    list.innerHTML = filtered.map(function (p) { return A.renderPostItem(p, { showDelete: true }); }).join("");
  }

  A.$("#hist-search").addEventListener("input", renderHistory);
  A.$("#hist-type").addEventListener("change", renderHistory);
  A.$("#hist-status").addEventListener("change", renderHistory);

  A.onShow("historico", renderHistory);
})();
