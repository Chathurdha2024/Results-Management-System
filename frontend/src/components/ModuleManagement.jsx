import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Trash2, FileSpreadsheet, Book, Search, Edit2, X } from 'lucide-react';
import ResultUploadModal from './ResultUploadModal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

export default function ModuleManagement({ batchId, semester, department, highlightedModuleCode, setHighlightedModuleCode, onRefresh }) {
  const [modules, setModules] = useState([]);
  const [newModule, setNewModule] = useState({ code: '', name: '', type: 'CORE', isGpa: true });
  const [activeModuleCode, setActiveModuleCode] = useState(null);
  const [editingModuleCode, setEditingModuleCode] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ open: false, title: '', description: '', onConfirm: null });

  useEffect(() => {
    fetchModules();
  }, [semester, department, batchId]);

  const fetchModules = async () => {
    try {
      const res = await axios.get(`/api/admin/modules/${semester}/departments/${department}${batchId ? `?batchId=${batchId}` : ''}`);
      setModules(res.data);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddOrUpdateModule = async (e) => {
    e.preventDefault();
    const formattedCode = newModule.code.trim().toUpperCase().replace(/^([A-Z]+)\s*(\d+)$/, '$1 $2');
    
    if (!editingModuleCode) {
      const match = formattedCode.match(/^[A-Z]+\s*(\d)\d*$/);
      if (match) {
        const codeSemester = parseInt(match[1], 10);
        if (codeSemester !== Number(semester)) {
          toast.error(`Semester mismatch! The code '${formattedCode}' belongs to Semester ${codeSemester}, but you are trying to add it to Semester ${semester}.`);
          return;
        }
      }
    }

    const tid = toast.loading(editingModuleCode ? 'Updating module...' : 'Adding module...');
    try {
      if (editingModuleCode) {
        await axios.put(`/api/admin/modules/${editingModuleCode}`, { 
          name: newModule.name, type: newModule.type, department, isGpa: newModule.isGpa 
        });
        toast.success('Module updated', { id: tid });
        setEditingModuleCode(null);
      } else {
        await axios.post('/api/admin/modules', { ...newModule, code: formattedCode, semester, department });
        toast.success('Module added', { id: tid });
      }
      setNewModule({ code: '', name: '', type: 'CORE', isGpa: true });
      fetchModules();
    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data?.error || (editingModuleCode ? 'Failed to update module' : 'Failed to add module');
      toast.error(errorMsg, { id: tid });
    }
  };

  const handleDeleteModule = (code) => {
    setAlertConfig({
      open: true,
      title: 'Delete Module',
      description: 'Are you sure you want to delete this module and all its results?',
      onConfirm: async () => {
        const tid = toast.loading('Deleting...');
        try {
          await axios.delete(`/api/admin/modules/${encodeURIComponent(code)}`);
          toast.success('Module deleted', { id: tid });
          fetchModules();
        } catch (e) {
          console.error(e);
          toast.error('Failed to delete module', { id: tid });
        }
      }
    });
  };

  const handleEditClick = (m) => {
    setNewModule({ code: m.code, name: m.name, type: m.type, isGpa: m.isGpa ?? true });
    setEditingModuleCode(m.code);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setNewModule({ code: '', name: '', type: 'CORE', isGpa: true });
    setEditingModuleCode(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="outline" className="bg-brand-900/10 text-brand-900 border-brand-900/20 gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-900"></span> Published</Badge>;
      case 'DRAFT':
        return <Badge variant="outline" className="bg-brand-gold/20 text-brand-900 border-brand-gold/40 gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-gold"></span> Draft</Badge>;
      default:
        return <Badge variant="outline" className="bg-brand-gold/5 text-brand-900/60 border-brand-gold/10 gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-gold/30"></span> No Results</Badge>;
    }
  };

  return (
    <Card className="border-brand-gold/20 shadow-sm">
      <CardHeader className="border-b border-brand-gold/10 pb-4">
        <CardTitle className="text-xl text-brand-900 flex items-center gap-2">
          <Book className="text-brand-gold" size={24} /> 
          Modules for Semester {semester} ({department})
        </CardTitle>
        <CardDescription className="text-brand-900/60">
          Manage core and elective subjects and check result publication status.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleAddOrUpdateModule} className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 p-4 rounded-xl border transition-colors ${editingModuleCode ? 'bg-brand-gold/10 border-brand-gold/40' : 'bg-brand-gold/5 border-brand-gold/20'}`}>
          <div className="lg:col-span-6 flex items-center justify-between mb-2 border-b border-brand-gold/10 pb-2">
            <span className="text-sm font-bold text-brand-900">
              {editingModuleCode ? 'Edit Module Details' : 'Add New Module to this Semester'}
            </span>
          </div>
          <Input 
            placeholder="Code (e.g. EE 3201)" 
            className="lg:col-span-1 border-brand-gold/30 focus-visible:ring-brand-gold bg-white"
            value={newModule.code} onChange={e => setNewModule({...newModule, code: e.target.value.toUpperCase()})} required
            disabled={!!editingModuleCode}
          />
          <Input 
            placeholder="Module Name" 
            className="lg:col-span-2 border-brand-gold/30 focus-visible:ring-brand-gold bg-white"
            value={newModule.name} onChange={e => setNewModule({...newModule, name: e.target.value})} required
          />
          
          <Select value={newModule.type} onValueChange={(v) => setNewModule({...newModule, type: v})}>
            <SelectTrigger className="lg:col-span-1 border-brand-gold/30 bg-brand-white focus:ring-brand-gold">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CORE">Core</SelectItem>
              <SelectItem value="ELECTIVE">Elective</SelectItem>
            </SelectContent>
          </Select>

          <Select value={newModule.isGpa ? "GPA" : "GPA/NGPA"} onValueChange={(v) => setNewModule({...newModule, isGpa: v === "GPA"})}>
            <SelectTrigger className="lg:col-span-1 border-brand-gold/30 bg-brand-white focus:ring-brand-gold">
              <SelectValue placeholder="GPA Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GPA">GPA</SelectItem>
              <SelectItem value="GPA/NGPA">GPA/NGPA</SelectItem>
            </SelectContent>
          </Select>

          <div className="lg:col-span-1 flex gap-2">
            <Button type="submit" className={`flex-1 ${editingModuleCode ? 'bg-brand-gold hover:bg-yellow-400 text-brand-900' : 'bg-brand-900 text-brand-white hover:bg-brand-800'}`}>
              {editingModuleCode ? 'Update' : 'Add Module'}
            </Button>
            {editingModuleCode && (
              <Button type="button" variant="ghost" onClick={handleCancelEdit} className="px-3 text-brand-900/60 hover:bg-brand-gold/20 hover:text-brand-900" title="Cancel Edit">
                <X size={20} />
              </Button>
            )}
          </div>
        </form>

        <div className="rounded-xl border border-brand-gold/20 overflow-hidden">
          <Table>
            <TableHeader className="bg-brand-gold/5">
              <TableRow className="border-brand-gold/20 hover:bg-transparent">
                <TableHead className="text-brand-900/60">Code</TableHead>
                <TableHead className="text-brand-900/60">Name</TableHead>
                <TableHead className="text-brand-900/60">Type</TableHead>
                <TableHead className="text-brand-900/60">Category</TableHead>
                <TableHead className="text-brand-900/60">Results Status</TableHead>
                <TableHead className="text-right text-brand-900/60">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-brand-white">
              {modules.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-brand-900/40">
                      <Search size={40} className="mb-3 opacity-20" />
                      <p className="text-base font-medium text-brand-900/60">No modules found</p>
                      <p className="text-sm">Use the form above to add modules to this semester.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {modules.map(m => (
                <TableRow 
                  key={m.code} 
                  className={`border-brand-gold/10 transition-colors ${
                    highlightedModuleCode === m.code 
                      ? 'bg-brand-gold/10 border-brand-gold shadow-[inset_4px_0_0_0_#f5bd1a] hover:bg-brand-gold/10' 
                      : 'hover:bg-brand-gold/5'
                  }`}
                >
                  <TableCell className="font-mono font-medium text-brand-800">{m.code}</TableCell>
                  <TableCell className="text-brand-800 font-medium">{m.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`${m.type === 'CORE' ? 'bg-brand-900/10 text-brand-900 hover:bg-brand-900/10' : 'bg-brand-gold/20 text-brand-800 hover:bg-brand-gold/20'}`}>
                      {m.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`${m.isGpa !== false ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 'bg-gray-200 text-gray-800 hover:bg-gray-200'}`}>
                      {m.isGpa !== false ? 'GPA' : 'GPA/NGPA'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(m.status)}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveModuleCode(m.code)}
                      className="bg-brand-gold/10 text-brand-900 border-brand-gold/30 hover:bg-brand-gold hover:text-brand-900"
                    >
                      <FileSpreadsheet size={16} className="mr-2 hidden sm:block" /> Results
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(m)}
                      className="text-brand-900/40 hover:bg-brand-gold/20 hover:text-brand-900"
                    >
                      <Edit2 size={18} />
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteModule(m.code)}
                      className="text-brand-900/40 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {activeModuleCode && (
          <ResultUploadModal 
            batchId={batchId}
            moduleCode={activeModuleCode} 
            department={department}
            onClose={() => {
              setActiveModuleCode(null);
              fetchModules();
            }} 
          />
        )}
      </CardContent>

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
    </Card>
  );
}
