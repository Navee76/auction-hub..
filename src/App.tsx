import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';

// Pages
import { DashboardPage } from './components/dashboard/DashboardPage';
import { AuctionListingPage } from './components/marketplace/AuctionListingPage';
import { AuctionDetailPage } from './components/marketplace/AuctionDetailPage';
import { CreateAuctionPage } from './components/create/CreateAuctionPage';
import { BidManagementPage } from './components/bids/BidManagementPage';
import { SettlementPage } from './components/settlement/SettlementPage';
import { CategoryManagementPage } from './components/categories/CategoryManagementPage';
import { UserDashboardPage } from './components/user/UserDashboardPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { SettingsPage } from './components/settings/SettingsPage';

const AppContent: React.FC = () => {
  const { activePage } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-[#EDE7FF] selection:text-[#7C3AED]">
      {/* Top Navigation */}
      <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen((p) => !p)} />

      {/* Main Container */}
      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 min-w-0 pb-16">
          {activePage === 'dashboard' && <DashboardPage />}
          {activePage === 'marketplace' && <AuctionListingPage />}
          {activePage === 'auction-detail' && <AuctionDetailPage />}
          {activePage === 'create-auction' && <CreateAuctionPage />}
          {activePage === 'bids' && <BidManagementPage />}
          {activePage === 'settlement' && <SettlementPage />}
          {activePage === 'categories' && <CategoryManagementPage />}
          {activePage === 'user-dashboard' && <UserDashboardPage />}
          {activePage === 'reports' && <ReportsPage />}
          {activePage === 'settings' && <SettingsPage />}

          {/* Clean Editorial Footer */}
          <footer className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">AuctionHub</span>
                <span>·</span>
                <span>Web Development Internship Task</span>
                <span>·</span>
                <span className="text-purple-600 dark:text-purple-400 font-medium">Data Alcott Systems</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Interactive Frontend Prototype · Local Storage Persistence
              </p>
            </div>
          </footer>
        </main>
      </div>

      {/* Overlays */}
      <ToastContainer />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
