import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const JobStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let label = status;
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status) {
    case 'Pending':
      label = 'รอมอบหมาย';
      bg = 'bg-amber-50 text-amber-700 border-amber-200/60';
      break;
    case 'Assigned':
      label = 'มอบหมายแล้ว';
      bg = 'bg-blue-50 text-blue-700 border-blue-200/60';
      break;
    case 'Started':
      label = 'เริ่มงานแล้ว';
      bg = 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
      break;
    case 'Arrived':
      label = 'ถึงสถานที่แล้ว';
      bg = 'bg-sky-50 text-sky-700 border-sky-200/60';
      break;
    case 'Completed':
      label = 'ปิดงานแล้ว';
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      break;
    case 'Cancelled':
      label = 'ยกเลิก';
      bg = 'bg-rose-50 text-rose-700 border-rose-200/60';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${bg}`}>
      {label}
    </span>
  );
};

export const LicenseStatusBadge: React.FC<{ status: 'Valid' | 'ExpiringSoon' | 'Expired' | string }> = ({ status }) => {
  if (status === 'Expired') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/60">
        หมดอายุ
      </span>
    );
  }
  if (status === 'ExpiringSoon') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
        ใกล้หมดอายุ
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
      ปกติ
    </span>
  );
};
