import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Trash2, AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';
const VENUES = ['DO1', 'DO2', 'LT1', 'LT2', 'NCC', 'Auditorium'];

function Exams() {
  const [exams, setExams] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [modules, setModules] = useState([]);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    programId: '',
    batch: '',
    moduleId: '',
    date: '',
    session: 'Morning',
    venue: '',
  });

  useEffect(() => {
    fetchExams();
    fetchPrograms();
  }, []);

  // Fetch modules when program is selected
  useEffect(() => {
    if (form.programId) {
      fetch(`${API_BASE}/programs/${form.programId}/modules`)
        .then(res => res.json())
        .then(data => setModules(data));
    } else {
      setModules([]);
    }
  }, [form.programId]);

  const fetchExams = async () => {
    const res = await fetch(`${API_BASE}/exams`);
    const data = await res.json();
    setExams(data);
  };

  const fetchPrograms = async () => {
    const res = await fetch(`${API_BASE}/programs`);
    const data = await res.json();
    setPrograms(data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch(`${API_BASE}/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message);
    } else {
      setForm({ ...form, moduleId: '', venue: '' });
      fetchExams();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this scheduled exam?")) {
      await fetch(`${API_BASE}/exams/${id}`, { method: 'DELETE' });
      fetchExams();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Examination Scheduling</h2>
        <p className="text-sm text-slate-500">Manage timetable and venue allocations.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-3">
        {/* Timetable List */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Official Timetable</h3>
            <span className="text-xs font-medium text-slate-500">{exams.length} Exams Scheduled</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b">
                <tr>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3 text-center">Date & Session</th>
                  <th className="px-4 py-3">Venue</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{exam.moduleId?.code}</div>
                      <div className="text-xs text-slate-500">{exam.moduleId?.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-bold text-sky-700">{exam.programId?.code}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{exam.batch}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="font-medium">{exam.date}</div>
                      <div className={`text-[10px] font-bold uppercase ${exam.session === 'Morning' ? 'text-orange-600' : 'text-purple-600'}`}>
                        {exam.session} ({exam.startTime}-{exam.endTime})
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold flex items-center w-fit gap-1">
                        <MapPin size={12} /> {exam.venue}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(exam._id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm h-fit">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-sky-600" /> New Examination
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Program</label>
              <select name="programId" value={form.programId} onChange={handleChange} required className="w-full border p-2 rounded-md text-sm">
                <option value="">Select Program</option>
                {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Batch</label>
              <input name="batch" placeholder="e.g. 2022/2023" value={form.batch} onChange={handleChange} required className="w-full border p-2 rounded-md text-sm" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Module</label>
              <select name="moduleId" value={form.moduleId} onChange={handleChange} required className="w-full border p-2 rounded-md text-sm" disabled={!modules.length}>
                <option value="">Select Module</option>
                {modules.map(m => <option key={m._id} value={m._id}>{m.code} - {m.title}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} required className="w-full border p-2 rounded-md text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Session</label>
                <select name="session" value={form.session} onChange={handleChange} className="w-full border p-2 rounded-md text-sm">
                  <option value="Morning">Morning (9AM)</option>
                  <option value="Evening">Evening (1PM)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Venue</label>
              <select name="venue" value={form.venue} onChange={handleChange} required className="w-full border p-2 rounded-md text-sm">
                <option value="">Select Venue</option>
                {VENUES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <button type="submit" className="w-full bg-sky-600 text-white py-2 rounded-md font-bold text-sm hover:bg-sky-700 transition flex items-center justify-center gap-2 mt-2">
              <Clock size={16} /> Schedule Exam
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Exams;