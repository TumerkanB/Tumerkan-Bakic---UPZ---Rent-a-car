import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError.js';

export interface AuthUser {
  tokenType?: 'staff';
  userID: number;
  username: string;
  email: string;
  roleID: number;
  roleName: string;
  branchID: number | null;
  branchName: string | null;
  permissions: string[];
  mustChangePassword?: boolean;
}

export interface AuthClient {
  tokenType: 'client';
  clientID: number;
  username: string;
  email: string;
  name: string;
  surname: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      client?: AuthClient;
    }
  }
}

function extractBearerToken(req: Request): string {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }
  return header.slice('Bearer '.length).trim();
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  try {
    const payload = jwt.verify(token, env.jwt.secret) as AuthUser | AuthClient;
    if (payload.tokenType === 'client') {
      throw new ForbiddenError('Staff credentials required');
    }
    req.user = payload as AuthUser;
    next();
  } catch (err) {
    if (err instanceof ForbiddenError) throw err;
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export function authenticateClient(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  try {
    const payload = jwt.verify(token, env.jwt.secret) as AuthClient | AuthUser;
    if (payload.tokenType !== 'client') {
      throw new ForbiddenError('Client credentials required');
    }
    req.client = payload;
    next();
  } catch (err) {
    if (err instanceof ForbiddenError) throw err;
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    if (!req.user.permissions.includes(permission)) {
      throw new ForbiddenError(`Missing required permission: ${permission}`);
    }
    next();
  };
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    if (!roles.includes(req.user.roleName)) {
      throw new ForbiddenError('Insufficient role privileges');
    }
    next();
  };
}

export function requireAdmin() {
  return requireRole('Admin');
}
