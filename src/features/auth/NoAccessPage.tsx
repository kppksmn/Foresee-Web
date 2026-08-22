import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut, RefreshCw, UserCheck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export const NoAccessPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const username = localStorage.getItem('username') || 'ผู้ใช้งาน';
  const role = localStorage.getItem('role') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    queryClient.clear();
    navigate('/login');
  };

  const handleRefresh = () => {
    queryClient.clear();
    window.location.href = '/';
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
          <ShieldAlert size={34} />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            ยังไม่ได้รับสิทธิ์เข้าใช้งานเมนู
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            ยินดีต้อนรับเข้าสู่ระบบ <strong>Foresee Logix</strong> แต่บัญชีของคุณยังไม่มีสิทธิ์ในการเข้าถึงเมนูการทำงานใดๆ
          </p>
        </div>

        {/* User Info Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-left flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
            <UserCheck size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 truncate">{username}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {role}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              สถานะ: รอผู้ดูแลระบบ (Admin) มอบหมายสิทธิ์เมนู
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>ตรวจสอบสิทธิ์อีกครั้ง</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={14} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
