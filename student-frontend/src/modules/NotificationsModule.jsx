import React, { useState } from 'react';
import { Badge } from '../components/ui.jsx';

const NotificationsModule = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  // Updated data focused on Results, Exams, and CA
  const notifications = [
    {
      id: 1,
      type: 'Result',
      title: 'Semester 3 Final Results Published',
      message: 'Your official transcript for Fall 2025 is now available for download.',
      time: '2 hours ago',
      priority: 'High',
      action: 'View Transcript',
    },
    {
      id: 2,
      type: 'Exam',
      title: 'Hall Ticket Generated: March 2026',
      message: 'Admit cards for the upcoming session are ready. Please print before Mar 10.',
      time: '5 hours ago',
      priority: 'High',
      action: 'Download PDF',
    },
    {
      id: 3,
      type: 'CA',
      title: 'CA Marks: Data Structures (CS201)',
      message: 'Mid-term assessment marks have been released by the department.',
      time: 'Yesterday · 4:15 PM',
      priority: 'Medium',
      action: 'Check Score',
    },
    {
      id: 4,
      type: 'Exam',
      title: 'Venue Change: Operating Systems',
      message: 'The exam scheduled for 18 Mar has been moved to Hall B3 (New Block).',
      time: 'Yesterday · 10:00 AM',
      priority: 'Critical',
      action: 'View Schedule',
    },
    {
      id: 5,
      type: 'CA',
      title: 'Pending Submission: Computer Networks',
      message: 'Reminder: Lab Assessment 3 is due in 24 hours.',
      time: '2 days ago',
      priority: 'Medium',
      action: 'Submit Now',
    },
  ];

  const filters = ['All', 'Result', 'Exam', 'CA'];

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'All') return true;
    return n.type === activeFilter;
  });

  // Helper for icons based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'Result':
        return (
          <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
        );
      case 'Exam':
        return (
          <div className="bg-rose-100 text-rose-600 p-2 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        );
      case 'CA':
        return (
          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
        );
      default:
        return (
          <div className="bg-slate-100 text-slate-600 p-2 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* --- Header --- */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Notifications</h2>
          <p className="text-xs text-slate-500 mt-0.5">Stay updated with academic alerts</p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeFilter === f
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* --- Notification List --- */}
      <div className="overflow-y-auto max-h-[500px]">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((n) => (
              <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors group">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{n.type}</p>
                      <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{n.time}</span>
                    </div>
                    
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{n.title}</h3>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    
                    {/* Action Area */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors">
                          {n.action}
                        </button>
                        <button className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1.5 transition-colors">
                          Dismiss
                        </button>
                      </div>
                      
                      {/* Priority Indicator */}
                      {n.priority === 'Critical' || n.priority === 'High' ? (
                        <Badge color="red">{n.priority}</Badge>
                      ) : (
                         <Badge color="slate">{n.priority}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3 text-slate-400">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            </div>
            <p className="text-sm font-medium text-slate-900">All caught up!</p>
            <p className="text-xs text-slate-500 mt-1">No new {activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} notifications.</p>
          </div>
        )}
      </div>

      {/* --- Footer --- */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
        <button className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
          View All History
        </button>
      </div>
    </div>
  );
};

export default NotificationsModule;