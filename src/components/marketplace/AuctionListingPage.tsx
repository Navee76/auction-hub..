import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AuctionCard } from './AuctionCard';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const AuctionListingPage: React.FC = () => {
  const {
    auctions,
    categories,
    searchQuery,
    setSearchQuery,
    setActivePage,
  } = useApp();

  // Local filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('endingSoon');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter & sort logic
  const filteredAuctions = useMemo(() => {
    return auctions.filter((auc) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = auc.title.toLowerCase().includes(q);
        const matchesDesc = auc.description.toLowerCase().includes(q);
        const matchesCat = auc.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      // Category
      if (selectedCategory !== 'All') {
        if (auc.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Status
      if (selectedStatus !== 'all') {
        if (auc.status !== selectedStatus) return false;
      }

      // Price
      const price = auc.currentBid;
      if (minPrice && price < parseFloat(minPrice)) return false;
      if (maxPrice && price > parseFloat(maxPrice)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'priceLow') {
        return a.currentBid - b.currentBid;
      }
      if (sortBy === 'priceHigh') {
        return b.currentBid - a.currentBid;
      }
      if (sortBy === 'mostBids') {
        return b.bids.length - a.bids.length;
      }
      if (sortBy === 'endingSoon') {
        // Active first, then by nearest end time
        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      }
      return 0;
    });
  }, [auctions, searchQuery, selectedCategory, selectedStatus, minPrice, maxPrice, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAuctions.length / itemsPerPage) || 1;
  const paginatedAuctions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAuctions.slice(start, start + itemsPerPage);
  }, [filteredAuctions, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedStatus('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('endingSoon');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner / Hero Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Live Auction Marketplace
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse verified luxury lots, art, automobiles, and rare collector artifacts with real-time bidding.
          </p>
        </div>

        <button
          onClick={() => setActivePage('create-auction')}
          className="self-start md:self-auto py-2.5 px-4 bg-[#7C3AED] hover:bg-purple-700 text-white text-xs md:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>List Item for Auction</span>
        </button>
      </div>

      {/* Category Horizontal Filter Bar (Interactive segmented buttons) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            setSelectedCategory('All');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedCategory === 'All'
              ? 'bg-[#7C3AED] text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          All Lots ({auctions.length})
        </button>

        {categories.map((cat) => {
          const count = auctions.filter(
            (a) => a.category.toLowerCase() === cat.name.toLowerCase()
          ).length;
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();

          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.name);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Filter and Sorting Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'sold', label: 'Sold' },
              { id: 'closed', label: 'Ended' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedStatus(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedStatus === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort & Mobile Filters Toggle */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
              >
                <option value="endingSoon">Ending Soonest</option>
                <option value="newest">Newly Listed</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="mostBids">Most Bids</option>
              </select>
            </div>

            <button
              onClick={() => setShowFiltersMobile((p) => !p)}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Price Filter</span>
            </button>
          </div>

        </div>

        {/* Price Filter Strip (Desktop always, mobile toggleable) */}
        <div className={`pt-3 border-t border-slate-100 dark:border-slate-800 ${showFiltersMobile ? 'block' : 'hidden md:flex'} items-center justify-between gap-4 flex-wrap`}>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">Price Range (USD):</span>
            <div className="relative w-28">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">$</span>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-6 pr-2 py-1 text-xs font-mono bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 focus:border-purple-600 focus:outline-hidden"
              />
            </div>
            <span className="text-slate-400 text-xs">to</span>
            <div className="relative w-28">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">$</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-6 pr-2 py-1 text-xs font-mono bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 focus:border-purple-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">
              Showing {filteredAuctions.length} {filteredAuctions.length === 1 ? 'auction' : 'auctions'}
            </span>
            {(selectedCategory !== 'All' || selectedStatus !== 'all' || minPrice || maxPrice || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Auction Cards Grid */}
      {paginatedAuctions.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-[#7C3AED] flex items-center justify-center mx-auto mb-3">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No Auctions Match Your Criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
            Try adjusting your search terms, changing the category, or clearing your price filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedAuctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-xl text-xs font-semibold font-mono transition-colors ${
                  currentPage === i + 1
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
