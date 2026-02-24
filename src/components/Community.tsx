import React, { useState } from 'react';
import { useApp, getProfileLevel } from '../store';
import { Search, MessageCircle, User as UserIcon, ShieldAlert, Eye } from 'lucide-react';
import clsx from 'clsx';
import { ChatWindow } from './ChatWindow';
import { PublicProfile } from './PublicProfile';

export const Community = () => {
  const { users, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [viewProfile, setViewProfile] = useState<string | null>(null);

  if (!currentUser) return null;

  const filteredUsers = users.filter(u => 
    u.username !== currentUser.username && 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  if (viewProfile) {
    return (
      <PublicProfile 
        username={viewProfile} 
        onBack={() => setViewProfile(null)} 
        onMessage={() => {
          setActiveChat(viewProfile);
          setViewProfile(null);
        }} 
      />
    );
  }

  if (activeChat) {
    return (
      <div className="h-[calc(100vh-8rem)]">
        <button 
          onClick={() => setActiveChat(null)}
          className="mb-4 text-zinc-400 hover:text-white flex items-center gap-2"
        >
          &larr; Назад к сообществу
        </button>
        <ChatWindow type="private" targetUser={activeChat} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-white tracking-tight">Сообщество</h2>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Поиск пользователей..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
        </div>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(user => {
          const levelInfo = getProfileLevel(user.experience);
          
          return (
            <div key={user.username} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between transition-all hover:border-zinc-700">
              <div className="flex items-start gap-4 mb-6">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.username} 
                    className={clsx(
                      "w-12 h-12 rounded-full object-cover border-2 flex-shrink-0",
                      user.vip === 'Diamond' ? "border-cyan-500/50" :
                      user.vip === 'Gold' ? "border-yellow-500/50" :
                      user.vip === 'VIP' ? "border-purple-500/50" : "border-zinc-700"
                    )}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={clsx(
                    "w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-2 flex-shrink-0",
                    user.vip === 'Diamond' ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" :
                    user.vip === 'Gold' ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" :
                    user.vip === 'VIP' ? "bg-purple-500/20 text-purple-400 border-purple-500/50" : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  )}>
                    {user.username[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white truncate">{user.username}</h3>
                    {user.role === 'admin' && <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={clsx(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      user.vip === 'Diamond' ? "bg-cyan-500/10 text-cyan-400" :
                      user.vip === 'Gold' ? "bg-yellow-500/10 text-yellow-400" :
                      user.vip === 'VIP' ? "bg-purple-500/10 text-purple-400" : "bg-zinc-800 text-zinc-400"
                    )}>
                      {user.vip !== 'None' ? user.vip : 'Пользователь'}
                    </span>
                    <span className="text-xs text-zinc-500">&bull;</span>
                    <span className="text-xs text-zinc-400 font-bold">Ур. {levelInfo.level}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setViewProfile(user.username)}
                  className="w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white transition-all text-sm"
                >
                  <Eye className="w-4 h-4" />
                  Профиль
                </button>
                <button
                  onClick={() => setActiveChat(user.username)}
                  className="w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-all text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Написать
                </button>
              </div>
            </div>
          );
        })}
        {filteredUsers.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500">
            <UserIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Пользователи не найдены по запросу "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
};
