export type AuctionCondition = 'New' | 'Like New' | 'Good' | 'Used';

export type AuctionStatus = 'active' | 'upcoming' | 'closed' | 'sold';

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  bidderEmail: string;
  amount: number;
  timestamp: string; // ISO string
  isAutoBid?: boolean;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  condition: AuctionCondition;
  startingPrice: number;
  currentBid: number;
  minIncrement: number;
  reservePrice?: number;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerRating?: number;
  sellerMemberSince?: string;
  bids: Bid[];
  status: AuctionStatus;
  winnerId?: string;
  winnerName?: string;
  finalBidAmount?: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  iconName: string; // Lucide icon identifier
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  bio?: string;
  memberSince: string;
  balance: number;
}

export type PaymentStatus = 'pending' | 'in_escrow' | 'paid' | 'released';
export type DeliveryStatus = 'processing' | 'shipped' | 'delivered';

export interface Settlement {
  id: string;
  auctionId: string;
  auctionTitle: string;
  auctionImage: string;
  category: string;
  sellerId: string;
  sellerName: string;
  winnerId: string;
  winnerName: string;
  winningBid: number;
  completedAt: string;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  shippingAddress?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export type ActiveNavPage = 
  | 'dashboard'
  | 'marketplace'
  | 'auction-detail'
  | 'create-auction'
  | 'bids'
  | 'settlement'
  | 'categories'
  | 'user-dashboard'
  | 'reports'
  | 'settings';
