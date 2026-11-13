# Git Environment & Branching Guide

This guide explains the Git environment and workflow designed for teamwork and individual project showcasing.

---

## 1. Branching Model (GitFlow Simplified)

```
main (production live on Vercel)
  │
  └─── develop (staging / integration)
         │
         ├─── feature/catalog-setup
         ├─── feature/search-filters
         ├─── feature/cart-wishlist
         ├─── feature/checkout-orders
         └─── feature/admin-dashboard
```

- **`main`**: Always clean, stable, and connected to Vercel production deployment.
- **`develop`**: Where completed features are merged and tested before production release.
- **`feature/*`**: Individual branches where you work on specific sprint tasks.

---

## 2. Setting Up Your Git Repository Step-by-Step

### Step 1: Initialize Git in your project
```bash
git init
```

### Step 2: Configure your Git identity (if not already set)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3: Add all files and make initial commit
```bash
git add .
git commit -m "feat: initial commit - Next.js, TypeScript, Ant Design Bookstore setup"
```

### Step 4: Create and switch to `develop` branch
```bash
git branch -M main
git checkout -b develop
```

---

## 3. Working on a Weekly Sprint Feature

### Starting a new feature (e.g. Cart Feature)
```bash
# 1. Ensure you are on latest develop branch
git checkout develop

# 2. Create and switch to your feature branch
git checkout -b feature/cart-wishlist

# 3. Make changes and commit frequently with clear messages
git add .
git commit -m "feat(cart): add cart drawer with quantity adjustment and total calculation"
git commit -m "feat(cart): implement undo remove using stack data structure"

# 4. Switch back to develop and merge your feature
git checkout develop
git merge feature/cart-wishlist

# 5. Delete feature branch once merged
git branch -d feature/cart-wishlist
```

---

## 4. Releasing to Production (Vercel)
```bash
# Switch to main and merge develop
git checkout main
git merge develop
git push origin main
```
Whenever `main` is pushed to GitHub, Vercel automatically triggers a new deployment build!
