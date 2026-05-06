import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth'

const router = Router()
const API_KEY = process.env.TRAFIKVERKET_API_KEY

router.get('/', requireAuth, async (_req: Request, res: Response) => {
  const MinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  const xml = `
    <REQUEST>
      <LOGIN authenticationkey="${API_KEY}"/>
      <QUERY objecttype="TrainPosition" namespace="järnväg.trafikinfo" schemaversion="1.1" limit="500">
        <FILTER>
          <GTE name="TimeStamp" value="${MinutesAgo}"/>
        </FILTER>
        <INCLUDE>Train</INCLUDE>
        <INCLUDE>Position</INCLUDE>
        <INCLUDE>TimeStamp</INCLUDE>
        <INCLUDE>Speed</INCLUDE>
        <INCLUDE>Bearing</INCLUDE>
      </QUERY>
    </REQUEST>
  `

  try {
    const response = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: xml,
    })

    const data = await response.json() as any
    const positions = data?.RESPONSE?.RESULT?.[0]?.TrainPosition ?? []
    return res.json({ positions })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Kunde inte hämta tågpositioner' })
  }
})

export default router