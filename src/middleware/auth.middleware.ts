import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
  userEmail?: string;
  userRol?: string;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret_cambiame';
    const decoded = jwt.verify(token, secret) as { userId: number; email: string; rol: string };
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRol = decoded.rol;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

// Middleware de verificación de rol
export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRol || !roles.includes(req.userRol)) {
      res.status(403).json({ error: 'Acceso denegado. No tienes permisos para esta acción.' });
      return;
    }
    next();
  };
};
