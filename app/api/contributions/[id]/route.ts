import { sql } from '@vercel/postgres';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function PUT(
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

    const contributionId = parseInt(params.id);
    const { text, themes, cultural_references, historical_context } = await request.json();

    // Start transaction
    await sql`BEGIN`;

    // Get the original contribution
    const originalContribution = await sql`
      SELECT * FROM contributions WHERE id = ${contributionId}
    `;

    if (originalContribution.rows.length === 0) {
      await sql`ROLLBACK`;
      return NextResponse.json(
        { message: 'Contribution not found' },
        { status: 404 }
      );
    }

    // Update the contribution
    const result = await sql`
      UPDATE contributions
      SET 
        text = ${text},
        themes = ${JSON.stringify(themes)}::jsonb,
        cultural_references = ${JSON.stringify(cultural_references)}::jsonb,
        historical_context = ${historical_context},
        metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{last_edited}',
          to_jsonb(NOW())
        ),
        revision_number = COALESCE(revision_number, 1) + 1
      WHERE id = ${contributionId}
      RETURNING *;
    `;

    // Record in edit history
    await sql`
      INSERT INTO edit_history (
        contribution_id,
        user_id,
        action,
        previous_text,
        new_text,
        metadata
      ) VALUES (
        ${contributionId},
        ${userId},
        'edited',
        ${originalContribution.rows[0].text},
        ${text},
        ${JSON.stringify({
          themes_changed: true,
          cultural_references_changed: true,
          historical_context_changed: true,
          timestamp: new Date()
        })}
      );
    `;

    await sql`COMMIT`;

    return NextResponse.json({
      message: 'Contribution updated successfully',
      contribution: result.rows[0]
    });

  } catch (error) {
    await sql`ROLLBACK`;
    console.error('Error updating contribution:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 