import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { AlertModal, ConfirmModal } from '../../components/common/CustomModal';
import { CustomScrollSelect } from '../../components/common/CustomScrollSelect';
import { TableScrollContainer } from '../../components/common/TableScrollContainer';
import { useMenuPermission } from '../../hooks/useMenuPermission';

export const VehiclesPage: React.FC = () => {
  const permissions = useMenuPermission('/vehicles');
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [plateNumber, setPlateNumber] = useState('');
  const [model, setModel] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [customVehicleType, setCustomVehicleType] = useState('');
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [capacity, setCapacity] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Modal alert & confirm state
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; type?: 'success' | 'error' | 'info' }>({
    isOpen: false,
    message: '',
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; vehicleId: number | null; plateNumber: string }>({
    isOpen: false,
    vehicleId: null,
    plateNumber: '',
  });

  const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
    setAlertModal({ isOpen: true, message, type });
  };

  // Fetch Vehicle Types
  const { data: dynamicVehicleTypes = [] } = useQuery({
    queryKey: ['vehicle-types'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/admin/vehicle-types');
        return res.data?.data || [];
      } catch (err) {
        return [];
      }
    },
  });

  const vehicleTypesList = dynamicVehicleTypes.length > 0
    ? dynamicVehicleTypes.map((vt: any) => typeof vt === 'string' ? vt : vt.name)
    : [
        'รถกระบะ 4 ล้อ',
        'รถกระบะ 4 ล้อตู้ทึบ',
        'รถบรรทุก 6 ล้อ',
        'รถบรรทุก 10 ล้อ',
        'รถหัวลาก',
      ];

  // Fetch Vehicles
  const { data: vehicles = [], refetch, isLoading } = useQuery({
    queryKey: ['admin-vehicles', search],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/admin/vehicles', { params: { search } });
        return res.data?.data || [];
      } catch (err) {
        return [];
      }
    },
  });

  const openCreateModal = () => {
    setEditingVehicleId(null);
    setPlateNumber('');
    setModel('');
    setVehicleType('');
    setCustomVehicleType('');
    setIsAddingNewType(false);
    setCapacity(0);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: any) => {
    setEditingVehicleId(vehicle.id);
    setPlateNumber(vehicle.plateNumber || '');
    setModel(vehicle.model || '');
    setVehicleType(vehicle.vehicleType || '');
    setCustomVehicleType('');
    setIsAddingNewType(false);
    setCapacity(vehicle.capacity || 0);
    setIsActive(vehicle.isActive ?? true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedType = isAddingNewType ? customVehicleType.trim() : vehicleType;

    if (!plateNumber.trim()) {
      showAlert('กรุณากรอกทะเบียนรถ');
      return;
    }

    const payload = {
      plateNumber: plateNumber.trim(),
      model: model.trim() || '-',
      vehicleType: selectedType,
      capacity: Number(capacity) || 0,
      isActive,
    };

    try {
      let res;
      if (editingVehicleId) {
        res = await apiClient.put(`/api/v1/admin/vehicles/${editingVehicleId}`, payload);
      } else {
        res = await apiClient.post('/api/v1/admin/vehicles', payload);
      }

      if (res.data?.success) {
        refetch();
        queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
        setIsModalOpen(false);
        showAlert(editingVehicleId ? 'อัปเดตข้อมูลรถเรียบร้อยแล้ว' : 'เพิ่มข้อมูลรถเรียบร้อยแล้ว', 'success');
      } else {
        showAlert(res.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const promptDeleteVehicle = (vehicleId: number, plateNumber: string) => {
    setDeleteConfirm({ isOpen: true, vehicleId, plateNumber });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.vehicleId) return;

    try {
      const res = await apiClient.delete(`/api/v1/admin/vehicles/${deleteConfirm.vehicleId}`);
      if (res.data?.success) {
        refetch();
        setDeleteConfirm({ isOpen: false, vehicleId: null, plateNumber: '' });
        showAlert('ลบข้อมูลรถเรียบร้อยแล้ว', 'success');
      } else {
        showAlert(res.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Truck className="text-blue-600 shrink-0" size={24} />
            <span>ข้อมูลยานพาหนะ (Vehicles)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            จัดการและบันทึกข้อมูลรถบรรทุก/ยานพาหนะในระบบ
          </p>
        </div>
        {permissions.canCreate && (
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm shadow-blue-500/20 cursor-pointer shrink-0"
          >
            <Plus size={18} />
            <span>เพิ่มข้อมูลรถใหม่</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="ค้นหาทะเบียนรถ หรือ รุ่นรถ..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
          />
        </div>
      </div>

      {/* Table */}
      {(() => {
        const totalCount = vehicles.length;
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        const currentPage = Math.min(page, totalPages);
        const paginatedVehicles = vehicles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

        return (
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <TableScrollContainer>
              <table className="w-full min-w-[860px] text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5 whitespace-nowrap min-w-[130px]">เลขทะเบียนรถ</th>
                    <th className="px-6 py-3.5 min-w-[160px]">ประเภทรถ</th>
                    <th className="px-6 py-3.5 min-w-[160px]">ยี่ห้อ / รุ่น</th>
                    <th className="px-6 py-3.5 whitespace-nowrap min-w-[110px]">ความจุ (ตัน)</th>
                    <th className="px-6 py-3.5 whitespace-nowrap min-w-[160px]">ผู้ใช้งาน / สถานะการผูก</th>
                    <th className="px-6 py-3.5 whitespace-nowrap min-w-[120px]">สถานะ</th>
                    <th className="px-6 py-3.5 whitespace-nowrap text-right min-w-[130px]">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                        กำลังโหลดข้อมูลยานพาหนะ...
                      </td>
                    </tr>
                  ) : paginatedVehicles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                        ยังไม่มีข้อมูลยานพาหนะในระบบ
                      </td>
                    </tr>
                  ) : (
                    paginatedVehicles.map((v: any) => (
                      <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 font-mono tracking-wide align-middle">
                          {v.plateNumber}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-700 align-middle">
                          {v.vehicleType || '-'}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 align-middle">
                          {v.model || '-'}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-700 align-middle">
                          {v.capacity ? `${v.capacity} ตัน` : '-'}
                        </td>
                        <td className="px-6 py-4 text-xs align-middle">
                          {v.assignedDriverName ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                              <User size={12} />
                              <span>{v.assignedDriverName}</span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <span>ว่าง (ยังไม่ถูกผูก)</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 align-middle">
                          {v.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <CheckCircle size={12} />
                              <span>พร้อมใช้งาน</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                              <XCircle size={12} />
                              <span>ปิดใช้งาน</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap align-middle">
                          {permissions.canUpdate && (
                            <button
                              onClick={() => openEditModal(v)}
                              className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Pencil size={13} />
                              <span>แก้ไข</span>
                            </button>
                          )}
                          {permissions.canDelete && (
                            <button
                              onClick={() => promptDeleteVehicle(v.id, v.plateNumber)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 size={13} />
                              <span>ลบ</span>
                            </button>
                          )}
                          {!permissions.canUpdate && !permissions.canDelete && (
                            <span className="text-xs text-slate-400 select-none">-</span>
                          )}
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden relative my-auto">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Truck size={18} className="text-blue-600" />
                <span>{editingVehicleId ? 'แก้ไขข้อมูลยานพาหนะ' : 'เพิ่มข้อมูลยานพาหนะใหม่'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เลขทะเบียนรถ *
                </label>
                <input
                  type="text"
                  placeholder="เช่น 1กข-1234 หรือ 70-5678"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ประเภทรถ *
                </label>
                <CustomScrollSelect
                  value={vehicleType}
                  onChange={(val) => setVehicleType(val)}
                  placeholder="เลือกประเภทรถ *"
                  options={vehicleTypesList.map((vt: string) => ({ label: vt, value: vt }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ยี่ห้อ / รุ่น
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น Isuzu NRR 150"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ความจุการบรรทุก (ตัน)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={capacity}
                    onChange={(e) => setCapacity(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-mono"
                  />
                </div>
              </div>

              {editingVehicleId && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                    พร้อมใช้งานในระบบ (Active)
                  </label>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer text-center"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  <Save size={16} />
                  <span>{editingVehicleId ? 'บันทึกการแก้ไข' : 'บันทึกรถใหม่'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="ยืนยันการลบข้อมูลยานพาหนะ"
        message={`คุณต้องการลบข้อมูลรถทะเบียน "${deleteConfirm.plateNumber}" ใช่หรือไม่?`}
        confirmText="ยืนยันการลบ"
        cancelText="ยกเลิก"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, vehicleId: null, plateNumber: '' })}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        title="การดำเนินการ"
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
      />
    </div>
  );
};
