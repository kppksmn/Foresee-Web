import React, { useState } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  MapPin,
  Edit,
  Eye
} from 'lucide-react';
import { JobStatusBadge } from '../../components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { AlertModal } from '../../components/common/CustomModal';
import { formatDateThai } from '../../utils/dateUtils';

interface JobsPageProps {
  mode?: 'active' | 'history';
}

export const JobsPage: React.FC<JobsPageProps> = ({ mode = 'active' }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; type?: 'success' | 'error' | 'info' }>({
    isOpen: false,
    message: '',
  });

  const isHistoryMode = mode === 'history';

  const { data: jobs = [], refetch } = useQuery({
    queryKey: ['admin-jobs', search, status, mode],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/admin/jobs', {
          params: { search, status, mode }
        });
        return res.data?.data || [];
      } catch (err) {
        return [];
      }
    },
  });

  return (
    <div className="space-y-6">
      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {isHistoryMode ? 'ประวัติงานขนส่ง (Job History)' : 'งานปัจจุบัน (Active Jobs)'}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isHistoryMode ? 'รายการงานขนส่งที่ปิดงานแล้ว หรือถูกยกเลิก' : 'รายการงานขนส่งที่กำลังดำเนินการ หรือรอดำเนินการ'}
          </p>
        </div>
        {!isHistoryMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/jobs/create')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              <Plus size={18} />
              <span>สร้างงานใหม่</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่งาน, หัวข้อ, หรือสถานที่..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="">ทุกสถานะงาน</option>
            {isHistoryMode ? (
              <>
                <option value="Completed">ปิดงานแล้ว</option>
                <option value="Cancelled">ยกเลิก</option>
              </>
            ) : (
              <>
                <option value="Pending">รอมอบหมาย</option>
                <option value="Assigned">มอบหมายแล้ว</option>
                <option value="Started">เริ่มงานแล้ว</option>
                <option value="Arrived">ถึงสถานที่แล้ว</option>
              </>
            )}
          </select>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">เลขที่งาน</th>
                <th className="px-5 py-3.5">หัวข้องาน</th>
                <th className="px-5 py-3.5">สถานที่ / จุดรับ</th>
                <th className="px-5 py-3.5">พนักงานขับรถ</th>
                <th className="px-5 py-3.5">รถ / ยานพาหนะ</th>
                <th className="px-5 py-3.5">กำหนดเวลา</th>
                <th className="px-5 py-3.5">สถานะ</th>
                {isHistoryMode && <th className="px-5 py-3.5">หมายเหตุ (Remark)</th>}
                <th className="px-5 py-3.5 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={isHistoryMode ? 9 : 8} className="px-5 py-12 text-center text-slate-400 text-sm">
                    ยังไม่มีข้อมูลรายการงานในขณะนี้
                  </td>
                </tr>
              ) : (
                jobs.map((job: any) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-blue-600 font-mono whitespace-nowrap">
                      {job.jobNumber || job.job_number || job.jobnumber || `JOB-${job.id}`}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {job.title}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <MapPin size={13} className="text-blue-600 shrink-0" />
                        <span className="truncate max-w-xs">{job.pickupLocation || job.pickuplocation || '-'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {job.driverName || job.drivername || job.driver_name || (job.driverId || job.driver_id || job.driverid ? `Driver #${job.driverId || job.driver_id || job.driverid}` : 'ยังไม่ได้มอบหมาย')}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">
                        {job.vehiclePlate || job.vehicleplate || job.vehicle_plate || '-'}
                      </div>
                      {(job.vehicleType || job.vehicletype) && (
                        <div className="text-xs text-slate-400 font-normal">
                          {job.vehicleType || job.vehicletype}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                      <div>{formatDateThai(job.scheduledDate || job.scheduleddate)}</div>
                      <div className="font-medium text-slate-700">{job.scheduledTime || job.scheduledtime || '-'}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <JobStatusBadge status={job.status} />
                    </td>
                    {isHistoryMode && (
                      <td className="px-5 py-4 text-xs">
                        {job.status === 'Cancelled' ? (
                          <span className="text-rose-600 font-medium">{job.cancellationReason || job.cancellationreason || '-'}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    )}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      {isHistoryMode ? (
                        <button
                          onClick={() => navigate(`/jobs/edit/${job.id}?readOnly=true`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors border border-slate-200 cursor-pointer"
                          title="ดูรายละเอียดงาน"
                        >
                          <Eye size={14} className="text-slate-500" />
                          <span>ดูรายละเอียด</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/jobs/edit/${job.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-medium text-xs rounded-lg transition-colors border border-slate-200 hover:border-blue-200 cursor-pointer"
                          title="แก้ไขงาน"
                        >
                          <Edit size={14} />
                          <span>แก้ไข</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
