import React from 'react';
import { useApp } from '../../context/AppContext';
import { AuctionCard } from '../marketplace/AuctionCard';
import {
  Gavel,
  Trophy,
  DollarSign,
  TrendingUp,
  Package,
  Clock,
  ArrowRight,
  PlusCircle,
  Eye,
  Sparkles,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    auctions,
    currentUser,
    setActivePage,
    openAuctionDetail,
    categories,
  } = useApp();

  // Metrics dynamically computed from current state
  const totalAuctions = auctions.length;
  const activeAuctions = auctions.filter((a) => a.status === 'active').length;
  const upcomingAuctions = auctions.filter((a) => a.status === 'upcoming').length;
  const closedAuctions = auctions.filter((a) => a.status === 'closed' || a.status === 'sold').length;

  const totalBids = auctions.reduce((acc, a) => acc + (a.bids?.length || 0), 0);

  const itemsWon = auctions.filter(
    (a) => a.status === 'sold' && a.winnerId === currentUser?.id
  ).length;

  const itemsSold = auctions.filter(
    (a) => a.status === 'sold' && a.sellerId === currentUser?.id
  ).length;

  const estimatedRevenue = auctions
    .filter((a) => a.status === 'sold')
    .reduce((acc, a) => acc + (a.finalBidAmount || a.currentBid), 0);

  // Ending soonest (active only)
  const endingSoonAuctions = [...auctions]
    .filter((a) => a.status === 'active')
    .sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())
    .slice(0, 3);

  // Recently added
  const recentAdditions = [...auctions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // My recent bids
  const myBidsWithAuction = currentUser
    ? auctions
        .flatMap((a) =>
          a.bids
            .filter((b) => b.bidderId === currentUser.id)
            .map((b) => ({
              ...b,
              auctionTitle: a.title,
              auctionId: a.id,
              auctionStatus: a.status,
              isWinning: a.currentBid === b.amount && (a.status === 'active' || a.status === 'sold'),
            }))
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5)
    : [];

  // Category distribution for Analytics Chart
  const categoryStats = categories.map((cat) => {
    const count = auctions.filter((a) => a.category.toLowerCase() === cat.name.toLowerCase()).length;
    const bidCount = auctions
      .filter((a) => a.category.toLowerCase() === cat.name.toLowerCase())
      .reduce((sum, a) => sum + a.bids.length, 0);
    return { name: cat.name, count, bidCount };
  });

  const maxCategoryBids = Math.max(...categoryStats.map((c) => c.bidCount), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-[#7C3AED] to-purple-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-purple-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Welcome, {currentUser?.name || 'Collector'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            Next-Generation Online Auction & Bidding Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
            Real-time bidding engine with live countdowns, reserve protection, settlement workflows, and comprehensive portfolio tracking.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setActivePage('marketplace')}
              className="px-4 py-2 bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <span>Explore Live Auctions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActivePage('create-auction')}
              className="px-4 py-2 bg-purple-700/60 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-colors flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Listing</span>
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Primary KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Auctions</span>
            <Package className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {totalAuctions}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span className="text-emerald-600 font-semibold">{activeAuctions} Active</span>
            <span>·</span>
            <span>{upcomingAuctions} Upcoming</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Bids Placed</span>
            <Gavel className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {totalBids}
          </p>
          <p className="text-[11px] text-slate-500 mt-2">
            Across {categories.length} item categories
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Items Won / Sold</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
              {itemsWon}
            </span>
            <span className="text-xs text-slate-400">won</span>
            <span className="text-slate-300">/</span>
            <span className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400">
              {itemsSold}
            </span>
            <span className="text-xs text-slate-400">sold</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Personal transaction activity</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Settled Sales Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            ${estimatedRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
            Closed with successful reserve
          </p>
        </div>

      </div>

      {/* Middle Grid: Category Analytics Chart + My Recent Bids Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Category Performance Analytics (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-purple-600" />
                <span>Bidding Engagement by Category</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Calculated in real-time from active and closed bids</p>
            </div>
            <button
              onClick={() => setActivePage('reports')}
              className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
            >
              Full Reports →
            </button>
          </div>

          {/* Custom SVG/CSS Bar Distribution */}
          <div className="space-y-3.5 pt-2">
            {categoryStats.map((item) => {
              const percentage = Math.round((item.bidCount / maxCategoryBids) * 100);
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      {item.bidCount} bids ({item.count} lots)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-[#7C3AED] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Recent Bids Stream (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>My Recent Bids</span>
            </h3>
            <button
              onClick={() => setActivePage('bids')}
              className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
            >
              Manage Bids →
            </button>
          </div>

          {myBidsWithAuction.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <Gavel className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No active bids yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Explore the auction listing to place your first bid.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-1">
              {myBidsWithAuction.map((bid) => (
                <div
                  key={bid.id}
                  onClick={() => openAuctionDetail(bid.auctionId)}
                  className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-2 transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {bid.auctionTitle}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span>{new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>·</span>
                      <span className={bid.isWinning ? 'text-emerald-600 font-semibold' : 'text-amber-600'}>
                        {bid.isWinning ? 'Highest Bidder' : 'Outbid'}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white shrink-0">
                    ${bid.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Auctions Ending Soon Strip */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" />
              <span>Auctions Ending Soon</span>
            </h2>
            <p className="text-xs text-slate-400">Place bids before final countdown expiration</p>
          </div>

          <button
            onClick={() => setActivePage('marketplace')}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <span>View All ({activeAuctions})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {endingSoonAuctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      </div>

      {/* Recently Added Lots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>Recently Added Collections</span>
            </h2>
            <p className="text-xs text-slate-400">Newly cataloged lots open for registration and bidding</p>
          </div>

          <button
            onClick={() => setActivePage('marketplace')}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentAdditions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      </div>

    </div>
  );
};
