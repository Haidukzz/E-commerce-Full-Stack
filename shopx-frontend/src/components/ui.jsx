import { useEffect } from 'react'

/* ── Spinner ──────────────────────────────────── */
export function Spinner({ size = 36 }) {
  return (
    <div style={{
      width: size, height: size,
      border: '3px solid var(--border2)',
      borderTopColor: 'var(--gold)',
      borderRadius: '50%',
      animation: 'spin .8s linear infinite',
      flexShrink: 0,
    }} />
  )
}

export function PageSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 80 }}>
      <Spinner size={44} />
    </div>
  )
}

/* ── Button ───────────────────────────────────── */
const btnStyles = {
  base: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: '9px 18px', borderRadius: 'var(--r)',
    fontWeight: 600, fontSize: 13, cursor: 'pointer', border: 'none',
    transition: 'all .2s', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)',
    lineHeight: 1,
  },
  primary: { background: 'linear-gradient(135deg,#b8842a,var(--gold))', color: '#000' },
  secondary: { background: 'var(--s2)', color: 'var(--text)', border: '1px solid var(--border2)' },
  ghost: { background: 'none', color: 'var(--text2)' },
  danger: { background: 'rgba(248,113,113,.1)', color: 'var(--red)', border: '1px solid rgba(248,113,113,.25)' },
  sm: { padding: '6px 13px', fontSize: 12 },
  lg: { padding: '12px 24px', fontSize: 15 },
}

export function Button({ variant = 'primary', size, className, style, disabled, children, ...props }) {
  const s = {
    ...btnStyles.base,
    ...btnStyles[variant],
    ...(size && btnStyles[size]),
    ...(disabled && { opacity: .45, cursor: 'not-allowed', pointerEvents: 'none' }),
    ...style,
  }
  return <button style={s} disabled={disabled} {...props}>{children}</button>
}

/* ── Badge ────────────────────────────────────── */
const badgeColors = {
  gold:  { bg: 'rgba(212,168,83,.12)',  color: 'var(--gold)',  border: 'rgba(212,168,83,.3)'  },
  green: { bg: 'rgba(52,211,153,.1)',   color: 'var(--green)', border: 'rgba(52,211,153,.3)'  },
  red:   { bg: 'rgba(248,113,113,.1)',  color: 'var(--red)',   border: 'rgba(248,113,113,.3)' },
  cyan:  { bg: 'rgba(56,189,248,.1)',   color: 'var(--cyan)',  border: 'rgba(56,189,248,.3)'  },
  amber: { bg: 'rgba(251,191,36,.1)',   color: 'var(--amber)', border: 'rgba(251,191,36,.3)'  },
  gray:  { bg: 'var(--s2)',             color: 'var(--text2)', border: 'var(--border)'        },
}

export function Badge({ color = 'gray', dot, children, style }) {
  const c = badgeColors[color] || badgeColors.gray
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 100,
      fontSize: 11, fontWeight: 600, letterSpacing: '.04em',
      textTransform: 'uppercase',
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
      ...style
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />}
      {children}
    </span>
  )
}

/* ── Input ────────────────────────────────────── */
export function Input({ label, error, style, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text2)' }}>{label}</label>}
      <input style={{
        padding: '9px 13px', background: 'var(--s2)',
        border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
        borderRadius: 'var(--r)', color: 'var(--text)',
        fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none',
        transition: 'border-color .2s', width: '100%', ...style
      }} {...props} />
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

export function Select({ label, children, style, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text2)' }}>{label}</label>}
      <select style={{
        padding: '9px 13px', background: 'var(--s2)',
        border: '1px solid var(--border)', borderRadius: 'var(--r)',
        color: 'var(--text)', fontSize: 14, outline: 'none',
        cursor: 'pointer', width: '100%', appearance: 'none', ...style
      }} {...props}>{children}</select>
    </div>
  )
}

export function Textarea({ label, style, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text2)' }}>{label}</label>}
      <textarea style={{
        padding: '9px 13px', background: 'var(--s2)',
        border: '1px solid var(--border)', borderRadius: 'var(--r)',
        color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-body)',
        outline: 'none', resize: 'vertical', minHeight: 80, width: '100%', ...style
      }} {...props} />
    </div>
  )
}

/* ── Card ─────────────────────────────────────── */
export function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--s1)', border: '1px solid var(--border)',
      borderRadius: 'var(--r2)', overflow: 'hidden', ...style
    }}>
      {children}
    </div>
  )
}

/* ── Modal ────────────────────────────────────── */
export function Modal({ title, size = 500, onClose, footer, children }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose?.()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
        backdropFilter: 'blur(6px)', zIndex: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        animation: 'fadeIn .2s ease',
      }}>
      <div className="animate-scale" style={{
        background: 'var(--s1)', border: '1px solid var(--border2)',
        borderRadius: 'var(--r3)', width: '100%', maxWidth: size,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,.8)',
      }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>{title}</span>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--s2)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transition: 'all .2s' }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
        {footer && <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>{footer}</div>}
      </div>
    </div>
  )
}

/* ── Empty State ──────────────────────────────── */
export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text2)' }}>
      <div style={{ fontSize: 48, marginBottom: 16, opacity: .4 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{title}</div>
      {description && <div style={{ fontSize: 14 }}>{description}</div>}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  )
}

/* ── Table ────────────────────────────────────── */
export function Table({ headers, children }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                textAlign: 'left', padding: '11px 16px',
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '.06em', color: 'var(--text2)',
                background: 'var(--s2)', borderBottom: '1px solid var(--border)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Tr({ children }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--s2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {children}
    </tr>
  )
}

export function Td({ children, style }) {
  return <td style={{ padding: '13px 16px', fontSize: 13, verticalAlign: 'middle', ...style }}>{children}</td>
}

/* ── Pagination ───────────────────────────────── */
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '20px 0 4px' }}>
      <PgBtn disabled={page === 0} onClick={() => onChange(page - 1)}>←</PgBtn>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
        <PgBtn key={i} active={i === page} onClick={() => onChange(i)}>{i + 1}</PgBtn>
      ))}
      <PgBtn disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>→</PgBtn>
    </div>
  )
}

function PgBtn({ active, disabled, children, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 34, height: 34, borderRadius: 8,
      border: `1px solid ${active ? 'var(--gold-dim)' : 'var(--border)'}`,
      background: active ? 'var(--gold-bg)' : 'var(--s2)',
      color: active ? 'var(--gold)' : 'var(--text2)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .4 : 1, fontSize: 13, transition: 'all .15s',
    }}>{children}</button>
  )
}

/* ── KPI Card ─────────────────────────────────── */
export function KpiCard({ label, value, sub, icon, accent = 'gold' }) {
  const accents = { gold: 'var(--gold)', green: 'var(--green)', cyan: 'var(--cyan)', amber: 'var(--amber)', red: 'var(--red)' }
  return (
    <div style={{
      padding: 20, background: 'var(--s1)',
      border: '1px solid var(--border)', borderRadius: 'var(--r2)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ height: 2, background: accents[accent] || accents.gold, marginBottom: 16, borderRadius: 1 }} />
      <div style={{ position: 'absolute', right: 16, top: 28, fontSize: 32, opacity: .12 }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, letterSpacing: '-.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}
