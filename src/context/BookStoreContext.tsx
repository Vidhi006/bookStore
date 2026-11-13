'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { Address, Book, CartItem, Order, FilterState, User } from '@/types';
import { INITIAL_BOOKS } from '@/data/initialBooks';
import { message } from 'antd';
import { authService } from '@/services/authService';
import { bookService } from '@/services/bookService';
import { orderService } from '@/services/orderService';
import { userService } from '@/services/userService';

export type AuthModalTab = 'login' | 'signup' | 'verify' | 'forgot' | 'reset';

interface BookStoreContextType {
  // Books Catalog & Indexing
  books: Book[];
  isbnMap: Map<string, Book>;
  addBook: (newBook: Omit<Book, 'id'>) => Promise<void>;
  selectedBook: Book | null;
  setSelectedBook: (book: Book | null) => void;

  // Cart & Stack (Undo)
  cart: CartItem[];
  addToCart: (book: Book, quantity?: number) => void;
  updateCartQuantity: (bookId: string, quantity: number) => void;
  removeFromCart: (bookId: string) => void;
  undoRemove: () => void;
  canUndo: boolean;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Wishlist
  wishlist: Set<string>;
  toggleWishlist: (bookId: string) => void;
  isInWishlist: (bookId: string) => boolean;
  addReview: (bookId: string, rating: number, comment: string) => Promise<boolean>;
  updateProfile: (updates: {
    name?: string;
    mobile?: string;
    addresses?: Address[];
    wishlist?: string[];
  }) => Promise<boolean>;
  saveAddress: (address: Address) => Promise<boolean>;
  deleteAddress: (addressId: string) => Promise<boolean>;

  // Orders Queue
  orders: Order[];
  placeOrder: (customer: { name: string; email: string; address: string; mobile?: string }) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  catalogLoading: boolean;

  // Filter & Search
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  filteredBooks: Book[];

  // Navigation & Drawers
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  activeView: 'store' | 'public-archive' | 'admin';
  setActiveView: (view: 'store' | 'public-archive' | 'admin') => void;
  navigateToDashboard: () => void;

