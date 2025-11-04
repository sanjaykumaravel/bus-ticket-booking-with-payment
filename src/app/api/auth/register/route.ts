import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate all required fields are present
    if (!name || !email || !password) {
      return NextResponse.json(
        { 
          error: 'Name, email, and password are required', 
          code: 'MISSING_FIELDS' 
        },
        { status: 400 }
      );
    }

    // Validate name length
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { 
          error: 'Name must be at least 2 characters', 
          code: 'INVALID_NAME' 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          error: 'Invalid email format', 
          code: 'INVALID_EMAIL' 
        },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { 
          error: 'Password must be at least 6 characters', 
          code: 'WEAK_PASSWORD' 
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { 
          error: 'Email already registered', 
          code: 'EMAIL_EXISTS' 
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create new user
    const newUser = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        name: trimmedName,
        password: hashedPassword,
        verified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    const createdUser = newUser[0];

    // Generate JWT token
    const secretKey = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
    const payload = {
      userId: createdUser.id,
      email: createdUser.email,
    };
    const token = jwt.sign(payload, secretKey, { expiresIn: '24h' });

    // Create session record
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await db
      .insert(sessions)
      .values({
        userId: createdUser.id,
        token: token,
        expiresAt: expiresAt,
        createdAt: new Date().toISOString(),
      })
      .returning();

    // Return success response
    return NextResponse.json(
      {
        success: true,
        token: token,
        user: {
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
          verified: createdUser.verified,
        },
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message,
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}