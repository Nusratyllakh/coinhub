import React, { useState } from 'react';
import { useApp } from '../store';
import { Heart, Star, Flame, Crown, Gem, Coins, Tag, X, Sparkles, PlusCircle, ShoppingBag } from 'lucide-react';
import clsx from 'clsx';

const ICONS: Record<string, React.ElementType> = {
  Heart, Star, Flame, Crown, Gem
};

export const UserMarket = () => {
  const { currentUser, users, marketListings, gifts, buyListing, createListing, cancelListing } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGiftId, setSelectedGiftId] = useState('');
  const [price, setPrice] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  if (!currentUser) return null;

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(price);
    if (isNaN(priceNum) || priceNum <= 0) return;
    if (!selectedGiftId) return;
    
    if (createListing(selectedGiftId, priceNum)) {
      setToast('Объявление создано!');
      setShowCreateModal(false);
      setSelectedGiftId('');
      setPrice('');
    } else {
      setToast('Ошибка при создании лота');
    }
    setTimeout(() => setToast(null), 3000);
  };

  const getSellerInfo = (username: string) => {
    return users.find(u => u.username === username);
  };

  const commissionRate = (currentUser.vip === 'Gold' || currentUser.vip === 'Diamond') ? 0.06 : 0.1;

  const giftCounts = currentUser.gifts.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueUserGifts = Object.entries(giftCounts).map(([id, count]) => {
    const gift = gifts.find(g => g.id === id);
    return { gift, count };
  }).filter(g => g.gift);

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl font-medium animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
          {toast}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/10 p-3 rounded-xl">
            <Sparkles className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Рынок игроков</h2>
            <p className="text-zinc-500">Покупайте подарки напрямую у других пользователей</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-2xl transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Выставить подарок
        </button>
      </div>

      {marketListings.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">На рынке пока нет объявлений.</p>
          <p className="text-sm mt-2">Станьте первым, кто выставит подарок на продажу!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {marketListings.map(listing => {
            const gift = gifts.find(g => g.id === listing.giftId);
            if (!gift) return null;
            const Icon = ICONS[gift.icon] || Heart;
            const isOwner = listing.seller === currentUser.username;
            const canAfford = currentUser.coins >= listing.priceCoins;
            const seller = getSellerInfo(listing.seller);

            return (
              <div key={listing.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-purple-500/50 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-zinc-950 w-14 h-14 rounded-2xl flex items-center justify-center border border-zinc-800">
                      <Icon className="w-7 h-7 text-purple-500" />
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <div className="text-right">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold">Продавец</div>
                        <div className="text-sm font-bold text-white">{listing.seller}</div>
                      </div>
                      {seller?.avatarUrl ? (
                        <img src={seller.avatarUrl} alt={listing.seller} className="w-8 h-8 rounded-full object-cover border border-zinc-700" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 border border-zinc-700">
                          {listing.seller[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{gift.name}</h3>
                  <div className="text-xs text-zinc-500 mb-6">Ценность: ${gift.priceUSD}</div>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Цена</div>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-lg">
                        {listing.priceCoins.toLocaleString()} <Coins className="w-4 h-4" />
                      </div>
                    </div>

                    {isOwner ? (
                      <button
                        onClick={() => cancelListing(listing.id)}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                      >
                        Отменить
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (buyListing(listing.id)) {
                            setToast('Покупка совершена!');
                            setTimeout(() => setToast(null), 3000);
                          } else {
                            alert('Недостаточно коинов!');
                          }
                        }}
                        disabled={!canAfford}
                        className={clsx(
                          "px-6 py-2 rounded-xl font-bold text-sm transition-all",
                          canAfford ? "bg-purple-500 hover:bg-purple-600 text-white" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        )}
                      >
                        Купить
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-bold text-white mb-6">Выставить на продажу</h3>

            {uniqueUserGifts.length === 0 ? (
              <div className="text-center text-zinc-500 py-8">
                У вас нет подарков для продажи.
              </div>
            ) : (
              <form onSubmit={handleCreateListing} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Выберите подарок</label>
                  <div className="grid grid-cols-4 gap-2">
                    {uniqueUserGifts.map(({ gift, count }) => {
                      if (!gift) return null;
                      const Icon = ICONS[gift.icon] || Heart;
                      return (
                        <button
                          key={gift.id}
                          type="button"
                          onClick={() => setSelectedGiftId(gift.id)}
                          className={clsx(
                            "aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative transition-all",
                            selectedGiftId === gift.id ? "border-purple-500 bg-purple-500/10" : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                          )}
                        >
                          <Icon className={clsx("w-6 h-6", selectedGiftId === gift.id ? "text-purple-500" : "text-zinc-500")} />
                          <span className="absolute top-1 right-1 bg-zinc-800 text-[10px] px-1 rounded text-zinc-400">x{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Цена (Коины)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Например, 100"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    required
                    min="1"
                  />
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-zinc-500 flex justify-between">
                      <span>Комиссия рынка:</span>
                      <span className="text-red-400">{Math.round(commissionRate * 100)}%</span>
                    </p>
                    {price && !isNaN(parseInt(price)) && (
                      <p className="text-sm text-zinc-400 flex justify-between font-bold">
                        <span>Вы получите:</span>
                        <span className="text-emerald-400">{Math.floor(parseInt(price) * (1 - commissionRate))} коинов</span>
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!selectedGiftId || !price}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-xl mt-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Выставить
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
