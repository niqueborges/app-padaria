import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Search,
  Receipt,
  Coffee,
} from 'lucide-react';
import { api } from '../services/api.js';
import type { Product, CartItem } from '../types/index.js';

export const PosView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
    } catch {
      setErrorMessage('Erro ao carregar lista de produtos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product: Product) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    const currentQtyInCart = existingIndex >= 0 ? (cart[existingIndex]?.quantity ?? 0) : 0;

    if (currentQtyInCart + 1 > product.stock) {
      setErrorMessage(`Estoque insuficiente para "${product.name}". Disponível: ${product.stock}`);
      return;
    }

    if (existingIndex >= 0) {
      const newCart = [...cart];
      const item = newCart[existingIndex];
      if (item) {
        item.quantity += 1;
      }
      setCart(newCart);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const existingIndex = cart.findIndex((item) => item.product.id === productId);
    if (existingIndex === -1) return;

    const newCart = [...cart];
    const item = newCart[existingIndex];
    if (!item) return;

    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      newCart.splice(existingIndex, 1);
    } else if (newQty > item.product.stock) {
      setErrorMessage(`Limite de estoque atingido para "${item.product.name}".`);
      return;
    } else {
      item.quantity = newQty;
    }

    setCart(newCart);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setCheckoutLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      await api.post('/sales', payload);

      setSuccessMessage(
        `Venda no valor de R$ ${totalAmount.toFixed(2).replace('.', ',')} realizada com sucesso!`
      );
      setCart([]);
      await fetchProducts(); // Atualiza saldo do estoque
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error || 'Erro ao registrar venda. Verifique o estoque dos itens.'
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
      {/* Catalogo de Produtos para Selecao */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>Ponto de Venda (Caixa)</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Selecione os produtos para registrar uma nova venda
            </p>
          </div>

          <div style={{ position: 'relative', width: 280 }}>
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
              placeholder="Buscar item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {successMessage && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-success-light)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20,
            }}
          >
            <CheckCircle size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-danger-light)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20,
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Carregando cardápio...
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            {filteredProducts.map((product) => {
              const inCart = cart.find((i) => i.product.id === product.id)?.quantity || 0;
              const isOutOfStock = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  className="card"
                  style={{
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s, border-color 0.2s',
                    borderColor: inCart > 0 ? 'var(--color-primary)' : 'var(--border-subtle)',
                    opacity: isOutOfStock ? 0.6 : 1,
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-primary)',
                        }}
                      >
                        <Coffee size={18} />
                      </div>
                      <span
                        className={`badge ${
                          isOutOfStock
                            ? 'badge-danger'
                            : product.stock < 10
                            ? 'badge-warning'
                            : 'badge-success'
                        }`}
                      >
                        {isOutOfStock
                          ? 'Esgotado'
                          : `${product.stock} un`}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>{product.name}</h3>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        marginBottom: 12,
                      }}
                    >
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </div>
                  </div>

                  <button
                    className={`btn ${inCart > 0 ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    style={{ width: '100%' }}
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock}
                  >
                    <Plus size={16} />
                    <span>{inCart > 0 ? `Adicionar (+${inCart})` : 'Adicionar'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Painel do Carrinho e Fechamento */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 120px)',
          position: 'sticky',
          top: 90,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 16,
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Receipt size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.15rem' }}>Comanda do Pedido</h3>
          </div>
          {cart.length > 0 && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--color-danger)', borderColor: 'transparent' }}
              onClick={clearCart}
            >
              Limpar
            </button>
          )}
        </div>

        {/* Lista de Itens do Carrinho */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          {cart.length === 0 ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: 20,
              }}
            >
              <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
              <p>Nenhum item selecionado</p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: 4 }}>
                Clique nos produtos ao lado para incluir no pedido
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  style={{
                    padding: 12,
                    backgroundColor: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {item.product.name}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-subtle)',
                        cursor: 'pointer',
                      }}
                      title="Remover item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 8px' }}
                        onClick={() => updateQuantity(item.product.id, -1)}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 8px' }}
                        onClick={() => updateQuantity(item.product.id, 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo Financeiro e Finalizacao */}
        <div
          style={{
            paddingTop: 16,
            borderTop: '1px solid var(--border-subtle)',
            marginTop: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total da Venda</span>
            <span
              style={{
                fontSize: '1.6rem',
                fontWeight: 700,
                color: 'var(--text-main)',
              }}
            >
              R$ {totalAmount.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px' }}
            disabled={cart.length === 0 || checkoutLoading}
            onClick={handleCheckout}
          >
            <CheckCircle size={18} />
            <span>{checkoutLoading ? 'Processando...' : 'Finalizar Venda'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
