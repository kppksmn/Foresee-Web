import { useSyncExternalStore } from 'react';
import { buildCreateMenuManagementDraft } from './menuManagementLogic';
import type { MenuManagementDraft } from './types';

interface MenuManagementState {
  selectedMenuId: number | null;
  mode: 'idle' | 'view' | 'create';
  createDraft: MenuManagementDraft | null;
  viewDraftPatch: {
    menuId: number;
    patch: Partial<MenuManagementDraft>;
  } | null;
  selectMenu: (id: number | null) => void;
  startCreate: (parentId?: number | null) => void;
  cancelCreate: () => void;
  updateDraft: (patch: Partial<MenuManagementDraft>) => void;
  reset: () => void;
}

const menuManagementInitialState = {
  selectedMenuId: null,
  mode: 'idle' as const,
  createDraft: null,
  viewDraftPatch: null,
};

type Listener = () => void;

function createMenuStore() {
  let state: MenuManagementState;
  const listeners = new Set<Listener>();

  const set = (updater: (prev: MenuManagementState) => Partial<MenuManagementState>) => {
    state = { ...state, ...updater(state) };
    listeners.forEach((listener) => listener());
  };

  state = {
    ...menuManagementInitialState,
    selectMenu: (id) => {
      set(() => ({
        selectedMenuId: id,
        mode: id === null ? 'idle' : 'view',
        createDraft: null,
        viewDraftPatch: null,
      }));
    },
    startCreate: (parentId = null) => {
      set(() => ({
        createDraft: buildCreateMenuManagementDraft(parentId),
        mode: 'create',
      }));
    },
    cancelCreate: () => {
      set((prev) => ({
        createDraft: null,
        mode: prev.selectedMenuId === null ? 'idle' : 'view',
      }));
    },
    updateDraft: (patch) => {
      set((prev) => {
        if (prev.mode === 'create') {
          if (!prev.createDraft) return {};
          return { createDraft: { ...prev.createDraft, ...patch } };
        }

        if (prev.selectedMenuId === null) return {};

        return {
          viewDraftPatch: {
            menuId: prev.selectedMenuId,
            patch:
              prev.viewDraftPatch?.menuId === prev.selectedMenuId
                ? { ...prev.viewDraftPatch.patch, ...patch }
                : patch,
          },
        };
      });
    },
    reset: () => {
      set(() => ({ ...menuManagementInitialState }));
    },
  };

  return function useMenuManagementStore<T>(
    selector: (state: MenuManagementState) => T,
  ): T {
    return useSyncExternalStore(
      (listener) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
      () => selector(state),
    );
  };
}

export const useMenuManagementStore = createMenuStore();
