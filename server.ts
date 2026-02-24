import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { User, Task, Gift, ChatMessage, CoinRate, MarketListing, Transaction } from './src/types';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3000;

// --- Global State ---
let users: User[] = [{
  id: '00001',
  username: 'admin',
  passwordHash: '12345',
  coins: 1000,
  vip: 'Diamond',
  gifts: [],
  role: 'admin',
  experience: 1000,
  earnedToday: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedTasks: [],
  lastRouletteTime: 0
}];

let tasks: Task[] = [
  { id: '1', name: 'Посмотреть короткое видео', reward: 10, type: 'normal' },
  { id: '2', name: 'Поделиться в соцсетях', reward: 50, type: 'normal' },
  { id: '3', name: 'Премиум опрос', reward: 200, type: 'vip' },
];

let gifts: Gift[] = [
  { id: '1', name: 'Сердце', icon: 'Heart', priceUSD: 5, limit: 20, totalLimit: 20 },
  { id: '2', name: 'Звезда', icon: 'Star', priceUSD: 15, limit: 15, totalLimit: 15 },
  { id: '3', name: 'Огонь', icon: 'Flame', priceUSD: 30, limit: 25, totalLimit: 25 },
  { id: '4', name: 'Корона', icon: 'Crown', priceUSD: 60, limit: 10, totalLimit: 10 },
  { id: '5', name: 'Бриллиант', icon: 'Gem', priceUSD: 120, limit: 5, totalLimit: 5 },
];

let coinRate: CoinRate[] = [
  { time: new Date().toLocaleTimeString(), rate: 0.01 }
];

let globalChat: ChatMessage[] = [];
let privateChats: Record<string, ChatMessage[]> = {};
let baseRate = 0.01;
let marketListings: MarketListing[] = [];
let transactions: Transaction[] = [];

