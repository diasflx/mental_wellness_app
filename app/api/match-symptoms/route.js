import { NextResponse } from 'next/server';
import { findSimilarSymptomsWithAI } from '../../../lib/gemini';

export async function POST(request) {
  try {
    const { currentSymptom, allSymptoms } = await request.json();

    if (!currentSymptom || !allSymptoms) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log(`Matching symptom: "${currentSymptom.title}" against ${allSymptoms.length} other symptoms`);

    const matches = await findSimilarSymptomsWithAI(currentSymptom, allSymptoms);

    console.log(`Found ${matches.length} matches`);

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Error in match-symptoms API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to match symptoms' },
      { status: 500 }
    );
  }
}
