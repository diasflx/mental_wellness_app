import { NextResponse } from 'next/server';
import { extractKeywords } from '../../../lib/gemini';

export async function POST(request) {
  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const keywords = await extractKeywords(description);

    return NextResponse.json({ keywords });
  } catch (error) {
    console.error('Error in extract-keywords API:', error);
    return NextResponse.json(
      { error: 'Failed to extract keywords' },
      { status: 500 }
    );
  }
}
