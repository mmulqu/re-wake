import { sql } from '@vercel/postgres';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userRole = await sql`
      SELECT role FROM users WHERE clerk_id = ${userId};
    `;
    
    if (userRole.rows[0]?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const contributionId = parseInt(params.id);
    
    // Start transaction
    await sql`BEGIN`;

    // Get contribution
    const contribution = await sql`
      SELECT * FROM contributions WHERE id = ${contributionId};
    `;

    // Create master_text entry
    await sql`
      INSERT INTO master_text (
        text,
        user_id,
        contribution_id,
        order_index,
        created_at,
        approved_by,
        approved_at
      ) VALUES (
        ${contribution.rows[0].text},
        ${contribution.rows[0].user_id},
        ${contributionId},
        ${contribution.rows[0].page_number},
        NOW(),
        ${userId},
        NOW()
      );
    `;

    // Update contribution status
    await sql`
      UPDATE contributions 
      SET is_approved = true 
      WHERE id = ${contributionId};
    `;

    await sql`COMMIT`;

    return NextResponse.json({ success: true });
  } catch (error) {
    await sql`ROLLBACK`;
    console.error('Error approving contribution:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 