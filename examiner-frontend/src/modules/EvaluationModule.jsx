import React, { useState } from 'react';
import { Badge } from '../components/ui.jsx';

const EvaluationModule = () => {
  const [selectedModule, setSelectedModule] = useState('CS201');
  
  const students = [
    { id: '2023CS001', name: 'Dassanayake D.M.B.C.', marks: '85', status: 'Published' },
    { id: '2023CS002', name: 'Denuwanthi P.G.D.', marks: '42', status: 'Review' },
    { id: '2023CS003', name: 'Darshika S.W.D.', marks: '', status: 'Pending' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select 
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none"
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
        >
          <option value="CS201">CS201 - Data Structures</option>
          <option value="CS203">CS203 - Database Systems</option>
          <option value="CS205">CS205 - Software Engineering</option>
          <option value="CS207">CS207 - Computer Networks</option>
          <option value="CS206">CS206 - Algorithms</option>
        </select>
        <div className="flex gap-2">
            <button className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600">Export CSV</button>
            <button className="bg-primary-600 px-3 py-1.5 rounded-lg text-xs font-medium text-white">Save All Changes</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider">Reg No</th>
              <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider">Student Name</th>
              <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider">Marks (100)</th>
              <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-3 text-slate-900 font-medium">{row.id}</td>
                <td className="px-4 py-3 text-slate-700">{row.name}</td>
                <td className="px-4 py-3">
                  <input 
                    type="number" 
                    defaultValue={row.marks}
                    placeholder="Enter marks"
                    className="w-20 rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <Badge color={row.status === 'Pending' ? 'yellow' : row.status === 'Review' ? 'red' : 'green'}>
                    {row.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EvaluationModule;