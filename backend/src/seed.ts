import { getDb, initDb } from './db'
import * as fs from 'fs'
import * as path from 'path'

// Seeda stationer i databasen
initDb()

// read station data from Json file and insert into database
const filePath = path.join(__dirname, '../data/train-station.json')
const raw = fs.readFileSync(filePath, 'utf-8')
const json = JSON.parse(raw)

// Stationerna ligger i json.RESPONSE.RESULT och i trafikverkets format
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

// 
const insertMany = db.transaction(() => {
  for (const s of stations) {
    // koordinaterna kommer som WGS84-sträng 
    // Plockar ut lng och lat med regex
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