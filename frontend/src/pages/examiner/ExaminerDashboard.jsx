import { useState, useEffect } from 'react';
import { GraduationCap, LogOut, Calendar, MapPin, Bell, Settings, User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ExaminerDashboard() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [profileData, setProfileData] = useState({ name: '', password: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', description: '' });

  useEffect(() => {
    const token = localStorage.getItem('examinerToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData(token);
  }, [navigate]);

  const fetchData = async (token) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [schRes, notRes, profRes] = await Promise.all([
        axios.get('/api/examiner/schedules', { headers }),
        axios.get('/api/examiner/notifications', { headers }),
        axios.get('/api/examiner/profile', { headers })
      ]);
      setSchedules(schRes.data);
      setNotifications(notRes.data);
      setProfile(profRes.data);
      setProfileData(prev => ({ ...prev, name: profRes.data.name }));
    } catch (e) {
      console.error(e);
      if (e.response?.status === 401 || e.response?.status === 403) {
        localStorage.removeItem('examinerToken');
        navigate('/login');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('examinerToken');
    navigate('/login');
  };

  const markNotificationsRead = async () => {
    const token = localStorage.getItem('examinerToken');
    if (!token) return;
    try {
      await axios.post('/api/examiner/notifications/read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('examinerToken');
    if (!token) return;
    setProfileLoading(true);
    try {
      await axios.put('/api/examiner/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(prev => ({ ...prev, password: '' }));
      // Refresh profile data
      fetchData(token);
      setAlertConfig({ title: 'Success', description: 'Profile updated successfully!' });
      setAlertOpen(true);
    } catch (err) {
      console.error(err);
      setAlertConfig({ title: 'Error', description: 'Failed to update profile' });
      setAlertOpen(true);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-gold/5 flex font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-brand-900 text-brand-white flex flex-col hidden md:flex shrink-0 shadow-2xl z-30">
        <div className="p-6 border-b border-brand-800 flex items-center gap-3">
          <div className="bg-brand-gold p-2 rounded-xl shadow-brand-gold/50 shadow-lg">
            <GraduationCap className="h-6 w-6 text-brand-900" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">EngRMS</h1>
        </div>
        
        <div className="p-6 border-b border-brand-800 flex flex-col items-center">
          <div className="w-20 h-20 bg-brand-800 rounded-full flex items-center justify-center mb-3 border-2 border-brand-700 shadow-inner">
            <User className="h-10 w-10 text-brand-gold/50" />
          </div>
          <h2 className="font-bold text-lg text-center leading-tight">
            {profile?.name || 'Loading...'}
          </h2>
          <p className="text-brand-gold text-sm mt-1 text-center font-medium">
            {profile?.department?.name || profile?.departmentId || 'Department'}
          </p>
          <span className="mt-3 px-3 py-1 bg-brand-800 text-xs font-bold rounded-full text-brand-gold border border-brand-700">
            Examiner
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Button 
            variant="ghost"
            onClick={() => setActiveTab('DASHBOARD')}
            className={`w-full flex justify-start items-center gap-3 px-4 py-3 h-auto rounded-xl transition-all ${
              activeTab === 'DASHBOARD' 
                ? 'bg-brand-gold text-brand-900 hover:bg-yellow-400 hover:text-brand-900 shadow-md shadow-brand-gold/20' 
                : 'text-brand-white/70 hover:bg-brand-800 hover:text-brand-white'
            }`}
          >
            <Calendar size={20} />
            <span className="font-bold">My Schedules</span>
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => setActiveTab('PROFILE')}
            className={`w-full flex justify-start items-center gap-3 px-4 py-3 h-auto rounded-xl transition-all ${
              activeTab === 'PROFILE' 
                ? 'bg-brand-gold text-brand-900 hover:bg-yellow-400 hover:text-brand-900 shadow-md shadow-brand-gold/20' 
                : 'text-brand-white/70 hover:bg-brand-800 hover:text-brand-white'
            }`}
          >
            <Settings size={20} />
            <span className="font-bold">Edit Profile</span>
          </Button>
        </nav>

        <div className="p-4 border-t border-brand-800">
          <Button 
            variant="ghost"
            onClick={handleLogout}
            className="w-full flex justify-start items-center gap-3 px-4 py-3 h-auto rounded-xl text-brand-white/70 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-bold">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm shrink-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile Branding (only visible when sidebar is hidden) */}
              <div className="flex md:hidden items-center gap-3">
                <div className="bg-orange-600 p-2 rounded-xl">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-bold text-slate-900">EngRMS</h1>
              </div>

              {/* Desktop breadcrumb/title */}
              <div className="hidden md:flex items-center gap-2">
                <span className="text-slate-400 font-medium text-sm">Examiner Portal</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-800 font-bold text-sm">
                  {activeTab === 'DASHBOARD' ? 'My Schedules' : 'Edit Profile'}
                </span>
              </div>

              <div className="flex items-center gap-4 ml-auto">
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (!showNotifications && unreadCount > 0) markNotificationsRead();
                    }}
                    className="relative p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500 border-2 border-white"></span>
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-slate-500 text-sm">No notifications</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className={`p-4 border-b border-slate-50 last:border-0 ${n.isRead ? 'opacity-70' : 'bg-orange-50/50'}`}>
                              <p className="font-bold text-sm text-slate-800">{n.title}</p>
                              <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                              <p className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString()}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile logout */}
                <button onClick={handleLogout} className="md:hidden text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-full transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8 bg-slate-50">
          
          {activeTab === 'DASHBOARD' && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Your Exam Schedules</h2>
                <p className="text-slate-500 mt-1">Review your upcoming assigned duties.</p>
              </div>

              {schedules.length === 0 ? (
                <div className="text-center py-20 bg-brand-white rounded-3xl border border-brand-gold/20 border-dashed shadow-sm">
                  <div className="bg-brand-gold/10 p-4 rounded-full inline-block mb-4">
                    <Calendar className="h-8 w-8 text-brand-gold" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-900">No Exam Duties</h3>
                  <p className="text-brand-900/60 mt-1">You currently have no exam schedules assigned to you.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {schedules.map(sch => (
                    <Card key={sch.id} className="border-brand-gold/20 shadow-sm hover:shadow-md hover:border-brand-gold transition-all relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                      
                      <CardHeader className="pb-2">
                        <div className="inline-block px-3 py-1 bg-brand-gold/20 text-brand-900 text-xs font-black uppercase tracking-widest rounded-lg mb-3 self-start w-fit">
                          {sch.moduleCode}
                        </div>
                        <CardTitle className="text-xl font-bold text-brand-900 leading-tight">
                          {sch.module?.name || 'Unknown Module'}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-3 pt-4">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-brand-900">Date & Time</p>
                            <p className="text-sm text-brand-900/70">{new Date(sch.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-brand-900">Venue</p>
                            <p className="text-sm text-brand-900/70">{sch.venue}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'PROFILE' && (
            <div className="max-w-2xl mx-auto">
              <Card className="border-brand-gold/20 shadow-sm overflow-hidden">
                <div className="bg-brand-900 p-8 flex flex-col items-center border-b-4 border-brand-gold relative">
                  <div className="w-24 h-24 bg-brand-white rounded-full flex items-center justify-center shadow-lg border-4 border-brand-white absolute -bottom-12">
                    <User className="h-12 w-12 text-brand-800/40" />
                  </div>
                </div>
                
                <div className="pt-20 px-8 pb-8 text-center bg-brand-white">
                  <h3 className="text-2xl font-black text-brand-900">{profile?.name || 'No Name Set'}</h3>
                  <p className="text-brand-gold font-bold mt-1">{profile?.department?.name || profile?.departmentId}</p>
                  <p className="text-brand-900/60 mt-1">{profile?.email}</p>
                </div>

                <CardContent className="p-8 border-t border-brand-gold/10 bg-brand-gold/5">
                  <h4 className="text-lg font-bold text-brand-900 mb-6">Update Your Profile</h4>
                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div>
                      <Label className="block text-sm font-bold text-brand-900 mb-2">Display Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-brand-900/40" />
                        <Input
                          type="text"
                          value={profileData.name}
                          onChange={e => setProfileData({...profileData, name: e.target.value})}
                          className="pl-9 bg-brand-white border-brand-gold/30 focus-visible:ring-brand-gold"
                          placeholder="Update your name..."
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="block text-sm font-bold text-brand-900 mb-2">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-brand-900/40" />
                        <Input
                          type="password"
                          value={profileData.password}
                          onChange={e => setProfileData({...profileData, password: e.target.value})}
                          className="pl-9 bg-brand-white border-brand-gold/30 focus-visible:ring-brand-gold"
                          placeholder="Enter new password (optional)"
                        />
                      </div>
                      <p className="text-xs text-brand-900/50 mt-2 ml-1">Leave password blank if you do not wish to change it.</p>
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={profileLoading || (!profileData.name && !profileData.password)}
                        className="w-full bg-brand-900 hover:bg-brand-800 text-brand-white font-bold h-12"
                      >
                        {profileLoading ? 'Updating Profile...' : 'Save Profile Changes'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

        </main>
      </div>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertConfig.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
