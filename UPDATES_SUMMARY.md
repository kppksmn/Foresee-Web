# Foresee Logix Web Frontend Update Summary

## 📌 รายการแก้ไขใน Foresee-Web

### 1. ป้องกันการส่ง HTTP Request ที่ไม่มีสิทธิ์ในโหมดดูรายละเอียด (`isReadOnly === true`)
- `src/features/jobs/CreateJobPage.tsx`:
  - เพิ่มเงื่อนไข `enabled: !isReadOnly` ใน `useQuery` ของ `rawUsers`, `rawActiveJobs`, และ `rawVehicles`
  - ปัญหาก่อนแก้ไข: เมื่อเปิดหน้ารายละเอียดงานแบบ Read-Only (`/jobs/edit/1?readOnly=true`) หน้ารายละเอียดงานพยายามยิงคำสั่งไปที่ `GET /api/v1/admin/jobs?mode=active` เพื่อตรวจเช็กเวลาค้างงานของพนักงาน ทำให้ผู้ใช้กลุ่มพนักงานเกิดข้อผิดพลาด `403 Forbidden` ในคอนโซล/เน็ตเวิร์ก
  - หลังการแก้ไข: ในโหมด Read-Only หน้าจอจะไม่ยิง Request เหล่านี้ ช่วยลดภาระเครือข่ายและขจัดข้อผิดพลาด `403 Forbidden` ออกได้ 100%

### 2. แก้ไขบั๊กสิทธิ์เข้าถึงหน้ารายละเอียดงาน `/jobs/edit/:id?readOnly=true`
- `src/layouts/AdminLayout/AdminLayout.tsx`:
  - เพิ่มเงื่อนไขอนุญาตให้ผู้ใช้เข้าถึงเส้นทาง `/jobs/edit/*` ได้ หากผู้ใช้นั้นๆ มีสิทธิ์ในเมนู `/jobs`, `/jobs/history`, หรือ `/my-jobs`

### 3. เปิดให้กดดูรายละเอียดงาน (View Details) ได้เสมอ ไม่ว่าจะตั้งค่าสิทธิ์อย่างไร
- `src/features/jobs/JobsPage.tsx`:
  - แสดงปุ่ม "ดูรายละเอียด" (Eye Icon) และลิงก์คลิกเลขที่งาน/หัวข้องานได้ตลอดเวลา
- `src/features/vehicles/VehicleTypesPage.tsx`:
  - เพิ่มปุ่ม "ดูรายละเอียด" ในตารางประเภทรถ รองรับการเปิด Modal แบบ Read-Only

### 4. เพิ่มปุ่มและระบบส่งออก Excel (.csv UTF-8 BOM) ในหน้าจัดการงานและงานของฉัน
- `src/utils/excelExport.ts`:
  - Utility ส่งออก CSV UTF-8 BOM รองรับภาษาไทย 100%

### 5. เพิ่มหน้าจอ "งานของฉัน" (`/my-jobs`) พร้อมระบบกรองเลือกวันที่นัดหมาย
- `src/features/jobs/MyJobsPage.tsx`:
  - หน้าจอสำหรับพนักงานดูเฉพาะรายการงานของตนเอง พร้อมตัวเลือกวันที่นัดหมาย (Date Picker) และส่งออก Excel

### 6. แก้ไขบั๊กการกดปิด Submenu ใน Sidebar 2 ครั้งหลัง Refresh หน้าจอ
- `src/layouts/AdminLayout/AdminLayout.tsx`:
  - แก้ไขการคำนวณสถานะเปิด/ปิดเมนู สลับปิดได้ทันทีในการคลิกครั้งแรก

### 7. ลบข้อความตัวอย่าง `(ดดมมปปปป)` ในระบบรีเซ็ตรหัสผ่านพนักงาน
- `src/features/users/UsersPage.tsx`:
  - ถอดข้อความ `(ดดมมปปปป)` ออกจากหน้าจอพรีวิวและมอดอลยืนยันรีเซ็ตรหัสผ่าน

### 8. ล็อกและป้องกันการเลือกคนขับที่ใบขับขี่หมดอายุ
- `src/features/jobs/CreateJobPage.tsx`:
  - ขึ้นป้ายเตือนและสั่ง `disabled: true` สำหรับคนขับ/ผู้ติดตามที่ใบขับขี่หมดอายุ
