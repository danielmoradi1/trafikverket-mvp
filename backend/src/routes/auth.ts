import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDb } from '../db'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'train-app-secret-change-in-prod'

// POST/api
// skapar en ny användare med bcrypt-hashat lösenord 
router.post('/register', async (req: Request, res: Response) => {
  const { username, email, password } = req.body
  // Validition for required fields and password length
  if (!username || !email || !password)
    return res.status(400).json({ error: 'Alla fält krävs' })
  if (password.length < 6)
    return res.status(400).json({ error: 'Lösenordet måste vara minst 6 tecken' })

  try {
    const db = getDb()
    // Kontrollerar om användaren redan finns 
    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email)
    if (existing)
      return res.status(409).json({ error: 'Användarnamn eller e-post redan registrerat' })

    // hasha lösenordet
    const hash = await bcrypt.hash(password, 12)
    const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, hash)
    
    // skapar en JWT-token med userID
    const token = jwt.sign({ userId: result.lastInsertRowid, username }, JWT_SECRET, { expiresIn: '8h' })
    return res.status(201).json({ token, user: { id: result.lastInsertRowid, username, email } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Serverfel vid registrering' })
  }
})

// post/api/auth/login -> loggar in en användare med användarnamn eller email och lösenord
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body
  if (!username || !password)
    return res.status(400).json({ error: 'Användarnamn och lösenord krävs' })

  try {
    const db = getDb()
    // Tillåter inloggning med både användarnamn och email
    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username) as any
    if (!user)
      return res.status(401).json({ error: 'Felaktiga inloggningsuppgifter' })

    // jämför det angivna lösen med det hashade lösenordet i db
    const match = await bcrypt.compare(password, user.password)
    if (!match)
      return res.status(401).json({ error: 'Felaktiga inloggningsuppgifter' })

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '8h' })
    return res.json({ token, user: { id: user.id, username: user.username, email: user.email } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Serverfel vid inloggning' })
  }
})
// get/api/auth 
// Används av frontend vid sidladdning för att återställa sessionen 
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Ingen token' })

  try {
    const token = authHeader.slice(7)
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number }
    const db = getDb()
    const user = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?').get(payload.userId)
    if (!user) return res.status(404).json({ error: 'Användare hittades inte' })
    return res.json({ user })
  } catch {
    return res.status(401).json({ error: 'Ogiltig token' })
  }
})

export default router