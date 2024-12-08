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
    const masterText = await sql`
      WITH previous_text AS (
        SELECT text FROM master_text WHERE id = ${contribution.rows[0].previous_text_id}
      )
      INSERT INTO master_text (
        text,
        user_id,
        contribution_id,
        order_index,
        created_at,
        approved_by,
        approved_at,
        position_after
      ) VALUES (
        ${contribution.rows[0].text},
        ${contribution.rows[0].user_id},
        ${contributionId},
        ${contribution.rows[0].page_number},
        NOW(),
        ${userId},
        NOW(),
        ${contribution.rows[0].previous_text_id}
      ) RETURNING id;
    `;

    // Update contribution status (but don't delete)
    await sql`
      UPDATE contributions 
      SET status = 'approved'
      WHERE id = ${contributionId};
    `;

    // Record the action
    await sql`
      INSERT INTO edit_actions (
        contribution_id,
        master_text_id,
        action_type,
        performed_by,
        previous_status,
        new_status
      ) VALUES (
        ${contributionId},
        ${masterText.rows[0].id},
        'approve',
        ${userId},
        'pending',
        'approved'
      );
    `;

    // Add notification
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
        ${contributionId},
        NOW()
      );
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