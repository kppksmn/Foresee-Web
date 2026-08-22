# Foresee Logix Web Frontend Update Summary

## 📌 รายการแก้ไขใน Foresee-Web

### 1. ปรับเปลี่ยนข้อความหัวเรื่องหน้าจอจาก "งานปัจจุบัน (Active Jobs)" เป็น "จัดการงานขนส่ง"
- `src/features/jobs/JobsPage.tsx`:
  - ปรับเปลี่ยนข้อความหัวเรื่อง (`<h2>`) จาก `งานปัจจุบัน (Active Jobs)` เป็น `จัดการงานขนส่ง` ให้ตรงตามความต้องการ

### 2. ป้องกันการส่ง HTTP Request ที่ไม่มีสิทธิ์ในโหมดดูรายละเอียด (`isReadOnly === true`)
- `src/features/jobs/CreateJobPage.tsx`:
  - เพิ่มเงื่อนไข `enabled: !isReadOnly` ใน `useQuery` ของ `rawUsers`, `rawActiveJobs`, และ `rawVehicles` ขจัดข้อผิดพลาด `403 Forbidden` ออกจาก Console/Network 100%

### 3. แก้ไขบั๊กสิทธิ์เข้าถึงหน้ารายละเอียดงาน `/jobs/edit/:id?readOnly=true`
- `src/layouts/AdminLayout/AdminLayout.tsx`:
  - เพิ่มเงื่อนไขอนุญาตให้ผู้ใช้เข้าถึงเส้นทาง `/jobs/edit/*` ได้ หากผู้ใช้นั้นๆ มีสิทธิ์ในเมนู `/jobs`, `/jobs/history`, หรือ `/my-jobs`

### 4. เปิดให้กดดูรายละเอียดงาน (View Details) ได้เสมอ ไม่ว่าจะตั้งค่าสิทธิ์อย่างไร
- `src/features/jobs/JobsPage.tsx`:
  - แสดงปุ่ม "ดูรายละเอียด" (Eye Icon) และลิงก์คลิกเลขที่งาน/หัวข้องานได้ตลอดเวลา

### 5. เพิ่มปุ่มและระบบส่งออก Excel (.csv UTF-8 BOM) ในหน้าจัดการงานและงานของฉัน
- `src/utils/excelExport.ts`:
  - Utility ส่งออก CSV UTF-8 BOM รองรับภาษาไทย 100%

### 6. เพิ่มหน้าจอ "งานของฉัน" (`/my-jobs`) พร้อมระบบกรองเลือกวันที่นัดหมาย
- `src/features/jobs/MyJobsPage.tsx`:
  - หน้าจอสำหรับพนักงานดูเฉพาะรายการงานของตนเอง พร้อมตัวเลือกวันที่นัดหมาย (Date Picker) และส่งออก Excel

### 7. แก้ไขบั๊กการกดปิด Submenu ใน Sidebar 2 ครั้งหลัง Refresh หน้าจอ
- `src/layouts/AdminLayout/AdminLayout.tsx`:
  - แก้ไขการคำนวณสถานะเปิด/ปิดเมนู สลับปิดได้ทันทีในการคลิกครั้งแรก
