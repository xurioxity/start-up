# 🚀 Complete Beginner's Guide: Deploy Aavi 3D to Vercel

This guide will take you from zero to a live website, step by step. Follow each step carefully!

---

## ✅ STEP 1: You've Chosen Supabase (DONE!)

Great! You've already created your Supabase project. Now let's get the connection string.

---

## 📊 STEP 2: Get Your Database Connection String from Supabase

### Step 2.1: Find the Connection String

1. **You're already in Supabase** - good!

2. **In the left sidebar**, click **"Settings"** (gear icon ⚙️ at the bottom)

3. **Click "Database"** (under CONFIGURATION section)

4. **Scroll down** on the Database Settings page

5. **Look for a section called "Connection string"** or "Connection info"

6. **You'll see a dropdown menu** - make sure it says **"URI"** (not "Session mode")

7. **You'll see a connection string** that looks like:
   ```
   postgresql://postgres.zyzsdvhtrajjrrlmowff:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

### Step 2.2: Copy the Connection String

1. **Click the "Copy" button** next to the connection string

2. **IMPORTANT**: The connection string has `[YOUR-PASSWORD]` in it - you need to replace this!

3. **Replace `[YOUR-PASSWORD]`** with the actual password you created when setting up Supabase

   - This is the password you entered when creating the project
   - If you forgot it, you can reset it in Database Settings → "Reset database password"

4. **Your final connection string should look like**:
   ```
   postgresql://postgres.zyzsdvhtrajjrrlmowff:MyActualPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

5. **Save this connection string somewhere safe** - you'll need it in Step 5!

---

## 🗄️ STEP 3: Set Up Your Database Tables

Your app needs tables in the database. We'll use Prisma to create them automatically.

### Step 3.1: Install Vercel CLI (We'll Use This Later)

**Skip this for now** - we'll do it in Step 6. Just know we'll need it!

### Step 3.2: Create Database Schema (We'll Do This After Deployment)

**We'll set up the database tables AFTER we deploy to Vercel** (in Step 6). This is easier because Vercel will handle the connection for us.

**For now, just make sure you have your connection string saved!**

---

## 📝 STEP 4: Prepare Your Code for GitHub

### Step 4.1: Check Your Files

1. **Open your project folder** (`autocurse`)

2. **Make sure you have these files**:
   - ✅ `package.json`
   - ✅ `prisma/schema.prisma`
   - ✅ `next.config.js`
   - ✅ All your app files

### Step 4.2: Make Sure .env Files Are NOT Committed

1. **Check if you have a `.gitignore` file** (you should have one)

2. **Open `.gitignore`** and make sure it contains:
   ```
   .env
   .env.local
   .env.development.local
   .env.test.local
   .env.production.local
   ```

3. **If you have a `.env` or `.env.local` file**, make sure it's NOT uploaded to GitHub (it should be in .gitignore)

---

## 🔵 STEP 5: Create GitHub Account & Repository

### Step 5.1: Sign Up for GitHub

1. **Go to**: https://github.com

2. **Click "Sign up"** (top right)

3. **Create an account**:
   - Enter your email
   - Create a password
   - Choose a username
   - Verify your email

### Step 5.2: Create a New Repository

1. **After signing in**, click the **"+" icon** (top right)

2. **Click "New repository"**

3. **Fill in the form**:
   - **Repository name**: `aavi-3d` (or any name you like)
   - **Description**: "3D Printing Marketplace" (optional)
   - **Visibility**: Choose **"Public"** (so Vercel can access it)
   - **DO NOT** check "Add a README file"
   - **DO NOT** check "Add .gitignore" (you already have one)
   - **DO NOT** check "Choose a license"

4. **Click "Create repository"**

### Step 5.3: Push Your Code to GitHub

1. **Open PowerShell** in your `autocurse` folder:
   - Right-click in the folder → "Open in Terminal" or "Open PowerShell window here"
   - OR press `Shift + Right-click` → "Open PowerShell window here"

