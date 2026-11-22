/* =========================================================
   SocialFlow AI — Conexão com o Supabase (supabase-client.js)
   ---------------------------------------------------------
   Se você ainda não preencheu o supabase-config.js, o app
   continua funcionando normalmente no modo demonstração local.
   ========================================================= */

const SFSupabase = (function () {
  let client = null;
  let cachedUser = null;
  let cachedBusinessId = null;

  function cleanUrl(rawUrl) {
    try {
      return new URL((rawUrl || "").trim()).origin;
    } catch (e) {
      return "";
    }
  }

  function hasValidConfig() {
    if (typeof SUPABASE_CONFIG === "undefined") return false;
    const url = cleanUrl(SUPABASE_CONFIG.url);
    const key = (SUPABASE_CONFIG.publishableKey || "").trim();
    return (
      url.startsWith("https://") &&
      !url.includes("COLE_") &&
      key.length > 20 &&
      !key.includes("COLE_")
    );
  }

  function getClient() {
    if (client) return client;
    if (!hasValidConfig() || typeof window.supabase === "undefined") return null;
    client = window.supabase.createClient(cleanUrl(SUPABASE_CONFIG.url), SUPABASE_CONFIG.publishableKey.trim());
    return client;
  }

  function isEnabled() {
    return getClient() !== null;
  }

  // Traduz mensagens comuns de erro do Supabase para português simples
  function translateError(error) {
    const msg = (error && error.message ? error.message : "").toLowerCase();
    if (msg.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
    if (msg.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar (ou marque Auto Confirm no Supabase).";
    if (msg.includes("user already registered")) return "Esse e-mail já está cadastrado.";
    if (msg.includes("password should be at least")) return "A senha deve ter pelo menos 6 caracteres.";
    if (msg.includes("failed to fetch")) return "Sem conexão com o Supabase. Verifique a internet e a Project URL.";
    return error && error.message ? error.message : "Erro ao comunicar com o servidor.";
  }

  async function signIn(email, password) {
    const sb = getClient();
    const res = await sb.auth.signInWithPassword({ email: email, password: password });
    if (res.error) throw new Error(translateError(res.error));
    return res.data.user;
  }

  async function signUp(name, email, password) {
    const sb = getClient();
    const res = await sb.auth.signUp({
      email: email,
      password: password,
      options: { data: { name: name } }
    });
    if (res.error) throw new Error(translateError(res.error));
    if (res.data.user && res.data.session) {
      await sb.from("profiles").upsert({ id: res.data.user.id, name: name });
    }
    return res.data;
  }

  async function signOut() {
    const sb = getClient();
    cachedUser = null;
    cachedBusinessId = null;
    if (sb) await sb.auth.signOut();
  }

  async function resetPassword(email) {
    const sb = getClient();
    if (!sb) throw new Error("Supabase não configurado.");
    const redirectTo = window.location.href.split("#")[0];
    const res = await sb.auth.resetPasswordForEmail(email, { redirectTo: redirectTo });
    if (res.error) throw new Error(translateError(res.error));
  }

  async function updatePassword(newPassword) {
    const sb = getClient();
    if (!sb) throw new Error("Supabase não configurado.");
    const res = await sb.auth.updateUser({ password: newPassword });
    if (res.error) throw new Error(translateError(res.error));
  }

  async function getUser() {
    const sb = getClient();
    if (!sb) return null;
    const res = await sb.auth.getUser();
    cachedUser = res.data ? res.data.user : null;
    return cachedUser;
  }

  function isLoggedIn() {
    return Boolean(isEnabled() && cachedUser);
  }

  function normalizePost(row) {
    return {
      id: row.id,
      business_id: row.business_id || "",
      title: row.title || "Sem título",
      content_type: row.content_type || "legenda",
      platform: row.platform || "Instagram",
      status: row.status || "rascunho",
      scheduled_for: row.scheduled_for ? String(row.scheduled_for).slice(0, 10) : "",
      caption: row.caption || "",
      cta: row.cta || "",
      hashtags: row.hashtags || "",
      visual: row.visual || "",
      created_at: row.created_at || new Date().toISOString()
    };
  }

  function setActiveBusinessId(id) {
    cachedBusinessId = id || null;
  }

  async function getMyBusinesses() {
    const sb = getClient();
    const user = await getUser();
    if (!sb || !user) return [];
    const res = await sb
      .from("businesses")
      .select("id, name, niche, audience, tone, description")
      .order("created_at", { ascending: true });
    if (res.error) throw new Error(translateError(res.error));
    const list = res.data || [];
    if (list.length && !list.some(function (b) { return b.id === cachedBusinessId; })) {
      cachedBusinessId = list[0].id;
    }
    return list;
  }

  async function getMyBusiness() {
    const list = await getMyBusinesses();
    return list.length ? list[0] : null;
  }

  async function saveMyBusiness(data, id) {
    const sb = getClient();
    const user = await getUser();
    if (!sb || !user) throw new Error("Você precisa estar logado para salvar no banco.");

    const payload = {
      user_id: user.id,
      name: data.name,
      niche: data.niche,
      audience: data.audience,
      tone: data.tone,
      description: data.description || ""
    };

    if (id && !String(id).startsWith("id-")) {
      const res = await sb.from("businesses").update(payload).eq("id", id).select().single();
      if (res.error) throw new Error(translateError(res.error));
      cachedBusinessId = res.data.id;
      return res.data;
    } else {
      const res = await sb.from("businesses").insert(payload).select().single();
      if (res.error) throw new Error(translateError(res.error));
      cachedBusinessId = res.data.id;
      return res.data;
    }
  }

  async function deleteMyBusiness(id) {
    const sb = getClient();
    if (!sb || !cachedUser || !id || String(id).startsWith("id-")) return;
    const res = await sb.from("businesses").delete().eq("id", id);
    if (res.error) throw new Error(translateError(res.error));
    if (cachedBusinessId === id) cachedBusinessId = null;
  }

  async function getPosts() {
    const sb = getClient();
    const user = await getUser();
    if (!sb || !user) return [];
    const res = await sb
      .from("content_posts")
      .select("id, business_id, title, content_type, platform, caption, cta, hashtags, visual, status, scheduled_for, created_at")
      .order("created_at", { ascending: false });
    if (res.error) throw new Error(translateError(res.error));
    return (res.data || []).map(normalizePost);
  }

  async function createPost(data) {
    const sb = getClient();
    const user = cachedUser || await getUser();
    if (!sb || !user) return null;
    if (!cachedBusinessId) {
      const biz = await getMyBusiness();
      if (!biz) throw new Error("Cadastre sua empresa em 'Minha empresa' antes de salvar conteúdos.");
    }
    const payload = {
      user_id: user.id,
      business_id: cachedBusinessId,
      title: data.title || "Sem título",
      content_type: data.content_type || "legenda",
      platform: data.platform || "Instagram",
      caption: data.caption || "",
      cta: data.cta || "",
      hashtags: data.hashtags || "",
      visual: data.visual || "",
      status: data.status || "rascunho",
      scheduled_for: data.scheduled_for ? data.scheduled_for + "T12:00:00Z" : null
    };
    const res = await sb.from("content_posts").insert(payload).select().single();
    if (res.error) throw new Error(translateError(res.error));
    return normalizePost(res.data);
  }

  async function updatePost(id, changes) {
    const sb = getClient();
    if (!sb || !cachedUser) return null;
    const payload = {};
    ["title", "content_type", "platform", "caption", "cta", "hashtags", "visual", "status"].forEach(function (k) {
      if (changes[k] !== undefined) payload[k] = changes[k];
    });
    if (changes.scheduled_for !== undefined) {
      payload.scheduled_for = changes.scheduled_for ? changes.scheduled_for + "T12:00:00Z" : null;
    }
    const res = await sb.from("content_posts").update(payload).eq("id", id).select().single();
    if (res.error) throw new Error(translateError(res.error));
    return normalizePost(res.data);
  }

  async function deletePost(id) {
    const sb = getClient();
    if (!sb || !cachedUser) return false;
    const res = await sb.from("content_posts").delete().eq("id", id);
    if (res.error) throw new Error(translateError(res.error));
    return true;
  }

  async function generateWithAI(mode, business, input) {
    const sb = getClient();
    if (!sb || !cachedUser) throw new Error("Faça login para gerar com IA.");
    const timeoutPromise = new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error("Tempo esgotado (45s). Confira se a função 'generate-content' está publicada no Supabase."));
      }, 45000);
    });
    const res = await Promise.race([
      sb.functions.invoke("generate-content", {
        body: { mode: mode, business: business, input: input }
      }),
      timeoutPromise
    ]);
    if (res.error) {
      let msg = "";
      try {
        if (res.error.context && typeof res.error.context.json === "function") {
          const errBody = await res.error.context.json();
          msg = errBody && errBody.error ? errBody.error : "";
        }
      } catch (e) { /* ignorar */ }
      if (!msg && String(res.error.message || "").toLowerCase().includes("failed to send")) {
        msg = "Função de IA ainda não publicada no Supabase (ou sem conexão).";
      }
      throw new Error(msg || res.error.message || "Erro ao chamar a IA no servidor.");
    }
    return res.data;
  }

  async function getUsageStatus() {
    const sb = getClient();
    const user = cachedUser || await getUser();
    if (!sb || !user) return null;

    const subRes = await sb
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle();

    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const usageRes = await sb
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString());

    if (usageRes.error) throw new Error(translateError(usageRes.error));
    return {
      plan: (subRes.data && subRes.data.plan) || "free",
      used: usageRes.count || 0
    };
  }

  async function deleteAllMyData() {
    const sb = getClient();
    const user = cachedUser || await getUser();
    if (!sb || !user) return;
    const postsRes = await sb.from("content_posts").delete().eq("user_id", user.id);
    if (postsRes.error) throw new Error(translateError(postsRes.error));
    const bizRes = await sb.from("businesses").delete().eq("user_id", user.id);
    if (bizRes.error) throw new Error(translateError(bizRes.error));
    cachedBusinessId = null;
  }

  return {
    isEnabled, isLoggedIn, signIn, signUp, signOut, resetPassword, updatePassword, getUser,
    getMyBusiness, getMyBusinesses, saveMyBusiness, deleteMyBusiness, setActiveBusinessId,
    getPosts, createPost, updatePost, deletePost,
    generateWithAI, getUsageStatus, deleteAllMyData
  };
})();
