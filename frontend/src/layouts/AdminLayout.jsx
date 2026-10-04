import { useState, useEffect } from 'react';
import { BookOpen, Monitor, Zap, Settings, Shield, UserCircle, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children, activeTab, setActiveTab, onBackToBatches, activeView }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const tabs = [
    { id: 'GLOBAL_ALLOCATION', label: 'Global Allocation', icon: <BookOpen size={20} /> },
    { id: 'GENERAL', label: 'General / Interdisciplinary', icon: <BookOpen size={20} /> },
    { id: 'COMPUTER', label: 'Computer (Sem 3-8)', icon: <Monitor size={20} /> },
    { id: 'ELECTRICAL', label: 'Electrical (Sem 3-8)', icon: <Zap size={20} /> },
    { id: 'MECHANICAL', label: 'Mechanical (Sem 3-8)', icon: <Settings size={20} /> },
    { id: 'CIVIL', label: 'Civil (Sem 3-8)', icon: <Shield size={20} /> },
  ];

  // Close mobile menu when a tab is selected
  const handleTabSelect = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="min-h-screen bg-brand-white flex font-sans">
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 md:w-64 bg-brand-900 text-brand-white/80 flex flex-col fixed h-full shadow-2xl z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 bg-brand-900 border-b border-brand-800">
          <div className="flex items-center gap-3">
            <div className="bg-brand-gold p-1.5 rounded-lg shadow-brand-gold/20 shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Ruhuna EngRMS</h1>
          </div>
          
          {/* Close button (Mobile Only) */}
          <button 
            className="md:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <div className="mb-6">
            <Button 
              variant="outline"
              onClick={onBackToBatches}
              className={`w-full flex items-center justify-center gap-2 rounded-lg p-3 h-auto text-sm font-bold transition-all shadow-sm ${
                activeView === 'GLOBAL' && activeTab !== 'EXAMINERS'
                  ? 'bg-brand-gold text-brand-900 shadow-brand-gold/30 hover:bg-yellow-400'
                  : 'bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-brand-900 border-brand-gold/30'
              }`}
            >
              {activeView === 'GLOBAL' && activeTab !== 'EXAMINERS' ? 'Super Dashboard Active' : '← Back to All Batches'}
            </Button>
          </div>

          {/* Global Tools always visible */}
          <div className="px-2 text-xs font-semibold text-brand-white/50 uppercase tracking-wider mb-2 mt-2">
            Global Tools
          </div>
          <Button
            variant="ghost"
            onClick={() => handleTabSelect('EXAMINERS')}
            className={`w-full flex justify-start items-center gap-3 px-3 py-3 h-auto rounded-xl transition-all duration-200 border mb-4 ${
              activeTab === 'EXAMINERS' 
                ? 'bg-brand-800 text-brand-gold border-brand-700 shadow-sm font-bold' 
                : 'border-transparent text-brand-white/70 hover:bg-brand-800/50 hover:text-brand-white'
            }`}
          >
            <UserCircle size={20} />
            <span className="font-medium text-[15px] md:text-sm">Examiner Management</span>
          </Button>

          {activeView === 'WORKSPACE' && (
            <>
              <div className="px-2 text-xs font-semibold text-brand-white/50 uppercase tracking-wider mb-2 mt-2">
                Workspaces
              </div>
              {tabs.map(tab => {
                // Distinct styling for Global Allocation tab
                const isMain = tab.id === 'GLOBAL_ALLOCATION';
                return (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    onClick={() => handleTabSelect(tab.id)}
                    className={`w-full flex justify-start items-center gap-3 px-3 py-3 h-auto rounded-xl transition-all duration-200 border ${isMain ? 'mb-2' : ''} ${
                      activeTab === tab.id 
                        ? 'bg-brand-800 text-brand-gold border-brand-700 shadow-sm font-bold' 
                        : 'border-transparent text-brand-white/70 hover:bg-brand-800/50 hover:text-brand-white'
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium text-[15px] md:text-sm">{tab.label}</span>
                  </Button>
                );
              })}
            </>
          )}
        </div>

        {/* User Profile / Logout footer */}
        <div className="p-4 bg-brand-900 border-t border-brand-800">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <UserCircle size={32} className="text-brand-white/50" />
              <div>
                <div className="text-sm font-bold text-brand-white">Admin</div>
                <div className="text-xs text-brand-white/50">Administrator</div>
              </div>
            </div>
            <button onClick={() => { localStorage.removeItem('adminToken'); navigate('/'); }} className="p-2 text-brand-white/50 hover:text-red-400 hover:bg-brand-800 rounded-lg transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen w-full transition-all duration-300">
        
        {/* Top Header */}
        <header className="h-16 bg-brand-white border-b border-brand-gold/20 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-sm md:shadow-none">
          <div className="flex items-center gap-4">
            {/* Hamburger Button (Mobile Only) */}
            <button 
              className="md:hidden p-2 -ml-2 text-brand-900/60 hover:text-brand-900 hover:bg-brand-gold/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            <h2 className="text-base sm:text-lg font-bold text-brand-900 truncate">
              {tabs.find(t => t.id === activeTab)?.label} Workspace
            </h2>
          </div>
          
          <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-brand-900/60">
            <span>Result Management System</span>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
