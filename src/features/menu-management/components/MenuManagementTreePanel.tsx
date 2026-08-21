import React, { useDeferredValue, useMemo, useState } from 'react';
import {
  ChevronRight,
  ChevronsDownUp,
  ExternalLink,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Search,
} from 'lucide-react';
import { flattenTree } from '../lib/tree';
import type { MenuManagementTreeItem } from '../model/types';

const treeGuideWidth = 16;

interface MenuManagementTreePanelProps {
  tree: MenuManagementTreeItem[];
  selectedMenuId: number | null;
  canCreate?: boolean;
  isLoading: boolean;
  onSelect: (id: number) => void;
  onCreateRoot: () => void;
}

interface TreeNodeProps {
  item: MenuManagementTreeItem;
  level: number;
  isSelected: boolean;
  isExpanded: boolean;
  onToggle: (id: number) => void;
  onSelect: (id: number) => void;
}

function countAllNodes(items: MenuManagementTreeItem[]): number {
  return items.reduce(
    (total, item) => total + 1 + countAllNodes(item.children),
    0,
  );
}

function measureTreeDepth(items: MenuManagementTreeItem[]): number {
  return items.reduce(
    (deepest, item) => Math.max(deepest, 1 + measureTreeDepth(item.children)),
    0,
  );
}

function filterTree(
  items: MenuManagementTreeItem[],
  query: string,
): MenuManagementTreeItem[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return items;
  }

  return items
    .map((item) => {
      const children = filterTree(item.children, query);
      const haystack = [
        item.nameEn,
        item.nameTh,
        item.endpoint ?? '',
        item.externalUrl ?? '',
        item.menuType,
        item.openMode,
        item.authenticationMode,
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(normalized) && children.length === 0) {
        return null;
      }

      return {
        ...item,
        children,
      };
    })
    .filter((item): item is MenuManagementTreeItem => item !== null);
}

function TreeNodeGlyph({
  item,
  isExpanded,
  isSelected,
}: {
  item: MenuManagementTreeItem;
  isExpanded: boolean;
  isSelected: boolean;
}) {
  if (item.menuType === 'external') {
    return <ExternalLink className="h-3.5 w-3.5 shrink-0 text-sky-600" />;
  }

  if (!item.endpoint) {
    return isExpanded ? (
      <FolderOpen className="h-3.5 w-3.5 shrink-0 text-amber-500" />
    ) : (
      <Folder className="h-3.5 w-3.5 shrink-0 text-amber-500" />
    );
  }

  return (
    <FileText
      className={`h-3.5 w-3.5 shrink-0 ${
        isSelected ? 'text-blue-600' : 'text-slate-400'
      }`}
    />
  );
}

function TreeNode({
  item,
  level,
  isSelected,
  isExpanded,
  onToggle,
  onSelect,
}: TreeNodeProps) {
  const hasChildren = item.children.length > 0;

  return (
    <div
      className={`group relative flex h-[34px] items-stretch transition-colors ${
        isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50'
      }`}
    >
      {isSelected && (
        <span className="absolute inset-y-0 left-0 w-1 rounded-r bg-blue-600" />
      )}

      {/* Guide lines */}
      <span className="flex shrink-0" aria-hidden="true">
        {Array.from({ length: level }, (_, index) => (
          <span
            key={index}
            className="relative h-full"
            style={{ width: `${treeGuideWidth}px` }}
          >
            <span className="absolute inset-y-0 left-[7px] w-px bg-slate-200" />
          </span>
        ))}
      </span>

      {/* Expand / Collapse Button */}
      {hasChildren ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(item.id);
          }}
          className="my-auto ml-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700 cursor-pointer"
          aria-label={isExpanded ? 'ยุบเมนูย่อย' : 'กางเมนูย่อย'}
        >
          <ChevronRight
            className={`h-3.5 w-3.5 transition-transform duration-150 ${
              isExpanded ? 'rotate-90 text-slate-600' : ''
            }`}
          />
        </button>
      ) : (
        <span className="ml-1 h-5 w-5 shrink-0" />
      )}

      {/* Item Label Button */}
      <button
        type="button"
        onClick={() => {
          onSelect(item.id);
          if (hasChildren && !isExpanded) {
            onToggle(item.id);
          }
        }}
        title={`${item.nameEn} · ${item.nameTh}`}
        className="flex min-w-0 flex-1 items-center gap-2 pl-1 pr-3 text-left cursor-pointer"
      >
        <TreeNodeGlyph
          item={item}
          isExpanded={isExpanded}
          isSelected={isSelected}
        />

        <span
          className={`truncate text-xs ${
            isSelected ? 'font-bold text-blue-700' : 'text-slate-700'
          }`}
        >
          {item.nameEn}
        </span>

        <span className="ml-auto flex shrink-0 items-center gap-1.5">
          {item.menuType === 'external' && (
            <span className="rounded border border-sky-200 bg-sky-50 px-1 py-0.2 text-[10px] font-semibold text-sky-700">
              {item.openMode === 'iframe' ? 'iframe' : 'tab'}
            </span>
          )}
          {hasChildren && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-500">
              {item.children.length}
            </span>
          )}
          <span className="text-[10px] font-mono text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">
            #{item.seq}
          </span>
        </span>
      </button>
    </div>
  );
}

