# Shalamar Hospital — Unified Patient Portal

A full-stack hospital web app with Landing Page → Login/Signup → Appointment Booking → MediAI.

## Project Structure

```
├── server.js               ← Main Express server (all routes)
├── package.json
├── railway.json            ← Railway deployment config
├── .env.example            ← Copy to .env and fill in values
├── config/
│   └── database.js         ← MySQL connection pool
├── database/
│   └── init-db.js          ← Creates tables & seeds doctors
├── middleware/
│   └── auth.js             ← JWT verification middleware
├── routes/
│   ├── auth.js             ← POST /api/auth/register, /login, GET /profile
│   └── appointments.js     ← POST /api/appointments, GET /doctors/:dept
└── public/
    ├── landing.html        ← Served at /
    ├── auth.html           ← Served at /auth  (login + signup)
    ├── appointment.html    ← Served at /appointment (protected)
    └── mediai.html         ← Served at /mediai
```

## Page Flow

```
/ (landing) → /auth (login/signup) → /appointment (book) → receipt
                                   ↘ /mediai (AI assistant)
```

## Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MySQL credentials and keys
   ```

3. **Initialize the database** (first time only)
   ```bash
   npm run init-db
   ```

4. **Start the server**
   ```bash
   npm run dev    # with auto-reload (nodemon)
   # or
   npm start      # production
   ```

5. Open `http://localhost:5000`

---

## Deploy to Railway

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/shalamar-hospital.git
git push -u origin main
```

### Step 2 — Create Railway Project
1. Go to [railway.app](https://railway.app) → **New Project**
2. Click **Deploy from GitHub repo** → select your repo
3. Railway will detect Node.js and deploy automatically

### Step 3 — Add MySQL Database
1. In your Railway project, click **+ New** → **Database** → **MySQL**
2. Click on the MySQL service → **Variables** tab
3. Note the values: `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_PORT`

### Step 4 — Set Environment Variables
In your Railway app service → **Variables** tab, add:

| Variable | Value |
|---|---|
| `DB_HOST` | (from MySQL service — use the internal host) |
| `DB_USER` | (from MySQL service) |
| `DB_PASSWORD` | (from MySQL service) |
| `DB_NAME` | (from MySQL service) |
| `DB_PORT` | `3306` |
| `JWT_SECRET` | any long random string |
| `OPENAI_API_KEY` | your OpenAI key (for MediAI) |
| `PORT` | Railway sets this automatically |

> 💡 Tip: In Railway, connect services by using the **reference variable** syntax. E.g. for `DB_HOST` use `${{MySQL.MYSQL_HOST}}`.

### Step 5 — Initialize DB on Railway
After first deploy, open the Railway shell for your app service and run:
```bash
npm run init-db
```
This creates all tables and seeds sample doctors.

### Step 6 — Done!
Railway gives you a public URL like `https://shalamar-hospital-production.up.railway.app`

---

## API Endpoints

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create account | — |
| POST | `/api/auth/login` | Sign in | — |
| GET | `/api/auth/profile` | Get profile | JWT |
| POST | `/api/appointments` | Book appointment | optional JWT |
| GET | `/api/appointments/my` | My appointments | JWT |
| GET | `/api/appointments/doctors/:dept` | Doctors by dept | — |
| POST | `/api/chat` | MediAI chat | — |
| GET | `/api/health` | Health check | — |
