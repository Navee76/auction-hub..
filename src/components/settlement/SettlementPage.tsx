import React from 'react';
import { useApp } from '../../context/AppContext';
import { SafeImage } from '../common/SafeImage';
import { PaymentStatus, DeliveryStatus } from '../../types';
import {
  Trophy,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  RefreshCw,
} from 'lucide-react';

export const SettlementPage: React.FC = () => {
  const { settlements, updateSettlement, openAuctionDetail, currentUser } = useApp();

  const totalSettledValue = settlements.reduce((sum, s) => sum + s.winningBid, 0);
  const paidCount = settlements.filter(
    (s) => s.paymentStatus === 'paid' || s.paymentStatus === 'released'
  ).length;
  const deliveredCount = settlements.filter((s) => s.deliveryStatus === 'delivered').length;

  const handleNextPaymentStatus = (id: string, current: PaymentStatus) => {
    let next: PaymentStatus = 'in_escrow';
    if (current === 'pending') next = 'in_escrow';
    else if (current === 'in_escrow') next = 'paid';
    else if (current === 'paid') next = 'released';
    else next = 'released';
    updateSettlement(id, next);
  };

  const handleNextDeliveryStatus = (id: string, current: DeliveryStatus) => {
    let next: DeliveryStatus = 'processing';
    if (current === 'processing') next = 'shipped';
    else if (current === 'shipped') next = 'delivered';
    else next = 'delivered';
    updateSettlement(id, undefined, next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>Winning Lots & Post-Auction Settlement</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Simulated escrow clearing, payment confirmation, and insured logistics fulfillment pipeline.
          </p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Won Value in Escrow
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            ${totalSettledValue.toLocaleString()}
          </p>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1 block">
            Across {settlements.length} concluded lots
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Payment Clearance
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {paidCount} / {settlements.length}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            Verified simulated funds
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Logistics & Delivery
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {deliveredCount} / {settlements.length}
          </p>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1 block">
            Completed courier handoffs
          </span>
        </div>
      </div>

      {/* Settlement Records */}
      {settlements.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No Concluded Settlements Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4 leading-relaxed">
            When active auctions expire and meet their reserve conditions, winners and payment milestones will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {settlements.map((item) => {
            const isWinner = currentUser?.id === item.winnerId;
            const isSeller = currentUser?.id === item.sellerId;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6"
              >
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                      <SafeImage
                        src={item.auctionImage}
                        alt={item.auctionTitle}
                        fallbackCategory={item.category}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-slate-400">· Lot Settlement #{item.id.slice(-6)}</span>
                      </div>
                      <h3
                        onClick={() => openAuctionDetail(item.auctionId)}
                        className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-purple-600 cursor-pointer line-clamp-1 mt-0.5"
                      >
                        {item.auctionTitle}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Concluded on {new Date(item.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <span className="text-xs text-slate-400 block">Winning Bid</span>
                    <span className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                      ${item.winningBid.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Parties Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase block font-semibold">Winning Collector</span>
                      <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{item.winnerName}</span>
                    </div>
                    {isWinner && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold text-[10px]">
                        You Won
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase block font-semibold">Consignor / Seller</span>
                      <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{item.sellerName}</span>
                    </div>
                    {isSeller && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold text-[10px]">
                        Your Listing
                      </span>
                    )}
                  </div>
                </div>

                {/* Simulated Payment & Logistics Interactive Pipelines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Payment Milestone */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Payment Status</span>
                      </div>
                      <span className="text-xs font-mono font-bold capitalize text-purple-600 dark:text-purple-400">
                        {item.paymentStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                      {['pending', 'in_escrow', 'paid', 'released'].map((step, idx) => {
                        const stepIndex = ['pending', 'in_escrow', 'paid', 'released'].indexOf(item.paymentStatus);
                        const isPastOrCurrent = idx <= stepIndex;
                        return (
                          <div
                            key={step}
                            className={`p-1.5 rounded-lg font-medium capitalize truncate ${
                              isPastOrCurrent
                                ? 'bg-purple-600 text-white font-bold'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {step.replace('_', ' ')}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handleNextPaymentStatus(item.id, item.paymentStatus)}
                      disabled={item.paymentStatus === 'released'}
                      className="w-full py-2 px-3 text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Advance Simulated Payment Stage</span>
                    </button>
                  </div>

                  {/* Delivery Milestone */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Delivery Fulfillment</span>
                      </div>
                      <span className="text-xs font-mono font-bold capitalize text-blue-600 dark:text-blue-400">
                        {item.deliveryStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
                      {['processing', 'shipped', 'delivered'].map((step, idx) => {
                        const stepIndex = ['processing', 'shipped', 'delivered'].indexOf(item.deliveryStatus);
                        const isPastOrCurrent = idx <= stepIndex;
                        return (
                          <div
                            key={step}
                            className={`p-1.5 rounded-lg font-medium capitalize truncate ${
                              isPastOrCurrent
                                ? 'bg-blue-600 text-white font-bold'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {step}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handleNextDeliveryStatus(item.id, item.deliveryStatus)}
                      disabled={item.deliveryStatus === 'delivered'}
                      className="w-full py-2 px-3 text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Advance Delivery Status</span>
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
