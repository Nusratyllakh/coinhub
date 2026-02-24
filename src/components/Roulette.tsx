import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { Gift, Coins, Percent, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const PRIZES = [
  { id: 0, label: '10 Коинов', type: 'coins', amount: 10, icon: Coins, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 1, label: '20 Коинов', type: 'coins', amount: 20, icon: Coins, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 2, label: '30 Коинов', type: 'coins', amount: 30, icon: Coins, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 3, label: '40 Коинов', type: 'coins', amount: 40, icon: Coins, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 4, label: '5 Коинов', type: 'coins', amount: 5, icon: Coins, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 5, label: '100 Коинов', type: 'coins', amount: 100, icon: Coins, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 6, label: 'Подарок', type: 'gift', giftId: '1', icon: Gift, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { id: 7, label: '50 Коинов', type: 'coins', amount: 50, icon: Coins, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
];

export const Roulette = () => {
  const { currentUser, spinRoulette } = useApp();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<typeof PRIZES[0] | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    
    const updateTimer = () => {
      const now = Date.now();
      const lastSpin = currentUser.lastRouletteTime || 0;
      const timePassed = now - lastSpin;
      const cooldown = 12 * 60 * 60 * 1000; // 12 hours
      
      if (timePassed < cooldown) {
        const remaining = cooldown - timePassed;
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}ч ${minutes}м ${seconds}с`);
      } else {
        setTimeLeft(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentUser]);

  if (!currentUser) return null;

  const canSpin = !timeLeft;

  const handleSpin = () => {
    if (!canSpin || isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    // Determine prize based on probabilities
    const rand = Math.random();
    let selectedPrizeIndex = 0;
    if (rand < 0.30) selectedPrizeIndex = 0; // 10 coins (30%)
    else if (rand < 0.55) selectedPrizeIndex = 1; // 20 coins (25%)
    else if (rand < 0.70) selectedPrizeIndex = 2; // 30 coins (15%)
    else if (rand < 0.80) selectedPrizeIndex = 3; // 40 coins (10%)
    else if (rand < 0.94) selectedPrizeIndex = 4; // 5 coins (14%)
    else if (rand < 0.99) selectedPrizeIndex = 5; // 15% bonus (5%)
    else if (rand < 0.995) selectedPrizeIndex = 6; // Gift (0.5%)
    else selectedPrizeIndex = 7; // 50 coins (0.5%)

    const prize = PRIZES[selectedPrizeIndex];
    
    // Animation logic
    let currentIdx = 0;
    const totalSpins = 32 + selectedPrizeIndex; // Spin around exactly 4 times + index
    let delay = 50;

    const spinStep = (step: number) => {
      setActiveIndex(currentIdx % 8);
      currentIdx++;

      if (step < totalSpins) {
        // Slow down towards the end
        if (step > totalSpins - 10) delay += 30;
        setTimeout(() => spinStep(step + 1), delay);
      } else {
        setIsSpinning(false);
        setResult(prize);
        spinRoulette(prize.type as any, prize.amount, prize.giftId);
      }
    };

    spinStep(0);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-yellow-500" />
          Ежедневная Рулетка
        </h2>
        <p className="text-zinc-400">Крутите колесо каждый день и получайте призы!</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
          {/* Top row */}
          <PrizeBox prize={PRIZES[0]} isActive={activeIndex === 0} />
          <PrizeBox prize={PRIZES[1]} isActive={activeIndex === 1} />
          <PrizeBox prize={PRIZES[2]} isActive={activeIndex === 2} />
          
          {/* Middle row */}
          <PrizeBox prize={PRIZES[7]} isActive={activeIndex === 7} />
          <div className="flex items-center justify-center">
            <button
              onClick={handleSpin}
              disabled={!canSpin || isSpinning}
              className={clsx(
                "w-full h-full rounded-2xl font-bold text-lg transition-all flex flex-col items-center justify-center gap-2",
                canSpin && !isSpinning
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              )}
            >
              {isSpinning ? 'Крутим...' : canSpin ? 'КРУТИТЬ' : timeLeft}
            </button>
          </div>
          <PrizeBox prize={PRIZES[3]} isActive={activeIndex === 3} />
          
          {/* Bottom row */}
          <PrizeBox prize={PRIZES[6]} isActive={activeIndex === 6} />
          <PrizeBox prize={PRIZES[5]} isActive={activeIndex === 5} />
          <PrizeBox prize={PRIZES[4]} isActive={activeIndex === 4} />
        </div>

        {result && (
          <div className="text-center animate-in zoom-in duration-300">
            <div className="inline-block bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">Поздравляем!</h3>
              <p className="text-emerald-400 font-medium flex items-center justify-center gap-2 text-lg">
                Вы выиграли: {result.label} <result.icon className="w-5 h-5" />
              </p>
            </div>
          </div>
        )}

        {!canSpin && !result && (
          <div className="text-center text-zinc-500">
            Следующая попытка через: <span className="text-white font-mono">{timeLeft}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const PrizeBox = ({ prize, isActive }: { prize: typeof PRIZES[0], isActive: boolean }) => {
  const Icon = prize.icon;
  return (
    <div className={clsx(
      "aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 text-center transition-all duration-200",
      isActive 
        ? "border-white bg-white/10 scale-105 shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
        : "border-zinc-800 bg-zinc-950"
    )}>
      <div className={clsx("p-2 rounded-full mb-2", prize.bg)}>
        <Icon className={clsx("w-6 h-6", prize.color)} />
      </div>
      <div className="text-xs font-bold text-white leading-tight">
        {prize.label}
      </div>
    </div>
  );
};
