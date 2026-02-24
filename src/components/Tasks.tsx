import React, { useState } from 'react';
import { useApp, getProfileLevel } from '../store';
import { CheckCircle, Crown, Coins, ExternalLink, Activity } from 'lucide-react';
import clsx from 'clsx';

export const Tasks = () => {
  const { tasks, completeTask, currentUser } = useApp();
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'normal' | 'vip' | 'gold'>('normal');

  if (!currentUser) return null;

  const handleComplete = (taskId: string, reward: number) => {
    completeTask(taskId);
    setToast(`+${reward} Коинов получено!`);
    setTimeout(() => setToast(null), 3000);
  };

  const levelInfo = getProfileLevel(currentUser.experience);
  const progress = (levelInfo.currentXP / levelInfo.nextXP) * 100;

  const filteredTasks = tasks.filter(t => t.type === activeTab);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Уровень {levelInfo.level}
              </span>
              <span>{levelInfo.currentXP} / {levelInfo.nextXP} XP</span>
            </div>
            <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 px-6 py-3 rounded-2xl text-center">
            <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Заработано сегодня</div>
            <div className="text-xl font-mono font-bold text-emerald-500">{currentUser.earnedToday}</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 px-6 py-3 rounded-2xl text-center">
            <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Всего заданий</div>
            <div className="text-xl font-mono font-bold text-blue-500">{currentUser.totalTasksCompleted || 0}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white tracking-tight">Задания</h2>
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('normal')}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'normal' ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Обычные
          </button>
          <button
            onClick={() => setActiveTab('vip')}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'vip' ? "bg-purple-500 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            VIP
          </button>
          <button
            onClick={() => setActiveTab('gold')}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === 'gold' ? "bg-yellow-500 text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Gold
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl font-medium animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
          {toast}
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-20 text-emerald-500" />
          <p className="text-lg">Нет доступных заданий в этой категории!</p>
          <p className="text-sm mt-2">Возвращайтесь позже.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map(task => {
            const isVip = task.type === 'vip';
            const isGold = task.type === 'gold';
            const canComplete = 
              (task.type === 'normal') || 
              (task.type === 'vip' && currentUser.vip !== 'None') ||
              (task.type === 'gold' && (currentUser.vip === 'Gold' || currentUser.vip === 'Diamond'));

            return (
              <div 
                key={task.id} 
                className={clsx(
                  "bg-zinc-900 border rounded-2xl p-6 flex flex-col justify-between transition-all hover:border-zinc-700",
                  isGold ? "border-yellow-500/30" : isVip ? "border-purple-500/30" : "border-zinc-800"
                )}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {isGold ? <Crown className="w-4 h-4 text-yellow-500" /> : isVip && <Crown className="w-4 h-4 text-purple-500" />}
                      <h3 className="text-lg font-semibold text-white">{task.name}</h3>
                    </div>
                    <div className="text-sm text-zinc-500">
                      {isGold ? 'Требуется Gold статус' : isVip ? 'Требуется VIP статус' : 'Обычное задание'}
                    </div>
                    {task.link && (
                      <a 
                        href={task.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> Перейти к заданию
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg font-bold font-mono">
                    +{task.reward} <Coins className="w-4 h-4" />
                  </div>
                </div>

                <button
                  onClick={() => handleComplete(task.id, task.reward)}
                  disabled={!canComplete}
                  className={clsx(
                    "w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
                    canComplete 
                      ? "bg-zinc-800 hover:bg-zinc-700 text-white" 
                      : "bg-zinc-950 text-zinc-600 cursor-not-allowed border border-zinc-900"
                  )}
                >
                  <CheckCircle className="w-5 h-5" />
                  {canComplete ? 'Выполнить' : isGold ? 'Нужен Gold' : 'Нужен VIP'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
