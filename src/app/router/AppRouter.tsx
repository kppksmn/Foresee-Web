import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../../layouts/AdminLayout/AdminLayout';
import { LoginPage } from '../../features/auth/LoginPage';
import { DashboardPage } from '../../features/dashboard/DashboardPage';
import { JobsPage } from '../../features/jobs/JobsPage';
import { CreateJobPage } from '../../features/jobs/CreateJobPage';
import { UsersPage } from '../../features/users/UsersPage';
import { MapPage } from '../../features/map/MapPage';
import { VehiclesPage } from '../../features/vehicles/VehiclesPage';
import { VehicleTypesPage } from '../../features/vehicles/VehicleTypesPage';
import { AuditLogsPage } from '../../features/audit/AuditLogsPage';
import { MenuManagementPage } from '../../features/menu-management/MenuManagementPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="jobs" element={<JobsPage mode="active" />} />
          <Route path="jobs/history" element={<JobsPage mode="history" />} />
          <Route path="jobs/create" element={<CreateJobPage />} />
          <Route path="jobs/edit/:id" element={<CreateJobPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="vehicle-types" element={<VehicleTypesPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="menu-managements" element={<MenuManagementPage />} />
          <Route path="reports" element={<div className="p-4 bg-white rounded-xl border border-slate-200">รายงานเชิงวิเคราะห์ (Reports & Analytics)</div>} />
          <Route path="settings" element={<div className="p-4 bg-white rounded-xl border border-slate-200">ตั้งค่าระบบ (System Settings)</div>} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
