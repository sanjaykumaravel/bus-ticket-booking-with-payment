import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, sessions } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'default-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    // Extract Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { 
          error: 'Authorization token required',
          code: 'MISSING_TOKEN' 
        },
        { status: 401 }
      );
    }

    // Validate Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'Authorization token required',
          code: 'MISSING_TOKEN' 
        },
        { status: 401 }
      );
    }

    // Extract token from Bearer format
    const token = authHeader.substring(7);

    if (!token) {
      return NextResponse.json(
        { 
          error: 'Authorization token required',
          code: 'MISSING_TOKEN' 
        },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return NextResponse.json(
          { 
            error: 'Invalid or expired token',
            code: 'INVALID_TOKEN' 
          },
          { status: 401 }
        );
      }
      if (error.name === 'JsonWebTokenError') {
        return NextResponse.json(
          { 
            error: 'Invalid or expired token',
            code: 'INVALID_TOKEN' 
          },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { 
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN' 
        },
        { status: 401 }
      );
    }

    // Extract userId from decoded token
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return NextResponse.json(
        { 
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN' 
        },
        { status: 401 }
      );
    }

    // Find session in sessions table and check expiration
    const currentTime = new Date().toISOString();
    const sessionResult = await db.select()
      .from(sessions)
      .where(
        and(
          eq(sessions.token, token),
          gt(sessions.expiresAt, currentTime)
        )
      )
      .limit(1);

    if (sessionResult.length === 0) {
      return NextResponse.json(
        { 
          error: 'Session expired or not found',
          code: 'SESSION_EXPIRED' 
        },
        { status: 401 }
      );
    }

    // Get user data from users table
    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const user = userResult[0];

    // Return user data excluding sensitive fields
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          verified: user.verified,
          createdAt: user.createdAt
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('GET /api/user error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message,
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}