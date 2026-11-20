/* =========================================================
   SocialFlow AI — "Cérebro" da aplicação (app.js)
   ---------------------------------------------------------
   Responsável por:
   - trocar de tela pelo menu (sem recarregar a página);
   - ferramentas comuns (avisos, copiar, datas, validação);
   - tela "Minha empresa" e tela "Configurações";
   - janela (modal) de edição usada por várias telas.
   ========================================================= */

const SFApp = (function () {
  const D = DEMO_CONTENT;
  const VIEWS = ["dashboard", "empresa", "legendas", "reels", "card", "calendario", "historico", "configuracoes"];
  const renderers = {};      // funções que desenham cada tela
  let currentView = "dashboard";
  let loadingRemote = false;
  let creatingNewBusiness = false;

  /* =====================================================
     1. FERRAMENTAS GERAIS
     ===================================================== */

  // Atalho para encontrar elementos na página
  function $(selector, root) { return (root || document).querySelector(selector); }
  function $all(selector, root) { return Array.from((root || document).querySelectorAll(selector)); }

  // Evita que textos digitados virem código HTML (proteção básica contra XSS)
  function escapeHtml(text) {
    return String(text == null ? "" : text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Mostra uma mensagem rápida no canto da tela
  function toast(message, type) {
    const container = $("#toast-container");
    const el = document.createElement("div");
    el.className = "toast" + (type === "success" ? " toast-success" : type === "error" ? " toast-error" : "");
    el.textContent = message;
    container.appendChild(el);
    setTimeout(function () { el.remove(); }, 4000);
  }

  // Copia um texto para a área de transferência (Ctrl+V depois)
  function legacyCopy(text) {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    area.remove();
    return ok;
  }

  function copyText(text) {
    const done = function () { toast("Copiado! Agora é só colar onde quiser (Ctrl + V).", "success"); };
    const fail = function () { toast("Não foi possível copiar automaticamente. Selecione o texto e use Ctrl + C.", "error"); };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        legacyCopy(text) ? done() : fail();
      });
    } else {
      legacyCopy(text) ? done() : fail();
    }
  }

  /* ---------- Datas (sempre no formato AAAA-MM-DD) ---------- */
  function toISODate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function parseISODate(text) {
    const parts = String(text).split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function formatDate(text) {
    if (!text) return "";
    return parseISODate(text).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
  }

  function addDays(date, n) {
    const r = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    r.setDate(r.getDate() + n);
    return r;
  }

  // Segunda-feira da semana de uma data
  function startOfWeek(date) {
    const day = date.getDay(); // 0 = domingo
    return addDays(date, day === 0 ? -6 : 1 - day);
  }

  /* ---------- Rótulos (transformam "salao" em "Salão de beleza") ---------- */
  function labelOf(list, id) {
    const item = list.find(function (x) { return x.id === id; });
    return item ? item.label : id || "";
  }
  const nicheLabel = function (id) { return labelOf(D.niches, id); };
  const statusLabel = function (id) { return labelOf(D.statuses, id); };
  const typeLabel = function (id) { return labelOf(D.contentTypes, id); };

  // Preenche uma lista de opções (<select>)
  function fillSelect(select, items, placeholder) {
    if (!select) return;
    select.innerHTML = "";
    if (placeholder) select.add(new Option(placeholder, ""));
    items.forEach(function (item) { select.add(new Option(item.label, item.id)); });
  }

  /* ---------- Validação de formulários ---------- */
  function setError(id, message) {
    const input = document.getElementById(id);
    const error = document.querySelector('[data-error-for="' + id + '"]');
    if (input) input.classList.toggle("is-invalid", Boolean(message));
    if (error) error.textContent = message || "";
  }

  // rules = [{ id: "campo", message: "texto do erro", min: 2 }]
  function validate(rules) {
    let firstInvalid = null;
    rules.forEach(function (rule) {
      const el = document.getElementById(rule.id);
      const value = (el.value || "").trim();
      let message = "";
      if (!value) message = rule.message;
      else if (rule.min && value.length < rule.min) message = "Use pelo menos " + rule.min + " caracteres.";
      setError(rule.id, message);
      if (message && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      toast("Confira os campos destacados em vermelho.", "error");
      return false;
    }
    return true;
  }

  // Ao corrigir um campo, o erro some
  function clearErrorOnInput(event) {
    const el = event.target;
    if (el.id && el.classList.contains("is-invalid") && el.value.trim()) setError(el.id, "");
  }

  /* =====================================================
     2. NAVEGAÇÃO ENTRE TELAS
     ===================================================== */
  function onShow(viewName, fn) { renderers[viewName] = fn; }

  function showView(name) {
    if (!VIEWS.includes(name)) name = "dashboard";
    currentView = name;

    $all(".view").forEach(function (v) { v.classList.toggle("active", v.id === "view-" + name); });
    $all(".nav-item").forEach(function (b) { b.classList.toggle("active", b.dataset.view === name); });

    const view = $("#view-" + name);
    $("#page-title").textContent = view.dataset.title;
    document.title = view.dataset.title + " · SocialFlow AI";

    closeMenu();
    window.scrollTo(0, 0);
    refresh();
  }

  // Redesenha a tela atual e a barra lateral
  function refresh() {
    updateChrome();
    if (renderers[currentView]) renderers[currentView]();
  }

  // A tela atual é definida pelo "#" no endereço (ex.: app.html#calendario)
  function route() {
    showView(window.location.hash.replace("#", "") || "dashboard");
  }

  function openMenu() { $("#sidebar").classList.add("open"); $("#overlay").classList.add("open"); }
  function closeMenu() { $("#sidebar").classList.remove("open"); $("#overlay").classList.remove("open"); }

  // Atualiza o nome da empresa no topo e o contador de usos
  function updateChrome() {
    const business = SFStore.getBusiness();
    $("#business-chip").textContent = business
      ? "🏪 " + business.name + " · " + nicheLabel(business.niche)
      : "Nenhuma empresa cadastrada";

    const plan = SFStore.getPlan();
    const used = SFStore.getUsageThisMonth();
    const aiLogged = typeof SFSupabase !== "undefined" && SFSupabase.isLoggedIn();
    $("#usage-plan").textContent = plan.label;
    if ($("#usage-mode")) $("#usage-mode").textContent = aiLogged ? "IA ativa" : "simulado";
    $("#usage-text").textContent = Math.min(used, plan.limit) + " de " + plan.limit;
    $("#usage-bar").style.width = Math.min(100, (used / plan.limit) * 100) + "%";

    const capNotice = $("#caption-mode-notice");
    if (capNotice) {
      capNotice.className = aiLogged ? "notice" : "notice notice-warning";
      capNotice.innerHTML = aiLogged
        ? "✨ <strong>Modo IA ativo:</strong> os textos são gerados por inteligência artificial no servidor. Revise sempre antes de publicar."
        : "⚠️ <strong>Modo demonstração:</strong> os textos são montados a partir de exemplos prontos. <strong>Não são gerados por inteligência artificial.</strong> Revise sempre antes de publicar.";
    }
    const reelNotice = $("#reels-mode-notice");
    if (reelNotice) {
      reelNotice.className = aiLogged ? "notice" : "notice notice-warning";
      reelNotice.innerHTML = aiLogged
        ? "✨ <strong>Modo IA ativo:</strong> ideias geradas por inteligência artificial no servidor. Revise sempre antes de gravar."
        : "⚠️ <strong>Modo demonstração:</strong> ideias montadas a partir de modelos prontos, não geradas por IA.";
    }
  }

  /* =====================================================
     3. TELA "MINHA EMPRESA"
     ===================================================== */
  function renderBusiness() {
    const list = SFStore.getBusinesses();
    const active = creatingNewBusiness ? null : SFStore.getBusiness();
    const plan = SFStore.getPlan();
    const maxBiz = plan.businesses || 1;
    const switcher = $("#biz-switcher");

    if (switcher) {
      let html = list.map(function (item) {
        const isCurrent = !creatingNewBusiness && active && item.id === active.id;
        return '<button type="button" class="biz-pill' + (isCurrent ? " active" : "") + '" data-biz-id="' + escapeHtml(item.id) + '">' + escapeHtml(item.name) + "</button>";
      }).join("");

      if (list.length < maxBiz && list.length > 0) {
        html += '<button type="button" class="biz-pill' + (creatingNewBusiness ? " active" : "") + '" data-biz-new="1">+ Nova empresa</button>';
      } else if (list.length > 0) {
        html += '<span class="small muted">(' + list.length + "/" + maxBiz + " no plano " + plan.label + ")</span>";
      }
      switcher.innerHTML = html;
    }

    $("#biz-name").value = active ? active.name : "";
    $("#biz-niche").value = active ? active.niche : "";
    $("#biz-audience").value = active ? active.audience : "";
    $("#biz-tone").value = active ? active.tone : "";
    $("#biz-description").value = active ? active.description : "";
    if ($("#biz-delete")) $("#biz-delete").classList.toggle("hidden", !active || list.length <= 1);
    updateDescCount();
    ["biz-name", "biz-niche", "biz-audience", "biz-tone"].forEach(function (id) { setError(id, ""); });
  }

  function updateDescCount() {
    $("#biz-desc-count").textContent = $("#biz-description").value.length;
  }

  async function onBusinessSubmit(event) {
    event.preventDefault(); // impede a página de recarregar
    const ok = validate([
      { id: "biz-name", message: "Informe o nome da empresa.", min: 2 },
      { id: "biz-niche", message: "Escolha um segmento." },
      { id: "biz-audience", message: "Descreva o público-alvo.", min: 3 },
      { id: "biz-tone", message: "Escolha um tom de voz." }
    ]);
    if (!ok) return;

    const list = SFStore.getBusinesses();
    const maxBiz = (SFStore.getPlan().businesses) || 1;
    if (creatingNewBusiness && list.length >= maxBiz) {
      toast("Limite de empresas do plano atingido (" + maxBiz + ").", "error");
      return;
    }

    const active = creatingNewBusiness ? null : SFStore.getBusiness();
    const bizData = {
      name: $("#biz-name").value.trim(),
      niche: $("#biz-niche").value,
      audience: $("#biz-audience").value.trim(),
      tone: $("#biz-tone").value,
      description: $("#biz-description").value.trim()
    };

    if (typeof SFSupabase !== "undefined" && SFSupabase.isEnabled()) {
      const user = await SFSupabase.getUser();
      if (user) {
        try {
          const saved = await SFSupabase.saveMyBusiness(bizData, active ? active.id : null);
          SFStore.saveBusiness(saved, creatingNewBusiness);
          creatingNewBusiness = false;
          toast("Empresa salva no banco de dados (Supabase)!", "success");
          refresh();
          return;
        } catch (err) {
          toast(err.message, "error");
          return;
        }
      }
    }

    SFStore.saveBusiness(bizData, creatingNewBusiness);
    creatingNewBusiness = false;
    toast("Empresa salva com sucesso!", "success");
    refresh();
  }

  async function onDeleteBusiness() {
    const active = SFStore.getBusiness();
    if (!active) return;
    if (!window.confirm('Excluir a empresa "' + active.name + '"? Os conteúdos dela também podem ser removidos.')) return;

    if (typeof SFSupabase !== "undefined" && SFSupabase.isLoggedIn()) {
      try {
        await SFSupabase.deleteMyBusiness(active.id);
      } catch (err) {
        toast(err.message, "error");
        return;
      }
    }
    SFStore.deleteBusiness(active.id);
    creatingNewBusiness = false;
    toast("Empresa excluída.", "success");
    refresh();
  }

  function fillBusinessExample() {
    const s = D.sampleBusiness;
    $("#biz-name").value = s.name;
    $("#biz-niche").value = s.niche;
    $("#biz-audience").value = s.audience;
    $("#biz-tone").value = s.tone;
    $("#biz-description").value = s.description;
    updateDescCount();
    toast("Exemplo preenchido. Clique em \"Salvar empresa\" para confirmar.");
  }

  /* =====================================================
     4. TELA "CONFIGURAÇÕES"
     ===================================================== */
  function renderSettings() {
    const s = SFStore.getSettings();
    $("#set-name").value = s.userName;
    $("#set-platform").value = s.defaultPlatform;
    $("#set-plan").value = s.plan;
  }

  function onSettingsSubmit(event) {
    event.preventDefault();
    SFStore.saveSettings({
      userName: $("#set-name").value.trim(),
      defaultPlatform: $("#set-platform").value,
      plan: $("#set-plan").value
    });
    toast("Preferências salvas!", "success");
    updateChrome();
  }

  function loadExamples() {
    if (SFStore.getPosts().length && !window.confirm("Adicionar os exemplos aos conteúdos que você já tem?")) return;
    if (!SFStore.getBusiness()) SFStore.saveBusiness(D.sampleBusiness);

    const monday = startOfWeek(new Date());
    D.samplePosts.forEach(function (sample) {
      const data = Object.assign({}, sample);
      data.scheduled_for = sample.dayOffset === null ? "" : toISODate(addDays(monday, sample.dayOffset));
      delete data.dayOffset;
      SFStore.addPost(data);
    });
    toast("Exemplos carregados! Veja o Dashboard, o Calendário e o Histórico.", "success");
    refresh();
  }

  function resetUsage() {
    if (!window.confirm("Zerar o contador de gerações deste mês?")) return;
    SFStore.resetUsage();
    toast("Contador zerado.", "success");
    refresh();
  }

  async function clearAllData() {
    const logged = typeof SFSupabase !== "undefined" && SFSupabase.isLoggedIn();
    const msg = logged
      ? "Apagar sua empresa e TODOS os seus conteúdos salvos (inclusive do banco de dados)? Essa ação não pode ser desfeita."
      : "Apagar TODOS os dados da demonstração (empresa, conteúdos e preferências)? Essa ação não pode ser desfeita.";
    if (!window.confirm(msg)) return;

    if (logged) {
      try {
        await SFSupabase.deleteAllMyData();
      } catch (err) {
        toast(err.message, "error");
        return;
      }
    }
    SFStore.clearAll();
    toast("Seus dados de empresa e conteúdos foram apagados.", "success");
    refresh();
  }

  /* =====================================================
     5. JANELA DE EDIÇÃO (MODAL) — usada por várias telas
     ===================================================== */
  const POST_FIELDS = ["title", "platform", "status", "caption", "cta", "hashtags", "visual"];

  function openPostModal(post) {
    post = post || {};
    $("#post-modal-title").textContent = post.id ? "Editar conteúdo" : "Salvar conteúdo";
    $("#post-id").value = post.id || "";
    $("#post-type").value = post.content_type || "legenda";
    $("#post-date").value = post.scheduled_for || "";
    POST_FIELDS.forEach(function (f) { $("#post-" + f).value = post[f] || ""; });
    if (!post.platform) $("#post-platform").value = SFStore.getSettings().defaultPlatform;
    if (!post.status) $("#post-status").value = "rascunho";
    $("#post-delete").classList.toggle("hidden", !post.id);
    setError("post-title", "");
    setError("post-caption", "");

    $("#post-modal").classList.add("open");
    $("#post-title").focus();
  }

  function closePostModal() {
    $("#post-modal").classList.remove("open");
  }

  function onPostSubmit(event) {
    event.preventDefault();
    const ok = validate([
      { id: "post-title", message: "Dê um título ao conteúdo." },
      { id: "post-caption", message: "O texto não pode ficar vazio." }
    ]);
    if (!ok) return;

    const data = { content_type: $("#post-type").value, scheduled_for: $("#post-date").value };
    POST_FIELDS.forEach(function (f) { data[f] = $("#post-" + f).value.trim(); });

    const id = $("#post-id").value;
    if (id) {
      SFStore.updatePost(id, data);
      toast("Conteúdo atualizado!", "success");
    } else {
      SFStore.addPost(data);
      toast("Conteúdo salvo no histórico!", "success");
    }
    closePostModal();
    refresh();
  }

  function onPostDelete() {
    const id = $("#post-id").value;
    const post = SFStore.getPost(id);
    if (post && confirmDelete(post)) {
      closePostModal();
      refresh();
    }
  }

  function confirmDelete(post) {
    if (!window.confirm('Excluir "' + post.title + '"? Essa ação não pode ser desfeita.')) return false;
    SFStore.deletePost(post.id);
    toast("Conteúdo excluído.", "success");
    return true;
  }

  /* =====================================================
     6. LISTA DE CONTEÚDOS (usada no Dashboard e no Histórico)
     ===================================================== */
  function postToText(post) {
    return [post.title, "", post.caption, post.cta ? "\n" + post.cta : "", post.hashtags ? "\n" + post.hashtags : ""]
      .join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  function renderPostItem(post, options) {
    options = options || {};
    return (
      '<article class="list-item" data-id="' + escapeHtml(post.id) + '">' +
        "<h4>" + escapeHtml(post.title) + "</h4>" +
        '<div class="item-meta">' +
          '<span class="tag">' + escapeHtml(typeLabel(post.content_type)) + "</span>" +
          '<span class="tag status-' + escapeHtml(post.status) + '">' + escapeHtml(statusLabel(post.status)) + "</span>" +
          "<span>" + escapeHtml(post.platform) + "</span>" +
          (post.scheduled_for ? "<span>📅 " + escapeHtml(formatDate(post.scheduled_for)) + "</span>" : "<span>Sem data</span>") +
        "</div>" +
        '<p class="item-preview">' + escapeHtml(post.caption) + "</p>" +
        '<div class="item-actions">' +
          '<button type="button" class="btn btn-secondary btn-sm" data-action="edit">✏️ Editar</button>' +
          '<button type="button" class="btn btn-secondary btn-sm" data-action="copy">📋 Copiar</button>' +
          (options.showDelete ? '<button type="button" class="btn btn-danger btn-sm" data-action="delete">🗑️ Excluir</button>' : "") +
        "</div>" +
      "</article>"
    );
  }

  // Um único "ouvinte" para todos os botões da lista
  function handleListClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const item = button.closest("[data-id]");
    const post = item && SFStore.getPost(item.dataset.id);
    if (!post) return;

    if (button.dataset.action === "edit") openPostModal(post);
    if (button.dataset.action === "copy") copyText(postToText(post));
    if (button.dataset.action === "delete" && confirmDelete(post)) refresh();
  }

  /* =====================================================
     7. INICIALIZAÇÃO (roda quando a página termina de carregar)
     ===================================================== */
  function init() {
    // Preenche as listas de opções
    fillSelect($("#biz-niche"), D.niches, "Selecione…");
    fillSelect($("#biz-tone"), D.tones, "Selecione…");
    fillSelect($("#cap-niche"), D.niches, "Selecione…");
    fillSelect($("#cap-goal"), D.goals, "Selecione…");
    fillSelect($("#cap-platform"), D.platforms, "Selecione…");
    fillSelect($("#cap-tone"), D.tones, "Selecione…");
    fillSelect($("#cap-format"), D.formats, "Selecione…");
    fillSelect($("#reel-niche"), D.niches, "Selecione…");
    fillSelect($("#reel-goal"), D.goals, "Selecione…");
    fillSelect($("#week-goal"), D.goals, "Objetivo…");
    fillSelect($("#hist-status"), D.statuses, "Todos os status");
    fillSelect($("#post-platform"), D.platforms);
    fillSelect($("#post-status"), D.statuses);
    fillSelect($("#set-platform"), D.platforms);
    fillSelect($("#set-plan"), D.plans.map(function (p) {
      return { id: p.id, label: p.label + " — " + p.limit + " gerações/mês" };
    }));

    // Menu
    $all(".nav-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (window.location.hash === "#" + btn.dataset.view) showView(btn.dataset.view);
        else window.location.hash = btn.dataset.view;
      });
    });
    window.addEventListener("hashchange", route);
    $("#menu-toggle").addEventListener("click", openMenu);
    $("#overlay").addEventListener("click", closeMenu);

    // Formulários
    document.addEventListener("input", clearErrorOnInput);
    document.addEventListener("change", clearErrorOnInput);
    $("#business-form").addEventListener("submit", onBusinessSubmit);
    $("#biz-description").addEventListener("input", updateDescCount);
    $("#biz-fill-example").addEventListener("click", fillBusinessExample);
    if ($("#biz-delete")) $("#biz-delete").addEventListener("click", onDeleteBusiness);
    if ($("#biz-switcher")) {
      $("#biz-switcher").addEventListener("click", function (event) {
        const pill = event.target.closest(".biz-pill");
        if (!pill) return;
        if (pill.dataset.bizNew) {
          creatingNewBusiness = true;
          renderBusiness();
          return;
        }
        creatingNewBusiness = false;
        SFStore.setActiveBusiness(pill.dataset.bizId);
        if (typeof SFSupabase !== "undefined" && SFSupabase.setActiveBusinessId) {
          SFSupabase.setActiveBusinessId(pill.dataset.bizId);
        }
        refresh();
      });
    }
    $("#settings-form").addEventListener("submit", onSettingsSubmit);
    $("#set-load-demo").addEventListener("click", loadExamples);
    $("#set-reset-usage").addEventListener("click", resetUsage);
    $("#set-clear").addEventListener("click", clearAllData);
    $("#logout-link").addEventListener("click", async function (e) {
      e.preventDefault();
      if (typeof SFSupabase !== "undefined" && SFSupabase.isEnabled()) {
        try { await SFSupabase.signOut(); } catch (err) { /* ignorar */ }
      }
      SFStore.clearSession();
      SFStore.clearBusiness();
      SFStore.setPosts([]);
      SFStore.resetUsage();
      window.location.href = "login.html";
    });

    // Modal
    $("#post-form").addEventListener("submit", onPostSubmit);
    $("#post-cancel").addEventListener("click", closePostModal);
    $("#post-delete").addEventListener("click", onPostDelete);
    $("#post-modal").addEventListener("click", function (e) { if (e.target.id === "post-modal") closePostModal(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closePostModal(); closeMenu(); }
    });

    // Listas com botões Editar / Copiar / Excluir
    $("#recent-list").addEventListener("click", handleListClick);
    $("#history-list").addEventListener("click", handleListClick);

    onShow("empresa", renderBusiness);
    onShow("configuracoes", renderSettings);

    if (SFStore.isMemoryOnly()) {
      toast("Seu navegador bloqueou o armazenamento local. Os dados serão perdidos ao recarregar a página.", "error");
    }

    route(); // mostra a tela indicada no endereço

    // Se o Supabase estiver configurado e houver usuário logado, sincroniza empresa e conteúdos do banco
    if (typeof SFSupabase !== "undefined" && SFSupabase.isEnabled()) {
      loadingRemote = true;
      refresh();
      SFSupabase.getUser().then(async function (user) {
        if (!user) return;
        const name = (user.user_metadata && user.user_metadata.name) || "";
        SFStore.saveSession({ name: name, email: user.email });
        try {
          const remoteList = await SFSupabase.getMyBusinesses();
          if (remoteList && remoteList.length) {
            SFStore.setBusinesses(remoteList);
            SFSupabase.setActiveBusinessId(SFStore.getActiveBusinessId());
          } else {
            SFStore.clearBusiness();
          }

          const remotePosts = await SFSupabase.getPosts();
          SFStore.setPosts(remotePosts);

          const usageStatus = await SFSupabase.getUsageStatus();
          if (usageStatus) SFStore.setUsageFromServer(usageStatus.plan, usageStatus.used);
        } catch (err) {
          toast("Aviso: " + err.message, "error");
        }
      }).finally(function () {
        loadingRemote = false;
        refresh();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);

  // O que outras partes do app podem usar
  return {
    $, $all, escapeHtml, toast, copyText,
    toISODate, parseISODate, formatDate, addDays, startOfWeek,
    nicheLabel, statusLabel, typeLabel,
    setError, validate,
    onShow, refresh, isLoadingRemote: function () { return loadingRemote; },
    openPostModal, renderPostItem, postToText
  };
})();
