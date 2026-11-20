// =========================================================
// SocialFlow AI — Edge Function: generate-content (Etapa 7)
// ---------------------------------------------------------
// Esta função roda NO SERVIDOR (Supabase Edge Functions).
// A chave da Gemini API fica nos Secrets do servidor e
// NUNCA é enviada ao navegador.
// =========================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  starter: 50,
  pro: 150,
  premium: 300,
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanText(value: unknown, max = 300): string {
  return String(value ?? "").trim().slice(0, max);
}

function buildPrompt(mode: string, business: Record<string, unknown>, input: Record<string, unknown>): string {
  const nome = cleanText(business.name, 80);
  const segmento = cleanText(input.niche || business.niche, 60);
  const publico = cleanText(business.audience, 140);
  const tom = cleanText(input.tone || business.tone || "profissional", 40);
  const descricao = cleanText(business.description, 400) || "Não informada";
  const produto = cleanText(input.product, 80);
  const objetivo = cleanText(input.goal, 80);
  const rede = cleanText(input.platform || "Instagram", 40);
  const formato = cleanText(input.format || "feed", 40);

  if (mode === "caption") {
    return `Você é especialista em marketing digital e copywriting para pequenos negócios.
Crie uma publicação adequada às informações fornecidas.

EMPRESA
Nome: ${nome}
Segmento: ${segmento}
Público-alvo: ${publico}
Tom: ${tom}
Descrição: ${descricao}

PUBLICAÇÃO
Rede social: ${rede}
Produto/serviço: ${produto}
Objetivo: ${objetivo}
Formato: ${formato}

Regras:
1. Escreva em português natural e claro.
2. Adapte a linguagem ao público e ao canal.
3. Crie uma abertura interessante, uma mensagem útil e uma chamada para ação.
4. Não invente preços, descontos, depoimentos, resultados ou características.
5. Evite promessas garantidas e alegações enganosas.
6. Não inclua dados pessoais desnecessários.

Retorne SOMENTE um objeto JSON válido com estas chaves exatas:
{
  "title": "string",
  "caption": "string",
  "cta": "string",
  "hashtags": "string com hashtags separadas por espaço",
  "visual": "string com ideia visual"
}`;
  }

  if (mode === "reels") {
    return `Você é estrategista de conteúdo para vídeos curtos.
Crie 5 ideias originais para:
Empresa: ${nome}
Segmento: ${segmento}
Público: ${publico}
Produto/serviço: ${produto}
Objetivo: ${objetivo}

As ideias devem ser simples de produzir, adequadas ao segmento e não devem inventar preços, descontos, dados ou resultados garantidos.

Retorne SOMENTE um objeto JSON válido com esta chave exatas:
{
  "reels": [
    {
      "title": "string",
      "hook": "string (gancho inicial)",
      "scenes": ["cena 1", "cena 2", "cena 3", "cena 4"],
      "screenText": "string (texto na tela)",
      "caption": "string (legenda)",
      "cta": "string (chamada para ação)",
      "hashtags": "string"
    }
  ]
}`;
  }

  // mode === "calendar"
  return `Você é especialista em planejamento de conteúdo para pequenos negócios.
Monte um calendário de 7 dias para:
Empresa: ${nome}
Segmento: ${segmento}
Público: ${publico}
Produto/serviço em foco: ${produto}
Objetivo: ${objetivo}

Alterne entre conteúdo educativo, comercial, informativo e relacionamento.
Não repita temas, não invente datas comemorativas e não invente preços ou resultados garantidos.

Retorne SOMENTE um objeto JSON válido com esta chave exata (7 itens na lista):
{
  "days": [
    {
      "day": 1,
      "type": "Educativo | Comercial | Informativo | Relacionamento",
      "theme": "string",
      "idea": "string",
      "caption": "string",
      "cta": "string"
    }
  ]
}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const geminiKey = (Deno.env.get("GEMINI_API_KEY") ?? "").trim();

    if (!geminiKey) {
      return jsonResponse({ error: "Chave GEMINI_API_KEY não configurada nos Secrets do servidor." }, 500);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return jsonResponse({ error: "Você precisa estar logado para gerar conteúdo com IA." }, 401);
    }
    const user = userData.user;

    const body = await req.json();
    const mode = body?.mode;
    const business = body?.business ?? {};
    const input = body?.input ?? {};

    if (!["caption", "reels", "calendar"].includes(mode)) {
      return jsonResponse({ error: "Modo de geração inválido." }, 400);
    }
    if (!cleanText(business.name) || !cleanText(input.product) || !cleanText(input.goal)) {
      return jsonResponse({ error: "Preencha empresa, produto/serviço e objetivo." }, 400);
    }

    // Usa service_role apenas no servidor para ler plano e contar usos do mês
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: sub } = await adminClient
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle();

    const plan = sub?.plan && PLAN_LIMITS[sub.plan] ? sub.plan : "free";
    const limit = PLAN_LIMITS[plan];

    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const { count: usedCount, error: countError } = await adminClient
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString());

    if (countError) {
      return jsonResponse({ error: "Erro ao verificar limite de uso." }, 500);
    }

    const used = usedCount ?? 0;
    if (used >= limit) {
      return jsonResponse(
        { error: `Limite mensal do plano ${plan} atingido (${used}/${limit}).` },
        429
      );
    }

    const prompt = buildPrompt(mode, business, input);
    const models = ["gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.8-flash"];

    let geminiRes: Response | null = null;
    let timedOut = false;
    for (const model of models) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      timedOut = false;
      try {
        geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": geminiKey,
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.7,
              },
            }),
          }
        );
      } catch {
        clearTimeout(timer);
        timedOut = true;
        geminiRes = null;
        continue; // tenta o próximo modelo se este demorar mais de 10s
      }
      clearTimeout(timer);

      if (geminiRes.ok || ![404, 429, 503].includes(geminiRes.status)) break;
    }

    if (!geminiRes || !geminiRes.ok) {
      if (timedOut && !geminiRes) {
        return jsonResponse({ error: "A IA demorou muito para responder. Tente novamente em instantes." }, 504);
      }
      const status = geminiRes?.status ?? 502;
      const errText = geminiRes ? await geminiRes.text() : "";
      console.error("Gemini API error:", status, errText);
      let googleMsg = "";
      try {
        googleMsg = JSON.parse(errText)?.error?.message ?? "";
      } catch { /* ignorar */ }

      if (status === 429) {
        return jsonResponse({ error: "Muitas requisições no momento. Aguarde alguns segundos e tente de novo." }, 429);
      }
      if (status === 400 || status === 403) {
        return jsonResponse({ error: `Erro ${status} na Gemini API: ${googleMsg || "verifique a GEMINI_API_KEY nos Segredos."}` }, 502);
      }
      return jsonResponse({ error: `Erro ao chamar a IA (código ${status}): ${googleMsg || "veja os Logs no Supabase."}` }, 502);
    }

    const geminiJson = await geminiRes.json();
    const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return jsonResponse({ error: "A resposta da IA veio em formato inesperado. Tente novamente." }, 502);
    }

    // Registra 1 uso no banco somente após sucesso
    await adminClient.from("usage_events").insert({
      user_id: user.id,
      action: mode,
    });

    return jsonResponse({
      ok: true,
      ai: true,
      data: parsed,
      usage: { used: used + 1, limit, plan },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return jsonResponse({ error: "Erro interno no servidor ao gerar conteúdo." }, 500);
  }
});
