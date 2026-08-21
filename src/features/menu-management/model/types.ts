export interface MenuManagementMenuItem {
  id: number;
  nameTh: string;
  nameEn: string;
  endpoint: string | null;
  menuType: MenuManagementMenuType;
  externalUrl: string | null;
  targetPath: string | null;
  openMode: MenuManagementOpenMode;
  authenticationMode: MenuManagementAuthenticationMode;
  parentId: number | null;
  seq: number;
  isPublic: boolean;
  isMarketing: boolean;
  isRead: boolean;
  isCreate: boolean;
  isUpdate: boolean;
  isDelete: boolean;
  isImport: boolean;
  isExport: boolean;
}

export interface MenuManagementTreeItem extends MenuManagementMenuItem {
  children: MenuManagementTreeItem[];
}

export interface MenuManagementDraft {
  nameTh: string;
  nameEn: string;
  endpoint: string;
  menuType: MenuManagementMenuType;
  externalUrl: string;
  targetPath: string;
  openMode: MenuManagementOpenMode;
  authenticationMode: MenuManagementAuthenticationMode;
  parentId: number | null;
  seq: number;
  isPublic: boolean;
  isMarketing: boolean;
  isRead: boolean;
  isCreate: boolean;
  isUpdate: boolean;
  isDelete: boolean;
  isImport: boolean;
  isExport: boolean;
}

export type MenuManagementDraftFlagKey =
  | 'isPublic'
  | 'isMarketing'
  | 'isRead'
  | 'isCreate'
  | 'isUpdate'
  | 'isDelete'
  | 'isImport'
  | 'isExport';

export type MenuManagementMenuType = 'internal' | 'external';
export type MenuManagementOpenMode = 'iframe' | 'new_tab';
export type MenuManagementAuthenticationMode =
  | 'none'
  | 'oidc'
  | 'token_handoff';

export interface MenuManagementParentOption {
  id: number;
  label: string;
  level: number;
}

export interface MenuManagementPermissionOption {
  key: MenuManagementDraftFlagKey;
  label: string;
  description: string;
  tone?: 'brand' | 'accent';
}

export interface MenuManagementSelectOption<TValue extends string> {
  value: TValue;
  label: string;
  description: string;
}

export const menuTypeOptions: MenuManagementSelectOption<MenuManagementMenuType>[] =
  [
    {
      value: 'internal',
      label: 'Internal',
      description: 'ใช้สำหรับ route ภายใน Foresee Logix หรือ folder menu',
    },
    {
      value: 'external',
      label: 'External App',
      description: 'ใช้สำหรับเชื่อมระบบภายนอกผ่านเมนูเดียวกัน',
    },
  ];

export const openModeOptions: MenuManagementSelectOption<MenuManagementOpenMode>[] =
  [
    {
      value: 'iframe',
      label: 'iframe',
      description: 'เปิดภายในหน้า Foresee Logix ผ่าน iframe',
    },
    {
      value: 'new_tab',
      label: 'New Tab',
      description: 'เปิดระบบปลายทางในแท็บใหม่และคง route ภายในไว้',
    },
  ];

export const authenticationModeOptions: MenuManagementSelectOption<MenuManagementAuthenticationMode>[] =
  [
    {
      value: 'none',
      label: 'None',
      description: 'ไม่มี flow authentication เพิ่มจาก Foresee Logix',
    },
    {
      value: 'oidc',
      label: 'OIDC',
      description: 'ปลายทางใช้ OpenID Connect หรือ SSO ที่เข้ากันได้',
    },
    {
      value: 'token_handoff',
      label: 'Token Handoff',
      description: 'เตรียมไว้สำหรับกรณี backend ออก token ให้ระบบปลายทาง',
    },
  ];

export const audienceOptions: MenuManagementPermissionOption[] = [
  {
    key: 'isPublic',
    label: 'Public Menu',
    description: 'เมนูนี้จะแสดงกับผู้ใช้ทุกคนโดยอัตโนมัติ',
    tone: 'brand',
  },
  {
    key: 'isMarketing',
    label: 'Marketing Menu',
    description: 'เมนูนี้จะแสดงอัตโนมัติเฉพาะผู้ใช้ที่เป็นสาย Marketing',
    tone: 'accent',
  },
];

export const permissionOptions: MenuManagementPermissionOption[] = [
  {
    key: 'isRead',
    label: 'Read',
    description: 'อนุญาตให้เข้าดูข้อมูลของเมนูนี้',
    tone: 'brand',
  },
  {
    key: 'isCreate',
    label: 'Create',
    description: 'อนุญาตให้สร้างข้อมูลผ่านเมนูนี้',
  },
  {
    key: 'isUpdate',
    label: 'Update',
    description: 'อนุญาตให้แก้ไขข้อมูลได้',
  },
  {
    key: 'isDelete',
    label: 'Delete',
    description: 'อนุญาตให้ลบข้อมูลได้',
  },
  {
    key: 'isImport',
    label: 'Import',
    description: 'อนุญาตให้นำเข้าข้อมูลจากไฟล์หรือระบบอื่น',
  },
  {
    key: 'isExport',
    label: 'Export',
    description: 'อนุญาตให้ส่งออกข้อมูลจากระบบ',
  },
];

export const defaultMenuManagementDraft: MenuManagementDraft = {
  nameTh: '',
  nameEn: '',
  endpoint: '',
  menuType: 'internal',
  externalUrl: '',
  targetPath: '',
  openMode: 'iframe',
  authenticationMode: 'none',
  parentId: null,
  seq: 10,
  isPublic: true,
  isMarketing: false,
  isRead: true,
  isCreate: false,
  isUpdate: false,
  isDelete: false,
  isImport: false,
  isExport: false,
};
