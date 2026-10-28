import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Gavel,
  Search,
  Bell,
  Heart,
  Moon,
  Sun,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Menu,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    currentUser,
    users,
    watchlist,
    darkMode,
    searchQuery,
    setSearchQuery,
    setActivePage,
    openAuthModal,
    logout,
    switchDemoUser,
    toggleDarkMode,
    auctions,
    openAuctionDetail,
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute notifications from recent bids
  const recentBids = auctions
    .flatMap((a) =>
      a.bids.map((b) => ({
        ...b,
        auctionTitle: a.title,
        auctionId: a.id,
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActivePage('marketplace');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Mobile Hamburger & Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActivePage('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-xs group-hover:bg-purple-700 transition-colors">
              <Gavel className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-none font-sans">
                Auction<span className="text-purple-600">Hub</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Online Auction Platform
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Global Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-md mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search art, electronics, roadsters, jewelry..."
              className="w-full pl-10 pr-4 py-2 text-xs md:text-sm bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl border border-transparent focus:border-purple-600 focus:outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Zone 3: Actions (Watchlist, Notifications, Theme, User) */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          
          {/* Watchlist Shortcut */}
          <button
            onClick={() => setActivePage('user-dashboard')}
            title="My Watchlist"
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Heart className="w-5 h-5" />
            {watchlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                {watchlist.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen((p) => !p)}
              title="Recent Activity"
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {recentBids.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-600" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50">
                <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Recent Live Bids
                  </span>
                  <span className="text-[11px] text-slate-400">Live feed</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recentBids.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No recent bidding activity
                    </div>
                  ) : (
                    recentBids.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => {
                          openAuctionDetail(b.auctionId);
                          setIsNotifOpen(false);
                        }}
                        className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-900 dark:text-white line-clamp-1">
                            {b.bidderName}
                          </span>
                          <span className="text-xs font-semibold font-mono text-purple-600 dark:text-purple-400">
                            ${b.amount.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {b.auctionTitle}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Account / Profile */}
          <div className="relative" ref={profileRef}>
            {currentUser ? (
              <button
                onClick={() => setIsProfileOpen((p) => !p)}
                className="flex items-center gap-2 p-1 pl-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200/80 dark:border-slate-700/80"
              >
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1 max-w-[100px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
                    ${currentUser.balance.toLocaleString()}
                  </span>
                </div>
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-purple-600/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
            )}

            {/* Profile Dropdown */}
            {isProfileOpen && currentUser && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                  <div className="mt-2 flex items-center justify-between p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                    <span className="text-[11px] font-medium">Demo Balance</span>
                    <span className="text-xs font-bold font-mono">
                      ${currentUser.balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Switch Demo Identity */}
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                    Switch Demo Account
                  </p>
                  <div className="space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchDemoUser(u.id);
                          setIsProfileOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                          u.id === currentUser.id
                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{u.name}</span>
                        {u.id === currentUser.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-1">
                  <button
                    onClick={() => {
                      setActivePage('user-dashboard');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>My Dashboard & Bids</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>

                <div className="px-3 pt-2 pb-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    Internship Prototype Session
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
