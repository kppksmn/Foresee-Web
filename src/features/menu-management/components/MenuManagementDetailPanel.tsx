import React from 'react';
import {
  ClipboardList,
  FolderTree,
  GitBranchPlus,
  Globe,
  Link2,
  Save,
  Shield,
  SquarePen,
  Trash2,
} from 'lucide-react';
import { SectionPanel } from './SectionPanel';
import { SearchableSelect, type SearchableSelectOption } from './SearchableSelect';
import { MenuManagementPermissionToggle } from './MenuManagementPermissionToggle';
import {
  audienceOptions,
  authenticationModeOptions,
  menuTypeOptions,
  openModeOptions,
  permissionOptions,
  type MenuManagementDraft,
  type MenuManagementDraftFlagKey,
  type MenuManagementMenuItem,
  type MenuManagementParentOption,
} from '../model/types';

interface MenuManagementDetailPanelProps {
  mode: 'idle' | 'view' | 'create';
  selectedMenu: MenuManagementMenuItem | null;
  draft: MenuManagementDraft | null;
  parentOptions: MenuManagementParentOption[];
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  isLoadingDetail: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onStartCreateChild: () => void;
  onCancelCreate: () => void;
  onChangeDraft: (patch: Partial<MenuManagementDraft>) => void;
  onToggleFlag: (key: MenuManagementDraftFlagKey) => void;
  onSave: () => void;
  onDelete: () => void;
}

