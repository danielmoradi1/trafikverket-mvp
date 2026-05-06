# Trafikverket MVP

## Funktioner
- Inloggning och registrering
- Karta med alla tågstationer som markers
- Sökbar tabell med stationer
- Ankomster och avgångar per station via Trafikverkets API

## Teknikstack
**Backend:** Node.js, TypeScript, Express, SQLite (better-sqlite3), JWT, bcrypt
**Frontend:** Vue 3, TypeScript, Pinia, Vue Router, Leaflet

### 2. Sätt upp backend
cd backend
npm install

Skapa en `.env`-fil i `backend/`-mappen:
API_KEY: Trafikverkets-API

#### Seeda database
npm run seed

npm run dev -> `http://localhost:3001`

### 2. Sätt upp backend
cd frontend
npm install

npm run dev -> `http://localhost:5173`