type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
};

type GeminiListModelsResponse = {
  models?: Array<{
    name: string; // e.g. "models/gemini-1.5-flash"
    supportedGenerationMethods?: string[];
  }>;
  error?: { message?: string };
};

function normalizeModelName(name: string) {
  return name.startsWith('models/') ? name.slice('models/'.length) : name;
}

async function geminiListModels(apiKey: string) {
  const url = new URL('https://generativelanguage.googleapis.com/v1beta/models');
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString(), { method: 'GET' });
  const data = (await res.json().catch(() => ({}))) as GeminiListModelsResponse;

  if (!res.ok) {
    const message =
      data?.error?.message ||
      `Gemini ListModels error: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  const models = (data.models ?? []).map((m) => ({
    name: normalizeModelName(m.name),
    supportedGenerationMethods: m.supportedGenerationMethods ?? [],
  }));

  return models;
}

function pickGenerateContentModel(models: Array<{ name: string; supportedGenerationMethods: string[] }>) {
  const supported = models.filter((m) => m.supportedGenerationMethods.includes('generateContent'));
  const preferred = [
    // 新しめを優先（存在するものを使う）
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];

  for (const p of preferred) {
    const hit = supported.find((m) => m.name === p);
    if (hit) return hit.name;
  }
  return supported[0]?.name;
}

export async function geminiGenerateText(params: {
  prompt: string;
  apiKey: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  allowModelFallback?: boolean;
}) {
  const {
    prompt,
    apiKey,
    model,
    temperature = 0.7,
    maxOutputTokens = 2048,
    allowModelFallback = true,
  } = params;

  const tryGenerate = async (modelName: string) => {
    const url = new URL(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`
    );
    url.searchParams.set('key', apiKey);

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature,
          maxOutputTokens,
        },
      }),
    });

    const data = (await res.json().catch(() => ({}))) as GeminiGenerateContentResponse;
    return { res, data };
  };

  const initialModel = normalizeModelName(model ?? 'gemini-1.5-flash');
  let { res, data } = await tryGenerate(initialModel);

  if (!res.ok) {
    const message =
      data?.error?.message ||
      `Gemini API error: ${res.status} ${res.statusText}`;

    const looksLikeModelProblem =
      typeof message === 'string' &&
      (message.includes('is not found') ||
        message.includes('not supported for generateContent') ||
        message.includes('Call ListModels'));

    if (allowModelFallback && looksLikeModelProblem) {
      const models = await geminiListModels(apiKey);
      const picked = pickGenerateContentModel(models);
      if (!picked) {
        throw new Error(`GeminiのgenerateContent対応モデルが見つかりませんでした。ListModelsの結果を確認してください。`);
      }
      ({ res, data } = await tryGenerate(picked));
      if (!res.ok) {
        const message2 =
          data?.error?.message ||
          `Gemini API error: ${res.status} ${res.statusText}`;
        throw new Error(message2);
      }
    } else {
      throw new Error(message);
    }
  }

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? '')
      .join('') ?? '';

  return text.trim();
}


