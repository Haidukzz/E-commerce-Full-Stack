import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { api } from '../api/client'
import { formatBRL, formatDate, STATUS_CONFIG } from '../utils/helpers'
import { PageSpinner, Button, Badge, EmptyState, Modal } from '../components/ui'

export default function OrdersPage({ toast }) {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [payModal, setPayModal] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/pedidos/meus', { size: 20 })
      .then(r => setOrders(r.data.content || []))
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const cancelOrder = async (id) => {
    if (!confirm('Cancelar este pedido?')) return
    try {
      await api.post(`/pedidos/${id}/cancelar`)
      toast.info('Pedido cancelado')
      load()
    } catch (e) { toast.error(e.response?.data?.mensagem || e.message) }
  }

  if (loading) return <PageSpinner />

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, letterSpacing: '-.02em', marginBottom: 4 }}>Meus Pedidos</h1>
      <p style={{ color: 'var(--text2)', marginBottom: 28 }}>Acompanhe o status das suas compras.</p>

      {orders.length === 0 ? (
        <EmptyState icon="📭" title="Nenhum pedido ainda" description="Faça sua primeira compra na loja!"
          action={<Button onClick={() => window.location.href = '/loja'}>Ir para a Loja</Button>} />
      ) : orders.map(o => {
        const s = STATUS_CONFIG[o.status] || { label: o.status, color: 'gray' }
        const isExpanded = expanded === o.id
        return (
          <div key={o.id} style={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', marginBottom: 14, overflow: 'hidden', transition: 'border-color .2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <div onClick={() => setExpanded(isExpanded ? null : o.id)}
              style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {isExpanded ? <ChevronDown size={16} color="var(--text2)" /> : <ChevronRight size={16} color="var(--text2)" />}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text2)' }}>#{o.id}</span>
                    <Badge color={s.color} dot={s.dot || s.color}>{s.label}</Badge>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>{o.itens?.length || 0} item(ns) · {formatDate(o.dataPedido)}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--gold)' }}>{formatBRL(o.total)}</div>
                {o.desconto > 0 && <div style={{ fontSize: 12, color: 'var(--green)' }}>−{formatBRL(o.desconto)}</div>}
              </div>
            </div>

            {isExpanded && (
              <div style={{ padding: '0 20px 18px', borderTop: '1px solid var(--border)' }}>
                <table style={{ width: '100%', marginTop: 14 }}>
                  <thead>
                    <tr>
                      {['Produto','Qtd','Unitário','Total'].map(h => (
                        <th key={h} style={{ textAlign: 'left', paddingBottom: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(o.itens || []).map(i => (
                      <tr key={i.id} style={{ borderBottom: '1px solid rgba(26,32,53,.5)' }}>
                        <td style={{ padding: '10px 0', fontSize: 13 }}>{i.produto}</td>
                        <td style={{ padding: '10px 0', fontSize: 13, color: 'var(--text2)' }}>{i.quantidade}</td>
                        <td style={{ padding: '10px 0', fontSize: 13, color: 'var(--text2)' }}>{formatBRL(i.precoUnitario)}</td>
                        <td style={{ padding: '10px 0', fontSize: 13, textAlign: 'right' }}>{formatBRL(i.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(o.status === 'PENDENTE' || o.status === 'AGUARDANDO_PAGAMENTO') && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <Button variant="secondary" size="sm" onClick={() => setPayModal(o)}>💳 Processar Pagamento</Button>
                    <Button variant="danger" size="sm" onClick={() => cancelOrder(o.id)}>Cancelar Pedido</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {payModal && <PayModal order={payModal} onClose={() => setPayModal(null)} onSuccess={() => { setPayModal(null); load() }} toast={toast} />}
    </div>
  )
}

function PayModal({ order, onClose, onSuccess, toast }) {
  const [meio, setMeio]   = useState('PIX')
  const [txId, setTxId]   = useState(`TXN-${Date.now()}`)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    try {
      setLoading(true)
      await api.post(`/pagamentos/pedido/${order.id}`, { meioPagamento: meio, transacaoId: txId })
      toast.success('Pagamento aprovado! ✅')
      onSuccess()
    } catch (e) {
      toast.error(e.response?.data?.mensagem || e.message)
    } finally { setLoading(false) }
  }

  return (
    <Modal title="Processar Pagamento" size={440} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={submit} disabled={loading}>Confirmar Pagamento</Button></>}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>💳</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 900, color: 'var(--gold)' }}>{formatBRL(order.total)}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>Pedido #{order.id}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Meio de Pagamento</label>
          <select value={meio} onChange={e => setMeio(e.target.value)}
            style={{ width: '100%', padding: '9px 13px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', color: 'var(--text)', fontSize: 14, outline: 'none' }}>
            <option value="PIX">PIX</option>
            <option value="CARTAO_CREDITO">Cartão de Crédito</option>
            <option value="BOLETO">Boleto Bancário</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text2)', display: 'block', marginBottom: 6 }}>ID da Transação</label>
          <input value={txId} onChange={e => setTxId(e.target.value)}
            style={{ width: '100%', padding: '9px 13px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)' }} />
        </div>
        <div style={{ padding: 12, background: 'var(--s2)', borderRadius: 'var(--r)', fontSize: 12, color: 'var(--text2)' }}>
          💡 Use ID terminando em <strong style={{ color: 'var(--red)' }}>FAIL</strong> para simular recusa
        </div>
      </div>
    </Modal>
  )
}
