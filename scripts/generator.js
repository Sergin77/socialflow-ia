/* =========================================================
   SocialFlow AI — Gerador SIMULADO (generator.js)
   ---------------------------------------------------------
   Gera legendas e ideias de Reels combinando os modelos do
   arquivo data/demo-content.js com o que você digitou.

   ⚠️ NÃO usa inteligência artificial. Na versão real, a
   geração acontecerá em um SERVIDOR, que guardará a chave
   secreta da API. Nunca coloque chaves de API neste arquivo.
   ========================================================= */

const SFGenerator = (function () {
  const D = DEMO_CONTENT;
  const A = SFApp;

  let lastCaptionInput = null;   // último formulário enviado
  let lastCaptionTemplate = null; // último modelo usado (para variar)
  let lastCaptionResult = null;
  let lastReels = [];

  /* ---------- Funções auxiliares ---------- */

  // Escolhe um item aleatório (tentando evitar repetir o anterior)
  function pick(list, avoid) {
    if (list.length === 1) return list[0];
    let item;
    do { item = list[Math.floor(Math.random() * list.length)]; } while (item === avoid);
    return item;
  }

  // Embaralha uma lista
  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i]; copy[i] = copy[j]; copy[j] = tmp;
    }
    return copy;
  }

  function capitalize(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
  }

  // Preenche as lacunas {assim} com os valores informados
  function fill(text, vars) {
    return String(text).replace(/\{(\w+)\}/g, function (match, key) {
      return vars[key] !== undefined ? vars[key] : match;
    });
  }

  // Transforma "Corte Degradê" em "#cortedegrade"
  function slugTag(text) {
    return "#" + text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function getNiche(id) {
    return D.niches.find(function (n) { return n.id === id; }) || D.niches[D.niches.length - 1];
  }

  // Monta o "dicionário" de lacunas usado pelos modelos
  function buildVars(business, niche, product) {
    return {
      empresa: business.name,
      publico: business.audience,
      produto: product,
      Produto: capitalize(product),
      lugar: niche.place,
      umLugar: niche.placeA,
      pro: niche.pro,
      Pro: capitalize(niche.pro),
      segmento: niche.label.toLowerCase(),
      tip1: niche.tips[0],
      tip2: niche.tips[1],
      tip3: niche.tips[2],
      myth: niche.myth
    };
  }

  // Confere se pode gerar: precisa ter empresa e ter usos disponíveis
  function ensureCanGenerate() {
    const business = SFStore.getBusiness();
    if (!business) {
      A.toast("Cadastre sua empresa primeiro (menu \"Minha empresa\").", "error");
      return null;
    }
    if (!SFStore.canGenerate()) {
      A.toast("Limite do plano simulado atingido. Em Configurações, mude o plano ou zere o contador.", "error");
      return null;
    }
    return business;
  }

  // Coloca valores padrão nos campos vazios, com base na empresa
  function setDefault(id, value) {
    const el = document.getElementById(id);
    if (el && !el.value && value) el.value = value;
  }

  /* =====================================================
     GERADOR DE LEGENDAS
     ===================================================== */
  function generateCaption(business, input) {
    const niche = getNiche(input.niche);
    const vars = buildVars(business, niche, input.product);
    const template = pick(D.captionTemplates[input.goal], lastCaptionTemplate);
    lastCaptionTemplate = template;

    const tone = D.tones.find(function (t) { return t.id === input.tone; }) || D.tones[0];
    const platform = D.platforms.find(function (p) { return p.id === input.platform; }) || D.platforms[0];
    const format = D.formats.find(function (f) { return f.id === input.format; }) || D.formats[0];

    const tags = shuffle(niche.hashtags).slice(0, input.platform === "LinkedIn" ? 3 : 4);
    const productTag = slugTag(input.product);
    if (productTag.length > 2 && !tags.includes(productTag)) tags.push(productTag);

    let captionText = fill(template.caption, vars) + "\n\n" + pick(tone.closings);
    if (input.length === "curta") {
      captionText = fill(template.caption, vars).split("\n\n")[0];
    }

    return {
      title: fill(template.title, vars) + tone.emoji,
      caption: captionText,
      cta: fill(pick(D.ctas[input.goal]), Object.assign({}, vars, { canal: platform.channel })),
      hashtags: tags.join(" "),
      visual: fill(format.visual, { visual: fill(pick(niche.visuals), vars) })
    };
  }

  function renderCaption(result, isAI) {
    const titleEl = A.$("#caption-result-title");
    if (titleEl) titleEl.textContent = isAI ? "Resultado gerado por IA" : "Resultado demonstrativo";
    const tag = A.$("#caption-result .tag");
    if (tag) tag.textContent = isAI ? "✨ Gerado por IA · revise antes de publicar" : "Simulado · não é IA";
    const blocks = [
      ["Título", result.title],
      ["Legenda", result.caption],
      ["Chamada para ação", result.cta],
      ["Hashtags", result.hashtags],
      ["Ideia visual", result.visual]
    ];
    A.$("#caption-output").innerHTML = blocks.map(function (b, idx) {
      return (
        '<div class="result-block">' +
          '<div class="result-block-head">' +
            '<p class="result-label">' + b[0] + "</p>" +
            '<button type="button" class="btn-copy-inline" data-copy-block="' + idx + '">Copiar</button>' +
          "</div>" +
          "<p>" + A.escapeHtml(b[1]).replace(/\n/g, "<br>") + "</p>" +
        "</div>"
      );
    }).join("");

    const preview = A.$("#caption-preview");
    if (preview) {
      const biz = SFStore.getBusiness();
      const bizName = biz ? biz.name : "Sua Empresa";
      const initials = bizName.trim().slice(0, 2).toUpperCase();
      const platform = (lastCaptionInput && lastCaptionInput.platform) || "Instagram";
      preview.innerHTML =
        '<div class="ig-head">' +
          '<span class="ig-avatar">' + A.escapeHtml(initials) + "</span>" +
          '<span class="ig-user">' + A.escapeHtml(bizName) + ' <span class="muted" style="font-weight:400;">· ' + A.escapeHtml(platform) + "</span></span>" +
        "</div>" +
        '<div class="ig-media">' +
          '<span class="ig-media-badge">Prévia visual</span>' +
          '<p class="ig-media-title">' + A.escapeHtml(result.title) + "</p>" +
          '<p class="ig-media-hint">' + A.escapeHtml(result.visual) + "</p>" +
        "</div>" +
        '<div class="ig-actions"><span>♡  💬  ➤</span><span>🔖</span></div>' +
        '<div class="ig-body">' +
          "<strong>" + A.escapeHtml(bizName) + "</strong> " + A.escapeHtml(result.caption) +
          (result.cta ? "\n\n" + A.escapeHtml(result.cta) : "") +
          (result.hashtags ? '<p class="ig-tags">' + A.escapeHtml(result.hashtags) + "</p>" : "") +
        "</div>";
    }

    A.$("#caption-result").classList.remove("hidden");
    A.$("#caption-result").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function runCaption(input) {
    const business = ensureCanGenerate();
    if (!business) return;
    lastCaptionInput = input;

    if (typeof SFSupabase !== "undefined" && SFSupabase.isLoggedIn()) {
      const btn = A.$('#caption-form button[type="submit"]');
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "⏳ Gerando com IA…";
      try {
        const res = await SFSupabase.generateWithAI("caption", business, input);
        lastCaptionResult = res.data;
        if (res.usage) SFStore.setUsageFromServer(res.usage.plan, res.usage.used);
        else SFStore.logUsage("caption");
        renderCaption(lastCaptionResult, true);
        A.refresh();
        A.toast("Legenda gerada por IA! Revise antes de publicar.", "success");
      } catch (err) {
        A.toast(err.message, "error");
      } finally {
        btn.disabled = false;
        btn.textContent = original;
      }
      return;
    }

    lastCaptionResult = generateCaption(business, input);
    SFStore.logUsage("caption");
    renderCaption(lastCaptionResult, false);
    A.refresh();
    A.toast("Demonstração gerada! Lembre-se: o texto é simulado.", "success");
  }

  function onCaptionSubmit(event) {
    event.preventDefault();
    const ok = A.validate([
      { id: "cap-niche", message: "Escolha o segmento." },
      { id: "cap-product", message: "Informe o produto ou serviço.", min: 2 },
      { id: "cap-goal", message: "Escolha o objetivo." },
      { id: "cap-platform", message: "Escolha a rede social." },
      { id: "cap-tone", message: "Escolha o tom." },
      { id: "cap-format", message: "Escolha o formato." }
    ]);
    if (!ok) return;

    runCaption({
      niche: A.$("#cap-niche").value,
      product: A.$("#cap-product").value.trim(),
      goal: A.$("#cap-goal").value,
      platform: A.$("#cap-platform").value,
      tone: A.$("#cap-tone").value,
      format: A.$("#cap-format").value,
      length: A.$("#cap-length") ? A.$("#cap-length").value : "media"
    });
  }

  function captionAsText(r) {
    return r.title + "\n\n" + r.caption + "\n\n" + r.cta + "\n\n" + r.hashtags;
  }

  function renderCaptionView() {
    const business = SFStore.getBusiness();
    if (business) {
      setDefault("cap-niche", business.niche);
      setDefault("cap-tone", business.tone);
    }
    setDefault("cap-platform", SFStore.getSettings().defaultPlatform);
    setDefault("cap-format", "feed");
  }

  /* =====================================================
     GERADOR DE IDEIAS PARA REELS
     ===================================================== */
  function generateReels(business, input) {
    const niche = getNiche(input.niche);
    const vars = buildVars(business, niche, input.product);
    const cta = fill(D.reelCtas[input.goal], vars);

    return shuffle(D.reelTemplates).slice(0, 5).map(function (t) {
      return {
        title: fill(t.title, vars),
        hook: fill(t.hook, vars),
        scenes: t.scenes.map(function (s) { return fill(s, vars); }),
        screenText: fill(t.screenText, vars),
        caption: fill(t.caption, vars),
        cta: cta,
        hashtags: shuffle(niche.hashtags).slice(0, 4).join(" ")
      };
    });
  }

  function reelAsText(r) {
    return "🎬 " + r.title +
      "\n\nGancho: " + r.hook +
      "\n\nRoteiro:\n" + r.scenes.map(function (s, i) { return "Cena " + (i + 1) + ": " + s; }).join("\n") +
      "\n\nTexto na tela: " + r.screenText +
      "\n\nLegenda: " + r.caption +
      "\n\nCTA: " + r.cta;
  }

  function renderReels(reels, isAI) {
    const titleEl = A.$("#reels-result-title");
    if (titleEl) titleEl.textContent = isAI ? "Ideias geradas por IA" : "Ideias demonstrativas";
    const tag = A.$("#reels-result .tag");
    if (tag) tag.textContent = isAI ? "✨ Gerado por IA · revise antes de publicar" : "Simulado · não é IA";
    const esc = A.escapeHtml;
    A.$("#reels-output").innerHTML = reels.map(function (r, i) {
      return (
        '<article class="reel-card">' +
          "<h4>" + (i + 1) + ". " + esc(r.title) + "</h4>" +
          "<dl>" +
            "<dt>GANCHO INICIAL</dt><dd>" + esc(r.hook) + "</dd>" +
            "<dt>ROTEIRO EM CENAS</dt><dd><ol>" + r.scenes.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol></dd>" +
            "<dt>TEXTO NA TELA</dt><dd>" + esc(r.screenText) + "</dd>" +
            "<dt>LEGENDA</dt><dd>" + esc(r.caption) + "</dd>" +
            "<dt>CHAMADA PARA AÇÃO</dt><dd>" + esc(r.cta) + "</dd>" +
          "</dl>" +
          '<div class="item-actions">' +
            '<button type="button" class="btn btn-secondary btn-sm" data-reel-action="copy" data-index="' + i + '">📋 Copiar</button>' +
            '<button type="button" class="btn btn-primary btn-sm" data-reel-action="save" data-index="' + i + '">✏️ Editar e salvar</button>' +
          "</div>" +
        "</article>"
      );
    }).join("");
    A.$("#reels-result").classList.remove("hidden");
    A.$("#reels-result").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onReelsSubmit(event) {
    event.preventDefault();
    const ok = A.validate([
      { id: "reel-niche", message: "Escolha o segmento." },
      { id: "reel-goal", message: "Escolha o objetivo." },
      { id: "reel-product", message: "Informe o produto ou serviço.", min: 2 }
    ]);
    if (!ok) return;

    const business = ensureCanGenerate();
    if (!business) return;

    const input = {
      niche: A.$("#reel-niche").value,
      goal: A.$("#reel-goal").value,
      product: A.$("#reel-product").value.trim()
    };

    if (typeof SFSupabase !== "undefined" && SFSupabase.isLoggedIn()) {
      const btn = A.$('#reels-form button[type="submit"]');
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "⏳ Gerando com IA…";
      try {
        const res = await SFSupabase.generateWithAI("reels", business, input);
        lastReels = (res.data && res.data.reels) || [];
        if (res.usage) SFStore.setUsageFromServer(res.usage.plan, res.usage.used);
        else SFStore.logUsage("reels");
        renderReels(lastReels, true);
        A.refresh();
        A.toast("5 ideias geradas por IA! Revise antes de gravar.", "success");
      } catch (err) {
        A.toast(err.message, "error");
      } finally {
        btn.disabled = false;
        btn.textContent = original;
      }
      return;
    }

    lastReels = generateReels(business, input);
    SFStore.logUsage("reels");
    renderReels(lastReels, false);
    A.refresh();
    A.toast("5 ideias demonstrativas geradas!", "success");
  }

  function onReelsClick(event) {
    const btn = event.target.closest("[data-reel-action]");
    if (!btn) return;
    const reel = lastReels[Number(btn.dataset.index)];
    if (!reel) return;

    if (btn.dataset.reelAction === "copy") A.copyText(reelAsText(reel), btn);
    if (btn.dataset.reelAction === "save") {
      A.openPostModal({
        title: "Reels: " + reel.title,
        content_type: "reels",
        status: "ideia",
        caption: reelAsText(reel),
        cta: reel.cta,
        hashtags: reel.hashtags,
        visual: "Texto na tela: " + reel.screenText
      });
    }
  }

  function renderReelsView() {
    const business = SFStore.getBusiness();
    if (business) setDefault("reel-niche", business.niche);
  }

  /* ---------- Ligando os botões ---------- */
  A.$("#caption-form").addEventListener("submit", onCaptionSubmit);
  A.$("#caption-copy").addEventListener("click", function () {
    if (lastCaptionResult) A.copyText(captionAsText(lastCaptionResult), this);
  });
  if (A.$("#caption-copy-top")) {
    A.$("#caption-copy-top").addEventListener("click", function () {
      if (lastCaptionResult) A.copyText(captionAsText(lastCaptionResult), this);
    });
  }
  A.$("#caption-output").addEventListener("click", function (event) {
    const btn = event.target.closest("[data-copy-block]");
    if (!btn || !lastCaptionResult) return;
    const fields = [lastCaptionResult.title, lastCaptionResult.caption, lastCaptionResult.cta, lastCaptionResult.hashtags, lastCaptionResult.visual];
    const value = fields[Number(btn.dataset.copyBlock)];
    if (value) A.copyText(value, btn);
  });
  function findNextOpenDate() {
    const usedDates = new Set(
      SFStore.getPosts().map(function (p) { return p.scheduled_for; }).filter(Boolean)
    );
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const candidate = A.toISODate(A.addDays(today, i));
      if (!usedDates.has(candidate)) return candidate;
    }
    return A.toISODate(A.addDays(today, 1));
  }

  function prefillCaption(opts) {
    if (!opts) return;
    if (opts.product && A.$("#cap-product")) A.$("#cap-product").value = opts.product;
    if (opts.goal && A.$("#cap-goal")) A.$("#cap-goal").value = opts.goal;
  }

  A.$("#caption-save").addEventListener("click", function () {
    if (!lastCaptionResult) return;
    A.openPostModal(Object.assign({}, lastCaptionResult, {
      content_type: "legenda",
      platform: lastCaptionInput.platform,
      status: "rascunho"
    }));
  });
  if (A.$("#caption-schedule")) {
    A.$("#caption-schedule").addEventListener("click", function () {
      if (!lastCaptionResult) return;
      A.openPostModal(Object.assign({}, lastCaptionResult, {
        content_type: "legenda",
        platform: lastCaptionInput.platform,
        status: "aprovado",
        scheduled_for: findNextOpenDate()
      }));
    });
  }
  if (A.$("#caption-make-card")) {
    A.$("#caption-make-card").addEventListener("click", function () {
      if (!lastCaptionResult) return;
      if (typeof SFCardMaker !== "undefined" && SFCardMaker.prefill) {
        SFCardMaker.prefill({
          title: lastCaptionResult.title,
          subtitle: lastCaptionResult.cta
        });
      }
      window.location.hash = "card";
    });
  }
  A.$("#caption-again").addEventListener("click", function () {
    if (lastCaptionInput) runCaption(lastCaptionInput);
  });
  A.$("#reels-form").addEventListener("submit", onReelsSubmit);
  A.$("#reels-output").addEventListener("click", onReelsClick);

  A.onShow("legendas", renderCaptionView);
  A.onShow("reels", renderReelsView);

  // Usado pelo calendário e pelo dashboard
  return { fill, pick, buildVars, getNiche, ensureCanGenerate, prefillCaption };
})();
