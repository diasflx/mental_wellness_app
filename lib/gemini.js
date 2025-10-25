import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. Keyword extraction will use fallback method.');
}
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Extract keywords from symptom description using Gemini
 * @param {string} description - The symptom description
 * @returns {Promise<string[]>} Array of keywords
 */
export async function extractKeywords(description) {
  try {
    // If no API key, use fallback immediately
    if (!genAI) {
      throw new Error('Gemini API not initialized');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a medical keyword extraction system. Extract ONLY medically relevant tags from this symptom description.

RULES:
- Extract ONLY medical terms: symptoms, body parts, conditions, pain types, severity levels
- DO NOT include: common words (and, the, with, this, after, etc.), articles, prepositions, conjunctions
- Return 3-8 most relevant medical keywords
- Use lowercase
- Separate with commas
- No explanations, just the keywords

Examples:
Input: "I have a severe headache with nausea that started this morning"
Output: headache, nausea, severe, morning

Input: "Pain in my lower back that radiates down my leg"
Output: pain, lower back, leg, radiating

Description: "${description}"

Medical Keywords:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the comma-separated keywords
    const keywords = text
      .split(',')
      .map(keyword => keyword.trim().toLowerCase())
      .filter(keyword => keyword.length > 0);

    return keywords.length > 0 ? keywords : getFallbackKeywords(description);
  } catch (error) {
    console.error('Error extracting keywords:', error);
    return getFallbackKeywords(description);
  }
}

function getFallbackKeywords(description) {
  // Common words to exclude
  const stopWords = new Set([
    'and', 'the', 'with', 'this', 'that', 'have', 'has', 'been', 'was', 'were',
    'are', 'for', 'from', 'but', 'not', 'what', 'when', 'where', 'who', 'why',
    'how', 'can', 'could', 'would', 'should', 'will', 'may', 'might', 'must',
    'about', 'after', 'before', 'during', 'since', 'until', 'while', 'into',
    'onto', 'over', 'under', 'above', 'below', 'between', 'among', 'through',
    'very', 'just', 'only', 'also', 'even', 'still', 'too', 'much', 'many',
    'some', 'any', 'all', 'both', 'each', 'every', 'few', 'more', 'most',
    'other', 'such', 'than', 'then', 'there', 'these', 'those', 'myself',
    'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves'
  ]);

  // Medical/health keywords
  const healthKeywords = [
    // Symptoms
    'pain', 'ache', 'sore', 'hurt', 'burning', 'tingling', 'numb', 'dizzy', 'nausea',
    'fever', 'cough', 'cold', 'fatigue', 'tired', 'weakness', 'swelling', 'rash',
    'itch', 'bleeding', 'discharge', 'vomiting', 'diarrhea', 'constipation',
    'headache', 'migraine', 'cramp', 'spasm', 'stiff', 'tender', 'pressure',
    'breathless', 'wheezing', 'congestion', 'runny', 'stuffy', 'sneezing',

    // Body parts
    'head', 'neck', 'shoulder', 'back', 'chest', 'stomach', 'abdomen', 'belly',
    'arm', 'hand', 'finger', 'leg', 'foot', 'toe', 'knee', 'elbow', 'wrist', 'ankle',
    'eye', 'ear', 'nose', 'throat', 'mouth', 'tooth', 'teeth', 'tongue', 'gum',
    'heart', 'lung', 'liver', 'kidney', 'skin', 'muscle', 'joint', 'bone',

    // Severity/Duration
    'severe', 'mild', 'moderate', 'chronic', 'acute', 'sudden', 'gradual',
    'constant', 'intermittent', 'persistent', 'occasional', 'frequent',
    'days', 'weeks', 'months', 'hours', 'morning', 'night', 'evening',

    // Descriptors
    'sharp', 'dull', 'throbbing', 'stabbing', 'shooting', 'radiating',
    'swollen', 'inflamed', 'red', 'bruised', 'infected'
  ];

  const words = description.toLowerCase()
    .split(/\s+/)
    .map(w => w.replace(/[^\w]/g, '')); // Remove punctuation

  const foundKeywords = words.filter(word => {
    // Must be longer than 2 characters
    if (word.length <= 2) return false;

    // Must not be a stop word
    if (stopWords.has(word)) return false;

    // Must match a health keyword
    return healthKeywords.some(keyword =>
      word.includes(keyword) || keyword.includes(word)
    );
  });

  // Remove duplicates and limit to 8
  return [...new Set(foundKeywords)].slice(0, 8);
}

/**
 * Use Gemini AI to find similar symptoms intelligently
 * @param {Object} currentSymptom - The current symptom to find matches for
 * @param {Array} allSymptoms - All symptoms from the database
 * @returns {Promise<Array>} Matched symptoms with AI-determined similarity scores
 */
export async function findSimilarSymptomsWithAI(currentSymptom, allSymptoms) {
  try {
    if (!genAI || allSymptoms.length === 0) {
      return findSimilarSymptomsFallback(currentSymptom, allSymptoms);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prepare symptom data for AI analysis
    const symptomsData = allSymptoms.slice(0, 20).map((s, idx) => ({
      index: idx,
      id: s.id,
      title: s.title,
      description: s.description.substring(0, 200) // Limit to avoid token limits
    }));

    const prompt = `You are a medical symptom matching system. Analyze the following symptom and determine which other symptoms from the list are most similar.

Current Symptom:
Title: "${currentSymptom.title}"
Description: "${currentSymptom.description}"

Other Symptoms to Compare:
${symptomsData.map(s => `[${s.index}] ${s.title}: ${s.description}`).join('\n')}

Return ONLY a JSON array of indices (numbers) for symptoms that are medically similar, ordered by similarity (most similar first). Include only symptoms with meaningful similarity.
Return an empty array [] if no similar symptoms exist.

Example response: [0, 3, 7]

Response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Parse the AI response
    const matches = JSON.parse(text);

    if (!Array.isArray(matches)) {
      throw new Error('Invalid AI response format');
    }

    // Map indices back to symptoms with similarity scores
    return matches
      .filter(idx => idx >= 0 && idx < symptomsData.length)
      .map((idx, position) => ({
        ...allSymptoms[idx],
        similarityScore: 1 - (position * 0.1), // Decreasing score based on position
        matchMethod: 'ai'
      }));

  } catch (error) {
    console.error('Error in AI symptom matching:', error);
    return findSimilarSymptomsFallback(currentSymptom, allSymptoms);
  }
}

/**
 * Fallback keyword-based matching when AI is unavailable
 * @param {Object} currentSymptom - The current symptom
 * @param {Array} allSymptoms - All symptoms from the database
 * @returns {Array} Matched symptoms with similarity scores
 */
function findSimilarSymptomsFallback(currentSymptom, allSymptoms) {
  const keywords = currentSymptom.symptoms_keywords || [];

  return allSymptoms
    .map(symptom => {
      const symptomKeywords = symptom.symptoms_keywords || [];
      const commonKeywords = keywords.filter(k =>
        symptomKeywords.some(sk => sk.includes(k) || k.includes(sk))
      );

      const similarityScore = commonKeywords.length / Math.max(keywords.length, 1);

      return {
        ...symptom,
        similarityScore,
        commonKeywords,
        matchMethod: 'keyword'
      };
    })
    .filter(symptom => symptom.similarityScore > 0.2)
    .sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * Legacy function for backward compatibility
 */
export function findSimilarSymptoms(keywords, allSymptoms) {
  return allSymptoms
    .map(symptom => {
      const symptomKeywords = symptom.symptoms_keywords || [];
      const commonKeywords = keywords.filter(k =>
        symptomKeywords.some(sk => sk.includes(k) || k.includes(sk))
      );

      const similarityScore = commonKeywords.length / Math.max(keywords.length, 1);

      return {
        ...symptom,
        similarityScore,
        commonKeywords
      };
    })
    .filter(symptom => symptom.similarityScore > 0.2)
    .sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * Generate helpful suggestions using Gemini
 * @param {string} symptoms - The symptom description
 * @param {Array} similarCases - Array of similar resolved cases
 * @returns {Promise<string>} AI-generated suggestions
 */
export async function generateSuggestions(symptoms, similarCases = []) {
  try {
    // If no API key, return default message
    if (!genAI) {
      throw new Error('Gemini API not initialized');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = `Based on these symptoms: "${symptoms}"\n\n`;

    if (similarCases.length > 0) {
      prompt += `Here are some similar cases that were resolved:\n`;
      similarCases.slice(0, 3).forEach((case_, idx) => {
        prompt += `${idx + 1}. ${case_.title}: ${case_.solution_text || 'Consulted with specialist'}\n`;
      });
      prompt += '\n';
    }

    prompt += `Provide brief, general wellness suggestions (3-4 points).
Remember to include a note that this is not medical advice and they should consult a healthcare professional if symptoms persist or worsen.
Keep it concise and supportive.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text || 'Unable to generate suggestions at this time. Please consult with a healthcare professional for personalized advice.';
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return 'Unable to generate suggestions at this time. Please consult with a healthcare professional for personalized advice.';
  }
}
