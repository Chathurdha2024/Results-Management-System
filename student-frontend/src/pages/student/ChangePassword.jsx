import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match!');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long.');
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.post(
        'http://54.198.25.194:3000/api/auth/student/change-password',
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update token with the new one (which has isFirstLogin: false)
      localStorage.setItem('studentToken', res.data.token);
      toast.success('Password changed successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans animate-in fade-in duration-500">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="bg-brand-900 p-4 rounded-3xl shadow-lg shadow-brand-900/20 mb-6 border border-brand-800">
          <ShieldAlert className="h-12 w-12 text-brand-gold" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-brand-900 tracking-tight">
          Action Required
        </h2>
        <p className="mt-2 text-center text-sm text-brand-900/60 font-medium">
          Please set a new password for your account to continue.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl shadow-brand-gold/10 border-brand-gold/20">
          <CardContent className="pt-8 sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              <div className="space-y-2">
                <Label className="text-brand-900">New Password</Label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-brand-900/40" />
                  </div>
                  <Input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 bg-brand-gold/5 border-brand-gold/30 focus-visible:ring-brand-gold focus:bg-brand-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-brand-900">Confirm New Password</Label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-brand-900/40" />
                  </div>
                  <Input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-brand-gold/5 border-brand-gold/30 focus-visible:ring-brand-gold focus:bg-brand-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-extrabold text-brand-white bg-brand-900 hover:bg-brand-800 focus-visible:ring-brand-gold shadow-sm"
              >
                {loading ? 'Updating...' : 'Set New Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
