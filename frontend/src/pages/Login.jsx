import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap, User, Lock, Eye, EyeOff  } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const [role, setRole] = useState('ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    if (role === 'ADMIN') {
      setLoading(true);
      try {
        const res = await axios.post('/api/auth/admin/login', { email, password });
        localStorage.setItem('adminToken', res.data.token);
        toast.success(`Logged in securely as ${role}`);
        navigate('/admin');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Invalid credentials');
      } finally {
        setLoading(false);
      }
    } else if (role === 'EXAMINER') {
      setLoading(true);
      if (isRegistering) {
        try {
          const res = await axios.post('/api/auth/examiner/register', { email, password });
          toast.success(res.data.message);
          setIsRegistering(false);
        } catch (err) {
          toast.error(err.response?.data?.error || 'Failed to register account');
        } finally {
          setLoading(false);
        }
      } else {
        try {
          const res = await axios.post('/api/auth/examiner/login', { email, password });
          localStorage.setItem('examinerToken', res.data.token);
          toast.success(`Logged in securely as ${role}`);
          navigate('/examiner');
        } catch (err) {
          toast.error(err.response?.data?.error || 'Invalid credentials');
        } finally {
          setLoading(false);
        }
      }
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
          Result Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-brand-white py-8 px-4 shadow-xl shadow-brand-gold/10 sm:rounded-2xl sm:px-10 border border-brand-gold/20">
          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label className="block text-sm font-semibold text-brand-900 mb-2">Select your role</label>
              <div className="flex rounded-lg shadow-sm border border-brand-gold/20 p-1 bg-brand-gold/5">
                {['ADMIN', 'EXAMINER'].map(r => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setIsRegistering(false);
                    }}
                    className={`flex-1 py-2.5 text-xs font-bold tracking-wide rounded-md transition-all ${
                      role === r 
                        ? 'bg-brand-white text-brand-900 shadow-sm border border-brand-gold/30' 
                        : 'text-brand-900/50 hover:text-brand-900 hover:bg-brand-gold/10'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-brand-900 font-semibold">
                Email Address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-brand-900/40" />
                </div>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-brand-gold/5 border-brand-gold/30 focus-visible:ring-brand-gold"
                  placeholder="name@eng.ruh.ac.lk"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-brand-900 font-semibold">
                {isRegistering ? 'Create Password' : 'Password'}
              </Label>
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
                  minLength={isRegistering ? 6 : undefined}
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
              {loading ? 'Processing...' : (isRegistering ? 'Complete Registration' : 'Sign in')}
            </Button>
            
            {role === 'EXAMINER' && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-sm text-brand-900/70 hover:text-brand-900 hover:underline font-medium"
                >
                  {isRegistering ? 'Already registered? Sign in' : 'First time logging in? Complete Registration'}
                </button>
              </div>
            )}
          </form>
          
          <div className="mt-6 text-center text-xs text-brand-900/60 bg-brand-gold/10 p-4 rounded-xl border border-brand-gold/20 flex items-start gap-2">
            <span className="text-brand-gold font-bold text-lg leading-none">ℹ</span>
            <p className="text-left">For testing purposes, select any role, type any dummy credentials, and click Sign In to navigate to that role's dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
