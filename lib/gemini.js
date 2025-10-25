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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    // Prepare symptom data for AI analysis - include full descriptions
    const symptomsData = allSymptoms.map((s, idx) => ({
      index: idx,
      id: s.id,
      title: s.title,
      description: s.description,
      status: s.status
    }));

    const prompt = `You are an expert medical symptom matching AI system. Your task is to analyze a patient's symptom description and identify ALL similar cases from a database of other symptom reports, then rank them by medical similarity.

## CURRENT SYMPTOM TO ANALYZE:
Title: "${currentSymptom.title}"
Full Description: "${currentSymptom.description}"

## DATABASE OF OTHER SYMPTOMS TO COMPARE AGAINST:
${symptomsData.map(s => `[Index ${s.index}]
Title: ${s.title}
Description: ${s.description}
Status: ${s.status}
---`).join('\n')}

## YOUR TASK:
1. Carefully read and understand the CURRENT SYMPTOM's description
2. Analyze each symptom in the database for medical similarity
3. Consider the following factors when determining similarity:
   - **Primary symptoms mentioned** (e.g., headache, pain, nausea, fever)
   - **Body parts/locations affected** (e.g., chest, abdomen, head, joints)
   - **Severity and intensity** (e.g., mild, severe, unbearable, chronic)
   - **Duration and timing** (e.g., 3 days, morning, constant, intermittent)
   - **Associated symptoms** (e.g., if someone has nausea with headache)
   - **Pattern and triggers** (e.g., after eating, during exercise, stress-related)
   - **Quality of symptoms** (e.g., sharp pain vs dull ache, throbbing vs stabbing)
   - **Medical context** (e.g., both mention recent illness, injury, medication)

4. Return a JSON object with this EXACT structure:
{
  "matches": [
    {
      "index": <number>,
      "similarity": <number between 0.0 and 1.0>,
      "reasoning": "<brief explanation of why this is similar>"
    }
  ]
}

## MATCHING CRITERIA:
- similarity 0.9-1.0: Nearly identical symptoms, same body part, similar severity and pattern
- similarity 0.7-0.89: Very similar core symptoms, may differ slightly in severity or duration
- similarity 0.5-0.69: Related symptoms or same body system, notable similarities
- similarity 0.3-0.49: Some overlapping symptoms but significant differences
- similarity 0.0-0.29: Minimal or weak connection

## IMPORTANT RULES:
- ONLY include matches with similarity >= 0.3
- Order matches by similarity (highest first)
- If NO similar symptoms exist (all < 0.3), return empty matches array: {"matches": []}
- Be medically accurate - don't force matches where none exist
- Consider the whole clinical picture, not just individual words
- Return ONLY valid JSON, no additional text or explanations outside the JSON

Response (JSON only):`;

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
