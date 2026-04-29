export const formatBRL = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val ?? 0)

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

export const getCategoryEmoji = (nome = '') => {
  const n = nome.toLowerCase()
  if (n.includes('eletr')) return '💻'
  if (n.includes('livro') || n.includes('book')) return '📚'
  if (n.includes('vest') || n.includes('roupa') || n.includes('camiset')) return '👕'
  if (n.includes('casa') || n.includes('jardim')) return '🏠'
  if (n.includes('esport')) return '⚽'
  if (n.includes('aliment') || n.includes('food')) return '🍎'
  return '🛍️'
}

export const STATUS_CONFIG = {
  PENDENTE:             { label: 'Pendente',           color: 'gold',  dot: '#d4a853' },
  AGUARDANDO_PAGAMENTO: { label: 'Aguard. Pagamento',  color: 'amber', dot: '#fbbf24' },
  PAGO:                 { label: 'Pago',               color: 'cyan',  dot: '#38bdf8' },
  EM_SEPARACAO:         { label: 'Em Separação',       color: 'cyan',  dot: '#38bdf8' },
  ENVIADO:              { label: 'Enviado',             color: 'green', dot: '#34d399' },
  ENTREGUE:             { label: 'Entregue',            color: 'green', dot: '#34d399' },
  CANCELADO:            { label: 'Cancelado',           color: 'red',   dot: '#f87171' },
  DEVOLVIDO:            { label: 'Devolvido',           color: 'red',   dot: '#f87171' },
}

export const NEXT_STATUS = {
  PENDENTE:             'AGUARDANDO_PAGAMENTO',
  AGUARDANDO_PAGAMENTO: 'PAGO',
  PAGO:                 'EM_SEPARACAO',
  EM_SEPARACAO:         'ENVIADO',
  ENVIADO:              'ENTREGUE',
}
