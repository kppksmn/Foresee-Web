import React, { useState } from 'react';
import {
  Search,
  RefreshCw,
  MapPin,
  Eye,
  Calendar,
  Clock,
  CheckCircle2,
  Truck,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { JobStatusBadge } from '../../components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { AlertModal } from '../../components/common/CustomModal';
import { formatDateThai, formatTimeThai } from '../../utils/dateUtils';
import { CustomScrollSelect } from '../../components/common/CustomScrollSelect';
import { TableScrollContainer } from '../../components/common/TableScrollContainer';

export const MyJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; type?: 'success' | 'error' | 'info' }>({
    isOpen: false,
    message: '',
  });

  const { data: jobs = [], refetch, isLoading } = useQuery({
    queryKey: ['my-jobs', search, status, scheduledDate],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/auth/me/jobs', {
          params: { search, status, date: scheduledDate }
        });
        return res.data?.data || [];
      } catch (err) {
        return [];
      }
    },
  });

  // Calculate stats
  const totalCount = jobs.length;
  const activeCount = jobs.filter((j: any) => ['Pending', 'Assigned', 'Started', 'Arrived'].includes(j.status)).length;
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

          {/* Scheduled Date Filter */}
          <div className="relative w-full sm:w-44 flex items-center">
            <Calendar size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => {
                setScheduledDate(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-7 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium cursor-pointer"
              title="เลือกเวลานัดหมาย"
            />
            {scheduledDate && (
              <button
                type="button"
                onClick={() => {
                  setScheduledDate('');
                  setPage(1);
                }}
                className="absolute right-2 text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 px-1.5 py-0.5 rounded cursor-pointer font-bold"
                title="ล้างตัวกรองวันที่"
              >
                ✕
              </button>
            )}
          </div>

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
                { label: 'ถึงสถานที่แล้ว', value: 'Arrived' },
                { label: 'ปิดงานแล้ว', value: 'Completed' },
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
                    <th className="px-5 py-3.5 whitespace-nowrap">เวลานัดหมาย</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">ยานพาหนะ</th>
                    <th className="px-5 py-3.5 whitespace-nowrap">สถานะ</th>
                    <th className="px-5 py-3.5 whitespace-nowrap text-right min-w-[90px]">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                        กำลังโหลดรายการงานของคุณ...
                      </td>
                    </tr>
                  ) : jobs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                        {scheduledDate
                          ? `ไม่พบงานของคุณในวันที่ ${scheduledDate}`
                          : 'ไม่พบรายการงานของคุณในระบบ'}
                      </td>
                    </tr>
                  ) : (
                    paginatedJobs.map((job: any) => (
                      <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-mono font-semibold text-blue-600 text-xs whitespace-nowrap align-middle">
                          {job.jobNumber}
                        </td>
                        <td className="px-5 py-4 align-middle">
                          <div className="font-semibold text-slate-900 text-sm">{job.title}</div>
                          {job.description && (
                            <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{job.description}</div>
                          )}
                          {job.companionName && (
                            <div className="inline-flex items-center gap-1 mt-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                              <UserCheck size={12} />
                              <span>ผู้ร่วมเดินทาง: {job.companionName}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 align-middle">
                          <div className="flex items-start gap-1.5 text-xs text-slate-700">
                            <MapPin size={14} className="text-rose-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{job.pickupLocation || '-'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap align-middle">
                          {job.scheduledDate ? (
                            <div>
                              <div className="font-medium text-slate-900 text-xs">{formatDateThai(job.scheduledDate)}</div>
                              <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                <Clock size={11} className="text-slate-400" />
                                <span>{job.scheduledTime || formatTimeThai(job.scheduledStartAt)} น.</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap align-middle">
                          {job.vehiclePlate ? (
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                              <Truck size={13} className="text-blue-600" />
                              <span>{job.vehiclePlate}</span>
                              {job.vehicleType && (
                                <span className="text-[10px] text-slate-500 font-normal">({job.vehicleType})</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">ยังไม่ระบุ</span>
                          )}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap align-middle">
                          <JobStatusBadge status={job.status} />
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap align-middle">
                          <button
                            onClick={() => navigate(`/jobs/edit/${job.id}?readOnly=true`)}
                            className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="ดูรายละเอียดงาน"
                          >
                            <Eye size={13} />
                            <span>รายละเอียด</span>
                          </button>
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
