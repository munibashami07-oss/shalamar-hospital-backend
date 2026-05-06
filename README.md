# Shalamar Hospital - Patient Portal Backend

A complete Node.js + MySQL backend for the Shalamar Hospital website with patient authentication (login/register) and appointment booking.

---

## Project Structure

```
shalamar-hospital-backend/
  ├── config/
  │   └── database.js          # MySQL connection pool
  ├── database/
  │   └── init-db.js           # Creates database & tables
  ├── middleware/
  │   └── auth.js              # JWT token verification
  ├── routes/
  │   ├── auth.js              # Login & Register API
  │   └── appointments.js      # Appointment booking API
  ├── public/
  │   └── index.html           # Frontend (your website)
  ├── .env.example             # Environment variables template
  ├── .gitignore
  ├── package.json
  ├── server.js                # Main server entry point
  └── README.md                # This file
```

---

## Step-by-Step Setup Guide (VS Code)

### Step 1: Install Required Software

Before you begin, make sure you have these installed:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org (LTS version recommended)
   - Verify: Open terminal and run `node --version`

2. **MySQL Database** (Choose one option)
   - **Option A - XAMPP** (Easiest for beginners): https://www.apachefriends.org
   - **Option B - WAMP** (Windows): https://www.wampserver.com
   - **Option C - MySQL Installer**: https://dev.mysql.com/downloads/installer/

3. **VS Code**: https://code.visualstudio.com

4. **VS Code Extensions** (Install these from the Extensions tab):
   - "ES7+ React/Redux/React-Native snippets"
   - "REST Client" (for testing APIs)
   - "Prettier - Code: formatter"

---

### Step 2: Open Project in VS Code

1. Extract the `shalamar-hospital-backend` folder
2. Open VS Code
3. Go to **File > Open Folder...**
4. Select the `shalamar-hospital-backend` folder
5. Open the integrated terminal: **View > Terminal** (or press `` Ctrl + ` ``)

---

### Step 3: Install Dependencies

In the VS Code terminal, run:

```bash
npm install
```

This will download and install all required packages:
- `express` - Web server framework
- `mysql2` - MySQL database driver
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication tokens
- `cors` - Enable cross-origin requests
- `dotenv` - Environment variables
- `express-validator` - Input validation

---

### Step 4: Configure Environment Variables

1. In VS Code, find `.env.example` in the Explorer sidebar
2. Right-click it and select **Copy**
3. Paste it in the same folder, then **rename** the copy to `.env`
4. Open `.env` and update the values:

```env
PORT=5000

# For XAMPP/WAMP (default - no password):
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=shalamar_hospital
DB_PORT=3306

# Secret key for JWT (keep this private!)
JWT_SECRET=shalamar_hospital_secret_key_2026_change_this_in_production

# Frontend URL (for development)
FRONTEND_URL=http://localhost:5000
```

> **Note:** If you set a MySQL root password, put it in `DB_PASSWORD=`

---

### Step 5: Start MySQL Database

**If using XAMPP:**
1. Open XAMPP Control Panel
2. Click **Start** next to "MySQL"
3. Make sure it shows green/running

**If using WAMP:**
1. Open WAMP Server
2. Wait for the icon to turn green

**Verify MySQL is running:**
- Open browser and go to: http://localhost/phpmyadmin
- You should see the phpMyAdmin dashboard

---

### Step 6: Initialize the Database

In the VS Code terminal, run:

```bash
npm run init-db
```

This will:
- Create the `shalamar_hospital` database
- Create `patients` table (for login/register)
- Create `appointments` table (for booking)
- Create `doctors` table with sample data

You should see output like:
```
Connected to MySQL server
Database "shalamar_hospital" created
"patients" table created
"appointments" table created
"doctors" table created
Database initialized successfully!
```

**Verify in phpMyAdmin:**
- Go to http://localhost/phpmyadmin
- Click on `shalamar_hospital` database
- You should see 3 tables: `appointments`, `doctors`, `patients`

---

### Step 7: Start the Server

In the VS Code terminal, run:

```bash
npm start
```

For development (auto-restarts on file changes):
```bash
npm run dev
```

You should see:
```
MySQL Database connected successfully!

Shalamar Hospital Backend Server
Server running at: http://localhost:5000
API Base URL: http://localhost:5000/api
```

---

### Step 8: Test the Backend

**Test in your browser:**
- Open: http://localhost:5000/api/health
- You should see: `{"success":true,"message":"Shalamar Hospital Backend is running!"}`

**Test the frontend:**
- Open: http://localhost:5000
- Your Shalamar Hospital website should load
- Click "Patient Portal" to test login

---

### Step 9: Test API Endpoints (Optional)

You can test the APIs using VS Code REST Client:

1. Create a file named `test.http` in the root folder
2. Add this content:

```http
### Health Check
GET http://localhost:5000/api/health

### Register a New User
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "full_name": "Test Patient",
  "email": "test@email.com",
  "cnic": "35201-1234567-8",
  "password": "password123"
}

### Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@email.com",
  "password": "password123"
}

### Book Appointment (no auth required)
POST http://localhost:5000/api/appointments
Content-Type: application/json

{
  "first_name": "Ali",
  "last_name": "Khan",
  "phone": "0300-1234567",
  "department": "Cardiology",
  "preferred_date": "2026-05-15",
  "description": "Chest pain consultation"
}
```

3. Click "Send Request" above any request to test it

---

## How It All Connects

### Frontend (HTML) --> Backend (Node.js) --> Database (MySQL)

```
User clicks "Sign In"
      |
      v
Frontend sends POST request to http://localhost:5000/api/auth/login
      |
      v
Backend (server.js) receives request, routes to auth.js
      |
      v
auth.js validates input, queries MySQL database
      |
      v
Database checks if user exists and password matches
      |
      v
Backend returns JWT token + user data
      |
      v
Frontend saves token, redirects to dashboard
```

### Key Files Connection:

| File | Purpose | Connects To |
|------|---------|-------------|
| `public/index.html` | Frontend UI | Calls API endpoints |
| `server.js` | Main server | Routes requests, serves frontend |
| `routes/auth.js` | Login/Register logic | `config/database.js` |
| `config/database.js` | DB connection | MySQL server |
| `middleware/auth.js` | Token verification | `routes/auth.js` |

---

## Deployment Guide

### Option 1: Deploy to Render (Free)

1. Push code to GitHub
2. Go to https://render.com and sign up
3. Click "New Web Service"
4. Connect your GitHub repo
5. Set environment variables (from `.env`)
6. Add MySQL database (use Render PostgreSQL or external MySQL)
7. Deploy!

### Option 2: Deploy to Railway

1. Go to https://railway.app
2. Create new project from GitHub
3. Add MySQL plugin (Railway provides this)
4. Set environment variables
5. Deploy automatically

### Option 3: Deploy to VPS (DigitalOcean/AWS)

1. Get a VPS with Ubuntu
2. Install Node.js and MySQL
3. Upload files via SFTP or git clone
4. Install PM2: `npm install -g pm2`
5. Run: `pm2 start server.js`
6. Set up Nginx as reverse proxy

### After Deployment - Update Frontend API URL

In `public/index.html`, change:

```javascript
// LOCAL development:
const API_BASE_URL = 'http://localhost:5000/api';

// AFTER DEPLOYMENT - change to your deployed URL:
const API_BASE_URL = 'https://your-app-name.onrender.com/api';
```

---

## API Reference

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new account | No |
| POST | `/api/auth/login` | Sign in to account | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| POST | `/api/appointments` | Book appointment | No |
| GET | `/api/appointments` | Get my appointments | Yes |
| GET | `/api/health` | Health check | No |

### Authentication Header (for protected routes):
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Security Features

- **Password Hashing**: All passwords are hashed with bcrypt (salt rounds: 10)
- **JWT Tokens**: Stateless authentication with 24-hour expiry
- **Input Validation**: All inputs are validated before processing
- **SQL Injection Protection**: Parameterized queries used throughout
- **CORS**: Configured to accept requests only from allowed origins

---

## Troubleshooting

### "Cannot connect to MySQL"
- Make sure XAMPP/WAMP MySQL is started
- Check `.env` credentials match your MySQL setup
- Try: `mysql -u root -p` in terminal

### "Port 5000 already in use"
- Change `PORT` in `.env` to another number (e.g., 5001)
- Or kill existing process: `npx kill-port 5000`

### "CORS error in browser"
- Make sure `FRONTEND_URL` in `.env` matches where you're opening the HTML
- For development, set `FRONTEND_URL=*` to allow all

### "npm install fails"
- Update Node.js to v18+
- Delete `node_modules` folder and run `npm install` again

---

## Next Steps / Features to Add

- [ ] Email notifications for appointments
- [ ] Admin dashboard for managing appointments
- [ ] Password reset via email
- [ ] Upload medical documents
- [ ] SMS notifications
- [ ] Payment integration

---

**Built for Shalamar Hospital, Lahore**
