/* =========================================================
   SocialFlow AI — Calendário editorial (calendar.js)
   Visão semanal (segunda a domingo) com status de cada item.
   ========================================================= */

(function () {
  const A = SFApp;
  const D = DEMO_CONTENT;
  let weekStart = A.startOfWeek(new Date()); // segunda-feira da semana exibida
  let monthRef = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let viewMode = "week"; // "week" | "month"

  function renderPostButton(p) {
    return (
      '<button type="button" class="cal-item" data-id="' + A.escapeHtml(p.id) + '" title="Clique para editar">' +
        '<span class="cal-item-title">' + A.escapeHtml(p.title) + "</span>" +
        '<span class="tag status-' + A.escapeHtml(p.status) + '">' + A.escapeHtml(A.statusLabel(p.status)) + "</span>" +
      "</button>"
    );
  }

  function renderMonth(posts, todayISO) {
    const year = monthRef.getFullYear();
    const month = monthRef.getMonth();
    const label = monthRef.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    A.$("#week-label").textContent = label.charAt(0).toUpperCase() + label.slice(1);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const gridStart = A.startOfWeek(firstDay);
    const totalDays = Math.ceil(((lastDay - gridStart) / 86400000 + 1) / 7) * 7;

    const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    let html = weekdays.map(function (w) { return '<div class="month-weekday">' + w + "</div>"; }).join("");

    for (let i = 0; i < totalDays; i++) {
      const date = A.addDays(gridStart, i);
      const iso = A.toISODate(date);
      const isOther = date.getMonth() !== month;
      const dayPosts = posts.filter(function (p) { return p.scheduled_for === iso; });

      html +=
        '<div class="month-day' + (iso === todayISO ? " today" : "") + (isOther ? " is-other" : "") + '">' +
          '<div class="month-day-head">' +
            "<span>" + date.getDate() + "</span>" +
            '<button type="button" class="month-add" data-date="' + iso + '" title="Adicionar neste dia">+</button>' +
          "</div>" +
          dayPosts.map(renderPostButton).join("") +
        "</div>";
    }
    const container = A.$("#calendar-week");
    container.className = "calendar-month";
    container.innerHTML = html;
  }

  function renderCalendar() {
    const posts = SFStore.getPosts();
    const todayISO = A.toISODate(new Date());

    if (viewMode === "month") {
      renderMonth(posts, todayISO);
      return;
    }

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
            dayPosts.map(renderPostButton).join("") +
          "</div>" +
          '<button type="button" class="day-add" data-date="' + iso + '">+ Adicionar</button>' +
        "</div>";
    }
    const container = A.$("#calendar-week");
    container.className = "calendar-week";
    container.innerHTML = html;
  }

  // Clique em um item (editar) ou em "+ Adicionar" / "+" (novo conteúdo naquele dia)
  function onCalendarClick(event) {
    const item = event.target.closest(".cal-item");
    if (item) {
      const post = SFStore.getPost(item.dataset.id);
      if (post) A.openPostModal(post);
      return;
    }
    const add = event.target.closest(".day-add, .month-add");
    if (add) {
      A.openPostModal({ scheduled_for: add.dataset.date, status: "ideia", content_type: "legenda" });
    }
  }

  function changePeriod(dir) {
    if (viewMode === "month") {
      monthRef = dir === 0
        ? new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        : new Date(monthRef.getFullYear(), monthRef.getMonth() + (dir > 0 ? 1 : -1), 1);
    } else {
      weekStart = dir === 0 ? A.startOfWeek(new Date()) : A.addDays(weekStart, dir);
    }
    renderCalendar();
  }

  function setViewMode(mode) {
    viewMode = mode;
    if (A.$("#cal-mode-week")) A.$("#cal-mode-week").classList.toggle("active", mode === "week");
    if (A.$("#cal-mode-month")) A.$("#cal-mode-month").classList.toggle("active", mode === "month");
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

  function formatPeriodText() {
    const posts = SFStore.getPosts();
    const lines = [];
    let startDate = weekStart;
    let totalDays = 7;

    if (viewMode === "month") {
      startDate = new Date(monthRef.getFullYear(), monthRef.getMonth(), 1);
      totalDays = new Date(monthRef.getFullYear(), monthRef.getMonth() + 1, 0).getDate();
    }

    for (let i = 0; i < totalDays; i++) {
      const date = A.addDays(startDate, i);
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
    return lines.join("\n").trim();
  }

  function copyWeek() {
    const text = formatPeriodText();
    if (!text) {
      A.toast("Nenhum conteúdo agendado neste período para copiar.", "error");
      return;
    }
    A.copyText(text, A.$("#week-copy"));
  }

  function downloadPeriod() {
    const text = formatPeriodText();
    if (!text) {
      A.toast("Nenhum conteúdo agendado neste período para baixar.", "error");
      return;
    }
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "socialflow-calendario.txt";
    link.click();
    URL.revokeObjectURL(url);
    A.toast("Calendário baixado em .txt!", "success");
  }

  function downloadPeriodCsv() {
    const days = getPeriodDays();
    const posts = SFStore.getPosts();
    const rows = [["Data", "Tipo", "Rede", "Status", "Titulo", "Legenda", "CTA", "Hashtags"]];
    const esc = function (v) { return '"' + String(v || "").replace(/"/g, '""') + '"'; };
    let count = 0;
    days.forEach(function (d) {
      const iso = A.toISODate(d);
      posts.filter(function (p) { return p.scheduled_for === iso; }).forEach(function (p) {
        count++;
        rows.push([iso, A.typeLabel(p.content_type), p.platform, A.statusLabel(p.status), p.title, p.caption, p.cta, p.hashtags]);
      });
    });
    if (!count) {
      A.toast("Nenhum conteúdo agendado neste período para baixar.", "error");
      return;
    }
    const csv = "\uFEFF" + rows.map(function (r) { return r.map(esc).join(";"); }).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "socialflow-calendario.csv";
    link.click();
    URL.revokeObjectURL(url);
    A.toast("Calendário baixado em .csv!", "success");
  }

  A.$("#calendar-week").addEventListener("click", onCalendarClick);
  A.$("#week-prev").addEventListener("click", function () { changePeriod(-7); });
  A.$("#week-next").addEventListener("click", function () { changePeriod(7); });
  A.$("#week-today").addEventListener("click", function () { changePeriod(0); });
  if (A.$("#cal-mode-week")) A.$("#cal-mode-week").addEventListener("click", function () { setViewMode("week"); });
  if (A.$("#cal-mode-month")) A.$("#cal-mode-month").addEventListener("click", function () { setViewMode("month"); });
  if (A.$("#week-copy")) A.$("#week-copy").addEventListener("click", copyWeek);
  if (A.$("#week-download")) A.$("#week-download").addEventListener("click", downloadPeriod);
  if (A.$("#week-download-csv")) A.$("#week-download-csv").addEventListener("click", downloadPeriodCsv);
  A.$("#week-plan-form").addEventListener("submit", onPlanWeek);

  A.onShow("calendario", renderCalendar);
})();
