# 📚 BookHaven — Online Bookstore Full-Stack Web Application

A full-stack, beginner-friendly online bookstore application built with **React.js**, **Next.js 14 (App Router)**, **TypeScript**, and **Ant Design (antd 5)**. Configured for immediate deployment on **Vercel** with comprehensive Agile documentation (SRS, User Stories, and 5 Weekly Sprints).

---

## 🌟 Key Features

1. **Curated Book Catalog & Discovery:**
   - 8 curated bestsellers (Atomic Habits, To Kill a Mockingbird, Dune, 1984, etc.)
   - Instant live search by title and author (`filter()`)
   - Category filtering (Fiction, Sci-Fi, Self-Help, Science, Mystery)
   - Price range slider & sorting (Price Low/High, Rating)
   - Detailed book view modal with $O(1)$ ISBN lookup
2. **Gutendex Public API Infinite Scroll:**
   - Direct integration with Project Gutenberg metadata API (10,000+ classical books)
   - Real-time infinite scroll using `IntersectionObserver` & sentinel ref
   - Book deduplication using JavaScript `Set`
   - Graceful network error handling & retry button
3. **Shopping Cart with Undo (Stack DSA):**
   - Slide-out Cart Drawer with quantity adjustment
   - Total calculation via functional `reduce()`
   - **Stack (LIFO)** for Undo: restoring accidentally deleted items
4. **Wishlist (Set DSA):**
   - Save favorite books with a single click
   - Backed by a JavaScript `Set` to prevent duplicate entries
5. **Order Processing Queue (FIFO DSA):**
   - Order Checkout modal with full form validation
   - Placing order assigns an Order ID and FIFO Queue Position
6. **Store Admin Dashboard:**
   - Real-time inventory metrics (Total titles, low stock alerts, queued orders, revenue)
   - Add New Book form
   - Order Queue management table with status tracking (Pending → Processing → Delivered)
7. **Interactive Sprints & SRS Modal:**
   - Accessible directly from the top navigation to showcase your roadmap, architecture, and weekly milestones during presentations or viva!

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js 14 (App Router)
- **Frontend Library:** React 18
- **UI Component System:** Ant Design (`antd` v5) & `@ant-design/icons`
- **Language:** TypeScript
- **Styling & Fonts:** Plus Jakarta Sans & CSS Modules / Styled Ant Design tokens
- **Data Structures (DSA):**
  - **Hash Table / Map ($O(1)$):** Fast ISBN search index
  - **Stack ($LIFO$):** Undo cart removals
  - **Queue ($FIFO$):** Order processing pipeline
  - **Set:** Duplicate-free wishlist collection
- **Deployment Platform:** Vercel

---

## 📁 Project Structure

```
bookStore/
├── docs/                       # Project Documentation
│   ├── SRS.md                  # Software Requirements Specification
│   ├── USER_STORIES.md         # Epics & User Stories with Acceptance Criteria
│   ├── SPRINT_PLAN.md          # 5-Week Sprint Roadmap & Milestones
│   ├── GIT_GUIDE.md            # Git branching and workflow tutorial
│   └── VERCEL_DEPLOYMENT.md    # Step-by-step Vercel deployment instructions
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # Backend API Route Handlers
│   │   │   ├── books/route.ts  # GET /api/books, POST /api/books
│   │   │   └── orders/route.ts # GET /api/orders, POST /api/orders
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # AntdRegistry & Root Context Provider
│   │   └── page.tsx            # Main Bookstore Home Page
│   ├── components/             # Reusable UI Components
│   │   ├── Navbar.tsx          # Header with navigation, badges & search
│   │   ├── FilterBar.tsx       # Search, genre tags, price slider, sort
│   │   ├── BookCard.tsx        # Ant Design book card with ratings
│   │   ├── BookDetailModal.tsx # Full book synopsis & details modal
│   │   ├── CartDrawer.tsx      # Cart drawer with Undo (Stack DSA)
│   │   ├── WishlistDrawer.tsx  # Wishlist drawer (Set DSA)
│   │   ├── CheckoutModal.tsx   # Order checkout & queue confirmation
│   │   ├── PublicApiCatalog.tsx# Gutendex Infinite Scroll with IntersectionObserver
│   │   ├── AdminPanel.tsx      # Inventory metrics & Add Book form
│   │   └── SprintRoadmapModal.tsx # Interactive presentation of Sprints & SRS
│   ├── context/
│   │   └── BookStoreContext.tsx# Centralized state management (Cart, Wishlist, Orders)
│   ├── data/
│   │   └── initialBooks.ts     # Initial curated catalog dataset
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── .gitignore                  # Git ignore rules
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies and scripts
├── README.md                   # Project overview & documentation
└── tsconfig.json               # TypeScript configuration
```

---

## 🚀 Getting Started

### Email verification and password reset

Authentication emails use [Resend](https://resend.com). Set `RESEND_API_KEY` in `.env.local` to a Resend API key and, optionally, set `RESEND_FROM_EMAIL` to a sender address verified in your Resend account. The default sender is Resend's `onboarding@resend.dev` test address.

Signup and email-verification requests send a six-digit code that expires after 10 minutes. Forgot password sends a separate code to the account email; the password can only be changed after submitting that code. Configure the Resend variables in your deployment environment as well as locally.

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🌿 Setting Up the GIT Environment

Follow these steps to set up your repository for collaboration and project delivery:

```bash
# 1. Initialize Git
git init

# 2. Add all files to staging
git add .

# 3. Create initial commit
git commit -m "feat: initial commit - Next.js, TypeScript & Ant Design Bookstore"

# 4. Create and switch to develop branch
git branch -M main
git checkout -b develop

# 5. Work in sprint feature branches (example for cart feature)
git checkout -b feature/cart-wishlist
# ... after changes ...
git add .
git commit -m "feat(cart): add cart drawer with undo stack"
git checkout develop
git merge feature/cart-wishlist
```
