import { auth, currentUser } from '@clerk/nextjs';
import { sql } from '@vercel/postgres';

export async function syncUserWithDatabase() {
  try {
    const { userId } = auth();
    if (!userId) return null;

    const user = await currentUser();
    if (!user) return null;

    // Get primary email and username
    const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)?.emailAddress;
    const username = user.username || user.firstName || primaryEmail?.split('@')[0];

    // Update user record with Clerk data
    await sql`
      INSERT INTO users (
        clerk_id,
        email,
        username,
        display_name,
        created_at,
        last_login,
        role
      ) VALUES (
        ${userId},
        ${primaryEmail},
        ${username},
        ${user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : username},
        NOW(),
        NOW(),
        'user'
      )
      ON CONFLICT (clerk_id) 
      DO UPDATE SET
        email = EXCLUDED.email,
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        last_login = NOW();
    `;

    return {
      id: userId,
      email: primaryEmail,
      username,
      displayName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : username,
    };
  } catch (error) {
    console.error('Error syncing user:', error);
    return null;
  }
} 