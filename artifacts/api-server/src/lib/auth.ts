import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET ?? "estatehq-dev-secret-change-in-prod";
const JWT_EXPIRES_IN = "30d";

export interface JwtPayload {
  userId: string;
  estateId: string;
  role: string;
  email: string;
  unitNumber?: string | null;
  firstName: string;
  lastName: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const token = auth.slice(7);
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
