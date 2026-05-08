import { useState, useEffect, useCallback } from 'react'

const MENU_KEY   = 'brewbean_menu'
const ORDERS_KEY = 'brewbean_orders'
const TAX_RATE   = 0.08

const CATEGORY_BADGE = {
  Drinks: 'bg-sky-100 text-sky-700',
  Food:   'bg-emerald-100 text-emerald-700',
  Pastry: 'bg-amber-100 text-amber-700',
}

function loadMenu() {
  try {
    const raw = localStorage.getItem(MENU_KEY)
    if (raw) return JSON.parse(raw).filter(item => item.inStock)
  } catch {}
  return []
}

function loadOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export default function OrderCart() {
  const [menuItems, setMenuItems] = useState(loadMenu)
  const [cart, setCart]           = useState([])   // [{ id, name, price, quantity }]
  const [toast, setToast]         = useState(null)  // string | null

  // Refresh menu from localStorage whenever the tab regains focus
  // (so changes made in MenuManager are reflected immediately)
  useEffect(() => {
    function sync() { setMenuItems(loadMenu()) }
    window.addEventListener('focus', sync)
    return () => window.removeEventListener('focus', sync)
  }, [])

  // ── Cart helpers ────────────────────────────────────────────────

  function addToCart(item) {
    setCart(prev => {
      const existing = prev.find(l => l.id === item.id)
      if (existing) {
        return prev.map(l => l.id === item.id ? { ...l, quantity: l.quantity + 1 } : l)
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }]
    })
  }

  function changeQty(id, delta) {
    setCart(prev =>
      prev.flatMap(l => {
        if (l.id !== id) return [l]
        const next = l.quantity + delta
        return next < 1 ? [] : [{ ...l, quantity: next }]
      })
    )
  }

  function removeLine(id) {
    setCart(prev => prev.filter(l => l.id !== id))
  }

  // ── Totals ───────────────────────────────────────────────────────

  const subtotal = cart.reduce((sum, l) => sum + l.price * l.quantity, 0)
  const tax      = subtotal * TAX_RATE
  const total    = subtotal + tax

  // ── Complete order ───────────────────────────────────────────────

  const completeOrder = useCallback(() => {
    if (cart.length === 0) return

    const order = {
      id:        crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      items:     cart.map(l => ({
        id:        l.id,
        name:      l.name,
        price:     l.price,
        quantity:  l.quantity,
        lineTotal: parseFloat((l.price * l.quantity).toFixed(2)),
      })),
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax:      parseFloat(tax.toFixed(2)),
      total:    parseFloat(total.toFixed(2)),
    }

    const orders = loadOrders()
    localStorage.setItem(ORDERS_KEY, JSON.stringify([...orders, order]))

    setCart([])
    setToast(`Order #${order.id.slice(-4).toUpperCase()} complete!`)
    setTimeout(() => setToast(null), 2000)
  }, [cart, subtotal, tax, total])

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="relative">
      {/* Success toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <h2 className="text-3xl font-bold text-amber-900 mb-6">New Order</h2>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── LEFT: menu browser ───────────────────────────────────── */}
        <div className="w-full lg:w-2/3">
          <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">
            Menu — tap to add
          </h3>

          {menuItems.length === 0 ? (
            <p className="text-stone-400 text-center py-16">
              No in-stock items found. Add some in Menu Manager.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="text-left bg-white border border-amber-100 rounded-xl shadow-sm p-4
                             hover:shadow-md hover:-translate-y-0.5 hover:border-amber-300
                             active:translate-y-0 active:shadow-sm
                             transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-amber-900 text-sm leading-tight">{item.name}</p>
                      <p className="text-amber-700 font-bold text-lg mt-0.5">${item.price.toFixed(2)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5 ${CATEGORY_BADGE[item.category]}`}>
                      {item.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: cart panel ────────────────────────────────────── */}
        <div className="w-full lg:w-1/3 lg:sticky lg:top-6">
          <div className="bg-white border border-amber-100 rounded-xl shadow-md p-5">
            <h3 className="text-lg font-bold text-amber-900 mb-4">Current Order</h3>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-stone-300">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <p className="text-stone-400 text-sm">No items yet — tap a menu item to add it.</p>
              </div>
            ) : (
              <>
                {/* Line items */}
                <ul className="divide-y divide-stone-100 mb-4">
                  {cart.map(line => (
                    <li key={line.id} className="py-3 flex items-center gap-3">
                      {/* Name + unit price */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-800 truncate">{line.name}</p>
                        <p className="text-xs text-stone-400">${line.price.toFixed(2)} each</p>
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => changeQty(line.id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-base leading-none transition"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-stone-700">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() => changeQty(line.id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-base leading-none transition"
                        >
                          +
                        </button>
                      </div>

                      {/* Line total */}
                      <span className="w-14 text-right text-sm font-semibold text-amber-800">
                        ${(line.price * line.quantity).toFixed(2)}
                      </span>

                      {/* Remove */}
                      <button
                        onClick={() => removeLine(line.id)}
                        className="text-stone-300 hover:text-red-400 transition text-lg leading-none ml-1"
                        aria-label={`Remove ${line.name}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Totals */}
                <div className="border-t border-stone-100 pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-stone-500">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-amber-900 text-base pt-1 border-t border-stone-100">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}

            {/* Complete Order */}
            <button
              onClick={completeOrder}
              disabled={cart.length === 0}
              className="mt-5 w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800
                         disabled:opacity-40 disabled:cursor-not-allowed
                         text-white font-semibold py-2.5 rounded-xl shadow transition"
            >
              Complete Order
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
