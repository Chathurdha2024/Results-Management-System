import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, GraduationCap, ChevronRight, PlusCircle, LayoutDashboard, Edit2, X, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function GlobalDashboard({ batches, fetchBatches, onBatchSelect }) {
  const [newBatch, setNewBatch] = useState({ name: '', startRegNo: '', endRegNo: '' });
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ open: false, title: '', description: '', onConfirm: null });
  
  const handleSubmitBatch = async (e) => {
    e.preventDefault();
    const isEdit = !!editingBatchId;
    const toastId = toast.loading(isEdit ? 'Updating batch...' : 'Creating batch...');
    
    try {
      const batchData = {
        name: newBatch.name.includes('Batch') ? newBatch.name : `${newBatch.name}th Batch`,
        startRegNo: newBatch.startRegNo,
        endRegNo: newBatch.endRegNo
      };
      
      let res;
      if (isEdit) {
        res = await axios.put(`/api/admin/batches/${editingBatchId}`, batchData);
      } else {
        res = await axios.post('/api/admin/batches', batchData);
      }
      
      if (res.data.newStudentPasswords && res.data.newStudentPasswords.length > 0) {
        const csvContent = "data:text/csv;charset=utf-8,Registration Number,Password\n" 
          + res.data.newStudentPasswords.map(s => `${s.regNo},${s.password}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${res.data.name.replace(/\s+/g, '_')}_Passwords.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Batch ${isEdit ? 'updated' : 'created'}! Passwords downloaded as CSV.`, { id: toastId, duration: 5000 });
      } else {
        toast.success(`Batch ${isEdit ? 'updated' : 'created'} successfully!`, { id: toastId });
      }

      setNewBatch({ name: '', startRegNo: '', endRegNo: '' });
      setEditingBatchId(null);
      fetchBatches();
      
      if (!isEdit) {
        setTimeout(() => {
          onBatchSelect(res.data.id);
        }, 500);
      }
    } catch (e) {
      console.error(e);
      if (e.response && e.response.status === 400 && e.response.data.error) {
        toast.error(e.response.data.error, { id: toastId });
      } else {
        toast.error(`Failed to ${isEdit ? 'update' : 'create'} batch`, { id: toastId });
      }
    }
  };

  const handleEditClick = (e, batch) => {
    e.stopPropagation();
    setNewBatch({
      name: batch.name.replace('th Batch', '').trim(),
      startRegNo: batch.startRegNo,
      endRegNo: batch.endRegNo
    });
    setEditingBatchId(batch.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (e, batch) => {
    e.stopPropagation();
    setAlertConfig({
      open: true,
      title: 'Delete Batch',
      description: `Are you absolutely sure you want to delete ${batch.name}? This will delete all students and their results in this batch!`,
      onConfirm: async () => {
        const toastId = toast.loading('Deleting batch...');
        try {
          await axios.delete(`/api/admin/batches/${batch.id}`);
          fetchBatches();
          if (editingBatchId === batch.id) {
            setEditingBatchId(null);
            setNewBatch({ name: '', startRegNo: '', endRegNo: '' });
          }
          toast.success('Batch deleted successfully!', { id: toastId });
        } catch (error) {
          console.error(error);
          toast.error('Failed to delete batch', { id: toastId });
        }
      }
    });
  };

  const getStudentCount = (start, end) => {
    const sMatch = start.match(/(\d+)$/);
    const eMatch = end.match(/(\d+)$/);
    if (sMatch && eMatch) {
      return parseInt(eMatch[1]) - parseInt(sMatch[1]) + 1;
    }
    return 0;
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-brand-gold" size={32} />
            Super Dashboard
          </h1>
          <p className="text-brand-900/60 mt-2 text-lg">Manage all university batches and administrative configurations.</p>
        </div>
      </div>

      {/* 1. Add/Edit Batch Form */}
      <Card className={`shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-l-4 transition-colors ${editingBatchId ? 'bg-amber-50/50 border-amber-500' : 'bg-brand-white border-brand-800'}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl text-brand-900">
              {editingBatchId ? <Edit2 className="text-amber-600" size={24} /> : <PlusCircle className="text-brand-800" size={24} />}
              {editingBatchId ? 'Edit Batch Details' : 'Create New Batch'}
            </CardTitle>
            {editingBatchId && (
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => { setEditingBatchId(null); setNewBatch({ name: '', startRegNo: '', endRegNo: '' }); }}
                className="text-brand-900/40 hover:text-red-500 hover:bg-red-50"
                title="Cancel Edit"
              >
                <X size={20} />
              </Button>
            )}
          </div>
          <CardDescription className="text-brand-900/60 mt-2">
            {editingBatchId ? 'Update the batch details below. Expanding the registration range will automatically create new student profiles.' : 'Enter the batch number and the registration number range to automatically generate student profiles.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmitBatch} className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full space-y-2">
              <Label className="text-brand-800 font-semibold">Batch no.</Label>
              <Input 
                className="border-brand-gold/30 focus-visible:ring-brand-gold bg-white" 
                placeholder="e.g., 24" 
                value={newBatch.name} 
                onChange={e => setNewBatch({...newBatch, name: e.target.value})} 
                required
              />
            </div>
            <div className="flex-1 w-full space-y-2">
              <Label className="text-brand-800 font-semibold">Reg. no. from</Label>
              <Input 
                className="border-brand-gold/30 focus-visible:ring-brand-gold bg-white" 
                placeholder="e.g., EG/2022/4906" 
                value={newBatch.startRegNo} 
                onChange={e => setNewBatch({...newBatch, startRegNo: e.target.value})} 
                required
              />
            </div>
            <div className="flex-1 w-full space-y-2">
              <Label className="text-brand-800 font-semibold">Reg. no. to</Label>
              <Input 
                className="border-brand-gold/30 focus-visible:ring-brand-gold bg-white" 
                placeholder="e.g., EG/2022/5555" 
                value={newBatch.endRegNo} 
                onChange={e => setNewBatch({...newBatch, endRegNo: e.target.value})} 
                required
              />
            </div>
            <Button 
              type="submit" 
              className={`w-full md:w-auto px-8 font-bold ${
                editingBatchId 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md' 
                  : 'bg-brand-900 hover:bg-brand-800 text-brand-white shadow-md'
              }`}
            >
              {editingBatchId ? 'Update Batch' : 'Create Batch'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 2. Batch Grid */}
      <div>
        <h2 className="text-xl font-bold text-brand-900 mb-6 flex items-center gap-2">
          <GraduationCap className="text-brand-800" size={24} />
          Active Batches
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.length === 0 ? (
            <div className="col-span-full p-12 text-center border-2 border-dashed border-brand-gold/20 rounded-2xl bg-brand-white text-brand-900/50">
              No batches created yet. Use the form above to get started.
            </div>
          ) : (
            batches.map(batch => (
              <Card 
                key={batch.id} 
                onClick={() => onBatchSelect(batch.id)}
                className="group cursor-pointer bg-white border-2 border-transparent hover:border-brand-gold shadow-sm hover:shadow-[0_8px_30px_rgba(245,189,26,0.15)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-800 group-hover:bg-brand-gold transition-colors"></div>
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start pl-2">
                    <CardTitle className="text-2xl font-extrabold text-brand-900 group-hover:text-brand-800 transition-colors">
                      {batch.name}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleEditClick(e, batch)}
                        className="text-brand-900/40 hover:text-brand-900 hover:bg-brand-gold/20"
                        title="Edit Batch"
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteClick(e, batch)}
                        className="text-brand-900/40 hover:text-red-600 hover:bg-red-50"
                        title="Delete Batch"
                      >
                        <Trash2 size={16} />
                      </Button>
                      <div className="p-1.5 bg-brand-gold/10 rounded-lg text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-900 transition-colors ml-1">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 pt-2">
                  <div className="pl-2">
                    <div className="inline-flex items-center gap-2 text-brand-900 text-sm font-bold bg-brand-gold/10 px-3 py-1.5 rounded-lg border border-brand-gold/20">
                      <Users size={16} className="text-brand-gold" />
                      {getStudentCount(batch.startRegNo, batch.endRegNo)} Students
                    </div>
                  </div>
                  
                  <div className="pl-2 pt-4 border-t border-brand-gold/10 flex flex-col gap-1 text-sm">
                    <span className="text-brand-900/50 font-medium tracking-wide text-xs uppercase">Registration Range</span>
                    <span className="text-brand-800 font-bold">{batch.startRegNo} — {batch.endRegNo}</span>
                  </div>
                  {batch.createdAt && (
                    <div className="pl-2 pt-3 flex flex-col gap-1 text-sm">
                      <span className="text-brand-900/50 font-medium tracking-wide text-xs uppercase">Created</span>
                      <span className="text-brand-900/80 font-semibold">{new Date(batch.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={alertConfig.open} onOpenChange={(open) => setAlertConfig(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertConfig.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (alertConfig.onConfirm) alertConfig.onConfirm();
                setAlertConfig(prev => ({ ...prev, open: false }));
              }} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
