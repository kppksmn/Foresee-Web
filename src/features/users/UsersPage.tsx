import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Phone,
  Mail,
  X,
  User,
  Shield,
  FileText,
  Calendar,
  Save,
  Truck,
  Edit,
  Trash2
} from 'lucide-react';
import { LicenseStatusBadge } from '../../components/common/StatusBadge';
import { CustomScrollSelect } from '../../components/common/CustomScrollSelect';

import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { AlertModal, ConfirmModal } from '../../components/common/CustomModal';
import { formatDateThai } from '../../utils/dateUtils';

export const UsersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState('Driver');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [idCardNo, setIdCardNo] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYearBE, setBirthYearBE] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [licenseExpDay, setLicenseExpDay] = useState('');
  const [licenseExpMonth, setLicenseExpMonth] = useState('');
  const [licenseExpYearBE, setLicenseExpYearBE] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  const openCreateModal = () => {
    setEditingUserId(null);
    setUsername('');
    setName('');
    setEmployeeId('');
    setRole('Driver');
    setPhone('');
    setEmail('');
    setIdCardNo('');
    setBirthDay('');
    setBirthMonth('');
    setBirthYearBE('');
    setLicenseNo('');
    setLicenseExpDay('');
    setLicenseExpMonth('');
    setLicenseExpYearBE('');
    setSelectedVehicleId('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUserId(user.id);
    setUsername(user.username || '');
    setName(user.name || '');
    setEmployeeId(user.employeeId || '');
    setRole(user.role || 'Driver');
    setPhone(user.phone || '');
    setEmail(user.email || '');
    setIdCardNo(user.idCardNo || '');
    if (user.birthDate) {
      const [yyyy, mm, dd] = user.birthDate.split('-');
      setBirthDay(String(parseInt(dd, 10)));
      setBirthMonth(String(parseInt(mm, 10)));
      setBirthYearBE(String(parseInt(yyyy, 10) + 543));
    } else {
      setBirthDay('');
      setBirthMonth('');
      setBirthYearBE('');
    }
    setLicenseNo(user.licenseNo || '');
    if (user.licenseExpiration) {
      const [yyyy, mm, dd] = user.licenseExpiration.split('-');
      setLicenseExpDay(String(parseInt(dd, 10)));
      setLicenseExpMonth(String(parseInt(mm, 10)));
      setLicenseExpYearBE(String(parseInt(yyyy, 10) + 543));
    } else {
      setLicenseExpDay('');
      setLicenseExpMonth('');
      setLicenseExpYearBE('');
    }
    setSelectedVehicleId(user.vehicleId ? String(user.vehicleId) : '');
    setIsModalOpen(true);
  };

  // Helper to calculate auto password from birth date e.g. 9 ธันวา 2537 -> 09122537
  const getAutoPassword = () => {
    if (!birthDay || !birthMonth || !birthYearBE) return '';
    const dd = birthDay.padStart(2, '0');
    const mm = birthMonth.padStart(2, '0');
    const yyyy = birthYearBE;
    return `${dd}${mm}${yyyy}`;
  };

  // Query vehicles that are available (unassigned) OR currently assigned to this driver
  const { data: availableVehicles = [] } = useQuery({
    queryKey: ['available-vehicles', editingUserId],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/admin/available-vehicles', {
          params: { currentUserId: editingUserId }
        });
        return res.data?.data || [];
      } catch (err) {
        return [];
      }
    },
    enabled: isModalOpen && role === 'Driver',
  });





  const { data: users = [], refetch } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/admin/users', { params: { search } });
        return res.data?.data || [];
      } catch (err) {
        return [];
      }
    },
  });

  // Alert & Confirm Modal states
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title?: string; message: string; type?: 'success' | 'error' | 'info' }>({
    isOpen: false,
    message: '',
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; userId: number | null; userName: string }>({
    isOpen: false,
    userId: null,
    userName: '',
  });

  const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'error', title?: string) => {
    setAlertModal({ isOpen: true, message, type, title });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !name || !employeeId || !phone || !email || !idCardNo || !birthDay || !birthMonth || !birthYearBE) {
      showAlert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนทุกฟิลด์ (*)');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!/^\d{10}$/.test(cleanPhone)) {
      showAlert('กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก (เฉพาะตัวเลขเท่านั้น)');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      showAlert('รูปแบบอีเมลไม่ถูกต้อง (ตัวอย่าง: user@foresee.com)');
      return;
    }

    if (!/^\d{13}$/.test(idCardNo.trim())) {
      showAlert('กรุณากรอกเลขบัตรประชาชนให้ครบ 13 หลัก (เฉพาะตัวเลขเท่านั้น)');
      return;
    }

    if (role === 'Driver' && (!licenseNo || !licenseExpDay || !licenseExpMonth || !licenseExpYearBE)) {
      showAlert('กรุณากรอกข้อมูลใบขับขี่และวันหมดอายุให้ครบถ้วนทุกฟิลด์ (*)');
      return;
    }

    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || name;
      const lastName = nameParts.slice(1).join(' ') || '-';

      let birthDateIso: string | null = null;
      if (birthDay && birthMonth && birthYearBE) {
        const yyyy = parseInt(birthYearBE, 10) - 543;
        const mm = birthMonth.padStart(2, '0');
        const dd = birthDay.padStart(2, '0');
        birthDateIso = `${yyyy}-${mm}-${dd}`;
      }

      let licenseExpIso: string | null = null;
      if (licenseExpDay && licenseExpMonth && licenseExpYearBE) {
        const yyyy = parseInt(licenseExpYearBE, 10) - 543;
        const mm = licenseExpMonth.padStart(2, '0');
        const dd = licenseExpDay.padStart(2, '0');
        licenseExpIso = `${yyyy}-${mm}-${dd}`;
      }

      const payload: any = {
        username,
        role,
        driverDetail: {
          employeeCode: employeeId,
          firstName,
          lastName,
          phone,
          email,
          idCardNo,
          birthDate: birthDateIso,
          licenseNo: licenseNo || 'N/A',
          licenseIssueDate: new Date().toISOString().split('T')[0],
          licenseExpirationDate: licenseExpIso || new Date().toISOString().split('T')[0],
          vehicleId: selectedVehicleId ? Number(selectedVehicleId) : null,
        }
      };

      let res;
      if (editingUserId) {
        res = await apiClient.put(`/api/v1/admin/users/${editingUserId}`, payload);
      } else {
        payload.password = getAutoPassword() || '01012540';
        res = await apiClient.post('/api/v1/admin/users', payload);
      }

      if (res.data?.success) {
        refetch();
        setIsModalOpen(false);

        // Reset Form
        setEditingUserId(null);
        setUsername('');
        setName('');
        setEmployeeId('');
        setRole('Driver');
        setPhone('');
        setEmail('');
        setIdCardNo('');
        setBirthDay('');
        setBirthMonth('');
        setBirthYearBE('');
        setLicenseNo('');
        setLicenseExpDay('');
        setLicenseExpMonth('');
        setLicenseExpYearBE('');
        setSelectedVehicleId('');

        showAlert(editingUserId ? 'อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว' : 'เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว', 'success');
      } else {
        showAlert(res.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ใช้งาน');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      showAlert(errMsg);
    }
  };

  const promptDeleteUser = (userId: number, userName: string) => {
    setDeleteConfirm({ isOpen: true, userId, userName });
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirm.userId) return;
    const { userId } = deleteConfirm;
    setDeleteConfirm({ isOpen: false, userId: null, userName: '' });

    try {
      const res = await apiClient.delete(`/api/v1/admin/users/${userId}`);
      if (res.data?.success) {
        refetch();
        setIsModalOpen(false);
        showAlert('ลบผู้ใช้งานเรียบร้อยแล้ว', 'success');
      } else {
        showAlert(res.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    } catch (err: any) {
      showAlert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            พนักงานและผู้ใช้งาน (Users & Drivers)
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            จัดการข้อมูลผู้ใช้งาน บัญชีขับรถ และการตรวจสอบใบอนุญาตขับขี่
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm shadow-blue-500/20"
        >
          <UserPlus size={18} />
          <span>เพิ่มพนักงาน/ผู้ใช้งานใหม่</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, รหัสพนักงาน, เบอร์โทร..."
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
              <th className="px-6 py-3.5">ชื่อ-นามสกุล / รหัส</th>
              <th className="px-6 py-3.5">สิทธิ์ผู้ใช้งาน</th>
              <th className="px-6 py-3.5">รถประจำตัว</th>
              <th className="px-6 py-3.5">การติดต่อ</th>
              <th className="px-6 py-3.5">ใบอนุญาตขับขี่</th>
              <th className="px-6 py-3.5">สถานะใบขับขี่</th>
              <th className="px-6 py-3.5 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                  ยังไม่มีข้อมูลพนักงาน/ผู้ใช้งานในระบบ
                </td>
              </tr>
            ) : (
              users.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {user.employeeId ? `ID: ${user.employeeId}` : `Username: ${user.username}`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'Admin'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                          : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {user.role === 'Admin' ? (
                      <span className="text-slate-400 font-medium">-</span>
                    ) : user.vehiclePlate ? (
                      <div>
                        <div className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          <Truck size={12} className="text-blue-600" />
                          <span>{user.vehiclePlate}</span>
                        </div>
                        {user.vehicleType && (
                          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{user.vehicleType}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium">ยังไม่ผูกรถ</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Phone size={13} className="text-slate-400" />
                      <span>{user.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                      <Mail size={13} className="text-slate-400" />
                      <span>{user.email || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {user.role === 'Admin' ? (
                      <span className="text-slate-400 font-medium">-</span>
                    ) : (
                      <>
                        <div className="font-medium text-slate-900">{user.licenseNo || '-'}</div>
                        <div className="text-slate-400">หมดอายุ: {formatDateThai(user.licenseExpiration)}</div>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'Admin' ? (
                      <span className="text-slate-400 font-medium">-</span>
                    ) : (
                      (() => {
                        if (!user.licenseExpiration) {
                          return <LicenseStatusBadge status="Valid" />;
                        }
                        const expDate = new Date(user.licenseExpiration);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        // 1 month before expiration (approx 30 days)
                        const oneMonthBefore = new Date(expDate);
                        oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1);

                        let calculatedStatus = 'Valid';
                        if (expDate < today) {
                          calculatedStatus = 'Expired';
                        } else if (today >= oneMonthBefore) {
                          calculatedStatus = 'ExpiringSoon';
                        }

                        return <LicenseStatusBadge status={calculatedStatus} />;
                      })()
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEditModal(user)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit size={13} />
                      <span>แก้ไขข้อมูล</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal เพิ่ม/แก้ไข พนักงาน */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-visible relative my-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl sticky top-0 bg-white z-10">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserPlus size={18} className="text-blue-600" />
                <span>{editingUserId ? 'แก้ไขข้อมูลพนักงาน / ผู้ใช้งาน' : 'เพิ่มพนักงาน / ผู้ใช้งานใหม่'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <User size={13} className="text-slate-400" />
                    <span>ชื่อผู้ใช้งาน (Username) *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น somchai01"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={!!editingUserId}
                    className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${editingUserId ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed font-medium' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <User size={13} className="text-slate-400" />
                    <span>ชื่อ-นามสกุล *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น สมชาย ใจดี"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสพนักงาน *
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น DRV-004"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                    disabled={!!editingUserId}
                    className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${editingUserId ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed font-medium' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Shield size={13} className="text-slate-400" />
                    <span>สิทธิ์ผู้ใช้งาน *</span>
                  </label>
                  <CustomScrollSelect
                    value={role}
                    onChange={(val) => setRole(val)}
                    placeholder="เลือกสิทธิ์ผู้ใช้งาน"
                    options={[
                      { label: 'Driver (พนักงานขับรถ)', value: 'Driver' },
                      { label: 'Admin (ผู้ดูแลระบบ)', value: 'Admin' },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone size={13} className="text-slate-400" />
                    <span>เบอร์โทรศัพท์ (10 หลัก) *</span>
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="เช่น 0812345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail size={13} className="text-slate-400" />
                    <span>อีเมล *</span>
                  </label>
                  <input
                    type="email"
                    placeholder="เช่น user@foresee.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    required
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เลขบัตรประชาชน (13 หลัก) *
                </label>
                <input
                  type="text"
                  maxLength={13}
                  placeholder="เช่น 1234567890123"
                  value={idCardNo}
                  onChange={(e) => setIdCardNo(e.target.value.replace(/\D/g, ''))}
                  required
                  disabled={!!editingUserId}
                  className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${editingUserId ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed font-medium' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" />
                  <span>วัน เดือน ปี เกิด (พ.ศ.) *</span>
                </label>
                {editingUserId ? (
                  <input
                    type="text"
                    disabled
                    value={birthDay && birthMonth && birthYearBE ? `${birthDay}/${birthMonth}/${birthYearBE}` : '-'}
                    className="w-full px-3.5 py-2 text-sm bg-slate-100 text-slate-500 border border-slate-200 rounded-lg font-medium cursor-not-allowed"
                  />
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {/* Select วัน */}
                      <CustomScrollSelect
                        value={birthDay}
                        onChange={(val) => setBirthDay(val)}
                        placeholder="วัน *"
                        options={Array.from({ length: 31 }, (_, i) => ({
                          label: `${i + 1}`,
                          value: `${i + 1}`
                        }))}
                      />

                      {/* Select เดือน */}
                      <CustomScrollSelect
                        value={birthMonth}
                        onChange={(val) => setBirthMonth(val)}
                        placeholder="เดือน *"
                        options={[
                          { label: 'มกราคม', value: '1' },
                          { label: 'กุมภาพันธ์', value: '2' },
                          { label: 'มีนาคม', value: '3' },
                          { label: 'เมษายน', value: '4' },
                          { label: 'พฤษภาคม', value: '5' },
                          { label: 'มิถุนายน', value: '6' },
                          { label: 'กรกฎาคม', value: '7' },
                          { label: 'สิงหาคม', value: '8' },
                          { label: 'กันยายน', value: '9' },
                          { label: 'ตุลาคม', value: '10' },
                          { label: 'พฤศจิกายน', value: '11' },
                          { label: 'ธันวาคม', value: '12' }
                        ]}
                      />

                      {/* Select ปี (พ.ศ.) ย้อนหลังไม่เกิน 70 ปี */}
                      <CustomScrollSelect
                        value={birthYearBE}
                        onChange={(val) => setBirthYearBE(val)}
                        placeholder="ปี (พ.ศ.) *"
                        options={Array.from({ length: 71 }, (_, i) => {
                          const currentBE = new Date().getFullYear() + 543;
                          const yr = currentBE - i;
                          return { label: `${yr}`, value: `${yr}` };
                        })}
                      />
                    </div>
                )}
                {/* Automatic Password Preview Badge */}
                {!editingUserId && (
                  getAutoPassword() ? (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200/80 rounded-lg text-xs text-blue-800 flex items-center justify-between">
                      <span>🔑 รหัสผ่านเริ่มต้นอัตโนมัติ ( Password ):</span>
                      <span className="font-mono font-bold tracking-wider text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                        {getAutoPassword()}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 text-[11px] text-slate-400">
                      * รหัสผ่านเริ่มต้นจะถูกตั้งเป็น ดดมมปปปป (เช่น 9 ธ.ค. 2537 → <span className="font-mono font-semibold text-slate-600">09122537</span>)
                    </div>
                  )
                )}
              </div>

              {role === 'Driver' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <FileText size={13} className="text-slate-400" />
                        <span>เลขที่ใบขับขี่ *</span>
                      </label>
                      <input
                        type="text"
                        placeholder="123456789"
                        value={licenseNo}
                        onChange={(e) => setLicenseNo(e.target.value)}
                        required
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <Calendar size={13} className="text-slate-400" />
                        <span>วันหมดอายุใบขับขี่ (พ.ศ.) *</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {/* Select วัน */}
                        <CustomScrollSelect
                          value={licenseExpDay}
                          onChange={(val) => setLicenseExpDay(val)}
                          placeholder="วัน *"
                          options={Array.from({ length: 31 }, (_, i) => ({
                            label: `${i + 1}`,
                            value: `${i + 1}`
                          }))}
                        />

                        {/* Select เดือน */}
                        <CustomScrollSelect
                          value={licenseExpMonth}
                          onChange={(val) => setLicenseExpMonth(val)}
                          placeholder="เดือน *"
                          options={[
                            { label: 'มกราคม', value: '1' },
                            { label: 'กุมภาพันธ์', value: '2' },
                            { label: 'มีนาคม', value: '3' },
                            { label: 'เมษายน', value: '4' },
                            { label: 'พฤษภาคม', value: '5' },
                            { label: 'มิถุนายน', value: '6' },
                            { label: 'กรกฎาคม', value: '7' },
                            { label: 'สิงหาคม', value: '8' },
                            { label: 'กันยายน', value: '9' },
                            { label: 'ตุลาคม', value: '10' },
                            { label: 'พฤศจิกายน', value: '11' },
                            { label: 'ธันวาคม', value: '12' }
                          ]}
                        />

                        {/* Select ปี (พ.ศ.) ตั้งแต่ปีปัจจุบันไปอีก 15 ปี */}
                        <CustomScrollSelect
                          value={licenseExpYearBE}
                          onChange={(val) => setLicenseExpYearBE(val)}
                          placeholder="ปี (พ.ศ.) *"
                          options={Array.from({ length: 20 }, (_, i) => {
                            const currentBE = new Date().getFullYear() + 543;
                            const yr = currentBE - 5 + i;
                            return { label: `${yr}`, value: `${yr}` };
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <Truck size={13} className="text-slate-400" />
                      <span>รถประจำตัว (เลือกจากรถที่ยังไม่ได้ผูกกับพนักงาน)</span>
                    </label>
                    <CustomScrollSelect
                      value={selectedVehicleId}
                      onChange={(val) => setSelectedVehicleId(val)}
                      placeholder="-- เลือกรถประจำตัว --"
                      options={availableVehicles.map((v: any) => ({
                        label: `${v.plateNumber} (${v.vehicleType || v.model || 'ไม่ระบุประเภท'})`,
                        value: String(v.id)
                      }))}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  {editingUserId &&
                    editingUserId !== Number(localStorage.getItem('user_id')) &&
                    username.toLowerCase() !== (localStorage.getItem('username') || 'admin').toLowerCase() && (
                      <button
                        type="button"
                        onClick={() => promptDeleteUser(editingUserId, name || username)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                        <span>ลบพนักงานนี้</span>
                      </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
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
                    <span>{editingUserId ? 'บันทึกการแก้ไข' : 'บันทึกพนักงานใหม่'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="ยืนยันการลบพนักงาน"
        message={`คุณต้องการลบผู้ใช้งาน "${deleteConfirm.userName}" ใช่หรือไม่? (ข้อมูลจะถูก Soft Delete)`}
        confirmText="ยืนยันการลบ"
        cancelText="ยกเลิก"
        type="danger"
        onConfirm={confirmDeleteUser}
        onCancel={() => setDeleteConfirm({ isOpen: false, userId: null, userName: '' })}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
      />
    </div>
  );
};
