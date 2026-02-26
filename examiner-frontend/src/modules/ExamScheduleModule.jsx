import React from 'react';
import { Badge } from '../components/ui.jsx';

const ExamScheduleModule = () => {
  const duties = [
    { module: 'Data Structures', code: 'CS201', date: '15 Mar 2026', time: '09:00 - 12:00', venue: 'Main Hall A', role: 'Chief Examiner' },
    { module: 'Operating Systems', code: 'CS202', date: '18 Mar 2026', time: '13:00 - 16:00', venue: 'Building B - Hall 2', role: 'Invigilator' },
    { module: 'Software Engineering', code: 'CS205', date: '20 Mar 2026', time: '10:00 - 13:00', venue: 'Building C - Hall 1', role: 'Chief Examiner' },
    { module: 'Computer Networks', code: 'CS207', date: '22 Mar 2026', time: '14:00 - 17:00', venue: 'Building D - Hall 3', role: 'Invigilator' },
    { module: 'Algorithms', code: 'CS206', date: '25 Mar 2026', time: '11:00 - 14:00', venue: 'Building E - Hall 4', role: 'Chief Examiner' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">Upcoming exam invigilation and oversight duties.</p>
      <div className="grid grid-cols-1 gap-3">
        {duties.map((duty, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">{duty.module}</h3>
                <span className="text-[10px] text-slate-400 font-mono">{duty.code}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">📍 {duty.venue} • 📅 {duty.date}</p>
            </div>
            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                <div className="text-left md:text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Duty Time</p>
                    <p className="text-xs font-medium text-slate-700">{duty.time}</p>
                </div>
                <Badge color="blue">{duty.role}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamScheduleModule;