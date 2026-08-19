import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, User, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import apiClient from '../../api/client';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const savedUsername = localStorage.getItem('remembered_username');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post('/api/v1/auth/login', { username, password });
      if (res.data.success && res.data.data.accessToken) {
        localStorage.setItem('access_token', res.data.data.accessToken);
        if (res.data.data.userId) {
          localStorage.setItem('user_id', res.data.data.userId.toString());
        }
        if (res.data.data.username) {
          localStorage.setItem('username', res.data.data.username);
        }
        if (rememberMe) {
          localStorage.setItem('remembered_username', username);
        } else {
          localStorage.removeItem('remembered_username');
        }
        navigate('/dashboard');
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 font-['Prompt',sans-serif] bg-[#F8FAFC] relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/70 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10 space-y-6">
        {/* Minimalist Centered White Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-9 border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-7">
          
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-blue-600 items-center justify-center text-white shadow-md shadow-blue-500/20 mb-1">
              <Truck size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Foresee Logix</h1>
              <p className="text-xs font-semibold text-blue-600 mt-0.5">ระบบบริหารจัดการพนักงานและยานพาหนะ</p>
            </div>
            <p className="text-xs text-slate-400 pt-1">
              เข้าสู่ระบบสำหรับผู้ดูแลระบบ (Admin Only)
            </p>
          </div>

          {/* Alert Message */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                ชื่อผู้ใช้งาน (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="เช่น admin"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer accent-blue-600"
                />
                <span>จำฉันไว้ในระบบ (Remember me)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>กำลังเข้าสู่ระบบ...</span>
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="text-center border-t border-slate-100 pt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-slate-400" />
            <span>ระบบจำกัดการเข้าใช้งานเฉพาะสิทธิ์ Admin</span>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 font-medium">
          © 2026 Foresee Logix Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};
