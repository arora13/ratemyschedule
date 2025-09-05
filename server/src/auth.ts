import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// minimal user payload
export type JwtUser = { uid: string; role: "USER" | "ADMIN" };

declare global {
  // attach to Request in TS
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

export function signToken(payload: JwtUser) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.header("Authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) return res.status(401).json({ error: "unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET) as JwtUser;
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.header("Authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) return res.status(401).json({ error: "unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET) as JwtUser;
    if (decoded.role !== "ADMIN") return res.status(403).json({ error: "forbidden" });
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
}
