import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, ShoppingCart, Calendar, TrendingUp, Filter } from 'lucide-react';
import { api } from '../services/api.js';
import type { RevenueReport } from '../types/index.js';

export const ReportsView: React.FC = () => {
  const today = new Date().toISOString().split('T')[0] ?? '';
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [dailyReport, setDailyReport] = useState<RevenueReport | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<RevenueReport | null>(null);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  const fetchDailyReport = useCallback(async () => {
    try {
      setLoadingDaily(true);
      const response = await api.get(`/reports/daily?date=${selectedDate}`);
      setDailyReport(response.data);
    } catch {
      setDailyReport(null);
    } finally {
      setLoadingDaily(false);
    }
  }, [selectedDate]);

  const fetchMonthlyReport = useCallback(async () => {
    try {
      setLoadingMonthly(true);
      const response = await api.get(
        `/reports/monthly?year=${selectedYear}&month=${selectedMonth}`
      );
      setMonthlyReport(response.data);
    } catch {
      setMonthlyReport(null);
    } finally {
      setLoadingMonthly(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchDailyReport();
  }, [fetchDailyReport]);

  useEffect(() => {
    fetchMonthlyReport();
  }, [fetchMonthlyReport]);

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>Relatórios Financeiros</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Consolidação de receitas e métricas de vendas da padaria
        </p>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}
      >
        {/* Card 1: Faturamento do Dia */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
            }}
          >
            <DollarSign size={26} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 4 }}>
              Faturamento Diário ({selectedDate})
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
              R$ {dailyReport ? dailyReport.totalRevenue.toFixed(2).replace('.', ',') : '0,00'}
            </div>
          </div>
        </div>

        {/* Card 2: Quantidade de Vendas no Dia */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-info-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-info)',
            }}
          >
            <ShoppingCart size={26} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 4 }}>
              Vendas Concluídas no Dia
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {dailyReport ? dailyReport.totalSales : 0} pedidos
            </div>
          </div>
        </div>

        {/* Card 3: Faturamento do Mês */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-success-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-success)',
            }}
          >
            <TrendingUp size={26} />
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 4 }}>
              Receita do Mês ({selectedMonth}/{selectedYear})
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
              R$ {monthlyReport ? monthlyReport.totalRevenue.toFixed(2).replace('.', ',') : '0,00'}
            </div>
          </div>
        </div>
      </div>

      {/* Painéis de Filtro e Detalhamento */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Painel Diario */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={20} color="var(--color-primary)" />
              <h3 className="card-title">Consulta por Data</h3>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Selecione o Dia</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                type="date"
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <button
                className="btn btn-secondary"
                onClick={fetchDailyReport}
                disabled={loadingDaily}
              >
                <Filter size={16} />
                <span>Atualizar</span>
              </button>
            </div>
          </div>

          <div
            style={{
              padding: 20,
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Período Selecionado:</span>
              <span style={{ fontWeight: 600 }}>{selectedDate}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Total de Pedidos:</span>
              <span style={{ fontWeight: 600 }}>{dailyReport?.totalSales ?? 0}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 12,
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Receita Total:</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '1.2rem' }}>
                R$ {dailyReport?.totalRevenue.toFixed(2).replace('.', ',') ?? '0,00'}
              </span>
            </div>
          </div>
        </div>

        {/* Painel Mensal */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={20} color="var(--color-success)" />
              <h3 className="card-title">Consulta Mensal</h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, marginBottom: 20, alignItems: 'flex-end' }}>
            <div>
              <label className="form-label">Mês</label>
              <select
                className="form-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Ano</label>
              <input
                type="number"
                className="form-input"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                min="2020"
                max="2100"
              />
            </div>

            <div>
              <button
                className="btn btn-secondary"
                onClick={fetchMonthlyReport}
                disabled={loadingMonthly}
              >
                <Filter size={16} />
                <span>Atualizar</span>
              </button>
            </div>
          </div>

          <div
            style={{
              padding: 20,
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Mês/Ano:</span>
              <span style={{ fontWeight: 600 }}>
                {months.find((m) => m.value === selectedMonth)?.label} de {selectedYear}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Total de Pedidos no Mês:</span>
              <span style={{ fontWeight: 600 }}>{monthlyReport?.totalSales ?? 0}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 12,
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Faturamento do Mês:</span>
              <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '1.2rem' }}>
                R$ {monthlyReport?.totalRevenue.toFixed(2).replace('.', ',') ?? '0,00'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
