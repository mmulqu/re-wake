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
        mt.id,
        mt.text,
        mt.order_index,
        mt.contribution_id,
        mt.created_at,
        u.display_name,
        u.clerk_id
      FROM master_text mt
      LEFT JOIN users u ON mt.user_id = u.clerk_id
      WHERE mt.order_index = ${pageNumber};
    `;

    console.log('Debug query results:', {
      pageNumber,
      resultsFound: debug.rows.length,
      results: debug.rows
    });

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
        COALESCE(u.display_name, u.username, u.clerk_id) as author_name
      FROM master_text mt
      LEFT JOIN users u ON mt.user_id = u.clerk_id
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