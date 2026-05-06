import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'train-app-secret-change-in-prod'

// Middleware som skyddar endpoints - körs innan route hantering
// verifierar att req har en giltig jwt-token
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  // token skickas som 'bearer <token>' i headern 
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Autentisering krävs' })

  try {
    const token = authHeader.slice(7)
    // kontrollerar token med jwt-secret, kastar fel om ogiltig
    ;(req as any).user = jwt.verify(token, JWT_SECRET)
    // annars fortsätter till route hanteringen
    next()
  } catch {
    return res.status(401).json({ error: 'Ogiltig token' })
  }
}