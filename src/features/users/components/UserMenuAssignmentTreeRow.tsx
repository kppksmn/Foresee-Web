import React from 'react';
import { ChevronDown, ChevronRight, Folder, FileText, Globe, CheckSquare } from 'lucide-react';
import type { UserMenuPermissionNode, UserMenuPermissionKey } from '../model/types';

interface UserMenuAssignmentTreeRowProps {
  node: UserMenuPermissionNode;
  level: number;
  isCollapsed: boolean;
  hasChildren: boolean;
  isTargetUserAdmin?: boolean;
  onToggleCollapse: (menuId: number) => void;
  onTogglePermission: (menuId: number, key: UserMenuPermissionKey) => void;
  onToggleRowAll: (node: UserMenuPermissionNode) => void;
}

const permissionKeys: Array<{
  key: UserMenuPermissionKey;
  canKey: 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete' | 'canImport' | 'canExport';
  label: string;
  badgeBg: string;
}> = [
  { key: 'isRead', canKey: 'canRead', label: 'ดู (Read)', badgeBg: 'accent-blue-600' },
  { key: 'isCreate', canKey: 'canCreate', label: 'สร้าง (Create)', badgeBg: 'accent-emerald-600' },
  { key: 'isUpdate', canKey: 'canUpdate', label: 'แก้ไข (Update)', badgeBg: 'accent-amber-600' },
  { key: 'isDelete', canKey: 'canDelete', label: 'ลบ (Delete)', badgeBg: 'accent-rose-600' },
  { key: 'isImport', canKey: 'canImport', label: 'นำเข้า (Import)', badgeBg: 'accent-indigo-600' },
  { key: 'isExport', canKey: 'canExport', label: 'ส่งออก (Export)', badgeBg: 'accent-purple-600' },
];

const countChildCoverage = (children?: UserMenuPermissionNode[]): { granted: number; total: number } => {
  if (!children || children.length === 0) return { granted: 0, total: 0 };
  let granted = 0;
  let total = 0;
  const walk = (nodes: UserMenuPermissionNode[]) => {
    for (const n of nodes) {
      if (n.children && n.children.length > 0) {
        walk(n.children);
      } else {
        total++;
        if (n.isRead || n.isCreate || n.isUpdate || n.isDelete || n.isImport || n.isExport) {
          granted++;
        }
      }
    }
  };
  walk(children);
  return { granted, total };
};

export const UserMenuAssignmentTreeRow: React.FC<UserMenuAssignmentTreeRowProps> = ({
  node,
  level,
  isCollapsed,
  hasChildren,
  isTargetUserAdmin = false,
  onToggleCollapse,
  onTogglePermission,
  onToggleRowAll,
}) => {
  const ep = (node.endpoint || '').trim().toLowerCase();
  const isExternal = !!node.endpoint?.startsWith('http');
  const isFolder = hasChildren || !node.endpoint;
  const isMenuManagement =
    ep === '/menu-managements' ||
    ep === '/menu-managements/permissions';
  const isLockedForAdmin = Boolean(isTargetUserAdmin && isMenuManagement);
  const coverage = hasChildren ? countChildCoverage(node.children) : null;

  // Determine if all supported permissions are checked
  const supportedKeys = !isFolder ? permissionKeys.filter((p) => node[p.canKey]) : [];
  const allSupportedChecked =
    supportedKeys.length > 0 && supportedKeys.every((p) => node[p.key]);

  return (
    <tr className={`transition-colors group ${isFolder ? 'bg-slate-50/50 hover:bg-slate-100/60 font-semibold' : 'hover:bg-slate-50/80'}`}>
      {/* Menu Name Column */}
      <td className="py-2.5 px-4 align-middle">
        <div
          className="flex items-center gap-1.5"
          style={{ paddingLeft: `${level * 20}px` }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggleCollapse(node.menuId)}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
            >
              {isCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
            </button>
          ) : (
            <span className="w-5" />
          )}

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-400 shrink-0">
              {isFolder ? (
                <Folder size={16} className="text-amber-500" />
              ) : isExternal ? (
                <Globe size={16} className="text-indigo-500" />
              ) : (
                <FileText size={16} className="text-blue-500" />
              )}
            </span>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs truncate ${isFolder ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>
                  {node.nameTh}
                </span>
                {coverage ? (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                      coverage.granted > 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {coverage.granted}/{coverage.total} เมนู
                  </span>
                ) : node.isPublic ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Public
                  </span>
                ) : null}
              </div>
              {node.endpoint && (
                <span className="text-[11px] text-slate-400 font-mono">
                  {node.endpoint}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Row Quick Select All Button */}
      <td className="py-2.5 px-2 text-center align-middle">
        {isFolder ? (
          <span className="text-slate-300 text-xs select-none">-</span>
        ) : isLockedForAdmin ? (
          <span className="p-1 rounded-md text-blue-600 bg-blue-50 cursor-not-allowed opacity-80 inline-block" title="สิทธิ์สำหรับผู้ดูแลระบบ (Admin) ไม่สามารถแก้ไขได้">
            <CheckSquare size={15} />
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onToggleRowAll(node)}
            title={allSupportedChecked ? 'ยกเลิกสิทธิ์ทั้งหมดของเมนูนี้' : 'เลือกสิทธิ์ทั้งหมดของเมนูนี้'}
            disabled={supportedKeys.length === 0}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              allSupportedChecked
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
          >
            <CheckSquare size={15} />
          </button>
        )}
      </td>

      {/* 6 Permission Checkboxes */}
      {permissionKeys.map(({ key, canKey, label, badgeBg }) => {
        if (isFolder) {
          return (
            <td
              key={key}
              className="py-2.5 px-3 text-center align-middle whitespace-nowrap"
            >
              <span className="text-slate-300 text-xs select-none">-</span>
            </td>
          );
        }

        const isSupported = isLockedForAdmin || node[canKey];
        const isChecked = isLockedForAdmin || node[key];

        return (
          <td
            key={key}
            className="py-2.5 px-3 text-center align-middle whitespace-nowrap"
          >
            {isSupported ? (
              <label className={`inline-flex items-center justify-center p-1 ${isLockedForAdmin ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isLockedForAdmin}
                  onChange={() => !isLockedForAdmin && onTogglePermission(node.menuId, key)}
                  title={isLockedForAdmin ? 'สิทธิ์สำหรับผู้ดูแลระบบ (Admin) เปิดใช้งานตลอดเวลา' : undefined}
                  className={`w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 ${
                    isLockedForAdmin ? 'cursor-not-allowed opacity-90 accent-blue-600' : `cursor-pointer ${badgeBg}`
                  }`}
                />
              </label>
            ) : (
              <span
                className="text-slate-300 text-xs select-none"
                title={`เมนูนี้ไม่รองรับสิทธิ์ ${label}`}
              >
                -
              </span>
            )}
          </td>
        );
      })}
    </tr>
  );
};
