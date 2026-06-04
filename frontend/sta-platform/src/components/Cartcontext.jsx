import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])
  // Each item: { course, option, qty }

  const addToCart = useCallback((course, option = 'Standard') => {
    setItems(prev => {
      const exists = prev.find(i => i.course._id === course._id && i.option === option)
      if (exists) {
        return prev.map(i =>
          i.course._id === course._id && i.option === option
            ? { ...i, qty: i.qty + 1 }
            : i
        )
      }
      return [...prev, { course, option, qty: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((courseId, option) => {
    setItems(prev => prev.filter(i => !(i.course._id === courseId && i.option === option)))
  }, [])

  const increaseQty = useCallback((courseId, option) => {
    setItems(prev =>
      prev.map(i =>
        i.course._id === courseId && i.option === option
          ? { ...i, qty: i.qty + 1 }
          : i
      )
    )
  }, [])

  const decreaseQty = useCallback((courseId, option) => {
    setItems(prev =>
      prev
        .map(i =>
          i.course._id === courseId && i.option === option
            ? { ...i, qty: i.qty - 1 }
            : i
        )
        .filter(i => i.qty > 0)
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const isInCart = (courseId) => items.some(i => i.course._id === courseId)

  const totalItems = items.reduce((s, i) => s + i.qty, 0)

  const totalPrice = items.reduce((s, i) => {
    const price =
      i.option === 'Combo' && i.course.comboPrice
        ? Number(i.course.comboPrice)
        : Number(i.course.price) || 0
    return s + price * i.qty
  }, 0)

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart,
      increaseQty, decreaseQty, clearCart,
      isInCart, totalItems, totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}