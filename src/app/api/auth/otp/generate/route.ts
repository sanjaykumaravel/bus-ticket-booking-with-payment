import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, otpCodes } from '@/db/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendOTPEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999);
    const hashedOtp = bcrypt.hashSync(otp.toString(), 10);

    // Delete any existing unexpired OTP codes for this email
    const now = new Date().toISOString();
    await db
      .delete(otpCodes)
      .where(
        and(
          eq(otpCodes.email, normalizedEmail),
          gt(otpCodes.expiresAt, now),
          isNull(otpCodes.usedAt)
        )
      );

    // Check if user exists with this email
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    let userId: number;
    let userName: string | null = null;

    if (existingUser.length === 0) {
      // Create new user if doesn't exist
      const timestamp = new Date().toISOString();
      const newUser = await db
        .insert(users)
        .values({
          email: normalizedEmail,
          verified: false,
          createdAt: timestamp,
          updatedAt: timestamp,
        })
        .returning();

      userId = newUser[0].id;
      userName = newUser[0].name;
    } else {
      userId = existingUser[0].id;
      userName = existingUser[0].name;
    }

    // Set expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Insert OTP record into otp_codes table
    await db.insert(otpCodes).values({
      userId,
      hashedOtp,
      email: normalizedEmail,
      expiresAt,
      usedAt: null,
      attempts: 0,
      createdAt: new Date().toISOString(),
    });

    // Send OTP via email
    try {
      await sendOTPEmail(normalizedEmail, otp.toString(), userName);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Return success anyway - OTP is generated, user can try again
      return NextResponse.json(
        {
          success: true,
          message: 'OTP generated but email delivery may be delayed',
          email: normalizedEmail,
        },
        { status: 201 }
      );
    }

    // Return success response (do not include OTP in production)
    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent to your email',
        email: normalizedEmail,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}