const { triageWithRules } = require('./triageRules');
const { callGroqTriage } = require('./triageAI');

const triageEngine = async ({ symptomsText, demographics = {} }) => {
  // Always try AI first, then fallback to rules with logging
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (apiKey) {
    try {
      const aiResult = await callGroqTriage({ symptomsText, demographics });
      return { ...aiResult, engine: 'hybrid' };
    } catch (error) {
      console.error('[TRIAGE] Groq API failed, falling back to rules:', error.message);
      const rulesResult = triageWithRules({ symptomsText, demographics });
      return { ...rulesResult, engine: 'hybrid-fallback', fallbackReason: error.message };
    }
  } else {
    console.warn('[TRIAGE] No GROQ_API_KEY configured, using rules engine');
    const rulesResult = triageWithRules({ symptomsText, demographics });
    return { ...rulesResult, engine: 'rules' };
  }
}

module.exports = {
  triageEngine,
};

