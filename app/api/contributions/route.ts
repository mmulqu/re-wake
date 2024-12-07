import { sql } from '@vercel/postgres';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { text, pageNumber, themes, cultural_references, historical_context } = await request.json();

    const result = await sql`
      INSERT INTO contributions (
        text, 
        user_id, 
        themes, 
        cultural_references, 
        historical_context,
        is_approved
      ) VALUES (
        ${text}, 
        ${userId}, 
        ${themes}, 
        ${cultural_references}, 
        ${historical_context},
        false
      ) RETURNING id;
    `;

    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error creating contribution:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 