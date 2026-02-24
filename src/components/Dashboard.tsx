import React, { useState } from 'react';
import { useApp } from '../store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, Gift, CheckCircle, History } from 'lucide-react';

export const Dashboard = () => {
  const { currentUser, coinRate, tasks } = useApp();
  const [showFullHistory, setShowFullHistory] = useState(false);

  if (!currentUser) return null;

  const currentRate = coinRate[coinRate.length - 1].rate;
  const previousRate = coinRate.length > 1 ? coinRate[coinRate.length - 2].rate : currentRate;
  const rateChange = currentRate - previousRate;
  const isUp = rateChange >= 0;

  const displayData = showFullHistory ? coinRate : coinRate.slice(-20);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Текущий курс</h3>
            <TrendingUp className={`w-5 h-5 ${isUp ? 'text-emerald-500' : 'text-red-500'}`} />
          </div>
          <div>
            <div className="text-3xl font-mono font-bold text-white">${currentRate.toFixed(4)}</div>
            <div className={`text-sm mt-1 font-medium ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
              {isUp ? '+' : ''}{(rateChange / previousRate * 100).toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Заработано сегодня</h3>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="text-3xl font-mono font-bold text-white">{currentUser.earnedToday}</div>
            <div className="text-sm mt-1 text-zinc-500">Коинов</div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Мои подарки</h3>
            <Gift className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <div className="text-3xl font-mono font-bold text-white">{currentUser.gifts.length}</div>
            <div className="text-sm mt-1 text-zinc-500">Собрано</div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Доступные задания</h3>
            <CheckCircle className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <div className="text-3xl font-mono font-bold text-white">{tasks.filter(t => !currentUser.completedTasks?.includes(t.id)).length}</div>
            <div className="text-sm mt-1 text-zinc-500">Готовы к выполнению</div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            История курса Coin
          </h3>
          <button 
            onClick={() => setShowFullHistory(!showFullHistory)}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <History className="w-4 h-4" />
            {showFullHistory ? 'Последние 20' : 'Вся история'}
          </button>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#71717a" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                interval={showFullHistory ? Math.floor(displayData.length / 10) : 2}
              />
              <YAxis 
                stroke="#71717a" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                domain={['auto', 'auto']}
                tickFormatter={(value) => '$' + value.toFixed(4)}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                formatter={(value: number) => ['$' + value.toFixed(4), 'Курс']}
              />
              <Area 
                type="monotone" 
                dataKey="rate" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorRate)" 
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
