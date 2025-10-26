import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. Symptom matching will be unavailable.');
}
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;


/**
 * Use Gemini AI to find similar symptoms intelligently with detailed content analysis
 * @param {Object} currentSymptom - The current symptom to find matches for
 * @param {Array} allSymptoms - All symptoms from the database
 * @returns {Promise<Array>} Matched symptoms with AI-determined similarity scores, ordered by similarity
 */
export async function findSimilarSymptomsWithAI(currentSymptom, allSymptoms) {
  try {
    if (!genAI || allSymptoms.length === 0) {
      return [];
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prepare symptom data for AI analysis - include full descriptions
    const symptomsData = allSymptoms.map((s, idx) => ({
      index: idx,
      id: s.id,
      title: s.title,
      description: s.description,
      status: s.status
    }));

    const prompt = `You are an expert medical symptom matching AI system. Analyze a patient's symptom and find ALL medically similar cases from the database.

## CURRENT SYMPTOM:
Title: "${currentSymptom.title}"
Description: "${currentSymptom.description}"

## DATABASE (${symptomsData.length} symptoms):
${symptomsData.map(s => `[${s.index}] "${s.title}" - ${s.description}`).join('\n')}

## MATCHING CRITERIA:
Evaluate similarity based on these factors (in order of importance):
1. **Same primary symptom** (headache, pain, nausea, fever, etc.)
2. **Same body location** (chest, head, abdomen, joints, etc.)
3. **Similar severity** (mild, moderate, severe, chronic)
4. **Similar duration** (acute, days, weeks, chronic)
5. **Shared associated symptoms**
6. **Similar triggers/patterns**
7. **Similar quality** (sharp, dull, throbbing, burning)

## SIMILARITY SCORING:
- **1.0**: Identical or nearly identical symptoms and location
- **0.9**: Same main symptom + location, very similar details
- **0.8**: Same main symptom + location, different severity/duration
- **0.7**: Same main symptom, different location or different symptom + same location
- **0.6**: Related symptoms, same body system
- **0.5**: Similar symptom type but different presentation
- **0.4**: Some medical overlap
- **0.3**: Weak but notable connection
- **<0.3**: Not medically similar (exclude)

## CRITICAL RULES:
1. If two posts describe the SAME symptom (e.g., both headaches), similarity MUST be >= 0.7
2. IDENTICAL posts MUST score 1.0
3. Include ALL matches >= 0.3 (don't artificially limit)
4. Order by similarity (highest first)
5. Always provide reasoning explaining the match

## RESPONSE FORMAT (JSON only, no markdown):
{
  "matches": [
    {"index": 0, "similarity": 0.95, "reasoning": "Both describe severe headache with nausea in the morning"},
    {"index": 2, "similarity": 0.75, "reasoning": "Same headache symptom but different severity"}
  ]
}

If NO matches >= 0.3 exist, return: {"matches": []}

JSON Response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the AI response
    const parsed = JSON.parse(text);

    if (!parsed.matches || !Array.isArray(parsed.matches)) {
      throw new Error('Invalid AI response format - missing matches array');
    }

    // Map indices back to symptoms with similarity scores, ordered by similarity
    return parsed.matches
      .filter(match => match.index >= 0 && match.index < symptomsData.length && match.similarity >= 0.3)
      .sort((a, b) => b.similarity - a.similarity) // Sort by similarity descending
      .map(match => ({
        ...allSymptoms[match.index],
        similarityScore: match.similarity,
        matchReasoning: match.reasoning,
        matchMethod: 'ai-advanced'
      }));

  } catch (error) {
    console.error('Error in AI symptom matching:', error);
    console.error('Error details:', error.message);
    return [];
  }
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
