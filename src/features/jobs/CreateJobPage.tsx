import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Users,
  FileText,
  UserCheck,
  Truck,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { CustomScrollSelect } from '../../components/common/CustomScrollSelect';
import { ConfirmModal } from '../../components/common/CustomModal';

declare global {
  interface Window {
    google?: any;
  }
}

export const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: jobId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isReadOnly = searchParams.get('readOnly') === 'true';
  const isEditMode = Boolean(jobId);

  const locationSearchRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const googleMarkerRef = useRef<any>(null);

  const [jobNumber, setJobNumber] = useState('');
  const [title, setTitle] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledHour, setScheduledHour] = useState('08');
  const [scheduledMinute, setScheduledMinute] = useState('00');

  // Options for 24-hour picker (00-23) and minutes (00-59)
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const val = String(i).padStart(2, '0');
    return { label: `${val} น.`, value: val };
  });

  const minuteOptions = Array.from({ length: 60 }, (_, i) => {
    const val = String(i).padStart(2, '0');
    return { label: `${val} นาที`, value: val };
  });
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [followers, setFollowers] = useState('');
  const [description, setDescription] = useState('');
  const [pickupLat, setPickupLat] = useState('13.7563');
  const [pickupLng, setPickupLng] = useState('100.5018');
  const [pickupSearch, setPickupSearch] = useState('กรุงเทพมหานคร');
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationSearchRef.current && !locationSearchRef.current.contains(event.target as Node)) {
        setPickupSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize and update Google Map
  useEffect(() => {
    if (mapContainerRef.current && window.google && window.google.maps) {
      const latNum = parseFloat(pickupLat) || 13.7563;
      const lngNum = parseFloat(pickupLng) || 100.5018;
      const center = { lat: latNum, lng: lngNum };

      if (!googleMapRef.current) {
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: center,
          zoom: 15,
          mapTypeControl: true,
        });

        const marker = new window.google.maps.Marker({
          position: center,
          map: map,
          draggable: !isReadOnly,
          title: isReadOnly ? 'ตำแหน่งปฏิบัติงาน' : 'ลากหมุดเพื่อเปลี่ยนตำแหน่ง',
        });

        if (!isReadOnly) {
          marker.addListener('dragend', (event: any) => {
            if (event.latLng) {
              const newLat = event.latLng.lat().toFixed(6);
              const newLng = event.latLng.lng().toFixed(6);
              setPickupLat(newLat);
              setPickupLng(newLng);
            }
          });
        }

        googleMapRef.current = map;
        googleMarkerRef.current = marker;
      } else {
        googleMapRef.current.setCenter(center);
        googleMarkerRef.current.setPosition(center);
      }
    }
  }, [pickupLat, pickupLng]);

  // Real-time Search with actual Latitude & Longitude
  const searchLocationReal = async (query: string) => {
    if (!query.trim()) {
      setPickupSuggestions([]);
      return;
    }

    // Official Google Maps Places Autocomplete & Details API
    if (window.google && window.google.maps && window.google.maps.places) {
      try {
        const autocompleteService = new window.google.maps.places.AutocompleteService();
        const dummyDiv = document.createElement('div');
        const placesService = new window.google.maps.places.PlacesService(dummyDiv);

        autocompleteService.getPlacePredictions(
          {
            input: query,
            componentRestrictions: { country: 'th' },
          },
          (predictions: any[], status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
              const mapped = predictions.map((p: any) => ({
                display_name: p.description,
                place_id: p.place_id,
                getDetails: () => new Promise<{ lat: string; lon: string }>((resolve) => {
                  placesService.getDetails({ placeId: p.place_id }, (place: any, pStatus: any) => {
                    if (pStatus === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
                      resolve({
                        lat: place.geometry.location.lat().toFixed(6),
                        lon: place.geometry.location.lng().toFixed(6),
                      });
                    } else {
                      resolve({ lat: '13.7563', lon: '100.5018' });
                    }
                  });
                })
              }));
              setPickupSuggestions(mapped);
            }
          }
        );
        return;
      } catch (e) {
        // Fallback to OpenStreetMap
      }
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&countrycodes=th&accept-language=th,en`);
      let data = await res.json();
      setPickupSuggestions(data || []);
    } catch (e) {
      setPickupSuggestions([]);
    }
  };
  const [driverId, setDriverId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [jobStatus, setJobStatus] = useState('Pending');
  const [cancellationReason, setCancellationReason] = useState('');

  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch Drivers from Database (Role: Driver)
  const { data: rawUsers = [] } = useQuery({
    queryKey: ['admin-users-drivers'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/admin/users');
        return res.data?.data || [];
      } catch (err) {
        return [];
      }
    },
  });

  // Filter only driver users (or users with role Driver) and map properties
  const drivers = rawUsers
    .filter((u: any) => u.role === 'Driver')
    .map((u: any) => {
      const activeCount = u.activeJobsCount || 0;
      const jobCountText = activeCount > 0 ? ` [ค้าง ${activeCount} งาน]` : ' [ไม่มีงานค้าง]';
      return {
        id: u.id,
        name: `${u.name}${u.employeeId ? ` (${u.employeeId})` : ''}${jobCountText}`,
        defaultVehicleId: u.vehicleId ? String(u.vehicleId) : '',
        status: u.licenseStatus || 'Valid',
        licenseWarning: u.licenseStatus === 'Expired',
        activeJobsCount: activeCount,
      };
    });

  // Fetch Vehicles from Database and filter only available (active & no active jobs)
  const { data: rawVehicles = [] } = useQuery({
    queryKey: ['admin-vehicles-list'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/admin/vehicles');
        return res.data?.data || [];
      } catch (err) {
        return [];
      }
    },
  });

  const vehicles = rawVehicles
    .filter((v: any) => v.isActive && ((v.activeJobsCount || 0) === 0 || String(v.id) === vehicleId))
    .map((v: any) => ({
      id: v.id,
      plate: `${v.plateNumber}${v.vehicleType ? ` (${v.vehicleType})` : ''}${v.model ? ` - ${v.model}` : ''}`,
    }));

  // Fetch existing job for Edit Mode
  const { data: existingJob } = useQuery({
    queryKey: ['admin-job-detail', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      try {
        const res = await apiClient.get(`/api/v1/admin/jobs/${jobId}`);
        return res.data?.data || null;
      } catch (err) {
        return null;
      }
    },
    enabled: isEditMode,
  });

  // Populate form state when editing existing job
  useEffect(() => {
    if (existingJob) {
      if (existingJob.jobNumber) setJobNumber(existingJob.jobNumber);
      if (existingJob.title) setTitle(existingJob.title);
      if (existingJob.description) setDescription(existingJob.description);
      if (existingJob.driverId) setDriverId(String(existingJob.driverId));
      if (existingJob.vehicleId) setVehicleId(String(existingJob.vehicleId));
      if (existingJob.pickupLocation) setPickupSearch(existingJob.pickupLocation);
      if (existingJob.pickupLat) setPickupLat(String(existingJob.pickupLat));
      if (existingJob.pickupLng) setPickupLng(String(existingJob.pickupLng));

      if (existingJob.contactName) setContactName(existingJob.contactName);
      if (existingJob.contactPhone) setContactPhone(existingJob.contactPhone);
      if (existingJob.companions) setFollowers(existingJob.companions);
      if (existingJob.status) setJobStatus(existingJob.status);
      if (existingJob.cancellationReason) setCancellationReason(existingJob.cancellationReason);

      if (existingJob.scheduledDate) setScheduledDate(existingJob.scheduledDate);
      if (existingJob.scheduledTime) {
        const [hh, mm] = existingJob.scheduledTime.split(':');
        if (hh) setScheduledHour(hh);
        if (mm) setScheduledMinute(mm);
      }
    }
  }, [existingJob]);

  const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setDriverId(selectedId);
    
    // Auto-assign driver's default vehicle if available
    const driver = drivers.find((d: any) => d.id === Number(selectedId));
    if (driver && driver.defaultVehicleId) {
      setVehicleId(driver.defaultVehicleId);
    } else {
      setVehicleId('');
    }
  };

  const selectedDriver = drivers.find((d: any) => d.id === Number(driverId));

  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobStatus === 'Cancelled' && !cancellationReason.trim()) {
      setError('กรุณาระบุหมายเหตุ/เหตุผลในการยกเลิกงาน');
      return;
    }
    setIsConfirmSubmitOpen(true);
  };

  const executeSubmit = async () => {
    setIsConfirmSubmitOpen(false);
    setError('');
    setWarning('');
    setLoading(true);

    try {
      const scheduledStartAt = scheduledDate ? `${scheduledDate}T${scheduledHour}:${scheduledMinute}:00` : null;
      const payload = {
        title,
        description,
        status: isEditMode ? jobStatus : undefined,
        cancellationReason: jobStatus === 'Cancelled' ? cancellationReason : null,
        scheduledStartAt,
        pickupLocation: pickupSearch || 'กรุงเทพมหานคร',
        pickupLat: pickupLat ? parseFloat(pickupLat) : null,
        pickupLng: pickupLng ? parseFloat(pickupLng) : null,
        contactName,
        contactPhone,
        companions: followers,
        driverId: driverId ? Number(driverId) : null,
        vehicleId: vehicleId ? Number(vehicleId) : null,
      };

      const res = isEditMode
        ? await apiClient.put(`/api/v1/admin/jobs/${jobId}`, payload)
        : await apiClient.post('/api/v1/admin/jobs', payload);

      if (res.data.success) {
        if (res.data.warnings && res.data.warnings.length > 0) {
          setWarning(res.data.warnings.join(', '));
        } else {
          navigate('/jobs');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || (isEditMode ? 'เกิดข้อผิดพลาดในการแก้ไขงาน' : 'เกิดข้อผิดพลาดในการสร้างงาน'));
    } finally {
      setLoading(false);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteJob = async () => {
    try {
      setLoading(true);
      await apiClient.delete(`/api/v1/admin/jobs/${jobId}`);
      navigate('/jobs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบงาน');
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Confirmation Modal for Create / Edit */}
      <ConfirmModal
        isOpen={isConfirmSubmitOpen}
        onCancel={() => setIsConfirmSubmitOpen(false)}
        onConfirm={executeSubmit}
        title={isEditMode ? 'ยืนยันการบันทึกการแก้ไข' : 'ยืนยันการบันทึกสร้างงานใหม่'}
        message={isEditMode ? 'คุณแน่ใจหรือไม่ว่าต้องการบันทึกการแก้ไขข้อมูลงานนี้?' : 'คุณแน่ใจหรือไม่ว่าต้องการบันทึกสร้างงานขนส่งใหม่นี้?'}
        confirmText={isEditMode ? 'ยืนยันบันทึก' : 'ยืนยันสร้างงาน'}
        cancelText="ยกเลิก"
        type="info"
      />

      {/* Confirmation Modal for Delete */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteJob}
        title="ยืนยันการลบงาน"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        confirmText="ลบงานนี้"
        cancelText="ยกเลิก"
        type="danger"
      />

      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(isReadOnly ? '/jobs/history' : '/jobs')}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>ย้อนกลับ</span>
        </button>
        <div className="flex-1 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {isReadOnly ? 'รายละเอียดประวัติงานขนส่ง (View Job Details)' : isEditMode ? 'แก้ไขรายละเอียดงานขนส่ง (Edit Job)' : 'สร้างงานขนส่งใหม่ (Create Job)'}
          </h2>
          {isEditMode && jobNumber && (
            <span className="px-3 py-1 bg-blue-50 text-blue-700 font-mono text-xs font-semibold rounded-lg border border-blue-200">
              เลขที่งาน: {jobNumber}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
          {error}
        </div>
      )}
      {warning && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl flex items-center gap-2">
          <AlertTriangle size={18} className="shrink-0 text-amber-600" />
          <span>{warning}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Section 1: ข้อมูลทั่วไปของงาน */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <span>ข้อมูลทั่วไปของงาน</span>
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700 whitespace-nowrap flex items-center gap-1">
                <UserCheck size={14} className="text-slate-400" />
                <span>สถานะงาน:</span>
              </label>
              <select
                value={jobStatus}
                onChange={(e) => setJobStatus(e.target.value)}
                disabled={isReadOnly}
                className={`px-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold cursor-pointer transition-colors disabled:opacity-80 disabled:cursor-not-allowed ${
                  jobStatus === 'Pending'
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : jobStatus === 'Assigned'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : jobStatus === 'Started'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                    : jobStatus === 'Arrived'
                    ? 'bg-sky-50 text-sky-700 border-sky-300'
                    : jobStatus === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : jobStatus === 'Cancelled'
                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                    : 'bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <option value="Pending" className="bg-white text-amber-700 font-semibold">● รอมอบหมาย (Pending)</option>
                <option value="Assigned" className="bg-white text-blue-700 font-semibold">● มอบหมายแล้ว (Assigned)</option>
                <option value="Started" className="bg-white text-indigo-700 font-semibold">● เริ่มเดินทาง (Started)</option>
                <option value="Arrived" className="bg-white text-sky-700 font-semibold">● ถึงจุดหมาย (Arrived)</option>
                <option value="Completed" className="bg-white text-emerald-700 font-semibold">● เสร็จสิ้น (Completed)</option>
                <option value="Cancelled" className="bg-white text-rose-700 font-semibold">● ยกเลิก (Cancelled)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isEditMode && jobNumber && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เลขที่งาน (Job Number)
                </label>
                <input
                  type="text"
                  value={jobNumber}
                  disabled
                  className="w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono font-semibold"
                />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หัวข้องาน *
              </label>
              <input
                type="text"
                placeholder="เช่น ขนส่งสินค้า กรุงเทพฯ - ชลบุรี"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isReadOnly}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar size={14} className="text-slate-400" />
                <span>วันที่ปฏิบัติงาน *</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                disabled={isReadOnly}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock size={14} className="text-slate-400" />
                <span>เวลาถึงที่หมาย *</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <CustomScrollSelect
                  value={scheduledHour}
                  onChange={(val) => setScheduledHour(val)}
                  placeholder="ชั่วโมง"
                  options={hourOptions}
                  disabled={isReadOnly}
                />
                <CustomScrollSelect
                  value={scheduledMinute}
                  onChange={(val) => setScheduledMinute(val)}
                  placeholder="นาที"
                  options={minuteOptions}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User size={14} className="text-slate-400" />
                <span>ชื่อผู้ติดต่อ *</span>
              </label>
              <input
                type="text"
                placeholder="ชื่อผู้รับหรือผู้สั่งงาน"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                disabled={isReadOnly}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone size={14} className="text-slate-400" />
                <span>เบอร์โทรผู้ติดต่อ *</span>
              </label>
              <input
                type="tel"
                placeholder="0812345678"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ''))}
                required
                maxLength={10}
                disabled={isReadOnly}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Users size={14} className="text-slate-400" />
                <span>ผู้ติดตาม / พนักงานร่วมเดินทาง</span>
              </label>
              <input
                type="text"
                placeholder="ระบุชื่อผู้ติดตาม (ถ้ามี)"
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
                disabled={isReadOnly}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รายละเอียดอื่นๆ / หมายเหตุเพิ่มเติม
              </label>
              <textarea
                rows={3}
                placeholder="ระบุรายละเอียดสินค้า หรือข้อควรระวังในการเดินทาง..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isReadOnly}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: สถานที่ปฏิบัติงาน (Google Maps Native Search Map) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin size={18} className="text-blue-600" />
            <span>สถานที่ปฏิบัติงาน (Google Maps Search & Location)</span>
          </h3>

          <div ref={locationSearchRef} className="relative">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin size={14} className="text-blue-600" />
              <span>ชื่อสถานที่ / ที่อยู่ปฏิบัติงาน (Location Name) *</span>
            </label>
            <input
              type="text"
              placeholder="พิมพ์ชื่อสถานที่เพื่อค้นหา แล้วกดเลือกรายการหรือกด Enter เพื่อปักหมุด..."
              value={pickupSearch}
              onChange={(e) => {
                const val = e.target.value;
                setPickupSearch(val);
                searchLocationReal(val);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setPickupSuggestions([]);
                }
              }}
              required
              disabled={isReadOnly}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
            />

            {/* Live Location Suggestions Dropdown Menu (Google Maps Places Style) */}
            {!isReadOnly && pickupSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-30 max-h-64 overflow-y-auto divide-y divide-slate-100 overflow-hidden">
                {pickupSuggestions.map((s, idx) => {
                  const parts = s.display_name.split(',');
                  const title = parts[0] || s.display_name;
                  const subtitle = parts.slice(1).join(',').trim();

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={async () => {
                        setPickupSearch(s.display_name);
                        setPickupSuggestions([]);
                        if (s.getDetails) {
                          const details = await s.getDetails();
                          setPickupLat(details.lat);
                          setPickupLng(details.lon);
                        } else if (s.lat && s.lon) {
                          setPickupLat(s.lat);
                          setPickupLng(s.lon);
                        }
                      }}
                      className="w-full text-left px-4 py-3 text-xs hover:bg-blue-50/80 transition-colors flex items-start gap-3 cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors mt-0.5">
                        <MapPin size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-slate-800 text-xs block truncate group-hover:text-blue-600 transition-colors">
                          {title}
                        </span>
                        {subtitle && (
                          <span className="text-[11px] text-slate-400 block truncate mt-0.5 font-normal">
                            {subtitle}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin size={14} className="text-blue-600" />
                <span>Latitude (ละติจูด) *</span>
              </label>
              <input
                type="text"
                value={pickupLat}
                readOnly
                required
                placeholder="พิมพ์ชื่อสถานที่เพื่อค้นหา หรือลากปักหมุดในแผนที่ด้านล่าง..."
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-100/80 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed select-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin size={14} className="text-blue-600" />
                <span>Longitude (ลองจิจูด) *</span>
              </label>
              <input
                type="text"
                value={pickupLng}
                readOnly
                required
                placeholder="พิมพ์ชื่อสถานที่เพื่อค้นหา หรือลากปักหมุดในแผนที่ด้านล่าง..."
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-100/80 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* Native Draggable Google Maps JS API Canvas */}
          <div className="space-y-1">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>{isReadOnly ? 'พิกัดตำแหน่งปฏิบัติงานในแผนที่' : 'สามารถคลิก หรือเลื่อนลากหมุด (Drag Marker) บน Google Maps เพื่อปรับตำแหน่งพิกัดได้ตามต้องการ'}</span>
              <span className="font-mono text-[11px] font-semibold text-blue-600">
                {isReadOnly ? 'Google Maps View Only' : 'Draggable Google Maps Pin Active'}
              </span>
            </div>

            <div 
              ref={mapContainerRef}
              className="h-96 rounded-2xl border border-slate-200 overflow-hidden relative shadow-md bg-slate-100"
            />
          </div>
        </div>

        {/* Section 3: มอบหมายพนักงานและรถ (Assign Driver & Vehicle Separate Dropdowns) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserCheck size={18} className="text-blue-600" />
            <span>มอบหมายงาน (Assign Driver & Vehicle)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dropdown 1: พนักงานขับรถ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User size={14} className="text-slate-400" />
                <span>เลือกพนักงานขับรถ (Driver)</span>
              </label>
              <select
                value={driverId}
                onChange={handleDriverChange}
                disabled={isReadOnly}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
              >
                <option value="">-- ไม่ระบุ (Pending) --</option>
                {drivers.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.status === 'Expired' ? '(⚠️ ใบขับขี่หมดอายุ)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown 2: ยานพาหนะ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Truck size={14} className="text-slate-400" />
                <span>เลือกรถ / ยานพาหนะ (Vehicle)</span>
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                disabled={isReadOnly}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
              >
                <option value="">-- ไม่ระบุ --</option>
                {vehicles.map((v: any) => (
                  <option key={v.id} value={v.id}>
                    {v.plate}
                  </option>
                ))}
              </select>
            </div>

            {/* Remark / Cancellation Reason when Cancelled */}
            {jobStatus === 'Cancelled' && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-rose-700 mb-1 flex items-center gap-1">
                  <AlertTriangle size={14} className="text-rose-600" />
                  <span>หมายเหตุ / เหตุผลในการยกเลิกงาน (Cancellation Remark) *</span>
                </label>
                <textarea
                  rows={2}
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  required
                  disabled={isReadOnly}
                  placeholder="ระบุเหตุผลในการยกเลิกงาน..."
                  className="w-full px-3.5 py-2 text-sm bg-rose-50/50 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-800 disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
                />
              </div>
            )}
          </div>

          {/* License Warning Box */}
          {selectedDriver && selectedDriver.licenseWarning && (
            <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">คำเตือน:</span> พนักงานท่านนี้ใบอนุญาตขับขี่หมดอายุแล้ว แต่ระบบยินยอมให้มอบหมายงานได้ (Warning Only)
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          {!isReadOnly && isEditMode ? (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-medium text-sm rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 size={16} />
              <span>ลบงานนี้</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(isReadOnly ? '/jobs/history' : '/jobs')}
              className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {isReadOnly ? 'ปิดหน้าต่าง' : 'ยกเลิก'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
              >
                <Save size={18} />
                <span>{loading ? 'กำลังบันทึก...' : isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกสร้างงานใหม่'}</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
