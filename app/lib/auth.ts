import { auth, currentUser } from '@clerk/nextjs';
import { sql } from '@vercel/postgres';

export async function syncUserWithDatabase() {
  try {
    const { userId } = auth();
    if (!userId) return null;

    const user = await currentUser();
    if (!user) return null;

    // Get primary email and better display name
    const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)?.emailAddress;
    const displayName = user.firstName 
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : primaryEmail?.split('@')[0] || user.username;

    // Update user record with Clerk/Google data
    await sql`
      INSERT INTO users (
        clerk_id,
        email,
        username,
        display_name,
        google_id,
        created_at,
        last_login,
        role
      ) VALUES (
        ${userId},
        ${primaryEmail},
        ${primaryEmail?.split('@')[0]},  -- Use email prefix as username
        ${displayName},
        ${user.externalAccounts[0]?.id || null},  -- Google ID if available
        NOW(),
        NOW(),
        'user'
      )
      ON CONFLICT (clerk_id) 
      DO UPDATE SET
        email = EXCLUDED.email,
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        google_id = EXCLUDED.google_id,
        last_login = NOW();
    `;

    return {
      id: userId,
      email: primaryEmail,
      displayName,
    };
  } catch (error) {
    console.error('Error syncing user:', error);
    return null;
  }
} 