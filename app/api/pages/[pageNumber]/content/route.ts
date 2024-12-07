import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { pageNumber: string } }
) {
  try {
    const pageNumber = parseInt(params.pageNumber);
    const result = await sql`
      SELECT 
        mt.*,
        u.display_name as author_name
      FROM master_text mt
      JOIN users u ON mt.user_id = u.clerk_id
      WHERE mt.order_index = ${pageNumber}
      ORDER BY mt.created_at ASC;
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching page content:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 