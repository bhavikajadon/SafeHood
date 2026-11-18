# SafeHood

**Community safety, made visible.**

SafeHood is a community-centred urban safety platform designed to bring neighbourhood safety signals into one clear view. It helps residents, students and people navigating unfamiliar places make more informed decisions.

## What it does

- **Interactive safety map** — explore reported incidents and safety-zone signals on a city map.
- **Community reporting** — authenticated users can share local safety observations.
- **Live updates** — Socket.IO delivers newly submitted reports to connected map sessions.
- **Community forum** — share warnings, tips and questions with neighbours.
- **Emergency resources** — quick access to key India emergency helplines and location sharing.

Safety information is community-reported and may be incomplete. SafeHood is an awareness tool, not a guarantee of safety or a replacement for emergency services.

## Technology

- Frontend: React 19, Vite, React Router, React Leaflet, Leaflet
- Backend: Node.js, Express, MongoDB / Mongoose, Socket.IO
- Authentication: JWT
- Map tiles: OpenStreetMap

## Project structure

```
.
├── frontend/   # React + Vite application
├── backend/    # Express API and Socket.IO server
└── vercel.json # Vercel frontend build and SPA routing
```

## Run locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` and `/socket.io` to `http://localhost:5000`.

### Backend

```bash
cd backend
npm install
```

Configure the backend environment (MongoDB connection string and JWT secret), then run:

```bash
npm run dev
```

## Deploy the frontend to Vercel

1. Import this GitHub repository into Vercel.
2. Set the project root to the repository root (not the `frontend` subfolder).
3. The root `vercel.json` installs frontend dependencies, runs the Vite production build and publishes `frontend/dist`. It also rewrites client-side routes to `index.html`.
4. In Vercel project settings, add:
   - `VITE_API_BASE_URL` — the origin of your deployed Express API, for example `https://your-api.example.com`.
   - `VITE_SOCKET_URL` — the Socket.IO server origin. It can be the same as `VITE_API_BASE_URL`.
5. Deploy again after setting environment variables.

### Important backend note

Vercel configuration here deploys the React frontend only. The Express API, MongoDB database and Socket.IO server need to be deployed and configured separately on a host that supports the backend's runtime and persistent Socket.IO connections. Set the backend's `CLIENT_URL` to the deployed Vercel site origin and configure its MongoDB connection string and JWT secret. The local Vite proxy is for development only; it is not used in production.

## Status

SafeHood is an actively developed portfolio implementation. Some data ingestion, analytical and predictive components described in the broader concept are planned or research-stage capabilities and should not be interpreted as production guarantees.
