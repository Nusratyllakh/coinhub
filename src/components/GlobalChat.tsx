import React from 'react';
import { ChatWindow } from './ChatWindow';

export const GlobalChat = () => {
  return (
    <div className="space-y-6 h-full">
      <h2 className="text-3xl font-bold text-white tracking-tight">Глобальный чат</h2>
      <ChatWindow type="global" />
    </div>
  );
};
