import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { api } from '../services/api.js';
import type { Product } from '../types/index.js';

export const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
    } catch {
      setToastMessage('Erro ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setStock('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const payload = {
        name: name.trim(),
        price: parseFloat(price),
        stock: parseInt(stock, 10),
      };

      if (editingProduct?.id) {
        await api.put(`/products/${editingProduct.id}`, payload);
        setToastMessage(`Produto "${payload.name}" atualizado com sucesso!`);
      } else {
        await api.post('/products', payload);
        setToastMessage(`Produto "${payload.name}" cadastrado com sucesso!`);
      }

      closeModal();
      await fetchProducts();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Erro ao salvar produto.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!product.id) return;
    if (!window.confirm(`Tem certeza que deseja excluir "${product.name}"?`)) return;

    try {
      await api.delete(`/products/${product.id}`);
      setToastMessage(`Produto "${product.name}" removido com sucesso.`);
      await fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir produto.');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>Cardápio & Estoque</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Gerenciamento de itens, valores unitários e disponibilidade
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', width: 260 }}>
            <Search
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
              type="text"
              className="form-input"
              style={{ paddingLeft: 38 }}
              placeholder="Filtrar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-success-light)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={18} />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tabela de Produtos */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Carregando produtos...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
            <p>Nenhum produto cadastrado</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
                <th style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Item</th>
                <th style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Preço Unitário</th>
                <th style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estoque</th>
                <th style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '14px 20px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stock <= 0;
                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--color-primary)', fontWeight: 700 }}>
                      R$ {p.price.toFixed(2).replace('.', ',')}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>{p.stock} unidades</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        className={`badge ${
                          isOutOfStock
                            ? 'badge-danger'
                            : p.stock < 10
                            ? 'badge-warning'
                            : 'badge-success'
                        }`}
                      >
                        {isOutOfStock ? 'Esgotado' : p.stock < 10 ? 'Baixo Estoque' : 'Disponível'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(p)}
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(p)}
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Cadastro / Edicao */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button
                onClick={closeModal}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-danger-light)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-danger)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome do Produto</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Pão Francês (kg)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-input"
                    placeholder="0,00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estoque Inicial</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  <span>{formLoading ? 'Salvando...' : 'Salvar Produto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
