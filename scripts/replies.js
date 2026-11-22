/* =========================================================
   SocialFlow AI — Respostas rápidas (replies.js)
   Modelos prontos para responder DM e comentários no Instagram
   adaptados ao nome e ao tom da empresa ativa.
   ========================================================= */

(function () {
  const A = SFApp;

  const TEMPLATES = [
    {
      category: "Valores / Preço",
      title: "Pergunta sobre quanto custa",
      professional: "Olá! Muito obrigado pelo contato com {empresa}. Os valores variam conforme o que você precisa. Me conte o que procura para que eu possa te passar as informações certinhas.",
      casual: "Oi! Tudo bem? Aqui é da {empresa} 😊 Me conta o que você está procurando que já te passo os detalhes e valores certinhos!",
      friendly: "Oi! Que bom receber sua mensagem na {empresa} 💜 Me fala o que você gostaria de fazer para eu te orientar com calma!"
    },
    {
      category: "Horários",
      title: "Qual o horário de atendimento?",
      professional: "Olá! Na {empresa}, atendemos [dias da semana], das [horário de abertura] às [horário de fechamento]. Ficamos à disposição!",
      casual: "Oi! A {empresa} funciona [dias da semana], das [início] às [fim]. Te esperamos por aqui!",
      friendly: "Olá! Estamos abertos [dias da semana], das [início] às [fim]. Vai ser um prazer te receber na {empresa}!"
    },
    {
      category: "Agendamento / Pedido",
      title: "Como faço para agendar ou pedir?",
      professional: "Para agendar ou fazer seu pedido na {empresa}, basta enviar seu nome e o melhor horário/serviço por aqui ou acessar o link da nossa bio.",
      casual: "Bora agendar! É só mandar aqui seu nome e o melhor dia/horário para você, ou clicar no link da nossa bio 😉",
      friendly: "É super fácil! Você pode me mandar por aqui o dia e horário que prefere, ou clicar no link da nossa bio. Combinado?"
    },
    {
      category: "Localização",
      title: "Onde vocês ficam?",
      professional: "A {empresa} fica localizada em [seu endereço e ponto de referência]. Caso precise da localização exata pelo mapa, é só avisar!",
      casual: "Estamos em [seu endereço e ponto de referência]. Se quiser, te mando o pin da localização por aqui!",
      friendly: "Ficamos em [seu endereço e ponto de referência]! Qualquer dúvida para chegar na {empresa}, é só chamar."
    },
    {
      category: "Relacionamento",
      title: "Agradecer elogio ou comentário",
      professional: "Muito obrigado pelo carinho e pela confiança na {empresa}! Comentários assim motivam toda a nossa equipe.",
      casual: "Valeu demais pelo carinho! 💜 A equipe da {empresa} fica muito feliz com esse retorno!",
      friendly: "Muito obrigado por essa mensagem tão especial! Toda a equipe da {empresa} agradece de coração 💜"
    }
  ];

  function pickTone(template, tone) {
    if (tone === "descontraido") return template.casual;
    if (tone === "amigavel" || tone === "inspirador") return template.friendly;
    return template.professional;
  }

  function renderReplies() {
    const biz = SFStore.getBusiness();
    const bizName = biz ? biz.name : "nossa empresa";
    const tone = biz ? biz.tone : "profissional";
    const list = A.$("#replies-list");
    if (!list) return;

    list.innerHTML = TEMPLATES.map(function (t, i) {
      const text = pickTone(t, tone).replace(/\{empresa\}/g, bizName);
      return (
        '<article class="list-item">' +
          '<div class="item-meta"><span class="tag">' + A.escapeHtml(t.category) + "</span></div>" +
          "<h4>" + A.escapeHtml(t.title) + "</h4>" +
          '<textarea class="reply-box" data-reply-index="' + i + '" rows="3">' + A.escapeHtml(text) + "</textarea>" +
          '<div class="item-actions">' +
            '<button type="button" class="btn btn-secondary btn-sm" data-copy-reply="' + i + '">📋 Copiar resposta</button>' +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  const listEl = A.$("#replies-list");
  if (listEl) {
    listEl.addEventListener("click", function (event) {
      const btn = event.target.closest("[data-copy-reply]");
      if (!btn) return;
      const box = listEl.querySelector('[data-reply-index="' + btn.dataset.copyReply + '"]');
      if (box) A.copyText(box.value, btn);
    });
  }

  A.onShow("respostas", renderReplies);
})();
