import React, { useEffect, useMemo, useState } from 'react';
import { ShieldAlert, Plus } from 'lucide-react';
import { MenuManagementTreePanel } from './components/MenuManagementTreePanel';
import { MenuManagementDetailPanel } from './components/MenuManagementDetailPanel';
import { ConfirmModal, AlertModal } from '../../components/common/CustomModal';
import { useMenuManagementStore } from './model/menuManagementStore';
import {
  useDeleteMenuManagementMenuMutation,
  useMenuManagementMenuQuery,
  useMenuManagementTreeQuery,
  useSaveMenuManagementMenuMutation,
} from './model/queries';
import {
  buildMenuManagementDraft,
  collectMenuManagementDescendantIds,
  countMenuManagementDescendants,
  findFirstMenuManagementNodeId,
  findMenuManagementTreeNode,
  flattenMenuManagementParentOptions,
  validateMenuManagementDraft,
} from './model/menuManagementLogic';
import type { MenuManagementTreeItem } from './model/types';

const emptyTree: MenuManagementTreeItem[] = [];

export const MenuManagementPage: React.FC = () => {
  const selectedMenuId = useMenuManagementStore((state) => state.selectedMenuId);
  const mode = useMenuManagementStore((state) => state.mode);
  const createDraft = useMenuManagementStore((state) => state.createDraft);
  const viewDraftPatch = useMenuManagementStore((state) => state.viewDraftPatch);
  const selectMenu = useMenuManagementStore((state) => state.selectMenu);
  const startCreate = useMenuManagementStore((state) => state.startCreate);
  const cancelCreate = useMenuManagementStore((state) => state.cancelCreate);
  const updateDraft = useMenuManagementStore((state) => state.updateDraft);

  const treeQuery = useMenuManagementTreeQuery();
  const menuQuery = useMenuManagementMenuQuery(selectedMenuId);
  const saveMutation = useSaveMenuManagementMenuMutation();
  const deleteMutation = useDeleteMenuManagementMenuMutation();

  const tree = treeQuery.data ?? emptyTree;
  const selectedMenu = menuQuery.data ?? null;

  // Alert & Confirmation Modal States
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: 'success' | 'error' | 'info';
  }>({ isOpen: false, message: '' });

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Auto-select first menu if none selected or if selected menu was deleted
  useEffect(() => {
    if (treeQuery.isPending || tree.length === 0) {
      return;
    }

    if (selectedMenuId && findMenuManagementTreeNode(tree, selectedMenuId)) {
      return;
    }

    selectMenu(findFirstMenuManagementNodeId(tree));
  }, [selectMenu, selectedMenuId, tree, treeQuery.isPending]);

  // Merge drafts with server state
  const draft =
    mode === 'create'
      ? createDraft
      : selectedMenu
        ? {
            ...buildMenuManagementDraft(selectedMenu),
            ...(viewDraftPatch?.menuId === selectedMenu.id
              ? viewDraftPatch.patch
              : {}),
          }
        : null;

  const selectedTreeNode = useMemo(
    () => findMenuManagementTreeNode(tree, selectedMenuId),
    [selectedMenuId, tree],
  );
  const descendantCount = useMemo(
    () => countMenuManagementDescendants(selectedTreeNode),
    [selectedTreeNode],
  );
  const excludedParentIds = useMemo(() => {
    if (mode === 'create') {
      return new Set<number>();
    }

    const ids = new Set<number>();
    if (selectedTreeNode) {
      ids.add(selectedTreeNode.id);
      collectMenuManagementDescendantIds(selectedTreeNode, ids);
    }
    return ids;
  }, [mode, selectedTreeNode]);

  const parentOptions = useMemo(
    () => flattenMenuManagementParentOptions(tree, excludedParentIds),
    [excludedParentIds, tree],
  );

  async function handleSave() {
    if (!draft) return;

    const validationMessage = validateMenuManagementDraft(draft);
    if (validationMessage) {
      setAlertState({
        isOpen: true,
        title: 'ข้อมูลเมนูไม่ครบถ้วน',
        message: validationMessage,
        type: 'error',
      });
      return;
    }

    setConfirmState({
      isOpen: true,
      title: 'ยืนยันการบันทึกข้อมูลเมนู',
      message: `ต้องการบันทึกข้อมูลเมนู "${draft.nameEn}" ใช่หรือไม่? การเปลี่ยนแปลงจะมีผลในระบบทันที`,
      confirmText: 'ยืนยันการบันทึก',
      type: 'info',
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        try {
          const savedMenu = await saveMutation.mutateAsync({
            id: mode === 'create' ? null : selectedMenuId,
            draft,
          });
          selectMenu(savedMenu.id);
          setAlertState({
            isOpen: true,
            title: 'บันทึกสำเร็จ',
            message: `บันทึกข้อมูลเมนู "${savedMenu.nameEn}" เรียบร้อยแล้ว`,
            type: 'success',
          });
        } catch (err: any) {
          const errMsg =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            'ไม่สามารถบันทึกข้อมูลเมนูได้';
          setAlertState({
            isOpen: true,
            title: 'เกิดข้อผิดพลาด',
            message: errMsg,
            type: 'error',
          });
        }
      },
    });
  }

  async function handleDelete() {
    if (!selectedMenu) return;

    setConfirmState({
      isOpen: true,
      title: 'ยืนยันการลบเมนู',
      message: `เมนู "${selectedMenu.nameEn}" และเมนูลูกทั้งหมด (${descendantCount} เมนูย่อย) จะถูกลบและไม่แสดงผลในระบบอีก ต้องการดำเนินการต่อหรือไม่?`,
      confirmText: 'ยืนยันการลบ',
      type: 'danger',
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        try {
          await deleteMutation.mutateAsync({
            id: selectedMenu.id,
            nameEn: selectedMenu.nameEn,
          });
          selectMenu(selectedMenu.parentId);
          setAlertState({
            isOpen: true,
            title: 'ลบเมนูสำเร็จ',
            message: `ลบเมนู "${selectedMenu.nameEn}" เรียบร้อยแล้ว`,
            type: 'success',
          });
        } catch (err: any) {
          const errMsg =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            'ไม่สามารถลบเมนูได้';
          setAlertState({
            isOpen: true,
            title: 'เกิดข้อผิดพลาด',
            message: errMsg,
            type: 'error',
          });
        }
      },
    });
  }

  const role = (localStorage.getItem('role') || '').toLowerCase();
  if (role !== 'admin') {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-slate-900">
              คุณไม่มีสิทธิ์เข้าดูหน้าจัดการเมนู (Access Restricted)
            </h1>
            <p className="text-xs leading-relaxed text-slate-500">
              หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น หากต้องการเข้าถึงโปรดติดต่อผู้ดูแลระบบ
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (treeQuery.isPending && tree.length === 0) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
        <div className="text-center text-xs text-slate-500 font-medium">
          กำลังโหลดโครงสร้าง Menu Structure...
        </div>
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-slate-900">
              ยังไม่มีเมนูในระบบ
            </h1>
            <p className="text-xs leading-relaxed text-slate-500">
              เริ่มจากการสร้าง Root Menu แรก แล้วค่อยเพิ่มเมนูย่อยตามโครงสร้างที่ต้องการ
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => startCreate(null)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              สร้าง Root Menu แรก
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] space-y-4">
      <div className="grid min-h-0 flex-1 items-stretch gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
        {/* Left Panel: Menu Tree */}
        <MenuManagementTreePanel
          tree={tree}
          selectedMenuId={selectedMenuId}
          isLoading={treeQuery.isFetching}
          onSelect={selectMenu}
          onCreateRoot={() => startCreate(null)}
        />

        {/* Right Panel: Menu Detail */}
        <MenuManagementDetailPanel
          mode={mode}
          selectedMenu={selectedMenu}
          draft={draft}
          parentOptions={parentOptions}
          isLoadingDetail={menuQuery.isPending && selectedMenuId !== null}
          isSaving={saveMutation.isPending}
          isDeleting={deleteMutation.isPending}
          onStartCreateChild={() => startCreate(selectedMenu?.id ?? null)}
          onCancelCreate={cancelCreate}
          onChangeDraft={updateDraft}
          onToggleFlag={(key) => {
            if (draft) {
              updateDraft({ [key]: !draft[key] });
            }
          }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        type={confirmState.type}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
