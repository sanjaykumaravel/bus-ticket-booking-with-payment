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

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('auth-token');
  if (!token) return false;
  
  // Client-side: just check if token exists and user data is present
  // Don't verify JWT on client-side as it requires Node.js crypto modules
  const userStr = localStorage.getItem('user');
  if (!userStr) return false;
  
  try {
    const user = JSON.parse(userStr);
    return !!user && !!user.id;
  } catch {
    return false;
  }
}

export function getUser(): { id: number; email: string; name: string | null; verified: boolean } | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window === 'undefined') return;
  
  const token = localStorage.getItem('auth-token');
  if (token) {
    // Call logout API
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).catch(console.error);
  }
  
  localStorage.removeItem('auth-token');
  localStorage.removeItem('user');
}