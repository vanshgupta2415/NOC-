# 🚀 Step-by-Step Deployment Guide (Render & Vercel)

This guide will walk you through deploying the **No Dues Portal** to production using **Render** (for Backend/DB) and **Vercel** (for Frontend).

---

## Part 1: Database Setup (Render)

1. **Log in to [Render](https://render.com/)**.
2. Click **New +** and select **PostgreSQL**.
3. **Configure**:
   - **Name**: `nodues-db`
   - **User**: (leave default or set own)
   - **Database**: `nodues_portal`
   - **Region**: Choose the one closest to you (e.g., Singapore or US East).
   - **Plan**: Free (for testing).
4. Click **Create Database**.
5. Once created, copy the **Internal Database URL** (for backend) or **External Database URL** (for local testing).

---

## Part 2: Backend Deployment (Render)

1. Click **New +** and select **Web Service**.
2. Connect your GitHub repository.
3. **Configure Settings**:
   - **Name**: `nodues-backend`
   - **Root Directory**: `nodues backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
4. **Environment Variables** (Click "Advanced" -> "Add Environment Variable"):
   - `DATABASE_URL`: (Paste your Render PostgreSQL URL)
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `JWT_ACCESS_SECRET`: (Generate a random string: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `JWT_REFRESH_SECRET`: (Generate another random string)
   - `FRONTEND_URL`: (You will update this after Part 3)
5. Click **Create Web Service**.

---

## Part 3: Frontend Deployment (Vercel)

1. **Log in to [Vercel](https://vercel.com/)**.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. **Configure Project**:
   - **Project Name**: `nodues-frontend`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `Nodues frontend`
5. **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://nodues-backend.onrender.com/api` (Replace with your actual Render service URL)
6. Click **Deploy**.
7. Copy your deployed Vercel URL (e.g., `https://nodues-frontend.vercel.app`).

---

## Part 4: Final Glue (CORS & Database)

### 1. Update Backend CORS
Go back to **Render** -> `nodues-backend` -> **Environment** and update:
- `FRONTEND_URL`: `https://nodues-frontend.vercel.app` (Your Vercel URL)
Render will automatically re-deploy.

### 2. Apply Database Schema
Since you are using Prisma, you need to push the tables to the production DB. You can do this from your local terminal:
```bash
# In the 'nodues backend' folder
# Temporary set your local .env DATABASE_URL to the 'External Database URL' from Render
npx prisma migrate deploy
node prisma-seed.js
```

---

## Part 5: Verification

1. Visit your Vercel URL.
2. Try logging in with:
   - **Email**: `admin@mitsgwl.ac.in`
   - **Password**: `password123`
3. Check if the dashboard loads correctly.

---

### 💡 Pro Tips:
- **Cold Starts**: Render's free tier spins down after 15 mins of inactivity. The first request might take 30-50 seconds.
- **SSL**: Both Vercel and Render provide SSL (HTTPS) automatically.
- **Logs**: If something fails, check the **Logs** tab in Render or the **Functions** tab/Build logs in Vercel.
