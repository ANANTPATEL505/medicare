const { DISCLAIMER } = require('./triageRules');

const parseJsonResponse = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw error;
    return JSON.parse(match[0]);
  }
};

const callGroqTriage = async ({ symptomsText, demographics = {} }) => {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured. Get free key at https://console.groq.com');
  }

  const model = process.env.GROQ_MODEL || 'mixtral-8x7b-32768';
  const timeoutMs = Number(process.env.TRIAGE_TIMEOUT_MS || 8000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const prompt = [
    'You are a medical triage assistant for routing and general advice only.',
    'Never provide diagnosis certainty. Return strict JSON only.',
    'JSON schema:',
    '{',
    '  "urgencyLevel": "low|medium|high|emergency",',
    '  "recommendedSpecialties": [{"specialty":"string","confidence":0.0,"reason":"string"}],',
    '  "advice": ["string"],',
    '  "redFlags": ["string"],',
    '  "nextStep": "string"',
    '}',
    `Symptoms: ${symptomsText}`,
    `Demographics: ${JSON.stringify(demographics)}`,
  ].join('\n');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 500,
        messages: [
          { role: 'system', content: 'Return valid JSON only.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Groq request failed: ${response.status} ${text}`);
    }

    const json = await response.json();
    const text = json?.choices?.[0]?.message?.content || '{}';
    const parsed = parseJsonResponse(text);

    return {
      urgencyLevel: parsed.urgencyLevel || 'medium',
      recommendedSpecialties: Array.isArray(parsed.recommendedSpecialties) ? parsed.recommendedSpecialties : [],
      advice: Array.isArray(parsed.advice) ? parsed.advice : [],
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
      nextStep: parsed.nextStep || 'Book a consultation with a qualified doctor.',
      disclaimer: DISCLAIMER,
      engineUsed: 'groq',
      model,
    };
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = {
  callGroqTriage,
};

