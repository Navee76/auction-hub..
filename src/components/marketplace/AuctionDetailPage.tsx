import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SafeImage } from '../common/SafeImage';
import { CountdownTimer } from '../common/CountdownTimer';
import {
  ArrowLeft,
  Heart,
  Share2,
  Gavel,
  ShieldCheck,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Bot,
  Trash2,
} from 'lucide-react';

export const AuctionDetailPage: React.FC = () => {
  const {
    selectedAuctionId,
    auctions,
    currentUser,
    placeBid,
    simulateBotBid,
    forceExpireAuction,
    deleteAuction,
    toggleWatchlist,
    isWatchlisted,
    setActivePage,
    openAuthModal,
    addToast,
  } = useApp();

  const auction = auctions.find((a) => a.id === selectedAuctionId);

  // Fallback if no auction selected
  if (!auction) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-20">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Auction Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">The requested auction might have been removed or does not exist.</p>
        <button
          onClick={() => setActivePage('marketplace')}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const minNextBid = auction.bids.length === 0
    ? auction.startingPrice
    : auction.currentBid + auction.minIncrement;

  const [bidAmount, setBidAmount] = useState<number>(minNextBid);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoBid, setIsAutoBid] = useState(false);
  const [maxAutoBid, setMaxAutoBid] = useState<number>(minNextBid * 1.5);
  const [showAutoBidModal, setShowAutoBidModal] = useState(false);

  const watchlisted = isWatchlisted(auction.id);
  const isSeller = currentUser?.id === auction.sellerId;
  const isExpired = new Date(auction.endTime).getTime() <= new Date().getTime();
  const isActive = auction.status === 'active' && !isExpired;
  const reserveMet = !auction.reservePrice || auction.currentBid >= auction.reservePrice;

  // Sorted bid history (newest first)
  const sortedBids = [...auction.bids].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleQuickAdd = (increment: number) => {
    setBidAmount((prev) => Math.max(minNextBid, prev + increment));
  };

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal('login');
      return;
    }

    if (bidAmount < minNextBid) {
      addToast('warning', 'Bid Too Low', `Minimum bid is $${minNextBid.toLocaleString()}`);
      return;
    }

    setIsSubmitting(true);
    const result = placeBid(auction.id, bidAmount, isAutoBid);
    setIsSubmitting(false);

    if (result.success) {
      setBidAmount(bidAmount + auction.minIncrement);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('success', 'Link Copied', 'Auction link copied to clipboard.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Breadcrumb & Action Strip */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setActivePage('marketplace')}
          className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Simulation Tools for Internship Evaluation */}
          {isActive && (
            <>
              <button
                type="button"
                onClick={() => simulateBotBid(auction.id)}
                title="Simulate a real-time competitor bid"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 hover:bg-purple-100 transition-colors border border-purple-200 dark:border-purple-800"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Simulate Bot Bid</span>
              </button>

              <button
                type="button"
                onClick={() => forceExpireAuction(auction.id)}
                title="Instantly expire to test Journey 5 winner determination"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors border border-amber-200 dark:border-amber-800"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Simulate Expiry</span>
              </button>
            </>
          )}

          {isSeller && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your auction listing?')) {
                  deleteAuction(auction.id);
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-xl transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}

          <button
            onClick={() => toggleWatchlist(auction.id)}
            className={`p-2 rounded-xl border transition-colors ${
              watchlisted
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 border-rose-200 dark:border-rose-900'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
            title="Toggle Watchlist"
          >
            <Heart className={`w-4 h-4 ${watchlisted ? 'fill-current text-rose-600' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
            title="Share Auction"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Gallery + Right Purchase & Bidding Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image & Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 aspect-4/3 relative shadow-md">
            <SafeImage
              src={auction.imageUrl}
              alt={auction.title}
              fallbackCategory={auction.category}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Description & Product Specifications */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Product Overview</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {auction.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-[11px] text-slate-400 block uppercase font-medium">Category</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-white">{auction.category}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-[11px] text-slate-400 block uppercase font-medium">Condition</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-white">{auction.condition}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-[11px] text-slate-400 block uppercase font-medium">Starting Bid</span>
                <span className="text-xs font-semibold font-mono text-slate-800 dark:text-white">
                  ${auction.startingPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Seller Profile Information */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 font-bold flex items-center justify-center text-base">
                {auction.sellerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{auction.sellerName}</h4>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified Seller · Member since {auction.sellerMemberSince || '2023'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500 justify-end">
                <span>★</span>
                <span>{auction.sellerRating || '4.9'}</span>
              </div>
              <span className="text-[11px] text-slate-400">100% Positive Feedback</span>
            </div>
          </div>

          {/* Bid History Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Bidding History ({auction.bids.length})
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Sorted chronologically</span>
            </div>

            {sortedBids.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                <Gavel className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No bids yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Be the first collector to place a bid!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedBids.map((bid, index) => {
                  const isWinning = index === 0 && (isActive || auction.status === 'sold');
                  return (
                    <div
                      key={bid.id}
                      className={`py-3 flex items-center justify-between text-xs ${
                        isWinning ? 'bg-purple-50/60 dark:bg-purple-950/20 -mx-2 px-2 rounded-xl' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isWinning
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {bid.bidderName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {bid.bidderName}
                            </span>
                            {isWinning && (
                              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                Highest Bid
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(bid.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                          ${bid.amount.toLocaleString()}
                        </span>
                        {bid.isAutoBid && (
                          <span className="block text-[10px] text-slate-400">Auto-bid</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Sticky Purchase & Bidding Module (5 cols) */}
        <div className="lg:col-span-5 sticky top-20 space-y-5">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-[#7C3AED] dark:text-purple-400">{auction.category}</span>
                <span className="font-mono text-slate-400">ID: {auction.id}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {auction.title}
              </h1>
            </div>

            {/* Countdown Banner */}
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  {isActive ? 'Auction Closes In' : 'Auction Timeline'}
                </span>
                <span className="text-[11px] text-purple-700 dark:text-purple-300">
                  Ends {new Date(auction.endTime).toLocaleDateString()}
                </span>
              </div>
              <CountdownTimer endTime={auction.endTime} startTime={auction.startTime} />
            </div>

            {/* Pricing Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
                  {auction.bids.length === 0 ? 'Starting Price' : 'Current Highest Bid'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                    ${auction.currentBid.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">USD</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block mb-0.5">Min Increment</span>
                <span className="text-sm font-semibold font-mono text-slate-700 dark:text-slate-300">
                  +${auction.minIncrement.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Reserve Price Status */}
            {auction.reservePrice && (
              <div className="flex items-center justify-between text-xs px-2">
                <span className="text-slate-500">Reserve Price Status:</span>
                <span className={`font-semibold flex items-center gap-1 ${
                  reserveMet ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {reserveMet ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {reserveMet ? 'Reserve Met' : 'Reserve Not Yet Met'}
                </span>
              </div>
            )}

            {/* Winner banner if sold */}
            {auction.status === 'sold' && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Auction Won by {auction.winnerName || 'Winning Bidder'}</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                  Final closing price: ${auction.finalBidAmount?.toLocaleString()}. Item has moved to Winning & Settlement.
                </p>
                <button
                  onClick={() => setActivePage('settlement')}
                  className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  View Settlement Workflow
                </button>
              </div>
            )}

            {/* Closed banner if closed without winner */}
            {auction.status === 'closed' && (
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  This auction has concluded without reaching the reserve requirement or without bids.
                </p>
              </div>
            )}

            {/* Interactive Bidding Form */}
            {isActive && (
              <form onSubmit={handlePlaceBid} className="space-y-4 pt-2">
                
                {isSeller ? (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs border border-amber-200 dark:border-amber-900">
                    You are the seller of this auction. Sellers are not permitted to place bids on their own listings.
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        <span>Your Bid Amount (USD)</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          Min: ${minNextBid.toLocaleString()}
                        </span>
                      </div>

                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">
                          $
                        </span>
                        <input
                          type="number"
                          min={minNextBid}
                          step={auction.minIncrement}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(Number(e.target.value))}
                          className="w-full pl-8 pr-4 py-3 text-lg font-bold font-mono tabular-nums bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-purple-600 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Quick Bid Increment Buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(auction.minIncrement)}
                        className="py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-600 font-mono text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        +${auction.minIncrement}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(100)}
                        className="py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-600 font-mono text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        +$100
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(250)}
                        className="py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-600 font-mono text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        +$250
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(500)}
                        className="py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-600 font-mono text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        +$500
                      </button>
                    </div>

                    {/* Auto-bid option */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={isAutoBid}
                          onChange={(e) => setIsAutoBid(e.target.checked)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="font-medium">Enable Auto-Bid (Proxy Bidding)</span>
                      </label>
                      <Zap className="w-3.5 h-3.5 text-purple-600" />
                    </div>

                    {/* Submit Bid Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 bg-[#7C3AED] hover:bg-purple-700 text-white font-bold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Gavel className="w-4 h-4" />
                      <span>{currentUser ? `Place Bid of $${bidAmount.toLocaleString()}` : 'Sign In to Place Bid'}</span>
                    </button>
                  </>
                )}

              </form>
            )}

            {/* Buyer Protection Guarantee */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>AuctionHub Guarantee:</strong> Secure simulated escrow protection. Authentic provenance inspection backed by verified sellers.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
