const SPECIALTY_RULES = [
  {
    specialty: 'Cardiology',
    confidence: 0.82,
    keywords: ['chest pain', 'heart', 'palpitation', 'blood pressure', 'shortness of breath'],
    advice: ['Avoid heavy exertion.', 'Track blood pressure if available.', 'Book a cardiology consult soon.'],
  },
  {
    specialty: 'Neurology',
    confidence: 0.78,
    keywords: ['headache', 'migraine', 'dizziness', 'seizure', 'numbness', 'stroke'],
    advice: ['Limit screen exposure and hydrate.', 'Avoid driving if dizziness persists.', 'Book a neurology consult.'],
  },
  {
    specialty: 'Orthopedics',
    confidence: 0.8,
    keywords: ['knee pain', 'back pain', 'joint', 'fracture', 'sprain', 'shoulder pain'],
    advice: ['Rest the affected area.', 'Apply cold pack in the first 24 hours if swollen.', 'Book orthopedics for evaluation.'],
  },
  {
    specialty: 'Pediatrics',
    confidence: 0.75,
    keywords: ['child', 'baby', 'infant', 'fever child', 'rash child'],
    advice: ['Monitor hydration and temperature.', 'Use age-appropriate medications only.', 'Consult pediatrics promptly.'],
  },
  {
    specialty: 'Dermatology',
    confidence: 0.74,
    keywords: ['rash', 'skin', 'itching', 'eczema', 'acne', 'hives'],
    advice: ['Avoid known irritants.', 'Keep skin moisturized and clean.', 'Consult dermatology if symptoms persist.'],
  },
  {
    specialty: 'Oncology',
    confidence: 0.65,
    keywords: ['lump', 'unexplained weight loss', 'persistent fatigue', 'blood in stool'],
    advice: ['Do not delay follow-up testing.', 'Maintain a symptom timeline.', 'Book specialist consultation quickly.'],
  },
  {
    specialty: 'Ophthalmology',
    confidence: 0.74,
    keywords: ['blurred vision', 'eye pain', 'red eye', 'vision loss'],
    advice: ['Avoid rubbing your eyes.', 'Reduce screen strain.', 'Consult ophthalmology for proper exam.'],
  },
  {
    specialty: 'General Medicine',
    confidence: 0.6,
    keywords: ['fever', 'cough', 'cold', 'fatigue', 'weakness'],
    advice: ['Rest and stay hydrated.', 'Monitor symptoms over 24-48 hours.', 'Book general physician if persistent.'],
  },
];

const RED_FLAG_RULES = [
  { phrase: 'severe chest pain', level: 'emergency', message: 'Severe chest pain can be life-threatening.' },
  { phrase: 'unable to breathe', level: 'emergency', message: 'Breathing difficulty needs emergency care.' },
  { phrase: 'loss of consciousness', level: 'emergency', message: 'Loss of consciousness needs urgent assessment.' },
  { phrase: 'one sided weakness', level: 'emergency', message: 'Possible stroke symptoms detected.' },
  { phrase: 'suicidal thoughts', level: 'emergency', message: 'Immediate mental health emergency support is required.' },
  { phrase: 'high fever', level: 'high', message: 'Persistent high fever should be assessed promptly.' },
  { phrase: 'blood in vomit', level: 'emergency', message: 'Blood in vomit needs urgent care.' },
];

const DISCLAIMER = 'This AI guidance is informational and not a diagnosis. For worsening symptoms, seek in-person medical care.';

const getUrgencyLevel = (text) => {
  const lower = text.toLowerCase();
  let level = 'medium'; // Default to 'medium' instead of 'low' for safer triage
  const redFlags = [];

  for (const rule of RED_FLAG_RULES) {
    if (lower.includes(rule.phrase)) {
      redFlags.push(rule.message);
      if (rule.level === 'emergency') return { urgencyLevel: 'emergency', redFlags };
      if (rule.level === 'high') level = 'high';
    }
  }

  if (lower.includes('severe') || lower.includes('intense pain')) level = level === 'high' ? 'high' : 'medium';
  return { urgencyLevel: level, redFlags };
};

const inferSpecialties = (symptomsText) => {
  const lower = symptomsText.toLowerCase();
  const matches = [];

  for (const rule of SPECIALTY_RULES) {
    const hitCount = rule.keywords.filter((keyword) => lower.includes(keyword)).length;
    if (hitCount > 0) {
      matches.push({
        specialty: rule.specialty,
        confidence: Math.min(0.95, Number((rule.confidence + hitCount * 0.03).toFixed(2))),
        reason: `Matched symptoms with ${rule.specialty} patterns.`,
        advice: rule.advice,
      });
    }
  }

  if (!matches.length) {
    return [{
      specialty: 'General Medicine',
      confidence: 0.55,
      reason: 'No exact specialist pattern matched; start with general physician.',
      advice: ['Track symptoms and duration.', 'Maintain hydration and rest.', 'Book a general consultation.'],
    }];
  }

  return matches.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
};

const triageWithRules = ({ symptomsText }) => {
  const { urgencyLevel, redFlags } = getUrgencyLevel(symptomsText);
  const matches = inferSpecialties(symptomsText);

  let nextStep = 'Book a routine consultation.';
  if (urgencyLevel === 'medium') nextStep = 'Book a consultation within 24-48 hours.';
  if (urgencyLevel === 'high') nextStep = 'Book a same-day consultation.';
  if (urgencyLevel === 'emergency') nextStep = 'Call emergency services or go to the nearest emergency room immediately.';

  const advice = Array.from(new Set(matches.flatMap((m) => m.advice))).slice(0, 6);

  return {
    urgencyLevel,
    recommendedSpecialties: matches.map(({ specialty, confidence, reason }) => ({ specialty, confidence, reason })),
    advice,
    redFlags,
    nextStep,
    disclaimer: DISCLAIMER,
    engineUsed: 'rules',
    model: '',
  };
};

module.exports = {
  triageWithRules,
  DISCLAIMER,
};

