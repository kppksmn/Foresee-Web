# Foresee Logix Web Frontend Update Summary

## 📌 รายการแก้ไขใน Foresee-Web

### 1. เพิ่มหน้าจอ "งานของฉัน" (`/my-jobs`) พร้อมระบบกรองเลือกวันที่นัดหมาย
- `src/features/jobs/MyJobsPage.tsx`:
  - สร้างหน้าจอคอมโพเนนต์สำหรับพนักงานดูเฉพาะรายการงานของตนเอง (ทั้งในฐานะคนขับหลัก หรือผู้ร่วมเดินทาง)
  - มีการ์ดสรุปจำนวนงาน (Total, Active, Completed)
  - เพิ่ม **Date Picker (เลือกวันที่นัดหมาย)** พร้อมไอคอนปฏิทิน และปุ่มล้างวันที่ (✕) สำหรับกรองงานเฉพาะวันที่ต้องการ
  - มีดร็อปดาวน์กรองตามสถานะงาน และช่องค้นหาเลขที่งาน/หัวข้อ/สถานที่
- `src/app/router/AppRouter.tsx`: เพิ่ม Route `my-jobs`
- `src/layouts/AdminLayout/AdminLayout.tsx`: เพิ่มเมนู "งานของฉัน" ใน Sidebar Navigation และระบบ Icon Resolver
- `src/features/home/HomePage.tsx`: เพิ่มการ์ดโมดูล "งานของฉัน (My Assigned Jobs)" ในหน้าหลัก

### 2. แก้ไขบั๊กการกดปิด Submenu ใน Sidebar 2 ครั้งหลัง Refresh หน้าจอ
- `src/layouts/AdminLayout/AdminLayout.tsx`:
  - แก้ไขการคำนวณสถานะเปิด/ปิดเมนู `isOpen` และฟังก์ชัน `toggleSubmenu`:
    เปลี่ยนจาก `!openSubmenus[text]` เป็น `openSubmenus[text] !== false`
  - หลังการแก้ไข: เมื่อคลิกครั้งแรก ระบบจะสลับจาก `undefined` (เปิด) เป็น `false` (ปิด) ได้ทันทีตั้งแต่การกดคลิกครั้งแรก 100%

### 3. บังคับใช้สิทธิ์ใช้งานในหน้าประเภทรถ (Vehicle Types Permission Enforcements)
- `src/features/vehicles/VehicleTypesPage.tsx`:
  - เรียกใช้ `useMenuPermission('/vehicle-types')` เพื่อตรวจสอบสิทธิ์การใช้งานจริงของผู้ใช้งาน
  - ปุ่ม "เพิ่มประเภทรถใหม่" จะแสดงผลเฉพาะเมื่อผู้ใช้มีสิทธิ์ `canCreate`
  - ปุ่ม "แก้ไข" และ "ลบ" ในตารางจะแสดงผลเฉพาะเมื่อผู้ใช้มีสิทธิ์ `canUpdate` หรือ `canDelete` ตามลำดับ หากมีเฉพาะสิทธิ์อ่าน (`read`) ปุ่มดำเนินการทั้งหมดจะถูกซ่อน

### 4. เพิ่มตัวเลือกกรองวันที่นัดหมายในงานปัจจุบัน และประวัติงาน (Scheduled Date Filter for Jobs)
- `src/features/jobs/JobsPage.tsx`:
  - เพิ่มตัวเลือกระบุวันที่นัดหมาย (Date Picker) พร้อมไอคอนปฏิทิน และปุ่มล้างตัวกรองวันที่ (✕) ในแถบ Filter
  - ปรับการเรียก API `GET /api/v1/admin/jobs` ให้ส่งพารามิเตอร์ `date: scheduledDate` เพื่อกรองงานตามวันที่เวลานัดหมายจริง

### 5. ลบข้อความตัวอย่าง `(ดดมมปปปป)` ในระบบรีเซ็ตรหัสผ่านพนักงาน
- `src/features/users/UsersPage.tsx`:
  - ถอดข้อความ `(ดดมมปปปป)` ออกจากหน้าจอพรีวิวรหัสผ่านวันเกิด, คำแนะนำรหัสผ่านเริ่มต้น, และ Confirm Modal ยืนยันการรีเซ็ต

### 6. ล็อกและป้องกันการเลือกคนขับที่ใบขับขี่หมดอายุ (Driver License Expiration UI Guard)
- `src/features/jobs/CreateJobPage.tsx`:
  - ปรับแต่งลิสต์ Dropdown ตัวเลือกคนขับและผู้ติดตาม: หากคนขับใบขับขี่หมดอายุ (`d.status === 'Expired'`) ระบบจะสั่ง `disabled: true` และแสดงป้ายเตือน `⛔ (ใบขับขี่หมดอายุ - ไม่สามารถเลือกได้)`
  - เพิ่มการตรวจสอบใน `handleFormSubmit` ป้องกันไม่ให้กดส่งฟอร์มหากคนขับหรือผู้ติดตามใบขับขี่หมดอายุ

### 7. ถอด `nameEn` ออกจากส่วนการแสดงผล 100%
- `src/features/menu-management/model/types.ts`: ถอด `nameEn` ออกจากประเภทข้อมูล
- `src/features/menu-management/api/menuManagementApi.ts`: ปรับแต่ง API Response Normalizer & Body Parser
- `src/features/menu-management/model/menuManagementLogic.ts`: ลบ `nameEn` fallback
- `src/features/menu-management/components/MenuManagementDetailPanel.tsx` & `TreePanel.tsx`: แสดงเฉพาะ `nameTh`
- `src/features/users/components/UserMenuAssignmentModal.tsx` & `TreeRow.tsx`: ปรับการค้นหาและแสดงผลเมนูภาษาไทย
- `src/layouts/AdminLayout/AdminLayout.tsx`: ปรับแต่ง Helper Icon Resolver ให้ใช้ `nameTh` และ `endpoint`

### 8. ลบโมดูลและเมนูแผนที่ติดตาม (`/map`)
- `src/app/router/AppRouter.tsx`: ถอด Route `/map`
- `src/features/map`: ลบโฟลเดอร์คอมโพเนนต์

### 9. เพิ่มหน้าหลัก Home Page & ระบบกรองสิทธิ์ไดนามิก
- `src/features/home/HomePage.tsx`: สร้างหน้าหลัก แสดงผลข้อมูลระบบ แบนเนอร์ต้อนรับ และการ์ดโมดูล
- **Dynamic Permitted Modules**: กรองสิทธิ์การเข้าถึงจาก API `/api/v1/auth/me/menus` แสดงผลเฉพาะโมดูลที่ผู้ใช้นั้นๆ มีสิทธิ์อ่านเท่านั้น
- `src/features/auth/LoginPage.tsx`: ตั้งค่าให้นำทางเข้าสู่ `http://localhost:5173/home` เมื่อ Login สำเร็จเสมอ

### 10. ปรับเปลี่ยนไอคอนเมนูโฟลเดอร์บน Sidebar Navigation
- `src/layouts/AdminLayout/AdminLayout.tsx`: นำเข้าไอคอน `Folder` และปรับแต่งให้เมนูรายการใดที่เป็น Folder (ไม่มี Endpoint หรือมีเมนูลูกข่ายผูกไว้) แสดงผลไอคอนเป็น Folder 📁 โดยอัตโนมัติ
