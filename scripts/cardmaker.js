/* =========================================================
   SocialFlow AI — Criador de Card (cardmaker.js)
   Gera uma arte 1080x1080 em PNG usando HTML5 Canvas,
   100% no navegador (custo R$ 0, sem enviar fotos).
   ========================================================= */

const SFCardMaker = (function () {
  const A = SFApp;
  let uploadedImage = null;

  function wrapLines(ctx, text, maxWidth) {
    const words = String(text || "").trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let current = "";
    words.forEach(function (word) {
      const test = current ? current + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    });
    if (current) lines.push(current);
    return lines;
  }

  function drawCard() {
    const canvas = A.$("#card-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    const title = (A.$("#card-title").value || "").trim() || "Seu marketing, no fluxo certo.";
    const subtitle = (A.$("#card-subtitle").value || "").trim() || "Agende pelo link da bio";
    const biz = SFStore.getBusiness();
    const brand = (A.$("#card-brand").value || "").trim() || (biz ? biz.name : "SocialFlow AI");
    const theme = A.$("#card-theme").value || "brand";

    // 1. Fundo (gradiente ou foto enviada)
    if (uploadedImage) {
      const scale = Math.max(W / uploadedImage.width, H / uploadedImage.height);
      const dw = uploadedImage.width * scale;
      const dh = uploadedImage.height * scale;
      ctx.drawImage(uploadedImage, (W - dw) / 2, (H - dh) / 2, dw, dh);

      const overlay = ctx.createLinearGradient(0, 0, 0, H);
      overlay.addColorStop(0, "rgba(16, 23, 42, 0.55)");
      overlay.addColorStop(1, "rgba(16, 23, 42, 0.88)");
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, W, H);
    } else {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      if (theme === "navy") {
        grad.addColorStop(0, "#10172A");
        grad.addColorStop(1, "#1E293B");
      } else if (theme === "purple") {
        grad.addColorStop(0, "#5A46D6");
        grad.addColorStop(1, "#10172A");
      } else {
        grad.addColorStop(0, "#715CF5");
        grad.addColorStop(0.55, "#1E2A4A");
        grad.addColorStop(1, "#10172A");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Detalhe decorativo sutil
      ctx.fillStyle = "rgba(69, 184, 245, 0.16)";
      ctx.beginPath();
      ctx.arc(W - 120, 140, 220, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Borda interna elegante
    ctx.strokeStyle = "rgba(245, 247, 252, 0.16)";
    ctx.lineWidth = 4;
    ctx.strokeRect(48, 48, W - 96, H - 96);

    // 3. Selo superior
    ctx.fillStyle = "#45B8F5";
    ctx.font = "700 28px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(brand.toUpperCase(), W / 2, 140);

    // 4. Título central com quebra de linha automática
    ctx.fillStyle = "#F5F7FC";
    ctx.font = "800 64px Inter, Arial, sans-serif";
    const titleLines = wrapLines(ctx, title, W - 200).slice(0, 5);
    const lineHeight = 78;
    const startY = H / 2 - ((titleLines.length - 1) * lineHeight) / 2;
    titleLines.forEach(function (line, i) {
      ctx.fillText(line, W / 2, startY + i * lineHeight);
    });

    // 5. Subtítulo / CTA em pílula
    if (subtitle) {
      ctx.font = "600 32px Inter, Arial, sans-serif";
      const subWidth = Math.min(W - 180, ctx.measureText(subtitle).width + 80);
      const pillX = (W - subWidth) / 2;
      const pillY = H - 230;
      ctx.fillStyle = "rgba(113, 92, 245, 0.9)";
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, subWidth, 72, 36);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(subtitle.slice(0, 48), W / 2, pillY + 47);
    }
  }

  function prefill(opts) {
    if (!opts) return;
    if (opts.title && A.$("#card-title")) A.$("#card-title").value = opts.title.slice(0, 80);
    if (opts.subtitle && A.$("#card-subtitle")) A.$("#card-subtitle").value = opts.subtitle.slice(0, 100);
    const biz = SFStore.getBusiness();
    if (biz && A.$("#card-brand") && !A.$("#card-brand").value) {
      A.$("#card-brand").value = biz.name;
    }
    drawCard();
  }

  function onPhotoChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        uploadedImage = img;
        drawCard();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function downloadCard() {
    const canvas = A.$("#card-canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "socialflow-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    A.toast("Card baixado em PNG (1080×1080)!", "success");
  }

  function renderCardView() {
    const biz = SFStore.getBusiness();
    if (biz && A.$("#card-brand") && !A.$("#card-brand").value) {
      A.$("#card-brand").value = biz.name;
    }
    drawCard();
  }

  ["#card-title", "#card-subtitle", "#card-brand", "#card-theme"].forEach(function (sel) {
    const el = A.$(sel);
    if (el) {
      el.addEventListener("input", drawCard);
      el.addEventListener("change", drawCard);
    }
  });
  if (A.$("#card-photo")) A.$("#card-photo").addEventListener("change", onPhotoChange);
  if (A.$("#card-clear-photo")) {
    A.$("#card-clear-photo").addEventListener("click", function () {
      uploadedImage = null;
      if (A.$("#card-photo")) A.$("#card-photo").value = "";
      drawCard();
    });
  }
  if (A.$("#card-download")) A.$("#card-download").addEventListener("click", downloadCard);

  A.onShow("card", renderCardView);

  return { prefill, drawCard };
})();
