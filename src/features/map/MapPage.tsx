import React from 'react';
import { MapPin } from 'lucide-react';

export const MapPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            แผนที่ตำแหน่งงาน (Job Locations Map)
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            แสดงจุดรับและจุดส่งของงานปฏิบัติการทั้งหมดในวันนี้
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden h-[600px] relative flex items-center justify-center bg-slate-100">
        <div className="text-center p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-md max-w-sm">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <MapPin size={24} />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Google Maps Canvas</h3>
          <p className="text-xs text-slate-500 mt-1">
            พร้อมรองรับ Google Maps JavaScript API สำหรับแสดง Marker จุดรับและจุดส่ง
          </p>
        </div>
      </div>
    </div>
  );
};
