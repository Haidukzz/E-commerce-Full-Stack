import { useState, useEffect } from 'react'
import { LayoutDashboard, Package, Tag, ShoppingCart, Users, ChevronRight } from 'lucide-react'
import { api } from '../api/client'
import client from '../api/client'
import { formatBRL, formatDate, getCategoryEmoji, STATUS_CONFIG, NEXT_STATUS } from '../utils/helpers'
import { PageSpinner, Button, Badge, EmptyState, Modal, KpiCard, Card, Table, Tr, Td, Pagination, Input, Select, Textarea } from '../components/ui'

const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'products',  label: 'Produtos',   icon: Package },
  { id: 'categories',label: 'Categorias', icon: Tag },
  { id: 'orders',    label: 'Pedidos',    icon: ShoppingCart },
  { id: 'users',     label: 'Usuários',   icon: Users },
]

export default function AdminPage({ toast }) {
  const [section, setSection] = useState('dashboard')

  const renderSection = () => {
    const props = { toast }
    if (section === 'dashboard')  return <Dashboard  {...props} />
    if (section === 'products')   return <Products   {...props} />
    if (section === 'categories') return <Categories {...props} />
    if (section === 'orders')     return <Orders     {...props} />
    if (section === 'users')      return <UsersSection {...props} />
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '216px 1fr', minHeight: 'calc(100vh - 62px)' }}>
      {/* Sidebar */}
      <aside style={{ background: 'var(--s1)', borderRight: '1px solid var(--border)', padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setSection(id)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px',
            borderRadius: 'var(--r)', cursor: 'pointer', border: 'none',
            background: section === id ? 'var(--gold-bg)' : 'none',
            color: section === id ? 'var(--gold)' : 'var(--text2)',
            fontSize: 13, fontWeight: 500, transition: 'all .2s',
            width: '100%', textAlign: 'left', fontFamily: 'var(--font-body)',
          }}
            onMouseEnter={e => { if (section !== id) { e.currentTarget.style.background = 'var(--s2)'; e.currentTarget.style.color = 'var(--text)' } }}
            onMouseLeave={e => { if (section !== id) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text2)' } }}
          >
            <Icon size={15} />{label}
          </button>
        ))}
      </aside>

      {/* Content */}
      <main style={{ padding: 32, overflowY: 'auto' }} className="animate-fadeIn">
        {renderSection()}
      </main>
    </div>
  )
}

/* ── Dashboard ────────────────────────────────── */
function Dashboard({ toast }) {
  const [data, setData] = useState(null)
  const [lowStock, setLowStock] = useState([])

  useEffect(() => {
    Promise.all([api.get('/relatorios/dashboard'), api.get('/relatorios/estoque-baixo')])
      .then(([d, ls]) => { setData(d.data); setLowStock(ls.data || []) })
      .catch(e => toast.error(e.message))
  }, [])

  if (!data) return <PageSpinner />

  return (
    <>
      <SectionHeader title="Dashboard" sub="Visão geral da plataforma" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
        <KpiCard label="Receita Total" value={formatBRL(data.receitaTotal || 0)} sub="Pedidos entregues" icon="💰" accent="gold" />
        <KpiCard label="Total Pedidos" value={data.totalPedidos || 0} sub={`${data.pedidosPagos || 0} pagos`} icon="📦" accent="green" />
        <KpiCard label="Produtos" value={data.totalProdutos || 0} sub={`${data.produtosEstoqueBaixo || 0} estoque baixo`} icon="🛍️" accent="cyan" />
        <KpiCard label="Usuários" value={data.totalUsuarios || 0} sub="Contas ativas" icon="👥" accent="amber" />
        <KpiCard label="Pendentes" value={data.pedidosPendentes || 0} sub="Aguardando" icon="⏳" accent="amber" />
        <KpiCard label="Cancelados" value={data.pedidosCancelados || 0} sub="Total" icon="❌" accent="red" />
      </div>
      {lowStock.length > 0 && (
        <Card>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--amber)' }}>⚠️ Estoque Baixo</span>
          </div>
          {lowStock.slice(0, 6).map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 22px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>{getCategoryEmoji(p.categoria)}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.nome}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{p.categoria}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--amber)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{p.estoque} un.</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>Mín: {p.estoqueMinimo}</div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </>
  )
}

