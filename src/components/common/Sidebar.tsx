import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveNavPage } from '../../types';
import {
  LayoutDashboard,
  PlusCircle,
  ShoppingBag,
  Gavel,
  Trophy,
  FolderTree,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: ActiveNavPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const {
    activePage,
    setActivePage,
    currentUser,
    logout,
    openAuthModal,
    watchlist,
    settlements,
  } = useApp();

  // Pending settlements count
  const pendingSettlements = settlements.filter(
    (s) => s.paymentStatus === 'pending' || s.deliveryStatus === 'processing'
  ).length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Main Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'marketplace',
      label: 'Auction Listing',
      icon: ShoppingBag,
    },
    {
      id: 'create-auction',
      label: 'Create Auction',
      icon: PlusCircle,
    },
    {
      id: 'bids',
      label: 'Bid Management',
      icon: Gavel,
    },
    {
      id: 'settlement',
      label: 'Winning & Settlement',
      icon: Trophy,
      badge: pendingSettlements > 0 ? pendingSettlements : undefined,
    },
    {
      id: 'categories',
      label: 'Category Management',
      icon: FolderTree,
    },
    {
      id: 'user-dashboard',
      label: 'User Dashboard',
      icon: UserCheck,
      badge: watchlist.length > 0 ? `${watchlist.length} saved` : undefined,
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Settings & Data',
      icon: Settings,
    },
  ];

  const handleNavClick = (pageId: ActiveNavPage) => {
    setActivePage(pageId);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <span className="text-sm font-bold text-slate-900 dark:text-white">Navigation Menu</span>
        <button
          onClick={onCloseMobile}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          aria-label="Close Sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Auction Platform
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-150 group text-left ${
                isActive
                  ? 'bg-[#EDE7FF] dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-[#7C3AED] dark:text-purple-400'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold font-mono shrink-0 ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Internship Project Footer Box */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-slate-50 dark:from-purple-950/30 dark:to-slate-900 border border-purple-100 dark:border-purple-900/40">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7C3AED] dark:text-purple-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Data Alcott Systems</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
            Web Development Internship Project by candidate.
          </p>
        </div>

        {currentUser ? (
          <button
            onClick={logout}
            className="w-full mt-2.5 flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="w-full mt-2.5 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-xs"
          >
            Sign In to Bid
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-xs h-full z-10 animate-in slide-in-from-left">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
