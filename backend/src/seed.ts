import { getDb, initDb } from './db'
import * as fs from 'fs'
import * as path from 'path'

initDb()

const filePath = path.join(__dirname, '../data/train-station.json')
const raw = fs.readFileSync(filePath, 'utf-8')
const json = JSON.parse(raw)

const stations = json.RESPONSE.RESULT[0].TrainStation

const db = getDb()

const insert = db.prepare(`
  INSERT OR IGNORE INTO train_stations (
    location_signature,
    advertised_name,
    short_name,
    primary_location_code,
    lat,
    lng,
    platform_lines,
    advertised,
    prognosticated,
    modified_time
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const insertMany = db.transaction(() => {
  for (const s of stations) {
    const coords = s.Geometry?.WGS84?.match(/-?[\d.]+/g)
    const lng = coords ? parseFloat(coords[0]) : null
    const lat = coords ? parseFloat(coords[1]) : null

    insert.run(
      s.LocationSignature,
      s.AdvertisedLocationName,
      s.AdvertisedShortLocationName,
      s.PrimaryLocationCode,
      lat,
      lng,
      JSON.stringify(s.PlatformLine ?? []),
      s.Advertised ? 1 : 0,
      s.Prognosticated ? 1 : 0,
      s.ModifiedTime ?? null
    )
  }
})

insertMany()
console.log(`✓ Seedade ${stations.length} stationer`)