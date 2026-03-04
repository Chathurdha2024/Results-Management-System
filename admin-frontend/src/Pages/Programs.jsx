import React, { useState, useEffect } from 'react';
import { Plus, Book, Layers, Calendar, Trash2, Edit2, X } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modules, setModules] = useState([]);

  // Edit Tracking States
  const [editingProgramId, setEditingProgramId] = useState(null);
  const [editingModuleId, setEditingModuleId] = useState(null);

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

  // --- Program Actions ---
  const handleSaveProgram = async (e) => {
    e.preventDefault();
    const method = editingProgramId ? 'PUT' : 'POST';
    const url = editingProgramId ? `${API_BASE}/programs/${editingProgramId}` : `${API_BASE}/programs`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progForm),
    });
    if (res.ok) {
      setProgForm({ code: '', name: '', level: 'Undergraduate', semesters: 8 });
      setEditingProgramId(null);
      fetchPrograms();
    }
  };

  const startEditProgram = (p) => {
    setEditingProgramId(p._id);
    setProgForm({ code: p.code, name: p.name, level: p.level, semesters: p.semesters });
  };

  const handleDeleteProgram = async (id) => {
    if (window.confirm("Are you sure? This will delete the program and all its modules.")) {
      const res = await fetch(`${API_BASE}/programs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedProgram?._id === id) setSelectedProgram(null);
        fetchPrograms();
      }
    }
  };

  // --- Module Actions ---
  const handleSaveModule = async (e) => {
    e.preventDefault();
    const method = editingModuleId ? 'PUT' : 'POST';
    const url = editingModuleId ? `${API_BASE}/modules/${editingModuleId}` : `${API_BASE}/modules`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...modForm, programId: selectedProgram._id }),
    });
    if (res.ok) {
      setModForm({ ...modForm, code: '', title: '' });
      setEditingModuleId(null);
      fetchModules(selectedProgram._id);
    }
  };

  const startEditModule = (m) => {
    setEditingModuleId(m._id);
    setModForm({ code: m.code, title: m.title, semester: m.semester, batch: m.batch, credits: m.credits });
  };

  const handleDeleteModule = async (id) => {
    if (window.confirm("Delete this module?")) {
      const res = await fetch(`${API_BASE}/modules/${id}`, { method: 'DELETE' });
      if (res.ok) fetchModules(selectedProgram._id);
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
        
        {/* LEFT: Program List */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold flex items-center justify-between mb-4">
              <span className="flex items-center gap-2">
                {editingProgramId ? <Edit2 size={16}/> : <Plus size={16}/>} 
                {editingProgramId ? 'Edit Program' : 'Add New Program'}
              </span>
              {editingProgramId && <button onClick={() => setEditingProgramId(null)} className="text-slate-400 hover:text-red-500"><X size={16}/></button>}
            </h3>
            <form onSubmit={handleSaveProgram} className="space-y-3">
              <input className="w-full border p-2 rounded-md text-sm" placeholder="Code" value={progForm.code} onChange={e => setProgForm({...progForm, code: e.target.value})} required />
              <input className="w-full border p-2 rounded-md text-sm" placeholder="Name" value={progForm.name} onChange={e => setProgForm({...progForm, name: e.target.value})} required />
              <div className="grid grid-cols-2 gap-2">
                <select className="border p-2 rounded-md text-sm" value={progForm.level} onChange={e => setProgForm({...progForm, level: e.target.value})}>
                  <option>Undergraduate</option>
                  <option>Postgraduate</option>
                </select>
                <input type="number" className="border p-2 rounded-md text-sm" value={progForm.semesters} onChange={e => setProgForm({...progForm, semesters: e.target.value})} />
              </div>
              <button className={`w-full text-white py-2 rounded-md text-sm font-bold transition ${editingProgramId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                {editingProgramId ? 'Update Program' : 'Create Program'}
              </button>
            </form>
          </section>

          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
    <h3 className="text-sm font-bold">Existing Programs</h3>
  </div>
  <div className="divide-y divide-slate-100">
    {programs.map((p) => (
      <div
        key={p._id}
        className={`group flex items-center pr-2 hover:bg-slate-50 transition-colors ${
          selectedProgram?._id === p._id ? 'bg-sky-50 border-r-4 border-sky-500' : ''
        }`}
      >
        <button onClick={() => setSelectedProgram(p)} className="flex-1 text-left p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">
              {p.level}
            </span>
            <div className="font-bold text-sky-700 text-xs">{p.code}</div>
          </div>
          <div className="font-bold text-slate-900 text-sm mb-1 leading-tight">{p.name}</div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
             <Calendar size={10} /> {p.semesters} Semesters Total
          </div>
        </button>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => startEditProgram(p)} className="p-2 text-slate-400 hover:text-sky-600">
            <Edit2 size={14} />
          </button>
          <button onClick={() => handleDeleteProgram(p._id)} className="p-2 text-slate-400 hover:text-red-600">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    ))}
  </div>
</section>
        </div>

        {/* RIGHT: Module Management */}
        <div className="lg:col-span-8">
          {selectedProgram ? (
            <div className="space-y-6">
              
              <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-100 text-sky-600 p-2 rounded-lg"><Book size={20}/></div>
                    <h3 className="font-bold text-lg">{editingModuleId ? 'Edit Module' : `Add Module to ${selectedProgram.code}`}</h3>
                  </div>
                  {editingModuleId && <button onClick={() => setEditingModuleId(null)} className="text-slate-400 hover:text-red-500 flex items-center gap-1 text-sm"><X size={14}/> Cancel</button>}
                </div>
                
                <form onSubmit={handleSaveModule} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Module Code</label>
                    <input className="w-full border p-2 rounded-md text-sm" value={modForm.code} onChange={e => setModForm({...modForm, code: e.target.value})} required />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500">Module Title</label>
                    <input className="w-full border p-2 rounded-md text-sm" value={modForm.title} onChange={e => setModForm({...modForm, title: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Semester</label>
                    <input type="number" className="w-full border p-2 rounded-md text-sm" value={modForm.semester} onChange={e => setModForm({...modForm, semester: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Batch / Year</label>
                    <input className="w-full border p-2 rounded-md text-sm" value={modForm.batch} onChange={e => setModForm({...modForm, batch: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Credits</label>
                    <input type="number" className="w-full border p-2 rounded-md text-sm" value={modForm.credits} onChange={e => setModForm({...modForm, credits: e.target.value})} required />
                  </div>
                  <button className={`md:col-span-3 text-white py-2.5 rounded-md font-bold text-sm transition shadow-md ${editingModuleId ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100' : 'bg-sky-600 hover:bg-sky-700 shadow-sky-100'}`}>
                    {editingModuleId ? 'Update Module' : 'Add Module'}
                  </button>
                </form>
              </section>

              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-600">Module</th>
                      <th className="px-4 py-3 font-bold text-slate-600 text-center">Semester</th>
                      <th className="px-4 py-3 font-bold text-slate-600 text-center">Batch</th>
                       <th className="px-4 py-3 font-bold text-slate-600 text-center">Credits</th>
                      <th className="px-4 py-3 font-bold text-slate-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modules.map(m => (
                      <tr key={m._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-bold text-sky-700">{m.code}</div>
                  <div className="text-xs text-slate-500">{m.title}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium">Sem {m.semester}</span>
                </td>
                <td className="px-4 py-3 text-center text-slate-500">{m.batch}</td>
                <td className="px-4 py-3 text-center font-bold text-slate-700">
                   {m.credits} {/* Credits Display */}
                </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => startEditModule(m)} className="p-1.5 hover:bg-slate-100 rounded text-sky-600"><Edit2 size={16}/></button>
                            <button onClick={() => handleDeleteModule(m._id)} className="p-1.5 hover:bg-slate-100 rounded text-red-600"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <Layers size={48} className="text-slate-300 mb-4" />
              <h3 className="text-slate-900 font-bold text-lg">No Program Selected</h3>
              <p className="text-slate-500 max-w-xs">Select a program to manage curriculum.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Programs;