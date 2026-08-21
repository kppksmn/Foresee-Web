import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMenuManagementMenu,
  deleteMenuManagementMenu,
  getMenuManagementMenu,
  getMenuManagementTree,
  updateMenuManagementMenu,
} from '../api/menuManagementApi';
import type { MenuManagementDraft, MenuManagementMenuItem, MenuManagementTreeItem } from './types';

export const menuManagementQueryKeys = {
  tree: ['menu-management', 'tree'] as const,
  menu: (id: number | null) => ['menu-management', 'menu', id] as const,
};

export function useMenuManagementTreeQuery() {
  return useQuery<MenuManagementTreeItem[]>({
    queryKey: menuManagementQueryKeys.tree,
    queryFn: getMenuManagementTree,
  });
}

export function useMenuManagementMenuQuery(id: number | null) {
  return useQuery<MenuManagementMenuItem | null>({
    queryKey: menuManagementQueryKeys.menu(id),
    queryFn: () => (id ? getMenuManagementMenu(id) : Promise.resolve(null)),
    enabled: id !== null && id > 0,
  });
}

export function useSaveMenuManagementMenuMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      draft,
    }: {
      id: number | null;
      draft: MenuManagementDraft;
    }) => {
      if (id) {
        return updateMenuManagementMenu(id, draft);
      }
      return createMenuManagementMenu(draft);
    },
    onSuccess: (savedMenu) => {
      queryClient.invalidateQueries({ queryKey: menuManagementQueryKeys.tree });
      if (savedMenu?.id) {
        queryClient.invalidateQueries({
          queryKey: menuManagementQueryKeys.menu(savedMenu.id),
        });
      }
    },
  });
}

export function useDeleteMenuManagementMenuMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: number; nameEn: string }) => {
      await deleteMenuManagementMenu(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuManagementQueryKeys.tree });
    },
  });
}
