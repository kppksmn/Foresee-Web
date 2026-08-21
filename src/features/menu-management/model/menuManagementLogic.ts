import {
  defaultMenuManagementDraft,
  type MenuManagementDraft,
  type MenuManagementMenuItem,
  type MenuManagementParentOption,
  type MenuManagementTreeItem,
} from './types';

export function buildMenuManagementDraft(
  menu: MenuManagementMenuItem,
): MenuManagementDraft {
  return {
    nameTh: menu.nameTh,
    nameEn: menu.nameEn,
    endpoint: menu.endpoint ?? '',
    menuType: menu.menuType,
    externalUrl: menu.externalUrl ?? '',
    targetPath: menu.targetPath ?? '',
    openMode: menu.openMode,
    authenticationMode: menu.authenticationMode,
    parentId: menu.parentId,
    seq: menu.seq,
    isPublic: menu.isPublic,
    isMarketing: menu.isMarketing,
    isRead: menu.isRead,
    isCreate: menu.isCreate,
    isUpdate: menu.isUpdate,
    isDelete: menu.isDelete,
    isImport: menu.isImport,
    isExport: menu.isExport,
  };
}

export function buildCreateMenuManagementDraft(
  parentId: number | null = null,
): MenuManagementDraft {
  return {
    ...defaultMenuManagementDraft,
    parentId,
  };
}

export function findMenuManagementTreeNode(
  items: MenuManagementTreeItem[],
  id: number | null,
): MenuManagementTreeItem | null {
  if (!id) {
    return null;
  }

  for (const item of items) {
    if (item.id === id) {
      return item;
    }

    const childMatch = findMenuManagementTreeNode(item.children, id);
    if (childMatch) {
      return childMatch;
    }
  }

  return null;
}

export function findFirstMenuManagementNodeId(
  items: MenuManagementTreeItem[],
): number | null {
  return items[0]?.id ?? null;
}

export function countMenuManagementDescendants(
  item: MenuManagementTreeItem | null,
): number {
  if (!item) {
    return 0;
  }

  return item.children.reduce(
    (total, child) => total + 1 + countMenuManagementDescendants(child),
    0,
  );
}

export function collectMenuManagementDescendantIds(
  item: MenuManagementTreeItem | null,
  collected = new Set<number>(),
): Set<number> {
  if (!item) {
    return collected;
  }

  for (const child of item.children) {
    collected.add(child.id);
    collectMenuManagementDescendantIds(child, collected);
  }

  return collected;
}

export function flattenMenuManagementParentOptions(
  items: MenuManagementTreeItem[],
  excludedIds: Set<number>,
  level = 1,
): MenuManagementParentOption[] {
  return items.flatMap((item) => {
    const children = flattenMenuManagementParentOptions(
      item.children,
      excludedIds,
      level + 1,
    );

    if (excludedIds.has(item.id)) {
      return children;
    }

    return [
      {
        id: item.id,
        label: item.nameEn,
        level,
      },
      ...children,
    ];
  });
}

export function validateMenuManagementDraft(draft: MenuManagementDraft): string | null {
  if (!draft.nameEn.trim()) {
    return 'กรุณากรอก Name EN';
  }

  if (!draft.nameTh.trim()) {
    return 'กรุณากรอก Name TH';
  }

  if (draft.seq <= 0) {
    return 'Sequence ต้องมีค่ามากกว่า 0';
  }

  if (draft.menuType === 'external') {
    if (!draft.endpoint.trim()) {
      return 'กรุณากรอก Endpoint สำหรับ external menu';
    }

    if (!draft.externalUrl.trim()) {
      return 'กรุณากรอก External URL';
    }

    if (!draft.targetPath.trim()) {
      return 'กรุณากรอก Target Path';
    }

    try {
      const url = new URL(draft.externalUrl.trim());
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return 'External URL ต้องขึ้นต้นด้วย http หรือ https';
      }
    } catch {
      return 'External URL ไม่ถูกต้อง';
    }
  }

  return null;
}
