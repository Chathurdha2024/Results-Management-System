import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, CalendarDays, GraduationCap, Bell, User } from 'lucide-react';
import StudentLogin from './modules/StudentLogin.jsx';

// Modules
import Dashboard from './modules/Dashboard.jsx';
import CAModule from './modules/CAModule.jsx';
import TimetableModule from './modules/TimetableModule.jsx';
import ResultsModule from './modules/ResultsModule.jsx';
import NotificationsModule from './modules/NotificationsModule.jsx';
import ProfileModule from './modules/ProfileModule.jsx';
import "./index.css";

// Updated Section constants for Result Management System
const sections = {
  DASHBOARD: 'Dashboard',
  CA: 'Pending CA Marks',
  EXAM_TIMETABLE: 'Exam Timetable',
  RESULTS: 'Exam Results',
  NOTIFICATIONS: 'Alerts & Notifications',
  PROFILE: 'Profile',
};

// Navigation items updated to reflect Result Management focus
const navItems = [
  { key: sections.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { key: sections.CA, label: 'Pending CA Marks', icon: FileText },
  { key: sections.EXAM_TIMETABLE, label: 'Exam Timetable', icon: CalendarDays },
  { key: sections.RESULTS, label: 'Exam Results', icon: GraduationCap },
  { key: sections.NOTIFICATIONS, label: 'Notifications', icon: Bell },
  { key: sections.PROFILE, label: 'Profile', icon: User },
];

// --- DASHBOARD LAYOUT COMPONENT ---
const DashboardLayout = () => {
  const [activeSection, setActiveSection] = useState(sections.DASHBOARD);
  const [user, setUser] = useState({ name: 'Student', register_no: '' });
  const navigate = useNavigate();

  // Protect the route: if no token, redirect to login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/', { replace: true });
    } else {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) setUser(storedUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  const renderSection = () => {
    switch (activeSection) {
      case sections.DASHBOARD: return <Dashboard />;
      case sections.CA: return <CAModule />;
      case sections.EXAM_TIMETABLE: return <TimetableModule />;
      case sections.RESULTS: return <ResultsModule />;
      case sections.NOTIFICATIONS: return <NotificationsModule />;
      case sections.PROFILE: return <ProfileModule />;
      default: return <Dashboard />;
    }
  };

  const description = () => {
    switch (activeSection) {
      case sections.DASHBOARD: return 'Overview of your academic performance and latest results';
      case sections.CA: return 'Track and view your pending continuous assessment marks';
      case sections.EXAM_TIMETABLE: return 'Check your upcoming end-semester examination schedule';
      case sections.RESULTS: return 'Access your official grades and GPA summaries';
      case sections.NOTIFICATIONS: return 'Updates on released results, CA marks, and pending exams';
      case sections.PROFILE: return 'Manage your student profile and academic details';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      {/* Top bar */}
      <header className="border-b bg-card sticky top-0 z-20 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-sm">
                R
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 tracking-tight">
                  Student Result Management System
                </p>
                <p className="text-[11px] font-medium text-slate-500 uppercase">
                  Academic Performance Portal
                </p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-5">
              
              {/* Notification Button */}
              <button 
                onClick={() => setActiveSection(sections.NOTIFICATIONS)}
                title="View Result & Exam Alerts"
                className="relative rounded-full p-2 text-slate-400 hover:text-primary hover:bg-blue-50 transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1.5 inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>

              {/* Profile */}
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-800 capitalize leading-none">
                    {user.name}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 uppercase mt-1">
                    {user.register_no}
                  </p>
                </div>
                <div className="h-9 w-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-sm font-bold text-primary uppercase shadow-sm">
                  {user.name ? user.name.substring(0, 2) : 'ST'}
                </div>
                <button 
                  onClick={handleLogout}
                  className="ml-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
          
          {/* SIDEBAR */}
          <aside className="w-64 shrink-0 hidden md:block">
            <div className="bg-white border border-slate-200 rounded-2xl py-5 px-3 shadow-sm sticky top-24">
              <p className="text-[10px] font-bold text-slate-400 mb-3 px-3 tracking-widest uppercase">
                Academic Menu
              </p>
              
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = activeSection === item.key;
                  const Icon = item.icon;
                  
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveSection(item.key)}
                      className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-200 border border-transparent
                        ${isActive 
                          ? "bg-blue-50 text-primary font-semibold shadow-sm" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon 
                          strokeWidth={isActive ? 2.5 : 2} 
                          className={`h-[18px] w-[18px] transition-colors duration-200 
                            ${isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"}
                          `} 
                        />
                        <span>{item.label}</span>
                      </div>

                      {isActive && (
                        <div className="h-4 w-1 rounded-full bg-primary shadow-sm"></div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Mobile Dropdown */}
          <div className="md:hidden w-full">
            <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm relative">
              <select
                value={activeSection}
                onChange={(e) => setActiveSection(e.target.value)}
                className="w-full appearance-none bg-transparent py-2 pl-3 pr-8 text-sm font-semibold text-slate-800 focus:outline-none"
              >
                {navItems.map((item) => (
                  <option key={item.key} value={item.key}>{item.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Main Panel Content */}
          <section className="flex-1 min-w-0">
            <div className="mb-5 pl-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {activeSection}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {description()}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 min-h-[500px]">
              {renderSection()}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

// --- MAIN APP ROUTER ---
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentLogin />} />
        <Route path="/student-dashboard" element={<DashboardLayout />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;