/* =========================================================
   SocialFlow AI — Armazenamento local (storage.js)
   ---------------------------------------------------------
   Guarda os dados no "localStorage", uma pequena memória do
   próprio navegador.

   ⚠️ IMPORTANTE: localStorage NÃO é um banco de dados seguro.
   Serve só para o protótipo não perder os dados ao recarregar.
   Na versão real, os dados irão para um servidor com login e
   regras de acesso (ex.: banco com RLS), conforme o guia.
   ========================================================= */

const SFStore = (function () {
  const KEY = "socialflow_demo_v1"; // nome da "gaveta" onde guardamos tudo
  let memoryOnly = false;           // vira true se o navegador bloquear o localStorage

  // Estado inicial (vazio)
  function defaultState() {
    return {
      version: 1,
      session: null,
      businesses: [],
      activeBusinessId: null,
      posts: [],
      usage: [],
      settings: { userName: "", defaultPlatform: "Instagram", plan: "free" }
    };
  }

  // Lê os dados salvos (ou cria um estado vazio)
  function load() {
    let raw = null;
    try {
      raw = window.localStorage.getItem(KEY);
    } catch (error) {
      memoryOnly = true; // navegador bloqueou o acesso
      return defaultState();
    }
    if (!raw) return defaultState();

    try {
      const saved = JSON.parse(raw);
      const base = defaultState();
      let businesses = Array.isArray(saved.businesses) ? saved.businesses : [];
      if (!businesses.length && saved.business) {
        businesses = [Object.assign({ id: newId() }, saved.business)];
      }
      const activeId = saved.activeBusinessId || (businesses[0] ? businesses[0].id : null);
      return {
        version: 1,
        session: saved.session || null,
        businesses: businesses,
        activeBusinessId: activeId,
        posts: Array.isArray(saved.posts) ? saved.posts : [],
        usage: Array.isArray(saved.usage) ? saved.usage : [],
        settings: Object.assign(base.settings, saved.settings || {})
      };
    } catch (error) {
      console.warn("Dados salvos estavam corrompidos. Começando do zero.", error);
      return defaultState();
    }
  }

  let state = load();

  // Grava o estado atual no navegador
  function persist() {
    if (memoryOnly) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (error) {
      memoryOnly = true;
      console.warn("Não foi possível salvar no navegador.", error);
    }
  }

  // Cria um identificador único simples para cada conteúdo
  function newId() {
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function nowISO() {
    return new Date().toISOString();
  }

  // Faz uma cópia, para que outras partes do código não alterem o estado por acidente
  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  /* ---------- Empresas (múltiplas conforme plano) ---------- */
  function getBusinesses() {
    return clone(state.businesses);
  }

  function getActiveBusinessId() {
    return state.activeBusinessId;
  }

  function setActiveBusiness(id) {
    state.activeBusinessId = id;
    persist();
  }

  function setBusinesses(list) {
    state.businesses = Array.isArray(list) ? clone(list) : [];
    const exists = state.businesses.some(function (b) { return b.id === state.activeBusinessId; });
    state.activeBusinessId = exists ? state.activeBusinessId : (state.businesses[0] ? state.businesses[0].id : null);
    persist();
  }

  function getBusiness() {
    if (!state.businesses.length) return null;
    const found = state.businesses.find(function (b) { return b.id === state.activeBusinessId; });
    return clone(found || state.businesses[0]);
  }

  function saveBusiness(data, asNew) {
    const entry = {
      id: data.id || (asNew ? newId() : (state.activeBusinessId || newId())),
      name: data.name,
      niche: data.niche,
      audience: data.audience,
      tone: data.tone,
      description: data.description || "",
      updated_at: nowISO()
    };
    const idx = asNew ? -1 : state.businesses.findIndex(function (b) { return b.id === entry.id; });
    if (idx >= 0) state.businesses[idx] = entry;
    else state.businesses.push(entry);
    state.activeBusinessId = entry.id;
    persist();
    return clone(entry);
  }

  function deleteBusiness(id) {
    state.businesses = state.businesses.filter(function (b) { return b.id !== id; });
    state.activeBusinessId = state.businesses[0] ? state.businesses[0].id : null;
    persist();
  }

  function clearBusiness() {
    state.businesses = [];
    state.activeBusinessId = null;
    persist();
  }

  /* ---------- Conteúdos ---------- */
  function syncRemote(promise, onDone) {
    promise.then(function (result) {
      if (onDone) onDone(result);
      if (typeof SFApp !== "undefined" && SFApp.refresh) SFApp.refresh();
    }).catch(function (err) {
      if (typeof SFApp !== "undefined" && SFApp.toast) SFApp.toast(err.message, "error");
    });
  }

  function setPosts(list) {
    state.posts = Array.isArray(list) ? clone(list) : [];
    persist();
  }

  function getPosts() {
    const activeBiz = state.activeBusinessId;
    return clone(state.posts)
      .filter(function (p) {
        return !activeBiz || !p.business_id || p.business_id === activeBiz;
      })
      .sort(function (a, b) {
        return (b.created_at || "").localeCompare(a.created_at || "");
      });
  }

  function getPost(id) {
    return clone(state.posts.find(function (p) { return p.id === id; }) || null);
  }

  function addPost(data) {
    const activeBiz = getBusiness();
    const post = {
      id: newId(),
      business_id: data.business_id || (activeBiz ? activeBiz.id : ""),
      title: data.title || "Sem título",
      content_type: data.content_type || "legenda",
      platform: data.platform || state.settings.defaultPlatform,
      status: data.status || "rascunho",
      scheduled_for: data.scheduled_for || "",
      caption: data.caption || "",
      cta: data.cta || "",
      hashtags: data.hashtags || "",
      visual: data.visual || "",
      business_name: state.business ? state.business.name : "",
      created_at: nowISO(),
      updated_at: nowISO()
    };
    state.posts.push(post);
    persist();

    if (typeof SFSupabase !== "undefined" && SFSupabase.isLoggedIn()) {
      syncRemote(SFSupabase.createPost(post), function (saved) {
        if (saved && saved.id) {
          post.id = saved.id;
          persist();
        }
      });
    }
    return clone(post);
  }

  function updatePost(id, changes) {
    const post = state.posts.find(function (p) { return p.id === id; });
    if (!post) return null;
    Object.assign(post, changes, { id: post.id, updated_at: nowISO() });
    persist();

    if (typeof SFSupabase !== "undefined" && SFSupabase.isLoggedIn() && !String(id).startsWith("id-")) {
      syncRemote(SFSupabase.updatePost(id, changes));
    }
    return clone(post);
  }

  function deletePost(id) {
    const before = state.posts.length;
    state.posts = state.posts.filter(function (p) { return p.id !== id; });
    persist();

    if (typeof SFSupabase !== "undefined" && SFSupabase.isLoggedIn() && !String(id).startsWith("id-")) {
      syncRemote(SFSupabase.deletePost(id));
    }
    return state.posts.length < before;
  }

  /* ---------- Configurações ---------- */
  function getSettings() {
    return clone(state.settings);
  }

  function saveSettings(changes) {
    Object.assign(state.settings, changes);
    persist();
  }

  /* ---------- Uso e limites do plano (simulado) ---------- */
  function getPlan() {
    return DEMO_CONTENT.plans.find(function (p) { return p.id === state.settings.plan; }) || DEMO_CONTENT.plans[0];
  }

  function getUsageThisMonth() {
    const now = new Date();
    return state.usage.filter(function (u) {
      const d = new Date(u.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  }

  function getRemaining() {
    return Math.max(0, getPlan().limit - getUsageThisMonth());
  }

  function canGenerate() {
    return getRemaining() > 0;
  }

  function logUsage(action) {
    state.usage.push({ action: action, created_at: nowISO() });
    persist();
  }

  function resetUsage() {
    state.usage = [];
    persist();
  }

  function setUsageFromServer(plan, usedCount) {
    if (plan) state.settings.plan = plan;
    const now = nowISO();
    const total = Math.max(0, Number(usedCount) || 0);
    state.usage = [];
    for (let i = 0; i < total; i++) {
      state.usage.push({ action: "server", created_at: now });
    }
    persist();
  }

  /* ---------- Sessão simulada (nunca guarda senhas) ---------- */
  function getSession() {
    return clone(state.session);
  }

  function saveSession(data) {
    state.session = {
      name: data.name || "",
      email: data.email || "",
      loggedIn: true,
      updated_at: nowISO()
    };
    if (data.name && !state.settings.userName) {
      state.settings.userName = data.name;
    }
    persist();
  }

  function clearSession() {
    state.session = null;
    persist();
  }

  /* ---------- Apagar tudo ---------- */
  function clearAll() {
    state = defaultState();
    try {
      window.localStorage.removeItem(KEY);
    } catch (error) { /* ignorar */ }
  }

  function isMemoryOnly() {
    return memoryOnly;
  }

  // Estas são as funções que as outras partes do app podem usar
  return {
    getSession, saveSession, clearSession,
    getBusinesses, getActiveBusinessId, setActiveBusiness, setBusinesses,
    getBusiness, saveBusiness, deleteBusiness, clearBusiness,
    setPosts, getPosts, getPost, addPost, updatePost, deletePost,
    getSettings, saveSettings,
    getPlan, getUsageThisMonth, getRemaining, canGenerate, logUsage, resetUsage, setUsageFromServer,
    clearAll, isMemoryOnly
  };
})();
