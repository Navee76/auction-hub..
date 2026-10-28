import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SafeImage } from '../common/SafeImage';
import { AuctionCard } from '../marketplace/AuctionCard';
import {
  User,
  Package,
  Gavel,
  Trophy,
  Heart,
  DollarSign,
  TrendingUp,
  Clock,
  Edit3,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const UserDashboardPage: React.FC = () => {
  const {
    currentUser,
    auctions,
    watchlist,
    openAuctionDetail,
    openAuthModal,
    updateUserProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'my-auctions' | 'my-bids' | 'items-won' | 'watchlist' | 'selling-history'
  >('my-auctions');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser?.name || '');
  const [bioInput, setBioInput] = useState(currentUser?.bio || '');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-[#7C3AED] flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sign In Required</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
          Access your personal seller hub, watchlist, active bids, and won lots.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-5 py-2.5 bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Filter user's data
  const myAuctions = auctions.filter((a) => a.sellerId === currentUser.id);
  const myActiveAuctions = myAuctions.filter((a) => a.status === 'active');
  const myUpcomingAuctions = myAuctions.filter((a) => a.status === 'upcoming');
  const myClosedAuctions = myAuctions.filter((a) => a.status === 'closed' || a.status === 'sold');

  const myBidsOnAuctions = auctions.flatMap((a) =>
    a.bids
      .filter((b) => b.bidderId === currentUser.id)
      .map((b) => ({
        ...b,
        auctionTitle: a.title,
        auctionId: a.id,
        auctionImage: a.imageUrl,
        category: a.category,
        currentHighest: a.currentBid,
        isWinning: a.currentBid === b.amount && (a.status === 'active' || a.status === 'sold'),
        status: a.status,
      }))
  );

  const itemsWon = auctions.filter(
    (a) => a.status === 'sold' && a.winnerId === currentUser.id
  );

  const watchlistedAuctions = auctions.filter((a) => watchlist.includes(a.id));

  const totalSoldRevenue = myAuctions
    .filter((a) => a.status === 'sold')
    .reduce((sum, a) => sum + (a.finalBidAmount || a.currentBid), 0);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: nameInput.trim() || currentUser.name,
      bio: bioInput.trim() || currentUser.bio,
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Profile Card Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-purple-100 dark:bg-purple-950 text-purple-600 font-extrabold text-2xl flex items-center justify-center shrink-0 ring-2 ring-purple-600/30">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              currentUser.name.charAt(0)
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {currentUser.name}
              </h1>
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              {currentUser.bio || 'Verified auction participant and art collector.'}
            </p>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="text-left md:text-right">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Wallet Balance</span>
            <span className="text-2xl font-extrabold font-mono text-purple-600 dark:text-purple-400">
              ${currentUser.balance.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => {
              setNameInput(currentUser.name);
              setBioInput(currentUser.bio || '');
              setIsEditingProfile(true);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsEditingProfile(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit User Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">Display Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold mb-1">Collector Bio</label>
                <textarea
                  rows={3}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7C3AED] hover:bg-purple-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secondary Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'my-auctions', label: `My Auctions (${myAuctions.length})`, icon: Package },
          { id: 'my-bids', label: `My Bids (${myBidsOnAuctions.length})`, icon: Gavel },
          { id: 'items-won', label: `Items Won (${itemsWon.length})`, icon: Trophy },
          { id: 'watchlist', label: `Watchlist (${watchlistedAuctions.length})`, icon: Heart },
          { id: 'selling-history', label: `Seller Earnings ($${totalSoldRevenue.toLocaleString()})`, icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panes */}

      {/* 1. MY AUCTIONS */}
      {activeTab === 'my-auctions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {myActiveAuctions.length} Active · {myUpcomingAuctions.length} Upcoming · {myClosedAuctions.length} Concluded
            </span>
          </div>

          {myAuctions.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">You haven't listed any auctions yet</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">List art, jewelry, vehicles or electronics for bidding.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myAuctions.map((auc) => (
                <AuctionCard key={auc.id} auction={auc} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. MY BIDS */}
      {activeTab === 'my-bids' && (
        <div className="space-y-4">
          {myBidsOnAuctions.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <Gavel className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No active bids placed</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myBidsOnAuctions.map((bid) => (
                <div
                  key={bid.id}
                  onClick={() => openAuctionDetail(bid.auctionId)}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-shadow flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                      <SafeImage src={bid.auctionImage} alt={bid.auctionTitle} fallbackCategory={bid.category} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {bid.auctionTitle}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        My Bid: <span className="font-mono font-bold text-slate-900 dark:text-white">${bid.amount.toLocaleString()}</span>
                      </p>
                      <span className={`text-[10px] font-bold uppercase mt-1 inline-block ${
                        bid.isWinning ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {bid.isWinning ? '● Highest Bid' : '▲ Outbid'}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. ITEMS WON */}
      {activeTab === 'items-won' && (
        <div className="space-y-4">
          {itemsWon.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <Trophy className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No items won yet</h3>
              <p className="text-xs text-slate-400 mt-1">Participate in auctions ending soon to secure winning bids.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {itemsWon.map((auc) => (
                <AuctionCard key={auc.id} auction={auc} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. WATCHLIST */}
      {activeTab === 'watchlist' && (
        <div className="space-y-4">
          {watchlistedAuctions.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <Heart className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Your watchlist is empty</h3>
              <p className="text-xs text-slate-400 mt-1">Click the heart icon on any auction card to save it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {watchlistedAuctions.map((auc) => (
                <AuctionCard key={auc.id} auction={auc} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. SELLING HISTORY & EARNINGS */}
      {activeTab === 'selling-history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Consignment & Sales Ledger</h3>
              <p className="text-xs text-slate-400 mt-0.5">Summary of settled lots consigned by your account</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Gross Earnings</span>
              <span className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                ${totalSoldRevenue.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {myAuctions.filter((a) => a.status === 'sold').length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No sold lots in your consignor ledger yet.</p>
            ) : (
              myAuctions
                .filter((a) => a.status === 'sold')
                .map((auc) => (
                  <div key={auc.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{auc.title}</h4>
                      <p className="text-slate-400 text-[11px]">Buyer: {auc.winnerName} · Category: {auc.category}</p>
                    </div>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      ${auc.finalBidAmount?.toLocaleString()}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
