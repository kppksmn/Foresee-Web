import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Shield,
  Search,
  RotateCcw,
  Save,
  CheckCheck,
  Ban,
  CheckSquare,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import apiClient from '../../../api/client';
import { UserMenuAssignmentTreeRow } from './UserMenuAssignmentTreeRow';
import type {
  UserMenuPermissionNode,
  UserMenuPermissionKey,
  UserMenuPermissionItemRequest,
} from '../model/types';

interface UserMenuAssignmentModalProps {
  isOpen: boolean;
  user: {
    id: number;
    username: string;
    name?: string;
    role: string;
    employeeId?: string;
  } | null;
  onClose: () => void;
  onSaved?: () => void;
}

type FilterType = 'all' | 'granted' | 'changed';

export const UserMenuAssignmentModal: React.FC<UserMenuAssignmentModalProps> = ({
  isOpen,
  user,
  onClose,
  onSaved,
}) => {
  const [initialTree, setInitialTree] = useState<UserMenuPermissionNode[]>([]);
  const [tree, setTree] = useState<UserMenuPermissionNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [collapsedMenuIds, setCollapsedMenuIds] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user permissions when modal opens
  useEffect(() => {
    if (isOpen && user?.id) {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      setSearch('');
      setFilter('all');
      setCollapsedMenuIds(new Set());

      apiClient
        .get(`/api/v1/admin/users/${user.id}/menu-permissions`)
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            const data: UserMenuPermissionNode[] = res.data.data;
            setInitialTree(JSON.parse(JSON.stringify(data)));
            setTree(JSON.parse(JSON.stringify(data)));
          }
        })
        .catch((err) => {
          setErrorMessage(
            err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลสิทธิ์เมนูได้'
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, user?.id]);

  // Recursively update a node in tree
  const updateNodeInTree = (
    nodes: UserMenuPermissionNode[],
    menuId: number,
    updater: (node: UserMenuPermissionNode) => UserMenuPermissionNode
  ): UserMenuPermissionNode[] => {
    return nodes.map((node) => {
      if (node.menuId === menuId) {
        return updater({ ...node });
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: updateNodeInTree(node.children, menuId, updater),
        };
      }
      return node;
    });
  };

  // Toggle single permission key on a menu node
  const handleTogglePermission = (menuId: number, key: UserMenuPermissionKey) => {
    setTree((prevTree) =>
      updateNodeInTree(prevTree, menuId, (node) => {
        const nextValue = !node[key];
        const updated = { ...node, [key]: nextValue };
        // If enabling create/update/delete/import/export, also ensure isRead is enabled if supported
        if (nextValue && key !== 'isRead' && node.canRead) {
          updated.isRead = true;
        }
        // If disabling isRead, also disable child action permissions
        if (!nextValue && key === 'isRead') {
          updated.isCreate = false;
          updated.isUpdate = false;
          updated.isDelete = false;
          updated.isImport = false;
          updated.isExport = false;
        }
        return updated;
      })
    );
  };

  // Toggle all permissions for a specific row
  const handleToggleRowAll = (node: UserMenuPermissionNode) => {
    const keys: UserMenuPermissionKey[] = [
      'isRead',
      'isCreate',
      'isUpdate',
      'isDelete',
      'isImport',
      'isExport',
    ];
    const canKeys: Array<'canRead' | 'canCreate' | 'canUpdate' | 'canDelete' | 'canImport' | 'canExport'> = [
      'canRead',
      'canCreate',
      'canUpdate',
      'canDelete',
      'canImport',
      'canExport',
    ];

    const supported = keys.filter((_, idx) => node[canKeys[idx]]);
    const allChecked = supported.length > 0 && supported.every((k) => node[k]);

    setTree((prevTree) =>
      updateNodeInTree(prevTree, node.menuId, (n) => {
        const updated = { ...n };
        supported.forEach((k) => {
          updated[k] = !allChecked;
        });
        return updated;
      })
    );
  };

  // Bulk select all supported permissions for all menus
  const handleSelectAll = (onlyRead = false) => {
    const applyToAll = (nodes: UserMenuPermissionNode[]): UserMenuPermissionNode[] => {
      return nodes.map((node) => ({
        ...node,
        isRead: node.canRead ? true : node.isRead,
        isCreate: !onlyRead && node.canCreate ? true : node.isCreate,
        isUpdate: !onlyRead && node.canUpdate ? true : node.isUpdate,
        isDelete: !onlyRead && node.canDelete ? true : node.isDelete,
        isImport: !onlyRead && node.canImport ? true : node.isImport,
        isExport: !onlyRead && node.canExport ? true : node.isExport,
        children: applyToAll(node.children || []),
      }));
    };
    setTree((prev) => applyToAll(prev));
  };

  // Bulk clear all permissions
  const handleClearAll = () => {
    const clearInNodes = (nodes: UserMenuPermissionNode[]): UserMenuPermissionNode[] => {
      return nodes.map((node) => ({
        ...node,
        isRead: false,
        isCreate: false,
        isUpdate: false,
        isDelete: false,
        isImport: false,
        isExport: false,
        children: clearInNodes(node.children || []),
      }));
    };
    setTree((prev) => clearInNodes(prev));
  };

  // Reset to initial state
  const handleReset = () => {
    setTree(JSON.parse(JSON.stringify(initialTree)));
  };

  const handleToggleCollapse = (menuId: number) => {
    setCollapsedMenuIds((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  // Helper to flatten initial tree for change detection
  const initialMap = useMemo(() => {
    const map = new Map<number, UserMenuPermissionNode>();
    const walk = (nodes: UserMenuPermissionNode[]) => {
      nodes.forEach((n) => {
        map.set(n.menuId, n);
        if (n.children) walk(n.children);
      });
    };
    walk(initialTree);
    return map;
  }, [initialTree]);

  // Check if node has changes compared to initial
  const isNodeChanged = (node: UserMenuPermissionNode): boolean => {
    const orig = initialMap.get(node.menuId);
    if (!orig) return false;
    return (
      node.isRead !== orig.isRead ||
      node.isCreate !== orig.isCreate ||
      node.isUpdate !== orig.isUpdate ||
      node.isDelete !== orig.isDelete ||
      node.isImport !== orig.isImport ||
      node.isExport !== orig.isExport
    );
  };

  // Check if node has any permission granted
  const isNodeGranted = (node: UserMenuPermissionNode): boolean => {
    return (
      node.isRead ||
      node.isCreate ||
      node.isUpdate ||
      node.isDelete ||
      node.isImport ||
      node.isExport
    );
  };

  // Filter tree based on search query and filter tab
  const filteredTree = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filterNodes = (nodes: UserMenuPermissionNode[]): UserMenuPermissionNode[] => {
      const result: UserMenuPermissionNode[] = [];

      for (const node of nodes) {
        const filteredChildren = filterNodes(node.children || []);

        const matchesQuery =
          !query ||
          node.nameTh.toLowerCase().includes(query) ||
          node.nameEn.toLowerCase().includes(query) ||
          (node.endpoint && node.endpoint.toLowerCase().includes(query));

        let matchesTab = true;
        if (filter === 'granted') {
          matchesTab = isNodeGranted(node) || filteredChildren.length > 0;
        } else if (filter === 'changed') {
          matchesTab = isNodeChanged(node) || filteredChildren.length > 0;
        }

        if ((matchesQuery && matchesTab) || filteredChildren.length > 0) {
          result.push({
            ...node,
            children: filteredChildren,
          });
        }
      }

      return result;
    };

    return filterNodes(tree);
  }, [tree, search, filter, initialMap]);

  // Flatten filtered tree for rendering rows
  const flattenedRows = useMemo(() => {
    const rows: Array<{
      node: UserMenuPermissionNode;
      level: number;
      hasChildren: boolean;
      isCollapsed: boolean;
    }> = [];

    const walk = (nodes: UserMenuPermissionNode[], level: number) => {
      for (const node of nodes) {
        const hasChildren = !!node.children && node.children.length > 0;
        const isCollapsed = collapsedMenuIds.has(node.menuId);

        rows.push({
          node,
          level,
          hasChildren,
          isCollapsed,
        });

        if (hasChildren && !isCollapsed) {
          walk(node.children, level + 1);
        }
      }
    };

    walk(filteredTree, 0);
    return rows;
  }, [filteredTree, collapsedMenuIds]);

  // Count total changes
  const changeCount = useMemo(() => {
    let count = 0;
    const walk = (nodes: UserMenuPermissionNode[]) => {
      nodes.forEach((n) => {
        if (isNodeChanged(n)) count++;
        if (n.children) walk(n.children);
      });
    };
    walk(tree);
    return count;
  }, [tree, initialMap]);

  // Collect flat list of all permissions to save
  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    const permissions: UserMenuPermissionItemRequest[] = [];
    const walk = (nodes: UserMenuPermissionNode[]) => {
      nodes.forEach((n) => {
        permissions.push({
          menuId: n.menuId,
          isRead: n.isRead,
          isCreate: n.isCreate,
          isUpdate: n.isUpdate,
          isDelete: n.isDelete,
          isImport: n.isImport,
          isExport: n.isExport,
        });
        if (n.children) walk(n.children);
      });
    };
    walk(tree);

    try {
      const res = await apiClient.put(
        `/api/v1/admin/users/${user.id}/menu-permissions`,
        { permissions }
      );
      if (res.data?.success) {
        setSuccessMessage('บันทึกสิทธิ์การใช้งานเมนูเรียบร้อยแล้ว');
        setInitialTree(JSON.parse(JSON.stringify(tree)));
        if (onSaved) onSaved();
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMessage(res.data?.message || 'ไม่สามารถบันทึกข้อมูลสิทธิ์ได้');
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกสิทธิ์'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-5xl h-[92vh] max-h-[850px] rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <Shield size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  กำหนดสิทธิ์การใช้งานเมนู (Menu Permissions)
                </h3>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    user.role === 'Admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {user.role}
                </span>
                {changeCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                    มีการแก้ไข {changeCount} เมนู
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ผู้ใช้งาน: <span className="font-semibold text-slate-700">{user.name || user.username}</span>
                {user.employeeId && ` (${user.employeeId})`} · Username: <span className="font-mono text-slate-600">{user.username}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action & Filter Toolbar */}
        <div className="p-3.5 sm:px-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Filter Tabs & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  filter === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setFilter('granted')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  filter === 'granted' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                มีสิทธิ์
              </button>
              <button
                type="button"
                onClick={() => setFilter('changed')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  filter === 'changed' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                แก้ไขแล้ว ({changeCount})
              </button>
            </div>

            <div className="relative flex-1 sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาเมนู..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>
          </div>

          {/* Quick Bulk Actions */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSelectAll(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            >
              <CheckSquare size={13} />
              <span>เลือก Read ทั้งหมด</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectAll(false)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
            >
              <CheckCheck size={13} />
              <span>เลือกทุกสิทธิ์</span>
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
            >
              <Ban size={13} />
              <span>ล้างทั้งหมด</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={changeCount === 0}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>คืนค่าเดิม</span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-xs text-slate-400">
              กำลังโหลดข้อมูลสิทธิ์เมนู...
            </div>
          ) : flattenedRows.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-slate-400">
              <Search size={32} className="mb-2 text-slate-300" />
              <p className="text-xs">ไม่พบเมนูที่ตรงกับเงื่อนไขการค้นหา/กรอง</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-4 min-w-[280px]">โครงสร้างเมนู (Menu Structure)</th>
                    <th className="py-3 px-2 text-center w-12">เลือก</th>
                    <th className="py-3 px-3 text-center w-20 text-blue-700">ดู (Read)</th>
                    <th className="py-3 px-3 text-center w-20 text-emerald-700">สร้าง (Create)</th>
                    <th className="py-3 px-3 text-center w-20 text-amber-700">แก้ไข (Update)</th>
                    <th className="py-3 px-3 text-center w-20 text-rose-700">ลบ (Delete)</th>
                    <th className="py-3 px-3 text-center w-20 text-indigo-700">นำเข้า (Import)</th>
                    <th className="py-3 px-3 text-center w-20 text-purple-700">ส่งออก (Export)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {flattenedRows.map(({ node, level, hasChildren, isCollapsed }) => (
                    <UserMenuAssignmentTreeRow
                      key={node.menuId}
                      node={node}
                      level={level}
                      hasChildren={hasChildren}
                      isCollapsed={isCollapsed}
                      onToggleCollapse={handleToggleCollapse}
                      onTogglePermission={handleTogglePermission}
                      onToggleRowAll={handleToggleRowAll}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {changeCount > 0 ? (
              <span className="text-amber-700 font-medium">
                * มีการแก้ไขสิทธิ์ {changeCount} เมนูที่ยังไม่ได้บันทึก
              </span>
            ) : (
              <span>สิทธิ์ของเมนูปัจจุบันตรงกับฐานข้อมูล</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-white transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกสิทธิ์เมนู'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
