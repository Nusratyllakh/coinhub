import React, { useState } from 'react';
import { useApp, getProfileLevel } from '../store';
import { UserCircle, Gift, Coins, Activity, Crown, ShieldAlert, Heart, Star, Flame, Gem, Key, Image as ImageIcon, Hash } from 'lucide-react';
import clsx from 'clsx';

const ICONS: Record<string, React.ElementType> = {
  Heart, Star, Flame, Crown, Gem
};

export const Profile = () => {
  const { currentUser, gifts, changePassword, updateAvatar } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  if (!currentUser) return null;

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 3) {
      alert('Пароль должен быть не менее 3 символов');
      return;
    }
    
    // Check current password (simplified since we only have hashes in real app, but here we check against passwordHash)
    if (currentPassword !== currentUser.passwordHash) {
      alert('Текущий пароль введен неверно');
      return;
    }

    if (window.confirm('Вы уверены, что хотите изменить пароль?')) {
      changePassword(newPassword);
      setNewPassword('');
      setCurrentPassword('');
      setToast('Пароль успешно изменен');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleUpdateAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    updateAvatar(avatarUrl);
    setAvatarUrl('');
    setToast('Аватар успешно обновлен');
    setTimeout(() => setToast(null), 3000);
  };

  const levelInfo = getProfileLevel(currentUser.experience);
  const progress = (levelInfo.currentXP / levelInfo.nextXP) * 100;

  const giftCounts = currentUser.gifts.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueGifts = Object.entries(giftCounts).map(([id, count]) => {
    const gift = gifts.find(g => g.id === id);
    return { gift, count: count as number };
  }).filter(g => g.gift);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {toast && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl font-medium animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
          {toast}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            {currentUser.avatarUrl ? (
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.username} 
                className={clsx(
                  "w-32 h-32 rounded-full object-cover border-4 shadow-2xl",
                  currentUser.vip === 'Diamond' ? "border-cyan-500/50" :
                  currentUser.vip === 'Gold' ? "border-yellow-500/50" :
                  currentUser.vip === 'VIP' ? "border-purple-500/50" : "border-zinc-700"
                )}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={clsx(
                "w-32 h-32 rounded-full flex items-center justify-center font-bold text-5xl border-4 shadow-2xl",
                currentUser.vip === 'Diamond' ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" :
                currentUser.vip === 'Gold' ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" :
                currentUser.vip === 'VIP' ? "bg-purple-500/20 text-purple-400 border-purple-500/50" : "bg-zinc-800 text-zinc-400 border-zinc-700"
              )}>
                {currentUser.username[0].toUpperCase()}
              </div>
            )}
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ImageIcon className="w-8 h-8 text-white" />
            </button>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h2 className="text-4xl font-bold text-white">{currentUser.username}</h2>
              {currentUser.role === 'admin' && <ShieldAlert className="w-6 h-6 text-red-500" />}
              <span className="bg-zinc-800 text-zinc-400 px-2 py-1 rounded-lg text-xs font-mono flex items-center gap-1">
                <Hash className="w-3 h-3" /> {currentUser.id}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
              <span className={clsx(
                "px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5",
                currentUser.vip === 'Diamond' ? "bg-cyan-500/10 text-cyan-400" :
                currentUser.vip === 'Gold' ? "bg-yellow-500/10 text-yellow-400" :
                currentUser.vip === 'VIP' ? "bg-purple-500/10 text-purple-400" : "bg-zinc-800 text-zinc-400"
              )}>
                {currentUser.vip !== 'None' ? <Crown className="w-4 h-4" /> : <UserCircle className="w-4 h-4" />}
                {currentUser.vip !== 'None' ? currentUser.vip : 'Обычный пользователь'}
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

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-center">
                <div className="text-zinc-500 text-xs uppercase font-bold mb-1">Коины</div>
                <div className="text-emerald-500 font-mono font-bold text-xl flex items-center justify-center gap-1">
                  {currentUser.coins} <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-center">
                <div className="text-zinc-500 text-xs uppercase font-bold mb-1">Заработано сегодня</div>
                <div className="text-blue-500 font-mono font-bold text-xl flex items-center justify-center gap-1">
                  {currentUser.earnedToday} <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-center">
                <div className="text-zinc-500 text-xs uppercase font-bold mb-1">Подарки</div>
                <div className="text-pink-500 font-mono font-bold text-xl flex items-center justify-center gap-1">
                  {currentUser.gifts.length} <Gift className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              Изменить аватар
            </h3>
            <form onSubmit={handleUpdateAvatar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">URL изображения</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="https://example.com/avatar.png"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Сохранить аватар
              </button>
            </form>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-500" />
              Изменить пароль
            </h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Текущий пароль</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Введите старый пароль"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Новый пароль</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Минимум 3 символа"
                  required
                  minLength={3}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Сохранить пароль
              </button>
            </form>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Gift className="w-6 h-6 text-pink-500" />
          Моя коллекция подарков
        </h3>
        
        {uniqueGifts.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
            <Gift className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Вы еще не собрали ни одного подарка.</p>
            <p className="text-sm mt-2">Посетите Маркетплейс, чтобы купить лимитированные подарки!</p>
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
