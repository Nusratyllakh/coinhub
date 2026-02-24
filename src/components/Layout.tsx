import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { LayoutDashboard, CheckSquare, Store, Users, MessageSquare, UserCircle, ShieldAlert, LogOut, Menu, X, Coins, Sparkles, ShoppingBag } from 'lucide-react';
import clsx from 'clsx';

export const Layout = ({ children, activeTab, setActiveTab }: { children: React.ReactNode, activeTab: string, setActiveTab: (t: string) => void }) => {
  const { currentUser, logout, coinRate } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!currentUser) return null;

  const navItems = [
    { id: 'dashboard', label: 'Главная', icon: LayoutDashboard },
    { id: 'tasks', label: 'Задания', icon: CheckSquare },
    { id: 'roulette', label: 'Рулетка', icon: Sparkles },
    { id: 'marketplace', label: 'Магазин', icon: Store },
    { id: 'usermarket', label: 'Рынок игроков', icon: ShoppingBag },
    { id: 'community', label: 'Сообщество', icon: Users },
    { id: 'chat', label: 'Глобальный чат', icon: MessageSquare },
    { id: 'profile', label: 'Профиль', icon: UserCircle },
  ];

  if (currentUser.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Админ Панель', icon: ShieldAlert });
  }

  const currentRate = coinRate[coinRate.length - 1].rate.toFixed(4);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed md:static inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 transform transition-transform duration-200 ease-in-out flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:hidden md:w-0 md:translate-x-0"
      )}>
        <div className="p-6 flex items-center justify-between text-emerald-500 font-bold text-2xl tracking-tight">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-xl">
              <Coins className="w-6 h-6" />
            </div>
            CoinHub
          </div>
          <button className="md:hidden text-zinc-400" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                activeTab === item.id 
                  ? "bg-emerald-500/10 text-emerald-500" 
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="px-4 py-2 text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
            Версия 0.1.0
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            Выйти
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        {/* Topbar */}
        <header className="h-16 bg-zinc-900/50 backdrop-blur border-b border-zinc-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-4 py-1.5 rounded-full text-sm font-mono text-zinc-400">
              <span className="text-emerald-500">1 COIN</span> = ${currentRate}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Баланс</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                {currentUser.coins.toLocaleString()} <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="w-px h-8 bg-zinc-800 mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('profile')}>
              <div className="text-right hidden sm:block">
                <div className={clsx(
                  "text-sm font-semibold",
                  currentUser.vip === 'Diamond' ? "text-cyan-400" :
                  currentUser.vip === 'Gold' ? "text-yellow-400" :
                  currentUser.vip === 'VIP' ? "text-purple-400" : "text-zinc-200"
                )}>
                  {currentUser.username}
                </div>
                <div className="text-xs text-zinc-500">{currentUser.vip !== 'None' ? currentUser.vip : 'Пользователь'}</div>
              </div>
              {currentUser.avatarUrl ? (
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.username} 
                  className={clsx(
                    "w-10 h-10 rounded-full object-cover border-2",
                    currentUser.vip === 'Diamond' ? "border-cyan-500/50" :
                    currentUser.vip === 'Gold' ? "border-yellow-500/50" :
                    currentUser.vip === 'VIP' ? "border-purple-500/50" : "border-zinc-700"
                  )}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2",
                  currentUser.vip === 'Diamond' ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" :
                  currentUser.vip === 'Gold' ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" :
                  currentUser.vip === 'VIP' ? "bg-purple-500/20 text-purple-400 border-purple-500/50" : "bg-zinc-800 text-zinc-400 border-zinc-700"
                )}>
                  {currentUser.username[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-950">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
