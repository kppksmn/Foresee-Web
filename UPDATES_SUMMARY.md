# Foresee Logix Web Frontend Update Summary

## 📌 รายการแก้ไขใน Foresee-Web

### 1. ล็อกและป้องกันการเลือกคนขับที่ใบขับขี่หมดอายุ (Driver License Expiration UI Guard)
- `src/features/jobs/CreateJobPage.tsx`:
  - ปรับแต่งลิสต์ Dropdown ตัวเลือกคนขับและผู้ติดตาม: หากคนขับใบขับขี่หมดอายุ (`d.status === 'Expired'`) ระบบจะสั่ง `disabled: true` และแสดงป้ายเตือน `⛔ (ใบขับขี่หมดอายุ - ไม่สามารถเลือกได้)`
  - เพิ่มการตรวจสอบใน `handleFormSubmit` ป้องกันไม่ให้กดส่งฟอร์มหากคนขับหรือผู้ติดตามใบขับขี่หมดอายุ

### 2. ถอด `nameEn` ออกจากส่วนการแสดงผล 100%
- `src/features/menu-management/model/types.ts`: ถอด `nameEn` ออกจากประเภทข้อมูล
- `src/features/menu-management/api/menuManagementApi.ts`: ปรับแต่ง API Response Normalizer & Body Parser
- `src/features/menu-management/model/menuManagementLogic.ts`: ลบ `nameEn` fallback
- `src/features/menu-management/components/MenuManagementDetailPanel.tsx` & `TreePanel.tsx`: แสดงเฉพาะ `nameTh`
- `src/features/users/components/UserMenuAssignmentModal.tsx` & `TreeRow.tsx`: ปรับการค้นหาและแสดงผลเมนูภาษาไทย
- `src/layouts/AdminLayout/AdminLayout.tsx`: ปรับแต่ง Helper Icon Resolver ให้ใช้ `nameTh` และ `endpoint`

### 3. ลบโมดูลและเมนูแผนที่ติดตาม (`/map`)
- `src/app/router/AppRouter.tsx`: ถอด Route `/map`
- `src/features/map`: ลบโฟลเดอร์คอมโพเนนต์

### 4. เพิ่มหน้าหลัก Home Page & ระบบกรองสิทธิ์ไดนามิก
- `src/features/home/HomePage.tsx`: สร้างหน้าหลัก แสดงผลข้อมูลระบบ แบนเนอร์ต้อนรับ และการ์ดโมดูล
- **Dynamic Permitted Modules**: กรองสิทธิ์การเข้าถึงจาก API `/api/v1/auth/me/menus` แสดงผลเฉพาะโมดูลที่ผู้ใช้นั้นๆ มีสิทธิ์อ่านเท่านั้น
- `src/features/auth/LoginPage.tsx`: ตั้งค่าให้นำทางเข้าสู่ `http://localhost:5173/home` เมื่อ Login สำเร็จเสมอ

### 5. ปรับเปลี่ยนไอคอนเมนูโฟลเดอร์บน Sidebar Navigation
- `src/layouts/AdminLayout/AdminLayout.tsx`: นำเข้าไอคอน `Folder` และปรับแต่งให้เมนูรายการใดที่เป็น Folder (ไม่มี Endpoint หรือมีเมนูลูกข่ายผูกไว้) แสดงผลไอคอนเป็น Folder 📁 โดยอัตโนมัติ
