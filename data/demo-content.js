/* =========================================================
   SocialFlow AI — Dados de demonstração
   ---------------------------------------------------------
   Tudo aqui é FICTÍCIO. Estes textos-modelo são combinados
   pelo gerador para simular um resultado. Nenhuma IA é usada.

   As palavras entre chaves, como {produto} e {empresa}, são
   "lacunas" que o gerador preenche com o que você digitou.
   ========================================================= */

const DEMO_CONTENT = {

  /* ---------- Segmentos (nichos) ---------- */
  niches: [
    {
      id: "barbearia",
      label: "Barbearia",
      place: "barbearia",
      placeA: "uma barbearia",
      pro: "barbeiro",
      hashtags: ["#barbearia", "#barbeiro", "#cortemasculino", "#barba", "#estilomasculino", "#visualnovo"],
      tips: [
        "use um pente de dentes largos para desembaraçar a barba",
        "lave a barba com um produto próprio para os fios do rosto",
        "seque bem os fios antes de pentear e finalizar"
      ],
      myth: "Cortar a barba faz ela crescer mais grossa? Mito! O corte não muda a espessura dos fios; ele apenas deixa a aparência mais uniforme.",
      visuals: [
        "foto do {pro} finalizando o acabamento, com luz natural",
        "antes e depois de um corte (somente com autorização do cliente)",
        "close nas ferramentas organizadas na bancada"
      ],
      sampleProducts: ["corte degradê", "barba completa", "corte + barba"]
    },
    {
      id: "salao",
      label: "Salão de beleza",
      place: "salão",
      placeA: "um salão",
      pro: "cabeleireira",
      hashtags: ["#salaodebeleza", "#cabelo", "#beleza", "#autocuidado", "#cabeloshidratados", "#hairstyle"],
      tips: [
        "use protetor térmico antes de secador ou chapinha",
        "evite lavar o cabelo com água muito quente",
        "escolha a hidratação de acordo com o seu tipo de cabelo"
      ],
      myth: "Cortar as pontas faz o cabelo crescer mais rápido? Mito! O crescimento acontece na raiz; cortar as pontas ajuda a manter a aparência saudável dos fios.",
      visuals: [
        "foto do resultado final com fundo neutro (somente com autorização da cliente)",
        "vídeo curto do produto sendo aplicado",
        "ambiente do salão arrumado e bem iluminado"
      ],
      sampleProducts: ["hidratação capilar", "corte feminino", "escova modelada"]
    },
    {
      id: "restaurante",
      label: "Restaurante",
      place: "restaurante",
      placeA: "um restaurante",
      pro: "chef",
      hashtags: ["#restaurante", "#comidaboa", "#gastronomia", "#almoço", "#foodlover", "#saborcaseiro"],
      tips: [
        "reserve com antecedência nos dias mais movimentados",
        "pergunte à equipe sobre as opções do dia",
        "avise sempre sobre restrições alimentares ao fazer o pedido"
      ],
      myth: "Só dá para falar de restrições alimentares se for alergia grave? Mito! Qualquer restrição deve ser informada à equipe para que ela possa orientar sobre as opções disponíveis.",
      visuals: [
        "foto do prato vista de cima, com luz natural",
        "mãos do {pro} finalizando o prato",
        "mesa posta com o ambiente ao fundo"
      ],
      sampleProducts: ["prato executivo", "sobremesa da casa", "almoço de domingo"]
    },
    {
      id: "outro",
      label: "Outro segmento",
      place: "negócio",
      placeA: "um lugar",
      pro: "equipe",
      hashtags: ["#pequenosnegocios", "#empreendedorismo", "#comprelocal", "#atendimento", "#novidade", "#qualidade"],
      tips: [
        "entenda bem o que você precisa antes de escolher",
        "tire suas dúvidas com a equipe antes de decidir",
        "acompanhe nossas redes para ver as novidades"
      ],
      myth: "Só vale a pena pedir orientação quando o problema já é grande? Mito! Quanto antes você tira suas dúvidas, mais fácil é encontrar a melhor solução.",
      visuals: [
        "foto da equipe no ambiente de trabalho",
        "close no produto ou serviço sendo usado",
        "bastidores do dia a dia"
      ],
      sampleProducts: ["atendimento personalizado", "produto em destaque", "serviço principal"]
    }
  ],

  /* ---------- Objetivos ---------- */
  goals: [
    { id: "atrair", label: "Atrair novos clientes" },
    { id: "vender", label: "Divulgar um produto ou serviço" },
    { id: "engajar", label: "Engajar seguidores" },
    { id: "educar", label: "Ensinar algo útil" }
  ],

  /* ---------- Tons de voz ---------- */
  tones: [
    { id: "profissional", label: "Profissional", emoji: "", closings: ["Conte com a nossa equipe.", "Estamos à disposição para tirar suas dúvidas."] },
    { id: "descontraido", label: "Descontraído", emoji: " 😎", closings: ["Bora?", "Partiu? A gente te espera!"] },
    { id: "amigavel", label: "Amigável", emoji: " 💜", closings: ["Vai ser um prazer te receber!", "Estamos te esperando com carinho."] },
    { id: "inspirador", label: "Inspirador", emoji: " ✨", closings: ["Pequenos cuidados fazem grandes diferenças.", "Você merece esse momento."] }
  ],

  /* ---------- Redes sociais e como chamar para a ação em cada uma ---------- */
  platforms: [
    { id: "Instagram", label: "Instagram", channel: "pelo link da bio" },
    { id: "Facebook", label: "Facebook", channel: "pelo botão de mensagem da página" },
    { id: "TikTok", label: "TikTok", channel: "pelo link no perfil" },
    { id: "LinkedIn", label: "LinkedIn", channel: "pelo contato do nosso perfil" }
  ],

  /* ---------- Formatos ---------- */
  formats: [
    { id: "feed", label: "Post no feed", visual: "Post único: {visual}." },
    { id: "carrossel", label: "Carrossel", visual: "Carrossel de 4 a 6 cards: capa com o título, cards com os pontos principais e último card com a chamada para ação. Imagem da capa: {visual}." },
    { id: "stories", label: "Stories", visual: "Sequência de 3 stories: 1) enquete ou pergunta; 2) {visual}; 3) chamada para ação com figurinha de link ou mensagem." }
  ],

  /* ---------- Status do calendário ---------- */
  statuses: [
    { id: "ideia", label: "Ideia" },
    { id: "rascunho", label: "Rascunho" },
    { id: "aprovado", label: "Aprovado" },
    { id: "publicado", label: "Publicado" }
  ],

  /* ---------- Tipos de conteúdo ---------- */
  contentTypes: [
    { id: "legenda", label: "Legenda" },
    { id: "reels", label: "Reels" },
    { id: "calendario", label: "Planejamento" }
  ],

  /* ---------- Planos (hipotéticos — nada é cobrado) ---------- */
  plans: [
    { id: "free", label: "Free", limit: 5, businesses: 1 },
    { id: "starter", label: "Starter", limit: 50, businesses: 1 },
    { id: "pro", label: "Pro", limit: 150, businesses: 3 },
    { id: "premium", label: "Premium", limit: 300, businesses: 5 }
  ],

  /* ---------- Modelos de legenda por objetivo ----------
     Regras seguidas (do guia): não inventar preços, descontos,
     depoimentos ou resultados garantidos. */
  captionTemplates: {
    atrair: [
      {
        title: "Primeira vez por aqui? Vem conhecer {empresa}",
        caption: "Se você ainda não conhece {empresa}, este é o convite: venha experimentar {produto} com calma e atenção aos detalhes.\n\nPensamos cada etapa do atendimento para {publico}."
      },
      {
        title: "{Produto} do jeito que você procura",
        caption: "Sabe quando você procura um lugar de confiança para {produto}? É isso que queremos oferecer: atendimento atencioso e cuidado em cada etapa.\n\nSe você faz parte de {publico}, esse convite é para você."
      },
      {
        title: "Procurando {umLugar} para chamar de seu?",
        caption: "Encontrar {umLugar} em que você se sinta à vontade faz toda a diferença.\n\nAqui, {produto} é feito com atenção e sem pressa, pensando em {publico}."
      }
    ],
    vender: [
      {
        title: "Hoje o destaque é: {produto}",
        caption: "Hoje queremos apresentar {produto} com mais detalhes.\n\nSe você faz parte de {publico}, essa pode ser uma ótima escolha. Fale com a gente e tire todas as suas dúvidas."
      },
      {
        title: "Já pensou em experimentar {produto}?",
        caption: "Talvez você ainda não tenha experimentado {produto}. Que tal mudar isso?\n\nNossa equipe explica tudo com calma para você decidir com tranquilidade."
      },
      {
        title: "{Produto}: veja como funciona",
        caption: "Muita gente pergunta como funciona {produto}.\n\nA resposta curta: é só chamar a gente. Explicamos cada etapa, sem compromisso."
      }
    ],
    engajar: [
      {
        title: "Conta pra gente 👇",
        caption: "Pergunta rápida para {publico}: o que você mais leva em conta na hora de escolher {produto}?\n\nResponde nos comentários — vamos ler todas as respostas!"
      },
      {
        title: "Isso ou aquilo?",
        caption: "Vamos brincar? Quando o assunto é {produto}, você prefere o clássico ou gosta de experimentar novidades?\n\nDeixe sua resposta aqui embaixo."
      },
      {
        title: "Bastidores: um dia com a nossa equipe",
        caption: "Por trás de cada {produto} existe muita dedicação.\n\nHoje mostramos um pouquinho da nossa rotina para você conhecer quem faz tudo acontecer em {empresa}."
      }
    ],
    educar: [
      {
        title: "3 dicas rápidas sobre {produto}",
        caption: "Separamos 3 dicas simples para {publico}:\n\n1. {tip1}\n2. {tip2}\n3. {tip3}\n\nSalve este post para consultar depois!"
      },
      {
        title: "Mito ou verdade?",
        caption: "{myth}\n\nTem alguma outra dúvida sobre {produto}? Pergunte nos comentários."
      },
      {
        title: "Você sabia?",
        caption: "Um detalhe que muita gente esquece: {tip1}.\n\nPequenos cuidados fazem diferença quando o assunto é {produto}."
      }
    ]
  },

  /* ---------- Chamadas para ação por objetivo ---------- */
  ctas: {
    atrair: ["Agende seu horário {canal}.", "Venha nos conhecer — fale com a gente {canal}."],
    vender: ["Quer saber mais sobre {produto}? Chame a gente {canal}.", "Tire suas dúvidas sobre {produto} {canal}."],
    engajar: ["Comente sua resposta e marque um amigo.", "Responda nos comentários e compartilhe com quem combina com você."],
    educar: ["Salve este post e compartilhe com quem precisa ver.", "Ficou com dúvida? Pergunte nos comentários."]
  },

  /* ---------- Modelos de ideias para Reels ---------- */
  reelTemplates: [
    {
      title: "Transformação em 15 segundos",
      hook: "Olha essa transformação 👀",
      scenes: [
        "Mostre o começo do processo (pessoas só com autorização).",
        "Cortes rápidos do processo de {produto}.",
        "Revele o resultado final com uma transição.",
        "Termine com o logo ou a fachada de {empresa}."
      ],
      screenText: "Começo ➜ Resultado | {Produto}",
      caption: "Cada detalhe conta. Esse foi o processo de {produto} por aqui."
    },
    {
      title: "Um dia nos bastidores",
      hook: "Você já viu como é um dia por aqui?",
      scenes: [
        "Abrindo as portas de manhã.",
        "Equipe organizando o espaço.",
        "{Pro} preparando {produto}.",
        "Fechamento do dia com a equipe acenando."
      ],
      screenText: "Um dia em {empresa}",
      caption: "Por trás de cada atendimento existe uma rotina cheia de cuidado. Esse é o nosso dia a dia!"
    },
    {
      title: "3 dicas rápidas",
      hook: "3 dicas sobre {produto} que pouca gente conhece",
      scenes: [
        "Dica 1: {tip1}.",
        "Dica 2: {tip2}.",
        "Dica 3: {tip3}.",
        "Encerramento pedindo para salvar o vídeo."
      ],
      screenText: "Dica 1 · Dica 2 · Dica 3",
      caption: "Salve para lembrar depois e mande para quem precisa saber disso!"
    },
    {
      title: "Mito ou verdade",
      hook: "Mito ou verdade? 🤔",
      scenes: [
        "Mostre a pergunta na tela e faça cara de dúvida.",
        "Pausa de 2 segundos com o texto \"o que você acha?\".",
        "Revele a resposta com uma explicação curta.",
        "Convide para comentar outras dúvidas."
      ],
      screenText: "{myth}",
      caption: "E aí, você acertou? Comente outras dúvidas sobre {produto} que respondemos no próximo vídeo."
    },
    {
      title: "Pergunta de cliente",
      hook: "Uma pergunta que sempre recebemos…",
      scenes: [
        "Texto na tela: \"Como funciona {produto}?\"",
        "{Pro} responde de forma simples, olhando para a câmera.",
        "Imagens de apoio mostrando o serviço ou produto.",
        "Convite para enviar mais perguntas."
      ],
      screenText: "Como funciona {produto}?",
      caption: "Respondendo uma dúvida frequente! Mande a sua nos comentários."
    },
    {
      title: "POV: encontrou o lugar certo",
      hook: "POV: você finalmente encontrou {umLugar} de confiança",
      scenes: [
        "Pessoa chegando e sendo recebida pela equipe.",
        "Momento do atendimento de {produto}.",
        "Pessoa satisfeita com o resultado (com autorização).",
        "Logo de {empresa} no final."
      ],
      screenText: "POV: achei {umLugar} de confiança",
      caption: "Aquela sensação de estar no lugar certo. 💜"
    },
    {
      title: "Conheça a equipe",
      hook: "Prazer, essa é a equipe por trás de {empresa}!",
      scenes: [
        "Cada pessoa da equipe acena para a câmera (com autorização).",
        "Nome e função aparecem na tela.",
        "Uma cena rápida de cada um trabalhando.",
        "Foto em grupo para encerrar."
      ],
      screenText: "Quem faz {empresa} acontecer",
      caption: "Pessoas reais, cuidando de você todos os dias. Diga oi para a nossa equipe!"
    }
  ],

  /* ---------- CTAs dos Reels por objetivo ---------- */
  reelCtas: {
    atrair: "Venha nos conhecer — o contato está no perfil.",
    vender: "Quer experimentar {produto}? Mande uma mensagem.",
    engajar: "Comente qual parte você mais gostou!",
    educar: "Salve este vídeo e compartilhe com quem precisa ver."
  },

  /* ---------- Calendário de 7 dias ----------
     Alterna educativo, comercial, informativo e relacionamento,
     sem repetir temas e sem inventar datas comemorativas. */
  weekPlan: [
    { type: "Educativo", theme: "Dica rápida sobre {produto}", idea: "Carrossel com 3 dicas práticas.", caption: "Dica do dia para {publico}: {tip1}. Salve para lembrar depois!", cta: "Salve este post." },
    { type: "Comercial", theme: "Apresentação de {produto}", idea: "Foto ou vídeo curto mostrando {produto}.", caption: "Conheça {produto} de perto. Pensado para {publico}.", cta: "{goalCta}" },
    { type: "Informativo", theme: "Como funciona o atendimento", idea: "Stories explicando horários e formas de contato.", caption: "Veja como funciona o atendimento de {empresa} e escolha o melhor jeito de falar com a gente.", cta: "Confira as informações no perfil." },
    { type: "Relacionamento", theme: "Bastidores da equipe", idea: "Vídeo curto da equipe no dia a dia.", caption: "Por trás de cada atendimento existe uma equipe dedicada. Hoje mostramos um pouco da nossa rotina!", cta: "Comente e diga oi para a equipe." },
    { type: "Educativo", theme: "Mito ou verdade", idea: "Post com pergunta na capa e resposta no segundo card.", caption: "{myth}", cta: "Comente outras dúvidas." },
    { type: "Comercial", theme: "Convite para experimentar {produto}", idea: "Foto do resultado ou do produto com fundo limpo.", caption: "Ainda não experimentou {produto}? Esse é o seu convite. Fale com a gente e tire suas dúvidas.", cta: "{goalCta}" },
    { type: "Relacionamento", theme: "Pergunta para a comunidade", idea: "Caixinha de perguntas nos stories.", caption: "Queremos te ouvir: o que você gostaria de ver mais por aqui? Responda nos comentários!", cta: "Responda nos comentários." }
  ],

  /* ---------- Exemplos para o botão "Carregar exemplos" ---------- */
  sampleBusiness: {
    name: "Barbearia Exemplo",
    niche: "barbearia",
    audience: "homens de 20 a 45 anos que moram ou trabalham no bairro",
    tone: "descontraido",
    description: "Barbearia fictícia com atendimento por horário marcado e ambiente climatizado."
  },

  samplePosts: [
    { dayOffset: 0, status: "publicado", content_type: "legenda", platform: "Instagram",
      title: "Começando a semana com o visual em dia 😎",
      caption: "Segunda-feira pede confiança. Que tal começar a semana com o corte em dia?",
      cta: "Agende seu horário pelo link da bio.", hashtags: "#barbearia #cortemasculino #segunda",
      visual: "Post único: foto do barbeiro finalizando o acabamento, com luz natural." },
    { dayOffset: 1, status: "aprovado", content_type: "reels", platform: "Instagram",
      title: "Reels: 3 dicas para cuidar da barba",
      caption: "Gancho: 3 dicas sobre barba que pouca gente conhece.\nCena 1: pente de dentes largos.\nCena 2: produto próprio para barba.\nCena 3: secar bem antes de finalizar.",
      cta: "Salve este vídeo.", hashtags: "#barba #dicas #barbeiro", visual: "Texto na tela: Dica 1 · Dica 2 · Dica 3" },
    { dayOffset: 3, status: "rascunho", content_type: "legenda", platform: "Facebook",
      title: "Conta pra gente 👇",
      caption: "Pergunta rápida: você prefere um corte clássico ou gosta de testar estilos novos?",
      cta: "Comente sua resposta.", hashtags: "#barbearia #estilo", visual: "Stories com enquete." },
    { dayOffset: 4, status: "ideia", content_type: "calendario", platform: "Instagram",
      title: "Relacionamento · Bastidores da equipe",
      caption: "Por trás de cada atendimento existe uma equipe dedicada. Hoje mostramos um pouco da nossa rotina!",
      cta: "Comente e diga oi para a equipe.", hashtags: "#bastidores #equipe", visual: "Vídeo curto da equipe no dia a dia." },
    { dayOffset: null, status: "ideia", content_type: "legenda", platform: "Instagram",
      title: "Mito ou verdade?",
      caption: "Cortar a barba faz ela crescer mais grossa? Mito! O corte não muda a espessura dos fios.",
      cta: "Comente outras dúvidas.", hashtags: "#barba #mitoouverdade", visual: "Carrossel com pergunta na capa." }
  ]
};
