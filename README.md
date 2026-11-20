# SocialFlow AI — Protótipo local

> **Seu marketing, no fluxo certo.**
> Micro SaaS de marketing para pequenos negócios (barbearias, salões, restaurantes…).

Esta é a **versão 0 (protótipo demonstrativo)**: feita só com HTML, CSS e JavaScript.
Ela usa **dados fictícios** e uma **geração simulada**. **Não há IA, banco de dados, login ou pagamentos.**

---

## Como abrir

1. Abra a pasta `socialflow-ai` no Explorador de Arquivos do Windows.
2. Dê dois cliques em **`index.html`** (landing page) ou em **`app.html`** (aplicação).
3. Pronto! Não precisa instalar nada além de um navegador (Chrome, Edge ou Firefox).

Para editar os arquivos, use o **Visual Studio Code** (gratuito): *File → Open Folder… → socialflow-ai*.

## Estrutura

```
socialflow-ai/
├── index.html              Landing page
├── login.html              Login e cadastro SIMULADOS (sem backend)
├── app.html                Aplicação (todas as telas)
├── styles/style.css        Visual (cores, layout, celular)
├── data/demo-content.js    Textos-modelo fictícios
├── scripts/storage.js      Salva os dados no navegador (localStorage)
├── scripts/auth.js         Validação da tela de login/cadastro simulada
├── scripts/app.js          Navegação, empresa, configurações, janela de edição
├── scripts/dashboard.js    Resumo e itens recentes
├── scripts/generator.js    Gerador SIMULADO de legendas e Reels
├── scripts/calendar.js     Calendário semanal com status
├── scripts/history.js      Histórico com busca e filtros
├── docs/roteiro-de-validacao.md   Como testar com 5–10 pessoas reais (Etapa 8)
├── docs/registro-de-testes.csv    Planilha para anotar os resultados
├── docs/guia-etapa-6-backend.md   Estudo de backend, Supabase, SQL e RLS (Etapa 6)
├── docs/guia-etapa-7-ia.md        Estudo de integração segura de IA (Etapa 7)
├── docs/guia-publicacao-teste.md  Como publicar link de teste (limites e idade)
└── README.md               Este arquivo
```

## Roteiro de teste rápido (Missão 01 do guia)

1. **Configurações → Carregar exemplos** (ou cadastre sua empresa em *Minha empresa*).
2. **Gerar legenda**: preencha e clique em *Gerar demonstração* → *Copiar* → *Editar e salvar*.
3. **Ideias para Reels**: gere 5 ideias e salve uma.
4. **Calendário**: clique em *+ Adicionar* em um dia, ou use *Planejar semana (demo)*. Clique em um item para mudar o status.
5. **Histórico**: busque, filtre, edite, copie e exclua.
6. Teste no celular: **F12 → Ctrl + Shift + M**.

## Regras de segurança deste projeto

- **Nunca** colocar chaves de API, senhas ou tokens em arquivos do frontend (HTML/CSS/JS) nem no GitHub.
- A geração com IA real deverá acontecer em um **servidor**, que guarda a chave secreta.
- O `localStorage` **não é seguro** como banco de dados. Use apenas dados fictícios.
- Não usar dados reais ou confidenciais de clientes nos testes.
- Todo texto deve ser revisado antes de publicar.

## Próximas fases (ainda não feitas)

| Fase | O que entra | Antes de começar, verificar |
|---|---|---|
| Validação | Testar com 5–10 pessoas do público-alvo | — |
| Backend | Banco de dados + login (ex.: Supabase) com RLS | Limites do plano gratuito, idade mínima e termos |
| IA | Função no servidor chamando um provedor de IA | Preço por uso, limites gratuitos, **idade mínima** (alguns exigem 18+), privacidade |
| Pagamentos | Assinatura mensal | Taxas, impostos, requisitos legais |

> Serviços com requisito de maioridade devem ser contratados e administrados por um **adulto autorizado**, sem contornar restrições.
