export type VIPLevel = 'None' | 'VIP' | 'Gold' | 'Diamond';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  coins: number;
  vip: VIPLevel;
  gifts: string[];
  role: 'user' | 'admin';
  experience: number;
  earnedToday: number;
  lastActiveDate: string;
  completedTasks: string[];
  lastRouletteTime: number;
  avatarUrl?: string;
  totalTasksCompleted?: number;
}

export interface Task {
  id: string;
  name: string;
  reward: number;
  type: 'normal' | 'vip' | 'gold';
  link?: string;
}

export interface Gift {
  id: string;
  name: string;
  icon: string;
  priceUSD: number;
  limit: number;
  totalLimit: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

export interface CoinRate {
  time: string;
  rate: number;
}

export interface MarketListing {
  id: string;
  seller: string;
  giftId: string;
  priceCoins: number;
  timestamp: number;
}

export interface Transaction {
  id: string;
  type: 'transfer' | 'market_sale' | 'admin_update';
  fromUser?: string;
  toUser: string;
  amount: number;
  timestamp: number;
  details?: string;
}

