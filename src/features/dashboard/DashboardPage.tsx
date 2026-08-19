import React from 'react';
import {
  Truck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  MapPin
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';

export const DashboardPage: React.FC = () => {
  const [timeMode, setTimeMode] = React.useState<'daily' | 'monthly' | 'yearly'>('daily');

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/admin/dashboard');
        return res.data?.data;
      } catch (err) {
        return null;
      }
    },
  });

  const kpis = [
    { label: 'งานวันนี้ทั้งหมด', value: dashboardData?.totalJobsToday ?? 0, change: 'งานวันนี้', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'งานเดือนนี้ทั้งหมด', value: dashboardData?.totalJobsThisMonth ?? 0, change: 'เดือนนี้', icon: Truck, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'งานปีนี้ทั้งหมด', value: dashboardData?.totalJobsThisYear ?? 0, change: 'ปีนี้', icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'รอมอบหมาย', value: dashboardData?.pendingJobs ?? 0, change: 'รอดำเนินการ', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'กำลังปฏิบัติงาน', value: dashboardData?.inProgressJobs ?? 0, change: 'กำลังทำ', icon: MapPin, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'เสร็จสิ้นเรียบร้อย', value: dashboardData?.completedJobs ?? 0, change: 'เสร็จสิ้น', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'งานที่ยกเลิก', value: dashboardData?.cancelledJobs ?? 0, change: 'ถูกยกเลิก', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'พนักงานพร้อมงาน', value: dashboardData?.availableDrivers ?? 0, change: 'พร้อมสแตนด์บาย', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const getActiveChartData = () => {
    if (timeMode === 'monthly') return dashboardData?.monthlyStats || [];
    if (timeMode === 'yearly') return dashboardData?.yearlyStats || [];
    return dashboardData?.hourlyStats || [
      { time: '08:00', completed: 0, inprogress: 0, cancelled: 0 },
      { time: '12:00', completed: 0, inprogress: 0, cancelled: 0 },
      { time: '16:00', completed: 0, inprogress: 0, cancelled: 0 },
      { time: '20:00', completed: 0, inprogress: 0, cancelled: 0 },
    ];
  };

  const chartData = getActiveChartData();

  const pieData = [
    { name: 'ปิดงานแล้ว', value: dashboardData?.completedJobs ?? 0, color: '#10b981' },
    { name: 'กำลังดำเนินการ', value: dashboardData?.inProgressJobs ?? 0, color: '#0284c7' },
    { name: 'รอมอบหมาย', value: dashboardData?.pendingJobs ?? 0, color: '#f59e0b' },
    { name: 'ยกเลิก', value: dashboardData?.cancelledJobs ?? 0, color: '#e11d48' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            ภาพรวมการขนส่ง (Logistics Overview)
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            รายงานสรุปผลการปฏิบัติงานของพนักงานขับรถและสถิติตามช่วงเวลา
          </p>
        </div>

        {/* Filter Period Tabs */}
        <div className="inline-flex p-1 bg-slate-200/70 rounded-xl">
          <button
            onClick={() => setTimeMode('daily')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              timeMode === 'daily'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รายวัน (Today)
          </button>
          <button
            onClick={() => setTimeMode('monthly')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              timeMode === 'monthly'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รายเดือน (Monthly)
          </button>
          <button
            onClick={() => setTimeMode('yearly')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              timeMode === 'yearly'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รายปี (Yearly)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color}`}>
                  <Icon size={18} />
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {kpi.change}
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {kpi.value}
                </div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">
                  {kpi.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {timeMode === 'daily' && 'ปริมาณงานตามช่วงเวลาชั่วโมง (วันนี้)'}
                {timeMode === 'monthly' && 'สถิติปริมาณงานรายวัน (เดือนนี้)'}
                {timeMode === 'yearly' && 'สรุปสถิติปริมาณงานรายเดือน (ปีนี้)'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                เปรียบเทียบงานที่เสร็จสิ้นกับงานที่กำลังดำเนินการ/รอดำเนินการ
              </p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Area type="monotone" name="งานเสร็จสิ้น" dataKey="completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                <Area type="monotone" name="กำลังดำเนินการ/รอดำเนินการ" dataKey="inprogress" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorInProgress)" />
                <Area type="monotone" name="งานที่ยกเลิก" dataKey="cancelled" stroke="#e11d48" strokeWidth={2} fillOpacity={1} fill="url(#colorCancelled)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Distribution Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">สัดส่วนสถานะงานภาพรวม</h3>
            <p className="text-xs text-slate-500 mt-0.5">กระจายตามสถานะการขนส่ง</p>
          </div>
          <div className="h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 border-t border-slate-100 pt-3">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value} งาน</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