export const MenuManagementTreePanel: React.FC<MenuManagementTreePanelProps> = ({
  tree,
  selectedMenuId,
  canCreate = true,
  isLoading,
  onSelect,
  onCreateRoot,
}) => {
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const deferredQuery = useDeferredValue(query);

  const filteredTree = useMemo(
    () => filterTree(tree, deferredQuery),
    [tree, deferredQuery],
  );
  const totalMenus = useMemo(() => countAllNodes(tree), [tree]);
  const treeDepth = useMemo(() => measureTreeDepth(tree), [tree]);

  const isForceExpanded = Boolean(deferredQuery.trim());
  const treeRows = useMemo(
    () =>
      flattenTree(
        filteredTree,
        (item) => item.children,
        (item) => isForceExpanded || expandedIds.has(item.id),
      ),
    [filteredTree, isForceExpanded, expandedIds],
  );

  function toggleExpand(id: number) {
    if (isForceExpanded) return;
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function expandAll() {
    const all = new Set<number>();
    function collect(items: MenuManagementTreeItem[]) {
      for (const it of items) {
        all.add(it.id);
        collect(it.children);
      }
    }
    collect(tree);
    setExpandedIds(all);
  }

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/80 px-3.5 py-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
          โครงสร้างเมนู (Tree)
        </p>
        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-500">
          {totalMenus}
        </span>

        <span className="flex-1" />

        <button
          type="button"
          onClick={() => (expandedIds.size > 0 ? setExpandedIds(new Set()) : expandAll())}
          title={expandedIds.size > 0 ? 'ยุบเมนูทั้งหมด' : 'กางเมนูทั้งหมด'}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-500 hover:text-blue-600 cursor-pointer"
        >
          <ChevronsDownUp className="h-3.5 w-3.5" />
        </button>

        {canCreate && (
          <button
            type="button"
            onClick={onCreateRoot}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            สร้าง Root
          </button>
        )}
      </div>

      {/* Search Filter */}
      <label className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 focus-within:bg-blue-50/30">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
          placeholder="ค้นหาชื่อเมนู หรือ endpoint..."
        />
      </label>

      {/* Tree Content */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-white py-1">
        {isLoading ? (
          <div className="flex h-full min-h-[14rem] items-center justify-center text-xs text-slate-400">
            กำลังโหลดข้อมูลเมนู...
          </div>
        ) : filteredTree.length > 0 ? (
          <div className="flex flex-col">
            {treeRows.map((row) => (
              <TreeNode
                key={row.node.id}
                item={row.node}
                level={row.level}
                isSelected={selectedMenuId === row.node.id}
                isExpanded={isForceExpanded || expandedIds.has(row.node.id)}
                onToggle={toggleExpand}
                onSelect={onSelect}
              />
            ))}
          </div>
        ) : (
          <div className="m-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-xs text-slate-500">
            <Search className="mx-auto mb-2 h-5 w-5 text-slate-400" />
            <p className="font-semibold text-slate-700">ไม่พบเมนูที่ตรงกับคำค้นหา</p>
            <p className="mt-1 text-slate-400">ลองค้นหาด้วยชื่อเมนูภาษาไทย, อังกฤษ หรือ route endpoint</p>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex items-center gap-2 border-t border-slate-200 bg-slate-50/80 px-3 py-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <FileText className="h-3 w-3 text-slate-400" /> Page
        </span>
        <span className="flex items-center gap-1 ml-1.5">
          <Folder className="h-3 w-3 text-amber-500" /> Folder
        </span>
        <span className="flex items-center gap-1 ml-1.5">
          <ExternalLink className="h-3 w-3 text-sky-600" /> External
        </span>
        <span className="flex-1" />
        <span className="text-slate-400">ลึกสุด {treeDepth} ระดับ</span>
      </div>
    </aside>
  );
};
