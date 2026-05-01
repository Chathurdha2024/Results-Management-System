import React, { useState } from 'react';
import { Badge } from '../components/ui.jsx';

const CAModule = () => {
  const [semester, setSemester] = useState('All');
  const [status, setStatus] = useState('All');

  const data = [
    {
      code: 'CS201',
      name: 'Data Structures',
      marks: '18 / 20',
      status: 'Graded',
    },
    {
      code: 'CS203',
      name: 'Database Systems',
      marks: '-',
      status: 'Pending',
    },
    {
      code: 'CS205',
      name: 'Computer Networks',
      marks: '-',
      status: 'Submitted',
    },
  ];

  const filtered = data.filter((row) => {
    if (status !== 'All' && row.status !== status) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Continuous Assessments Marks
          </h2>
          <p className="text-xs text-slate-500">
            Track quizzes, assignments and lab work Marks
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            <option>All</option>
            <option>Semester 1</option>
            <option>Semester 2</option>
            <option>Semester 3</option>
            <option>Semester 4</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Submitted</option>
            <option>Graded</option>
          </select>
          <input
            placeholder="Filter by subject"
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="max-h-[420px] overflow-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Subject Code
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Subject Name
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Marks
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-slate-900 font-medium">
                    {row.code}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {row.marks}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      color={
                        row.status === 'Pending'
                          ? 'yellow'
                          : row.status === 'Submitted'
                          ? 'blue'
                          : 'green'
                      }
                    >
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CAModule;