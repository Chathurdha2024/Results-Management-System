import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Lock, Eye, EyeOff, Bell, BellOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function PasswordField({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <Label className="text-brand-900">{label}</Label>
      <div className="relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          <Lock className="h-5 w-5 text-brand-900/40" />
        </div>
        <Input
          type={show ? 'text' : 'password'}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-10 bg-brand-gold/5 border-brand-gold/30 focus-visible:ring-brand-gold focus:bg-brand-white"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-brand-900/40 hover:text-brand-900 transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

export default function ProfileView({ onNotificationSettingChange }) {
  const [profile, setProfile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingSetting, setSavingSetting] = useState(false);

  const token = localStorage.getItem('studentToken');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/student/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to load profile.');
      }
    };
    fetchProfile();
  }, [token]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New password and confirm password do not match!');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long.');
    }

    setSavingPassword(true);
    try {
      const res = await axios.post(
        '/api/auth/student/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem('studentToken', res.data.token);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleToggleNotifications = async () => {
    if (!profile) return;
    const enabled = !profile.notificationsEnabled;

    setSavingSetting(true);
    try {
      const res = await axios.put(
        '/api/student/notification-settings',
        { enabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile({ ...profile, notificationsEnabled: res.data.notificationsEnabled });
      toast.success(enabled ? 'Result notifications enabled.' : 'Result notifications disabled.');
      onNotificationSettingChange?.(res.data.notificationsEnabled);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update notification settings');
    } finally {
      setSavingSetting(false);
    }
  };

  const details = profile ? [
    { label: 'Registration Number', value: profile.regNo },
    { label: 'Department', value: profile.department },
    { label: 'Batch', value: profile.batch }
  ] : [];

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Student Details */}
      <Card className="shadow-sm border-brand-gold/20 overflow-hidden">
        <CardHeader className="bg-brand-gold/5 border-b border-brand-gold/10 pb-4">
          <CardTitle className="text-brand-900 flex items-center gap-2">
            <User size={18} className="text-brand-gold" />
            Student Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {!profile ? (
            <div className="py-6 text-center text-sm text-brand-900/50 font-medium">Loading profile...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {details.map(field => (
                <div key={field.label}>
                  <div className="text-[10px] font-bold text-brand-900/50 uppercase tracking-wider mb-1">{field.label}</div>
                  <div className="text-sm font-bold text-brand-900 break-words">{field.value}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="shadow-sm border-brand-gold/20 overflow-hidden">
        <CardHeader className="bg-brand-gold/5 border-b border-brand-gold/10 pb-4">
          <CardTitle className="text-brand-900 flex items-center gap-2">
            <Lock size={18} className="text-brand-gold" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="space-y-5" onSubmit={handleChangePassword}>
            <PasswordField
              label="Current Password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="••••••••"
            />
            <PasswordField
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="••••••••"
            />
            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
            />
            <Button
              type="submit"
              disabled={savingPassword}
              className="h-11 px-6 font-extrabold text-brand-white bg-brand-900 hover:bg-brand-800 focus-visible:ring-brand-gold shadow-sm"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="shadow-sm border-brand-gold/20 overflow-hidden">
        <CardHeader className="bg-brand-gold/5 border-b border-brand-gold/10 pb-4">
          <CardTitle className="text-brand-900 flex items-center gap-2">
            <Bell size={18} className="text-brand-gold" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-slate-100 p-2 rounded-lg mt-0.5">
                {profile?.notificationsEnabled
                  ? <Bell size={16} className="text-brand-900/70" />
                  : <BellOff size={16} className="text-brand-900/70" />}
              </div>
              <div>
                <div className="text-sm font-bold text-brand-900">Enable result notifications</div>
                <p className="text-xs font-medium text-brand-900/60 mt-0.5">
                  Get notified in the portal when new results are released.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={profile?.notificationsEnabled ?? false}
              disabled={!profile || savingSetting}
              onClick={handleToggleNotifications}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                profile?.notificationsEnabled ? 'bg-brand-900' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  profile?.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
