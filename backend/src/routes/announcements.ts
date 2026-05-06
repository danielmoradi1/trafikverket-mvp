import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/auth'

const router = Router()

const API_KEY = process.env.TRAFIKVERKET_API_KEY

router.get('/:signature', requireAuth, async (req: Request, res: Response) => {
  const { signature } = req.params
  const type = (req.query.type as string) || 'departure'

  const now = new Date().toISOString()
  

  const xml = `
  <REQUEST>
    <LOGIN authenticationkey="${API_KEY}"/>
    <QUERY objecttype="TrainAnnouncement" namespace="rail.trafficinfo" schemaversion="2" limit="20" orderby="AdvertisedTimeAtLocation asc">
      <FILTER>
        <AND>
          <EQ name="LocationSignature" value="${signature}"/>
          <EQ name="ActivityType" value="${type === 'arrival' ? 'Ankomst' : 'Avgang'}"/>
          <GTE name="AdvertisedTimeAtLocation" value="${now}"/>
        </AND>
      </FILTER>
      <INCLUDE>AdvertisedTrainIdent</INCLUDE>
      <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
      <INCLUDE>EstimatedTimeAtLocation</INCLUDE>
      <INCLUDE>TrackAtLocation</INCLUDE>
      <INCLUDE>ToLocation</INCLUDE>
      <INCLUDE>FromLocation</INCLUDE>
      <INCLUDE>ActivityType</INCLUDE>
      <INCLUDE>Canceled</INCLUDE>
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
    const announcements = data?.RESPONSE?.RESULT?.[0]?.TrainAnnouncement ?? []
    return res.json({ announcements })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Kunde inte hämta tågannonser' })
  }
})

export default router