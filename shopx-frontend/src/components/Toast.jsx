const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warn: '⚠️' }
const BORDERS = {
  success: 'rgba(52,211,153,.4)',
  error:   'rgba(248,113,113,.4)',
  info:    'rgba(56,189,248,.4)',
  warn:    'rgba(251,191,36,.4)',
}

export function ToastContainer({ toasts }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {toasts.map(t => <Toast key={t.id} {...t} />)}
    </div>
  )
}

function Toast({ message, type, duration }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '13px 16px',
      background: 'var(--s2)', border: `1px solid ${BORDERS[type] || BORDERS.info}`,
      borderRadius: 'var(--r)', boxShadow: '0 4px 24px rgba(0,0,0,.5)',
      fontSize: 13, fontWeight: 500, minWidth: 260,
      animation: `toastIn .3s ease both`,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{ICONS[type]}</span>
      <span>{message}</span>
    </div>
  )
}
