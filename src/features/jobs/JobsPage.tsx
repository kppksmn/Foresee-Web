import React, { useState } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  MapPin,
  Pencil,
  Eye,
  Users,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { JobStatusBadge } from '../../components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { AlertModal } from '../../components/common/CustomModal';
import { formatDateThai, formatTimeThai } from '../../utils/dateUtils';
import { CustomScrollSelect } from '../../components/common/CustomScrollSelect';
import { TableScrollContainer } from '../../components/common/TableScrollContainer';
import { useMenuPermission } from '../../hooks/useMenuPermission';
import { exportToExcel, formatJobStatusThai } from '../../utils/excelExport';

interface JobsPageProps {
  mode?: 'active' | 'history';
}

export const JobsPage: React.FC<JobsPageProps> = ({ mode = 'active' }) => {
  const navigate = useNavigate();
  const isHistoryMode = mode === 'history';
  const endpoint = isHistoryMode ? '/jobs/history' : '/jobs';
  const permissions = useMenuPermission(endpoint);
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayDateString();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; type?: 'success' | 'error' | 'info' }>({
    isOpen: false,
    message: '',
  });

  const { data: jobs = [], refetch } = useQuery({
    queryKey: ['admin-jobs', search, status, mode, startDate, endDate],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/admin/jobs', {
          params: { search, status, mode, startDate, endDate }
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

    const prefix = isHistoryMode ? 'ประวัติงานขนส่ง' : 'รายการงานขนส่ง';
    const dateStr = new Date().toISOString().slice(0, 10);
    exportToExcel(`${prefix}_${dateStr}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {isHistoryMode ? 'ประวัติงานขนส่ง (Job History)' : 'จัดการงานขนส่ง (Manage Jobs)'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isHistoryMode ? 'รายการงานขนส่งที่ปิดงานแล้ว หรือถูกยกเลิก' : 'รายการงานขนส่งที่กำลังดำเนินการ หรือรอดำเนินการ'}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {permissions.canExport && (
            <button
              onClick={handleExportExcel}
              disabled={jobs.length === 0}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-colors shadow-xs cursor-pointer shrink-0"
              title="ส่งออกรายการงานเป็นไฟล์ Excel (.csv)"
            >
              <FileSpreadsheet size={17} />
              <span>ส่งออก Excel</span>
            </button>
          )}
          {!isHistoryMode && permissions.canCreate && (
            <button
              onClick={() => navigate('/jobs/create')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm shadow-blue-500/20 cursor-pointer shrink-0"
            >
              <Plus size={18} />
              <span>สร้างงานใหม่</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full flex-1">
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

          <div className="w-full sm:w-48">
            <CustomScrollSelect
              value={status}
              onChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
              placeholder="ทุกสถานะงาน"
              options={
                isHistoryMode
                  ? [
                      { label: 'ปิดงานแล้ว', value: 'Completed' },
                      { label: 'ยกเลิก', value: 'Cancelled' },
                    ]
                  : [
                      { label: 'รอมอบหมาย', value: 'Pending' },
                      { label: 'มอบหมายแล้ว', value: 'Assigned' },
                      { label: 'เริ่มงานแล้ว', value: 'Started' },
                      { label: 'ถึงสถานที่แล้ว', value: 'Arrived' },
                    ]
              }
            />
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="self-end sm:self-auto p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
          title="รีเฟรชข้อมูล"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {/* Table */}
      {(() => {
        const totalCount = jobs.length;
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
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-sm">
                        ยังไม่มีข้อมูลรายการงานในขณะนี้
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
                        </td>
                        <td className="px-5 py-4 min-w-[200px] align-middle">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <MapPin size={13} className="text-blue-600 shrink-0" />
                            <span className="truncate max-w-xs">{job.pickupLocation || job.pickuplocation || '-'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap align-middle">
                          <div className="font-medium text-slate-900">
                            {job.driverName || job.drivername || job.driver_name || (job.driverId || job.driver_id || job.driverid ? `Driver #${job.driverId || job.driver_id || job.driverid}` : 'ยังไม่ได้มอบหมาย')}
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
                          <div className="font-medium text-slate-700">{formatTimeThai(job.scheduledTime || job.scheduledtime)}</div>
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
                            {!isHistoryMode && permissions.canUpdate && (
                              <button
                                onClick={() => navigate(`/jobs/edit/${job.id}`)}
                                className="px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title="แก้ไขงาน"
                              >
                                <Pencil size={13} />
                                <span>แก้ไข</span>
                              </button>
                            )}
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
