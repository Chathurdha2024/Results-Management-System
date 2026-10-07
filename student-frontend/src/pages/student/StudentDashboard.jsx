import { useState, useEffect } from 'react';
import { GraduationCap, LogOut, BookOpen, User, Building2, Calendar, FileText, ChevronRight, LayoutDashboard, Shield, UserCircle, Settings, Activity, Clock, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import ProfileView from './ProfileView';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSem, setActiveSem] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [schedules, setSchedules] = useState([]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('studentToken');
    if (!token) return;
    try {
      const res = await axios.get('/api/student/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('studentToken');
      if (!token) {
        navigate('/');
        return;
      }
      
      try {
        const [res, schRes] = await Promise.all([
          axios.get('/api/student/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/student/exam-schedules', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setData(res.data);
        setSchedules(schRes.data);
        
        // Select the first semester by default
        const sems = Object.keys(res.data.resultsBySemester).sort((a,b)=>a-b);
        if (sems.length > 0) {
          setActiveSem(sems[0]);
        }
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('studentToken');
          navigate('/');
        } else {
          toast.error('Failed to load dashboard data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    fetchDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    navigate('/');
  };

  const handleEditProfile = () => {
    setActiveSem('PROFILE');
    setMobileMenuOpen(false);
  };

  const handleOpenNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && notifications.some(n => !n.isRead)) {
      try {
        const token = localStorage.getItem('studentToken');
        await axios.post('/api/student/notifications/read', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(notifications.map(n => ({...n, isRead: true})));
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  if (!data) return null;

  const { student, resultsBySemester, sgpaBySemester, cgpa } = data;
  const semesters = Object.keys(resultsBySemester).sort((a, b) => Number(a) - Number(b));

  // Compute recently released results and total completed credits
  const allResults = [];
  let totalCompletedCredits = 0;
  const nonPassingGrades = ['E', 'F', 'AB', '-'];

  Object.values(resultsBySemester).forEach(semResults => {
    semResults.forEach(res => {
      if (res.status === 'RELEASED' && res.releasedAt) {
        allResults.push(res);
        
        // Count credits for passed modules
        const rawGrade = res.grade.replace('*', '').trim().toUpperCase();
        if (!nonPassingGrades.includes(rawGrade)) {
          totalCompletedCredits += res.credits;
        }
      }
    });
  });
  
  // Sort by releasedAt descending (newest first)
  const recentResults = allResults
    .sort((a, b) => new Date(b.releasedAt) - new Date(a.releasedAt))
    .slice(0, 5); // Take top 5

  const timeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + ' year' + (interval === 1 ? '' : 's') + ' ago';
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + ' month' + (interval === 1 ? '' : 's') + ' ago';
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + ' day' + (interval === 1 ? '' : 's') + ' ago';
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + ' hour' + (interval === 1 ? '' : 's') + ' ago';
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + ' min' + (interval === 1 ? '' : 's') + ' ago';
    
    if (seconds < 10) return 'just now';
    return Math.floor(seconds) + ' sec ago';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <aside className={`w-72 md:w-64 bg-brand-900 text-brand-white/80 flex flex-col fixed h-full shadow-2xl z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 bg-brand-900 border-b border-brand-800">
          <div className="flex items-center gap-3">
            <div className="bg-brand-gold p-1.5 rounded-lg shadow-brand-gold/20 shadow-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Ruhuna EngRMS</h1>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          
          {/* Overview Tab */}
          <Button
            variant="ghost"
            onClick={() => {
              setActiveSem('OVERVIEW');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex justify-start items-center gap-3 px-3 py-3 h-auto rounded-xl transition-all duration-200 border mb-2 ${
              activeSem === 'OVERVIEW'
                ? 'bg-brand-800 text-brand-gold border-brand-700 shadow-sm font-bold' 
                : 'border-transparent text-brand-white/70 hover:bg-brand-800/50 hover:text-brand-white'
            }`}
          >
            <Activity size={18} />
            <span className="text-sm">Recent Updates</span>
          </Button>

          {/* Timetable Tab */}
          <Button
            variant="ghost"
            onClick={() => {
              setActiveSem('TIMETABLE');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex justify-start items-center gap-3 px-3 py-3 h-auto rounded-xl transition-all duration-200 border mb-6 ${
              activeSem === 'TIMETABLE'
                ? 'bg-brand-800 text-brand-gold border-brand-700 shadow-sm font-bold' 
                : 'border-transparent text-brand-white/70 hover:bg-brand-800/50 hover:text-brand-white'
            }`}
          >
            <Calendar size={18} />
            <span className="text-sm">Exam Timetable</span>
          </Button>

          <div className="px-2 text-xs font-semibold text-brand-white/50 uppercase tracking-wider mb-2">
            Academic Semesters
          </div>
          
          {semesters.length === 0 ? (
            <p className="text-sm text-brand-white/50 p-4">No semesters available.</p>
          ) : (
            semesters.map(sem => (
              <Button
                key={sem}
                variant="ghost"
                onClick={() => {
                  setActiveSem(sem);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex justify-between items-center px-3 py-3 h-auto rounded-xl transition-all duration-200 border ${
                  activeSem === sem 
                    ? 'bg-brand-800 text-brand-gold border-brand-700 shadow-sm font-bold' 
                    : 'border-transparent text-brand-white/70 hover:bg-brand-800/50 hover:text-brand-white'
                }`}
              >
                <span className="flex items-center gap-3 text-sm">
                  <LayoutDashboard size={18} />
                  Semester {sem}
                </span>
                {activeSem === sem && <ChevronRight size={16} />}
              </Button>
            ))
          )}
        </div>

        {/* User Profile / Logout footer */}
        <div className="p-4 bg-brand-900 border-t border-brand-800 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <UserCircle size={36} className="text-brand-white/50" />
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-brand-white truncate">{student.regNo}</div>
              <div className="text-xs text-brand-white/50 truncate" title={student.department}>{student.department}</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleEditProfile} 
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-brand-800 hover:bg-brand-700 text-brand-white border-brand-700"
            >
              <Settings size={14} /> Profile
            </Button>
            <Button 
              variant="outline"
              onClick={handleLogout} 
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
            >
              <LogOut size={14} /> Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen w-full transition-all duration-300">
        
        {/* Top Header */}
        <header className="h-16 bg-brand-white border-b border-brand-gold/20 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-sm md:shadow-none">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-brand-900/60 hover:text-brand-900 hover:bg-brand-gold/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            
            <h2 className="text-lg font-bold text-brand-900 flex items-center gap-2">
              <BookOpen size={20} className="text-brand-gold" />
              {activeSem === 'OVERVIEW' ? 'Dashboard Overview' : activeSem === 'TIMETABLE' ? 'Exam Timetable' : activeSem === 'PROFILE' ? 'Profile' : `Semester ${activeSem} Results`}
            </h2>
          </div>
          
          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <button 
                onClick={handleOpenNotifications}
                className="p-2 text-brand-900/60 hover:text-brand-900 hover:bg-brand-gold/10 rounded-full transition-colors relative"
              >
                <Bell size={20} />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-brand-white rounded-full"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-brand-white rounded-2xl shadow-xl border border-brand-gold/20 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 bg-brand-gold/5 border-b border-brand-gold/10 flex justify-between items-center">
                    <h3 className="font-bold text-brand-900 text-sm">Notifications</h3>
                    <span className="text-xs font-bold text-brand-900/50 bg-brand-gold/20 px-2 py-0.5 rounded-full">{notifications.length}</span>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto divide-y divide-brand-gold/5">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-brand-900/50 font-medium">No notifications yet.</div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className={`p-4 transition-colors ${notif.isRead ? 'bg-transparent' : 'bg-brand-gold/5'}`}>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-bold text-brand-900">{notif.title}</h4>
                            <span className="text-[10px] font-bold text-brand-900/40 uppercase whitespace-nowrap ml-2">
                              {timeAgo(notif.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-brand-900/70">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="hidden sm:flex items-center gap-4">
              <span className="text-sm font-medium text-brand-900 bg-brand-gold/10 px-4 py-1.5 rounded-full border border-brand-gold/20 shadow-sm">
                Student Portal
              </span>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50">
          
          {activeSem === 'PROFILE' ? (
            <ProfileView
              onNotificationSettingChange={(enabled) => {
                if (enabled) fetchNotifications();
                else setNotifications([]);
              }}
            />
          ) : activeSem === 'OVERVIEW' ? (
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* CGPA Summary Card */}
              <div className="mb-8 bg-gradient-to-br from-brand-900 to-brand-800 rounded-3xl p-6 sm:p-8 shadow-xl text-brand-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-brand-white/70 font-bold uppercase tracking-wider text-sm mb-1">Cumulative GPA</h3>
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 sm:gap-6 mt-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-brand-gold">{cgpa !== null ? cgpa : 'N/A'}</span>
                        <span className="text-brand-white/50 font-medium">/ 4.00</span>
                      </div>
                      <div className="hidden sm:block w-px h-8 bg-brand-white/20"></div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-brand-white/50 uppercase tracking-wider">Completed Credits</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-bold text-white">{totalCompletedCredits}</span>
                          <span className="text-brand-white/50 text-sm">/ 150</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-brand-white/60 mt-3">Calculated using officially published results only.</p>
                  </div>
                  <div className="bg-brand-white/5 border border-brand-white/10 rounded-2xl p-4 backdrop-blur-sm hidden sm:block">
                    <Activity className="h-12 w-12 text-brand-gold/80" />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-brand-900 tracking-tight">Recently Released Results</h3>
                <p className="text-brand-900/60 mt-1">Keep track of the newest grades published by your department.</p>
              </div>

              {recentResults.length === 0 ? (
                <Card className="border-brand-gold/20 p-12 text-center shadow-sm">
                  <Clock className="h-12 w-12 text-brand-900/20 mx-auto mb-4" />
                  <CardTitle className="text-lg text-brand-900">No Recent Results</CardTitle>
                  <CardContent className="mt-2 text-brand-900/60 p-0">No results have been published for you yet.</CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {recentResults.map(res => (
                    <Card key={res.code} className="border-brand-gold/20 shadow-sm hover:border-brand-gold/40 transition-colors">
                      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-0.5 rounded text-xs font-black bg-brand-900/10 text-brand-900">
                              {res.code}
                            </span>
                            <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-100 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              New
                            </Badge>
                            {res.isRepeat && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                Repeat
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-brand-900">{res.name}</h4>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-brand-900/50">
                            <Clock size={12} />
                            Released {timeAgo(res.releasedAt)}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 sm:pl-6 sm:border-l border-brand-gold/10">
                          <div className="text-center">
                            <div className="text-[10px] font-bold text-brand-900/50 uppercase tracking-wider mb-0.5">Credits</div>
                            <div className="text-sm font-bold text-brand-900">{res.credits}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] font-bold text-brand-900/50 uppercase tracking-wider mb-0.5">Grade</div>
                            <div className="text-2xl font-black text-brand-900 leading-none">
                              {res.isRepeat && res.previousGrade && (
                                <del className="text-brand-900/40 text-lg mr-2">{res.previousGrade}</del>
                              )}
                              {res.grade}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : activeSem === 'TIMETABLE' ? (
            <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-brand-900 tracking-tight">Your Exam Timetable</h3>
                  <p className="text-brand-900/60 mt-1">Schedules for your department modules and common modules.</p>
                </div>
                <div className="bg-brand-gold/10 px-4 py-2 rounded-xl border border-brand-gold/20 flex items-center gap-2">
                  <Calendar size={18} className="text-brand-gold" />
                  <span className="text-sm font-bold text-brand-900">{schedules.length} Exams</span>
                </div>
              </div>

              {schedules.length === 0 ? (
                <Card className="border-brand-gold/20 p-12 text-center shadow-sm">
                  <Calendar className="h-12 w-12 text-brand-900/20 mx-auto mb-4" />
                  <CardTitle className="text-lg text-brand-900">No Exams Scheduled</CardTitle>
                  <CardContent className="mt-2 text-brand-900/60 p-0">There are no upcoming exams scheduled for your modules.</CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {schedules.map(sch => {
                    const dateObj = new Date(sch.date);
                    return (
                      <Card key={sch.id} className="border-brand-gold/20 shadow-sm hover:border-brand-gold transition-colors overflow-hidden group">
                        <div className="h-2 bg-brand-900 group-hover:bg-brand-gold transition-colors"></div>
                        <CardHeader className="pb-3 pt-5 border-b border-slate-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge variant="outline" className="mb-2 bg-brand-gold/10 text-brand-900 border-brand-gold/20 font-black tracking-wide">
                                {sch.module.code}
                              </Badge>
                              <CardTitle className="text-brand-900 text-lg leading-tight line-clamp-2">
                                {sch.module.name}
                              </CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-slate-100 p-2 rounded-lg mt-0.5">
                              <Calendar size={16} className="text-brand-900/70" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-brand-900/50 uppercase tracking-wider mb-0.5">Date & Time</p>
                              <p className="text-brand-900 font-bold">{dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                              <p className="text-brand-900/70 text-sm font-medium">{dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-slate-100 p-2 rounded-lg mt-0.5">
                              <Building2 size={16} className="text-brand-900/70" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-brand-900/50 uppercase tracking-wider mb-0.5">Venue</p>
                              <p className="text-brand-900 font-bold">{sch.venue}</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                             <span className="text-[10px] font-bold text-brand-900/40 uppercase">Semester {sch.module.semester}</span>
                             <span className="text-[10px] font-bold text-brand-900/40 uppercase">{sch.module.type}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          ) : !activeSem ? (
            <div className="bg-brand-white rounded-2xl border border-brand-gold/20 p-12 text-center shadow-sm animate-in fade-in duration-500">
              <FileText className="h-12 w-12 text-brand-900/20 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-brand-900">No Modules Found</h4>
              <p className="text-brand-900/60 mt-2">You don't have any modules assigned for your department yet.</p>
            </div>
          ) : (
            <div 
              key={activeSem} 
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              {/* SGPA Compact Card */}
              <div className="mb-6 inline-flex bg-brand-white rounded-2xl shadow-sm border border-brand-gold/20 p-4 items-center gap-6">
                <div>
                  <div className="text-[10px] font-bold text-brand-900/50 uppercase tracking-wider mb-0.5">Semester {activeSem} GPA</div>
                  <div className={`text-2xl font-black leading-none ${
                    sgpaBySemester[activeSem] !== null
                      ? parseFloat(sgpaBySemester[activeSem]) >= 3.0 ? 'text-emerald-600' : parseFloat(sgpaBySemester[activeSem]) < 2.0 ? 'text-red-600' : 'text-brand-900'
                      : 'text-brand-900/30'
                  }`}>
                    {sgpaBySemester[activeSem] !== null ? sgpaBySemester[activeSem] : 'N/A'}
                  </div>
                </div>
                <div className="w-px h-8 bg-brand-gold/20"></div>
                <div>
                  <div className="text-[10px] font-bold text-brand-900/50 uppercase tracking-wider mb-0.5">Total Credits</div>
                  <div className="text-lg font-bold text-brand-900 leading-none">
                    {resultsBySemester[activeSem].reduce((sum, res) => sum + res.credits, 0)}
                  </div>
                </div>
              </div>

              <Card className="shadow-sm border-brand-gold/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table className="w-full text-left border-collapse">
                    <TableHeader>
                      <TableRow className="bg-brand-gold/5 text-xs uppercase tracking-wider text-brand-900/60 font-bold border-b border-brand-gold/10 hover:bg-brand-gold/5">
                        <TableHead className="font-semibold text-brand-900">Module Code</TableHead>
                        <TableHead className="font-semibold text-brand-900">Module Name</TableHead>
                        <TableHead className="font-semibold text-brand-900 text-center">Credits</TableHead>
                        <TableHead className="font-semibold text-brand-900">Type</TableHead>
                        <TableHead className="font-semibold text-brand-900 text-center">Status</TableHead>
                        <TableHead className="font-semibold text-brand-900 text-center">Grade</TableHead>
                        <TableHead className="font-semibold text-brand-900 text-right">Released</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-brand-gold/10">
                      {resultsBySemester[activeSem].map((res) => (
                        <TableRow key={res.code} className="hover:bg-brand-gold/5 transition-colors border-brand-gold/10">
                          <TableCell className="whitespace-nowrap font-bold text-brand-900">
                            {res.code}
                            {res.isRepeat && (
                              <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                                Repeat
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-brand-900/80">
                            {res.name}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-center font-medium text-brand-900/70">
                            {res.credits}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className={`${
                              res.type === 'CORE' 
                                ? 'bg-brand-900/10 text-brand-900 border-brand-900/20' 
                                : 'bg-brand-gold/20 text-brand-900 border-brand-gold/30'
                            }`}>
                              {res.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-center">
                            {res.status === 'RELEASED' ? (
                              <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                Released
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-center">
                            <span className={`text-xl font-black ${res.grade === '-' ? 'text-brand-900/30' : 'text-brand-900'}`}>
                              {res.isRepeat && res.previousGrade && (
                                <del className="text-brand-900/40 text-base mr-2">{res.previousGrade}</del>
                              )}
                              {res.grade}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right text-xs font-medium text-brand-900/50">
                            {res.status === 'RELEASED' ? timeAgo(res.releasedAt) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
