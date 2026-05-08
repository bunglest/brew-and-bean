const VIEWS = [
  { key: 'menu',      long: 'Menu Manager', short: 'Menu'   },
  { key: 'order',     long: 'Order Cart',   short: 'Orders' },
  { key: 'dashboard', long: 'Dashboard',    short: 'Stats'  },
]

export default function NavBar({ currentView, onNavigate }) {
  return (
    <nav className="sticky top-0 z-30 bg-amber-800 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-8">
        <span className="text-lg sm:text-xl font-bold tracking-wide whitespace-nowrap">
          ☕ Brew &amp; Bean
        </span>
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          {VIEWS.map(({ key, long, short }) => (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                currentView === key
                  ? 'bg-amber-600 text-white'
                  : 'hover:bg-amber-700 text-amber-100'
              }`}
            >
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{long}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
