import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store';
import { Send, Hash, User as UserIcon } from 'lucide-react';
import clsx from 'clsx';

interface ChatWindowProps {
  type: 'global' | 'private';
  targetUser?: string;
}

export const ChatWindow = ({ type, targetUser }: ChatWindowProps) => {
  const { currentUser, users, globalChat, privateChats, sendGlobalMessage, sendPrivateMessage } = useApp();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!currentUser) return null;

  const pairKey = targetUser ? [currentUser.username, targetUser].sort().join('_') : '';
  const messages = type === 'global' ? globalChat : (privateChats[pairKey] || []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (type === 'global') {
      sendGlobalMessage(input);
    } else if (targetUser) {
      sendPrivateMessage(targetUser, input);
    }
    setInput('');
  };

  const getSenderAvatar = (username: string) => {
    const user = users.find(u => u.username === username);
    return user?.avatarUrl;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="bg-zinc-950/50 border-b border-zinc-800 p-4 flex items-center gap-3">
        {type === 'global' ? (
          <>
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Hash className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-white">Глобальный чат</h3>
              <p className="text-xs text-zinc-500">Виден всем</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <UserIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-white">{targetUser}</h3>
              <p className="text-xs text-zinc-500">Личная переписка</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => {
          const isMe = msg.sender === currentUser.username;
          const avatar = getSenderAvatar(msg.sender);
          return (
            <div key={msg.id} className={clsx("flex gap-3", isMe ? "flex-row-reverse" : "flex-row")}>
              <div className="flex-shrink-0 mt-1">
                {avatar ? (
                  <img src={avatar} alt={msg.sender} className="w-8 h-8 rounded-full object-cover border border-zinc-700" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 border border-zinc-700">
                    {msg.sender[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className={clsx("flex flex-col", isMe ? "items-end" : "items-start")}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={clsx("text-xs font-bold", isMe ? "text-emerald-500" : "text-zinc-400")}>
                    {isMe ? 'Вы' : msg.sender}
                  </span>
                  <span className="text-[10px] text-zinc-600">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={clsx(
                  "px-4 py-2 rounded-2xl max-w-[250px] md:max-w-md break-words",
                  isMe ? "bg-emerald-500 text-white rounded-tr-sm" : "bg-zinc-800 text-zinc-200 rounded-tl-sm"
                )}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-zinc-500">
            Пока нет сообщений. Поздоровайтесь!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Введите сообщение..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white p-3 rounded-xl transition-colors flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
