import { NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, LayoutDashboard, Package, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, isStaff, logout } = useAuth()
  const { totalItems, setIsOpen } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const role = user?.perfis?.find(r => r === 'ROLE_ADMIN')
    ? 'ADMIN' : user?.perfis?.find(r => r === 'ROLE_MANAGER')
    ? 'MANAGER' : 'CLIENTE'

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(7,9,15,.94)', backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      height: 62, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 28px',
    }}>
      {/* Brand */}
      <div onClick={() => navigate('/')} style={{
        fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900,
        color: 'var(--gold)', cursor: 'pointer', letterSpacing: '-.02em',
        textShadow: '0 0 40px rgba(212,168,83,.35)',
      }}>ShopX</div>

      {/* Links */}
      <div style={{ display: 'flex', gap: 4 }}>
        {[
          { to: '/loja', label: 'Loja', icon: '🛍️' },
          ...(user ? [{ to: '/pedidos', label: 'Meus Pedidos', icon: '📦' }] : []),
          ...(isStaff ? [{ to: '/admin', label: 'Admin', icon: '⚙️' }] : []),
        ].map(({ to, label, icon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            padding: '7px 13px', borderRadius: 'var(--r)',
            fontSize: 13, fontWeight: 500, transition: 'all .2s',
            color: isActive ? 'var(--gold)' : 'var(--text2)',
            background: isActive ? 'var(--gold-bg)' : 'transparent',
            textDecoration: 'none',
          })}>
            {icon} {label}
          </NavLink>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user && (
          <button onClick={() => setIsOpen(true)} style={{
            position: 'relative', width: 38, height: 38,
            background: 'var(--s2)', border: '1px solid var(--border)',
            borderRadius: 'var(--r)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text2)', transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold-dim)'; e.currentTarget.style.color = 'var(--gold)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}
          >
            <ShoppingCart size={16} />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: 'var(--gold)', color: '#000',
                fontSize: 10, fontWeight: 700, minWidth: 18, height: 18,
                borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
              }}>{totalItems}</span>
            )}
          </button>
        )}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 11px 5px 6px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', cursor: 'default' }}>
            <div style={{
              width: 27, height: 27, borderRadius: 7,
              background: 'linear-gradient(135deg,var(--gold-dim),var(--gold))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#000',
            }}>{(user.nome || user.email || 'U')[0].toUpperCase()}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{user.nome || user.email}</div>
              <div style={{ fontSize: 10, color: 'var(--gold)', fontFamily: 'var(--font-mono)', letterSpacing: '.05em' }}>{role}</div>
            </div>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '2px 4px', marginLeft: 4, display: 'flex' }}
              title="Sair"
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <NavLink to="/login" style={{
            padding: '7px 16px', background: 'var(--gold-bg)',
            border: '1px solid var(--gold-dim)', borderRadius: 'var(--r)',
            color: 'var(--gold)', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', transition: 'all .2s',
          }}>Entrar</NavLink>
        )}
      </div>
    </nav>
  )
}
