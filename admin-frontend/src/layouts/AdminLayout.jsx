import { NavLink, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react'; // Optional: for icon

const navItems = [
  { to: '/', label: 'Dashboard', exact: true },
  { to: '/programs', label: 'Programs & Modules' },
  { to: '/exams', label: 'Examinations & Venues' },
  { to: '/examiners', label: 'Examiners' },
  { to: '/results', label: 'Results' },
  { to: '/students', label: 'Students & GPA' },
  { to: '/reports', label: 'Reports' },
];

function AdminLayout({ onLogout }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-slate-200 bg-white">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Faculty of Engineering
            </div>
            <div className="text-lg font-bold text-slate-900 leading-tight">
              RMS Admin
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
                    ].join(' ')
                  }
                >
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button in Sidebar Footer */}
        <div className="border-t border-slate-200 p-4">
          <button 
            onClick={onLogout}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Result Management System</h1>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-xs">
              <span className="font-medium text-slate-900">Admin User</span>
              <span className="text-slate-500">admin@eng.ruh.ac.lk</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6 bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
          <div className="mx-auto max-w-7xl">
            {/* THIS IS WHERE SUB-PAGES (Programs, etc.) RENDER */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;