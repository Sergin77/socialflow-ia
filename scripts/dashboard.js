/* =========================================================
   SocialFlow AI — Dashboard (dashboard.js)
   Mostra números de resumo e os itens mais recentes.
   ========================================================= */

(function () {
  const A = SFApp;

  function renderDashboard() {
    const posts = SFStore.getPosts();
    const business = SFStore.getBusiness();

    // Intervalo da semana atual (segunda a domingo)
    const monday = A.startOfWeek(new Date());
    const weekStart = A.toISODate(monday);
    const weekEnd = A.toISODate(A.addDays(monday, 6));

    const scheduledThisWeek = posts.filter(function (p) {
      return p.scheduled_for && p.scheduled_for >= weekStart && p.scheduled_for <= weekEnd;
    }).length;
    const published = posts.filter(function (p) { return p.status === "publicado"; }).length;

    A.$("#stat-total").textContent = posts.length;
    A.$("#stat-week").textContent = scheduledThisWeek;
    A.$("#stat-published").textContent = published;
    A.$("#stat-left").textContent = SFStore.getRemaining();

    A.$("#dash-no-business").classList.toggle("hidden", Boolean(business));

    // Saudação personalizada
    const name = SFStore.getSettings().userName;
    A.$("#view-dashboard .view-intro").textContent =
      (name ? "Olá, " + name + "! " : "") + "Resumo do seu marketing nesta semana.";

    // Ideias rápidas para hoje (1 clique preenche o gerador)
    const quickBox = A.$("#quick-ideas-list");
    if (quickBox) {
      const nicheId = business ? business.niche : "barbearia";
      const niche = DEMO_CONTENT.niches.find(function (n) { return n.id === nicheId; }) || DEMO_CONTENT.niches[0];
      const ideas = [
        { title: "Atrair novos clientes", desc: niche.sampleProducts[0] || "serviço principal", goal: "atrair" },
        { title: "Dica útil do segmento", desc: niche.sampleProducts[1] || "cuidados no dia a dia", goal: "educar" },
        { title: "Engajar seguidores", desc: niche.sampleProducts[2] || "bastidores da equipe", goal: "engajar" }
      ];
      quickBox.innerHTML = ideas.map(function (item) {
        return (
          '<button type="button" class="quick-idea-btn" data-product="' + A.escapeHtml(item.desc) + '" data-goal="' + item.goal + '">' +
            "<strong>" + A.escapeHtml(item.title) + "</strong>" +
            "<span>Sugestão: " + A.escapeHtml(item.desc) + " →</span>" +
          "</button>"
        );
      }).join("");
    }

    // Itens recentes (até 5)
    const list = A.$("#recent-list");
    if (A.isLoadingRemote && A.isLoadingRemote()) {
      list.innerHTML = '<div class="empty-state">⏳ Carregando seus dados…</div>';
      return;
    }
    if (!posts.length) {
      list.innerHTML =
        '<div class="empty-state">Nenhum conteúdo salvo ainda.<br>' +
        'Comece pelo <a href="#legendas">gerador de legendas</a> ou ' +
        'carregue exemplos em <a href="#configuracoes">Configurações</a>.</div>';
      return;
    }
    list.innerHTML = posts.slice(0, 5).map(function (p) { return A.renderPostItem(p); }).join("");
  }

  const quickList = A.$("#quick-ideas-list");
  if (quickList) {
    quickList.addEventListener("click", function (event) {
      const btn = event.target.closest(".quick-idea-btn");
      if (!btn) return;
      if (typeof SFGenerator !== "undefined" && SFGenerator.prefillCaption) {
        SFGenerator.prefillCaption({ product: btn.dataset.product, goal: btn.dataset.goal });
      }
      window.location.hash = "legendas";
    });
  }

  A.onShow("dashboard", renderDashboard);
})();
