import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, otpCodes, sessions } from '@/db/schema';
import { eq, and, isNull, desc, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'default-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    // Validate required fields
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be 6 digits', code: 'INVALID_OTP_FORMAT' },
        { status: 400 }
      );
    }

    // Find the latest unexpired, unused OTP for the email
    const currentTime = new Date().toISOString();
    const otpRecords = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.email, email),
          isNull(otpCodes.usedAt),
          gt(otpCodes.expiresAt, currentTime)
        )
      )
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);

    if (otpRecords.length === 0) {
      return NextResponse.json(
        { error: 'No valid OTP found for this email', code: 'OTP_NOT_FOUND' },
        { status: 404 }
      );
    }

    const otpRecord = otpRecords[0];

    // Check if OTP is expired
    if (new Date(otpRecord.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'OTP has expired', code: 'OTP_EXPIRED' },
        { status: 400 }
      );
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 5) {
      // Mark OTP as used
      await db
        .update(otpCodes)
        .set({
          usedAt: new Date().toISOString(),
        })
        .where(eq(otpCodes.id, otpRecord.id));

      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new OTP.', code: 'TOO_MANY_ATTEMPTS' },
        { status: 400 }
      );
    }

    // Verify OTP using bcrypt
    const isValidOtp = bcrypt.compareSync(otp, otpRecord.hashedOtp);

    if (!isValidOtp) {
      // Increment attempts counter
      const newAttempts = otpRecord.attempts + 1;
      await db
        .update(otpCodes)
        .set({
          attempts: newAttempts,
        })
        .where(eq(otpCodes.id, otpRecord.id));

      return NextResponse.json(
        {
          error: 'Invalid OTP',
          code: 'INVALID_OTP',
          attemptsRemaining: 5 - newAttempts,
        },
        { status: 400 }
      );
    }

    // OTP is valid - mark as used
    await db
      .update(otpCodes)
      .set({
        usedAt: new Date().toISOString(),
      })
      .where(eq(otpCodes.id, otpRecord.id));

    // Update user verification status
    const updatedUsers = await db
      .update(users)
      .set({
        verified: true,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, otpRecord.userId!))
      .returning();

    const user = updatedUsers[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    // Calculate session expiration (24 hours from now)
    const sessionExpiresAt = new Date();
    sessionExpiresAt.setHours(sessionExpiresAt.getHours() + 24);

    // Create session record
    await db.insert(sessions).values({
      userId: user.id,
      token: token,
      expiresAt: sessionExpiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        token: token,
        userId: user.id,
        email: user.email,
        name: user.name,
        verified: user.verified,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message, code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}