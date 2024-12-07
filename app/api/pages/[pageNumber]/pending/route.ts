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
        c.*,
        u.display_name as author_name
      FROM contributions c
      JOIN users u ON c.user_id = u.clerk_id
      WHERE c.page_number = ${pageNumber}
        AND c.is_approved = false
      ORDER BY c.created_at DESC;
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending contributions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 