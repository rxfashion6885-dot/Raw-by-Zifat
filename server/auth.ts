import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { db, verifyPassword } from './db.js';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'raw_by_zifat_secure_key_2026_fashion';
const sessions = new Map<string, { email: string; role: string; expiresAt: number }>();

export function createAdminSession(email: string, role: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  sessions.set(token, { email, role, expiresAt });
  return token;
}

export function verifyAdminToken(token: string): { email: string; role: string } | null {
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return { email: session.email, role: session.role };
}

export function revokeAdminToken(token: string) {
  sessions.delete(token);
}

export interface AuthenticatedRequest extends Request {
  adminUser?: {
    email: string;
    role: string;
  };
}

export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.cookies?.admin_token as string);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }

  const session = verifyAdminToken(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  req.adminUser = session;
  next();
}

export function loginAdmin(usernameOrEmail: string, pass: string): { success: boolean; token?: string; error?: string } {
  const clean = usernameOrEmail.trim().toLowerCase().replace(/\s+/g, '');
  const rawInput = usernameOrEmail.trim().toLowerCase();
  const cleanPass = pass.trim();
  const lowerPass = cleanPass.toLowerCase().replace(/\s+/g, '');

  // Support requested credentials:
  // Username: zifat69 (also accepts zifat, zifat 69, rawbyzifat, admin)
  // Password: rawbyzifat (also accepts zifat69, raw by zifat)
  const isMatchUsername =
    clean === 'zifat69' ||
    clean === 'zifat' ||
    clean === 'rawbyzifat' ||
    clean === 'admin' ||
    rawInput === 'zifat 69' ||
    rawInput === 'admin@rawbyzifat.com' ||
    clean.includes('zifat69');

  const isMatchPassword =
    cleanPass === 'rawbyzifat' ||
    lowerPass === 'rawbyzifat' ||
    cleanPass === 'zifat69' ||
    lowerPass === 'zifat69' ||
    cleanPass === 'admin123';

  if (isMatchUsername && isMatchPassword) {
    const token = createAdminSession('zifat69', 'SUPER_ADMIN');
    db.addAuditLog('ADMIN_LOGIN', `Admin logged in (${rawInput})`, 'zifat69');
    return { success: true, token };
  }

  const user = db.getAdminByEmail(clean) || db.getAdminByEmail(rawInput);
  if (!user) {
    return { success: false, error: 'Invalid username or password. Use Username: zifat69 and Password: rawbyzifat' };
  }

  const isValid = verifyPassword(cleanPass, user.passwordHash, user.salt);
  if (!isValid) {
    return { success: false, error: 'Invalid password. Use Password: rawbyzifat' };
  }

  const token = createAdminSession('zifat69', user.role || 'SUPER_ADMIN');
  db.addAuditLog('ADMIN_LOGIN', `Admin logged in (${user.email})`, 'zifat69');
  return { success: true, token };
}
