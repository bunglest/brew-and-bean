import { useState, useEffect } from 'react'

const STORAGE_KEY = 'brewbean_menu'

const SEED_ITEMS = [
  { id: crypto.randomUUID(), name: 'Espresso',        price: 3.50, category: 'Drinks', inStock: true },
  { id: crypto.randomUUID(), name: 'Latte',           price: 4.75, category: 'Drinks', inStock: true },
  { id: crypto.randomUUID(), name: 'Cold Brew',       price: 4.50, category: 'Drinks', inStock: true },
  { id: crypto.randomUUID(), name: 'Croissant',       price: 3.25, category: 'Pastry', inStock: true },
  { id: crypto.randomUUID(), name: 'Blueberry Muffin',price: 3.00, category: 'Pastry', inStock: true },
  { id: crypto.randomUUID(), name: 'Avocado Toast',   price: 8.50, category: 'Food',   inStock: true },
]

const CATEGORY_BADGE = {
  Drinks: 'bg-sky-100 text-sky-700',
  Food:   'bg-emerald-100 text-emerald-700',
  Pastry: 'bg-amber-100 text-amber-700',
}

const EMPTY_FORM = { name: '', price: '', category: 'Drinks', inStock: true }

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

export default function MenuManager() {
  const [items, setItems] = useState(() => {
    const stored = loadItems()
    if (stored && stored.length > 0) return stored
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ITEMS))
    return SEED_ITEMS
  })

  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [errors, setErrors]     = useState({})

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setErrors({})
    setShowForm(true)
  }

  function openEdit(item) {
    setForm({ name: item.name, price: String(item.price), category: item.category, inStock: item.inStock })
    setEditingId(item.id)
    setErrors({})
    setShowForm(true)
  }

  function validate() {
    const e = {}
    if (!form.name.trim())              e.name  = 'Name is required'
    const p = parseFloat(form.price)
    if (form.price === '' || isNaN(p) || p < 0) e.price = 'Enter a valid price'
    return e
  }

  function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const entry = {
      name: form.name.trim(),
      price: parseFloat(parseFloat(form.price).toFixed(2)),
      category: form.category,
      inStock: form.inStock,
    }

    setItems(prev =>
      editingId
        ? prev.map(item => item.id === editingId ? { ...item, ...entry } : item)
        : [...prev, { id: crypto.randomUUID(), ...entry }]
    )
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
  }

  function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) return
    setItems(prev => prev.filter(item => item.id !== id))
  }

  function toggleStock(id) {
    setItems(prev => prev.map(item => item.id === id ? { ...item, inStock: !item.inStock } : item))
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-amber-900">Menu</h2>
        {!showForm && (
          <button
            onClick={openAdd}
            className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold px-4 py-2 rounded-xl shadow transition"
          >
            + Add Item
          </button>
        )}
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-white border border-amber-200 rounded-xl shadow-md p-5 mb-7">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">
            {editingId ? 'Edit Item' : 'New Item'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${errors.name ? 'border-red-400' : 'border-stone-300'}`}
                placeholder="Item name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${errors.price ? 'border-red-400' : 'border-stone-300'}`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option>Drinks</option>
                <option>Food</option>
                <option>Pastry</option>
              </select>
            </div>

            {/* In-stock checkbox */}
            <div className="flex items-center gap-2 sm:pt-6">
              <input
                id="form-instock"
                type="checkbox"
                checked={form.inStock}
                onChange={e => setForm(f => ({ ...f, inStock: e.target.checked }))}
                className="w-4 h-4 accent-amber-600 cursor-pointer"
              />
              <label htmlFor="form-instock" className="text-sm font-medium text-stone-700 cursor-pointer">
                In Stock
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2 rounded-xl shadow transition"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold px-5 py-2 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Item grid */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-stone-300">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          <p className="text-stone-400 text-sm">No items yet — add one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div
              key={item.id}
              className={`relative bg-white rounded-xl shadow-md border border-amber-100 p-5 transition-opacity ${!item.inStock ? 'opacity-50' : ''}`}
            >
              {/* Sold-out overlay — pointer-events-none so buttons remain clickable */}
              {!item.inStock && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-stone-50/70 z-10">
                  <span className="text-stone-500 font-bold text-sm tracking-widest uppercase">
                    Sold Out
                  </span>
                </div>
              )}

              {/* Card header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-amber-900 text-base leading-tight">{item.name}</p>
                  <p className="text-amber-700 font-bold text-xl mt-0.5">${item.price.toFixed(2)}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${CATEGORY_BADGE[item.category]}`}>
                  {item.category}
                </span>
              </div>

              {/* Card footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={item.inStock}
                    onChange={() => toggleStock(item.id)}
                    className="w-4 h-4 accent-amber-600 cursor-pointer"
                  />
                  <span className="text-xs text-stone-500">{item.inStock ? 'In stock' : 'Out of stock'}</span>
                </label>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium px-3 py-1.5 rounded-lg transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-medium px-3 py-1.5 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
