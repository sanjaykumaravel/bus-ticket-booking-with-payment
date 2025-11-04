import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    // Validate token is provided
    if (!token) {
      return NextResponse.json(
        { 
          error: 'Token is required',
          code: 'MISSING_TOKEN' 
        },
        { status: 400 }
      );
    }

    // Delete session from database
    const deletedSession = await db
      .delete(sessions)
      .where(eq(sessions.token, token))
      .returning();

    // Check if any session was deleted
    if (deletedSession.length === 0) {
      return NextResponse.json(
        { 
          error: 'Session not found',
          code: 'SESSION_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json(
      { 
        success: true,
        message: 'Logged out successfully' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}