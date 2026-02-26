import React, { useState, useEffect } from 'react';
import { Plus, Book, Layers, Calendar, Trash2 } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modules, setModules] = useState([]);

  // Form States
  const [progForm, setProgForm] = useState({ code: '', name: '', level: 'Undergraduate', semesters: 8 });
  const [modForm, setModForm] = useState({ code: '', title: '', semester: 1, batch: '', credits: 3 });

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgram) fetchModules(selectedProgram._id);
  }, [selectedProgram]);

  const fetchPrograms = async () => {
    const res = await fetch(`${API_BASE}/programs`);
    const data = await res.json();
    setPrograms(data);
  };

  const fetchModules = async (id) => {
    const res = await fetch(`${API_BASE}/programs/${id}/modules`);
    const data = await res.json();
    setModules(data);
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/programs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progForm),
    });
    if (res.ok) {
      setProgForm({ code: '', name: '', level: 'Undergraduate', semesters: 8 });
      fetchPrograms();
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...modForm, programId: selectedProgram._id }),
    });
    if (res.ok) {
      setModForm({ ...modForm, code: '', title: '' }); // keep semester/batch for convenience
      fetchModules(selectedProgram._id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Programs & Modules</h2>
          <p className="text-sm text-slate-500">Manage academic structure and course offerings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Program List & Add Program */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4"><Plus size={16}/> Add New Program</h3>
            <form onSubmit={handleCreateProgram} className="space-y-3">
              <input 
                className="w-full border p-2 rounded-md text-sm" 
                placeholder="Program Code (e.g. BScME)" 
                value={progForm.code}
                onChange={e => setProgForm({...progForm, code: e.target.value})}
                required 
              />
              <input 
                className="w-full border p-2 rounded-md text-sm" 
                placeholder="Program Name" 
                value={progForm.name}
                onChange={e => setProgForm({...progForm, name: e.target.value})}
                required 
              />
              <div className="grid grid-cols-2 gap-2">
                <select 
                  className="border p-2 rounded-md text-sm"
                  value={progForm.level}
                  onChange={e => setProgForm({...progForm, level: e.target.value})}
                >
                  <option>Undergraduate</option>
                  <option>Postgraduate</option>
                </select>
                <input 
                  type="number" 
                  className="border p-2 rounded-md text-sm" 
                  placeholder="Semesters"
                  value={progForm.semesters}
                  onChange={e => setProgForm({...progForm, semesters: e.target.value})}
                />
              </div>
              <button className="w-full bg-slate-900 text-white py-2 rounded-md text-sm font-bold hover:bg-slate-800 transition">
                Create Program
              </button>
            </form>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold">Existing Programs</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {programs.map(p => (
                <button 
                  key={p._id}
                  onClick={() => setSelectedProgram(p)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${selectedProgram?._id === p._id ? 'bg-sky-50 border-r-4 border-sky-500' : ''}`}
                >
                  <div className="font-bold text-slate-900 text-sm">{p.code}</div>
                  <div className="text-xs text-slate-500">{p.name}</div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT: Module Management */}
        <div className="lg:col-span-8">
          {selectedProgram ? (
            <div className="space-y-6">
              {/* Add Module Form */}
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-sky-100 text-sky-600 p-2 rounded-lg"><Book size={20}/></div>
                  <h3 className="font-bold text-lg">Add Module to {selectedProgram.code}</h3>
                </div>
                
                <form onSubmit={handleCreateModule} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Module Code</label>
                    <input className="w-full border p-2 rounded-md text-sm" placeholder="e.g. ME2013" value={modForm.code} onChange={e => setModForm({...modForm, code: e.target.value})} required />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500">Module Title</label>
                    <input className="w-full border p-2 rounded-md text-sm" placeholder="e.g. Thermodynamics I" value={modForm.title} onChange={e => setModForm({...modForm, title: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Semester</label>
                    <input type="number" className="w-full border p-2 rounded-md text-sm" value={modForm.semester} onChange={e => setModForm({...modForm, semester: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Batch / Year</label>
                    <input className="w-full border p-2 rounded-md text-sm" placeholder="e.g. 2022/2023" value={modForm.batch} onChange={e => setModForm({...modForm, batch: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Credits</label>
                    <input type="number" className="w-full border p-2 rounded-md text-sm" value={modForm.credits} onChange={e => setModForm({...modForm, credits: e.target.value})} required />
                  </div>
                  <button className="md:col-span-3 bg-sky-600 text-white py-2.5 rounded-md font-bold text-sm hover:bg-sky-700 transition shadow-md shadow-sky-100">
                    Add Module
                  </button>
                </form>
              </section>

              {/* Module Table */}
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-600">Code</th>
                      <th className="px-4 py-3 font-bold text-slate-600">Title</th>
                      <th className="px-4 py-3 font-bold text-slate-600 text-center">Semester</th>
                      <th className="px-4 py-3 font-bold text-slate-600 text-center">Batch</th>
                      <th className="px-4 py-3 font-bold text-slate-600 text-center">Credits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modules.length > 0 ? modules.map(m => (
                      <tr key={m._id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-bold text-sky-700">{m.code}</td>
                        <td className="px-4 py-3 text-slate-700">{m.title}</td>
                        <td className="px-4 py-3 text-center"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium">Sem {m.semester}</span></td>
                        <td className="px-4 py-3 text-center text-slate-500">{m.batch}</td>
                        <td className="px-4 py-3 text-center font-bold">{m.credits}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-10 text-center text-slate-400 italic">No modules added yet for this program.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <Layers size={48} className="text-slate-300 mb-4" />
              <h3 className="text-slate-900 font-bold text-lg">No Program Selected</h3>
              <p className="text-slate-500 max-w-xs">Select a program from the left sidebar to manage its modules, semesters, and batches.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Programs;