import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { LoginView } from './components/LoginView.js';
import { PosView } from './components/PosView.js';
import { ProductsView } from './components/ProductsView.js';
import { ReportsView } from './components/ReportsView.js';
import type { User } from './types/index.js';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('@padaria:user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeTab, setActiveTab] = useState<'pos' | 'products' | 'reports'>('pos');

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const handleLoginSuccess = (authenticatedUser: User, token: string) => {
    localStorage.setItem('@padaria:token', token);
    localStorage.setItem('@padaria:user', JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('@padaria:token');
    localStorage.removeItem('@padaria:user');
    setUser(null);
  };

  if (!user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {activeTab === 'pos' && <PosView />}
        {activeTab === 'products' && <ProductsView />}
        {activeTab === 'reports' && <ReportsView />}
      </main>
    </div>
  );
};

export default App;
