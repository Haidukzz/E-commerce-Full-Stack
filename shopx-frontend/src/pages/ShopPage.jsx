import { useState, useEffect, useMemo } from 'react'
import { Search } from 'lucide-react'
import { api } from '../api/client'
import { useCart } from '../context/CartContext'
import { formatBRL, getCategoryEmoji } from '../utils/helpers'
import { PageSpinner, Button, Badge, EmptyState, Modal } from '../components/ui'

export default function ShopPage({ toast }) {
  const [products, setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [catId, setCatId]         = useState(null)
  const [sort, setSort]           = useState('nome')
  const [selected, setSelected]   = useState(null)
  const { addItem, setIsOpen }    = useCart()

  useEffect(() => {
    Promise.all([
      api.get('/produtos', { size: 100, sort: 'nome' }),
      api.get('/categorias'),
    ]).then(([p, c]) => {
      setProducts(p.data.content || [])
      setCategories(c.data || [])
    }).catch(e => toast.error(e.message))
    .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const matchSearch = !search || p.nome.toLowerCase().includes(search.toLowerCase()) || (p.descricao || '').toLowerCase().includes(search.toLowerCase())
      const matchCat = !catId || p.categoriaId === catId
      return matchSearch && matchCat
    })
    if (sort === 'preco-asc')  list = [...list].sort((a,b) => a.preco - b.preco)
    if (sort === 'preco-desc') list = [...list].sort((a,b) => b.preco - a.preco)
    return list
  }, [products, search, catId, sort])

  const handleAdd = (p) => {
    addItem(p)
    toast.success(`${p.nome} adicionado! 🛒`)
  }

  if (loading) return <PageSpinner />

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

      {/* Hero */}
      <div style={{
        marginBottom: 40, padding: '44px 40px',
        background: 'linear-gradient(135deg, rgba(212,168,83,.07) 0%, rgba(56,189,248,.03) 50%, transparent 100%)',
        border: '1px solid var(--border)', borderRadius: 24, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-40%', right: '-5%', width: 360, height: 360, background: 'radial-gradient(circle, rgba(212,168,83,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,5vw,50px)', fontWeight: 900, letterSpacing: '-.03em', lineHeight: 1.1, marginBottom: 10 }}>
          Os melhores produtos,<br /><em style={{ color: 'var(--gold)', fontStyle: 'normal' }}>direto para você</em>
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 16, maxWidth: 400 }}>
          Qualidade e variedade com entrega rápida para todo o Brasil.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produtos..."
            style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)' }} />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ padding: '9px 13px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', color: 'var(--text)', fontSize: 14, cursor: 'pointer', outline: 'none', minWidth: 160 }}>
          <option value="nome">Nome A-Z</option>
          <option value="preco-asc">Menor preço</option>
          <option value="preco-desc">Maior preço</option>
        </select>
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {[{ id: null, nome: 'Todos' }, ...categories].map(c => (
          <button key={c.id ?? 'all'} onClick={() => setCatId(c.id)}
            style={{
              padding: '6px 15px', borderRadius: 100,
              border: `1px solid ${catId === c.id ? 'var(--gold-dim)' : 'var(--border)'}`,
              background: catId === c.id ? 'var(--gold-bg)' : 'var(--s2)',
              color: catId === c.id ? 'var(--gold)' : 'var(--text2)',
              fontSize: 13, cursor: 'pointer', transition: 'all .2s',
              fontFamily: 'var(--font-body)',
            }}>
            {c.id ? `${getCategoryEmoji(c.nome)} ` : ''}{c.nome}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Nenhum produto encontrado" description="Tente ajustar os filtros" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
          {filtered.map(p => <ProductCard key={p.id} product={p} onAdd={handleAdd} onView={setSelected} />)}
        </div>
      )}

      {/* Product modal */}
      {selected && (
        <Modal title={selected.nome} onClose={() => setSelected(null)} size={520}>
          <div style={{ height: 160, background: 'var(--s2)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, marginBottom: 20 }}>
            {getCategoryEmoji(selected.categoria)}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <Badge color="gray">{selected.categoria}</Badge>
            {selected.sku && <Badge color="gray" style={{ fontFamily: 'var(--font-mono)' }}>{selected.sku}</Badge>}
            {selected.estoque === 0 ? <Badge color="red">Esgotado</Badge>
              : selected.estoqueAbaixoMinimo ? <Badge color="amber">Estoque Baixo</Badge>
              : <Badge color="green">Disponível</Badge>}
          </div>
          <p style={{ color: 'var(--text2)', marginBottom: 20, lineHeight: 1.7, fontSize: 14 }}>{selected.descricao || 'Sem descrição disponível.'}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'var(--s2)', borderRadius: 'var(--r)' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>Preço unitário</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 900, color: 'var(--gold)' }}>{formatBRL(selected.preco)}</div>
            </div>
            {selected.estoque > 0 ? (
              <Button onClick={() => { handleAdd(selected); setSelected(null) }}>
                🛒 Adicionar
              </Button>
            ) : <Badge color="red">Esgotado</Badge>}
          </div>
        </Modal>
      )}
    </div>
  )
}

function ProductCard({ product: p, onAdd, onView }) {
  const stockClass = p.estoque === 0 ? 'red' : p.estoqueAbaixoMinimo ? 'amber' : null
  const stockText  = p.estoque === 0 ? 'Esgotado' : p.estoqueAbaixoMinimo ? `⚠️ ${p.estoque} restantes` : `${p.estoque} em estoque`

  return (
    <div onClick={() => onView(p)} style={{
      background: 'var(--s1)', border: '1px solid var(--border)',
      borderRadius: 'var(--r2)', overflow: 'hidden', cursor: 'pointer',
      display: 'flex', flexDirection: 'column',
      transition: 'border-color .25s, transform .25s, box-shadow .25s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold-dim)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,.5)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ height: 170, background: 'linear-gradient(135deg,var(--s2),var(--s3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 58, position: 'relative' }}>
        <span style={{ position: 'absolute', top: 10, left: 10, padding: '3px 9px', background: 'rgba(7,9,15,.8)', border: '1px solid var(--border)', borderRadius: 100, fontSize: 10, color: 'var(--text2)', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase' }}>{p.categoria}</span>
        {getCategoryEmoji(p.categoria)}
      </div>
      <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, lineHeight: 1.3 }}>{p.nome}</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', flex: 1, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.descricao}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>{formatBRL(p.preco)}</div>
          {stockClass && <span style={{ fontSize: 11, color: `var(--${stockClass})`, fontFamily: 'var(--font-mono)' }}>{stockText}</span>}
        </div>
        <Button
          variant={p.estoque > 0 ? 'secondary' : 'ghost'}
          size="sm"
          style={{ width: '100%' }}
          disabled={p.estoque === 0}
          onClick={e => { e.stopPropagation(); onAdd(p) }}
        >
          {p.estoque > 0 ? '+ Adicionar' : 'Esgotado'}
        </Button>
      </div>
    </div>
  )
}
