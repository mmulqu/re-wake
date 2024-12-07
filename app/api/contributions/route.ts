import { sql } from '@vercel/postgres';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Received contribution:', body);

    const { text, pageNumber, themes, cultural_references, historical_context } = body;

    if (!text || !pageNumber) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO contributions (
        text, 
        user_id, 
        page_number,
        themes, 
        cultural_references, 
        historical_context,
        is_approved,
        created_at
      ) VALUES (
        ${text}, 
        ${userId}, 
        ${pageNumber},
        ${JSON.stringify(themes)}, 
        ${JSON.stringify(cultural_references)}, 
        ${historical_context},
        false,
        NOW()
      ) RETURNING id, created_at;
    `;

    console.log('Contribution saved:', result.rows[0]);

    return NextResponse.json({
      id: result.rows[0].id,
      message: 'Contribution submitted successfully'
    });
  } catch (error) {
    console.error('Error creating contribution:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 