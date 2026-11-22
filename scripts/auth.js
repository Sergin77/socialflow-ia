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
  const recoveryForm = document.getElementById("recovery-form");
  const forgotBtn = document.getElementById("forgot-password-btn");
  const modeNotice = document.getElementById("auth-mode-notice");
  const useSupabase = typeof SFSupabase !== "undefined" && SFSupabase.isEnabled();

  if (useSupabase && modeNotice) {
    modeNotice.className = "notice";
    modeNotice.innerHTML = "🔒 <strong>Conectado ao Supabase:</strong> autenticação real ativa para testes. Use suas contas de teste.";
    const regPassLabel = document.getElementById("reg-password-label");
    if (regPassLabel) regPassLabel.innerHTML = 'Crie uma senha <span class="required">*</span>';
    const loginBtn = loginForm.querySelector('button[type="submit"]');
    if (loginBtn) loginBtn.textContent = "Entrar";
    const regBtn = registerForm.querySelector('button[type="submit"]');
    if (regBtn) regBtn.textContent = "Criar conta";
  }

  if (useSupabase && window.location.hash.includes("type=recovery") && recoveryForm) {
    const tabs = document.querySelector(".auth-card .tabs");
    if (tabs) tabs.classList.add("hidden");
    loginForm.classList.add("hidden");
    registerForm.classList.add("hidden");
    recoveryForm.classList.remove("hidden");
    if (modeNotice) modeNotice.innerHTML = "🔑 <strong>Redefinir senha:</strong> digite sua nova senha abaixo.";
  }

  function toast(message, type) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    container.innerHTML = "";
    const el = document.createElement("div");
    el.className = "toast" + (type === "success" ? " toast-success" : type === "error" ? " toast-error" : "");
    el.textContent = message;
    container.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.remove(); }, 4000);
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

  if (forgotBtn) {
    forgotBtn.addEventListener("click", async function () {
      const ok = validateFields([
        { id: "login-email", required: "Digite seu e-mail acima primeiro.", email: true }
      ]);
      if (!ok) return;

      if (!useSupabase) {
        toast("No modo demonstração não há senha real. Pode entrar com qualquer senha de 6+ caracteres.", "success");
        return;
      }
      forgotBtn.disabled = true;
      try {
        await SFSupabase.resetPassword(document.getElementById("login-email").value.trim());
        toast("E-mail de recuperação enviado! Confira sua caixa de entrada e spam.", "success");
      } catch (err) {
        toast(err.message, "error");
      } finally {
        forgotBtn.disabled = false;
      }
    });
  }

  if (recoveryForm) {
    recoveryForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const ok = validateFields([
        { id: "rec-password", required: "Informe a nova senha.", min: 6 },
        { id: "rec-confirm", required: "Confirme a nova senha.", matchId: "rec-password" }
      ]);
      if (!ok) return;

      const btn = recoveryForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        await SFSupabase.updatePassword(document.getElementById("rec-password").value);
        toast("Senha atualizada! Entrando no painel…", "success");
        setTimeout(function () { window.location.href = "app.html"; }, 600);
      } catch (err) {
        toast(err.message, "error");
        btn.disabled = false;
      }
    });
  }
})();
