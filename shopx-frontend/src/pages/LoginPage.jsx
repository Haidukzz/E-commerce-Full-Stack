import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Spinner } from '../components/ui'

export default function LoginPage({ toast }) {
  const [tab, setTab]       = useState('login')
  const [form, setForm]     = useState({ nome: '', email: '', senha: '' })
  const [errors, setErrors] = useState({})
  const { login, register, loading } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (tab === 'register' && !form.nome.trim()) e.nome = 'Nome obrigatório'
    if (!form.email.trim()) e.email = 'Email obrigatório'
    if (!form.senha || form.senha.length < 6) e.senha = 'Mínimo 6 caracteres'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      if (tab === 'login') {
        const data = await login(form.email, form.senha)
        toast.success(`Bem-vindo, ${data.nome}! 👋`)
        navigate(data.perfis?.some(r => ['ROLE_ADMIN','ROLE_MANAGER'].includes(r)) ? '/admin' : '/loja')
      } else {
        await register(form.nome, form.email, form.senha)
        toast.success('Conta criada com sucesso! 🎉')
        navigate('/loja')
      }
    } catch (err) {
      toast.error(err.response?.data?.mensagem || err.message)
    }
  }

  const DEMO = [
    { label: 'Admin', email: 'admin@ecommerce.com', senha: 'Admin@123' },
    { label: 'Gerente', email: 'gerente@ecommerce.com', senha: 'Manager@123' },
    { label: 'Cliente', email: 'joao.silva@email.com', senha: 'Cliente@123' },
  ]

  return (
    <div style={{
      minHeight: 'calc(100vh - 62px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      background: 'radial-gradient(ellipse at 30% 50%, rgba(212,168,83,.07) 0%, transparent 60%), var(--bg)',
    }}>
      <div className="animate-scale" style={{
        width: '100%', maxWidth: 420,
        background: 'var(--s1)', border: '1px solid var(--border2)',
        borderRadius: 24, padding: 36,
        boxShadow: '0 32px 80px rgba(0,0,0,.6)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 900, color: 'var(--gold)', letterSpacing: '-.02em', textShadow: '0 0 60px rgba(212,168,83,.4)' }}>ShopX</div>
          <div style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>Plataforma Empresarial de Vendas</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--s2)', borderRadius: 'var(--r)', padding: 4, marginBottom: 24 }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setErrors({}) }} style={{
              flex: 1, padding: '8px', borderRadius: 6, border: 'none',
              background: tab === t ? 'var(--s3)' : 'none',
              color: tab === t ? 'var(--text)' : 'var(--text2)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)', transition: 'all .2s',
            }}>
              {t === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tab === 'register' && (
            <Input label="Nome completo" placeholder="João da Silva" value={form.nome} onChange={set('nome')} error={errors.nome} />
          )}
          <Input label="Email" type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} error={errors.email} />
          <Input label="Senha" type="password" placeholder="••••••••" value={form.senha} onChange={set('senha')} error={errors.senha} />
          <Button type="submit" variant="primary" style={{ width: '100%', marginTop: 4, padding: '12px' }} disabled={loading}>
            {loading ? <Spinner size={18} /> : tab === 'login' ? 'Entrar na Plataforma' : 'Criar Conta'}
          </Button>
        </form>

        {/* Demo credentials */}
        {tab === 'login' && (
          <div style={{ marginTop: 20, padding: 14, background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--r)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 10 }}>Credenciais de demonstração</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {DEMO.map(d => (
                <button key={d.label} onClick={() => setForm({ nome: '', email: d.email, senha: d.senha })}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', background: 'var(--s3)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', transition: 'border-color .2s', fontFamily: 'var(--font-body)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold-dim)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{d.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
