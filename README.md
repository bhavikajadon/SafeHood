# SafeHood

**Community safety, made visible.**

SafeHood is a community-centred urban safety application for exploring local safety information, submitting community reports, sharing neighbourhood tips, and reaching emergency contacts.

> **Important:** SafeHood is an awareness tool, not an emergency response service. Community submissions can be incomplete or inaccurate. Preloaded Chennai map fixtures are illustrative demo data, not verified incident records or official safety ratings.

## Features

- Interactive Leaflet map with filters for incident categories
- Location-aware incident reporting for signed-in users
- Live new-report events using Socket.IO
- Community forum for warnings, tips, and questions
- India emergency contact shortcuts and location sharing
- JWT-based registration and sign-in

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router |
| Maps | React Leaflet, Leaflet, OpenStreetMap |
| API | Node.js, Express 5 |
| Database | MongoDB Atlas, Mongoose |
| Live events | Socket.IO |
| Authentication | JWT |

## Repository layout

```
.
├── frontend/       # React + Vite app; deploy this folder to Vercel
│   ├── src/
│   └── vercel.json # SPA route fallback
└── backend/        # Express API + Socket.IO; deploy this folder to Render
    ├── src/
    └── .env.example
```

## 1. Run locally

Use Node.js 20.19+ and below 23 for the backend (Node 22 is a suitable choice).

### Backend

1. Open a terminal at the repository root.
2. Run:

```bash
cd backend
npm install
```

3. Copy `.env.example` to `.env`.
4. Fill in `MONGO_URI` and a long random `JWT_SECRET`. Keep `CLIENT_URL=http://localhost:5173`.
5. Start the API:

```bash
npm run dev
```

The backend listens on port 5000 by default.

### Frontend

Open a second terminal at the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). During local development Vite proxies `/api` and `/socket.io` to `http://localhost:5000`.

### Optional demo data

To load the illustrative Chennai fixtures into the database, run this once from the `backend` directory:

```bash
npm run seed
```

The seeder is repeatable and upserts its own fixtures; it no longer deletes user-submitted records. Fixtures are flagged as demo data and labelled as unverified in the map. Do not seed the demo incidents into a real public-safety deployment as if they were verified reports.

## 2. Deploy the database — MongoDB Atlas

