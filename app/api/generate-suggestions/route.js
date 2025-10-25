import { NextResponse } from 'next/server';
import { generateSuggestions } from '../../../lib/gemini';

export async function POST(request) {
  try {
    const { symptoms, similarCases } = await request.json();

    if (!symptoms) {
      return NextResponse.json(
        { error: 'Symptoms are required' },
        { status: 400 }
      );
    }

    const suggestions = await generateSuggestions(symptoms, similarCases || []);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error in generate-suggestions API:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
