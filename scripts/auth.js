/* =========================================================
   SocialFlow AI — Login e Cadastro SIMULADOS (auth.js)
   ---------------------------------------------------------
   Valida os campos do formulário e registra uma sessão
   fictícia no navegador, sem enviar nem guardar senhas.
   Na fase com backend, isso será substituído por
   autenticação real (ex.: Supabase Auth).
   ========================================================= */

(function () {
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const modeNotice = document.getElementById("auth-mode-notice");
  const useSupabase = typeof SFSupabase !== "undefined" && SFSupabase.isEnabled();

  if (useSupabase && modeNotice) {
    modeNotice.className = "notice";
    modeNotice.innerHTML = "🔒 <strong>Conectado ao Supabase:</strong> autenticação real ativa para testes. Use suas contas de teste.";
  }

  function toast(message, type) {
    const container = document.getElementById("toast-container");
    const el = document.createElement("div");
    el.className = "toast" + (type === "success" ? " toast-success" : type === "error" ? " toast-error" : "");
    el.textContent = message;
    container.appendChild(el);
    setTimeout(function () { el.remove(); }, 4000);
  }

  function setError(id, message) {
    const input = document.getElementById(id);
    const error = document.querySelector('[data-error-for="' + id + '"]');
    if (input) input.classList.toggle("is-invalid", Boolean(message));
    if (error) error.textContent = message || "";
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function switchTab(mode) {
    const isLogin = mode === "login";
    tabLogin.classList.toggle("active", isLogin);
    tabRegister.classList.toggle("active", !isLogin);
    tabLogin.setAttribute("aria-selected", String(isLogin));
    tabRegister.setAttribute("aria-selected", String(!isLogin));
    loginForm.classList.toggle("hidden", !isLogin);
    registerForm.classList.toggle("hidden", isLogin);
  }

  function validateFields(rules) {
    let firstInvalid = null;
    rules.forEach(function (rule) {
      const el = document.getElementById(rule.id);
      const value = (el.value || "").trim();
      let message = "";

      if (!value) {
        message = rule.required;
      } else if (rule.email && !isValidEmail(value)) {
        message = "Digite um e-mail válido (ex.: nome@exemplo.com).";
      } else if (rule.min && value.length < rule.min) {
        message = "Use pelo menos " + rule.min + " caracteres.";
      } else if (rule.matchId) {
        const other = document.getElementById(rule.matchId).value;
        if (el.value !== other) message = "As senhas não conferem.";
      }

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

  // Limpa o erro quando a pessoa começa a corrigir o campo
  document.addEventListener("input", function (event) {
    const el = event.target;
    if (el.id && el.classList.contains("is-invalid") && el.value.trim()) {
      setError(el.id, "");
    }
  });

  tabLogin.addEventListener("click", function () { switchTab("login"); });
  tabRegister.addEventListener("click", function () { switchTab("register"); });

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const ok = validateFields([
      { id: "login-email", required: "Informe seu e-mail.", email: true },
      { id: "login-password", required: "Informe sua senha.", min: 6 }
    ]);
    if (!ok) return;

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    if (useSupabase) {
      const btn = loginForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        const user = await SFSupabase.signIn(email, password);
        const name = (user.user_metadata && user.user_metadata.name) || "";
        SFStore.saveSession({ name: name, email: user.email });
        toast("Login confirmado! Abrindo o painel…", "success");
        setTimeout(function () { window.location.href = "app.html"; }, 500);
      } catch (err) {
        toast(err.message, "error");
        btn.disabled = false;
      }
      return;
    }

    const existing = SFStore.getSession();
    const name = existing && existing.email === email ? existing.name : "";

    // Nunca guardamos a senha — apenas nome e e-mail fictício da sessão
    SFStore.saveSession({ name: name, email: email });
    toast("Acesso simulado liberado! Abrindo o painel…", "success");
    setTimeout(function () { window.location.href = "app.html"; }, 500);
  });

  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const ok = validateFields([
      { id: "reg-name", required: "Informe seu nome.", min: 2 },
      { id: "reg-email", required: "Informe seu e-mail.", email: true },
      { id: "reg-password", required: "Crie uma senha.", min: 6 },
      { id: "reg-confirm", required: "Confirme sua senha.", matchId: "reg-password" }
    ]);
    if (!ok) return;

    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;

    if (useSupabase) {
      const btn = registerForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        const data = await SFSupabase.signUp(name, email, password);
        if (!data.session) {
          toast("Conta criada! Verifique seu e-mail para confirmar antes de entrar.", "success");
          btn.disabled = false;
          switchTab("login");
          return;
        }
        SFStore.saveSession({ name: name, email: email });
        toast("Conta criada e conectada! Abrindo o painel…", "success");
        setTimeout(function () { window.location.href = "app.html"; }, 500);
      } catch (err) {
        toast(err.message, "error");
        btn.disabled = false;
      }
      return;
    }

    SFStore.saveSession({ name: name, email: email });
    toast("Conta simulada criada! Abrindo o painel…", "success");
    setTimeout(function () { window.location.href = "app.html"; }, 500);
  });
})();
