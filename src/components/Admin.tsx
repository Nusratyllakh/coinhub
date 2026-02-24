import React, { useState, useMemo } from 'react';
import { useApp } from '../store';
import { ShieldAlert, Users, PlusCircle, Coins, Search, Activity, Key, Hash } from 'lucide-react';

export const Admin = () => {
  const { currentUser, users, updateUserCoins, addTask, transactions, adminUpdatePassword } = useApp();
  const [taskName, setTaskName] = useState('');
  const [taskReward, setTaskReward] = useState('');
  const [taskLink, setTaskLink] = useState('');
  const [taskType, setTaskType] = useState<'normal' | 'vip' | 'gold'>('normal');
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
        <ShieldAlert className="w-16 h-16 text-red-500/50" />
        <h2 className="text-2xl font-bold text-white">Доступ запрещен</h2>
        <p>У вас нет прав для просмотра этой страницы.</p>
      </div>
    );
  }

  const handleUpdateCoins = (username: string, currentCoins: number) => {
    const newCoins = prompt(`Введите новый баланс коинов для ${username}:`, currentCoins.toString());
    if (newCoins !== null && !isNaN(Number(newCoins))) {
      if (window.confirm(`Вы уверены, что хотите изменить баланс ${username} на ${newCoins} коинов?`)) {
        updateUserCoins(username, Number(newCoins));
        setToast(`Обновлен баланс для ${username}`);
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  const handleUpdatePassword = (username: string) => {
    const newPass = prompt(`Введите новый пароль для ${username}:`);
    if (newPass) {
      if (window.confirm(`Вы уверены, что хотите изменить пароль для ${username}?`)) {
        adminUpdatePassword(username, newPass);
        setToast(`Пароль для ${username} обновлен`);
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(u => 
      u.username.toLowerCase().includes(query) || 
      (u.id && u.id.includes(query))
    );
  }, [users, searchQuery]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName || !taskReward) return;

    addTask({
      name: taskName,
      reward: Number(taskReward),
      type: taskType,
      link: taskLink || undefined
    });

    setTaskName('');
    setTaskReward('');
    setTaskLink('');
    setTaskType('normal');
    setToast(`Добавлено новое задание: ${taskName}`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-2xl font-medium animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
          {toast}
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <div className="bg-red-500/10 p-3 rounded-xl">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Админ Панель</h2>
          <p className="text-zinc-500">Управление пользователями и экономикой</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col h-[600px]">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Управление пользователями
          </h3>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Поиск по нику или ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {filteredUsers.map(user => (
              <div key={user.username} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      {user.username}
                      {user.role === 'admin' && <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Админ</span>}
                    </div>
                    <div className="text-sm text-zinc-500 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {user.id || 'N/A'}</span>
                      <span className="flex items-center gap-1"><Key className="w-3 h-3" /> {user.passwordHash}</span>
                      <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> XP: {user.experience || 0}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Баланс</div>
                    <div className="font-mono font-bold text-emerald-500 flex items-center gap-1">
                      {user.coins} <Coins className="w-3 h-3" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/50">
                  <button
                    onClick={() => handleUpdateCoins(user.username, user.coins)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Изменить баланс
                  </button>
                  <button
                    onClick={() => handleUpdatePassword(user.username)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Изменить пароль
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-purple-500" />
              Добавить новое задание
            </h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Название задания</label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  placeholder="напр., Посмотреть рекламу"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Награда (Коины)</label>
                <input
                  type="number"
                  value={taskReward}
                  onChange={(e) => setTaskReward(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                  placeholder="напр., 50"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Ссылка на задание (необязательно)</label>
                <input
                  type="url"
                  value={taskLink}
                  onChange={(e) => setTaskLink(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Тип задания</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as 'normal' | 'vip' | 'gold')}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                >
                  <option value="normal">Обычное</option>
                  <option value="vip">VIP</option>
                  <option value="gold">Gold</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-xl mt-6 transition-colors flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Создать задание
              </button>
            </form>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 h-[300px] flex flex-col">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Последние транзакции
            </h3>
            <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {transactions.length === 0 ? (
                <div className="text-zinc-500 text-center py-4">Нет транзакций</div>
              ) : (
                transactions.map(tx => (
                  <div key={tx.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-white">
                        {tx.type === 'transfer' ? 'Перевод' : tx.type === 'market_sale' ? 'Рынок' : 'Админ'}
                      </span>
                      <span className="text-emerald-500 font-mono font-bold">+{tx.amount}</span>
                    </div>
                    <div className="text-zinc-400 text-xs">
                      {tx.fromUser && <span className="text-zinc-300">{tx.fromUser}</span>} 
                      {tx.fromUser && ' → '} 
                      <span className="text-zinc-300">{tx.toUser}</span>
                    </div>
                    {tx.details && <div className="text-zinc-500 text-xs mt-1">{tx.details}</div>}
                    <div className="text-zinc-600 text-[10px] mt-1">
                      {new Date(tx.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
