# Software Requirements Specification (SRS)
## Online Bookstore Web Application (BookHaven)

---

### 1. Introduction
#### 1.1 Purpose
This document provides a comprehensive specification for the **BookHaven Bookstore Web Application**, built using React.js, Next.js (App Router), TypeScript, and Ant Design. It outlines the functional and non-functional requirements designed specifically with beginner-friendly clarity, clean software architecture, and real-world deployment on Vercel.

#### 1.2 Scope of the Application
The BookHaven application serves two primary actors:
1. **Shoppers / Readers (Client):**
   - Browse catalog with responsive book cards.
   - Live search by title, author, or genre.
   - Filter by genre, price range, and sort by price/rating.
   - View rich book details (ISBN, synopsis, author, rating, stock status).
   - Manage Cart (adjust quantity, calculate subtotal and total using functional programming `reduce`).
   - Undo last removed item from cart (using **Stack** data structure `LIFO`).
   - Manage Wishlist with guaranteed uniqueness (using **Set** data structure).
   - Place orders into an **Order Queue** (`FIFO`).
   - Infinite scroll integration with public book catalog APIs (Gutendex).
2. **Store Admins (Management):**
   - View store overview and live inventory metrics.
   - Add new books to the catalog with validation.
   - View and manage orders in the queue.

---

### 2. Overall Description
#### 2.1 3-Tier Architecture
- **Tier 1 (Presentation & Client State):** Next.js 14, React 18, Ant Design 5 (UI components), CSS-in-JS registry, React Context + Hook-based store.
- **Tier 2 (Application & API Layer):** Next.js Route Handlers (`/api/books`, `/api/orders`, `/api/cart`), Input validation, Order Queue manager.
- **Tier 3 (Data & Cache Layer):** Curated in-memory catalog with ISBN Hash Map indexing ($O(1)$ lookup), Wishlist Set, Undo Stack, and optional external Gutendex API integration.

#### 2.2 Core Concepts & Data Structures (DSA)
- **Hash Table / Map ($O(1)$):** Fast lookup by ISBN and Book ID without traversing the whole list.
- **Set:** Duplicate-free wishlist collection.
- **Stack ($LIFO$):** Undo functionality for removed cart items.
- **Queue ($FIFO$):** Order processing pipeline where the first placed order is processed first.
- **Array methods:** `filter()` for search and genre filtering, `map()` for rendering cards, `reduce()` for cart total summation.

---

### 3. Functional Requirements

#### FR-01: Git Version Control Setup
- Initialize Git repository with `main` (production-ready) and `develop` (staging/integration) branches.
- Feature branching strategy: `feature/catalog`, `feature/cart-wishlist`, `feature/checkout-orders`.
- Standard `.gitignore` to prevent committing secrets or `node_modules`.

#### FR-02: Book Catalog & Discovery
- Display book cover, title, author, price, rating badge, stock status, and category tag.
- Client-side and API-based instant search across title and author.
- Multi-genre filtering (Fiction, Sci-Fi, Self-Help, Science, Mystery).
- Price range slider filter.
- Sorting options (Price: Low to High, Price: High to Low, Rating: High to Low).
- Infinite scroll / pagination capability connecting to Gutendex open book metadata.

#### FR-03: Cart & Wishlist Management
- Add book to cart with stock validation.
- Increment, decrement, and remove items with real-time price re-calculation.
- Undo button that uses a Stack to restore the last removed item.
- Toggle book to Wishlist using a Set to guarantee zero duplicates.
- Floating / Header cart drawer accessible from any page.

#### FR-04: Order Checkout & Queue
- Simple checkout modal with customer details (name, email, delivery address).
- Confirmation of order with generated Order ID and Queue Position.
- Reset cart upon successful checkout.

#### FR-05: Admin Management
- Admin dashboard displaying total books, low stock alerts, and queued orders.
- Form to add new books with ISBN, title, author, price, category, and stock.
- Order status updates (Pending -> Processing -> Completed).

---

### 4. Non-Functional Requirements
1. **Usability:** Ant Design components provide accessible, consistent, and beginner-friendly UI with toasts (`message`) and modals.
2. **Performance:** Instant client-side filtering and memoization with `useMemo`.
3. **Responsive Design:** Mobile-first layout adaptable from smartphone screens (360px) to desktops (1440px).
4. **Vercel Readiness:** Zero build errors, standard Next.js directory structure, automated CI/CD compatibility.