/* ── Products ─────────────────────────────────── */
function Products({ toast }) {
  const [products, setProducts] = useState([])
  const [total, setTotal]       = useState(0)
  const [pages, setPages]       = useState(0)
  const [page, setPage]         = useState(0)
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null) // null | 'create' | product
  const [stockModal, setStockModal] = useState(null)
  const [categories, setCategories] = useState([])

  const load = (p = page) => {
    setLoading(true)
    Promise.all([api.get('/produtos', { size: 15, page: p, sort: 'nome' }), api.get('/categorias')])
      .then(([pr, cat]) => {
        setProducts(pr.data.content || [])
        setTotal(pr.data.totalElements || 0)
        setPages(pr.data.totalPages || 0)
        setCategories(cat.data || [])
      })
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const deleteProduct = async (id) => {
    if (!confirm('Inativar este produto?')) return
    try { await api.delete(`/produtos/${id}`); toast.info('Produto inativado'); load() }
    catch (e) { toast.error(e.response?.data?.mensagem || e.message) }
  }

  return (
    <>
      <SectionHeader title="Produtos" sub={`${total} produtos cadastrados`}>
        <Button onClick={() => setModal('create')}>+ Novo Produto</Button>
      </SectionHeader>
      {loading ? <PageSpinner /> : (
        <Card>
          <Table headers={['Produto','Categoria','Preço','Estoque','Status','Ações']}>
            {products.map(p => (
              <Tr key={p.id}>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{getCategoryEmoji(p.categoria)}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.nome}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>{p.sku || '—'}</div>
                    </div>
                  </div>
                </Td>
                <Td><Badge color="gray">{p.categoria}</Badge></Td>
                <Td><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>{formatBRL(p.preco)}</span></Td>
                <Td><span style={{ fontFamily: 'var(--font-mono)', color: p.estoque === 0 ? 'var(--red)' : p.estoqueAbaixoMinimo ? 'var(--amber)' : 'var(--text)' }}>{p.estoque} un.</span></Td>
                <Td>{p.ativo ? <Badge color="green">Ativo</Badge> : <Badge color="red">Inativo</Badge>}</Td>
                <Td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <ActionBtn onClick={() => setModal(p)} title="Editar">✏️</ActionBtn>
                    <ActionBtn onClick={() => setStockModal(p)} title="Estoque">📦</ActionBtn>
                    <ActionBtn danger onClick={() => deleteProduct(p.id)} title="Inativar">🗑️</ActionBtn>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
          <Pagination page={page} totalPages={pages} onChange={p => { setPage(p); load(p) }} />
        </Card>
      )}
      {modal !== null && <ProductModal product={modal === 'create' ? null : modal} categories={categories} onClose={() => setModal(null)} onSuccess={() => { setModal(null); load() }} toast={toast} />}
      {stockModal && <StockModal product={stockModal} onClose={() => setStockModal(null)} onSuccess={() => { setStockModal(null); load() }} toast={toast} />}
    </>
  )
}

function ProductModal({ product, categories, onClose, onSuccess, toast }) {
  const [form, setForm] = useState({
    nome: product?.nome || '', descricao: product?.descricao || '',
    sku: product?.sku || '', categoriaId: product?.categoriaId || categories[0]?.id || '',
    preco: product?.preco || '', estoque: product?.estoque ?? '',
    estoqueMinimo: product?.estoqueMinimo ?? 10,
  })
  const [loading, setLoading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    if (!form.nome || !form.preco || form.estoque === '') return toast.warn('Preencha os campos obrigatórios')
    try {
      setLoading(true)
      const body = { ...form, categoriaId: parseInt(form.categoriaId), preco: parseFloat(form.preco), estoque: parseInt(form.estoque), estoqueMinimo: parseInt(form.estoqueMinimo) }
      if (product) await api.put(`/produtos/${product.id}`, body)
      else          await api.post('/produtos', body)
      toast.success(product ? 'Produto atualizado!' : 'Produto criado!')
      onSuccess()
    } catch (e) { toast.error(e.response?.data?.mensagem || e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={product ? 'Editar Produto' : 'Novo Produto'} size={620} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={submit} disabled={loading}>{product ? 'Salvar' : 'Criar'}</Button></>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ gridColumn: '1/-1' }}><Input label="Nome *" value={form.nome} onChange={set('nome')} placeholder="Nome do produto" /></div>
        <div style={{ gridColumn: '1/-1' }}><Textarea label="Descrição" value={form.descricao} onChange={set('descricao')} placeholder="Descrição detalhada" /></div>
        <Input label="SKU" value={form.sku} onChange={set('sku')} placeholder="PROD-001" />
        <Select label="Categoria *" value={form.categoriaId} onChange={set('categoriaId')}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </Select>
        <Input label="Preço (R$) *" type="number" step="0.01" min="0" value={form.preco} onChange={set('preco')} />
        <Input label="Estoque *" type="number" min="0" value={form.estoque} onChange={set('estoque')} />
        <Input label="Estoque Mínimo" type="number" min="0" value={form.estoqueMinimo} onChange={set('estoqueMinimo')} />
      </div>
    </Modal>
  )
}

function StockModal({ product, onClose, onSuccess, toast }) {
  const [delta, setDelta] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async () => {
    const qty = parseInt(delta)
    if (isNaN(qty)) return toast.warn('Informe um valor válido')
    try {
      setLoading(true)
      await client.patch(`/produtos/${product.id}/estoque`, null, { params: { quantidade: qty } })
      toast.success('Estoque atualizado!')
      onSuccess()
    } catch (e) { toast.error(e.response?.data?.mensagem || e.message) }
    finally { setLoading(false) }
  }
  return (
    <Modal title="Ajustar Estoque" size={380} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={submit} disabled={loading}>Confirmar</Button></>}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>{product.nome}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900 }}>{product.estoque} <span style={{ fontSize: 16, color: 'var(--text2)' }}>em estoque</span></div>
      </div>
      <Input label="Ajuste (+entrada / -saída)" type="number" value={delta} onChange={e => setDelta(e.target.value)} placeholder="Ex: +50 ou -10" />
    </Modal>
  )
}

