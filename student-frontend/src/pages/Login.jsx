import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap, User, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://172.27.208.217:3000/api/auth/student/login', { regNo: email, password });
      localStorage.setItem('studentToken', res.data.token);
      toast.success(`Logged in securely as Student`);
      
      if (res.data.isFirstLogin) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans animate-in fade-in duration-500">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="bg-brand-900 p-4 rounded-3xl shadow-lg shadow-brand-900/20 mb-6 border border-brand-800">
          <GraduationCap className="h-12 w-12 text-brand-gold" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-brand-900 tracking-tight">
          Ruhuna EngRMS
        </h2>
        <p className="mt-2 text-center text-sm text-brand-900/60 font-medium">
          Student Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-brand-white py-8 px-4 shadow-xl shadow-brand-gold/10 sm:rounded-2xl sm:px-10 border border-brand-gold/20">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label className="text-brand-900 font-semibold">
                Email Address / Registration No
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-brand-900/40" />
                </div>
                <Input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-brand-gold/5 border-brand-gold/30 focus-visible:ring-brand-gold"
                  placeholder="EG/XXXX/XXXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-brand-900 font-semibold">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-brand-900/40" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-brand-gold/5 border-brand-gold/30 focus-visible:ring-brand-gold"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-900/40 hover:text-brand-900"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-brand-white bg-brand-900 hover:bg-brand-800 transition-colors"
              >
                {loading ? 'Authenticating...' : 'Sign in'}
              </Button>
          </form>
          
          <div className="mt-6 text-center text-xs text-brand-900/60 bg-brand-gold/10 p-4 rounded-xl border border-brand-gold/20 flex items-start gap-2">
            <span className="text-brand-gold font-bold text-lg leading-none">ℹ</span>
            <p className="text-left">For testing purposes, type any dummy credentials and click Sign In to navigate to the student dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
