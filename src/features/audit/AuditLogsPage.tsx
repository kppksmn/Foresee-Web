import React, { useState } from 'react';
import { Search, History, RefreshCw, User, Tag, Clock, Calendar, Filter, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { formatDateTimeThai } from '../../utils/dateUtils';
import { CustomScrollSelect } from '../../components/common/CustomScrollSelect';
import { TableScrollContainer } from '../../components/common/TableScrollContainer';

export const AuditLogsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  // Fetch users list for filter dropdown
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/admin/users');
        return res.data?.data || [];
      } catch (err) {
        return [];
      }
    },
  });

  // Prepare user dropdown options with Admin guaranteed at the top
  const userOptions = React.useMemo(() => {
    const list: any[] = [...users];
    const hasAdmin = list.some((u: any) => u.username?.toLowerCase() === 'admin');
    if (!hasAdmin) {
      list.unshift({ id: 1, username: 'admin', name: 'admin', role: 'Admin' });
    }

    // Sort Admins first, then by username
    list.sort((a: any, b: any) => {
      if (a.role === 'Admin' && b.role !== 'Admin') return -1;
      if (a.role !== 'Admin' && b.role === 'Admin') return 1;
      return (a.username || '').localeCompare(b.username || '');
    });

    return list.map((u: any) => {
      const displayName = u.name && u.name !== u.username ? `${u.name} (${u.username})` : (u.username || `User #${u.id}`);
      return {
        label: `${displayName} [${u.role || 'User'}]`,
        value: String(u.id),
      };
    });
  }, [users]);

  // Fetch audit logs with filters & pagination
  const { data: auditData = { items: [], totalCount: 0, totalPages: 1 }, isLoading, refetch } = useQuery({
    queryKey: ['admin-audit-logs', search, selectedUserId, selectedEntity, startDate, endDate, page],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/admin/audit-logs', {
          params: {
            search,
            userId: selectedUserId || undefined,
            entityName: selectedEntity || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            page,
            pageSize,
          }
        });
        const d = res.data?.data;
        if (Array.isArray(d)) {
          return { items: d, totalCount: d.length, totalPages: 1 };
        }
        return {
          items: d?.items || [],
          totalCount: d?.totalCount || 0,
          totalPages: d?.totalPages || 1,
        };
      } catch (err) {
        return { items: [], totalCount: 0, totalPages: 1 };
      }
    },
  });

  const logs = auditData.items;
  const totalPages = auditData.totalPages;
  const totalCount = auditData.totalCount;

  const handleClearFilters = () => {
    setSearch('');
    setSelectedUserId('');
    setSelectedEntity('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const getActionBadge = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full">สร้าง (CREATE)</span>;
      case 'UPDATE':
        return <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-full">แก้ไข (UPDATE)</span>;
      case 'DELETE':
      case 'DELETE_ALL':
        return <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold rounded-full">ลบ (DELETE)</span>;
      default:
        return <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-full">{action}</span>;
    }
  };

  const getEntityLabel = (entity: string) => {
    switch (entity.toLowerCase()) {
      case 'jobs':
        return 'งานขนส่ง (Jobs)';
      case 'users':
        return 'ผู้ใช้งาน (Users)';
      case 'vehicles':
        return 'ยานพาหนะ (Vehicles)';
      case 'vehicle_types':
        return 'ประเภทรถ (Vehicle Types)';
      default:
        return entity;
    }
  };

  const hasActiveFilters = search || selectedUserId || selectedEntity || startDate || endDate;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="text-blue-600 shrink-0" size={24} />
            <span>Audit Log (ประวัติการทำงานในระบบ)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            บันทึกประวัติการสร้าง แก้ไข และลบข้อมูลทั้งหมดในระบบ
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw size={16} />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5 sm:space-y-4">
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Filter size={15} className="text-blue-600" />
            <span>ตัวกรองการค้นหา (Search & Filters)</span>
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <X size={14} />
              <span>ล้างตัวกรองทั้งหมด</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">คำค้นหา</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาข้อความ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <User size={13} className="text-slate-400" />
              <span>ผู้ทำรายการ</span>
            </label>
            <CustomScrollSelect
              value={selectedUserId}
              onChange={(val) => setSelectedUserId(val)}
              placeholder="ทั้งหมด (All Users)"
              options={userOptions}
            />
          </div>

          {/* Category / Entity Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Tag size={13} className="text-slate-400" />
              <span>หมวดหมู่ (Module)</span>
            </label>
            <CustomScrollSelect
              value={selectedEntity}
              onChange={(val) => setSelectedEntity(val)}
              placeholder="ทั้งหมด (All Modules)"
              options={[
                { label: 'งานขนส่ง (Jobs)', value: 'jobs' },
                { label: 'ผู้ใช้งาน (Users)', value: 'users' },
                { label: 'ยานพาหนะ (Vehicles)', value: 'vehicles' },
                { label: 'ประเภทรถ (Vehicle Types)', value: 'vehicle_types' },
              ]}
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Calendar size={13} className="text-slate-400" />
              <span>ตั้งแต่วันที่</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Calendar size={13} className="text-slate-400" />
              <span>ถึงวันที่</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <TableScrollContainer>
          <table className="w-full min-w-[860px] text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 whitespace-nowrap min-w-[180px]">วันเวลา</th>
                <th className="px-5 py-3.5 whitespace-nowrap min-w-[150px]">ผู้ทำรายการ</th>
                <th className="px-5 py-3.5 whitespace-nowrap min-w-[120px]">การกระทำ (Action)</th>
                <th className="px-5 py-3.5 whitespace-nowrap min-w-[150px]">หมวดหมู่ (Entity)</th>
                <th className="px-5 py-3.5 min-w-[280px]">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    กำลังโหลดข้อมูลประวัติการทำงาน...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    ไม่พบข้อมูลประวัติการทำงานตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                        <Clock size={14} className="text-slate-400 shrink-0" />
                        <span>{formatDateTimeThai(log.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap align-middle font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-slate-400 shrink-0" />
                        <span>{log.userName || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap align-middle">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap align-middle text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-1">
                        <Tag size={13} className="text-slate-400 shrink-0" />
                        <span>{getEntityLabel(log.entityName)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle text-slate-700 text-xs sm:text-sm leading-relaxed">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableScrollContainer>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-medium">
              แสดงหน้า <span className="font-bold text-slate-800">{page}</span> จากทั้งหมด <span className="font-bold text-slate-800">{totalPages}</span> หน้า (รวม <span className="font-bold text-blue-600">{totalCount}</span> รายการ)
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
              >
                ย้อนกลับ
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && p - prev > 1;

                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                        <button
                          onClick={() => setPage(p)}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                            page === p
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
