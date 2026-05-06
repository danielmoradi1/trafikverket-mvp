import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import stationRoutes from './routes/stations'
import { initDb } from './db'
import 'dotenv/config'
import announcementRoutes from './routes/announcements'
import positionRoutes from './routes/positions'

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use('/api/announcements', announcementRoutes)
app.use('/api/positions', positionRoutes)

initDb()

app.use('/api/auth', authRoutes)
app.use('/api/stations', stationRoutes)
app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})