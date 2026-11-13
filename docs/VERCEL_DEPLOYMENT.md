# Vercel Deployment Guide for Bookstore App

This guide walks you through deploying your Bookstore application to Vercel in just a few minutes.

---

## Method 1: Deploy via Vercel GitHub Integration (Recommended)

### Step 1: Push your code to GitHub
1. Create a new repository on [GitHub](https://github.com/new) named `bookstore-app`.
2. Link your local project to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/bookstore-app.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Import into Vercel
1. Log in to [Vercel](https://vercel.com) using your GitHub account.
2. Click **Add New...** -> **Project**.
3. Choose your `bookstore-app` repository and click **Import**.
4. Vercel automatically detects **Next.js**:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `next build`
   - **Output Directory:** `.next`
5. Click **Deploy**.
6. Wait 1-2 minutes. Vercel will give you a live production URL (e.g. `https://bookstore-app-yourname.vercel.app`).

---

## Method 2: Deploy using Vercel CLI (Quick & Direct)

```bash
# 1. Install Vercel CLI globally
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy preview
vercel

# 4. Deploy directly to production
vercel --prod
```

---

## Testing Build Locally Before Deploying

Always test the production build locally before pushing:
```bash
npm run build
```
If this command finishes with no errors, your deployment to Vercel is guaranteed to succeed!