  // Authentication State & Actions
  user: User | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: AuthModalTab;
  setAuthModalTab: (tab: AuthModalTab) => void;
  pendingVerificationEmail: string;
  setPendingVerificationEmail: (email: string) => void;
  latestDispatchedCode: string | null;
  setLatestDispatchedCode: (code: string | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; requireVerification?: boolean }>;
  signup: (name: string, email: string, password: string, mobile?: string) => Promise<{ success: boolean; error?: string; code?: string; emailSent?: boolean }>;
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  resetPassword: (email: string, code: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationCode: (email: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  logout: () => Promise<void>;
}

const BookStoreContext = createContext<BookStoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'bookhaven_cart';
const WISHLIST_STORAGE_KEY = 'bookhaven_wishlist';
const userStorageKey = (prefix: string, userId: string) => `${prefix}:${userId}`;

export const BookStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Books State
  const [books, setBooks] = useState<Book[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // 2. Hash Map Index for ISBN Fast Lookup
  const isbnMap = useMemo(() => {
    const map = new Map<string, Book>();
    books.forEach((book) => {
      map.set(book.isbn, book);
    });
    return map;
  }, [books]);

  // 3. Cart State & Stack for Undo
  const [cart, setCart] = useState<CartItem[]>([]);
  const [undoStack, setUndoStack] = useState<CartItem[][]>([]);

  // 4. Wishlist State
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Tracks which signed-in user the cart/wishlist in memory belongs to.
  const [cartOwnerId, setCartOwnerId] = useState<string | null>(null);

  // 5. Orders Queue
  const [orders, setOrders] = useState<Order[]>([]);

  // 6. Navigation Drawers & View
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeView, setActiveView] = useState<'store' | 'public-archive' | 'admin'>('store');

  // 7. Search & Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedGenre: 'All',
    maxPrice: 5000,
    sortBy: 'none',
  });

  // 8. Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<AuthModalTab>('login');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [latestDispatchedCode, setLatestDispatchedCode] = useState<string | null>(null);

  // Load persisted client state and database catalog
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('bookhaven_auth_user');
        localStorage.removeItem('bookhaven_jwt_token');
      } catch {
        // ignore
      }
    }

    const loadAuthenticatedUser = async () => {
      try {
        const { status, ok, data } = await userService.getProfile();
        if (status === 401) return;
        if (!ok) throw new Error('Could not restore the authenticated session.');
        setUser(data.user as User);
      } catch (error) {
        console.error('[auth session]', error);
      }
    };

    const loadCatalog = async () => {
      setCatalogLoading(true);
      try {
        const [booksResult, ordersResult] = await Promise.all([
          bookService.list(),
          orderService.list(),
        ]);
        const booksData = booksResult.data;
        const ordersData = ordersResult.data;
        if (Array.isArray(booksData.books) && booksData.books.length) {
          setBooks(booksData.books);
        } else {
          setBooks(INITIAL_BOOKS);
        }
        if (Array.isArray(ordersData.orders)) {
          setOrders(ordersData.orders);
        }
      } catch {
        setBooks(INITIAL_BOOKS);
      } finally {
        setCatalogLoading(false);
      }
    };

    void loadAuthenticatedUser();
    void loadCatalog();
  }, []);

  // Load only the signed-in user's cart/wishlist. Signed-out visitors see an empty cart.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!user) {
      setCart([]);
      setWishlist(new Set());
      setUndoStack([]);
      setCartOwnerId(null);
      return;
    }

    try {
      const scopedCartKey = userStorageKey(CART_STORAGE_KEY, user.id);
      const scopedWishKey = userStorageKey(WISHLIST_STORAGE_KEY, user.id);

      // One-time migration: move any old shared key into this user's own key.
      const legacyCart = localStorage.getItem(CART_STORAGE_KEY);
      if (legacyCart !== null && localStorage.getItem(scopedCartKey) === null) {
        localStorage.setItem(scopedCartKey, legacyCart);
      }
      localStorage.removeItem(CART_STORAGE_KEY);

      const legacyWish = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (legacyWish !== null && localStorage.getItem(scopedWishKey) === null) {
        localStorage.setItem(scopedWishKey, legacyWish);
      }
      localStorage.removeItem(WISHLIST_STORAGE_KEY);

      const storedCart = localStorage.getItem(scopedCartKey);
      setCart(storedCart ? (JSON.parse(storedCart) as CartItem[]) : []);

      const storedWish = localStorage.getItem(scopedWishKey);
      const nextWishlist = new Set<string>(
        storedWish ? (JSON.parse(storedWish) as string[]) : []
      );
      for (const id of user.wishlist || []) nextWishlist.add(id);
      setWishlist(nextWishlist);
    } catch {
      setCart([]);
      setWishlist(new Set(user.wishlist || []));
    }

    setCartOwnerId(user.id);
  }, [user?.id]);

  // Persist each user's cart/wishlist under their own key once it has been loaded.
  useEffect(() => {
    if (typeof window === 'undefined' || !user || cartOwnerId !== user.id) return;
    localStorage.setItem(userStorageKey(CART_STORAGE_KEY, user.id), JSON.stringify(cart));
  }, [cart, user, cartOwnerId]);

  useEffect(() => {
    if (typeof window === 'undefined' || !user || cartOwnerId !== user.id) return;
    localStorage.setItem(
      userStorageKey(WISHLIST_STORAGE_KEY, user.id),
      JSON.stringify(Array.from(wishlist))
    );
  }, [wishlist, user, cartOwnerId]);

  // Refresh saved cart lines from the live catalogue so prices/stock that were
  // changed in the database (e.g. the USD -> INR conversion) are reflected in
  // carts that were persisted in the browser before the change.
  useEffect(() => {
    if (!books.length || !cart.length) return;
    setCart((previous) => {
      let changed = false;
      const next = previous.map((item) => {
        const live = isbnMap.get(item.book.isbn);
        if (!live) return item;
        if (live.price === item.book.price && live.stock === item.book.stock) return item;
        changed = true;
        return {
          ...item,
          book: {
            ...item.book,
            price: live.price,
            originalPrice: live.originalPrice,
            stock: live.stock,
          },
        };
      });
      return changed ? next : previous;
    });
  }, [books, isbnMap, cart]);

  const persistProfile = async (updates: {
    name?: string;
    mobile?: string;
    addresses?: Address[];
    wishlist?: string[];
  }): Promise<boolean> => {
    try {
      const { ok, data } = await userService.updateProfile(updates);
      if (!ok) {
        message.error(data.error || 'Could not update your profile.');
        return false;
      }
      setUser(data.user as User);
      return true;
    } catch {
      message.error('Network error while updating your profile.');
      return false;
    }
  };

  const updateProfile = async (updates: {
    name?: string;
    mobile?: string;
    addresses?: Address[];
    wishlist?: string[];
  }) => {
    if (!user) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      message.warning('Please sign in to update your profile.');
      return false;
    }
    const ok = await persistProfile(updates);
    if (ok) message.success('Profile updated successfully.');
    return ok;
  };

  const saveAddress = async (address: Address) => {
    if (!user) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      message.warning('Please sign in to save an address.');
      return false;
    }
    const current = user.addresses || [];
    const exists = current.some((item) => item.id === address.id);
    const addresses = exists
      ? current.map((item) => (item.id === address.id ? address : item))
      : [...current, address];
    return updateProfile({ addresses });
  };

  const deleteAddress = async (addressId: string) => {
    if (!user) return false;
    const addresses = (user.addresses || []).filter((item) => item.id !== addressId);
    return updateProfile({ addresses });
  };

  // Cart Total
  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.book.price * item.quantity, 0);
  }, [cart]);

  // Total Quantity in Cart
  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Add Book Action — persist in SQLite via API
  const addBook = async (newBookData: Omit<Book, 'id'>) => {
    try {
      const { ok, data } = await bookService.create(newBookData);
      const created = data.book;
      if (!ok || !created) {
        message.error(data.error || 'Could not save book to the database.');
        return;
      }
      setBooks((prev) => [created, ...prev]);
      message.success(`"${created.title}" saved to inventory.`);
    } catch {
      message.error('Network error while saving book.');
    }
  };

  // Add to Cart - Enforces user authentication and email verification!
  const addToCart = (book: Book, requestedQuantity = 1) => {
    if (!user) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      message.warning('Please sign in to add items to your cart.');
      return;
    }

    if (!user.isEmailVerified) {
      setPendingVerificationEmail(user.email);
      setAuthModalTab('verify');
      setIsAuthModalOpen(true);
      message.warning('Please verify your email to unlock purchases.');
      return;
    }

    if (book.stock <= 0) {
      message.warning(`"${book.title}" is out of stock.`);
      return;
    }

    const quantityToAdd = Math.max(1, Math.floor(requestedQuantity));
    const existing = cart.find((item) => item.book.id === book.id);

    if (existing) {
      if (existing.quantity >= book.stock) {
        message.warning(`Only ${book.stock} copies in stock.`);
        return;
      }
      const nextQuantity = Math.min(existing.quantity + quantityToAdd, book.stock);
      setCart((prev) =>
        prev.map((item) =>
          item.book.id === book.id ? { ...item, quantity: nextQuantity } : item
        )
      );
      message.success(`Updated quantity for "${book.title}".`);
      return;
    }

    const initialQuantity = Math.min(quantityToAdd, book.stock);
    setCart((prev) => [...prev, { book, quantity: initialQuantity }]);
    message.success(`Added "${book.title}" to cart.`);
  };

  // Update Cart Quantity
  const updateCartQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.book.id === bookId) {
          if (quantity > item.book.stock) {
            message.warning(`Maximum available stock is ${item.book.stock}`);
            return { ...item, quantity: item.book.stock };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  // Remove from Cart
  const removeFromCart = (bookId: string) => {
    setUndoStack((prevStack) => [...prevStack, cart]);
    setCart((prev) => prev.filter((item) => item.book.id !== bookId));
    message.info('Item removed. You can click Undo to restore it.');
  };

  // Undo Remove from Cart
  const undoRemove = () => {
    if (undoStack.length === 0) {
      message.info('Nothing to undo.');
      return;
    }
    const previousSnapshot = undoStack[undoStack.length - 1];
    setCart(previousSnapshot);
    setUndoStack((prevStack) => prevStack.slice(0, -1));
    message.success('Restored previous item to cart.');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist toggle
  const toggleWishlist = (bookId: string) => {
    if (!user) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      message.warning('Please log in to use your wishlist.');
      return;
    }

    // Keep side effects out of the state updater: React Strict Mode invokes
    // updaters twice in development, which would duplicate the toast and the
    // profile save request.
    const nextSet = new Set(wishlist);
    if (nextSet.has(bookId)) {
      nextSet.delete(bookId);
      message.info('Removed from wishlist');
    } else {
      nextSet.add(bookId);
      message.success('Added to wishlist');
    }

    setWishlist(nextSet);
    void persistProfile({ wishlist: Array.from(nextSet) });
  };

  const isInWishlist = (bookId: string) => wishlist.has(bookId);

  const addReview = async (bookId: string, rating: number, comment: string) => {
    if (!user) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      message.warning('Please sign in to write a review.');
      return false;
    }
    try {
      const { ok, data } = await bookService.addReview(bookId, rating, comment);
      const updated = data.book;
      if (!ok || !updated) {
        message.error(data.error || 'Could not save your review.');
        return false;
      }
      setBooks((prev) => prev.map((book) => (book.id === bookId ? updated : book)));
      message.success('Thanks! Your review has been posted.');
      return true;
    } catch {
      message.error('Network error while posting your review.');
      return false;
    }
  };

  // Place Order 
  const placeOrder = async (customer: { name: string; email: string; address: string; mobile?: string }): Promise<Order | null> => {
    try {
      const { ok, data } = await orderService.create({
        customerName: customer.name,
        customerEmail: customer.email,
        shippingAddress: customer.address,
        customerMobile: customer.mobile,
        items: cart,
        totalAmount: cartTotal,
        userId: user?.id,
      });
      const created = data.order;
      if (!ok || !created) {
        message.error(data.error || 'Could not save order.');
        return null;
      }
      setOrders((prevQueue) => [...prevQueue, created]);
      if (Array.isArray(data.stockUpdates)) {
        const stocks = new Map<string, number>();
        for (const line of data.stockUpdates as { id: string; stock: number }[]) {
          stocks.set(line.id, line.stock);
        }
        setBooks((prev) =>
          prev.map((book) => (stocks.has(book.id) ? { ...book, stock: stocks.get(book.id)! } : book))
        );
      }
      clearCart();
      setUndoStack([]);
      return created;
    } catch {
      message.error('Network error while placing order.');
      return null;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { ok, data } = await orderService.updateStatus(orderId, status);
      if (!ok) {
        message.error(data.error || 'Could not update order.');
        return;
      }
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status } : order))
      );
      message.success(`Order ${orderId} status updated to ${status}.`);
    } catch {
      message.error('Network error while updating order.');
    }
  };

  // Filter & Search Logic
  const filteredBooks = useMemo(() => {
    let result = books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(filters.searchQuery.toLowerCase());
      const matchesGenre =
        filters.selectedGenre === 'All' || book.genre === filters.selectedGenre;
      const matchesPrice = book.price <= filters.maxPrice;

      return matchesSearch && matchesGenre && matchesPrice;
    });

    if (filters.sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'rating-desc') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'newest') {
      result = [...result].sort((a, b) => b.publishedYear - a.publishedYear);
    }

    return result;
  }, [books, filters]);

  // Auth Operations
  const login = async (email: string, password: string) => {
    try {
      const { ok, data } = await authService.login(email, password);

      if (!ok) {
        if (data.requireVerification) {
          setPendingVerificationEmail(email);
          if (data.verificationCode) {
            setLatestDispatchedCode(data.verificationCode);
          }
          setAuthModalTab('verify');
          setIsAuthModalOpen(true);
          message.warning('Email verification required before accessing your account.');
          return { success: false, requireVerification: true, error: data.message };
        }
        message.error(data.error || 'Login failed.');
        return { success: false, error: data.error };
      }

      const loggedInUser = data.user as User;
      setUser(loggedInUser);
      message.success(`Welcome, ${loggedInUser.name}!`);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch {
      message.error('Network error during login.');
      return { success: false, error: 'Network error' };
    }
  };

  const signup = async (name: string, email: string, password: string, mobile?: string) => {
    try {
      const { ok, data } = await authService.signup(name, email, password, mobile);

      if (!ok) {
        message.error(data.error || 'Signup failed.');
        return { success: false, error: data.error };
      }

      setPendingVerificationEmail(email);
      setAuthModalTab('verify');
      if (data.emailSent) {
        message.success('Account created! A 6-digit verification code was sent to your email.');
      } else {
        message.error('Account created, but the verification email could not be sent. Use Resend Code to try again.');
      }
      return { success: true, emailSent: data.emailSent };
    } catch {
      message.error('Network error during signup.');
      return { success: false, error: 'Network error' };
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      const { ok, data } = await authService.verifyEmail(email, code);

      if (!ok) {
        message.error(data.error || 'Verification failed.');
        return { success: false, error: data.error };
      }

      setUser(data.user as User);
      message.success('Email successfully verified! Welcome to BookHaven.');
      setIsAuthModalOpen(false);
      return { success: true };
    } catch {
      message.error('Network error during verification.');
      return { success: false, error: 'Network error' };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const { ok, data } = await authService.forgotPassword(email);

      if (!ok) {
        message.error(data.error || 'Failed to send reset code.');
        return { success: false, error: data.error };
      }

      setPendingVerificationEmail(email);
      setAuthModalTab('reset');
      message.success('Password reset code sent to your email.');
      return { success: true };
    } catch {
      message.error('Network error during forgot password.');
      return { success: false, error: 'Network error' };
    }
  };

  const resetPassword = async (email: string, code: string, newPass: string) => {
    try {
      const { ok, data } = await authService.resetPassword(email, code, newPass);

      if (!ok) {
        message.error(data.error || 'Failed to reset password.');
        return { success: false, error: data.error };
      }

      message.success('Password successfully reset! You can now log in.');
      setAuthModalTab('login');
      return { success: true };
    } catch {
      message.error('Network error during password reset.');
      return { success: false, error: 'Network error' };
    }
  };

  const resendVerificationCode = async (email: string) => {
    try {
      const { ok, data } = await authService.resendCode(email);

      if (!ok) {
        message.error(data.error || 'Failed to resend code.');
        return { success: false, error: data.error };
      }

      if (data.verificationCode) {
        setLatestDispatchedCode(data.verificationCode);
      }
      message.success('A fresh verification code has been dispatched to your email.');
      return { success: true, code: data.verificationCode };
    } catch {
      message.error('Network error while resending code.');
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      const { ok } = await authService.logout();
      if (!ok) throw new Error('Could not clear the authentication cookie.');
    } catch (error) {
      console.error('[auth logout]', error);
      message.error('Could not complete sign out. Please try again.');
      return;
    }
    setUser(null);
    setCart([]);
    setWishlist(new Set());
    setUndoStack([]);
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    if (activeView === 'admin') {
      setActiveView('store');
    }
    message.info('You have been signed out.');
  };

  const navigateToDashboard = useCallback(() => {
    if (!user) {
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      message.warning('Please log in with an administrator account to access the dashboard.');
      return;
    }

    if (!user.isEmailVerified) {
      setPendingVerificationEmail(user.email);
      setAuthModalTab('verify');
      setIsAuthModalOpen(true);
      message.warning('Please verify your email before accessing the dashboard.');
      return;
    }

    setActiveView('admin');
  }, [user]);

  return (
    <BookStoreContext.Provider
      value={{
        books,
        catalogLoading,
        isbnMap,
        addBook,
        selectedBook,
        setSelectedBook,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        undoRemove,
        canUndo: undoStack.length > 0,
        clearCart,
        cartTotal,
        cartCount,
        wishlist,
        toggleWishlist,
        isInWishlist,
        addReview,
        updateProfile,
        saveAddress,
        deleteAddress,
        orders,
        placeOrder,
        updateOrderStatus,
        filters,
        setFilters,
        filteredBooks,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        activeView,
        setActiveView,
        navigateToDashboard,
        user,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        pendingVerificationEmail,
        setPendingVerificationEmail,
        latestDispatchedCode,
        setLatestDispatchedCode,
        login,
        signup,
        verifyEmail,
        forgotPassword,
        resetPassword,
        resendVerificationCode,
        logout,
      }}
    >
      {children}
    </BookStoreContext.Provider>
  );
};

export const useBookStore = () => {
  const context = useContext(BookStoreContext);
  if (!context) {
    throw new Error('useBookStore must be used within a BookStoreProvider');
  }
  return context;
};
