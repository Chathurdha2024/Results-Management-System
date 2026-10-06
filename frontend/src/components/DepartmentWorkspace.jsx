import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, UploadCloud, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DepartmentWorkspace({ batchId, semester, department }) {
  const [uploading, setUploading] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    if (batchId && department) {
      axios.get(`http://54.198.25.194:3000/api/admin/batches/${batchId}/departments/${department}/stats`)
        .then(res => {
          if (res.data.studentCount > 0) {
            setHasUploaded(true);
            setStudentCount(res.data.studentCount);
          } else {
            setHasUploaded(false);
            setStudentCount(0);
          }
        })
        .catch(console.error);
    }
  }, [batchId, department]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const tid = toast.loading(`Assigning students to ${department}...`);
    setUploading(true);
    
    try {
      const res = await axios.post(`http://54.198.25.194:3000/api/admin/batches/${batchId}/departments/${department}/upload`, formData);
      toast.success(`Successfully assigned ${res.data.count} students!`, { id: tid });
      setHasUploaded(true);
      setStudentCount(res.data.count);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Allocation failed', { id: tid });
    } finally {
      setUploading(false);
      e.target.value = null; // reset input
    }
  };

  return (
    <Card className="bg-brand-gold/10 border-brand-gold/30 shadow-sm">
      <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-brand-900 flex items-center gap-2">
            <Users className="text-brand-gold" size={20} />
            Student Allocation ({department})
          </h3>
          <p className="text-sm text-brand-900/70 mt-1 max-w-lg">
            Upload a CSV containing the Registration Numbers (e.g., EG_2022_4904) of the students who have selected the {department} department.
          </p>
        </div>

        <Button 
          asChild 
          variant={hasUploaded ? 'outline' : 'default'} 
          className={`cursor-pointer shrink-0 ${hasUploaded ? 'bg-brand-900/10 border-brand-900/20 text-brand-900 hover:bg-brand-900 hover:text-brand-white' : 'bg-brand-white border-brand-gold/30 text-brand-900 hover:bg-brand-gold hover:text-brand-900'}`}
          disabled={uploading}
        >
          <label className="flex items-center justify-center w-full h-full cursor-pointer">
            {uploading ? (
              <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> Uploading...</span>
            ) : hasUploaded ? (
              <span className="flex items-center justify-center">
                <CheckCircle size={18} className="mr-2" />
                Uploaded ({studentCount}) • Change File
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <UploadCloud size={18} className="mr-2" />
                Upload CSV (Reg Nos)
              </span>
            )}
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </Button>
      </CardContent>
    </Card>
  );
}
