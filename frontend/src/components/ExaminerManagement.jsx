import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserPlus, Calendar as CalendarIcon, Edit2, Trash2, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ExaminerManagement() {
  const [examiners, setExaminers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [modules, setModules] = useState([]);
  
  // New Examiner form
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [dept, setDept] = useState('GENERAL');
  
  // New Schedule form
  const [scheduleModule, setScheduleModule] = useState('');
  const [scheduleExaminer, setScheduleExaminer] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleVenue, setScheduleVenue] = useState('');
  const [editingScheduleId, setEditingScheduleId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [exRes, schRes] = await Promise.all([
        axios.get('http://172.27.208.217:3000/api/admin/examiners'),
        axios.get('http://172.27.208.217:3000/api/admin/exam-schedules')
      ]);
      setExaminers(exRes.data);
      setSchedules(schRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateExaminer = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://172.27.208.217:3000/api/admin/examiners', {
        email, name, departmentId: dept
      });
      toast.success('Examiner created successfully!');
      setEmail(''); setName('');
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create examiner');
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    const isEdit = !!editingScheduleId;
    const toastId = toast.loading(isEdit ? 'Updating schedule...' : 'Creating schedule...');
    try {
      if (isEdit) {
        await axios.put(`http://172.27.208.217:3000/api/admin/exam-schedules/${editingScheduleId}`, {
          moduleCode: scheduleModule,
          examinerEmail: scheduleExaminer,
          date: scheduleDate,
          venue: scheduleVenue
        });
        toast.success('Schedule updated successfully!', { id: toastId });
        setEditingScheduleId(null);
      } else {
        await axios.post('http://172.27.208.217:3000/api/admin/exam-schedules', {
          moduleCode: scheduleModule,
          examinerEmail: scheduleExaminer,
          date: scheduleDate,
          venue: scheduleVenue
        });
        toast.success('Schedule created & Notification sent!', { id: toastId });
      }
      setScheduleModule(''); setScheduleDate(''); setScheduleVenue(''); setScheduleExaminer('');
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.error || (isEdit ? 'Failed to update schedule' : 'Failed to create schedule'), { id: toastId });
    }
  };

  const handleEditSchedule = (sch) => {
    setScheduleModule(sch.moduleCode);
    setScheduleExaminer(sch.examinerEmail);
    const dateObj = new Date(sch.date);
    // Format to YYYY-MM-DDThh:mm for datetime-local input, handling timezone offsets
    const offset = dateObj.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(dateObj - offset)).toISOString().slice(0, 16);
    setScheduleDate(localISOTime);
    setScheduleVenue(sch.venue);
    setEditingScheduleId(sch.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSchedule = async (id) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    const toastId = toast.loading('Deleting schedule...');
    try {
      await axios.delete(`http://172.27.208.217:3000/api/admin/exam-schedules/${id}`);
      toast.success('Schedule deleted successfully!', { id: toastId });
      if (editingScheduleId === id) {
        setEditingScheduleId(null);
        setScheduleModule(''); setScheduleDate(''); setScheduleVenue(''); setScheduleExaminer('');
      }
      fetchData();
    } catch (e) {
      toast.error('Failed to delete schedule', { id: toastId });
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Create Examiner */}
        <Card className="border-brand-gold/20 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg text-brand-900">
              <UserPlus className="text-brand-gold" /> Add New Examiner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateExaminer} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-brand-900/60 uppercase text-xs font-bold">Full Name</Label>
                <Input type="text" required value={name} onChange={e => setName(e.target.value)} className="border-brand-gold/30 focus-visible:ring-brand-gold bg-white" placeholder="Dr. John Doe" />
              </div>
              <div className="space-y-2">
                <Label className="text-brand-900/60 uppercase text-xs font-bold">Email</Label>
                <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="border-brand-gold/30 focus-visible:ring-brand-gold bg-white" placeholder="john@eng.ruh.ac.lk" />
              </div>
              <div className="space-y-2">
                <Label className="text-brand-900/60 uppercase text-xs font-bold">Department</Label>
                <Select value={dept} onValueChange={setDept}>
                  <SelectTrigger className="border-brand-gold/30 bg-brand-white focus:ring-brand-gold">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="COMPUTER">Computer</SelectItem>
                    <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                    <SelectItem value="MECHANICAL">Mechanical</SelectItem>
                    <SelectItem value="CIVIL">Civil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-brand-900 text-brand-white hover:bg-brand-800">
                Create Examiner
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Assign Schedule */}
        <Card className="border-brand-gold/20 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-lg text-brand-900">
                {editingScheduleId ? <Edit2 className="text-amber-600" /> : <CalendarIcon className="text-brand-gold" />}
                {editingScheduleId ? 'Edit Exam Schedule' : 'Assign Exam Schedule'}
              </CardTitle>
              {editingScheduleId && (
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingScheduleId(null);
                    setScheduleModule(''); setScheduleDate(''); setScheduleVenue(''); setScheduleExaminer('');
                  }}
                  className="text-brand-900/40 hover:text-red-500 hover:bg-red-50"
                  title="Cancel Edit"
                >
                  <X size={20} />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-brand-900/60 uppercase text-xs font-bold">Module Code</Label>
                <Input type="text" required value={scheduleModule} onChange={e => setScheduleModule(e.target.value.toUpperCase())} className="border-brand-gold/30 focus-visible:ring-brand-gold bg-white" placeholder="e.g. CE 1101" />
              </div>
              <div className="space-y-2">
                <Label className="text-brand-900/60 uppercase text-xs font-bold">Select Examiner</Label>
                <Select required value={scheduleExaminer} onValueChange={setScheduleExaminer}>
                  <SelectTrigger className="border-brand-gold/30 bg-brand-white focus:ring-brand-gold">
                    <SelectValue placeholder="-- Choose Examiner --" />
                  </SelectTrigger>
                  <SelectContent>
                    {examiners.map(ex => (
                      <SelectItem key={ex.email} value={ex.email}>{ex.name} ({ex.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-brand-900/60 uppercase text-xs font-bold">Date & Time</Label>
                <Input type="datetime-local" required value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="border-brand-gold/30 focus-visible:ring-brand-gold bg-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-brand-900/60 uppercase text-xs font-bold">Venue</Label>
                <Input type="text" required value={scheduleVenue} onChange={e => setScheduleVenue(e.target.value)} className="border-brand-gold/30 focus-visible:ring-brand-gold bg-white" placeholder="e.g. Main Hall A" />
              </div>
              <Button type="submit" className={`w-full text-brand-white ${editingScheduleId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-brand-900 hover:bg-brand-800'}`}>
                {editingScheduleId ? 'Update Schedule' : 'Assign & Notify'}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>

      {/* List Schedules */}
      <Card className="border-brand-gold/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-brand-900">Upcoming Exam Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-brand-gold/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-brand-gold/5">
                <TableRow className="border-brand-gold/20 hover:bg-transparent">
                  <TableHead className="text-brand-900/60">Module</TableHead>
                  <TableHead className="text-brand-900/60">Examiner</TableHead>
                  <TableHead className="text-brand-900/60">Date & Time</TableHead>
                  <TableHead className="text-brand-900/60">Venue</TableHead>
                  <TableHead className="text-brand-900/60 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-brand-white">
                {schedules.map(sch => (
                  <TableRow key={sch.id} className="hover:bg-brand-gold/5 border-brand-gold/10">
                    <TableCell className="font-bold text-brand-800">{sch.moduleCode}</TableCell>
                    <TableCell className="text-brand-900/80">{sch.examiner?.name}</TableCell>
                    <TableCell className="text-brand-900/80">{new Date(sch.date).toLocaleString()}</TableCell>
                    <TableCell className="text-brand-900/80">{sch.venue}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1">
                        <Button 
                          variant="ghost" size="icon" 
                          onClick={() => handleEditSchedule(sch)}
                          className="h-8 w-8 text-brand-900/40 hover:text-brand-900 hover:bg-brand-gold/20"
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          onClick={() => handleDeleteSchedule(sch.id)}
                          className="h-8 w-8 text-brand-900/40 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {schedules.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="h-24 text-center text-brand-900/50">
                      No schedules created yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
