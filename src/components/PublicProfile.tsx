import React, { useState } from 'react';
import { useApp, getProfileLevel } from '../store';
import { UserCircle, Gift, Coins, Activity, Crown, ShieldAlert, Heart, Star, Flame, Gem, MessageCircle, ArrowLeft, Send, Hash } from 'lucide-react';
import clsx from 'clsx';

const ICONS: Record<string, React.ElementType> = {
  Heart, Star, Flame, Crown, Gem
};

interface PublicProfileProps {
  username: string;
  onBack: () => void;
  onMessage: () => void;
}

export const PublicProfile = ({ username, onBack, onMessage }: PublicProfileProps) => {
  const { users, gifts, currentUser, transferCoins } = useApp();
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const user = users.find(u => u.username === username);

  if (!user) return null;

  const handleTransfer = () => {
    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Введите корректную сумму');
      return;
    }
    
    const commission = (currentUser?.vip === 'Gold' || currentUser?.vip === 'Diamond') ? 0.06 : 0.1;
    const received = Math.floor(amount * (1 - commission));

    if (window.confirm(`Вы уверены, что хотите перевести ${amount} коинов пользователю ${user.username}? Пользователь получит ${received} коинов (Комиссия ${Math.round(commission * 100)}%).`)) {
      if (transferCoins(user.username, amount)) {
        alert(`Успешно переведено ${amount} коинов пользователю ${user.username}`);
        setTransferAmount('');
        setIsTransferring(false);
      } else {
        alert('Ошибка перевода. Проверьте баланс.');
      }
    }
  };

  const levelInfo = getProfileLevel(user.experience);
  const progress = (levelInfo.currentXP / levelInfo.nextXP) * 100;

  const giftCounts = user.gifts.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueGifts = Object.entries(giftCounts).map(([id, count]) => {
    const gift = gifts.find(g => g.id === id);
    return { gift, count: count as number };
  }).filter(g => g.gift);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <button 
        onClick={onBack}
        className="text-zinc-400 hover:text-white flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Назад к сообществу
      </button>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {user.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.username} 
              className={clsx(
                "w-32 h-32 rounded-full object-cover border-4 shadow-2xl",
                user.vip === 'Diamond' ? "border-cyan-500/50" :
                user.vip === 'Gold' ? "border-yellow-500/50" :
                user.vip === 'VIP' ? "border-purple-500/50" : "border-zinc-700"
              )}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className={clsx(
              "w-32 h-32 rounded-full flex items-center justify-center font-bold text-5xl border-4 shadow-2xl",
              user.vip === 'Diamond' ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" :
              user.vip === 'Gold' ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" :
              user.vip === 'VIP' ? "bg-purple-500/20 text-purple-400 border-purple-500/50" : "bg-zinc-800 text-zinc-400 border-zinc-700"
            )}>
              {user.username[0].toUpperCase()}
            </div>
          )}
          
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h2 className="text-4xl font-bold text-white">{user.username}</h2>
              {user.role === 'admin' && <ShieldAlert className="w-6 h-6 text-red-500" />}
              <span className="bg-zinc-800 text-zinc-400 px-2 py-1 rounded-lg text-xs font-mono flex items-center gap-1">
                <Hash className="w-3 h-3" /> {user.id}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
              <span className={clsx(
                "px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5",
                user.vip === 'Diamond' ? "bg-cyan-500/10 text-cyan-400" :
                user.vip === 'Gold' ? "bg-yellow-500/10 text-yellow-400" :
                user.vip === 'VIP' ? "bg-purple-500/10 text-purple-400" : "bg-zinc-800 text-zinc-400"
              )}>
                {user.vip !== 'None' ? <Crown className="w-4 h-4" /> : <UserCircle className="w-4 h-4" />}
                {user.vip !== 'None' ? user.vip : 'Обычный пользователь'}
              </span>
              <div className="flex flex-col gap-1 min-w-[150px]">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  <span>Уровень {levelInfo.level}</span>
                  <span>{levelInfo.currentXP}/{levelInfo.nextXP} XP</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-center min-w-[120px]">
                <div className="text-zinc-500 text-xs uppercase font-bold mb-1">Коины</div>
                <div className="text-emerald-500 font-mono font-bold text-xl flex items-center justify-center gap-1">
                  {user.coins} <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-center min-w-[120px]">
                <div className="text-zinc-500 text-xs uppercase font-bold mb-1">Подарки</div>
                <div className="text-pink-500 font-mono font-bold text-xl flex items-center justify-center gap-1">
                  {user.gifts.length} <Gift className="w-4 h-4" />
                </div>
              </div>
              <button
                onClick={onMessage}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-8 rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Написать
              </button>
              {currentUser?.username !== user.username && (
                <button
                  onClick={() => setIsTransferring(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Перевести коины
                </button>
              )}
            </div>
            
            {isTransferring && (
              <div className="mt-6 bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                <h4 className="font-bold text-white mb-2">Перевод коинов пользователю {user.username}</h4>
                <p className="text-sm text-zinc-500 mb-4">
                  Комиссия за перевод: {(currentUser?.vip === 'Gold' || currentUser?.vip === 'Diamond') ? '6%' : '10%'}
                </p>
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="Сумма"
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <button
                    onClick={handleTransfer}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-xl transition-colors"
                  >
                    Отправить
                  </button>
                  <button
                    onClick={() => setIsTransferring(false)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-6 py-2 rounded-xl transition-colors"
                  >
                    Отмена
                  </button>
                </div>
                {transferAmount && !isNaN(parseInt(transferAmount)) && (
                  <div className="text-sm text-zinc-400 mt-3">
                    Пользователь получит: <span className="text-emerald-400 font-mono font-bold">
                      {Math.floor(parseInt(transferAmount) * ((currentUser?.vip === 'Gold' || currentUser?.vip === 'Diamond') ? 0.94 : 0.9))}
                    </span> коинов
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Gift className="w-6 h-6 text-pink-500" />
          Коллекция подарков
        </h3>
        
        {uniqueGifts.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
            <Gift className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">У пользователя пока нет подарков.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {uniqueGifts.map(({ gift, count }) => {
              if (!gift) return null;
              const Icon = ICONS[gift.icon] || Heart;
              return (
                <div key={gift.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-zinc-700 transition-all relative">
                  {count > 1 && (
                    <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      x{count}
                    </div>
                  )}
                  <div className="bg-zinc-800 p-4 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-pink-500" />
                  </div>
                  <h4 className="font-bold text-white">{gift.name}</h4>
                  <div className="text-xs text-zinc-500 mt-1 font-mono">Ценность: ${gift.priceUSD}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
