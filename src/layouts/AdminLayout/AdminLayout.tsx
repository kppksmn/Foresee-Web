import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Tag,
  List,
  PanelLeftClose,
  PanelLeftOpen,
  History
} from 'lucide-react';

interface SidebarItem {
  text: string;
  icon: any;
  path?: string;
  subItems?: { text: string; icon: any; path: string }[];
}

const sidebarItems: SidebarItem[] = [
  { text: 'ภาพรวมระบบ', icon: LayoutDashboard, path: '/dashboard' },
  {
    text: 'รายการงาน',
    icon: Truck,
    subItems: [
      { text: 'งานปัจจุบัน', icon: List, path: '/jobs' },
      { text: 'ประวัติงาน', icon: History, path: '/jobs/history' },
    ],
  },
  {
    text: 'จัดการยานพาหนะ',
    icon: Truck,
    subItems: [
      { text: 'ข้อมูลยานพาหนะ', icon: List, path: '/vehicles' },
      { text: 'ประเภทรถ', icon: Tag, path: '/vehicle-types' },
    ],
  },
  { text: 'พนักงาน & ผู้ใช้', icon: Users, path: '/users' },
  { text: 'Audit Log (ประวัติการทำงาน)', icon: History, path: '/audit-logs' },
];

export const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({
    'รายการงาน': true,
    'จัดการยานพาหนะ': true,
  });
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const toggleSubmenu = (text: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenSubmenus((prev) => ({ ...prev, [text]: true }));
    } else {
      setOpenSubmenus((prev) => ({ ...prev, [text]: !prev[text] }));
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex font-['Prompt',sans-serif]">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-slate-200/80 flex flex-col h-full transition-all duration-300 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } w-64 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-6'} border-b border-slate-100`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30 shrink-0">
              <Truck size={20} />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-lg text-slate-900 tracking-tight whitespace-nowrap">
                Foresee Logix
              </span>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {sidebarItems.map((item) => {
            const Icon = item.icon;

            if (item.subItems) {
              const isSubActive = item.subItems.some((sub) => location.pathname === sub.path);
              const isOpen = openSubmenus[item.text] ?? true;

              return (
                <div key={item.text} className="space-y-1">
                  <button
                    onClick={() => toggleSubmenu(item.text)}
                    title={isCollapsed ? item.text : undefined}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
                      isSubActive
                        ? 'bg-blue-50/50 text-blue-600 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={19} className={isSubActive ? 'text-blue-600' : 'text-slate-400'} />
                      {!isCollapsed && <span className="whitespace-nowrap">{item.text}</span>}
                    </div>
                    {!isCollapsed && (
                      isOpen ? (
                        <ChevronDown size={16} className="text-slate-400" />
                      ) : (
                        <ChevronRight size={16} className="text-slate-400" />
                      )
                    )}
                  </button>

                  {(!isCollapsed && isOpen) && (
                    <div className="pl-9 space-y-1">
                      {item.subItems.map((sub) => {
                        const SubIcon = sub.icon;
                        const subActive = location.pathname === sub.path;
                        return (
                          <button
                            key={sub.path}
                            onClick={() => {
                              navigate(sub.path);
                              setMobileOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                              subActive
                                ? 'bg-blue-600 text-white font-semibold shadow-xs shadow-blue-500/20'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            <SubIcon size={15} className={subActive ? 'text-white' : 'text-slate-400'} />
                            <span className="whitespace-nowrap">{sub.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active = location.pathname === item.path;
            return (
              <button
                key={item.text}
                onClick={() => {
                  if (item.path) navigate(item.path);
                  setMobileOpen(false);
                }}
                title={isCollapsed ? item.text : undefined}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'} py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
                  active
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={19} className={active ? 'text-blue-600' : 'text-slate-400'} />
                {!isCollapsed && <span className="whitespace-nowrap">{item.text}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            title={isCollapsed ? "ออกจากระบบ" : undefined}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'} py-2.5 rounded-xl font-medium text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer`}
          >
            <LogOut size={19} />
            {!isCollapsed && <span>ออกจากระบบ</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shrink-0 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
              title={isCollapsed ? "ขยาย Sidebar" : "ย่อ Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
            <h1 className="text-lg font-bold text-slate-900 hidden sm:block">
              ผู้บริหารงานขนส่ง
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-xs shrink-0">
                AD
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900">Administrator</div>
                <div className="text-[11px] text-slate-500">system@foresee.com</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
