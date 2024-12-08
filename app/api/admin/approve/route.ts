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

    const { contributionId } = await request.json();
    const contributionIdNum = parseInt(contributionId);

    if (isNaN(contributionIdNum)) {
      return NextResponse.json(
        { message: 'Invalid contribution ID' },
        { status: 400 }
      );
    }

    // Get the contribution
    const contribution = await sql`
      SELECT * FROM contributions WHERE id = ${contributionIdNum};
    `;

    // Create master text entry
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
        ${contributionIdNum},
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
      WHERE id = ${contributionIdNum};
    `;

    // After approval, send notification
    await sql`
      INSERT INTO notifications (
        user_id,
        type,
        message,
        contribution_id,
        created_at
      ) VALUES (
        ${contribution.rows[0].user_id},
        'approval',
        'Your contribution has been approved!',
        ${contributionIdNum},
        NOW()
      );
    `;

    // Track edit history
    await sql`
      INSERT INTO edit_history (
        contribution_id,
        user_id,
        action,
        created_at
      ) VALUES (
        ${contributionIdNum},
        ${userId},
        'approved',
        NOW()
      );
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving contribution:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 