// --- Helpers ---
const broadcast = (data: any) => {
  const message = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const generateUniqueId = (existingIds: string[]): string => {
  while (true) {
    const id = Math.floor(10000 + Math.random() * 90000).toString();
    if (new Set(id).size === 1) continue;
    if (id === '12345' || id === '54321' || id === '09090' || id === '10101') continue;
    if (existingIds.includes(id)) continue;
    return id;
  }
};

// --- Coin Rate Simulation ---
setInterval(() => {
  const lastRate = coinRate[coinRate.length - 1].rate;
  const diff = baseRate - lastRate;
  let change = (Math.random() - 0.5) * 0.0005;
  change += diff * 0.1;
  if (Math.random() < 0.05) change += (Math.random() - 0.5) * 0.005;
  let newRate = Math.max(0.001, lastRate + change);
  const newEntry = { 
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
    rate: newRate 
  };
  coinRate.push(newEntry);
  if (coinRate.length > 500) coinRate.shift();
  broadcast({ type: 'COIN_RATE_UPDATE', data: coinRate });
}, 8000);

// --- WebSocket Logic ---
wss.on('connection', (ws) => {
  // Send initial state
  ws.send(JSON.stringify({
    type: 'INIT',
    data: { users, tasks, gifts, coinRate, globalChat, privateChats, baseRate, marketListings, transactions }
  }));

  ws.on('message', (message) => {
    try {
      const { type, data, username } = JSON.parse(message.toString());

      switch (type) {
        case 'REGISTER': {
          if (users.some(u => u.username === data.username)) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'User already exists' }));
            return;
          }
          const newUser: User = {
            id: generateUniqueId(users.map(u => u.id)),
            username: data.username,
            passwordHash: data.passwordHash,
            coins: 0,
            vip: 'None',
            gifts: [],
            role: 'user',
            experience: 0,
            earnedToday: 0,
            lastActiveDate: new Date().toISOString().split('T')[0],
            completedTasks: [],
            lastRouletteTime: 0
          };
          users.push(newUser);
          broadcast({ type: 'USERS_UPDATE', data: users });
          break;
        }

        case 'UPDATE_USER': {
          users = users.map(u => u.username === data.username ? { ...u, ...data.updates } : u);
          broadcast({ type: 'USERS_UPDATE', data: users });
          break;
        }

        case 'COMPLETE_TASK': {
          const { taskId, username } = data;
          const task = tasks.find(t => t.id === taskId);
          if (!task) return;
          tasks = tasks.filter(t => t.id !== taskId);
          users = users.map(u => {
            if (u.username === username) {
              return {
                ...u,
                coins: u.coins + task.reward,
                earnedToday: u.earnedToday + task.reward,
                experience: (u.experience || 0) + 20,
                completedTasks: [...(u.completedTasks || []), taskId],
                totalTasksCompleted: (u.totalTasksCompleted || 0) + 1
              };
            }
            return u;
          });
          broadcast({ type: 'TASKS_UPDATE', data: tasks });
          broadcast({ type: 'USERS_UPDATE', data: users });
          break;
        }

        case 'GLOBAL_MESSAGE': {
          const msg: ChatMessage = {
            id: Date.now().toString(),
            sender: username,
            text: data.text,
            timestamp: Date.now()
          };
          globalChat.push(msg);
          if (globalChat.length > 100) globalChat.shift();
          broadcast({ type: 'GLOBAL_CHAT_UPDATE', data: globalChat });
          break;
        }

        case 'PRIVATE_MESSAGE': {
          const { toUser, text } = data;
          const pair = [username, toUser].sort().join('_');
          const msg: ChatMessage = {
            id: Date.now().toString(),
            sender: username,
            text,
            timestamp: Date.now()
          };
          if (!privateChats[pair]) privateChats[pair] = [];
          privateChats[pair].push(msg);
          broadcast({ type: 'PRIVATE_CHATS_UPDATE', data: privateChats });
          break;
        }

        case 'CREATE_LISTING': {
          const { giftId, priceCoins, username } = data;
          const user = users.find(u => u.username === username);
          if (!user) return;
          const giftIndex = user.gifts.indexOf(giftId);
          if (giftIndex === -1) return;

          users = users.map(u => {
            if (u.username === username) {
              const newGifts = [...u.gifts];
              newGifts.splice(giftIndex, 1);
              return { ...u, gifts: newGifts };
            }
            return u;
          });

          const newListing: MarketListing = {
            id: Date.now().toString(),
            seller: username,
            giftId,
            priceCoins,
            timestamp: Date.now()
          };
          marketListings.push(newListing);
          broadcast({ type: 'MARKET_UPDATE', data: marketListings });
          broadcast({ type: 'USERS_UPDATE', data: users });
          break;
        }

        case 'BUY_LISTING': {
          const { listingId, username } = data;
          const listing = marketListings.find(l => l.id === listingId);
          if (!listing) return;
          const buyer = users.find(u => u.username === username);
          if (!buyer || buyer.coins < listing.priceCoins) return;

          const seller = users.find(u => u.username === listing.seller);
          const commission = (seller?.vip === 'Gold' || seller?.vip === 'Diamond') ? 0.06 : 0.1;
          const amountAfterCommission = Math.floor(listing.priceCoins * (1 - commission));

          users = users.map(u => {
            if (u.username === username) {
              return { ...u, coins: u.coins - listing.priceCoins, gifts: [...u.gifts, listing.giftId], experience: (u.experience || 0) + 30 };
            }
            if (u.username === listing.seller) {
              return { ...u, coins: u.coins + amountAfterCommission };
            }
            return u;
          });

          marketListings = marketListings.filter(l => l.id !== listingId);
          
          transactions.unshift({
            id: Date.now().toString(),
            type: 'market_sale',
            fromUser: username,
            toUser: listing.seller,
            amount: amountAfterCommission,
            timestamp: Date.now(),
            details: `Покупка подарка на рынке за ${listing.priceCoins} коинов (Комиссия ${Math.round(commission * 100)}%)`
          });

          broadcast({ type: 'MARKET_UPDATE', data: marketListings });
          broadcast({ type: 'USERS_UPDATE', data: users });
          broadcast({ type: 'TRANSACTIONS_UPDATE', data: transactions });
          break;
        }

        case 'CANCEL_LISTING': {
          const { listingId, username } = data;
          const listing = marketListings.find(l => l.id === listingId);
          if (!listing || listing.seller !== username) return;

          users = users.map(u => {
            if (u.username === username) {
              return { ...u, gifts: [...u.gifts, listing.giftId] };
            }
            return u;
          });

          marketListings = marketListings.filter(l => l.id !== listingId);
          broadcast({ type: 'MARKET_UPDATE', data: marketListings });
          broadcast({ type: 'USERS_UPDATE', data: users });
          break;
        }

        case 'TRANSFER_COINS': {
          const { toUser, amount, username } = data;
          const fromUser = users.find(u => u.username === username);
          if (!fromUser || fromUser.coins < amount) return;

          const commission = (fromUser.vip === 'Gold' || fromUser.vip === 'Diamond') ? 0.06 : 0.1;
          const amountAfterCommission = Math.floor(amount * (1 - commission));

          users = users.map(u => {
            if (u.username === username) {
              return { ...u, coins: u.coins - amount, experience: (u.experience || 0) + 10 };
            }
            if (u.username === toUser) {
              return { ...u, coins: u.coins + amountAfterCommission };
            }
            return u;
          });

          transactions.unshift({
            id: Date.now().toString(),
            type: 'transfer',
            fromUser: username,
            toUser: toUser,
            amount: amountAfterCommission,
            timestamp: Date.now(),
            details: `Перевод ${amount} коинов (Комиссия ${Math.round(commission * 100)}%)`
          });

          broadcast({ type: 'USERS_UPDATE', data: users });
          broadcast({ type: 'TRANSACTIONS_UPDATE', data: transactions });
          break;
        }

        case 'ADD_TASK': {
          if (data.adminUsername !== 'admin') return;
          const newTask = { ...data.task, id: Date.now().toString() };
          tasks.push(newTask);
          broadcast({ type: 'TASKS_UPDATE', data: tasks });
          break;
        }

        case 'BUY_GIFT': {
          const { giftId, username } = data;
          const gift = gifts.find(g => g.id === giftId);
          if (!gift || gift.limit <= 0) return;

          gifts = gifts.map(g => g.id === giftId ? { ...g, limit: g.limit - 1 } : g);
          users = users.map(u => {
            if (u.username === username) {
              const xpGain = Math.floor(gift.priceUSD * 2);
              return { ...u, gifts: [...u.gifts, giftId], experience: (u.experience || 0) + xpGain };
            }
            return u;
          });
          baseRate += 0.0001;
          broadcast({ type: 'GIFTS_UPDATE', data: gifts });
          broadcast({ type: 'USERS_UPDATE', data: users });
          broadcast({ type: 'BASE_RATE_UPDATE', data: baseRate });
          break;
        }

        case 'BUY_VIP': {
          const { level, username } = data;
          const user = users.find(u => u.username === username);
          if (!user) return;

          let extraGifts: string[] = [];
          if (level === 'Gold' || level === 'Diamond') {
            const cheapGifts = gifts.filter(g => g.priceUSD <= 20);
            if (cheapGifts.length > 0) {
              const rand = Math.random();
              let selectedGift;
              if (rand < 0.1) {
                selectedGift = cheapGifts.find(g => g.priceUSD === 20) || cheapGifts[Math.floor(Math.random() * cheapGifts.length)];
              } else {
                const veryCheap = cheapGifts.filter(g => g.priceUSD < 20);
                selectedGift = veryCheap[Math.floor(Math.random() * veryCheap.length)] || cheapGifts[0];
              }
              extraGifts.push(selectedGift.id);
            }
          }

          users = users.map(u => u.username === username ? { 
            ...u, 
            vip: level, 
            experience: (u.experience || 0) + 100,
            gifts: [...u.gifts, ...extraGifts]
          } : u);
          baseRate += 0.0005;
          broadcast({ type: 'USERS_UPDATE', data: users });
          broadcast({ type: 'BASE_RATE_UPDATE', data: baseRate });
          break;
        }
      }
    } catch (err) {
      console.error('WS Error:', err);
    }
  });
});

// --- Vite Middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
