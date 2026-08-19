import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Trash2,
  Save,
  Tag,
  Edit
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { AlertModal, ConfirmModal } from '../../components/common/CustomModal';

export const VehicleTypesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; type?: 'success' | 'error' | 'info' }>({
    isOpen: false,
    message: '',
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; typeId: number | null; name: string }>({
    isOpen: false,
    typeId: null,
    name: '',
  });

  const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
    setAlertModal({ isOpen: true, message, type });
  };

  const { data: vehicleTypes = [], refetch, isLoading } = useQuery({
    queryKey: ['admin-vehicle-types-full', search],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/admin/vehicle-types');
        const list = res.data?.data || [];
        if (search.trim()) {
          return list.filter((vt: any) =>
            vt.name.toLowerCase().includes(search.toLowerCase()) ||
            (vt.description && vt.description.toLowerCase().includes(search.toLowerCase()))
          );
        }
        return list;
      } catch (err) {
        return [];
      }
    },
  });

  const openCreateModal = () => {
    setEditingTypeId(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (vt: any) => {
    setEditingTypeId(vt.id);
    setName(vt.name);
    setDescription(vt.description === '-' ? '' : vt.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showAlert('กรุณากรอกชื่อประเภทรถ');
      return;
    }

    try {
      if (editingTypeId) {
        // Edit mode
        const res = await apiClient.put(`/api/v1/admin/vehicle-types/${editingTypeId}`, {
          name: name.trim(),
          description: description.trim() || '-'
        });

        if (res.data?.success) {
          refetch();
          queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
          setIsModalOpen(false);
          showAlert('แก้ไขข้อมูลประเภทรถเรียบร้อยแล้ว', 'success');
        } else {
          showAlert(res.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
      } else {
        // Create mode
        const res = await apiClient.post('/api/v1/admin/vehicle-types', {
          name: name.trim(),
          description: description.trim() || '-'
        });

        if (res.data?.success) {
          refetch();
          queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
          setIsModalOpen(false);
          showAlert('เพิ่มประเภทรถใหม่เรียบร้อยแล้ว', 'success');
        } else {
          showAlert(res.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
      }
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const promptDeleteType = (typeId: number, typeName: string) => {
    setDeleteConfirm({ isOpen: true, typeId, name: typeName });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.typeId) return;

    try {
      const res = await apiClient.delete(`/api/v1/admin/vehicle-types/${deleteConfirm.typeId}`);
      if (res.data?.success) {
        refetch();
        queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
        setDeleteConfirm({ isOpen: false, typeId: null, name: '' });
        showAlert('ลบประเภทรถเรียบร้อยแล้ว', 'success');
      } else {
        showAlert(res.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Tag className="text-blue-600" size={28} />
            <span>ประเภทรถ (Vehicle Types)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            จัดการหมวดหมู่และประเภทยานพาหนะในระบบ
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm shadow-blue-500/20 cursor-pointer shrink-0"
        >
          <Plus size={18} />
          <span>เพิ่มประเภทรถใหม่</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="ค้นหาชื่อประเภทรถ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">ลำดับ</th>
              <th className="px-6 py-3.5">ชื่อประเภทรถ</th>
              <th className="px-6 py-3.5">รายละเอียด / คำอธิบาย</th>
              <th className="px-6 py-3.5 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                  กำลังโหลดข้อมูลประเภทรถ...
                </td>
              </tr>
            ) : vehicleTypes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                  ยังไม่มีข้อมูลประเภทรถในระบบ
                </td>
              </tr>
            ) : (
              vehicleTypes.map((vt: any, index: number) => (
                <tr key={vt.id || index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    <div className="inline-flex items-center gap-2">
                      <Truck size={15} className="text-blue-600" />
                      <span>{vt.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {vt.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(vt)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit size={13} />
                      <span>แก้ไข</span>
                    </button>
                    <button
                      onClick={() => promptDeleteType(vt.id, vt.name)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>ลบ</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Tag size={20} className="text-blue-600" />
              <span>{editingTypeId ? 'แก้ไขประเภทรถ' : 'เพิ่มประเภทรถใหม่'}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อประเภทรถ *
                </label>
                <input
                  type="text"
                  placeholder="เช่น รถบรรทุก 6 ล้อตู้แห้ง"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รายละเอียด / คำอธิบาย
                </label>
                <input
                  type="text"
                  placeholder="รายละเอียดเพิ่มเติม..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  <Save size={16} />
                  <span>บันทึกประเภทรถ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="ยืนยันการลบประเภทรถ"
        message={`คุณต้องการลบประเภทรถ "${deleteConfirm.name}" ใช่หรือไม่?`}
        confirmText="ยืนยันการลบ"
        cancelText="ยกเลิก"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, typeId: null, name: '' })}
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
