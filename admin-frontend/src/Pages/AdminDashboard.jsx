import React from 'react';
import { 
  BookOpen, 
  Users, 
  UserCheck, 
  Calendar, 
  FileText, 
  GraduationCap, 
  Clock 
} from 'lucide-react';

import Navbar from '../Components/Navbar';
import StatCard from '../Components/StatCard'; 

// 1. Accept onLogout as a prop here
const AdminDashboard = ({ onLogout }) => {
  
  const stats = [
    {
      label: 'Total Programs',
      value: '4',
      icon: <BookOpen />,
      colorClass: 'bg-blue-600',
    },
    {
      label: 'Total Students',
      value: '2500',
      icon: <Users className="text-green-600" />,
      colorClass: 'bg-green-600',
    },
    {
      label: 'Total Examiners',
      value: '50',
      icon: <UserCheck className="text-yellow-600" />,
      colorClass: 'bg-yellow-500',
    },
  ];

  const quickActions = [
    { label: 'Add Program', icon: <BookOpen />, color: 'bg-blue-100 text-blue-700' },
    { label: 'Schedule Exam', icon: <Calendar />, color: 'bg-green-100 text-green-700' },
    { label: 'Enter Results', icon: <FileText />, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Manage Users', icon: <Users />, color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      {/* 2. Pass onLogout down to Navbar */}
      <Navbar onLogout={onLogout} />

      <main className="pt-[100px] pb-12 px-8 max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              colorClass={stat.colorClass}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* System Overview Section */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h4 className="text-xl font-bold mb-6">System Overview</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100/50">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 p-2.5 rounded-lg text-white shadow-md shadow-blue-200">
                    <GraduationCap size={22} />
                  </div>
                  <span className="font-bold text-slate-700">Faculty of Engineering</span>
                </div>
                <span className="text-gray-400 text-sm font-medium">University of Ruhuna</span>
              </div>

              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100/50">
                <div className="flex items-center gap-4">
                  <div className="bg-green-600 p-2.5 rounded-lg text-white shadow-md shadow-green-200">
                    <Clock size={22} />
                  </div>
                  <span className="font-bold text-slate-700">System Status</span>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider border border-green-200">
                  Active
                </span>
              </div>
            </div>
          </section>

          {/* Quick Actions Section */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h4 className="text-xl font-bold mb-6">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-5">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className={`${action.color} p-8 rounded-2xl flex flex-col items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm border border-transparent hover:border-current/10`}
                >
                  <div className="scale-[1.5] mb-1">
                    {action.icon}
                  </div>
                  <span className="font-bold text-sm tracking-wide">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;