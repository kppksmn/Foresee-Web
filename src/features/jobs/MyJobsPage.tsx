import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  MapPin,
  Eye,
  Calendar,
  Clock,
  CheckCircle2,
  Briefcase,
  Users,
  FileSpreadsheet
} from 'lucide-react';
import { JobStatusBadge } from '../../components/common/StatusBadge';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { AlertModal } from '../../components/common/CustomModal';
import { formatDateThai, formatTimeThai } from '../../utils/dateUtils';
import { CustomScrollSelect } from '../../components/common/CustomScrollSelect';
import { TableScrollContainer } from '../../components/common/TableScrollContainer';
import { exportToExcel, formatJobStatusThai } from '../../utils/excelExport';

export const MyJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayDateString();
  const [search, setSearch] = useState(() => {
    const param = searchParams.get('search');
    if (param !== null) return param;
    const cached = sessionStorage.getItem('my_jobs_search');
    if (cached !== null) return cached;
    return '';
  });

  const [status, setStatus] = useState(() => {
    const param = searchParams.get('status');
    if (param !== null) return param;
    const cached = sessionStorage.getItem('my_jobs_status');
    if (cached !== null) return cached;
    return '';
  });

  const [startDate, setStartDate] = useState(() => {
    const param = searchParams.get('startDate');
    if (param !== null) return param;
    const cached = sessionStorage.getItem('my_jobs_startDate');
    if (cached !== null) return cached;
    return todayStr;
  });

  const [endDate, setEndDate] = useState(() => {
    const param = searchParams.get('endDate');
    if (param !== null) return param;
    const cached = sessionStorage.getItem('my_jobs_endDate');
    if (cached !== null) return cached;
    return todayStr;
  });

  useEffect(() => {
    sessionStorage.setItem('my_jobs_startDate', startDate);
    sessionStorage.setItem('my_jobs_endDate', endDate);
    sessionStorage.setItem('my_jobs_search', search);
    sessionStorage.setItem('my_jobs_status', status);

    const newParams = new URLSearchParams();
    if (startDate) newParams.set('startDate', startDate);
    if (endDate) newParams.set('endDate', endDate);
    if (search) newParams.set('search', search);
    if (status) newParams.set('status', status);

    setSearchParams(newParams, { replace: true });
  }, [startDate, endDate, search, status]);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; type?: 'success' | 'error' | 'info' }>({
    isOpen: false,
    message: '',
  });

  const { data: jobs = [], refetch, isLoading } = useQuery({
    queryKey: ['my-jobs', search, status, startDate, endDate],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/auth/me/jobs', {
          params: { search, status, startDate, endDate }
        });
        return res.data?.data || [];
      } catch (err) {
        return [];
      }
    },
  });

  const handleExportExcel = () => {
    if (!jobs || jobs.length === 0) return;

    const headers = [
      'เลขที่งาน',
      'หัวข้องาน',
      'รายละเอียดงาน',
      'สถานที่ / จุดรับ-ส่ง',
      'พนักงานขับรถ',
      'ผู้ร่วมเดินทาง',
      'ทะเบียนรถ',
      'ประเภทรถ',
      'วันที่นัดหมาย',
      'เวลานัดหมาย',
      'สถานะงาน',
      'ชื่อผู้ติดต่อ',
      'เบอร์โทรผู้ติดต่อ'
    ];

    const rows = jobs.map((j: any) => [
      j.jobNumber || '',
      j.title || '',
      j.description || '',
      j.pickupLocation || '',
      j.driverName || '-',
      j.companionName || '-',
      j.vehiclePlate || '-',
      j.vehicleType || '-',
      j.scheduledDate ? formatDateThai(j.scheduledDate) : '-',
      j.scheduledTime || (j.scheduledStartAt ? formatTimeThai(j.scheduledStartAt) : '-'),
      formatJobStatusThai(j.status),
      j.contactName || '-',
      j.contactPhone || '-'
    ]);

    const dateStr = new Date().toISOString().slice(0, 10);
    exportToExcel(`งานของฉัน_${dateStr}`, headers, rows);
  };

  // Calculate stats
  const totalCount = jobs.length;
  const activeCount = jobs.filter((j: any) => ['Pending', 'Assigned', 'Started'].includes(j.status)).length;
  const completedCount = jobs.filter((j: any) => j.status === 'Completed').length;

  return (
    <div className="space-y-6">
      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Briefcase className="text-blue-600 shrink-0" size={24} />
            <span>งานของฉัน (My Jobs)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            รายการงานขนส่งที่คุณได้รับมอบหมายเป็นพนักงานขับรถหรือผู้ร่วมเดินทาง
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          disabled={jobs.length === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-colors shadow-xs cursor-pointer shrink-0"
          title="ส่งออกรายการงานเป็นไฟล์ Excel (.csv)"
        >
          <FileSpreadsheet size={18} />
          <span>ส่งออก Excel</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Briefcase size={20} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">งานทั้งหมด (My Total Jobs)</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{totalCount} รายการ</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">กำลังดำเนินการ (Active)</div>
            <div className="text-xl font-bold text-amber-600 mt-0.5">{activeCount} รายการ</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">เสร็จสิ้นแล้ว (Completed)</div>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">{completedCount} รายการ</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full flex-1">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่งาน, หัวข้อ, สถานที่..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
          </div>

          {/* Scheduled Date Range Filter (จากวันที่ - ถึงวันที่) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <Calendar size={15} className="text-slate-400 shrink-0" />
            <span className="text-xs font-medium text-slate-500 shrink-0">จาก</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
              title="วันที่เริ่มต้น"
            />
            <span className="text-xs font-medium text-slate-500 shrink-0">- ถึง</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
              title="วันที่สิ้นสุด"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setPage(1);
                }}
                className="text-[11px] bg-slate-200 hover:bg-slate-300 text-slate-600 px-1.5 py-0.5 rounded cursor-pointer font-bold transition-colors ml-0.5"
                title="ล้างตัวกรองวันที่ (แสดงทั้งหมด)"
              >
                ✕
              </button>
            )}
          </div>
          {(startDate !== todayStr || endDate !== todayStr) && (
            <button
              type="button"
              onClick={() => {
                setStartDate(todayStr);
                setEndDate(todayStr);
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg border border-blue-200 transition-colors cursor-pointer shrink-0"
              title="ตั้งค่าเป็นวันปัจจุบัน"
            >
              วันนี้
            </button>
          )}

          {/* Status Filter */}
          <div className="w-full sm:w-48">
            <CustomScrollSelect
              value={status}
              onChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
              placeholder="ทุกสถานะงาน"
              options={[
                { label: 'รอมอบหมาย', value: 'Pending' },
                { label: 'มอบหมายแล้ว', value: 'Assigned' },
                { label: 'เริ่มงานแล้ว', value: 'Started' },
                { label: 'เสร็จสิ้น', value: 'Completed' },
                { label: 'ยกเลิก', value: 'Cancelled' },
              ]}
            />
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="self-end sm:self-auto p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer shrink-0"
          title="รีเฟรชข้อมูล"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {/* Table */}
      {(() => {
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        const currentPage = Math.min(page, totalPages);
        const paginatedJobs = jobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

        return (
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <TableScrollContainer>
              <table className="w-full min-w-[960px] text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 whitespace-nowrap">เลขที่งาน</th>
                    <th className="px-5 py-3.5 min-w-[260px] lg:min-w-[320px]">หัวข้องาน</th>
                    <th className="px-5 py-3.5 min-w-[200px]">สถานที่ / จุดรับ</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">พนักงานขับรถ</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">รถ / ยานพาหนะ</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">เวลานัดหมาย</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">สถานะ</th>
                    <th className="px-5 py-3.5 text-right whitespace-nowrap">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-sm">
                        กำลังโหลดรายการงานของคุณ...
                      </td>
                    </tr>
                  ) : jobs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-sm">
                        {startDate || endDate
                          ? `ไม่พบงานของคุณในช่วงวันที่ ${startDate}${endDate && endDate !== startDate ? ` ถึง ${endDate}` : ''}`
                          : 'ไม่พบรายการงานของคุณในระบบ'}
                      </td>
                    </tr>
                  ) : (
                    paginatedJobs.map((job: any) => (
                      <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-semibold text-blue-600 font-mono whitespace-nowrap align-middle">
                          <button
                            onClick={() => navigate(`/jobs/edit/${job.id}?readOnly=true`)}
                            className="hover:underline text-left font-mono font-semibold text-blue-600 cursor-pointer"
                            title="คลิกเพื่อดูรายละเอียดงาน"
                          >
                            {job.jobNumber || job.job_number || job.jobnumber || `JOB-${job.id}`}
                          </button>
                        </td>
                        <td className="px-5 py-4 min-w-[220px] lg:min-w-[260px] align-middle">
                          <button
                            onClick={() => navigate(`/jobs/edit/${job.id}?readOnly=true`)}
                            className="font-medium text-slate-900 leading-snug hover:text-blue-600 hover:underline text-left cursor-pointer"
                            title="คลิกเพื่อดูรายละเอียดงาน"
                          >
                            {job.title}
                          </button>
                          {job.description && (
                            <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{job.description}</div>
                          )}
                        </td>
                        <td className="px-5 py-4 min-w-[200px] align-middle">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <MapPin size={13} className="text-blue-600 shrink-0" />
                            <span className="truncate max-w-xs">{job.pickupLocation || job.pickuplocation || '-'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap align-middle">
                          <div className="font-medium text-slate-900">
                            {job.driverName || job.drivername || job.driver_name || (job.driverId || job.driver_id || job.driverid ? `พนักงาน #${job.driverId || job.driver_id || job.driverid}` : 'ยังไม่ได้มอบหมาย')}
                          </div>
                          {(job.companionName || job.companionname || job.companions) && (
                            <div className="text-xs text-indigo-600 font-normal flex items-center gap-1 mt-0.5">
                              <Users size={12} className="shrink-0 text-indigo-500" />
                              <span>ผู้ร่วมเดินทาง: {job.companionName || job.companionname || job.companions}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap align-middle">
                          <div className="font-medium text-slate-800">
                            {job.vehiclePlate || job.vehicleplate || job.vehicle_plate || '-'}
                          </div>
                          {(job.vehicleType || job.vehicletype) && (
                            <div className="text-xs text-slate-400 font-normal">
                              {job.vehicleType || job.vehicletype}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap align-middle">
                          <div>{formatDateThai(job.scheduledDate || job.scheduleddate)}</div>
                          <div className="font-medium text-slate-700">{formatTimeThai(job.scheduledTime || job.scheduledtime || job.scheduledStartAt)}</div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap align-middle">
                          <JobStatusBadge status={job.status} />
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap align-middle">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => navigate(`/jobs/edit/${job.id}?readOnly=true`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors border border-slate-200 cursor-pointer"
                              title="ดูรายละเอียดงาน"
                            >
                              <Eye size={13} className="text-slate-500" />
                              <span>ดูรายละเอียด</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </TableScrollContainer>

            {/* Pagination Footer */}
            {totalCount > 0 && (
              <div className="px-4 sm:px-6 py-3.5 bg-slate-50/70 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div>
                  แสดงผล <span className="font-semibold text-slate-700">{Math.min(totalCount, (currentPage - 1) * pageSize + 1)}</span> ถึง{' '}
                  <span className="font-semibold text-slate-700">{Math.min(totalCount, currentPage * pageSize)}</span> จากทั้งหมด{' '}
                  <span className="font-semibold text-slate-700">{totalCount}</span> รายการ
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer shadow-2xs"
                  >
                    ก่อนหน้า
                  </button>
                  <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800 shadow-2xs">
                    หน้า {currentPage} / {totalPages}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer shadow-2xs"
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
