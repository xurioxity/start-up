# 🚀 Vercel Deployment Guide for Aavi 3D

This guide will walk you through deploying your Aavi 3D application to Vercel step by step.

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ A GitHub account
- ✅ A Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ Your code pushed to a GitHub repository

---

## Step 1: Set Up Your Database (PostgreSQL)

Your application uses **PostgreSQL** for production. You have several options:

### Option A: Vercel Postgres (Recommended - Easiest)

1. Go to your Vercel dashboard
2. Navigate to **Storage** → **Create Database** → **Postgres**
3. Choose a name for your database
4. Select a region (choose closest to your users)
5. Click **Create**
6. **Important**: Copy the connection string - you'll need it later!

### Option B: Neon (Free Tier Available)

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Copy the connection string from the dashboard

### Option C: Supabase (Free Tier Available)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the connection string

### Option D: Railway, Render, or Other Providers

Any PostgreSQL provider will work. Just get the connection string.

---

## Step 2: Push Your Code to GitHub

If you haven't already:

1. **Initialize Git** (if not done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Ready for deployment"
   ```

2. **Create a GitHub repository**:
   - Go to [github.com](https://github.com)
   - Click **New Repository**
   - Name it (e.g., `aavi-3d`)
   - Don't initialize with README (you already have one)
   - Click **Create repository**

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 3: Deploy to Vercel

### 3.1 Import Your Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project**
3. Click **Import Git Repository**
4. Select your GitHub repository
5. Click **Import**

### 3.2 Configure Project Settings

Vercel will auto-detect Next.js. You should see:
- **Framework Preset**: Next.js ✅
- **Root Directory**: `./` ✅
- **Build Command**: `next build` ✅
- **Output Directory**: `.next` ✅

**Don't click Deploy yet!** We need to set up environment variables first.

---

## Step 4: Set Up Environment Variables

### 4.1 In Vercel Dashboard

Before deploying, click **Environment Variables** and add these:

#### 1. DATABASE_URL
- **Key**: `DATABASE_URL`
- **Value**: Your PostgreSQL connection string from Step 1
- **Example**: `postgresql://user:password@host:5432/database?schema=public`
- **Environments**: Select all (Production, Preview, Development)

#### 2. NEXTAUTH_SECRET
- **Key**: `NEXTAUTH_SECRET`
- **Value**: Generate a secure random string
  - **On Windows (PowerShell)**:
    ```powershell
    [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
    ```
  - **On Mac/Linux**:
    ```bash
    openssl rand -base64 32
    ```
  - **Or use online**: [randomkeygen.com](https://randomkeygen.com) - use "CodeIgniter Encryption Keys"
- **Environments**: Select all (Production, Preview, Development)

#### 3. NEXTAUTH_URL
- **Key**: `NEXTAUTH_URL`
- **Value**: Your Vercel deployment URL
  - For now, use: `https://YOUR_PROJECT_NAME.vercel.app`
  - You can update this after first deployment with the actual URL
- **Environments**: Select all (Production, Preview, Development)

### 4.2 Example Environment Variables

```
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public
NEXTAUTH_SECRET=your-generated-secret-here-minimum-32-characters
NEXTAUTH_URL=https://your-app.vercel.app
```

---

## Step 5: Deploy!

1. Click **Deploy** in Vercel
2. Wait for the build to complete (usually 2-3 minutes)
3. **Don't worry if the first deployment fails** - we need to set up the database schema first!

---

## Step 6: Set Up Database Schema

After your first deployment (even if it failed), you need to run Prisma migrations:

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project**:
   ```bash
   vercel link
   ```

4. **Pull environment variables**:
   ```bash
   vercel env pull .env.local
   ```

5. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

6. **Push database schema**:
   ```bash
   npx prisma db push
   ```

7. **Seed the database** (optional, for demo data):
   ```bash
   npm run db:seed
   ```

### Option B: Using Prisma Studio (Alternative)

1. Pull environment variables (as above)
2. Run:
   ```bash
   npx prisma studio
   ```
3. This opens a GUI where you can manually create tables (not recommended)

### Option C: Using Database Provider's SQL Editor

If your database provider has a SQL editor, you can:
1. Generate SQL from Prisma:
   ```bash
   npx prisma migrate dev --create-only --name init
   ```
2. Copy the SQL from `prisma/migrations/` folder
3. Run it in your database provider's SQL editor

---

## Step 7: Verify Deployment

1. Go to your Vercel deployment URL
2. You should see your landing page
3. Try signing up or using demo credentials:
   - **Seller**: `seller@demo.com` / `demo123`
   - **Manufacturer**: `manufacturer@demo.com` / `demo123`
   - **Admin**: `admin@demo.com` / `demo123`

---

## Step 8: Set Up Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable to your custom domain

---

## 🔧 Troubleshooting

### Build Fails with Prisma Error

**Error**: `PrismaClient is not configured to run in Vercel Edge Functions`

**Solution**: This is normal. The `postinstall` script in `package.json` handles this automatically.

### Database Connection Error

**Error**: `Can't reach database server`

**Solutions**:
1. Check your `DATABASE_URL` is correct
2. Make sure your database allows connections from Vercel's IPs
3. For Neon/Supabase: Check connection pooling settings
4. Some providers need `?sslmode=require` in the connection string

### Authentication Not Working

**Error**: `NEXTAUTH_SECRET is missing`

**Solution**: 
1. Make sure `NEXTAUTH_SECRET` is set in Vercel environment variables
2. Make sure `NEXTAUTH_URL` matches your actual deployment URL
3. Redeploy after adding environment variables

### Real-time Messages Not Updating

**Note**: Your app uses **polling** (checking every 5 seconds) for messages, not WebSockets. This works fine on Vercel without any extra setup!

If messages aren't updating:
1. Check browser console for errors
2. Verify API routes are working: `/api/messages`
3. Check database connection

---

## 📊 Monitoring Your Deployment

1. **Vercel Dashboard**: View logs, analytics, and deployments
2. **Function Logs**: Check API route errors
3. **Database Logs**: Check your database provider's dashboard

---

## 🔄 Updating Your Deployment

Every time you push to GitHub:
1. Vercel automatically creates a new deployment
2. If build succeeds, it becomes the production version
3. You can rollback to previous deployments in Vercel dashboard

---

## 📝 Important Notes

1. **Database Backups**: Set up automatic backups with your database provider
2. **Environment Variables**: Never commit `.env` files to GitHub
3. **Secrets**: Rotate `NEXTAUTH_SECRET` periodically
4. **Database Migrations**: Use `prisma migrate` for schema changes in production

---

## 🎉 You're Done!

Your Aavi 3D application should now be live on Vercel!

If you encounter any issues, check:
- Vercel deployment logs
- Database connection status
- Environment variables are set correctly
- Prisma schema is pushed to database

---

## 📞 Need Help?

1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Check Prisma documentation: [prisma.io/docs](https://www.prisma.io/docs)
3. Review your deployment logs in Vercel dashboard

Good luck with your deployment! 🚀

