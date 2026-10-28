import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  Package,
  Gavel,
  Trophy,
  DollarSign,
  TrendingUp,
  PieChart,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { auctions, categories, addToast } = useApp();

  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [dateRange, setDateRange] = useState<'all' | '30d' | '7d'>('all');

  // Filtered dataset for reporting
  const filteredAuctions = useMemo(() => {
    const now = new Date().getTime();
    return auctions.filter((auc) => {
      if (filterCategory !== 'All' && auc.category.toLowerCase() !== filterCategory.toLowerCase()) {
        return false;
      }
      if (dateRange !== 'all') {
        const createdMs = new Date(auc.createdAt).getTime();
        const diffDays = (now - createdMs) / (1000 * 3600 * 24);
        if (dateRange === '7d' && diffDays > 7) return false;
        if (dateRange === '30d' && diffDays > 30) return false;
      }
      return true;
    });
  }, [auctions, filterCategory, dateRange]);

  // Aggregate Metrics
  const totalAuctions = filteredAuctions.length;
  const totalBids = filteredAuctions.reduce((sum, a) => sum + a.bids.length, 0);
  const completedAuctions = filteredAuctions.filter(
    (a) => a.status === 'sold' || a.status === 'closed'
  ).length;
  const itemsSold = filteredAuctions.filter((a) => a.status === 'sold').length;
  const itemsWithoutWinners = filteredAuctions.filter((a) => a.status === 'closed').length;
  const estimatedSalesValue = filteredAuctions
    .filter((a) => a.status === 'sold')
    .reduce((sum, a) => sum + (a.finalBidAmount || a.currentBid), 0);
  const averageBidPerAuction = totalAuctions > 0 ? (totalBids / totalAuctions).toFixed(1) : '0';

  // Category-wise Breakdown
  const categoryReport = categories.map((cat) => {
    const matched = filteredAuctions.filter(
      (a) => a.category.toLowerCase() === cat.name.toLowerCase()
    );
    const bidsCount = matched.reduce((s, a) => s + a.bids.length, 0);
    const soldCount = matched.filter((a) => a.status === 'sold').length;
    const value = matched
      .filter((a) => a.status === 'sold')
      .reduce((s, a) => s + (a.finalBidAmount || a.currentBid), 0);
    return {
      category: cat.name,
      totalLots: matched.length,
      bidsCount,
      soldCount,
      totalValue: value,
    };
  });

  // Real CSV Exporter for Auctions
  const exportAuctionsCSV = () => {
    const headers = [
      'Auction ID',
      'Title',
      'Category',
      'Condition',
      'Starting Price (USD)',
      'Current/Final Bid (USD)',
      'Total Bids',
      'Status',
      'Seller',
      'Winner',
      'Start Time',
      'End Time',
    ];

    const rows = filteredAuctions.map((a) => [
      `"${a.id}"`,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.category}"`,
      `"${a.condition}"`,
      a.startingPrice,
      a.finalBidAmount || a.currentBid,
      a.bids.length,
      `"${a.status}"`,
      `"${a.sellerName}"`,
      `"${a.winnerName || 'N/A'}"`,
      `"${a.startTime}"`,
      `"${a.endTime}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AuctionHub_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'CSV Exported', 'Auctions data report downloaded successfully.');
  };

  // Real CSV Exporter for Bid History
  const exportBidsCSV = () => {
    const headers = [
      'Bid ID',
      'Auction ID',
      'Auction Title',
      'Category',
      'Bidder Name',
      'Bidder Email',
      'Bid Amount (USD)',
      'Timestamp',
    ];

    const rows = filteredAuctions.flatMap((a) =>
      a.bids.map((b) => [
        `"${b.id}"`,
        `"${a.id}"`,
        `"${a.title.replace(/"/g, '""')}"`,
        `"${a.category}"`,
        `"${b.bidderName}"`,
        `"${b.bidderEmail}"`,
        b.amount,
        `"${b.timestamp}"`,
      ])
    );

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AuctionHub_Bids_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'CSV Exported', 'Bidding history ledger downloaded successfully.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <span>Auction Intelligence & Analytics</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Data Alcott Systems performance reporting: clearance velocity, valuation trends, and exportable ledger.
          </p>
        </div>

        {/* CSV Export Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            onClick={exportAuctionsCSV}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Auctions CSV</span>
          </button>
          <button
            onClick={exportBidsCSV}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Bids CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Time Window:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <option value="all">All-Time</option>
              <option value="30d">Last 30 Days</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Dataset: {filteredAuctions.length} auctions matching
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Auctions</span>
          <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {totalAuctions}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Total Bids</span>
          <span className="text-2xl font-extrabold font-mono text-purple-600 dark:text-purple-400 tabular-nums">
            {totalBids}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Completed</span>
          <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {completedAuctions}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Items Sold</span>
          <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {itemsSold}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Unsold Lots</span>
          <span className="text-2xl font-extrabold font-mono text-rose-500 tabular-nums">
            {itemsWithoutWinners}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Total Sales</span>
          <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            ${estimatedSalesValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Category Performance Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-purple-600" />
          <span>Category-Wise Performance Matrix</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Cataloged Lots</th>
                <th className="py-3 px-4 text-right">Bids Received</th>
                <th className="py-3 px-4 text-right">Lots Sold</th>
                <th className="py-3 px-4 text-right">Sales Clearance Rate</th>
                <th className="py-3 px-4 text-right">Settled Gross Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {categoryReport.map((row) => {
                const clearance = row.totalLots > 0 ? ((row.soldCount / row.totalLots) * 100).toFixed(0) : '0';
                return (
                  <tr key={row.category} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-900 dark:text-white">
                      {row.category}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-300">
                      {row.totalLots}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-purple-600 dark:text-purple-400">
                      {row.bidsCount}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-300">
                      {row.soldCount}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                        {clearance}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                      ${row.totalValue.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
