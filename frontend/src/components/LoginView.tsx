import React, { useState } from 'react';
import { Store, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../services/api.js';
import type { User } from '../types/index.js';

interface LoginViewProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken } = response.data;
      onLoginSuccess(user, accessToken);
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Erro ao realizar login. Verifique suas credenciais.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'radial-gradient(circle at top, #1e293b 0%, #0b0f19 70%)',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 440,
          width: '100%',
          padding: 36,
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            className="brand-icon"
            style={{ width: 56, height: 56, margin: '0 auto 16px' }}
          >
            <Store size={30} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 6 }}>Padaria do Pedro</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Acesso restrito aos operadores do caixa
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-danger-light)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-danger)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20,
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
              E-mail do Operador
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                id="email-input"
                type="email"
                className="form-input"
                style={{ paddingLeft: 38 }}
                placeholder="pedro@padaria.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label" htmlFor="password-input">
              Senha de Acesso
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                id="password-input"
                type="password"
                className="form-input"
                style={{ paddingLeft: 38 }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            <span>{loading ? 'Entrando...' : 'Acessar Sistema'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <ShieldCheck size={14} color="var(--color-primary)" />
            <span>Atalhos de Acesso Rápido:</span>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('pedro@padaria.com', 'padaria123')}
            >
              Pedro (Dono)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('maria@padaria.com', 'maria123')}
            >
              Maria (Esposa)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
