import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Task, Gift, ChatMessage, CoinRate, VIPLevel, MarketListing, Transaction } from './types';

const DEFAULT_TASKS: Task[] = [
  { id: '1', name: 'Посмотреть короткое видео', reward: 10, type: 'normal' },
  { id: '2', name: 'Поделиться в соцсетях', reward: 50, type: 'normal' },
  { id: '3', name: 'Премиум опрос', reward: 200, type: 'vip' },
];

const DEFAULT_GIFTS: Gift[] = [
  { id: '1', name: 'Сердце', icon: 'Heart', priceUSD: 5, limit: 20, totalLimit: 20 },
  { id: '2', name: 'Звезда', icon: 'Star', priceUSD: 15, limit: 15, totalLimit: 15 },
  { id: '3', name: 'Огонь', icon: 'Flame', priceUSD: 30, limit: 25, totalLimit: 25 },
  { id: '4', name: 'Корона', icon: 'Crown', priceUSD: 60, limit: 10, totalLimit: 10 },
  { id: '5', name: 'Бриллиант', icon: 'Gem', priceUSD: 120, limit: 5, totalLimit: 5 },
];

const DEFAULT_RATE: CoinRate[] = [
  { time: new Date().toLocaleTimeString(), rate: 0.01 }
];

interface AppState {
  users: User[];
  currentUser: User | null;
  tasks: Task[];
  gifts: Gift[];
  coinRate: CoinRate[];
  globalChat: ChatMessage[];
  privateChats: Record<string, ChatMessage[]>;
  activityLevel: number; // Used to influence coin rate
  baseRate: number;
  marketListings: MarketListing[];
  transactions: Transaction[];
}