1. Create or open a MongoDB Atlas project: [https://cloud.mongodb.com/](https://cloud.mongodb.com/).
2. Create a database deployment/cluster.
3. In **Database Access**, create a database user with a strong password. This is separate from your Atlas website login.
4. In **Network Access**, allow the backend host to connect. For a quick portfolio deployment on a host with changing outbound IPs, Atlas may require a broad IP rule; use it only with a strong database password and a dedicated database user, and tighten it to the host's published outbound IPs or private networking for production. Atlas warns that `0.0.0.0/0` allows access attempts from anywhere.
5. Open **Connect → Drivers**, copy the Node.js connection string, replace the credential placeholders, and use a database name such as `safehood`.

Keep the MongoDB URI private. Never put it in the frontend environment variables or commit it to Git.

## 3. Deploy the backend — Render

1. Open [https://render.com/](https://render.com/) and connect your GitHub account.
2. Choose **New → Web Service** and select `bhavikajadon/SafeHood`.
3. Configure the service:
   - **Name:** `safehood-api`
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/`
4. Add these environment variables under the service's Environment settings:

| Key | Value |
|---|---|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long, random secret (generate one; do not reuse a password) |
| `CLIENT_URL` | Temporarily `http://localhost:5173`; replace with the Vercel site URL after Step 4 |
| `NODE_ENV` | `production` |

Do not set a fixed `PORT`; the server reads the port provided by Render.

5. Create the service and wait until the deploy is marked **Live**.
6. Open the service URL, for example `https://safehood-api.onrender.com/`. It should return JSON showing `"status":"ok"`. This confirms the API process is running and connected to MongoDB.

Render supports WebSocket connections on a web service, which is needed for Socket.IO. Its free web services spin down after 15 minutes without inbound HTTP or WebSocket messages and may take about a minute to wake up; use a paid always-on instance for a production experience.

### Seed demo data (optional)

If this is a portfolio/demo deployment and you want the illustrative Chennai markers, run `npm run seed` from your local `backend` folder with its `.env` pointing to the same Atlas database. The script upserts marked demo fixtures. Do not use these sample reports as evidence of actual local incident risk.

## 4. Deploy the frontend — Vercel

1. Open [https://vercel.com/new](https://vercel.com/new) and import the same GitHub repository.
2. In the project setup, set:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. Under Environment Variables, add these for **Production** (and Preview too if you will test preview deployments):

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | Your Render backend origin, e.g. `https://safehood-api.onrender.com` |
| `VITE_SOCKET_URL` | The same Render backend origin |

Use only the origin, with no trailing slash and no `/api` suffix.

4. Deploy. Vercel will build the React app from `frontend` and publish `dist`.
5. Copy the deployed Vercel URL, for example `https://safehood.vercel.app`.

Vite environment variables are embedded into the frontend at build time. Redeploy after changing them. Only the two `VITE_*` public URLs belong in Vercel; keep `MONGO_URI` and `JWT_SECRET` only in Render.

## 5. Connect Render CORS to Vercel

1. Return to Render → `safehood-api` → Environment.
2. Replace `CLIENT_URL` with your exact Vercel origin, e.g. `https://safehood.vercel.app` (no trailing slash).
3. If using a custom domain as well, separate the two allowed origins with a comma:

```text
https://safehood.vercel.app,https://www.your-domain.com
```

4. Save changes and trigger a redeploy if Render does not automatically restart the service.
5. Open the Vercel site again. The map API, authentication, reporting, forum, and Socket.IO now point to the deployed backend.

The backend CORS configuration accepts the exact comma-separated origins in `CLIENT_URL`. Do not use `*` for a public authenticated app.

## 6. Final production checklist

Run these in order after both deployments are live:

- [ ] Open the Render API root URL and confirm `status: ok`.
- [ ] Open `https://YOUR-API-URL/api/zones?city=Chennai`; confirm it returns JSON with a `zones` array.
- [ ] Open `https://YOUR-API-URL/api/reports?city=Chennai`; confirm it returns JSON with a `reports` array.
- [ ] Open the Vercel website and refresh the page; confirm it does not show a 404.
- [ ] Register a new account and confirm it lands on the map.
- [ ] Sign out, sign back in, and refresh; confirm the session restores.
- [ ] Submit a test report using browser location permission; confirm it appears on the map.
- [ ] Open the same site in a second browser window in the same city; submit a report in the first window and verify the second receives a live marker/alert.
- [ ] Create a forum post and upvote it.
- [ ] Open Emergency Help; verify the call links and location sharing on a phone.
- [ ] Test on a phone-sized viewport and on a real mobile device.
- [ ] Review the browser console and Render logs for failed requests or CORS errors.

## 7. Before calling it production-ready

This repository is a working portfolio implementation, not a certified public-safety service. Before real public use, add moderation/report review, rate limiting, abuse prevention, privacy controls for location data, retention/deletion policies, verified data-source ingestion, audit logging, backups, monitoring, and clear incident escalation guidance. Do not describe the demo scores or sample reports as validated AI predictions or official crime statistics.

## Troubleshooting

- **Vercel page loads but API calls fail:** check `VITE_API_BASE_URL`, redeploy Vercel, and ensure Render's `CLIENT_URL` is the exact Vercel origin.
- **Map blank / no markers:** check the `/api/zones` and `/api/reports` endpoints. Run the optional seed script only for a labelled demo.
- **Login fails:** verify Render logs, `MONGO_URI`, `JWT_SECRET`, and Atlas Network Access.
- **Live reports do not appear in another browser:** check `VITE_SOCKET_URL`, Render WebSocket availability, and `CLIENT_URL`.
- **First request is slow on Render Free:** the service may have spun down after inactivity.

## Project status

SafeHood is actively developed. The map, account flows, reporting, forum, emergency contacts, and live transport are implemented in the public repository. External public-data ingestion and predictive risk modelling should be treated as future work unless independently integrated and validated.
