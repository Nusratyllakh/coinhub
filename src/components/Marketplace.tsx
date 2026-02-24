import React, { useState } from 'react';
import { useApp } from '../store';
import { Heart, Star, Flame, Crown, Gem, CreditCard, CheckCircle, X, Store, Users } from 'lucide-react';
import clsx from 'clsx';
import { VIPLevel } from '../types';
import { UserMarket } from './UserMarket';

const ICONS: Record<string, React.ElementType> = {
  Heart, Star, Flame, Crown, Gem
};

export const Marketplace = () => {
  const { gifts, buyGift, buyVIP, currentUser } = useApp();
  const [paymentModal, setPaymentModal] = useState<{ type: 'vip' | 'gift', item: any } | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!currentUser) return null;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 16) {
      alert('Пожалуйста, введите 16 цифр номера карты');
      return;
    }

    if (paymentModal?.type === 'vip') {
      buyVIP(paymentModal.item.level as VIPLevel);
      setSuccessMsg(`Успешно улучшено до ${paymentModal.item.level}!`);
    } else if (paymentModal?.type === 'gift') {
      buyGift(paymentModal.item.id);
      setSuccessMsg(`Успешно куплено: ${paymentModal.item.name}!`);
    }

    setPaymentModal(null);
    setCardNumber('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const vipTiers = [
    { 
      level: 'VIP', 
      price: 40, 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/10', 
      border: 'border-purple-500/30', 
      hover: 'hover:border-purple-500/50',
      features: [
        'Доступ к VIP заданиям',
        'Премиум значок',
        'Лимит заданий: 100 (в 2 раза больше)'
      ]
    },
    { 
      level: 'Gold', 
      price: 100, 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/10', 
      border: 'border-yellow-500/30', 
      hover: 'hover:border-yellow-500/50',
      features: [
        'Доступ к VIP и Gold заданиям',
        'Премиум значки',
        '-40% к комиссии (всего 6%)',
        '1 рандомный подарок (до $20)'
      ]
    },
    { 
      level: 'Diamond', 
      price: 250, 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-500/10', 
      border: 'border-cyan-500/30', 
      hover: 'hover:border-cyan-500/50',
      features: [
        'Все преимущества Gold',
        'Эксклюзивный статус',
        'Приоритетная поддержка'
      ]
    },
  ];

  return (
    <div className="space-y-8">
      {successMsg && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl font-medium animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
          {successMsg}
        </div>
      )}

      <div className="space-y-12">
        {/* VIP Section */}
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-6 flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            VIP Комнаты
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vipTiers.map(tier => {
              const isCurrent = currentUser.vip === tier.level;
              const isHigher = 
                (currentUser.vip === 'Diamond') || 
                (currentUser.vip === 'Gold' && tier.level === 'VIP');

              return (
                <div key={tier.level} className={clsx(
                  "rounded-3xl p-8 border flex flex-col items-center text-center transition-all",
                  tier.bg, tier.border, tier.hover,
                  isCurrent && "ring-2 ring-emerald-500"
                )}>
                  <div className={clsx("text-2xl font-bold mb-2", tier.color)}>{tier.level}</div>
                  <div className="text-4xl font-mono font-bold text-white mb-6">${tier.price}</div>
                  <ul className="text-sm text-zinc-400 space-y-3 mb-8 flex-1">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 justify-center">
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setPaymentModal({ type: 'vip', item: tier })}
                    disabled={isCurrent || isHigher}
                    className={clsx(
                      "w-full py-3 rounded-xl font-bold transition-all",
                      isCurrent || isHigher 
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                        : "bg-white text-black hover:bg-zinc-200"
                    )}
                  >
                    {isCurrent ? 'Текущий план' : isHigher ? 'Включено' : 'Улучшить'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gifts Section */}
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-6 flex items-center gap-3">
            <Store className="w-8 h-8 text-emerald-500" />
            Лимитированные подарки
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {gifts.map(gift => {
              const Icon = ICONS[gift.icon] || Heart;
              const isSoldOut = gift.limit <= 0;

              return (
                <div key={gift.id} className={clsx(
                  "bg-zinc-900 border rounded-2xl p-6 flex flex-col items-center text-center transition-all",
                  isSoldOut ? "border-red-500/30 opacity-50" : "border-zinc-800 hover:border-zinc-600"
                )}>
                  <div className="bg-zinc-800 p-4 rounded-full mb-4">
                    <Icon className={clsx("w-8 h-8", isSoldOut ? "text-zinc-500" : "text-pink-500")} />
                  </div>
                  <h3 className="font-bold text-white mb-1">{gift.name}</h3>
                  <div className="text-xl font-mono font-bold text-emerald-500 mb-4">${gift.priceUSD}</div>
                  
                  <div className="w-full bg-zinc-950 rounded-full h-2 mb-2 overflow-hidden">
                    <div 
                      className={clsx("h-full", isSoldOut ? "bg-red-500" : "bg-emerald-500")} 
                      style={{ width: `${(gift.limit / gift.totalLimit) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-zinc-500 mb-6 font-mono">
                    {gift.limit} / {gift.totalLimit} осталось
                  </div>

                  <button
                    onClick={() => setPaymentModal({ type: 'gift', item: gift })}
                    disabled={isSoldOut}
                    className={clsx(
                      "w-full py-2 rounded-lg font-semibold text-sm transition-all",
                      isSoldOut 
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                        : "bg-zinc-100 text-zinc-900 hover:bg-white"
                    )}
                  >
                    {isSoldOut ? 'Распродано' : 'Купить подарок'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Modal */}
        {paymentModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full relative animate-in zoom-in-95 duration-200">
              <button 
                onClick={() => setPaymentModal(null)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500/10 p-3 rounded-xl">
                  <CreditCard className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-white">Безопасная оплата</h3>
              </div>

              <div className="bg-zinc-950 rounded-xl p-4 mb-6 border border-zinc-800 flex justify-between items-center">
                <div>
                  <div className="text-sm text-zinc-500">Товар</div>
                  <div className="font-bold text-white">
                    {paymentModal.type === 'vip' ? `${paymentModal.item.level} Статус` : paymentModal.item.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-zinc-500">Итого</div>
                  <div className="font-bold font-mono text-emerald-500 text-xl">
                    ${paymentModal.type === 'vip' ? paymentModal.item.price : paymentModal.item.priceUSD}
                  </div>
                </div>
              </div>

              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Номер карты (Фейк)</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    placeholder="0000 0000 0000 0000"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required
                    minLength={16}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Срок</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl mt-6 transition-colors"
                >
                  Оплатить
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
