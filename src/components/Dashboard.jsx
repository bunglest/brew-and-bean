import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const MENU_KEY   = 'brewbean_menu'
const ORDERS_KEY = 'brewbean_orders'

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function isToday(isoString) {
  const d = new Date(isoString)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth()    === now.getMonth()    &&
    d.getDate()     === now.getDate()
  )
}

function fmtMoney(n) {
  return '$' + n.toFixed(2)
}

function fmtTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

const HOUR_LABELS = Array.from({ length: 24 }, (_, h) => {
  if (h === 0)  return '12am'
  if (h === 12) return '12pm'
  return h < 12 ? `${h}am` : `${h - 12}pm`
})

// Custom tooltip for the bar chart
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-amber-200 rounded-lg shadow px-3 py-2 text-sm">
      <p className="font-semibold text-amber-900">{label}</p>
      <p className="text-stone-600">{fmtMoney(payload[0].value)}</p>
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [expandedId, setExpandedId] = useState(null)

  const allOrders    = loadOrders()
  const todayOrders  = useMemo(
    () => allOrders.filter(o => isToday(o.timestamp)).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // ── Stats ──────────────────────────────────────────────────────────────────
  const count    = todayOrders.length
  const revenue  = todayOrders.reduce((s, o) => s + o.total, 0)
  const avgOrder = count > 0 ? revenue / count : 0

  // ── Chart data — only hours that have revenue ──────────────────────────────
  const hourlyMap = new Array(24).fill(0)
  todayOrders.forEach(o => {
    hourlyMap[new Date(o.timestamp).getHours()] += o.total
  })

  // Show all 24 hours so the shape of the day is visible
  const chartData = hourlyMap.map((val, h) => ({
    hour:    HOUR_LABELS[h],
    revenue: parseFloat(val.toFixed(2)),
  }))

  // ── Clear all data ─────────────────────────────────────────────────────────
  function clearAllData() {
    if (!window.confirm('This will delete ALL menu items and orders. Continue?')) return
    localStorage.removeItem(MENU_KEY)
    localStorage.removeItem(ORDERS_KEY)
    window.location.reload()
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-amber-900">Dashboard</h2>

      {/* ── Section 1: Stat cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Today's Orders"       value={count} format="number" />
        <StatCard label="Today's Revenue"      value={revenue} format="money" />
        <StatCard label="Average Order Value"  value={avgOrder} format="money" />
      </div>

      {/* ── Section 2: Revenue by Hour ────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-md border border-amber-100 p-5">
        <h3 className="text-base font-semibold text-amber-900 mb-4">Revenue by Hour</h3>
        {count === 0 ? (
          <EmptyState message="No orders yet today." />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 11, fill: '#78716c' }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                tickFormatter={v => `$${v}`}
                tick={{ fontSize: 11, fill: '#78716c' }}
                tickLine={false}
                axisLine={false}
                width={42}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#fef3c7' }} />
              <Bar dataKey="revenue" fill="#d97706" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Section 3: Orders list ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-md border border-amber-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h3 className="text-base font-semibold text-amber-900">Today's Orders</h3>
        </div>

        {count === 0 ? (
          <div className="px-5 py-10">
            <EmptyState message="No orders yet today." />
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {todayOrders.map(order => {
              const isOpen   = expandedId === order.id
              const shortId  = order.id.slice(-4).toUpperCase()
              const itemCount = order.items.reduce((s, i) => s + i.quantity, 0)

              return (
                <li key={order.id}>
                  {/* Row */}
                  <button
                    onClick={() => setExpandedId(isOpen ? null : order.id)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-left
                               hover:bg-amber-50 transition-colors"
                  >
                    {/* Chevron */}
                    <svg
                      className={`w-4 h-4 text-stone-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>

                    <span className="font-semibold text-amber-900 text-sm w-20">
                      #{shortId}
                    </span>
                    <span className="text-stone-400 text-xs w-24">
                      {fmtTime(order.timestamp)}
                    </span>
                    <span className="text-stone-500 text-xs flex-1">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                    <span className="font-bold text-amber-800 text-sm">
                      {fmtMoney(order.total)}
                    </span>
                  </button>

                  {/* Expanded line items */}
                  {isOpen && (
                    <ul className="bg-amber-50/60 px-10 pb-3 pt-1 space-y-1.5">
                      {order.items.map(line => (
                        <li key={line.id} className="flex justify-between text-xs text-stone-600">
                          <span>{line.name} × {line.quantity}</span>
                          <span className="font-medium text-stone-700">{fmtMoney(line.lineTotal)}</span>
                        </li>
                      ))}
                      <li className="flex justify-between text-xs text-stone-400 pt-1 border-t border-amber-100">
                        <span>Tax</span>
                        <span>{fmtMoney(order.tax)}</span>
                      </li>
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* ── Section 4: Danger zone ────────────────────────────────────────── */}
      <div className="flex justify-end">
        <button
          onClick={clearAllData}
          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-medium px-4 py-2 rounded-lg transition"
        >
          Clear all data
        </button>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, format }) {
  const display = format === 'money'
    ? fmtMoney(value)
    : value.toString()

  return (
    <div className="bg-white rounded-xl shadow-md border border-amber-100 p-5">
      <p className="text-3xl font-bold text-amber-900">{display}</p>
      <p className="text-sm text-stone-500 mt-1">{label}</p>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <p className="text-stone-400 text-sm text-center py-6">{message}</p>
  )
}
