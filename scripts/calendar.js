/* =========================================================
   SocialFlow AI — Calendário editorial (calendar.js)
   Visão semanal (segunda a domingo) com status de cada item.
   ========================================================= */

(function () {
  const A = SFApp;
  const D = DEMO_CONTENT;
  let weekStart = A.startOfWeek(new Date()); // segunda-feira da semana exibida

  function renderCalendar() {
    const posts = SFStore.getPosts();
    const todayISO = A.toISODate(new Date());
    const end = A.addDays(weekStart, 6);
    const fmt = { day: "2-digit", month: "2-digit" };

    A.$("#week-label").textContent =
      weekStart.toLocaleDateString("pt-BR", fmt) + " – " + end.toLocaleDateString("pt-BR", fmt) + "/" + end.getFullYear();

    let html = "";
    for (let i = 0; i < 7; i++) {
      const date = A.addDays(weekStart, i);
      const iso = A.toISODate(date);
      const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
      const dayName = weekday.charAt(0).toUpperCase() + weekday.slice(1); // "Segunda-feira"
      const dayPosts = posts
        .filter(function (p) { return p.scheduled_for === iso; })
        .sort(function (a, b) { return (a.created_at || "").localeCompare(b.created_at || ""); });

      html +=
        '<div class="day-column' + (iso === todayISO ? " today" : "") + '">' +
          '<div class="day-header">' +
            '<p class="day-name">' + dayName + (iso === todayISO ? " · hoje" : "") + "</p>" +
            '<p class="day-date">' + date.toLocaleDateString("pt-BR", fmt) + "</p>" +
          "</div>" +
          '<div class="day-items">' +
            dayPosts.map(function (p) {
              return (
                '<button type="button" class="cal-item" data-id="' + A.escapeHtml(p.id) + '" title="Clique para editar">' +
                  '<span class="cal-item-title">' + A.escapeHtml(p.title) + "</span>" +
                  '<span class="tag status-' + A.escapeHtml(p.status) + '">' + A.escapeHtml(A.statusLabel(p.status)) + "</span>" +
                "</button>"
              );
            }).join("") +
          "</div>" +
          '<button type="button" class="day-add" data-date="' + iso + '">+ Adicionar</button>' +
        "</div>";
    }
    A.$("#calendar-week").innerHTML = html;
  }

  // Clique em um item (editar) ou em "+ Adicionar" (novo conteúdo naquele dia)
  function onCalendarClick(event) {
    const item = event.target.closest(".cal-item");
    if (item) {
      const post = SFStore.getPost(item.dataset.id);
      if (post) A.openPostModal(post);
      return;
    }
    const add = event.target.closest(".day-add");
    if (add) {
      A.openPostModal({ scheduled_for: add.dataset.date, status: "ideia", content_type: "legenda" });
    }
  }

  function changeWeek(days) {
    weekStart = days === 0 ? A.startOfWeek(new Date()) : A.addDays(weekStart, days);
    renderCalendar();
  }

  // Gera 7 ideias (uma por dia) para a semana exibida
  async function onPlanWeek(event) {
    event.preventDefault();
    const ok = A.validate([
      { id: "week-product", message: "Informe o produto ou serviço.", min: 2 },
      { id: "week-goal", message: "Escolha o objetivo." }
    ]);
    if (!ok) return;

    const business = SFGenerator.ensureCanGenerate();
    if (!business) return;

    const product = A.$("#week-product").value.trim();
    const goal = A.$("#week-goal").value;
    const niche = SFGenerator.getNiche(business.niche);
    const platform = SFStore.getSettings().defaultPlatform;

    if (typeof SFSupabase !== "undefined" && SFSupabase.isLoggedIn()) {
      const btn = A.$('#week-plan-form button[type="submit"]');
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "⏳ Planejando com IA…";
      try {
        const res = await SFSupabase.generateWithAI("calendar", business, { product: product, goal: goal });
        const days = (res.data && res.data.days) || [];
        days.slice(0, 7).forEach(function (day, i) {
          SFStore.addPost({
            title: (day.type || "Conteúdo") + " · " + (day.theme || "Ideia do dia"),
            content_type: "calendario",
            platform: platform,
            status: "ideia",
            scheduled_for: A.toISODate(A.addDays(weekStart, i)),
            caption: day.caption || "",
            cta: day.cta || "",
            hashtags: niche.hashtags.slice(0, 3).join(" "),
            visual: day.idea || ""
          });
        });
        if (res.usage) SFStore.setUsageFromServer(res.usage.plan, res.usage.used);
        else SFStore.logUsage("calendar");
        A.toast("Semana planejada com IA! Revise cada item antes de publicar.", "success");
        A.refresh();
      } catch (err) {
        A.toast(err.message, "error");
      } finally {
        btn.disabled = false;
        btn.textContent = original;
      }
      return;
    }

    const vars = SFGenerator.buildVars(business, niche, product);
    vars.goalCta = SFGenerator.fill(D.reelCtas[goal], vars);

    D.weekPlan.forEach(function (day, i) {
      SFStore.addPost({
        title: day.type + " · " + SFGenerator.fill(day.theme, vars),
        content_type: "calendario",
        platform: platform,
        status: "ideia",
        scheduled_for: A.toISODate(A.addDays(weekStart, i)),
        caption: SFGenerator.fill(day.caption, vars),
        cta: SFGenerator.fill(day.cta, vars),
        hashtags: niche.hashtags.slice(0, 3).join(" "),
        visual: SFGenerator.fill(day.idea, vars)
      });
    });

    SFStore.logUsage("calendar");
    A.toast("Semana planejada com 7 ideias (demonstração). Clique em cada uma para editar.", "success");
    A.refresh();
  }

  function copyWeek() {
    const posts = SFStore.getPosts();
    const lines = [];
    for (let i = 0; i < 7; i++) {
      const date = A.addDays(weekStart, i);
      const iso = A.toISODate(date);
      const dayPosts = posts.filter(function (p) { return p.scheduled_for === iso; });
      if (!dayPosts.length) continue;
      const dayLabel = date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });
      lines.push("📅 " + dayLabel.toUpperCase());
      dayPosts.forEach(function (p) {
        lines.push("• [" + A.statusLabel(p.status) + "] " + p.title);
        if (p.caption) lines.push("  " + p.caption);
        if (p.cta) lines.push("  CTA: " + p.cta);
      });
      lines.push("");
    }
    if (!lines.length) {
      A.toast("Nenhum conteúdo agendado nesta semana para copiar.", "error");
      return;
    }
    A.copyText(lines.join("\n").trim());
  }

  A.$("#calendar-week").addEventListener("click", onCalendarClick);
  A.$("#week-prev").addEventListener("click", function () { changeWeek(-7); });
  A.$("#week-next").addEventListener("click", function () { changeWeek(7); });
  A.$("#week-today").addEventListener("click", function () { changeWeek(0); });
  if (A.$("#week-copy")) A.$("#week-copy").addEventListener("click", copyWeek);
  A.$("#week-plan-form").addEventListener("submit", onPlanWeek);

  A.onShow("calendario", renderCalendar);
})();
