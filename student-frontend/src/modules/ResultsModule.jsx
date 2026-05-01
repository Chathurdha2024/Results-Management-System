import React, { useState } from 'react';
import { Badge } from '../components/ui.jsx';

const ResultsModule = () => {
  const [activeSem, setActiveSem] = useState('Sem 4');

  const semesters = {
    'Sem 4': {
      gpa: '3.80',
      cgpa: '3.72',
      subjects: [
        { subject: 'Data Structures', credits: 4, grade: 'A', points: 4.0 },
        { subject: 'Operating Systems', credits: 4, grade: 'A-', points: 3.7 },
        { subject: 'Database Systems', credits: 4, grade: 'A', points: 4.0 },
      ],
    },
    'Sem 3': {
      gpa: '3.65',
      cgpa: '3.60',
      subjects: [
        {
          subject: 'Discrete Mathematics',
          credits: 4,
          grade: 'B+',
          points: 3.3,
        },
        {
          subject: 'Computer Architecture',
          credits: 4,
          grade: 'A-',
          points: 3.7,
        },
      ],
    },
  };

  const current = semesters[activeSem];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Results</h2>
          <p className="text-xs text-slate-500">
            Semester-wise grades and GPA summary
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50">
            <span>📄</span>
            <span>Download result sheet PDF</span>
          </button>
          <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50">
            <span>📨</span>
            <span>Request transcript</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {Object.keys(semesters).map((sem) => (
          <button
            key={sem}
            onClick={() => setActiveSem(sem)}
            className={
              'rounded-full px-3 py-1.5 font-medium border ' +
              (activeSem === sem
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50')
            }
          >
            {sem}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Semester GPA
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {current.gpa}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Cumulative GPA
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {current.cgpa}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Credits this semester
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {current.subjects.reduce((sum, s) => sum + s.credits, 0)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="max-h-[420px] overflow-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Subject
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Credits
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Grade
                </th>
                <th className="px-4 py-3 font-semibold text-slate-600">
                  Grade Points
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {current.subjects.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-slate-900 font-medium">
                    {row.subject}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{row.credits}</td>
                  <td className="px-4 py-3 text-slate-700">{row.grade}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {row.points.toFixed(2)}
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

export default ResultsModule;

