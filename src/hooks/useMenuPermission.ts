import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { UserNavMenu } from '../features/users/model/types';

export interface MenuPermissions {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canImport: boolean;
  canExport: boolean;
  isLoading: boolean;
}

export const useMenuPermission = (endpoint: string): MenuPermissions => {
  const userRole = (localStorage.getItem('role') || '').toLowerCase();
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

  return useMemo(() => {
    const cleanEp = endpoint.trim().toLowerCase();
    if (userRole === 'admin' && (cleanEp === '/menu-managements' || cleanEp === '/menu-managements/permissions')) {
      return {
        canRead: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true,
        canImport: true,
        canExport: true,
        isLoading: false,
      };
    }

    if (isLoading || !userMenus) {
      return {
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canImport: false,
        canExport: false,
        isLoading,
      };
    }

    let foundLeaf: UserNavMenu | null = null;
    let foundAny: UserNavMenu | null = null;

    const walk = (nodes: UserNavMenu[]) => {
      for (const node of nodes) {
        const hasChildren = Boolean(node.children && node.children.length > 0);
        if (node.endpoint && node.endpoint.trim().toLowerCase() === cleanEp) {
          if (!hasChildren && !foundLeaf) {
            foundLeaf = node;
          } else if (!foundAny) {
            foundAny = node;
          }
        }
        if (hasChildren) {
          walk(node.children!);
        }
      }
    };

    walk(userMenus);
    const found = foundLeaf || foundAny;

    if (!found) {
      return {
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canImport: false,
        canExport: false,
        isLoading: false,
      };
    }

    const m = found as UserNavMenu;
    return {
      canRead: Boolean(m.isRead),
      canCreate: Boolean(m.isCreate),
      canUpdate: Boolean(m.isUpdate),
      canDelete: Boolean(m.isDelete),
      canImport: Boolean(m.isImport),
      canExport: Boolean(m.isExport),
      isLoading: false,
    };
  }, [userRole, userMenus, isLoading, endpoint]);
};
