import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems]     = useState([])
  const [coupon, setCoupon]   = useState(null)
  const [isOpen, setIsOpen]   = useState(false)

  const addItem = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        if (existing.qty >= product.estoque) return prev
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }, [])

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const changeQty = useCallback((id, delta) => {
    setItems(prev => prev
      .map(i => i.id === id ? { ...i, qty: Math.max(1, Math.min(i.estoque, i.qty + delta)) } : i)
      .filter(i => i.qty > 0)
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setCoupon(null)
  }, [])

  const totalItems = items.reduce((s, i) => s + i.qty, 0)
  const subtotal   = items.reduce((s, i) => s + i.preco * i.qty, 0)
  const discount   = coupon
    ? coupon.tipo === 'PERCENTUAL'
      ? subtotal * coupon.valor / 100
      : Math.min(coupon.valor, subtotal)
    : 0
  const total = subtotal - discount

  return (
    <CartContext.Provider value={{
      items, coupon, setCoupon, isOpen, setIsOpen,
      addItem, removeItem, changeQty, clearCart,
      totalItems, subtotal, discount, total
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