/* ── Categories ───────────────────────────────── */
function Categories({ toast }) {
  const [cats, setCats]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/categorias').then(r => setCats(r.data || [])).catch(e => toast.error(e.message)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const del = async (id) => {
    if (!confirm('Inativar?')) return
    try { await api.delete(`/categorias/${id}`); toast.info('Inativada'); load() }
    catch (e) { toast.error(e.response?.data?.mensagem || e.message) }
  }

  return (
    <>
      <SectionHeader title="Categorias" sub={`${cats.length} categorias`}>
        <Button onClick={() => setModal('create')}>+ Nova Categoria</Button>
      </SectionHeader>
      {loading ? <PageSpinner /> : (
        <Card>
          <Table headers={['Nome','Descrição','Status','Ações']}>
            {cats.map(c => (
              <Tr key={c.id}>
                <Td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>{getCategoryEmoji(c.nome)}</span><strong>{c.nome}</strong></div></Td>
                <Td style={{ color: 'var(--text2)' }}>{c.descricao || '—'}</Td>
                <Td>{c.ativa ? <Badge color="green">Ativa</Badge> : <Badge color="red">Inativa</Badge>}</Td>
                <Td><div style={{ display: 'flex', gap: 6 }}>
                  <ActionBtn onClick={() => setModal(c)}>✏️</ActionBtn>
                  <ActionBtn danger onClick={() => del(c.id)}>🗑️</ActionBtn>
                </div></Td>
              </Tr>
            ))}
          </Table>
        </Card>
      )}
      {modal !== null && <CatModal cat={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSuccess={() => { setModal(null); load() }} toast={toast} />}
    </>
  )
}

function CatModal({ cat, onClose, onSuccess, toast }) {
  const [form, setForm] = useState({ nome: cat?.nome || '', descricao: cat?.descricao || '' })
  const [loading, setLoading] = useState(false)
  const submit = async () => {
    if (!form.nome) return toast.warn('Nome obrigatório')
    try {
      setLoading(true)
      if (cat) await api.put(`/categorias/${cat.id}`, form)
      else      await api.post('/categorias', form)
      toast.success(cat ? 'Atualizada!' : 'Criada!')
      onSuccess()
    } catch (e) { toast.error(e.response?.data?.mensagem || e.message) }
    finally { setLoading(false) }
  }
  return (
    <Modal title={cat ? 'Editar Categoria' : 'Nova Categoria'} size={400} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={submit} disabled={loading}>{cat ? 'Salvar' : 'Criar'}</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input label="Nome *" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Eletrônicos" />
        <Textarea label="Descrição" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descrição da categoria" />
      </div>
    </Modal>
  )
}

