import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { pageNumber: string } }
) {
  try {
    const pageNumber = parseInt(params.pageNumber);
    console.log('Fetching content for page:', pageNumber);

    // Debug query
    const debug = await sql`
      SELECT 
        mt.id as master_text_id,
        mt.user_id as master_text_user_id,
        u.clerk_id,
        u.display_name,
        u.email,
        u.username
      FROM master_text mt
      LEFT JOIN users u ON mt.user_id = u.clerk_id
      WHERE mt.order_index = ${pageNumber};
    `;

    console.log('Debug JOIN results:', JSON.stringify(debug.rows, null, 2));

    // Main query
    const result = await sql`
      SELECT DISTINCT
        mt.id,
        mt.text,
        mt.order_index,
        mt.approvals,
        mt.user_id,
        mt.created_at,
        mt.contribution_id,
        mt.approved_at,
        COALESCE(
          u.display_name,
          u.email,
          u.username,
          u.clerk_id
        ) as author_name,
        COALESCE(
          approver.display_name,
          approver.email,
          approver.username,
          approver.clerk_id
        ) as approver_name
      FROM master_text mt
      LEFT JOIN users u ON mt.user_id = u.clerk_id
      LEFT JOIN users approver ON mt.approved_by = approver.clerk_id
      WHERE mt.order_index = ${pageNumber}
      ORDER BY mt.created_at ASC;
    `;

    if (result.rows.length === 0) {
      console.log('No content found for page:', pageNumber);
    } else {
      console.log('Found content:', result.rows);
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error in content route:', error);
    return NextResponse.json(
      { 
        message: 'Internal Server Error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        pageNumber: params.pageNumber
      },
      { status: 500 }
    );
  }
} 