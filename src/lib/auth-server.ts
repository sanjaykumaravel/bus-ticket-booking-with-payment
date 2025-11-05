// Server-side authentication utilities
// This file should ONLY be imported in API routes (not client components)

import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'default-secret-key-change-in-production';

export interface JWTPayload {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function generateToken(payload: { userId: number; email: string }): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
}