2. **Run these commands one by one** (copy and paste each one):

   ```powershell
   git init
   ```

   ```powershell
   git add .
   ```

   ```powershell
   git commit -m "Initial commit - Ready for deployment"
   ```

   ```powershell
   git branch -M main
   ```

   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/aavi-3d.git
   ```
   *(Replace YOUR_USERNAME with your actual GitHub username, and aavi-3d with your repository name)*

   ```powershell
   git push -u origin main
   ```

3. **If asked for username/password**:
   - **Username**: Your GitHub username
   - **Password**: You need a **Personal Access Token** (not your GitHub password)
   
   **To create a token**:
   - Go to GitHub → Click your profile (top right) → **Settings**
   - Scroll down → **Developer settings** (left sidebar)
   - Click **Personal access tokens** → **Tokens (classic)**
   - Click **Generate new token** → **Generate new token (classic)**
   - Name it: `Vercel Deployment`
   - Check **"repo"** checkbox (this gives full access to repositories)
   - Click **Generate token**
   - **COPY THE TOKEN** (you won't see it again!)
   - Use this token as your password when pushing

4. **After successful push**, refresh your GitHub page - you should see all your files!

---

## 🚀 STEP 6: Deploy to Vercel

### Step 6.1: Sign Up for Vercel

1. **Go to**: https://vercel.com

2. **Click "Sign Up"** (top right)

3. **Click "Continue with GitHub"** (easiest option)

4. **Authorize Vercel** to access your GitHub account

### Step 6.2: Import Your Project

1. **After signing in**, you'll see the Vercel dashboard

2. **Click "Add New Project"** (big button)

3. **You'll see your GitHub repositories** - find `aavi-3d` (or your repo name)

4. **Click "Import"** next to your repository

### Step 6.3: Configure Project Settings

1. **Vercel will auto-detect Next.js** - you should see:
   - Framework Preset: **Next.js** ✅
   - Root Directory: `./` ✅
   - Build Command: `next build` ✅
   - Output Directory: `.next` ✅

2. **DON'T CLICK DEPLOY YET!** We need to add environment variables first.

### Step 6.4: Add Environment Variables

1. **Scroll down** to "Environment Variables" section

2. **Click "Add"** to add each variable:

   **Variable 1: DATABASE_URL**
   - **Name**: `DATABASE_URL`
   - **Value**: Paste your connection string from Step 2.2 (the one with your actual password)
   - **Environments**: Check all three boxes:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - Click **"Save"**

   **Variable 2: NEXTAUTH_SECRET**
   - **Name**: `NEXTAUTH_SECRET`
   - **Value**: Generate a secret key:
     - **On Windows (PowerShell)**, run:
       ```powershell
       [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
       ```
     - **Or use online**: Go to https://randomkeygen.com and copy a "CodeIgniter Encryption Keys" (the long one)
   - **Environments**: Check all three boxes (Production, Preview, Development)
   - Click **"Save"**

   **Variable 3: NEXTAUTH_URL**
   - **Name**: `NEXTAUTH_URL`
   - **Value**: For now, use `https://aavi-3d.vercel.app` (or your project name)
     - You'll update this after deployment with the actual URL
   - **Environments**: Check all three boxes (Production, Preview, Development)
   - Click **"Save"**

3. **You should now have 3 environment variables** listed

### Step 6.5: Deploy!

1. **Scroll to the bottom**

2. **Click "Deploy"** (big button)

3. **Wait 2-3 minutes** - Vercel is building your app

4. **You'll see a progress bar** - wait for it to complete

5. **When it's done**, you'll see:
   - ✅ "Building" → ✅ "Ready"
   - A URL like: `https://aavi-3d-xxxxx.vercel.app`

6. **Click the URL** to see your live website!

---

## 🗄️ STEP 7: Set Up Database Tables

Your website is live, but the database is empty. Let's create the tables!

### Step 7.1: Install Vercel CLI

1. **Open PowerShell** (anywhere is fine)

2. **Run this command**:
   ```powershell
   npm install -g vercel
   ```

3. **Wait for it to install** (takes 1-2 minutes)

### Step 7.2: Login to Vercel

1. **In PowerShell**, run:
   ```powershell
   vercel login
   ```

2. **It will open your browser** - click "Authorize" or "Continue"

3. **You should see**: "Success! Authentication complete"

### Step 7.3: Link Your Project

1. **Open PowerShell in your `autocurse` folder**

2. **Run**:
   ```powershell
   vercel link
   ```

3. **Follow the prompts**:
   - "Set up and develop"? → Type `Y` and press Enter
   - "Which scope"? → Select your account (usually just press Enter)
   - "Link to existing project"? → Type `Y` and press Enter
   - "What's the name of your project"? → Type your project name (e.g., `aavi-3d`)
   - "In which directory is your code located"? → Press Enter (it's `./`)

4. **You should see**: "Linked to [your-username]/aavi-3d"

### Step 7.4: Pull Environment Variables

1. **Still in your `autocurse` folder in PowerShell**, run:
   ```powershell
   vercel env pull .env.local
   ```

2. **This creates a `.env.local` file** with your environment variables from Vercel

3. **Check that the file was created** - you should see `.env.local` in your folder

### Step 7.5: Generate Prisma Client

1. **In the same PowerShell window**, run:
   ```powershell
   npx prisma generate
   ```

2. **Wait for it to complete** - you'll see "Generated Prisma Client"

### Step 7.6: Create Database Tables

1. **Still in PowerShell**, run:
   ```powershell
   npx prisma db push
   ```

2. **This will create all your database tables** in Supabase

3. **You should see**: "Your database is now in sync with your schema"

4. **If you see any errors**, check:
   - Your `DATABASE_URL` is correct in Vercel
   - Your database password is correct

### Step 7.7: (Optional) Add Demo Data

1. **To add demo accounts and sample data**, run:
   ```powershell
   npm run db:seed
   ```

2. **This creates**:
   - Demo seller account: `seller@demo.com` / `demo123`
   - Demo manufacturer account: `manufacturer@demo.com` / `demo123`
   - Demo admin account: `admin@demo.com` / `demo123`
   - Sample products and orders

3. **You should see**: "Database seeded successfully!"

---

## ✅ STEP 8: Update NEXTAUTH_URL

1. **Go back to Vercel dashboard**

2. **Click on your project** → **Settings** → **Environment Variables**

3. **Find `NEXTAUTH_URL`** and click the three dots → **Edit**

4. **Update the value** to your actual Vercel URL:
   - It should be: `https://your-actual-project-name.vercel.app`
   - You can find this in your Vercel project dashboard

5. **Click "Save"**

6. **Redeploy**: Go to **Deployments** tab → Click the three dots on latest deployment → **Redeploy**

---

## 🎉 STEP 9: Test Your Live Website!

1. **Go to your Vercel URL** (e.g., `https://aavi-3d-xxxxx.vercel.app`)

2. **You should see** your landing page!

3. **Try signing up** or use demo accounts:
   - **Seller**: `seller@demo.com` / `demo123`
   - **Manufacturer**: `manufacturer@demo.com` / `demo123`
   - **Admin**: `admin@demo.com` / `demo123`

4. **Test the features**:
   - Upload an STL file
   - Create an order
   - Send messages
   - Check notifications

---

## 🔧 Troubleshooting

### "Build Failed" Error

**Check**:
1. Go to Vercel dashboard → Your project → **Deployments** tab
2. Click on the failed deployment
3. Check the **Build Logs** for error messages
4. Common issues:
   - Missing environment variables → Add them in Settings
   - Prisma errors → Make sure `postinstall` script is in package.json

### "Database Connection Error"

**Check**:
1. Your `DATABASE_URL` in Vercel is correct
2. Your database password is correct (no `[YOUR-PASSWORD]` placeholder)
3. Supabase database is running (check Supabase dashboard)

### "Authentication Not Working"

**Check**:
1. `NEXTAUTH_SECRET` is set in Vercel
2. `NEXTAUTH_URL` matches your actual Vercel URL
3. Redeploy after adding/changing environment variables

### "Can't Find Connection String in Supabase"

**Try**:
1. Settings → Database → Scroll all the way down
2. Look for "Connection string" or "Connection info" section
3. Make sure dropdown says "URI"
4. If still can't find, try: Settings → API → Look for database connection info there

### "Prisma db push Failed"

**Check**:
1. Your `.env.local` file exists (created with `vercel env pull`)
2. `DATABASE_URL` in `.env.local` is correct
3. You can connect to Supabase from your computer (some networks block database connections)

---

## 📝 Summary: What You've Done

✅ Created Supabase account and project  
✅ Got database connection string  
✅ Created GitHub repository  
✅ Pushed code to GitHub  
✅ Deployed to Vercel  
✅ Set up environment variables  
✅ Created database tables  
✅ Added demo data (optional)  
✅ Your website is LIVE! 🎉

---

## 🎓 Need Help?

If you get stuck:
1. **Check which step** you're on
2. **Copy the error message** you see
3. **Check the troubleshooting section** above
4. **Let me know** which step and what error you're seeing!

---

## 🔄 Updating Your Website

Every time you make changes:

1. **Make your changes** in your code
2. **Push to GitHub**:
   ```powershell
   git add .
   git commit -m "Description of changes"
   git push
   ```
3. **Vercel automatically deploys** the new version (takes 2-3 minutes)
4. **Your website updates automatically!**

---

**Congratulations! Your Aavi 3D marketplace is now live on the internet! 🚀**

