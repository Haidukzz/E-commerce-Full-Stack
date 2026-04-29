import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Plus, Minus, Trash2, Tag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import { formatBRL, getCategoryEmoji } from '../utils/helpers'
import { Button, Spinner } from './ui'

const KNOWN_COUPONS = {
  PROMO10: { tipo: 'PERCENTUAL', valor: 10 },
  DESC50:  { tipo: 'VALOR_FIXO', valor: 50  },
}

export default function CartDrawer({ toast }) {
  const { items, coupon, setCoupon, isOpen, setIsOpen, changeQty, removeItem, clearCart, subtotal, discount, total } = useCart()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [couponInput, setCouponInput] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    if (KNOWN_COUPONS[code]) {
      setCoupon({ ...KNOWN_COUPONS[code], codigo: code })
      toast.success(`Cupom ${code} aplicado! 🎉`)
    } else {
      toast.error('Cupom inválido ou expirado')
    }
  }

  const checkout = async () => {
    if (!isLoggedIn) {
      setIsOpen(false)
      navigate('/login')
      toast.warn('Faça login para finalizar o pedido')
      return
    }
    try {
      setLoading(true)
      const body = {
        itens: items.map(i => ({ produtoId: i.id, quantidade: i.qty })),
        codigoCupom: coupon?.codigo || undefined,
      }
      const { data } = await api.post('/pedidos', body)
      clearCart()
      setIsOpen(false)
      toast.success(`Pedido #${data.id} criado com sucesso! 🎉`)
      navigate('/pedidos')
    } catch (e) {
      toast.error(e.response?.data?.mensagem || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div onClick={() => setIsOpen(false)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 200,
      }} />

      {/* Drawer */}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 400, maxWidth: '95vw',
        background: 'var(--s1)', borderLeft: '1px solid var(--border2)',
        zIndex: 201, display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px rgba(0,0,0,.6)',
        animation: 'slideRight .3s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
            Carrinho {items.length > 0 && <span style={{ color: 'var(--text2)', fontSize: 16 }}>({items.length})</span>}
          </span>
          <button onClick={() => setIsOpen(false)} style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--s2)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text2)', paddingTop: 60 }}>
              <div style={{ fontSize: 52, opacity: .3 }}>🛒</div>
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>Carrinho vazio</div>
              <div style={{ fontSize: 13 }}>Adicione produtos da loja</div>
            </div>
          ) : items.map(item => (
            <div key={item.id} style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              padding: 12, background: 'var(--s2)',
              border: '1px solid var(--border)', borderRadius: 'var(--r)',
            }}>
              <div style={{ width: 46, height: 46, background: 'var(--s3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {getCategoryEmoji(item.categoria)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nome}</div>
                <div style={{ fontSize: 12, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>{formatBRL(item.preco)} × {item.qty} = {formatBRL(item.preco * item.qty)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <QtyBtn onClick={() => changeQty(item.id, -1)}><Minus size={12} /></QtyBtn>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                  <QtyBtn onClick={() => changeQty(item.id, +1)}><Plus size={12} /></QtyBtn>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            {/* Coupon */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Tag size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input value={couponInput} onChange={e => setCouponInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                  placeholder="Código do cupom"
                  style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)' }} />
              </div>
              {coupon ? (
                <Button variant="secondary" size="sm" onClick={() => { setCoupon(null); setCouponInput('') }}>✕</Button>
              ) : (
                <Button variant="secondary" size="sm" onClick={applyCoupon}>Aplicar</Button>
              )}
            </div>

            {/* Totals */}
            <div style={{ marginBottom: 16 }}>
              {[
                { label: 'Subtotal', value: formatBRL(subtotal) },
                ...(discount > 0 ? [{ label: `Desconto (${coupon?.codigo})`, value: `−${formatBRL(discount)}`, green: true }] : []),
              ].map(({ label, value, green }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 14, color: green ? 'var(--green)' : 'var(--text2)' }}>
                  <span>{label}</span><span>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 12, fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: 'var(--gold)' }}>
                <span>Total</span><span>{formatBRL(total)}</span>
              </div>
            </div>

            <Button variant="primary" style={{ width: '100%', fontSize: 15, padding: '12px' }} onClick={checkout} disabled={loading}>
              {loading ? <Spinner size={18} /> : `Finalizar Pedido · ${formatBRL(total)}`}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

function QtyBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--s3)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold-dim)'; e.currentTarget.style.color = 'var(--gold)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}>
      {children}
    </button>
  )
}
