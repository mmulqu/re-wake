import { syncUserWithDatabase } from '@/app/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const result = await syncUserWithDatabase();
    if (!result) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { message: 'Failed to sync user' },
      { status: 500 }
    );
  }
} 