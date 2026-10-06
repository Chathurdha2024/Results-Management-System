import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X, UploadCloud, CheckCircle, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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

export default function ResultUploadModal({ batchId, moduleCode, department, onClose }) {
  const [results, setResults] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRepeatUpload, setIsRepeatUpload] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ open: false, title: '', description: '', onConfirm: null, isSuccessOnly: false });

  useEffect(() => {
    fetchResults();
  }, [moduleCode, batchId, department]);

  const fetchResults = async () => {
    try {
      const res = await axios.get(`/api/admin/modules/${encodeURIComponent(moduleCode)}/results${department ? `?department=${department}` : ''}`);
      // Filter results to only show students from the currently active batch
      const filteredResults = batchId 
        ? res.data.filter(r => r.student && r.student.batchId === batchId)
        : res.data;
      setResults(filteredResults);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await axios.post(`/api/admin/modules/${encodeURIComponent(moduleCode)}/results/upload?batchId=${batchId}&isRepeatUpload=${isRepeatUpload}`, formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setAlertConfig({
          open: true,
          title: 'Upload Successful',
          description: 'The result sheet has been uploaded and processed successfully.',
          isSuccessOnly: true,
          onConfirm: () => setAlertConfig(prev => ({ ...prev, open: false }))
        });
        setFile(null);
        setUploadProgress(0);
        fetchResults();
        setUploading(false);
      }, 500);
    } catch (e) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setUploading(false);
      console.error(e);
      toast.error(e.response?.data?.error || 'Upload failed. Check CSV format.');
    }
  };

  const handlePublish = async () => {
    setAlertConfig({
      open: true,
      title: 'Publish Results',
      description: 'Are you sure you want to publish these results to students?',
      onConfirm: async () => {
        const tid = toast.loading('Publishing...');
        try {
          await axios.post(`/api/admin/modules/${encodeURIComponent(moduleCode)}/results/publish`);
          toast.success('Results published!', { id: tid });
          fetchResults();
        } catch (e) {
          console.error(e);
          toast.error('Publish failed', { id: tid });
        }
      }
    });
  };

  const handleUnpublish = async () => {
    setAlertConfig({
      open: true,
      title: 'Unpublish Results',
      description: 'Are you sure you want to unpublish these results? They will be hidden from students.',
      onConfirm: async () => {
        const tid = toast.loading('Unpublishing...');
        try {
          await axios.post(`/api/admin/modules/${encodeURIComponent(moduleCode)}/results/unpublish`);
          toast.success('Results unpublished!', { id: tid });
          fetchResults();
        } catch (e) {
          console.error(e);
          toast.error('Unpublish failed', { id: tid });
        }
      }
    });
  };

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-xl max-w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden bg-brand-white border-brand-gold/30 p-0 shadow-2xl">
        <DialogHeader className="bg-brand-900 px-6 py-5 border-b border-brand-800 text-left m-0">
          <DialogTitle className="text-xl font-bold text-brand-white tracking-tight">Manage Results: {moduleCode}</DialogTitle>
          <DialogDescription className="text-sm font-medium text-brand-gold mt-1">
            Upload and publish student grades
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <form onSubmit={handleUpload} className="mb-8 relative group">
            <div className="absolute inset-0 bg-brand-gold/5 rounded-2xl border-2 border-dashed border-brand-gold/30 transition-colors group-hover:bg-brand-gold/10 group-hover:border-brand-gold/60"></div>
            <div className="relative p-10 flex flex-col items-center justify-center text-center">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-brand-gold/20">
                <UploadCloud size={40} className="text-brand-900" />
              </div>
              <h4 className="text-lg font-bold text-brand-900 mb-2">Upload CSV Result Sheet</h4>
              <p className="text-sm text-brand-900/60 mb-6 max-w-md">
                Ensure your file has <code className="bg-brand-gold/20 px-1.5 py-0.5 rounded text-brand-900 font-mono border border-brand-gold/30">RegisterNo</code> and <code className="bg-brand-gold/20 px-1.5 py-0.5 rounded text-brand-900 font-mono border border-brand-gold/30">Grade</code> columns.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md bg-brand-white p-2 rounded-xl shadow-sm border border-brand-gold/20">
                <Input 
                  type="file" 
                  accept=".csv"
                  onChange={e => setFile(e.target.files[0])}
                  className="flex-1 cursor-pointer border-brand-gold/30"
                />
                <Button 
                  type="submit" 
                  disabled={!file || uploading}
                  className="bg-brand-gold text-brand-900 font-extrabold hover:bg-yellow-400"
                >
                  <Download size={18} className="mr-2" />
                  {uploading ? 'Importing...' : 'Import Data'}
                </Button>
              </div>

              {uploading && (
                <div className="w-full max-w-md mt-6">
                  <div className="flex justify-between text-xs text-brand-900/70 font-bold mb-1">
                    <span>Processing Data</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-brand-gold/20 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-brand-900 h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <label className="flex items-center gap-2 mt-4 text-sm font-bold text-brand-900 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isRepeatUpload}
                  onChange={e => setIsRepeatUpload(e.target.checked)}
                  className="w-4 h-4 text-brand-900 border-brand-gold/40 rounded focus:ring-brand-900"
                />
                This is a Repeat Results Sheet
              </label>
            </div>
          </form>

          {results.length > 0 && (
            <div className="bg-brand-white p-6 rounded-2xl shadow-sm border border-brand-gold/30">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                <div>
                  <h4 className="text-lg font-bold text-brand-900">Preview Results</h4>
                  <p className="text-sm text-brand-900/60 font-medium mt-1">{results.length} student records found</p>
                </div>
                <div className="flex gap-2">
                  {results.some(r => r.isPublished) && (
                    <button 
                      onClick={handleUnpublish}
                      className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 flex items-center gap-2 transition-all font-bold shadow-sm border border-red-200"
                    >
                      <X size={18} /> 
                      Unpublish
                    </button>
                  )}
                  <button 
                    onClick={handlePublish}
                    disabled={results.every(r => r.isPublished)}
                    className="px-5 py-2.5 bg-brand-900 text-brand-gold rounded-xl hover:bg-brand-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-md hover:shadow-lg border border-brand-gold/30"
                  >
                    <CheckCircle size={18} /> 
                    {results.every(r => r.isPublished) ? 'All Published' : 'Publish to Students'}
                  </button>
                </div>
              </div>
              
              <div className="border border-brand-gold/20 rounded-xl max-h-[40vh] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-brand-gold/5 sticky top-0 border-b border-brand-gold/20 shadow-sm z-10">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-brand-900">Registration No</TableHead>
                      <TableHead className="font-semibold text-brand-900">Grade</TableHead>
                      <TableHead className="font-semibold text-brand-900 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-brand-white">
                    {results.map(r => (
                      <TableRow key={r.studentRegNo} className="hover:bg-brand-gold/5 transition-colors border-brand-gold/10">
                        <TableCell className="font-mono font-medium text-brand-900/80">{r.studentRegNo}</TableCell>
                        <TableCell className="font-bold text-brand-900 text-lg">
                          {r.isRepeat && r.previousGrade && (
                            <del className="text-brand-900/40 text-sm mr-2">{r.previousGrade}</del>
                          )}
                          {r.grade}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {r.isRepeat && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                Repeat
                              </Badge>
                            )}
                            {r.isPublished ? 
                              <Badge variant="outline" className="bg-brand-900/10 text-brand-900 border-brand-900/20">
                                <CheckCircle size={12} className="mr-1" /> Published
                              </Badge> : 
                              <Badge variant="outline" className="bg-brand-gold/10 text-brand-900/60 border-brand-gold/20">
                                Draft
                              </Badge>
                            }
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      <AlertDialog open={alertConfig.open} onOpenChange={(open) => setAlertConfig(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertConfig.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {!alertConfig.isSuccessOnly && (
              <AlertDialogCancel onClick={() => setAlertConfig(prev => ({ ...prev, open: false }))}>
                Cancel
              </AlertDialogCancel>
            )}
            <AlertDialogAction 
              onClick={() => {
                if (alertConfig.onConfirm) alertConfig.onConfirm();
                setAlertConfig(prev => ({ ...prev, open: false, isSuccessOnly: false }));
              }}
            >
              {alertConfig.isSuccessOnly ? 'OK' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