export const MenuManagementDetailPanel: React.FC<MenuManagementDetailPanelProps> = ({
  mode,
  selectedMenu,
  draft,
  parentOptions,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
  isLoadingDetail,
  isSaving,
  isDeleting,
  onStartCreateChild,
  onCancelCreate,
  onChangeDraft,
  onToggleFlag,
  onSave,
  onDelete,
}) => {
  const isCreateMode = mode === 'create';
  const canEdit = isCreateMode ? canCreate : canUpdate;

  const inputClass =
    'h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:bg-slate-50';

  const parentSelectOptions: SearchableSelectOption<number>[] =
    parentOptions.map((option) => ({
      value: option.id,
      label: `${'- '.repeat(Math.max(option.level - 1, 0))}${option.label}`,
      keywords: [option.label],
    }));

  const menuTypeSelectOptions: SearchableSelectOption<MenuManagementDraft['menuType']>[] =
    menuTypeOptions.map((option) => ({
      value: option.value,
      label: option.label,
      keywords: [option.description],
    }));

  const openModeSelectOptions: SearchableSelectOption<MenuManagementDraft['openMode']>[] =
    openModeOptions.map((option) => ({
      value: option.value,
      label: option.label,
      keywords: [option.description],
    }));

  const authenticationModeSelectOptions: SearchableSelectOption<MenuManagementDraft['authenticationMode']>[] =
    authenticationModeOptions.map((option) => ({
      value: option.value,
      label: option.label,
      keywords: [option.description],
    }));

  if (mode === 'idle' || !draft) {
    return (
      <section className="flex h-full min-h-[20rem] items-center justify-center rounded-xl border border-slate-200 bg-white p-8 shadow-xs">
        <div className="max-w-md text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-xs">
            <FolderTree className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">
            เลือกเมนูจากรายการเพื่อดูรายละเอียด
          </h2>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            เลือกเมนูจากฝั่งซ้ายเพื่อดูหรือแก้ไขรายละเอียด หรือกดปุ่ม <strong>"สร้าง Root"</strong> เพื่อเพิ่มหมวดหมู่ใหม่
          </p>
        </div>
      </section>
    );
  }

  const isExternalMenu = draft.menuType === 'external';

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      {/* Top Header Toolbar */}
      <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-3 shrink-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  isCreateMode
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {isCreateMode ? 'สร้างเมนูใหม่ (Create)' : 'รายละเอียดเมนู (Detail)'}
              </span>
              <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {isExternalMenu
                  ? 'External App'
                  : draft.endpoint.trim()
                    ? 'Page Endpoint'
                    : 'Folder Category'}
              </span>
            </div>

            <h2 className="mt-1 truncate text-base font-bold text-slate-900">
              {draft.nameEn || 'ร่างเมนูใหม่'}
              {draft.nameTh ? ` · ${draft.nameTh}` : ''}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedMenu && !isCreateMode && canCreate && (
              <button
                type="button"
                onClick={onStartCreateChild}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-blue-500 hover:text-blue-600 cursor-pointer"
              >
                <GitBranchPlus className="h-3.5 w-3.5" />
                เพิ่มเมนูย่อย
              </button>
            )}

            {isCreateMode && (
              <button
                type="button"
                onClick={onCancelCreate}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-600 shadow-xs transition hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                ยกเลิก
              </button>
            )}

            <button
              type="button"
              onClick={onSave}
              disabled={!canEdit || isSaving || isLoadingDetail}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </div>
      </div>

      {/* Form Body */}
      {isLoadingDetail ? (
        <div className="flex flex-1 items-center justify-center text-xs text-slate-400">
          กำลังโหลดรายละเอียดเมนู...
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Section 1: Basic info */}
          <SectionPanel
            title="ข้อมูลพื้นฐาน (Basic Information)"
            description="ชื่อที่จะแสดงในเมนูและใช้ค้นหาในระบบ"
            icon={ClipboardList}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-700">
                  Name EN <span className="text-rose-500">*</span>
                </span>
                <input
                  value={draft.nameEn}
                  onChange={(e) => onChangeDraft({ nameEn: e.target.value })}
                  disabled={!canEdit}
                  className={inputClass}
                  placeholder="เช่น Menu Management, Dashboard"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-700">
                  Name TH <span className="text-rose-500">*</span>
                </span>
                <input
                  value={draft.nameTh}
                  onChange={(e) => onChangeDraft({ nameTh: e.target.value })}
                  disabled={!canEdit}
                  className={inputClass}
                  placeholder="เช่น จัดการโครงสร้างเมนู, ภาพรวมระบบ"
                />
              </label>
            </div>
          </SectionPanel>

          {/* Section 2: External application */}
          <SectionPanel
            title="ประเภทเมนู & การเชื่อมต่อระบบ (Application Type & Integration)"
            description={
              isExternalMenu
                ? 'กำหนดปลายทาง URL และรูปแบบการเชื่อมต่อระบบภายนอก'
                : 'เมนูภายใน (Internal) ใช้ Route ภายในของระบบ Foresee Logix'
            }
            icon={Globe}
            tone="muted"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-700">
                  Menu Type
                </span>
                <SearchableSelect
                  value={draft.menuType}
                  options={menuTypeSelectOptions}
                  disabled={!canEdit}
                  placeholder="เลือกประเภทเมนู"
                  onChange={(value) => {
                    const nextType = value ?? draft.menuType;
                    onChangeDraft({
                      menuType: nextType,
                      externalUrl: nextType === 'external' ? draft.externalUrl : '',
                      targetPath: nextType === 'external' ? draft.targetPath : '',
                      openMode: nextType === 'external' ? draft.openMode : 'iframe',
                      authenticationMode:
                        nextType === 'external' ? draft.authenticationMode : 'none',
                    });
                  }}
                />
                <p className="text-[11px] text-slate-400">
                  {menuTypeOptions.find((o) => o.value === draft.menuType)?.description}
                </p>
              </label>

              {isExternalMenu && (
                <label className="block space-y-1 sm:col-span-2">
                  <span className="text-xs font-semibold text-slate-700">
                    External URL <span className="text-rose-500">*</span>
                  </span>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      value={draft.externalUrl}
                      onChange={(e) => onChangeDraft({ externalUrl: e.target.value })}
                      disabled={!canEdit}
                      className={`${inputClass} pl-8.5`}
                      placeholder="https://external-app.example.com"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    URL ของระบบปลายทางภายนอก
                  </p>
                </label>
              )}
            </div>

            {isExternalMenu && (
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-slate-700">
                    Target Path
                  </span>
                  <input
                    value={draft.targetPath}
                    onChange={(e) => onChangeDraft({ targetPath: e.target.value })}
                    disabled={!canEdit}
                    className={inputClass}
                    placeholder="/crm/customers"
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-slate-700">
                    Open Mode
                  </span>
                  <SearchableSelect
                    value={draft.openMode}
                    options={openModeSelectOptions}
                    disabled={!canEdit}
                    onChange={(value) =>
                      onChangeDraft({ openMode: value ?? draft.openMode })
                    }
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-slate-700">
                    Authentication Mode
                  </span>
                  <SearchableSelect
                    value={draft.authenticationMode}
                    options={authenticationModeSelectOptions}
                    disabled={!canEdit}
                    onChange={(value) =>
                      onChangeDraft({
                        authenticationMode: value ?? draft.authenticationMode,
                      })
                    }
                  />
                </label>
              </div>
            )}
          </SectionPanel>

          {/* Section 3: Placement */}
          <SectionPanel
            title="ตำแหน่งและเส้นทาง (Placement & Routing)"
            description="กำหนดตำแหน่งในระดับชั้นเมนูและ route endpoint"
            icon={Link2}
          >
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem_8rem]">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-700">
                  Endpoint (Route URL)
                </span>
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={draft.endpoint}
                    onChange={(e) => onChangeDraft({ endpoint: e.target.value })}
                    disabled={!canEdit}
                    className={`${inputClass} pl-8.5`}
                    placeholder="/menu-managements"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {isExternalMenu
                    ? 'กำหนด Route ภายในสำหรับแสดง active state เช่น /external/crm'
                    : 'เว้นว่างได้ถ้าต้องการให้เมนูนี้เป็น Folder Group ที่ไม่มีการนำทาง'}
                </p>
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-700">
                  Parent Menu (เมนูหลัก)
                </span>
                <SearchableSelect
                  value={draft.parentId}
                  options={parentSelectOptions}
                  disabled={!canEdit}
                  nullOptionLabel="ระดับสูงสุด (Root Level)"
                  placeholder="เลือกระดับชั้นหลัก"
                  onChange={(value) => onChangeDraft({ parentId: value })}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-700">
                  Sequence (ลำดับ) <span className="text-rose-500">*</span>
                </span>
                <input
                  type="number"
                  min={1}
                  value={draft.seq > 0 ? draft.seq : ''}
                  onChange={(e) => {
                    const num = parseInt(e.target.value, 10);
                    onChangeDraft({ seq: isNaN(num) ? 0 : num });
                  }}
                  disabled={!canEdit}
                  className={inputClass}
                />
              </label>
            </div>
          </SectionPanel>

          {/* Section 4: Audience assignment */}
          <SectionPanel
            title="กลุ่มผู้ใช้งาน (Audience Assignment)"
            description="กำหนดว่าระบบจะแสดงเมนูนี้ให้กลุ่มผู้ใช้ใดบ้างโดยอัตโนมัติ"
            icon={Shield}
            tone="muted"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {audienceOptions.map((option) => (
                <MenuManagementPermissionToggle
                  key={option.key}
                  active={draft[option.key]}
                  label={option.label}
                  description={option.description}
                  tone={option.tone}
                  disabled={!canEdit}
                  onClick={() => onToggleFlag(option.key)}
                />
              ))}
            </div>
          </SectionPanel>

          {/* Section 5: Permission Matrix */}
          <SectionPanel
            title="สิทธิ์การดำเนินการ (Permission Matrix)"
            description="เลือกสิทธิ์การใช้งานที่เมนูนี้รองรับ"
            icon={SquarePen}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {permissionOptions.map((option) => (
                <MenuManagementPermissionToggle
                  key={option.key}
                  active={draft[option.key]}
                  label={option.label}
                  description={option.description}
                  tone={option.tone}
                  disabled={!canEdit}
                  onClick={() => onToggleFlag(option.key)}
                />
              ))}
            </div>
          </SectionPanel>

          {/* Section 6: Danger Zone (Delete) */}
          {!isCreateMode && canDelete && selectedMenu && (
            <SectionPanel
              title="พื้นที่อันตราย (Danger Zone)"
              description="การลบเมนูจะส่งผลให้เมนูนี้และเมนูลูกทั้งหมดถูกปิดการใช้งานทันที"
              icon={Trash2}
              tone="danger"
            >
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeleting}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isDeleting ? 'กำลังลบ...' : `ลบเมนู "${selectedMenu.nameEn}"`}
              </button>
            </SectionPanel>
          )}
        </div>
      )}
    </section>
  );
};
