# User Stories & Acceptance Criteria

This document translates the Bookstore requirements and technical architecture into agile User Stories broken down by epic.

---

## Epic 1: Repository & Development Foundation
### US-1.1: Git Repository & Branching Structure
- **As a** developer,
- **I want** to initialize a Git repository with `main` and `develop` branches and structured conventions,
- **So that** team members can build features in isolation without stepping on each other's code.
- **Acceptance Criteria:**
  - Git initialized with `.gitignore` excluding `node_modules`, `.next`, and environment variables.
  - Initial commit made on `main`.
  - `develop` branch created for integrating weekly sprints.
  - Branching guide provided in `GIT_GUIDE.md`.

---

## Epic 2: Catalog & Book Discovery
### US-2.1: Book Catalog Grid
- **As a** bookstore customer,
- **I want** to browse books with clear card details (cover, title, author, price, rating, category, stock),
- **So that** I can easily discover books I wish to purchase.
- **Acceptance Criteria:**
  - Responsive grid layout rendered with Ant Design `Row`, `Col`, and `Card`.
  - Cards show badges for low stock and genre tags.
  - Clicking a card opens detailed book view with ISBN lookup.

### US-2.2: Live Search & Filtering
- **As a** bookstore customer,
- **I want** to search books by title or author and filter by category and price,
- **So that** I can quickly locate specific genres or budget-friendly books.
- **Acceptance Criteria:**
  - Instant search input with clear icon.
  - Category filter dropdown / buttons (Fiction, Sci-Fi, Self-Help, Science, Mystery).
  - Price slider with minimum and maximum bounds.
  - Sort selector (Price Low-to-High, High-to-Low, Highest Rated).

### US-2.3: Public Catalog Infinite Scroll (Gutendex Integration)
- **As a** book enthusiast,
- **I want** to browse public domain books seamlessly through infinite scrolling,
- **So that** I can explore thousands of free classical books without page reloads.
- **Acceptance Criteria:**
  - Toggle between Curated Store and Public Archive (Gutendex API).
  - Intersection Observer loads next page when sentinel element approaches viewport.
  - Deduplication prevents duplicate book entries.
  - Graceful loading skeleton and retry button on network errors.

---

## Epic 3: Cart, Wishlist & DSA Operations
### US-3.1: Shopping Cart Drawer
- **As a** bookstore customer,
- **I want** to add books to my shopping cart and adjust quantities,
- **So that** I can review my selected books before checkout.
- **Acceptance Criteria:**
  - Floating badge indicates total cart quantity.
  - Cart drawer displays items, item prices, subtotal, and total calculated via `reduce`.
  - Quantity increment/decrement buttons with stock limit safeguards.

### US-3.2: Undo Cart Removal (Stack DSA)
- **As a** bookstore customer,
- **I want** to undo the accidental deletion of an item from my cart,
- **So that** I don't lose items I had previously selected.
- **Acceptance Criteria:**
  - When an item is removed, the previous cart state is pushed onto an Undo Stack ($LIFO$).
  - An "Undo" notification / button pops the last state and restores the item.

### US-3.3: Wishlist (Set DSA)
- **As a** bookstore customer,
- **I want** to save books to my wishlist with a single click,
- **So that** I can keep track of books I'd like to buy later without duplicates.
- **Acceptance Criteria:**
  - Heart icon on book card toggles wishlist state.
  - Internal storage uses a JavaScript `Set` ensuring no duplicate book IDs.
  - Wishlist drawer / modal displays all saved books.

---

## Epic 4: Checkout & Order Queue
### US-4.1: Seamless Order Checkout
- **As a** bookstore customer,
- **I want** to enter my shipping and contact information and place my order,
- **So that** I can purchase my books.
- **Acceptance Criteria:**
  - Checkout form with Ant Design validation rules (Name, Email, Delivery Address).
  - Order is placed into an Order Queue ($FIFO$).
  - Confirmation screen displays Order ID, estimated dispatch, and queue position.
  - Cart is cleared upon successful order submission.

---

## Epic 5: Store Management & Admin Dashboard
### US-5.1: Inventory & Order Oversight
- **As a** bookstore owner/admin,
- **I want** to view store metrics, manage book inventory, and see queued orders,
- **So that** I can keep the store running smoothly.
- **Acceptance Criteria:**
  - Admin view with summary statistic cards (Total Books, In Stock, Orders in Queue).
  - Add Book form with ISBN, title, author, price, and category.
  - Orders table displaying order status and customer details.

---

## Epic 6: Deployment & Vercel Showcase
### US-6.1: Vercel Production Deployment
- **As a** stakeholder / student,
- **I want** the full application deployed to Vercel with zero runtime or build errors,
- **So that** I can share the live working link with reviewers, professors, and users.
- **Acceptance Criteria:**
  - `npm run build` succeeds locally with zero TypeScript or Lint warnings.
  - Application deploys cleanly to Vercel with automated preview URLs.
