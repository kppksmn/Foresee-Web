import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Trash2,
  Pencil
} from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { CustomScrollSelect } from '../../components/common/CustomScrollSelect';
import { ConfirmModal } from '../../components/common/CustomModal';
import { FormControl, Select, MenuItem } from '@mui/material';
import { formatDateThai, formatPhoneNumber } from '../../utils/dateUtils';
import { useMenuPermission } from '../../hooks/useMenuPermission';

declare global {
  interface Window {
    google?: any;
  }
}

export const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id: jobId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const permissions = useMenuPermission('/jobs');
  const isRequestedReadOnly = searchParams.get('readOnly') === 'true';
  const isEditMode = Boolean(jobId);
  const isReadOnly = isRequestedReadOnly || (isEditMode && !permissions.canUpdate);

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
    return { label: val, value: val };
  });

  const minuteOptions = Array.from({ length: 60 }, (_, i) => {
    const val = String(i).padStart(2, '0');
    return { label: val, value: val };
  });
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [followers, setFollowers] = useState('');
  const [companionId, setCompanionId] = useState('');
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
  const [lastSelectedDriverId, setLastSelectedDriverId] = useState('');
  const [lastSelectedVehicleId, setLastSelectedVehicleId] = useState('');
  const [jobStatus, setJobStatus] = useState('Pending');
  const [cancellationReason, setCancellationReason] = useState('');

  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

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
    enabled: !isReadOnly,
  });

  // Fetch active jobs to detect scheduling conflicts for drivers and companions
  const { data: rawActiveJobs = [] } = useQuery({
    queryKey: ['admin-jobs-active-conflict'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/api/v1/admin/jobs?mode=active');
        return res.data?.data || [];
      } catch (err) {
        return [];
      }
    },
    enabled: !isReadOnly,
  });

  // Helper to check if an employee has a conflicting active job at the selected arrival date & time
  const getEmployeeConflictJob = (userId: number | string) => {
    if (!scheduledDate) return null;
    const targetTime = `${scheduledHour}:${scheduledMinute}`;
    const uId = Number(userId);
    if (!uId) return null;

    return rawActiveJobs.find((j: any) => {
      // If editing, ignore current job being edited
      if (isEditMode && String(j.id) === String(jobId)) return false;
      // Must be active job (status not Completed or Cancelled)
      if (j.status === 'Completed' || j.status === 'Cancelled') return false;

      let jDate = j.scheduledDate || j.scheduleddate;
      let jTime = j.scheduledTime || j.scheduledtime;
      if (!jDate && j.scheduledStartAt) {
        const parts = String(j.scheduledStartAt).split('T');
        jDate = parts[0];
        jTime = parts[1]?.slice(0, 5);
      }

      if (jDate === scheduledDate && jTime === targetTime) {
        const isDriver = Number(j.driverId || j.driverid) === uId;
        const isCompanion = Number(j.companionId || j.companionid) === uId;
        return isDriver || isCompanion;
      }
      return false;
    });
  };

  // Helper to check if a vehicle has a conflicting active job at the selected arrival date & time
  const getVehicleConflictJob = (vId: number | string) => {
    if (!scheduledDate) return null;
    const targetTime = `${scheduledHour}:${scheduledMinute}`;
    const vehicleIdNum = Number(vId);
    if (!vehicleIdNum) return null;

    return rawActiveJobs.find((j: any) => {
      if (isEditMode && String(j.id) === String(jobId)) return false;
      if (j.status === 'Completed' || j.status === 'Cancelled') return false;

      let jDate = j.scheduledDate || j.scheduleddate;
      let jTime = j.scheduledTime || j.scheduledtime;
      if (!jDate && j.scheduledStartAt) {
        const parts = String(j.scheduledStartAt).split('T');
        jDate = parts[0];
        jTime = parts[1]?.slice(0, 5);
      }

      if (jDate === scheduledDate && jTime === targetTime) {
        return Number(j.vehicleId || j.vehicleid) === vehicleIdNum;
      }
      return false;
    });
  };

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

  // Filter only driver users (or users with role Driver) and map properties
  const drivers = useMemo(() => {
    return rawUsers
      .filter((u: any) => u.role === 'Driver')
      .map((u: any) => {
        const activeCount = u.activeJobsCount || 0;
        const jobCountText = activeCount > 0 ? ` [ค้าง ${activeCount} งาน]` : ' [ไม่มีงานค้าง]';
        const baseName = `${u.name}${u.employeeId ? ` (${u.employeeId})` : ''}`;
        return {
          id: u.id,
          name: `${baseName}${jobCountText}`,
          baseName,
          defaultVehicleId: u.vehicleId ? String(u.vehicleId) : '',
          status: u.licenseStatus || 'Valid',
          licenseWarning: u.licenseStatus === 'Expired',
          activeJobsCount: activeCount,
        };
      });
  }, [rawUsers]);

  // Options for Driver Dropdown: available (no conflict) first, then alphabetical (ก-ฮ)
  const driverOptions = useMemo(() => {
    const opts = drivers
      .filter((d: any) => !companionId || String(d.id) !== String(companionId))
      .map((d: any) => {
        const conflict = getEmployeeConflictJob(d.id);
        const isExpired = d.status === 'Expired';
        let label = d.name;
        if (conflict) {
          label = `${d.baseName} ⛔ (ติดงาน ${conflict.jobNumber || ''} เวลา ${conflict.scheduledTime || `${scheduledHour}:${scheduledMinute}`})`;
        } else if (isExpired) {
          label = `${d.baseName} ⛔ (ใบขับขี่หมดอายุ - ไม่สามารถเลือกได้)`;
        }
        return {
          label,
          value: String(d.id),
          disabled: Boolean(conflict) || isExpired,
          activeJobsCount: d.activeJobsCount || 0,
          rawName: d.baseName || d.name,
        };
      })
      .sort((a: any, b: any) => {
        if (!a.disabled && b.disabled) return -1;
        if (a.disabled && !b.disabled) return 1;
        const aCount = a.activeJobsCount || 0;
        const bCount = b.activeJobsCount || 0;
        if (aCount === 0 && bCount > 0) return -1;
        if (aCount > 0 && bCount === 0) return 1;
        if (aCount !== bCount) return aCount - bCount;
        return a.rawName.localeCompare(b.rawName, 'th');
      });

    if (driverId && !opts.some((o: any) => String(o.value) === String(driverId))) {
      const label = existingJob?.driverName || `พนักงาน #${driverId}`;
      opts.unshift({ label, value: String(driverId), disabled: false, rawName: label });
    }

    return opts;
  }, [drivers, companionId, scheduledDate, scheduledHour, scheduledMinute, rawActiveJobs, isEditMode, jobId, driverId, existingJob]);

  // Options for Companion Dropdown: available (no conflict) first, then alphabetical (ก-ฮ)
  const companionOptions = useMemo(() => {
    const opts = drivers
      .filter((d: any) => !driverId || String(d.id) !== String(driverId))
      .map((d: any) => {
        const conflict = getEmployeeConflictJob(d.id);
        const isExpired = d.status === 'Expired';
        let label = d.name;
        if (conflict) {
          label = `${d.baseName} ⛔ (ติดงาน ${conflict.jobNumber || ''} เวลา ${conflict.scheduledTime || `${scheduledHour}:${scheduledMinute}`})`;
        } else if (isExpired) {
          label = `${d.baseName} ⛔ (ใบขับขี่หมดอายุ - ไม่สามารถเลือกได้)`;
        }
        return {
          label,
          value: String(d.id),
          disabled: Boolean(conflict) || isExpired,
          activeJobsCount: d.activeJobsCount || 0,
          rawName: d.baseName || d.name,
        };
      })
      .sort((a: any, b: any) => {
        if (!a.disabled && b.disabled) return -1;
        if (a.disabled && !b.disabled) return 1;
        const aCount = a.activeJobsCount || 0;
        const bCount = b.activeJobsCount || 0;
        if (aCount === 0 && bCount > 0) return -1;
        if (aCount > 0 && bCount === 0) return 1;
        if (aCount !== bCount) return aCount - bCount;
        return a.rawName.localeCompare(b.rawName, 'th');
      });

    if (companionId && !opts.some((o: any) => String(o.value) === String(companionId))) {
      const label = existingJob?.companionName || `ผู้ร่วมเดินทาง #${companionId}`;
      opts.unshift({ label, value: String(companionId), disabled: false, rawName: label });
    }

    return opts;
  }, [drivers, driverId, scheduledDate, scheduledHour, scheduledMinute, rawActiveJobs, isEditMode, jobId, companionId, existingJob]);

  // Fetch Vehicles from Database
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
    enabled: !isReadOnly,
  });

  // Options for Vehicle Dropdown: available (no conflict) first, then alphabetical (ก-ฮ / เลขทะเบียน)
  const vehicleOptions = useMemo(() => {
    const opts = rawVehicles
      .filter((v: any) => v.isActive)
      .map((v: any) => {
        const conflict = getVehicleConflictJob(v.id);
        const activeCount = v.activeJobsCount || 0;
        const jobCountText = activeCount > 0 ? ` [ค้าง ${activeCount} งาน]` : ' [ไม่มีงานค้าง]';
        const basePlate = `${v.plateNumber}${v.vehicleType ? ` (${v.vehicleType})` : ''}${v.model ? ` - ${v.model}` : ''}`;
        
        let label = `${basePlate}${jobCountText}`;
        if (conflict) {
          label = `${basePlate} ⛔ (ติดงาน ${conflict.jobNumber || ''} เวลา ${conflict.scheduledTime || `${scheduledHour}:${scheduledMinute}`})`;
        }

        return {
          label,
          value: String(v.id),
          disabled: Boolean(conflict),
          activeJobsCount: activeCount,
          rawPlate: v.plateNumber || basePlate,
        };
      })
      .sort((a: any, b: any) => {
        if (!a.disabled && b.disabled) return -1;
        if (a.disabled && !b.disabled) return 1;
        const aCount = a.activeJobsCount || 0;
        const bCount = b.activeJobsCount || 0;
        if (aCount === 0 && bCount > 0) return -1;
        if (aCount > 0 && bCount === 0) return 1;
        if (aCount !== bCount) return aCount - bCount;
        return a.rawPlate.localeCompare(b.rawPlate, 'th');
      });

    if (vehicleId && !opts.some((o: any) => String(o.value) === String(vehicleId))) {
      const label = existingJob?.vehiclePlate ? `${existingJob.vehiclePlate}${existingJob.vehicleType ? ` (${existingJob.vehicleType})` : ''}` : `ยานพาหนะ #${vehicleId}`;
      opts.unshift({ label, value: String(vehicleId), disabled: false, rawPlate: label });
    }

    return opts;
  }, [rawVehicles, scheduledDate, scheduledHour, scheduledMinute, rawActiveJobs, isEditMode, jobId, vehicleId, existingJob]);

  // Populate form state when editing existing job
  useEffect(() => {
    if (isEditMode && existingJob) {
      setJobNumber(existingJob.jobNumber || '');
      setTitle(existingJob.title || '');
      setDescription(existingJob.description || '');
      const dId = existingJob.driverId ? String(existingJob.driverId) : '';
      const vId = existingJob.vehicleId ? String(existingJob.vehicleId) : '';
      setDriverId(dId);
      setVehicleId(vId);
      setLastSelectedDriverId(dId);
      setLastSelectedVehicleId(vId);
      setPickupSearch(existingJob.pickupLocation || '');
      setPickupLat(existingJob.pickupLat ? String(existingJob.pickupLat) : '');
      setPickupLng(existingJob.pickupLng ? String(existingJob.pickupLng) : '');

      setContactName(existingJob.contactName || '');
      setContactPhone(existingJob.contactPhone || '');
      setFollowers(existingJob.companions || existingJob.companionName || '');
      setCompanionId(existingJob.companionId ? String(existingJob.companionId) : (existingJob.companion_id ? String(existingJob.companion_id) : ''));
      setJobStatus(existingJob.status || 'Pending');
      setCancellationReason(existingJob.cancellationReason || '');

      setScheduledDate(existingJob.scheduledDate || '');
      if (existingJob.scheduledTime) {
        const [hh, mm] = existingJob.scheduledTime.split(':');
        setScheduledHour(hh || '08');
        setScheduledMinute(mm || '00');
      } else {
        setScheduledHour('08');
        setScheduledMinute('00');
      }
    } else if (!isEditMode) {
      setJobNumber('');
      setTitle('');
      setDescription('');
      setDriverId('');
      setVehicleId('');
      setCompanionId('');
      setPickupSearch('');
      setPickupLat('');
      setPickupLng('');
      setContactName('');
      setContactPhone('');
      setFollowers('');
      setJobStatus('Pending');
      setCancellationReason('');
      setScheduledDate('');
      setScheduledHour('08');
      setScheduledMinute('00');
    }
  }, [existingJob, isEditMode]);

  const statusColorConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
    Pending: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d', label: 'รอมอบหมาย (Pending)' },
    Assigned: { bg: '#eff6ff', text: '#1d4ed8', border: '#93c5fd', label: 'มอบหมายแล้ว (Assigned)' },
    Started: { bg: '#eef2ff', text: '#4338ca', border: '#a5b4fc', label: 'เริ่มเดินทาง (Started)' },
    Arrived: { bg: '#f0f9ff', text: '#0369a1', border: '#7dd3fc', label: 'ถึงจุดหมาย (Arrived)' },
    Completed: { bg: '#ecfdf5', text: '#047857', border: '#6ee7b7', label: 'เสร็จสิ้น (Completed)' },
    Cancelled: { bg: '#fff1f2', text: '#be123c', border: '#fda4af', label: 'ยกเลิก (Cancelled)' },
  };

  const handleDriverChange = (selectedId: string) => {
    setDriverId(selectedId);
    if (selectedId) setLastSelectedDriverId(selectedId);
    
    // If same driver was selected as companion, clear companion
    if (selectedId && selectedId === companionId) {
      setCompanionId('');
      setFollowers('');
    }

    if (!selectedId) {
      // If driver is removed, automatically set status to Pending
      if (jobStatus !== 'Pending') {
        setJobStatus('Pending');
      }
    } else {
      // If driver is assigned and status was Pending, auto-upgrade to Assigned
      if (jobStatus === 'Pending') {
        setJobStatus('Assigned');
      }
      setError('');
    }
    
    // Auto-assign driver's default vehicle if available and not conflicting at this scheduled time
    const driver = drivers.find((d: any) => d.id === Number(selectedId));
    let newVehId = '';
    if (driver && driver.defaultVehicleId) {
      newVehId = String(driver.defaultVehicleId);
    } else if (driver && driver.vehicleId) {
      newVehId = String(driver.vehicleId);
    }
    if (newVehId && getVehicleConflictJob(newVehId)) {
      newVehId = '';
    }
    setVehicleId(newVehId);
    if (newVehId) setLastSelectedVehicleId(newVehId);
  };

  const selectedDriver = drivers.find((d: any) => d.id === Number(driverId));

  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    
    // Rule: Non-Pending & Non-Cancelled status MUST have both driver and vehicle assigned
    if (jobStatus !== 'Pending' && jobStatus !== 'Cancelled') {
      if (!driverId || !vehicleId) {
        // Show inline error below fields without global banner alert
        return;
      }
    }

    // Validate driver license expiration
    if (driverId && selectedDriver?.status === 'Expired') {
      setError(`ไม่สามารถมอบหมายงานให้ได้ เนื่องจากใบอนุญาตขับขี่ของพนักงานขับรถ (${selectedDriver?.baseName || 'ที่เลือก'}) หมดอายุแล้ว`);
      return;
    }

    // Validate companion license expiration
    if (companionId) {
      const compObj = drivers.find((d: any) => String(d.id) === String(companionId));
      if (compObj?.status === 'Expired') {
        setError(`ไม่สามารถมอบหมายงานให้ได้ เนื่องจากใบอนุญาตขับขี่ของผู้ติดตาม (${compObj?.baseName || 'ที่เลือก'}) หมดอายุแล้ว`);
        return;
      }
    }

    // Validate driver schedule conflict at the selected appointment date & time
    if (driverId) {
      const driverConflict = getEmployeeConflictJob(driverId);
      if (driverConflict) {
        setError(`พนักงานขับรถ (${selectedDriver?.baseName || 'ที่เลือก'}) มีงานอื่นที่ยังไม่เสร็จสิ้นตรงกับวันที่และเวลานัดหมายนี้แล้ว (เลขที่งาน: ${driverConflict.jobNumber || ''})`);
        return;
      }
    }

    // Validate companion schedule conflict at the selected appointment date & time
    if (companionId) {
      const companionConflict = getEmployeeConflictJob(companionId);
      if (companionConflict) {
        const compObj = drivers.find((d: any) => String(d.id) === String(companionId));
        setError(`ผู้ติดตาม (${compObj?.baseName || 'ที่เลือก'}) มีงานอื่นที่ยังไม่เสร็จสิ้นตรงกับวันที่และเวลานัดหมายนี้แล้ว (เลขที่งาน: ${companionConflict.jobNumber || ''})`);
        return;
      }
    }

    // Validate vehicle schedule conflict at the selected appointment date & time
    if (vehicleId) {
      const vehicleConflict = getVehicleConflictJob(vehicleId);
      if (vehicleConflict) {
        const vehObj = rawVehicles.find((v: any) => String(v.id) === String(vehicleId));
        setError(`รถ (${vehObj?.plateNumber || 'ที่เลือก'}) มีงานอื่นที่ยังไม่เสร็จสิ้นตรงกับวันที่และเวลานัดหมายนี้แล้ว (เลขที่งาน: ${vehicleConflict.jobNumber || ''})`);
        return;
      }
    }

    if (jobStatus === 'Cancelled' && !cancellationReason.trim()) {
      setError('กรุณาระบุหมายเหตุ/เหตุผลในการยกเลิกงาน');
      return;
    }
    setError('');
    setIsConfirmSubmitOpen(true);
  };

  const executeSubmit = async () => {
    setIsConfirmSubmitOpen(false);
    setError('');
    setWarning('');
    setLoading(true);

    try {
      const scheduledStartAt = scheduledDate ? `${scheduledDate}T${scheduledHour}:${scheduledMinute}:00+07:00` : null;
      const companionObj = drivers.find((d: any) => String(d.id) === String(companionId));
      const companionName = companionObj ? companionObj.name : (followers || null);

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
        companionId: companionId ? Number(companionId) : null,
        companions: companionName,
        driverId: driverId ? Number(driverId) : null,
        vehicleId: vehicleId ? Number(vehicleId) : null,
      };

      const res = isEditMode
        ? await apiClient.put(`/api/v1/admin/jobs/${jobId}`, payload)
        : await apiClient.post('/api/v1/admin/jobs', payload);

      if (res.data.success) {
        await queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
        await queryClient.invalidateQueries({ queryKey: ['admin-job-detail', jobId] });
        await queryClient.invalidateQueries({ queryKey: ['admin-users-drivers'] });
        await queryClient.invalidateQueries({ queryKey: ['admin-vehicles-list'] });

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
      await queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-job-detail', jobId] });
      navigate('/jobs');
    } catch (err: any) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบงาน');
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (!permissions.isLoading && !isEditMode && !permissions.canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-xl mx-auto mt-8 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3.5 shadow-xs">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-1.5">
          คุณไม่มีสิทธิ์สร้างงานใหม่ (Create Permission Required)
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">
          บัญชีผู้ใช้งานของคุณไม่ได้รับสิทธิ์ในการสร้างงานใหม่ กรุณาติดต่อผู้ดูแลระบบเพื่อขอเปิดสิทธิ์การใช้งาน
        </p>
        <button
          onClick={() => navigate('/jobs')}
          className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
        >
          กลับหน้ารายการงาน
        </button>
      </div>
    );
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(isReadOnly ? '/jobs/history' : '/jobs')}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={18} />
            <span>ย้อนกลับ</span>
          </button>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate flex items-center gap-2">
            {isEditMode && !isReadOnly && <Pencil size={20} className="text-blue-600 shrink-0" />}
            <span>{isReadOnly ? 'รายละเอียดงานขนส่ง' : isEditMode ? 'แก้ไขงานขนส่ง' : 'สร้างงานขนส่งใหม่'}</span>
          </h2>
        </div>
        {isEditMode && jobNumber && (
          <span className="self-start sm:self-auto px-3 py-1 bg-blue-50 text-blue-700 font-mono text-xs font-semibold rounded-lg border border-blue-200">
            เลขที่งาน: {jobNumber}
          </span>
        )}
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
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <span>ข้อมูลทั่วไปของงาน</span>
            </h3>
            <div className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[220px]">
              <label className="text-xs font-semibold text-slate-700 whitespace-nowrap flex items-center gap-1">
                <UserCheck size={14} className="text-slate-400" />
                <span>สถานะงาน:</span>
              </label>
              <div className="flex-1">
                <FormControl size="small" fullWidth disabled={isReadOnly}>
                  <Select
                    value={jobStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      const oldStatus = jobStatus;
                      setJobStatus(newStatus);
                      
                      if (newStatus === 'Pending') {
                        // Clear inputs when changing to Pending
                        setDriverId('');
                        setVehicleId('');
                      } else if (oldStatus === 'Pending') {
                        // Restore previous selections when switching away from Pending
                        setDriverId(lastSelectedDriverId);
                        setVehicleId(lastSelectedVehicleId);
                      }
                      setError('');
                    }}
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      backgroundColor: isReadOnly ? '#f1f5f9' : '#f8fafc',
                      color: (statusColorConfig[jobStatus] || statusColorConfig.Pending).text,
                      borderRadius: '0.5rem',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e2e8f0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                        borderWidth: '1.5px',
                      },
                      '& .MuiSelect-select': {
                        paddingTop: '6px',
                        paddingBottom: '6px',
                        paddingLeft: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      },
                    }}
                    MenuProps={{
                      slotProps: {
                        paper: {
                          sx: {
                            borderRadius: '0.5rem',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e2e8f0',
                            marginTop: '4px',
                          },
                        },
                      },
                    }}
                  >
                    {Object.entries(statusColorConfig).map(([stKey, stVal]) => (
                      <MenuItem
                        key={stKey}
                        value={stKey}
                        sx={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: stVal.text,
                          py: 1,
                          '&:hover': {
                            backgroundColor: '#f8fafc',
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#f1f5f9',
                            color: stVal.text,
                            fontWeight: 700,
                            '&:hover': {
                              backgroundColor: '#e2e8f0',
                            },
                          },
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: stVal.text,
                            marginRight: 8,
                          }}
                        ></span>
                        {stVal.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
                <span>เวลานัดหมาย *</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <CustomScrollSelect
                    value={scheduledHour}
                    onChange={(val) => setScheduledHour(val)}
                    options={hourOptions}
                    disabled={isReadOnly}
                  />
                  <CustomScrollSelect
                    value={scheduledMinute}
                    onChange={(val) => setScheduledMinute(val)}
                    options={minuteOptions}
                    disabled={isReadOnly}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600 shrink-0">น.</span>
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
                placeholder="เช่น 0812345678 หรือ 021234567"
                value={isReadOnly ? formatPhoneNumber(contactPhone) : contactPhone}
                onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                maxLength={10}
                disabled={isReadOnly}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed font-mono"
              />
              {!isReadOnly && contactPhone && (
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  รูปแบบ: <span className="font-semibold text-blue-600">{formatPhoneNumber(contactPhone)}</span>
                </p>
              )}
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
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 border-b border-slate-100 pb-3">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
                placeholder="พิมพ์ชื่อสถานที่เพื่อค้นหา..."
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
                placeholder="พิมพ์ชื่อสถานที่เพื่อค้นหา..."
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-100/80 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* Native Draggable Google Maps JS API Canvas */}
          <div className="space-y-1">
            <div className="text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span>{isReadOnly ? 'พิกัดตำแหน่งปฏิบัติงานในแผนที่' : 'สามารถคลิก หรือเลื่อนลากหมุดบนแผนที่เพื่อปรับพิกัดได้'}</span>
              <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-blue-600">
                {isReadOnly ? 'Google Maps View Only' : 'Draggable Pin Active'}
              </span>
            </div>

            <div 
              ref={mapContainerRef}
              className="h-60 sm:h-80 md:h-96 rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden relative shadow-md bg-slate-100"
            />
          </div>
        </div>

        {/* Section 3: มอบหมายพนักงานและรถ (Assign Driver & Vehicle Separate Dropdowns) */}
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserCheck size={18} className="text-blue-600" />
            <span>มอบหมายงาน (Assign Driver & Vehicle)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Dropdown 1: พนักงานขับรถ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User size={14} className="text-slate-400" />
                <span>เลือกพนักงานขับรถ (Driver)</span>
                {jobStatus !== 'Pending' && jobStatus !== 'Cancelled' && <span className="text-rose-500 font-bold ml-0.5">*</span>}
              </label>
              <CustomScrollSelect
                value={driverId}
                onChange={handleDriverChange}
                disabled={isReadOnly}
                searchable={true}
                searchPlaceholder="พิมพ์ค้นหาชื่อพนักงานขับรถ..."
                placeholder="-- ไม่ระบุ (Pending) --"
                options={driverOptions}
              />
              {driverId && getEmployeeConflictJob(driverId) && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                  <AlertTriangle size={13} className="text-rose-500 shrink-0" />
                  <span>พนักงานคนนี้ติดงานค้างช่วงเวลานี้ ({getEmployeeConflictJob(driverId)?.jobNumber})</span>
                </p>
              )}
              {hasAttemptedSubmit && jobStatus !== 'Pending' && jobStatus !== 'Cancelled' && !driverId && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                  <AlertTriangle size={13} className="text-rose-500 shrink-0" />
                  <span>กรุณาเลือกพนักงานขับรถ</span>
                </p>
              )}
            </div>

            {/* Dropdown 2: ผู้ติดตาม / พนักงานร่วมเดินทาง */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Users size={14} className="text-slate-400" />
                <span>ผู้ติดตาม / พนักงานร่วมเดินทาง (Companion)</span>
              </label>
              <CustomScrollSelect
                value={companionId}
                onChange={(val) => {
                  setCompanionId(val);
                  const found = drivers.find((d: any) => String(d.id) === String(val));
                  if (found) setFollowers(found.name);
                  else setFollowers('');
                }}
                disabled={isReadOnly}
                searchable={true}
                searchPlaceholder="พิมพ์ค้นหาชื่อผู้ติดตาม..."
                placeholder="-- ไม่มีผู้ติดตาม / ไม่ระบุ --"
                options={companionOptions}
              />
              {companionId && getEmployeeConflictJob(companionId) && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                  <AlertTriangle size={13} className="text-rose-500 shrink-0" />
                  <span>ผู้ติดตามติดงานค้างช่วงเวลานี้ ({getEmployeeConflictJob(companionId)?.jobNumber})</span>
                </p>
              )}
            </div>

            {/* Dropdown 3: ยานพาหนะ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Truck size={14} className="text-slate-400" />
                <span>เลือกรถ / ยานพาหนะ (Vehicle)</span>
                {jobStatus !== 'Pending' && jobStatus !== 'Cancelled' && <span className="text-rose-500 font-bold ml-0.5">*</span>}
              </label>
              <CustomScrollSelect
                value={vehicleId}
                onChange={(val) => {
                  setVehicleId(val);
                  if (val) setLastSelectedVehicleId(val);
                }}
                disabled={isReadOnly}
                searchable={true}
                searchPlaceholder="พิมพ์ค้นหาทะเบียนรถ / ประเภท..."
                placeholder="-- ไม่ระบุ --"
                options={vehicleOptions}
              />
              {vehicleId && getVehicleConflictJob(vehicleId) && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                  <AlertTriangle size={13} className="text-rose-500 shrink-0" />
                  <span>รถคันนี้ติดงานค้างช่วงเวลานี้ ({getVehicleConflictJob(vehicleId)?.jobNumber})</span>
                </p>
              )}
              {hasAttemptedSubmit && jobStatus !== 'Pending' && jobStatus !== 'Cancelled' && !vehicleId && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                  <AlertTriangle size={13} className="text-rose-500 shrink-0" />
                  <span>กรุณาเลือกรถ / ยานพาหนะ</span>
                </p>
              )}
            </div>

            {/* Remark / Cancellation Reason when Cancelled */}
            {jobStatus === 'Cancelled' && (
              <div className="md:col-span-3 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="block text-xs font-semibold text-rose-700 flex items-center gap-1">
                    <AlertTriangle size={14} className="text-rose-600" />
                    <span>หมายเหตุ / เหตุผลในการยกเลิกงาน (Cancellation Remark) *</span>
                  </label>
                  {(existingJob?.cancelledByName || existingJob?.cancelledbyname) && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-rose-700 font-medium bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/80">
                      <User size={13} className="text-rose-500" />
                      <span>ยกเลิกโดย: <strong className="font-semibold text-rose-900">{existingJob?.cancelledByName || existingJob?.cancelledbyname}</strong></span>
                      {(existingJob?.cancelledAt || existingJob?.cancelledat) && (
                        <span className="text-rose-500 font-normal">({formatDateThai(existingJob?.cancelledAt || existingJob?.cancelledat)})</span>
                      )}
                    </span>
                  )}
                </div>
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
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/60">
          {!isReadOnly && isEditMode && permissions.canDelete ? (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-medium text-sm rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 size={16} />
              <span>ลบงานนี้</span>
            </button>
          ) : <div />}

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else if (permissions.canRead) {
                  navigate('/jobs');
                } else {
                  navigate('/my-jobs');
                }
              }}
              className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer text-center"
            >
              {isReadOnly ? 'ปิดหน้าต่าง' : 'ยกเลิก'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
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
