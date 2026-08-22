import apiClient from '../../../api/client';
import {
  mapAuthenticationModeFromApi,
  mapAuthenticationModeToApi,
  mapMenuTypeFromApi,
  mapOpenModeFromApi,
  mapOpenModeToApi,
} from '../lib/menuConfig';
import type {
  MenuManagementDraft,
  MenuManagementMenuItem,
  MenuManagementTreeItem,
} from '../model/types';

const MENU_MANAGEMENT_API = '/api/v1/menu-managements';

function normalizeMenu(source: any): MenuManagementMenuItem {
  const menuTypeValue = Number(source.menuType ?? 1);
  const openModeValue = Number(source.openMode ?? 1);
  const authenticationModeValue = Number(source.authenticationMode ?? 1);

  return {
    id: Number(source.id ?? 0),
    nameTh: String(source.nameTh ?? ''),
    endpoint: source.endpoint ? String(source.endpoint) : null,
    menuType: mapMenuTypeFromApi(menuTypeValue),
    externalUrl: source.externalUrl ? String(source.externalUrl) : null,
    targetPath: source.targetPath ? String(source.targetPath) : null,
    openMode: mapOpenModeFromApi(openModeValue),
    authenticationMode: mapAuthenticationModeFromApi(authenticationModeValue),
    parentId: source.parentId !== null && source.parentId !== undefined ? Number(source.parentId) : null,
    seq: Number(source.seq ?? 0),
    isPublic: Boolean(source.isPublic ?? false),
    isMarketing: Boolean(source.isMarketing ?? false),
    isRead: Boolean(source.isRead ?? false),
    isCreate: Boolean(source.isCreate ?? false),
    isUpdate: Boolean(source.isUpdate ?? false),
    isDelete: Boolean(source.isDelete ?? false),
    isImport: Boolean(source.isImport ?? false),
    isExport: Boolean(source.isExport ?? false),
  };
}

function normalizeTreeItem(source: any): MenuManagementTreeItem {
  const item = normalizeMenu(source);
  const children = Array.isArray(source.children) ? source.children : [];

  return {
    ...item,
    children: children.map(normalizeTreeItem),
  };
}

function toRequestBody(draft: MenuManagementDraft) {
  return {
    nameTh: draft.nameTh.trim(),
    endpoint: draft.endpoint.trim() || null,
    menuType: 1,
    externalUrl: null,
    targetPath: null,
    openMode: mapOpenModeToApi(draft.openMode),
    authenticationMode: mapAuthenticationModeToApi(draft.authenticationMode),
    parentId: draft.parentId,
    seq: draft.seq,
    isPublic: draft.isPublic,
    isMarketing: draft.isMarketing,
    isRead: draft.isRead,
    isCreate: draft.isCreate,
    isUpdate: draft.isUpdate,
    isDelete: draft.isDelete,
    isImport: draft.isImport,
    isExport: draft.isExport,
  };
}

export async function getMenuManagementTree(): Promise<MenuManagementTreeItem[]> {
  const res = await apiClient.get(`${MENU_MANAGEMENT_API}/tree`);
  const data = res.data?.data || [];
  return data.map(normalizeTreeItem);
}

export async function getMenuManagementMenu(id: number): Promise<MenuManagementMenuItem> {
  const res = await apiClient.get(`${MENU_MANAGEMENT_API}/${id}`);
  return normalizeMenu(res.data?.data);
}

export async function createMenuManagementMenu(
  draft: MenuManagementDraft,
): Promise<MenuManagementMenuItem> {
  const res = await apiClient.post(MENU_MANAGEMENT_API, toRequestBody(draft));
  return normalizeMenu(res.data?.data);
}

export async function updateMenuManagementMenu(
  id: number,
  draft: MenuManagementDraft,
): Promise<MenuManagementMenuItem> {
  const res = await apiClient.patch(`${MENU_MANAGEMENT_API}/${id}`, toRequestBody(draft));
  return normalizeMenu(res.data?.data);
}

export async function deleteMenuManagementMenu(id: number): Promise<void> {
  await apiClient.delete(`${MENU_MANAGEMENT_API}/${id}`);
}
