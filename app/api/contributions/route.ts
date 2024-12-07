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

    const { text, pageNumber, themes = [], cultural_references = [], historical_context = '' } = body;

    if (!text || !pageNumber) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First, check if the user exists in the users table
    const userCheck = await sql`
      SELECT id FROM users WHERE clerk_id = ${userId};
    `;

    if (userCheck.rows.length === 0) {
      // Create user if they don't exist
      await sql`
        INSERT INTO users (clerk_id, created_at)
        VALUES (${userId}, NOW());
      `;
    }

    try {
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
          ${JSON.stringify(themes)}::jsonb, 
          ${JSON.stringify(cultural_references)}::jsonb, 
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
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { 
          message: 'Database error',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in contribution handler:', error);
    return NextResponse.json(
      { 
        message: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 