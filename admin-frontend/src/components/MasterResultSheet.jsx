import { useState, useEffect } from 'react';
import axios from 'axios';
import { Table as TableIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function MasterResultSheet({ batchId, semester, department, refreshTrigger }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (batchId && semester && department) {
      fetchMasterSheet();
    }
  }, [batchId, semester, department, refreshTrigger]);

  const fetchMasterSheet = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/api/admin/batches/${batchId}/semesters/${semester}/departments/${department}/master-sheet`);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-brand-900/50 animate-pulse">Loading master sheet...</div>;
  if (!data || data.modules.length === 0) return null;

  return (
    <Card className="border-brand-gold/20 shadow-sm mt-8">
      <CardHeader className="border-b border-brand-gold/10 pb-4">
        <CardTitle className="text-xl text-brand-900 flex items-center gap-2">
          <TableIcon className="text-brand-gold" size={24} /> 
          Master Result Sheet ({department})
        </CardTitle>
        <CardDescription className="text-brand-900/60 mt-1">
          Full overview of all students and their module grades.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="overflow-x-auto border border-brand-gold/30 rounded-xl shadow-sm bg-brand-white max-h-[600px] overflow-y-auto">
          <Table className="w-full text-left text-sm whitespace-nowrap border-collapse">
            <TableHeader className="bg-brand-gold/5 text-brand-900/80 uppercase text-xs font-bold tracking-wider sticky top-0 z-20 shadow-[0_1px_0_rgba(245,189,26,0.3)]">
              <TableRow className="border-brand-gold/20 hover:bg-transparent">
                <TableHead className="px-4 py-2 border border-brand-gold/20 sticky left-0 bg-brand-gold/10 z-30 font-bold text-brand-900">Reg No</TableHead>
                {data.modules.map(m => (
                  <TableHead key={m.code} className="px-4 py-2 border border-brand-gold/20 bg-brand-gold/5 text-brand-900" title={m.name}>
                    {m.code}
                  </TableHead>
                ))}
                <TableHead className="px-4 py-2 border border-brand-gold/20 bg-brand-gold/10 text-center font-black text-brand-900">SGPA</TableHead>
                <TableHead className="px-4 py-2 border border-brand-gold/20 bg-brand-gold/10 text-center font-black text-brand-900">CGPA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-brand-white">
              {data.pivotData.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={data.modules.length + 3} className="p-8 text-center text-brand-900/50 border border-brand-gold/20">
                    No students found in this department.
                  </TableCell>
                </TableRow>
              )}
              {data.pivotData.map((row, idx) => (
                <TableRow key={row.regNo} className="hover:bg-brand-gold/5 transition-colors group border-brand-gold/10">
                  <TableCell className="px-4 py-2 border border-brand-gold/20 sticky left-0 bg-brand-white group-hover:bg-brand-gold/5 font-mono font-bold text-brand-800 shadow-[1px_0_0_rgba(245,189,26,0.2)] z-10">
                    {row.regNo}
                  </TableCell>
                  {data.modules.map(m => {
                    const grade = row[m.code];
                    const isFail = grade === 'F' || grade === 'E';
                    return (
                      <TableCell 
                        key={m.code} 
                        className={`px-4 py-2 border border-brand-gold/20 text-center font-bold ${isFail ? 'text-red-500 bg-red-50' : 'text-brand-900/80'}`}
                      >
                        {grade}
                      </TableCell>
                    );
                  })}
                  <TableCell className={`px-4 py-2 border border-brand-gold/20 text-center font-bold shadow-inner ${parseFloat(row.sgpa) >= 3.0 ? 'text-green-600 bg-green-50' : parseFloat(row.sgpa) < 2.0 ? 'text-red-600 bg-red-50' : 'text-brand-900 bg-brand-white'}`}>
                    {row.sgpa}
                  </TableCell>
                  <TableCell className={`px-4 py-2 border border-brand-gold/20 text-center font-black shadow-inner ${parseFloat(row.cgpa) >= 3.0 ? 'text-green-600 bg-green-50' : parseFloat(row.cgpa) < 2.0 ? 'text-red-600 bg-red-50' : 'text-brand-900 bg-brand-white'}`}>
                    {row.cgpa}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
