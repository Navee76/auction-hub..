import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Auction,
  Bid,
  Category,
  Settlement,
  User,
  ToastMessage,
  ActiveNavPage,
  PaymentStatus,
  DeliveryStatus,
} from '../types';
import {
  INITIAL_AUCTIONS,
  INITIAL_CATEGORIES,
  INITIAL_SETTLEMENTS,
  INITIAL_USERS,
} from '../data/initialData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  auctions: Auction[];
  categories: Category[];
  settlements: Settlement[];
  watchlist: string[];
  recentlyViewed: string[];
  toasts: ToastMessage[];
  darkMode: boolean;
  activePage: ActiveNavPage;
  selectedAuctionId: string | null;
  searchQuery: string;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'register';
  
  // Navigation
  setActivePage: (page: ActiveNavPage) => void;
  openAuctionDetail: (id: string) => void;
  setSearchQuery: (q: string) => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  
  // Auth
  login: (email: string, pass: string) => boolean;
  register: (name: string, email: string, pass: string) => boolean;
  logout: () => void;
  switchDemoUser: (userId: string) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  
  // Auctions
  createAuction: (data: Omit<Auction, 'id' | 'createdAt' | 'bids' | 'status' | 'currentBid'>) => string;
  updateAuction: (id: string, updates: Partial<Auction>) => void;
  deleteAuction: (id: string) => boolean;
  placeBid: (auctionId: string, amount: number, isAutoBid?: boolean) => { success: boolean; message: string };
  forceExpireAuction: (auctionId: string) => void;
  simulateBotBid: (auctionId: string) => void;
  
  // Watchlist & History
  toggleWatchlist: (auctionId: string) => void;
  isWatchlisted: (auctionId: string) => boolean;
  addToRecentlyViewed: (auctionId: string) => void;
  
  // Categories
  addCategory: (cat: Omit<Category, 'id'>) => { success: boolean; message: string };
  updateCategory: (id: string, updates: Partial<Category>) => { success: boolean; message: string };
  deleteCategory: (id: string) => { success: boolean; message: string };
  
  // Settlements
  updateSettlement: (id: string, paymentStatus?: PaymentStatus, deliveryStatus?: DeliveryStatus) => void;
  
  // System
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  toggleDarkMode: () => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'auctionhub_users_v1',
  CURRENT_USER: 'auctionhub_current_user_v1',
  AUCTIONS: 'auctionhub_auctions_v1',
  CATEGORIES: 'auctionhub_categories_v1',
  SETTLEMENTS: 'auctionhub_settlements_v1',
  WATCHLIST: 'auctionhub_watchlist_v1',
  RECENT: 'auctionhub_recent_v1',
  THEME: 'auctionhub_theme_v1',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- USERS & AUTH ---
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
      return INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  // --- AUCTIONS ---
  const [auctions, setAuctions] = useState<Auction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUCTIONS);
      return saved ? JSON.parse(saved) : INITIAL_AUCTIONS;
    } catch {
      return INITIAL_AUCTIONS;
    }
  });

  // --- CATEGORIES ---
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // --- SETTLEMENTS ---
  const [settlements, setSettlements] = useState<Settlement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
      return saved ? JSON.parse(saved) : INITIAL_SETTLEMENTS;
    } catch {
      return INITIAL_SETTLEMENTS;
    }
  });

  // --- WATCHLIST & RECENT ---
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      return saved ? JSON.parse(saved) : ['auc-1', 'auc-2'];
    } catch {
      return ['auc-1', 'auc-2'];
    }
  });

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECENT);
      return saved ? JSON.parse(saved) : ['auc-1', 'auc-3'];
    } catch {
      return ['auc-1', 'auc-3'];
    }
  });

  // --- THEME ---
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      return saved === 'dark';
    } catch {
      return false;
    }
  });

  // --- NAVIGATION & UI ---
  const [activePage, setActivePage] = useState<ActiveNavPage>('dashboard');
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>('auc-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUCTIONS, JSON.stringify(auctions));
  }, [auctions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(settlements));
  }, [settlements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Periodic automatic auction completion checker
  useEffect(() => {
    const checkAuctionsStatus = () => {
      const now = new Date().getTime();
      let hasChanges = false;
      const updatedAuctions = auctions.map((auc) => {
        const startMs = new Date(auc.startTime).getTime();
        const endMs = new Date(auc.endTime).getTime();

        if (auc.status === 'upcoming' && now >= startMs && now < endMs) {
          hasChanges = true;
          return { ...auc, status: 'active' as const };
        }

        if (auc.status === 'active' && now >= endMs) {
          hasChanges = true;
          const hasBids = auc.bids && auc.bids.length > 0;
          if (hasBids) {
            const sortedBids = [...auc.bids].sort((a, b) => b.amount - a.amount);
            const highestBid = sortedBids[0];
            const reserveMet = !auc.reservePrice || highestBid.amount >= auc.reservePrice;

            if (reserveMet) {
              setSettlements((prev) => {
                if (prev.some((s) => s.auctionId === auc.id)) return prev;
                const newSettlement: Settlement = {
                  id: `stl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                  auctionId: auc.id,
                  auctionTitle: auc.title,
                  auctionImage: auc.imageUrl,
                  category: auc.category,
                  sellerId: auc.sellerId,
                  sellerName: auc.sellerName,
                  winnerId: highestBid.bidderId,
                  winnerName: highestBid.bidderName,
                  winningBid: highestBid.amount,
                  completedAt: new Date().toISOString(),
                  paymentStatus: 'pending',
                  deliveryStatus: 'processing',
                };
                return [newSettlement, ...prev];
              });

              return {
                ...auc,
                status: 'sold' as const,
                winnerId: highestBid.bidderId,
                winnerName: highestBid.bidderName,
                finalBidAmount: highestBid.amount,
              };
            }
          }

          return {
            ...auc,
            status: 'closed' as const,
            finalBidAmount: auc.currentBid,
          };
        }

        return auc;
      });

      if (hasChanges) {
        setAuctions(updatedAuctions);
      }
    };

    const interval = setInterval(checkAuctionsStatus, 5000);
    checkAuctionsStatus();
    return () => clearInterval(interval);
  }, [auctions]);

  // Toast Helpers
  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Methods
  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = (email: string, pass: string): boolean => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      addToast('error', 'Login Failed', 'No account found with this email.');
      return false;
    }
    if (user.password && user.password !== pass) {
      addToast('error', 'Login Failed', 'Incorrect password. Check your credentials.');
      return false;
    }
    setCurrentUser(user);
    closeAuthModal();
    addToast('success', 'Welcome Back', `Logged in successfully as ${user.name}`);
    return true;
  };

  const register = (name: string, email: string, pass: string): boolean => {
    if (!name.trim() || !email.trim() || !pass) {
      addToast('error', 'Validation Error', 'All fields are required.');
      return false;
    }
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      addToast('error', 'Email Taken', 'An account already exists with this email address.');
      return false;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: pass,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80`,
      bio: 'New auction member and prospective collector.',
      memberSince: new Date().toISOString().split('T')[0],
      balance: 10000,
    };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    closeAuthModal();
    addToast('success', 'Account Created', `Welcome to AuctionHub, ${newUser.name}! Starting balance: $10,000.`);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    addToast('info', 'Logged Out', 'You have been logged out.');
  };

  const switchDemoUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      addToast('info', 'Identity Switched', `Active user is now ${target.name}.`);
    }
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    addToast('success', 'Profile Updated', 'Your profile details have been saved.');
  };

  // Auction Methods
  const openAuctionDetail = (id: string) => {
    setSelectedAuctionId(id);
    addToRecentlyViewed(id);
    setActivePage('auction-detail');
  };

  const createAuction = (
    data: Omit<Auction, 'id' | 'createdAt' | 'bids' | 'status' | 'currentBid'>
  ): string => {
    const id = `auc-${Date.now()}`;
    const now = new Date().getTime();
    const startMs = new Date(data.startTime).getTime();
    const status: Auction['status'] = startMs > now ? 'upcoming' : 'active';

    const newAuction: Auction = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      currentBid: data.startingPrice,
      bids: [],
      status,
    };

    setAuctions((prev) => [newAuction, ...prev]);
    addToast('success', 'Auction Published', `"${newAuction.title}" has been listed.`);
    return id;
  };

  const updateAuction = (id: string, updates: Partial<Auction>) => {
    setAuctions((prev) =>
      prev.map((auc) => (auc.id === id ? { ...auc, ...updates } : auc))
    );
    addToast('success', 'Auction Updated', 'Changes were saved successfully.');
  };

  const deleteAuction = (id: string): boolean => {
    const target = auctions.find((a) => a.id === id);
    if (!target) return false;
    if (currentUser && target.sellerId !== currentUser.id) {
      addToast('error', 'Unauthorized', 'You can only delete your own auctions.');
      return false;
    }
    setAuctions((prev) => prev.filter((a) => a.id !== id));
    setWatchlist((prev) => prev.filter((wid) => wid !== id));
    addToast('info', 'Auction Deleted', `"${target.title}" was removed.`);
    if (activePage === 'auction-detail' && selectedAuctionId === id) {
      setActivePage('marketplace');
    }
    return true;
  };

  const placeBid = (
    auctionId: string,
    amount: number,
    isAutoBid = false
  ): { success: boolean; message: string } => {
    if (!currentUser) {
      openAuthModal('login');
      return { success: false, message: 'Please log in to place a bid.' };
    }

    const target = auctions.find((a) => a.id === auctionId);
    if (!target) {
      return { success: false, message: 'Auction not found.' };
    }

    if (target.sellerId === currentUser.id) {
      addToast('error', 'Bidding Restriction', 'You cannot bid on your own auction.');
      return { success: false, message: 'You cannot place bids on your own listings.' };
    }

    if (target.status !== 'active') {
      addToast('warning', 'Auction Not Active', `This auction is currently ${target.status}.`);
      return { success: false, message: `Auction is currently ${target.status}.` };
    }

    const now = new Date().getTime();
    if (new Date(target.endTime).getTime() <= now) {
      addToast('warning', 'Auction Closed', 'This auction has already ended.');
      return { success: false, message: 'Auction has already ended.' };
    }

    const minAllowed = target.bids.length === 0
      ? target.startingPrice
      : target.currentBid + target.minIncrement;

    if (amount < minAllowed) {
      const err = `Minimum bid must be at least $${minAllowed.toLocaleString()} (current bid + min increment).`;
      addToast('warning', 'Bid Too Low', err);
      return { success: false, message: err };
    }

    const newBid: Bid = {
      id: `bid-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      auctionId,
      bidderId: currentUser.id,
      bidderName: currentUser.name,
      bidderEmail: currentUser.email,
      amount,
      timestamp: new Date().toISOString(),
      isAutoBid,
    };

    setAuctions((prev) =>
      prev.map((auc) => {
        if (auc.id === auctionId) {
          return {
            ...auc,
            currentBid: amount,
            bids: [newBid, ...auc.bids],
          };
        }
        return auc;
      })
    );

    addToast(
      'success',
      'Bid Placed Successfully!',
      `You are now the highest bidder for $${amount.toLocaleString()}.`
    );

    return { success: true, message: 'Bid recorded successfully.' };
  };

  const forceExpireAuction = (auctionId: string) => {
    const nowIso = new Date(Date.now() - 1000).toISOString();
    setAuctions((prev) =>
      prev.map((auc) => {
        if (auc.id === auctionId) {
          const hasBids = auc.bids && auc.bids.length > 0;
          let status: Auction['status'] = 'closed';
          let winnerId: string | undefined = undefined;
          let winnerName: string | undefined = undefined;
          let finalBidAmount = auc.currentBid;

          if (hasBids) {
            const sortedBids = [...auc.bids].sort((a, b) => b.amount - a.amount);
            const highestBid = sortedBids[0];
            const reserveMet = !auc.reservePrice || highestBid.amount >= auc.reservePrice;

            if (reserveMet) {
              status = 'sold';
              winnerId = highestBid.bidderId;
              winnerName = highestBid.bidderName;
              finalBidAmount = highestBid.amount;

              setSettlements((sPrev) => [
                {
                  id: `stl-${Date.now()}`,
                  auctionId: auc.id,
                  auctionTitle: auc.title,
                  auctionImage: auc.imageUrl,
                  category: auc.category,
                  sellerId: auc.sellerId,
                  sellerName: auc.sellerName,
                  winnerId: highestBid.bidderId,
                  winnerName: highestBid.bidderName,
                  winningBid: highestBid.amount,
                  completedAt: new Date().toISOString(),
                  paymentStatus: 'pending',
                  deliveryStatus: 'processing',
                },
                ...sPrev.filter((s) => s.auctionId !== auc.id),
              ]);
            }
          }

          return {
            ...auc,
            endTime: nowIso,
            status,
            winnerId,
            winnerName,
            finalBidAmount,
          };
        }
        return auc;
      })
    );
    addToast('info', 'Auction Completed', `Simulated expiration processed for auction.`);
  };

  const simulateBotBid = (auctionId: string) => {
    const target = auctions.find((a) => a.id === auctionId);
    if (!target || target.status !== 'active') return;

    const botBidder = users.find((u) => u.id !== currentUser?.id && u.id !== target.sellerId) || users[1];
    const newAmount = target.currentBid + target.minIncrement;

    const newBid: Bid = {
      id: `bid-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      auctionId,
      bidderId: botBidder.id,
      bidderName: botBidder.name,
      bidderEmail: botBidder.email,
      amount: newAmount,
      timestamp: new Date().toISOString(),
    };

    setAuctions((prev) =>
      prev.map((auc) => {
        if (auc.id === auctionId) {
          return {
            ...auc,
            currentBid: newAmount,
            bids: [newBid, ...auc.bids],
          };
        }
        return auc;
      })
    );

    addToast(
      'warning',
      'New Competitive Bid!',
      `${botBidder.name} just placed a bid of $${newAmount.toLocaleString()} on "${target.title.slice(0, 30)}..."`
    );
  };

  const toggleWatchlist = (auctionId: string) => {
    setWatchlist((prev) => {
      const exists = prev.includes(auctionId);
      if (exists) {
        addToast('info', 'Removed from Watchlist', 'Auction removed from your watchlist.');
        return prev.filter((id) => id !== auctionId);
      } else {
        addToast('success', 'Added to Watchlist', 'You will receive notifications for this item.');
        return [...prev, auctionId];
      }
    });
  };

  const isWatchlisted = (auctionId: string) => watchlist.includes(auctionId);

  const addToRecentlyViewed = (auctionId: string) => {
    setRecentlyViewed((prev) => [auctionId, ...prev.filter((id) => id !== auctionId)].slice(0, 8));
  };

  const addCategory = (cat: Omit<Category, 'id'>) => {
    if (!cat.name.trim()) {
      return { success: false, message: 'Category name is required.' };
    }
    const exists = categories.some((c) => c.name.toLowerCase() === cat.name.trim().toLowerCase());
    if (exists) {
      addToast('error', 'Duplicate Category', 'A category with this name already exists.');
      return { success: false, message: 'Category name already exists.' };
    }
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: cat.name.trim(),
      description: cat.description.trim() || 'Custom auction collection.',
      iconName: cat.iconName || 'Package',
    };
    setCategories((prev) => [...prev, newCat]);
    addToast('success', 'Category Created', `Category "${newCat.name}" was added.`);
    return { success: true, message: 'Category created.' };
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    if (updates.name) {
      const exists = categories.some(
        (c) => c.id !== id && c.name.toLowerCase() === updates.name?.trim().toLowerCase()
      );
      if (exists) {
        addToast('error', 'Duplicate Category', 'Another category already uses this name.');
        return { success: false, message: 'Category name already in use.' };
      }
    }
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    addToast('success', 'Category Updated', 'Category details updated.');
    return { success: true, message: 'Updated.' };
  };

  const deleteCategory = (id: string) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return { success: false, message: 'Category not found.' };

    const isInUse = auctions.some((a) => a.category.toLowerCase() === target.name.toLowerCase());
    if (isInUse) {
      addToast('error', 'Cannot Delete', `Category "${target.name}" is assigned to active or past auctions.`);
      return { success: false, message: 'Cannot delete category while auctions are assigned to it.' };
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));
    addToast('info', 'Category Removed', `Category "${target.name}" was deleted.`);
    return { success: true, message: 'Category deleted.' };
  };

  const updateSettlement = (id: string, paymentStatus?: PaymentStatus, deliveryStatus?: DeliveryStatus) => {
    setSettlements((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            ...(paymentStatus ? { paymentStatus } : {}),
            ...(deliveryStatus ? { deliveryStatus } : {}),
          };
        }
        return s;
      })
    );
    addToast('success', 'Settlement Updated', 'Status changes recorded.');
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const resetDemoData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setAuctions(INITIAL_AUCTIONS);
    setCategories(INITIAL_CATEGORIES);
    setSettlements(INITIAL_SETTLEMENTS);
    setWatchlist(['auc-1', 'auc-2']);
    setRecentlyViewed(['auc-1', 'auc-3']);
    localStorage.clear();
    addToast('info', 'Demo Data Reset', 'Default internship prototype data has been restored.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        auctions,
        categories,
        settlements,
        watchlist,
        recentlyViewed,
        toasts,
        darkMode,
        activePage,
        selectedAuctionId,
        searchQuery,
        isAuthModalOpen,
        authMode,
        setActivePage,
        openAuctionDetail,
        setSearchQuery,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        switchDemoUser,
        updateUserProfile,
        createAuction,
        updateAuction,
        deleteAuction,
        placeBid,
        forceExpireAuction,
        simulateBotBid,
        toggleWatchlist,
        isWatchlisted,
        addToRecentlyViewed,
        addCategory,
        updateCategory,
        deleteCategory,
        updateSettlement,
        addToast,
        removeToast,
        toggleDarkMode,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
