// app/api/save/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@vercel/postgres';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = createClient();
    const body = await request.json();
    const { text, metadata } = body;

    await client.connect();

    // First, ensure user exists in our database
    const userResult = await client.sql`
      INSERT INTO users (clerk_id, created_at)
      VALUES (${userId}, NOW())
      ON CONFLICT (clerk_id) 
      DO UPDATE SET last_login = NOW()
      RETURNING id;
    `;

    const dbUserId = userResult.rows[0].id;

    // Then save the contribution
    await client.sql`
      INSERT INTO contributions (
        text,
        themes,
        cultural_references,
        historical_context,
        user_id,
        is_approved,
        created_at
      ) VALUES (
        ${text},
        ${metadata.themes},
        ${metadata.references},
        ${metadata.historicalContext},
        ${dbUserId},
        false,
        NOW()
      )
    `;

    await client.end();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to save contribution' },
      { status: 500 }
    );
  }
}
