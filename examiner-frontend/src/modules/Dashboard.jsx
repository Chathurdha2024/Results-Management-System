import React from 'react';
import { Card, Badge } from '../components/ui.jsx';

const Dashboard = () => {
  const upcomingExams = [
    { subject: 'Data Structures', date: '15 Mar 2026', venue: 'Hall A1' },
    { subject: 'Operating Systems', date: '18 Mar 2026', venue: 'Hall B3' },
  ];

  const pendingCAs = [
    {
      subject: 'Database Systems',
      due: '10 Mar 2026',
      status: 'Pending',
    },
    {
      subject: 'Computer Networks',
      due: '12 Mar 2026',
      status: 'Submitted',
    },
  ];

  const notifications = [
   
    {
      type: 'CA',
      title: 'Assignment 2 deadline extended',
      time: '5h ago',
    },
    {
      type: 'System',
      title: 'Planned maintenance this weekend',
      time: '1 day ago',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Current GPA
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-semibold text-slate-900">3.72</p>
            <Badge color="green">On Track</Badge>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Based on latest published results
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Credits Completed
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-semibold text-slate-900">84</p>
            <p className="text-xs text-slate-500">/ 120 credits</p>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full w-7/12 rounded-full bg-primary-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Upcoming Items
          </p>
          <div className="mt-2 flex gap-6 text-sm">
            <div>
              <p className="text-2xl font-semibold text-slate-900">3</p>
              <p className="text-xs text-slate-500">Exams this week</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">4</p>
              <p className="text-xs text-slate-500">CAs due soon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Upcoming Exams" subtitle="Next 7 days">
          <div className="space-y-3">
            {upcomingExams.map((exam, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {exam.subject}
                  </p>
                  <p className="text-xs text-slate-500">
                    {exam.date} · {exam.venue}
                  </p>
                </div>
                <Badge color="blue">ExamTimeTable</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Pending CAs" subtitle="Items needing your attention">
          <div className="space-y-3">
            {pendingCAs.map((ca, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {ca.subject}
                  </p>
                  <p className="text-xs text-slate-500">Due {ca.due}</p>
                </div>
                <Badge color={ca.status === 'Pending' ? 'yellow' : 'green'}>
                  {ca.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Latest Notifications" subtitle="Most recent updates">
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {notifications.map((n, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-500">{n.time}</p>
                </div>
                <Badge
                  color={
                    n.type === 'Exam'
                      ? 'red'
                      : n.type === 'CA'
                      ? 'yellow'
                      : 'blue'
                  }
                >
                  {n.type}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card
        title="Quick Actions"
        subtitle="Jump to frequently used pages"
        actions={
          <button className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
            Customize
          </button>
        }
      >
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-xs font-medium text-white hover:bg-primary-700">
            <span>📅</span>
            <span>View full timetable</span>
          </button>
          
          <button className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <span>📊</span>
            <span>Check results</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

