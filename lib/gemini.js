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

    const prompt = `Extract the most important medical keywords and symptoms from this health description.
Return ONLY a comma-separated list of keywords (no explanations, no numbers, just the keywords).
Focus on: specific symptoms, body parts, pain types, duration, severity.

Description: "${description}"

Keywords:`;

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
  // Fallback: simple keyword extraction
  return description
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3);
}

/**
 * Find similar symptoms based on keywords
 * @param {string[]} keywords - Array of keywords from the current symptom
 * @param {Array} allSymptoms - All symptoms from the database
 * @returns {Array} Matched symptoms with similarity scores
 */
export function findSimilarSymptoms(keywords, allSymptoms) {
  return allSymptoms
    .map(symptom => {
      // Calculate similarity score based on keyword overlap
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
    .filter(symptom => symptom.similarityScore > 0.2) // At least 20% match
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
