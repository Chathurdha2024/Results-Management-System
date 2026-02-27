import React from 'react';
import { Card, Badge } from '../components/ui.jsx';

const StaffDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pending Gradings</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-semibold text-slate-900">42</p>
            <Badge color="yellow">Needs Attention</Badge>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Active Courses</p>
          <p className="text-3xl font-semibold text-slate-900 mt-2">03</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Upcoming Duties</p>
          <p className="text-3xl font-semibold text-slate-900 mt-2">02</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Immediate Tasks" subtitle="Items requiring signature or review">
            <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                    <p className="text-slate-900">Verify CS201 Final Marks</p>
                    <Badge color="red">Due Today</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <p className="text-slate-900">Upload Lab Assessment 2</p>
                    <Badge color="yellow">Due in 2 days</Badge>
                </div>
            </div>
        </Card>
        
        <Card title="Quick Actions">
            <div className="grid grid-cols-2 gap-2">
                <button className="text-left p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                    <p className="text-xs font-medium text-slate-900">📅 Duty Attendance</p>
                </button>
                <button className="text-left p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                    <p className="text-xs font-medium text-slate-900">📊 View Batch 2023</p>
                </button>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default StaffDashboard;