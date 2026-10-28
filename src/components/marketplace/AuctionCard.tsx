import React from 'react';
import { Auction } from '../../types';
import { useApp } from '../../context/AppContext';
import { SafeImage } from '../common/SafeImage';
import { CountdownTimer } from '../common/CountdownTimer';
import { Heart, Gavel, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AuctionCardProps {
  auction: Auction;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  const { openAuctionDetail, toggleWatchlist, isWatchlisted } = useApp();
  const watchlisted = isWatchlisted(auction.id);

  const isSold = auction.status === 'sold';
  const isClosed = auction.status === 'closed';
  const isUpcoming = auction.status === 'upcoming';
  const isActive = auction.status === 'active';

  const reserveMet = !auction.reservePrice || auction.currentBid >= auction.reservePrice;

  return (
    <div className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Image Container with Safe Image & Watchlist Button */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer" onClick={() => openAuctionDetail(auction.id)}>
        <SafeImage
          src={auction.imageUrl}
          alt={auction.title}
          fallbackCategory={auction.category}
          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
        />

        {/* Watchlist Floating Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWatchlist(auction.id);
          }}
          aria-label={watchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            watchlisted
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-white hover:text-rose-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${watchlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Status Pill Badge */}
        <div className="absolute top-3 left-3">
          {isActive && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/90 text-white backdrop-blur-xs shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              Live Auction
            </span>
          )}
          {isUpcoming && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/90 text-white backdrop-blur-xs shadow-xs">
              Upcoming
            </span>
          )}
          {isSold && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-600/95 text-white backdrop-blur-xs shadow-xs flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Sold
            </span>
          )}
          {isClosed && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-700/90 text-white backdrop-blur-xs shadow-xs">
              Ended (No Sale)
            </span>
          )}
        </div>

        {/* Live Countdown Overlay Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-3 pt-6 flex items-center justify-between text-white">
          <CountdownTimer endTime={auction.endTime} startTime={auction.startTime} compact />
          <span className="text-[11px] font-mono text-slate-200">
            {auction.bids.length} {auction.bids.length === 1 ? 'bid' : 'bids'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category & Condition unboxed text */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="font-medium text-purple-600 dark:text-purple-400">{auction.category}</span>
          <span aria-hidden="true">·</span>
          <span>{auction.condition}</span>
        </div>

        {/* Product Title */}
        <h3
          onClick={() => openAuctionDetail(auction.id)}
          className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-[#7C3AED] dark:hover:text-purple-400 cursor-pointer transition-colors leading-snug mb-3"
          title={auction.title}
        >
          {auction.title}
        </h3>

        {/* Price & Bid Information */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              {auction.bids.length === 0 ? 'Starting Bid' : 'Current Highest Bid'}
            </span>
            <span className="text-base font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
              ${auction.currentBid.toLocaleString()}
            </span>
          </div>

          <div className="text-right">
            {auction.reservePrice && (
              <span className={`text-[10px] block font-medium ${reserveMet ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {reserveMet ? 'Reserve Met' : 'Reserve Pending'}
              </span>
            )}
            <span className="text-[11px] text-slate-400 font-mono">
              +${auction.minIncrement} min
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => openAuctionDetail(auction.id)}
          className={`w-full mt-3.5 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            isActive
              ? 'bg-[#7C3AED] hover:bg-purple-700 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
          }`}
        >
          <Gavel className="w-3.5 h-3.5" />
          <span>{isActive ? 'Place Bid & View' : 'View Auction Details'}</span>
        </button>
      </div>
    </div>
  );
};
