import { Router, Request, Response } from 'express'
import { getDb } from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()

/**
 * get/api/Stations
 * Hämtar alla annonserade stationer från db sorterar i alfabetisk ordning
 * Kräver inloggning via requireAuth-middleware 
 */
router.get('/', requireAuth, (_req: Request, res: Response) => {
  const db = getDb()

  // Hämtar bara annonserade stationer (advertised = 1)
  const stations = db.prepare(`
    SELECT id, location_signature, advertised_name, short_name, lat, lng, platform_lines
    FROM train_stations
    WHERE advertised = 1
    ORDER BY advertised_name ASC
  `).all()

  return res.json({ stations })
})

export default router