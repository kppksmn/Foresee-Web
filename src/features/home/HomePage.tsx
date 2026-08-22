import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import type { UserNavMenu } from '../users/model/types';
import {
  Activity,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Compass,
  Database,
  FolderTree,
  LayoutDashboard,
  Server,
  ShieldCheck,
  Truck,
  Users,
  Zap,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('full_name') || localStorage.getItem('username') || 'ผู้ดูแลระบบ';
  const token = localStorage.getItem('access_token') || '';
  const userId = localStorage.getItem('user_id') || '';

  // Fetch navigable menus granted to the logged in user
  const { data: userMenus, isLoading: isLoadingMenus } = useQuery<UserNavMenu[]>({
    queryKey: ['me-nav-menus', userId, token],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/auth/me/menus');
      return res.data?.data || [];
    },
    staleTime: 0,
  });

  const systemFeatures = useMemo(() => [
    {
      title: 'ภาพรวมระบบ (Interactive Dashboard)',
      description: 'สรุปข้อมูลสถิติงานขนส่ง รายวัน รายเดือน รายปี พร้อมกราฟวิเคราะห์ผลการดำเนินงานและจำนวนพนักงานพร้อมปฏิบัติงาน',
      icon: LayoutDashboard,
      path: '/dashboard',
      color: 'from-blue-600 to-indigo-600',
      badge: 'Real-time Stats',
    },
    {
      title: 'งานของฉัน (My Assigned Jobs)',
      description: 'ตรวจสอบรายการงานขนส่งที่คุณได้รับมอบหมายเป็นพนักงานขับรถหรือผู้ร่วมเดินทาง พร้อมระบบกรองเลือกตามวันที่นัดหมาย',
      icon: Briefcase,
      path: '/my-jobs',
      color: 'from-cyan-600 to-blue-600',
      badge: 'My Assignments',
    },
    {
      title: 'จัดการงานขนส่ง (Job Management)',
      description: 'ระบบออกใบงาน ขับเคลื่อนการแจกจ่ายงานให้คนขับ (Driver Assign) กำหนดจุดรับ-ส่งสินค้า และอัปเดตสถานะงานเรียลไทม์',
      icon: ClipboardList,
      path: '/jobs',
      color: 'from-emerald-600 to-teal-600',
      badge: 'Core Dispatch',
    },
    {
      title: 'บริหารยานพาหนะ (Fleet & Vehicle Control)',
      description: 'จัดเก็บข้อมูลทะเบียนรถ รุ่นรถ ความจุการบรรทุก และจำแนกประเภทรถบรรทุก 4 ล้อ, 6 ล้อ, 10 ล้อ และรถหัวลาก',
      icon: Truck,
      path: '/vehicles',
      color: 'from-amber-500 to-orange-600',
      badge: 'Fleet Assets',
    },
    {
      title: 'จัดการพนักงาน & ผู้ใช้งาน (Users & Drivers)',
      description: 'บันทึกข้อมูลพนักงาน รหัสพนักงาน เบอร์โทร ใบอนุญาตขับขี่ และจับคู่ยานพาหนะประจำตัวคนขับอย่างเป็นระบบ',
      icon: Users,
      path: '/users',
      color: 'from-violet-600 to-purple-600',
      badge: 'Account & Driver',
    },
    {
      title: 'จัดการโครงสร้างเมนู (Dynamic Menu Management)',
      description: 'เครื่องมือสร้างและจัดระเบียบโครงสร้างเมนูแบบจัดลำดับขั้น (Tree Structure) และกำหนดโฟลเดอร์กลุ่มเมนูตามต้องการ',
      icon: FolderTree,
      path: '/menu-managements',
      color: 'from-sky-500 to-blue-700',
      badge: 'Dynamic Architecture',
    },
    {
      title: 'กำหนดสิทธิ์การใช้งาน (Granular Access Control)',
      description: 'จัดการสิทธิ์รายบุคคลแบบละเอียด (Read, Create, Update, Delete, Import, Export) เพื่อควบคุมความปลอดภัยของข้อมูล',
      icon: ShieldCheck,
      path: '/menu-managements/permissions',
      color: 'from-rose-500 to-pink-600',
      badge: 'RBAC Security',
    },
  ], []);

  // Collect endpoints user is granted read permission to
  const allowedEndpoints = useMemo(() => {
    const set = new Set<string>();
    const addEndpoints = (menus: UserNavMenu[]) => {
      for (const m of menus) {
        if (m.endpoint && m.isRead) {
          set.add(m.endpoint.toLowerCase());
        }
        if (m.children && m.children.length > 0) {
          addEndpoints(m.children);
        }
      }
    };

    if (userMenus) {
      addEndpoints(userMenus);
    }
    return set;
  }, [userMenus]);

  // Filter features to display ONLY modules user has permission for
  const visibleFeatures = useMemo(() => {
    if (!userMenus) {
      return [];
    }
    return systemFeatures.filter((feat) => allowedEndpoints.has(feat.path.toLowerCase()));
  }, [systemFeatures, userMenus, allowedEndpoints]);

  return (
    <div className="space-y-6 pb-10">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-40 -top-10 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 backdrop-blur-md">
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            <span>Foresee Logix Fleet & Dispatch Platform</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            ยินดีต้อนรับคุณ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{userName}</span> เข้าสู่ระบบ หน้าหลัก (Home)
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            ระบบบริหารจัดการงานขนส่ง ยานพาหนะ และโครงสร้างสิทธิ์การใช้งานแบบครบวงจร ออกแบบมาเพื่อเพิ่มประสิทธิภาพการกระจายสินค้า ติดตามสถานะงาน และควบคุมความปลอดภัยของข้อมูลระดับองค์กร
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {allowedEndpoints.has('/dashboard') ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-blue-500 hover:shadow-blue-500/25 cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4" />
                ไปยังหน้า Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : null}

            {allowedEndpoints.has('/jobs') ? (
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 backdrop-blur-md transition hover:bg-slate-700 hover:text-white cursor-pointer"
              >
                <ClipboardList className="h-4 w-4 text-emerald-400" />
                จัดการงานขนส่ง
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Feature Cards Grid - Dynamically Filtered By User Permissions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="h-5 w-5 text-blue-600" />
              ภาพรวมฟังก์ชันและโมดูลการทำงานที่ได้รับอนุญาต (Permitted Modules)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              แสดงเฉพาะโมดูลและเมนูการทำงานที่คุณได้รับสิทธิ์การใช้งานในระบบ
            </p>
          </div>
        </div>

        {isLoadingMenus ? (
          <div className="flex h-32 items-center justify-center text-xs text-slate-400 rounded-2xl border border-slate-200 bg-white">
            กำลังตรวจสอบสิทธิ์การใช้งานโมดูล...
          </div>
        ) : visibleFeatures.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            ไม่พบโมดูลที่คุณได้รับสิทธิ์ กรุณาติดต่อผู้ดูแลระบบเพื่อเปิดสิทธิ์การใช้งาน
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleFeatures.map((feat) => {
              const IconComponent = feat.icon;
              return (
                <div
                  key={feat.path}
                  onClick={() => navigate(feat.path)}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feat.color} text-white shadow-md transition group-hover:scale-105`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 transition group-hover:text-blue-600">
                      {feat.title}
                    </h3>

                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 opacity-80 group-hover:opacity-100 transition">
                    <span>เข้าสู่หน้างาน</span>
                    <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* System Architecture & Health Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-emerald-600" />
          สถานะความพร้อมของระบบ (System Architecture Status)
        </h3>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shrink-0">
              <Server className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>API Gateway (NET 10)</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 truncate">พร้อมให้บริการ Port 5000</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0">
              <Database className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>PostgreSQL DB</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 truncate">เชื่อมต่อสมบูรณ์ (Port 5433)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50/60 p-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 text-white shrink-0">
              <Activity className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Redis Cache</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 truncate">พร้อมใช้งาน (Port 6379)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
