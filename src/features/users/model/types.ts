export interface UserMenuPermissionNode {
  menuId: number;
  parentId: number | null;
  nameTh: string;
  nameEn: string;
  endpoint: string | null;
  seq: number;
  isPublic: boolean;
  isMarketing: boolean;

  // Capabilities of the menu (whether this action is available for this menu)
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canImport: boolean;
  canExport: boolean;

  // Granted permissions for this user
  isRead: boolean;
  isCreate: boolean;
  isUpdate: boolean;
  isDelete: boolean;
  isImport: boolean;
  isExport: boolean;

  children: UserMenuPermissionNode[];
}

export type UserMenuPermissionKey =
  | 'isRead'
  | 'isCreate'
  | 'isUpdate'
  | 'isDelete'
  | 'isImport'
  | 'isExport';

export interface UserMenuPermissionItemRequest {
  menuId: number;
  isRead: boolean;
  isCreate: boolean;
  isUpdate: boolean;
  isDelete: boolean;
  isImport: boolean;
  isExport: boolean;
}

export interface UpdateUserMenuPermissionsRequest {
  permissions: UserMenuPermissionItemRequest[];
}

export interface UserNavMenu {
  id: number;
  parentId: number | null;
  nameTh: string;
  nameEn: string;
  endpoint: string | null;
  menuType: number;
  externalUrl?: string | null;
  targetPath?: string | null;
  openMode: number;
  seq: number;
  isRead: boolean;
  isCreate: boolean;
  isUpdate: boolean;
  isDelete: boolean;
  isImport: boolean;
  isExport: boolean;
  children: UserNavMenu[];
}
