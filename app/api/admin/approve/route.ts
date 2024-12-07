import { sql } from '@vercel/postgres';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    const userRole = await sql`
      SELECT role FROM users WHERE clerk_id = ${userId};
    `;
    
    if (userRole.rows[0]?.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { contributionId } = await request.json();

    // Get the contribution
    const contribution = await sql`
      SELECT * FROM contributions WHERE id = ${contributionId};
    `;

    // Create master text entry
    await sql`
      INSERT INTO master_text (
        text,
        user_id,
        contribution_id,
        created_at
      ) VALUES (
        ${contribution.rows[0].text},
        ${contribution.rows[0].user_id},
        ${contributionId},
        NOW()
      );
    `;

    // Update contribution status
    await sql`
      UPDATE contributions 
      SET is_approved = true 
      WHERE id = ${contributionId};
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving contribution:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 