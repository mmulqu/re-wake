import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { pageNumber: string } }
) {
  try {
    const pageNumber = parseInt(params.pageNumber);
    
    // Log for debugging
    console.log('Fetching content for page:', pageNumber);
    
    const result = await sql`
      SELECT 
        mt.id,
        mt.text,
        mt.order_index,
        mt.approvals,
        mt.user_id,
        mt.created_at,
        mt.contribution_id,
        u.display_name as author_name
      FROM master_text mt
      JOIN users u ON mt.user_id = u.clerk_id
      WHERE mt.order_index = ${pageNumber}
      ORDER BY mt.created_at ASC;
    `;

    // Log the result
    console.log('Query result:', result.rows);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching page content:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 