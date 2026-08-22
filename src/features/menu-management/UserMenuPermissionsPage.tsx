import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Search,
  RotateCcw,
  Save,
  CheckCheck,
  Ban,
  CheckSquare,
  AlertCircle,
  CheckCircle2,
  Users,
  ShieldAlert,
} from 'lucide-react';
import apiClient from '../../api/client';
import { useQueryClient } from '@tanstack/react-query';
import { UserMenuAssignmentTreeRow } from '../users/components/UserMenuAssignmentTreeRow';
import type {
  UserMenuPermissionNode,
  UserMenuPermissionKey,
  UserMenuPermissionItemRequest,
} from '../users/model/types';

interface UserListItem {
  id: number;
  username: string;
  name?: string;
  role: string;
  employeeId?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

type FilterType = 'all' | 'granted' | 'changed';

export const UserMenuPermissionsPage: React.FC = () => {
  const userRole = (localStorage.getItem('role') || '').toLowerCase();
  const queryClient = useQueryClient();

  // Users state
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserRole, setSelectedUserRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  // Permission tree state
  const [initialTree, setInitialTree] = useState<UserMenuPermissionNode[]>([]);
  const [tree, setTree] = useState<UserMenuPermissionNode[]>([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilter, setMenuFilter] = useState<FilterType>('all');
  const [collapsedMenuIds, setCollapsedMenuIds] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch users list on mount
  useEffect(() => {
    setIsLoadingUsers(true);
    apiClient
      .get('/api/v1/admin/users')
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          const list: UserListItem[] = res.data.data;
          setUsers(list);
          if (list.length > 0) {
            setSelectedUser(list[0]);
          }
        }
      })
      .catch((err) => {
        setErrorMessage(
          err.response?.data?.message || 'ไม่สามารถโหลดรายชื่อผู้ใช้งานได้'
        );
      })
      .finally(() => {
        setIsLoadingUsers(false);
      });
  }, []);

  // Fetch permissions when selectedUser changes
  useEffect(() => {
    if (selectedUser?.id) {
      setIsLoadingTree(true);
      setErrorMessage('');
      setSuccessMessage('');
      setMenuSearch('');
      setMenuFilter('all');
      setCollapsedMenuIds(new Set());

      apiClient
        .get(`/api/v1/admin/users/${selectedUser.id}/menu-permissions`)
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
          setIsLoadingTree(false);
        });
    }
  }, [selectedUser?.id]);

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

  const isTargetAdmin = selectedUser?.role?.toLowerCase() === 'admin';

  const handleTogglePermission = (menuId: number, key: UserMenuPermissionKey) => {
    setTree((prevTree) =>
      updateNodeInTree(prevTree, menuId, (node) => {
        const isMenuMgmt =
          node.endpoint === '/menu-managements' ||
          node.endpoint === '/menu-managements/permissions';
        if (isTargetAdmin && isMenuMgmt) {
          return {
            ...node,
            isRead: true,
            isCreate: true,
            isUpdate: true,
            isDelete: true,
            isImport: true,
            isExport: true,
          };
        }

        const nextValue = !node[key];
        const updated = { ...node, [key]: nextValue };
        if (nextValue && key !== 'isRead' && node.canRead) {
          updated.isRead = true;
        }
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

  const handleToggleRowAll = (node: UserMenuPermissionNode) => {
    const isMenuMgmt =
      node.endpoint === '/menu-managements' ||
      node.endpoint === '/menu-managements/permissions';
    if (isTargetAdmin && isMenuMgmt) {
      return;
    }

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

  const handleSelectAll = (onlyRead = false) => {
    const applyToAll = (nodes: UserMenuPermissionNode[]): UserMenuPermissionNode[] => {
      return nodes.map((node) => {
        const isFolder = (node.children && node.children.length > 0) || !node.endpoint;
        const isMenuMgmt =
          node.endpoint === '/menu-managements' ||
          node.endpoint === '/menu-managements/permissions';
        const isLocked = isTargetAdmin && isMenuMgmt;

        return {
          ...node,
          isRead: isLocked ? true : !isFolder && node.canRead ? true : false,
          isCreate: isLocked ? true : !isFolder && !onlyRead && node.canCreate ? true : false,
          isUpdate: isLocked ? true : !isFolder && !onlyRead && node.canUpdate ? true : false,
          isDelete: isLocked ? true : !isFolder && !onlyRead && node.canDelete ? true : false,
          isImport: isLocked ? true : !isFolder && !onlyRead && node.canImport ? true : false,
          isExport: isLocked ? true : !isFolder && !onlyRead && node.canExport ? true : false,
          children: applyToAll(node.children || []),
        };
      });
    };
    setTree((prev) => applyToAll(prev));
  };

  const handleClearAll = () => {
    const clearInNodes = (nodes: UserMenuPermissionNode[]): UserMenuPermissionNode[] => {
      return nodes.map((node) => {
        const isMenuMgmt =
          node.endpoint === '/menu-managements' ||
          node.endpoint === '/menu-managements/permissions';
        const isLocked = isTargetAdmin && isMenuMgmt;

        return {
          ...node,
          isRead: isLocked ? true : false,
          isCreate: isLocked ? true : false,
          isUpdate: isLocked ? true : false,
          isDelete: isLocked ? true : false,
          isImport: isLocked ? true : false,
          isExport: isLocked ? true : false,
          children: clearInNodes(node.children || []),
        };
      });
    };
    setTree((prev) => clearInNodes(prev));
  };

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

  // Flatten initial tree for change detection
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

  // Filter tree
  const filteredTree = useMemo(() => {
    const query = menuSearch.trim().toLowerCase();

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
        if (menuFilter === 'granted') {
          matchesTab = isNodeGranted(node) || filteredChildren.length > 0;
        } else if (menuFilter === 'changed') {
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
  }, [tree, menuSearch, menuFilter, initialMap]);

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

  // Filtered users list
  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter((u) => {
      const matchRole =
        selectedUserRole === 'all' ||
        u.role.toLowerCase() === selectedUserRole.toLowerCase();
      const matchQuery =
        !q ||
        u.username.toLowerCase().includes(q) ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.employeeId && u.employeeId.toLowerCase().includes(q));
      return matchRole && matchQuery;
    });
  }, [users, userSearch, selectedUserRole]);

  const handleSave = async () => {
    if (!selectedUser?.id) return;
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
        `/api/v1/admin/users/${selectedUser.id}/menu-permissions`,
        { permissions }
      );
      if (res.data?.success) {
        setSuccessMessage('บันทึกสิทธิ์การใช้งานเมนูเรียบร้อยแล้ว');
        setInitialTree(JSON.parse(JSON.stringify(tree)));
        queryClient.invalidateQueries({ queryKey: ['me-nav-menus'] });
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

  // Guard: Admin only
  if (userRole !== 'admin') {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-slate-900">
              คุณไม่มีสิทธิ์เข้าดูหน้ากำหนดสิทธิ์เมนู (Access Restricted)
            </h1>
            <p className="text-xs leading-relaxed text-slate-500">
              หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          กำหนดสิทธิ์การใช้งานเมนู (User Menu Permissions)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          จัดการสิทธิ์การเข้าถึงเมนูและการดำเนินการ (Read, Create, Update, Delete, Import, Export) รายบุคคล
        </p>
      </div>

      {/* Main Grid: User Selector & Permission Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-[20rem_minmax(0,1fr)] gap-4 items-stretch min-h-[calc(100vh-13rem)]">
        {/* Left Panel: User Selector */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 space-y-2.5">
            <div className="flex items-center gap-2">
              <Users size={17} className="text-blue-600" />
              <span className="text-xs font-bold text-slate-800">
                เลือกผู้ใช้งาน ({filteredUsers.length})
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, Username, รหัส..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setSelectedUserRole('all')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  selectedUserRole === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200/60 hover:bg-slate-200'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setSelectedUserRole('Admin')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  selectedUserRole === 'Admin' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200/60 hover:bg-slate-200'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setSelectedUserRole('Driver')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  selectedUserRole === 'Driver' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200/60 hover:bg-slate-200'
                }`}
              >
                Driver
              </button>
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1.5 min-h-[300px] max-h-[calc(100vh-21rem)]">
            {isLoadingUsers ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                กำลังโหลดรายชื่อผู้ใช้...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไข
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                const initials = u.username.length >= 2 ? u.username.substring(0, 2).toUpperCase() : u.username.toUpperCase();

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUser(u)}
                    className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border border-blue-200 shadow-xs'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        u.role === 'Admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                          {u.name || u.username}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                            u.role === 'Admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-mono">{u.username}</span>
                        {u.employeeId && <span>· {u.employeeId}</span>}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Permission Matrix */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
          {selectedUser ? (
            <>
              {/* User Info Bar */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
                    <Shield size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        {selectedUser.name || selectedUser.username}
                      </h3>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          selectedUser.role === 'Admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {selectedUser.role}
                      </span>
                      {changeCount > 0 && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                          มีการแก้ไข {changeCount} เมนู
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Username: <span className="font-mono text-slate-700">{selectedUser.username}</span>
                      {selectedUser.employeeId && ` · รหัสพนักงาน: ${selectedUser.employeeId}`}
                      {selectedUser.phone && ` · เบอร์โทร: ${selectedUser.phone}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={changeCount === 0}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <RotateCcw size={13} className="inline mr-1" />
                    คืนค่าเดิม
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || isLoadingTree}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Save size={14} />
                    <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกสิทธิ์'}</span>
                  </button>
                </div>
              </div>

              {/* Action & Filter Toolbar */}
              <div className="p-3 sm:px-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
                    <button
                      type="button"
                      onClick={() => setMenuFilter('all')}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        menuFilter === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      ทั้งหมด
                    </button>
                    <button
                      type="button"
                      onClick={() => setMenuFilter('granted')}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        menuFilter === 'granted' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      มีสิทธิ์
                    </button>
                    <button
                      type="button"
                      onClick={() => setMenuFilter('changed')}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        menuFilter === 'changed' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      แก้ไขแล้ว ({changeCount})
                    </button>
                  </div>

                  <div className="relative flex-1 sm:w-56">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาเมนู..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                    />
                  </div>
                </div>

                {/* Bulk Action Buttons */}
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
                </div>
              </div>

              {/* Status Alert Messages */}
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

              {/* Matrix Table */}
              <div className="flex-1 overflow-y-auto p-4 min-h-[350px]">
                {isLoadingTree ? (
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
                          <th className="py-3 px-4 min-w-[260px]">โครงสร้างเมนู (Menu Structure)</th>
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
                            isTargetUserAdmin={isTargetAdmin}
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
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-slate-400 text-xs">
              กรุณาเลือกผู้ใช้งานจากแถบด้านซ้ายเพื่อกำหนดสิทธิ์
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
