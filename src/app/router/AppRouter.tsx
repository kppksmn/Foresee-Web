import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { AdminLayout } from '../../layouts/AdminLayout/AdminLayout';
import { LoginPage } from '../../features/auth/LoginPage';
import { NoAccessPage } from '../../features/auth/NoAccessPage';
import { DashboardPage } from '../../features/dashboard/DashboardPage';
import { JobsPage } from '../../features/jobs/JobsPage';
import { CreateJobPage } from '../../features/jobs/CreateJobPage';
import { UsersPage } from '../../features/users/UsersPage';
import { MapPage } from '../../features/map/MapPage';
import { VehiclesPage } from '../../features/vehicles/VehiclesPage';
import { VehicleTypesPage } from '../../features/vehicles/VehicleTypesPage';
import { AuditLogsPage } from '../../features/audit/AuditLogsPage';
import { MenuManagementPage } from '../../features/menu-management/MenuManagementPage';
import { UserMenuPermissionsPage } from '../../features/menu-management/UserMenuPermissionsPage';
import type { UserNavMenu } from '../../features/users/model/types';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const IndexRedirect: React.FC = () => {
  const role = (localStorage.getItem('role') || '').toLowerCase();
  const token = localStorage.getItem('access_token') || '';
  const userId = localStorage.getItem('user_id') || '';

  const { data: userMenus, isLoading } = useQuery<UserNavMenu[]>({
    queryKey: ['me-nav-menus', userId, token],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/auth/me/menus');
      return res.data?.data || [];
    },
    staleTime: 0,
  });

  if (role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-slate-400">
        กำลังโหลดข้อมูลการเข้าถึง...
      </div>
    );
  }

  const findFirstEndpoint = (list: UserNavMenu[]): string | null => {
    for (const m of list) {
      if (m.endpoint) return m.endpoint;
      if (m.children && m.children.length > 0) {
        const childEp = findFirstEndpoint(m.children);
        if (childEp) return childEp;
      }
    }
    return null;
  };

  const firstEp = userMenus ? findFirstEndpoint(userMenus) : null;
  return <Navigate to={firstEp || '/no-access'} replace />;
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
          <Route index element={<IndexRedirect />} />
          <Route path="no-access" element={<NoAccessPage />} />
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
          <Route path="menu-managements/permissions" element={<UserMenuPermissionsPage />} />
          <Route path="reports" element={<div className="p-4 bg-white rounded-xl border border-slate-200">รายงานเชิงวิเคราะห์ (Reports & Analytics)</div>} />
          <Route path="settings" element={<div className="p-4 bg-white rounded-xl border border-slate-200">ตั้งค่าระบบ (System Settings)</div>} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
