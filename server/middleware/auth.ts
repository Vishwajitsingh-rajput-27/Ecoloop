/**
 * Authentication Middleware — MongoDB/Mongoose version
 * Verifies JWT tokens and attaches user info to request.
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "ecoloop_dev_secret_change_in_production_32chars";

/** Generate a signed JWT */
export function generateToken(userId: string, role: string): string {
  return jwt.sign(
    { sub: userId, role, iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/** Verify and decode a JWT */
export function verifyToken(token: string): { sub: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: string; role: string };
  } catch {
    return null;
  }
}

/** Middleware: Require valid JWT — async Mongoose version */
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "No token provided." });
    return;
  }

  const token = authHeader.slice(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ success: false, error: "Invalid or expired token." });
    return;
  }

  try {
    const user = await User.findById(decoded.sub).select("_id role").lean();
    if (!user) {
      res.status(401).json({ success: false, error: "User not found." });
      return;
    }
    req.userId = (user._id as any).toString();
    req.userRole = user.role;
    next();
  } catch (err) {
    res.status(500).json({ success: false, error: "Auth check failed." });
  }
}

/** Middleware: Require specific role */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ success: false, error: "Insufficient permissions." });
      return;
    }
    next();
  };
}

/** Middleware: Optional auth */
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (decoded) {
      req.userId = decoded.sub;
      req.userRole = decoded.role;
    }
  }
  next();
}
