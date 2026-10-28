import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SafeImage } from '../common/SafeImage';
import {
  Gavel,
  Trophy,
  AlertTriangle,
  Calculator,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const BidManagementPage: React.FC = () => {
  const {
    currentUser,
    auctions,
    openAuctionDetail,
    openAuthModal,
    addToast,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'all' | 'winning' | 'outbid' | 'won'>('all');

  // Bid Increment Calculator state
  const [calcBasePrice, setCalcBasePrice] = useState<number>(1000);
  const [calcNumBids, setCalcNumBids] = useState<number>(5);
  const [calcIncrement, setCalcIncrement] = useState<number>(100);

  // Auto-bid proxy tool state
  const [proxyAuctionId, setProxyAuctionId] = useState<string>(auctions[0]?.id || '');
  const [maxProxyBid, setMaxProxyBid] = useState<number>(10000);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-[#7C3AED] flex items-center justify-center mx-auto mb-3">
          <Gavel className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sign In Required</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
          Please sign in to view your placed bids, outbid alerts, and auto-bidding rules.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-5 py-2.5 bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          Sign In to Account
        </button>
      </div>
    );
  }

  // Aggregate user's bids across all auctions
  const userBids = auctions
    .flatMap((auction) => {
      const myBidsOnAuction = auction.bids.filter((b) => b.bidderId === currentUser.id);
      if (myBidsOnAuction.length === 0) return [];

      // Sort my bids descending
      const mySorted = [...myBidsOnAuction].sort((a, b) => b.amount - a.amount);
      const myHighest = mySorted[0];

      const isAuctionSold = auction.status === 'sold';
      const isWinner = isAuctionSold && auction.winnerId === currentUser.id;
      const isWinningLive =
        auction.status === 'active' && auction.currentBid === myHighest.amount;
      const isOutbid =
        auction.status === 'active' && auction.currentBid > myHighest.amount;
      const isClosedLost =
        (auction.status === 'closed' || (isAuctionSold && !isWinner));

      let computedStatus: 'winning' | 'outbid' | 'won' | 'lost' = 'outbid';
      if (isWinner) computedStatus = 'won';
      else if (isWinningLive) computedStatus = 'winning';
      else if (isClosedLost) computedStatus = 'lost';

      return myBidsOnAuction.map((bid) => ({
        ...bid,
        auctionId: auction.id,
        auctionTitle: auction.title,
        auctionImage: auction.imageUrl,
        category: auction.category,
        currentHighestBid: auction.currentBid,
        auctionStatus: auction.status,
        auctionEndTime: auction.endTime,
        computedStatus,
        isMyHighest: bid.id === myHighest.id,
      }));
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Filter bids by status
  const filteredBids = userBids.filter((b) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'winning') return b.computedStatus === 'winning';
    if (filterStatus === 'outbid') return b.computedStatus === 'outbid';
    if (filterStatus === 'won') return b.computedStatus === 'won';
    return true;
  });

  // Calculate increment table
  const projectedIncrements = Array.from({ length: calcNumBids }).map((_, i) => ({
    bidNumber: i + 1,
    amount: calcBasePrice + (i + 1) * calcIncrement,
  }));

  const handleSaveProxy = (e: React.FormEvent) => {
    e.preventDefault();
    const target = auctions.find((a) => a.id === proxyAuctionId);
    if (!target) return;
    addToast(
      'success',
      'Auto-Bid Rule Saved',
      `Auto-bid proxy configured up to $${maxProxyBid.toLocaleString()} for "${target.title.slice(0, 30)}..."`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bid Management & Activity
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track all active bids, winning positions, outbid notifications, and proxy automation rules.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          {[
            { id: 'all', label: `All (${userBids.length})` },
            { id: 'winning', label: 'Currently Winning' },
            { id: 'outbid', label: 'Outbid' },
            { id: 'won', label: 'Won Items' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-white dark:bg-slate-900 text-[#7C3AED] dark:text-purple-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Bids Table (8 cols) + Calculator & Proxy (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Bids List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {filteredBids.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <Gavel className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                No Bids Found in this View
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                Explore the marketplace and place bids on active auctions to track your positions.
              </p>
              <button
                onClick={() => setFilterStatus('all')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBids.map((bid) => {
                let badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
                let statusLabel = 'Outbid';
                let Icon = AlertTriangle;

                if (bid.computedStatus === 'winning') {
                  badgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
                  statusLabel = 'Winning Highest Bid';
                  Icon = CheckCircle2;
                } else if (bid.computedStatus === 'won') {
                  badgeClass = 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300';
                  statusLabel = 'Auction Won';
                  Icon = Trophy;
                } else if (bid.computedStatus === 'lost') {
                  badgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
                  statusLabel = 'Closed';
                  Icon = Clock;
                }

                return (
                  <div
                    key={bid.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                        <SafeImage
                          src={bid.auctionImage}
                          alt={bid.auctionTitle}
                          fallbackCategory={bid.category}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${badgeClass}`}>
                            <Icon className="w-3 h-3" />
                            <span>{statusLabel}</span>
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(bid.timestamp).toLocaleDateString()} at{' '}
                            {new Date(bid.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <h4
                          onClick={() => openAuctionDetail(bid.auctionId)}
                          className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer line-clamp-1"
                        >
                          {bid.auctionTitle}
                        </h4>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span>
                            My Bid: <strong className="font-mono text-slate-900 dark:text-white">${bid.amount.toLocaleString()}</strong>
                          </span>
                          <span>·</span>
                          <span>
                            Top Bid: <strong className="font-mono text-purple-600 dark:text-purple-400">${bid.currentHighestBid.toLocaleString()}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => openAuctionDetail(bid.auctionId)}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-[#7C3AED] dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors flex items-center gap-1.5"
                      >
                        <span>View Lot</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Tools & Utilities (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Bid Increment Calculator */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Bid Increment Calculator
                </h3>
                <p className="text-[11px] text-slate-400">Project upcoming bids</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Starting Price ($)
                </label>
                <input
                  type="number"
                  value={calcBasePrice}
                  onChange={(e) => setCalcBasePrice(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Increment ($)
                  </label>
                  <input
                    type="number"
                    value={calcIncrement}
                    onChange={(e) => setCalcIncrement(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Bids Ahead
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={calcNumBids}
                    onChange={(e) => setCalcNumBids(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              {/* Table of projected bids */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 max-h-40 overflow-y-auto">
                <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                  Projected Trajectory:
                </span>
                {projectedIncrements.map((p) => (
                  <div
                    key={p.bidNumber}
                    className="flex items-center justify-between py-1 text-slate-700 dark:text-slate-300 font-mono"
                  >
                    <span>Round +{p.bidNumber}</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      ${p.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Auto-Bid Settings Interface */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Proxy Auto-Bid Automation
                </h3>
                <p className="text-[11px] text-slate-400">Set maximum ceiling limits</p>
              </div>
            </div>

            <form onSubmit={handleSaveProxy} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Target Auction
                </label>
                <select
                  value={proxyAuctionId}
                  onChange={(e) => setProxyAuctionId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 truncate"
                >
                  {auctions
                    .filter((a) => a.status === 'active')
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title} (${a.currentBid.toLocaleString()})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Maximum Auto-Bid Ceiling ($)
                </label>
                <input
                  type="number"
                  value={maxProxyBid}
                  onChange={(e) => setMaxProxyBid(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                Our system will automatically outbid competitors by the minimum increment up to your preset ceiling.
              </p>

              <button
                type="submit"
                className="w-full py-2 px-3 bg-[#7C3AED] hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
              >
                Apply Proxy Settings
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
