import { useState } from 'react'
import NavBar from './components/NavBar'
import MenuManager from './components/MenuManager'
import OrderCart from './components/OrderCart'
import Dashboard from './components/Dashboard'

export default function App() {
  const [view, setView] = useState('menu')

  return (
    <div className="min-h-screen bg-amber-50">
      <NavBar currentView={view} onNavigate={setView} />
      <main className="max-w-5xl mx-auto p-6">
        {view === 'menu' && <MenuManager />}
        {view === 'order' && <OrderCart />}
        {view === 'dashboard' && <Dashboard />}
      </main>
    </div>
  )
}
