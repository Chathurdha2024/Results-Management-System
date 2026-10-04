import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, UploadCloud, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DepartmentAllocation({ batchId, semester }) {
  const [uploading, setUploading] = useState(null);

  if (!semester || semester < 3) return null;

  const departments = [
    { id: 'COMPUTER', name: 'Computer Engineering', color: 'bg-brand-900', lightColor: 'bg-brand-gold/5', textColor: 'text-brand-900', borderColor: 'border-brand-gold/20' },
    { id: 'ELECTRICAL', name: 'Electrical Engineering', color: 'bg-brand-800', lightColor: 'bg-brand-gold/5', textColor: 'text-brand-900', borderColor: 'border-brand-gold/20' },
    { id: 'MECHANICAL', name: 'Mechanical Engineering', color: 'bg-brand-900', lightColor: 'bg-brand-gold/5', textColor: 'text-brand-900', borderColor: 'border-brand-gold/20' },
    { id: 'CIVIL', name: 'Civil Engineering', color: 'bg-brand-800', lightColor: 'bg-brand-gold/5', textColor: 'text-brand-900', borderColor: 'border-brand-gold/20' }
  ];

  const handleFileUpload = async (e, deptId) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const tid = toast.loading(`Assigning students to ${deptId}...`);
    setUploading(deptId);
    
    try {
      const res = await axios.post(`http://localhost:3000/api/admin/batches/${batchId}/departments/${deptId}/upload`, formData);
      toast.success(`Successfully assigned ${res.data.count} students!`, { id: tid });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Allocation failed', { id: tid });
    } finally {
      setUploading(null);
      e.target.value = null; // reset input
    }
  };

  return (
    <Card className="border-brand-gold/20 shadow-sm">
      <CardHeader className="border-b border-brand-gold/10 pb-4">
        <CardTitle className="text-xl text-brand-900 flex items-center gap-2">
          <Users className="text-brand-gold" size={24} /> 
          Department Allocation (Semester 3+)
        </CardTitle>
        <CardDescription className="text-brand-900/60 mt-1">
          Upload a CSV of Registration Numbers to assign students to their specialized departments.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map(dept => (
            <Card key={dept.id} className={`${dept.lightColor} border ${dept.borderColor} relative overflow-hidden group transition-all hover:shadow-md`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${dept.color}`}></div>
              <CardHeader className="p-5 pb-0">
                <CardTitle className={`text-base font-bold ${dept.textColor}`}>{dept.name}</CardTitle>
                <CardDescription className="text-xs text-brand-900/50 h-8 mt-1">
                  Upload CSV containing Registration Numbers.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-4">
                <Button 
                  asChild
                  variant="outline"
                  className="w-full bg-brand-white border-brand-gold/30 text-brand-900 hover:bg-brand-gold/10 hover:border-brand-gold shadow-sm cursor-pointer"
                  disabled={uploading !== null}
                >
                  <label>
                    {uploading === dept.id ? (
                      <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Uploading...</span>
                    ) : (
                      <>
                        <UploadCloud size={16} className="text-brand-gold mr-2" />
                        Upload CSV
                      </>
                    )}
                    <input 
                      type="file" 
                      accept=".csv" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, dept.id)}
                      disabled={uploading !== null}
                    />
                  </label>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