/* ── Orders ───────────────────────────────────── */
function Orders({ toast }) {
  const [orders, setOrders] = useState([])
  const [total, setTotal]   = useState(0)
  const [pages, setPages]   = useState(0)
  const [page, setPage]     = useState(0)
  const [loading, setLoading] = useState(true)

  const load = (p = page) => {
    setLoading(true)
    api.get('/pedidos', { size: 15, page: p })
      .then(r => { setOrders(r.data.content || []); setTotal(r.data.totalElements || 0); setPages(r.data.totalPages || 0) })
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [page])

  const advance = async (id, status) => {
    try {
      await client.patch(`/pedidos/${id}/status`, null, { params: { status } })
      toast.success(`Status: ${STATUS_CONFIG[status]?.label || status}`)
      load()
    } catch (e) { toast.error(e.response?.data?.mensagem || e.message) }
  }

  const cancel = async (id) => {
    if (!confirm('Cancelar?')) return
    try { await api.post(`/pedidos/${id}/cancelar`); toast.info('Cancelado'); load() }
    catch (e) { toast.error(e.response?.data?.mensagem || e.message) }
  }

  return (
    <>
      <SectionHeader title="Pedidos" sub={`${total} pedidos`} />
      {loading ? <PageSpinner /> : (
        <Card>
          <Table headers={['#','Cliente','Data','Total','Status','Ações']}>
            {orders.map(o => {
              const s = STATUS_CONFIG[o.status] || { label: o.status, color: 'gray' }
              const nextSt = NEXT_STATUS[o.status]
              return (
                <Tr key={o.id}>
                  <Td><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text2)' }}>#{o.id}</span></Td>
                  <Td style={{ fontWeight: 500 }}>{o.usuario}</Td>
                  <Td style={{ color: 'var(--text2)', fontSize: 12 }}>{formatDate(o.dataPedido)}</Td>
                  <Td><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>{formatBRL(o.total)}</span></Td>
                  <Td><Badge color={s.color} dot={s.dot}>{s.label}</Badge></Td>
                  <Td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {nextSt && <ActionBtn onClick={() => advance(o.id, nextSt)} title={`Avançar para ${STATUS_CONFIG[nextSt]?.label}`}>▶️</ActionBtn>}
                      {['PENDENTE','AGUARDANDO_PAGAMENTO','PAGO','EM_SEPARACAO'].includes(o.status) && <ActionBtn danger onClick={() => cancel(o.id)}>❌</ActionBtn>}
                    </div>
                  </Td>
                </Tr>
              )
            })}
          </Table>
          <Pagination page={page} totalPages={pages} onChange={p => { setPage(p); load(p) }} />
        </Card>
      )}
    </>
  )
}

/* ── Users ────────────────────────────────────── */
function UsersSection({ toast }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/usuarios', { size: 30 }).then(r => setUsers(r.data.content || [])).catch(e => toast.error(e.message)).finally(() => setLoading(false))
  }, [])

  const roleColor = r => r === 'ROLE_ADMIN' ? 'red' : r === 'ROLE_MANAGER' ? 'amber' : 'cyan'

  return (
    <>
      <SectionHeader title="Usuários" sub={`${users.length} usuários`} />
      {loading ? <PageSpinner /> : (
        <Card>
          <Table headers={['Usuário','Email','Perfis','Status','Cadastro']}>
            {users.map(u => (
              <Tr key={u.id}>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,var(--gold-dim),var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#000', flexShrink: 0 }}>{u.nome[0]}</div>
                    <strong style={{ fontSize: 14 }}>{u.nome}</strong>
                  </div>
                </Td>
                <Td style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{u.email}</Td>
                <Td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(u.perfis || []).map(r => <Badge key={r} color={roleColor(r)}>{r.replace('ROLE_', '')}</Badge>)}
                  </div>
                </Td>
                <Td>{u.ativo ? <Badge color="green">Ativo</Badge> : <Badge color="red">Inativo</Badge>}</Td>
                <Td style={{ color: 'var(--text2)', fontSize: 12 }}>{formatDate(u.dataCriacao)}</Td>
              </Tr>
            ))}
          </Table>
        </Card>
      )}
    </>
  )
}

/* ── Helpers ──────────────────────────────────── */
function SectionHeader({ title, sub, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 900, letterSpacing: '-.02em', marginBottom: 2 }}>{title}</h1>
        {sub && <p style={{ color: 'var(--text2)', fontSize: 14 }}>{sub}</p>}
      </div>
      {children}
    </div>
  )
}

function ActionBtn({ children, onClick, title, danger }) {
  return (
    <button onClick={onClick} title={title} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--s2)', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, transition: 'all .15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = danger ? 'rgba(248,113,113,.4)' : 'var(--gold-dim)'; e.currentTarget.style.color = danger ? 'var(--red)' : 'var(--gold)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}
    >{children}</button>
  )
}
