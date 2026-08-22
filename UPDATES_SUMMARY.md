# Foresee Logix Web Frontend Update Summary

## 📌 รายการแก้ไขใน Foresee-Web

### 1. ปรับเปลี่ยนตัวกรองวันที่ให้เป็นแบบช่วงวันที่ (Date Range: จากวันที่ - ถึงวันที่) และกำหนด Default เป็นวันปัจจุบัน
- `src/features/jobs/JobsPage.tsx` & `src/features/jobs/MyJobsPage.tsx`:
  - เปลี่ยนช่องเลือกวันที่จากแบบวันเดียว เป็นแบบ **ช่วงวันที่ (จากวันที่ - ถึงวันที่)**
  - กำหนดค่าเริ่มต้น (Default Value) ทั้ง `startDate` และ `endDate` ให้เป็น **วันปัจจุบัน (Today's Date)** เสมอ
  - เพิ่มปุ่มทางด่วน **"วันนี้"** สำหรับรีเซ็ตตัวกรองกลับสู่วันปัจจุบัน และปุ่ม **"✕"** สำหรับล้างตัวกรองเพื่อเรียกดูงานทุกช่วงวันที่

### 2. ปรับเปลี่ยนข้อความหัวเรื่องหน้าจอจาก "งานปัจจุบัน (Active Jobs)" เป็น "จัดการงานขนส่ง"
- `src/features/jobs/JobsPage.tsx`:
  - ปรับเปลี่ยนข้อความหัวเรื่อง (`<h2>`) จาก `งานปัจจุบัน (Active Jobs)` เป็น `จัดการงานขนส่ง`

### 3. ป้องกันการส่ง HTTP Request ที่ไม่มีสิทธิ์ในโหมดดูรายละเอียด (`isReadOnly === true`)
- `src/features/jobs/CreateJobPage.tsx`:
  - เพิ่มเงื่อนไข `enabled: !isReadOnly` ใน `useQuery` ขจัดข้อผิดพลาด `403 Forbidden` ออกจาก Console/Network 100%

### 4. แก้ไขบั๊กสิทธิ์เข้าถึงหน้ารายละเอียดงาน `/jobs/edit/:id?readOnly=true`
- `src/layouts/AdminLayout/AdminLayout.tsx`:
  - เพิ่มเงื่อนไขอนุญาตให้ผู้ใช้เข้าถึงเส้นทาง `/jobs/edit/*` ได้ หากผู้ใช้นั้นๆ มีสิทธิ์ในเมนู `/jobs`, `/jobs/history`, หรือ `/my-jobs`

### 5. เพิ่มปุ่มและระบบส่งออก Excel (.csv UTF-8 BOM) ในหน้าจัดการงานและงานของฉัน
- `src/utils/excelExport.ts`: Utility ส่งออก CSV UTF-8 BOM รองรับภาษาไทย 100%

### 6. เพิ่มหน้าจอ "งานของฉัน" (`/my-jobs`) พร้อมระบบกรองเลือกช่วงวันที่นัดหมาย
- `src/features/jobs/MyJobsPage.tsx`: หน้าจอสำหรับพนักงานดูเฉพาะรายการงานของตนเอง
