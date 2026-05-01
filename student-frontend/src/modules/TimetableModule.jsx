import React, { useState } from 'react';

const ExamTimetableModule = () => {
  const [mode, setMode] = useState('Grid');

  const exams = [
    {
      subject: 'Data Structures',
      code: 'CS201',
      date: '2026-03-12',
      time: '09:00 – 12:00',
      venue: 'Main Hall A',
      seat: 'A-23',
      duration: '3 Hours',
    },
    {
      subject: 'Operating Systems',
      code: 'CS202',
      date: '2026-03-15',
      time: '13:00 – 16:00',
      venue: 'Main Hall B',
      seat: 'B-14',
      duration: '3 Hours',
    },
    {
      subject: 'Database Systems',
      code: 'CS203',
      date: '2026-03-18',
      time: '09:00 – 11:00',
      venue: 'Engineering Auditorium',
      seat: 'C-05',
      duration: '2 Hours',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Examination Timetable
          </h2>
          <p className="text-xs text-slate-500">
            View your upcoming semester examinations
          </p>
        </div>

        {/* Toggle */}
        <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs">
          <button
            onClick={() => setMode('Grid')}
            className={
              'px-3 py-1.5 rounded-md font-medium ' +
              (mode === 'Grid'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600')
            }
          >
            Grid View
          </button>
          <button
            onClick={() => setMode('List')}
            className={
              'px-3 py-1.5 rounded-md font-medium ' +
              (mode === 'List'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600')
            }
          >
            List View
          </button>
        </div>
      </div>

      {/* GRID VIEW */}
      {mode === 'Grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 hover:shadow-sm transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {exam.subject}
                  </p>
                  <p className="text-xs text-slate-500">{exam.code}</p>
                </div>
                <span className="text-[11px] bg-primary-50 text-primary-700 px-2 py-1 rounded-md">
                  {exam.duration}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p>📅 {exam.date}</p>
                <p>⏰ {exam.time}</p>
                <p>📍 {exam.venue}</p>
                <p>🪑 Seat No: {exam.seat}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="max-h-[420px] overflow-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Subject
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Date
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Time
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Venue
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Seat No
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((exam, index) => (
                  <tr key={index} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {exam.subject}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {exam.date}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {exam.time}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {exam.venue}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {exam.seat}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {exam.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamTimetableModule;