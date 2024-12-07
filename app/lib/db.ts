import { sql } from '@vercel/postgres';

export async function getPendingContributions() {
  const result = await sql`
    SELECT 
      c.*,
      u.display_name as author_name
    FROM contributions c
    JOIN users u ON c.user_id = u.clerk_id
    WHERE c.is_approved = false
    ORDER BY c.created_at DESC;
  `;
  return result.rows;
}

export async function getPageContent(pageNumber: number) {
  const result = await sql`
    SELECT 
      mt.*,
      u.display_name as author_name
    FROM master_text mt
    JOIN users u ON mt.user_id = u.clerk_id
    WHERE mt.order_index = ${pageNumber}
    ORDER BY mt.created_at ASC;
  `;
  return result.rows;
}

export async function getContributionHistory(userId: string) {
  const result = await sql`
    SELECT 
      c.*,
      CASE 
        WHEN c.is_approved THEN 'approved'
        ELSE 'pending'
      END as status
    FROM contributions c
    WHERE c.user_id = ${userId}
    ORDER BY c.created_at DESC;
  `;
  return result.rows;
} 