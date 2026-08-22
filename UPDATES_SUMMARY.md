# Foresee Logix Web Frontend Update Summary

## 📌 รายการแก้ไขใน Foresee-Web

### 1. เพิ่มระบบจดจำช่วงวันที่และตัวกรองค้นหา (Filter State Persistence: URL Params & SessionStorage)
- `src/features/jobs/JobsPage.tsx` & `src/features/jobs/MyJobsPage.tsx`:
  - เชื่อมโยงค่าตัวกรอง (`startDate`, `endDate`, `search`, `status`) เข้ากับ **URL Query Parameters** และ **`sessionStorage`**
  - เมื่อผู้ใช้เลือกช่วงวันที่ แล้วคลิกเข้าไปดูรายละเอียด/แก้ไขงาน (`/jobs/edit/:id`) พอกดปุ่ม **"ย้อนกลับ"** หรือ **"ปิดหน้าต่าง"** ตัวกรองช่วงวันที่ คีย์เวิร์ดค้นหา และสถานะงาน จะยังคงจดจำค่าเดิมไว้ 100% ไม่ถูกรีเซ็ตกลับเป็นวันปัจจุบัน

### 2. ปรับสถานะงานทั้งหมดในระบบให้เหลือเฉพาะ 5 สถานะหลัก
- `src/types/index.ts`, `StatusBadge.tsx`, `JobStatusChip.tsx`, `excelExport.ts`, `CreateJobPage.tsx`, `JobsPage.tsx`, `MyJobsPage.tsx`:
  - กำหนด Job status type และ Label ภาษาไทย เหลือเฉพาะ 5 สถานะ:
    1. `Pending`: **รอมอบหมาย**
    2. `Assigned`: **มอบหมายแล้ว**
    3. `Started`: **เริ่มงานแล้ว**
    4. `Completed`: **เสร็จสิ้น**
    5. `Cancelled`: **ยกเลิก**

### 3. ปรับเปลี่ยนข้อความหัวเรื่องหน้าจอเป็น "จัดการงานขนส่ง (Manage Jobs)"
- `src/features/jobs/JobsPage.tsx`:
  - เปลี่ยนข้อความหัวเรื่อง (`<h2>`) เป็น `จัดการงานขนส่ง (Manage Jobs)`

### 4. ปรับปรุงตารางในหน้า "งานของฉัน" (`/my-jobs`) ให้เหมือนกับหน้า "จัดการงานขนส่ง" (`/jobs`)
- `src/features/jobs/MyJobsPage.tsx`:
  - ปรับแต่งโครงสร้างคอลัมน์ ลิงก์ สไตล์ และปุ่มกดให้ตรงกับหน้าจัดการงาน 100%
