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

    // Get contribution for notification
    const contribution = await sql`
      SELECT user_id FROM contributions WHERE id = ${contributionId};
    `;

    // Add rejection record
    await sql`
      INSERT INTO edit_history (
        contribution_id,
        user_id,
        action,
        created_at
      ) VALUES (
        ${contributionId},
        ${userId},
        'rejected',
        NOW()
      );
    `;

    // Delete the contribution
    await sql`
      DELETE FROM contributions 
      WHERE id = ${contributionId};
    `;

    // Add notification for user
    await sql`
      INSERT INTO notifications (
        user_id,
        type,
        message,
        contribution_id,
        created_at
      ) VALUES (
        ${contribution.rows[0].user_id},
        'rejection',
        'Your contribution was not approved.',
        ${contributionId},
        NOW()
      );
    `;

    await sql`COMMIT`;

    return NextResponse.json({ success: true });
  } catch (error) {
    await sql`ROLLBACK`;
    console.error('Error rejecting contribution:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 