interface AppContextType extends AppState {
  login: (username: string, passwordHash: string) => boolean;
  register: (username: string, passwordHash: string) => boolean;
  logout: () => void;
  completeTask: (taskId: string) => void;
  buyVIP: (level: VIPLevel) => void;
  buyGift: (giftId: string) => void;
  sendGlobalMessage: (text: string) => void;
  sendPrivateMessage: (toUser: string, text: string) => void;
  updateUserCoins: (username: string, amount: number) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  increaseActivity: () => void;
  spinRoulette: (prizeType: 'coins' | 'gift' | 'bonus', amount?: number, giftId?: string) => void;
  transferCoins: (toUser: string, amount: number) => boolean;
  createListing: (giftId: string, priceCoins: number) => boolean;
  buyListing: (listingId: string) => boolean;
  cancelListing: (listingId: string) => boolean;
  changePassword: (newPasswordHash: string) => void;
  adminUpdatePassword: (username: string, newPasswordHash: string) => void;
  updateAvatar: (url: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialState = <T,>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
};

const generateUniqueId = (existingIds: string[]): string => {
  while (true) {
    const id = Math.floor(10000 + Math.random() * 90000).toString();
    if (new Set(id).size === 1) continue; // skip 11111, 22222, etc.
    if (id === '12345' || id === '54321' || id === '09090' || id === '10101') continue;
    if (existingIds.includes(id)) continue;
    return id;
  }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string | null>(() => {
    const stored = localStorage.getItem('coinhub_currentUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [coinRate, setCoinRate] = useState<CoinRate[]>([]);
  const [globalChat, setGlobalChat] = useState<ChatMessage[]>([]);
  const [privateChats, setPrivateChats] = useState<Record<string, ChatMessage[]>>({});
  const [activityLevel, setActivityLevel] = useState(0);
  const [baseRate, setBaseRate] = useState(0.01);
  const [marketListings, setMarketListings] = useState<MarketListing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);

    socket.onopen = () => {
      console.log('Connected to server');
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      switch (type) {
        case 'INIT':
          setUsers(data.users);
          setTasks(data.tasks);
          setGifts(data.gifts);
          setCoinRate(data.coinRate);
          setGlobalChat(data.globalChat);
          setPrivateChats(data.privateChats);
          setBaseRate(data.baseRate);
          setMarketListings(data.marketListings);
          setTransactions(data.transactions);
          break;
        case 'USERS_UPDATE':
          setUsers(data);
          break;
        case 'TASKS_UPDATE':
          setTasks(data);
          break;
        case 'GIFTS_UPDATE':
          setGifts(data);
          break;
        case 'COIN_RATE_UPDATE':
          setCoinRate(data);
          break;
        case 'GLOBAL_CHAT_UPDATE':
          setGlobalChat(data);
          break;
        case 'PRIVATE_CHATS_UPDATE':
          setPrivateChats(data);
          break;
        case 'MARKET_UPDATE':
          setMarketListings(data);
          break;
        case 'TRANSACTIONS_UPDATE':
          setTransactions(data);
          break;
        case 'BASE_RATE_UPDATE':
          setBaseRate(data);
          break;
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from server');
      setWs(null);
    };

    return () => socket.close();
  }, []);

  useEffect(() => {
    localStorage.setItem('coinhub_currentUser', JSON.stringify(currentUsername));
  }, [currentUsername]);

  const currentUser = users.find(u => u.username === currentUsername) || null;

  const send = (type: string, data: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, data, username: currentUsername }));
    }
  };

  const login = (username: string, passwordHash: string) => {
    const user = users.find(u => u.username === username && u.passwordHash === passwordHash);
    if (user) {
      setCurrentUsername(username);
      return true;
    }
    return false;
  };

  const register = (username: string, passwordHash: string) => {
    if (users.some(u => u.username === username)) return false;
    send('REGISTER', { username, passwordHash });
    setCurrentUsername(username);
    return true;
  };

  const logout = () => setCurrentUsername(null);

  const completeTask = (taskId: string) => {
    if (!currentUser) return;
    send('COMPLETE_TASK', { taskId, username: currentUser.username });
  };

  const buyVIP = (level: VIPLevel) => {
    if (!currentUser) return;
    send('BUY_VIP', { level, username: currentUser.username });
  };

  const buyGift = (giftId: string) => {
    if (!currentUser) return;
    send('BUY_GIFT', { giftId, username: currentUser.username });
  };

  const sendGlobalMessage = (text: string) => {
    if (!currentUser) return;
    send('GLOBAL_MESSAGE', { text });
  };

  const sendPrivateMessage = (toUser: string, text: string) => {
    if (!currentUser) return;
    send('PRIVATE_MESSAGE', { toUser, text });
  };

  const updateUserCoins = (username: string, amount: number) => {
    if (currentUser?.role !== 'admin') return;
    send('UPDATE_USER', { username, updates: { coins: amount } });
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    if (currentUser?.role !== 'admin') return;
    send('ADD_TASK', { task, adminUsername: currentUser.username });
  };

  const increaseActivity = () => {}; // Handled server-side if needed

  const spinRoulette = (prizeType: 'coins' | 'gift' | 'bonus', amount?: number, giftId?: string) => {
    if (!currentUser) return;
    const updates: Partial<User> = { 
      lastRouletteTime: Date.now(),
      experience: (currentUser.experience || 0) + 5
    };
    if (prizeType === 'coins' && amount) {
      updates.coins = currentUser.coins + amount;
    } else if (prizeType === 'gift' && giftId) {
      updates.gifts = [...currentUser.gifts, giftId];
    }
    send('UPDATE_USER', { username: currentUser.username, updates });
  };

  const transferCoins = (toUser: string, amount: number) => {
    if (!currentUser || currentUser.coins < amount || amount <= 0) return false;
    send('TRANSFER_COINS', { toUser, amount, username: currentUser.username });
    return true;
  };

  const createListing = (giftId: string, priceCoins: number) => {
    if (!currentUser || priceCoins <= 0) return false;
    send('CREATE_LISTING', { giftId, priceCoins, username: currentUser.username });
    return true;
  };

  const buyListing = (listingId: string) => {
    if (!currentUser) return false;
    send('BUY_LISTING', { listingId, username: currentUser.username });
    return true;
  };

  const cancelListing = (listingId: string) => {
    if (!currentUser) return false;
    send('CANCEL_LISTING', { listingId, username: currentUser.username });
    return true;
  };

  const changePassword = (newPasswordHash: string) => {
    if (!currentUser) return;
    send('UPDATE_USER', { username: currentUser.username, updates: { passwordHash: newPasswordHash } });
  };

  const adminUpdatePassword = (username: string, newPasswordHash: string) => {
    if (currentUser?.role !== 'admin') return;
    send('UPDATE_USER', { username, updates: { passwordHash: newPasswordHash } });
  };

  const updateAvatar = (url: string) => {
    if (!currentUser) return;
    send('UPDATE_USER', { username: currentUser.username, updates: { avatarUrl: url } });
  };

  return (
    <AppContext.Provider value={{
      users, currentUser, tasks, gifts, coinRate, globalChat, privateChats, activityLevel, baseRate, marketListings, transactions,
      login, register, logout, completeTask, buyVIP, buyGift, sendGlobalMessage, sendPrivateMessage, updateUserCoins, addTask, increaseActivity, spinRoulette,
      transferCoins, createListing, buyListing, cancelListing, changePassword, adminUpdatePassword, updateAvatar
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const getProfileLevel = (experience: number) => {
  let level = 1;
  let xp = experience;
  const getXPForNextLevel = (lvl: number) => 100 + (lvl - 1) * 50;
  while (xp >= getXPForNextLevel(level)) {
    xp -= getXPForNextLevel(level);
    level++;
  }
  return { level, currentXP: xp, nextXP: getXPForNextLevel(level) };
};
