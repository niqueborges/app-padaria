import React from 'react';
import { ShoppingBag, LayoutGrid, BarChart3, LogOut, User as UserIcon, Store } from 'lucide-react';
import type { User } from '../types/index.js';

interface NavbarProps {
  activeTab: 'pos' | 'products' | 'reports';
  setActiveTab: (tab: 'pos' | 'products' | 'reports') => void;
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLogout,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <div className="brand-icon">
            <Store size={22} />
          </div>
          <div>
            <div className="brand-title">Padaria do Pedro</div>
            <div className="brand-subtitle">Gestão & Ponto de Venda</div>
          </div>
        </div>

        <nav className="navbar-nav">
          <button
            className={`nav-tab ${activeTab === 'pos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pos')}
          >
            <ShoppingBag size={18} />
            <span>Ponto de Venda (PDV)</span>
          </button>

          <button
            className={`nav-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <LayoutGrid size={18} />
            <span>Cardápio & Estoque</span>
          </button>

          <button
            className={`nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <BarChart3 size={18} />
            <span>Faturamento</span>
          </button>
        </nav>

        <div className="user-profile">
          {user && (
            <div className="user-badge">
              <UserIcon size={16} color="var(--color-primary)" />
              <span style={{ fontWeight: 600 }}>{user.name}</span>
            </div>
          )}
          <button
            className="btn btn-secondary btn-sm"
            onClick={onLogout}
            title="Encerrar sessão"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};
