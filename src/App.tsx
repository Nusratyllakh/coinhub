/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './store';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Tasks } from './components/Tasks';
import { Marketplace } from './components/Marketplace';
import { Community } from './components/Community';
import { GlobalChat } from './components/GlobalChat';
import { Profile } from './components/Profile';
import { Admin } from './components/Admin';
import { Roulette } from './components/Roulette';
import { UserMarket } from './components/UserMarket';

const MainApp = () => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!currentUser) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'tasks': return <Tasks />;
      case 'roulette': return <Roulette />;
      case 'marketplace': return <Marketplace />;
      case 'usermarket': return <UserMarket />;
      case 'community': return <Community />;
      case 'chat': return <GlobalChat />;
      case 'profile': return <Profile />;
      case 'admin': return <Admin />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
