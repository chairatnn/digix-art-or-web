'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearSession } from './lib/session';
import {
  LayoutDashboard,
  CalendarPlus,
  Users,
  DoorOpen,
  BedDouble,
  User,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Stethoscope // ไอคอนสำหรับโลโก้ระบบการแพทย์
} from 'lucide-react';

const AUTH_ROUTES = new Set(['/login', '/register']);

// 🏥 ปรับเมนูเข้าสู่ระบบจองห้องผ่าตัดและเตียงตามความต้องการ
const menuItems = [
  { label: 'OR Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'จัดการคิวผ่าตัด', href: '/or-bookings', icon: CalendarPlus },
  { label: 'บุคลากร & แพทย์', href: '/users', icon: Users, adminOnly: true },
  { label: 'จัดการห้องผ่าตัด', href: '/rooms', icon: DoorOpen, adminOnly: true },
  { label: 'จัดการเตียงพักฟื้น', href: '/beds', icon: BedDouble, adminOnly: true },
  { label: 'โปรไฟล์ของฉัน', href: '/me', icon: User },
  { label: 'รายงานสถานะระบบ', href: '/health', icon: Activity },
  { label: 'ตั้งค่าและข้อมูลระบบ', href: '/settings', icon: Settings },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [roleLabel, setRoleLabel] = useState('');
  const isAuthRoute = AUTH_ROUTES.has(pathname);

  useEffect(() => {
    async function syncProfile() {
      const storedName = window.localStorage.getItem('memberName');
      const storedRole = window.localStorage.getItem('memberRole');
      const token = window.localStorage.getItem('accessToken');

      if (storedName) setDisplayName(storedName);
      if (storedRole) setRoleLabel(storedRole);

      if (!token) return;

      try {
        const resp = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        const json = await resp.json();

        if (!resp.ok) return;

        const user = json?.user || json?.data || json;
        const nextName = user?.name || user?.email || storedName || '';
        const nextRole = user?.role || storedRole || 'User';

        if (nextName) {
          setDisplayName(nextName);
          window.localStorage.setItem('memberName', nextName);
        }

        if (nextRole) {
          setRoleLabel(nextRole);
          window.localStorage.setItem('memberRole', nextRole);
        }
      } catch {
        // Keep last known user info if sync fails
      }
    }

    syncProfile();
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isAuthRoute) return children;

  function isActive(href) {
    return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleLogout() {
    clearSession();
    window.location.href = '/login';
  }

  const nameForAvatar = displayName.trim();
  const avatarLabel = nameForAvatar
    ? nameForAvatar.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('')
    : 'U';

  return (
    <div className="flex min-h-screen overflow-hidden bg-transparent text-slate-900">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200/70 bg-white/90 backdrop-blur-xl transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 🏢 เปลี่ยน Header โลโก้แบรนด์ด้านบน */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200/70 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-[#8D746A] text-white shadow-lg shadow-blue-200">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[16px] font-extrabold tracking-tight text-slate-900">The Art OR System</span>
            <span className="block text-[12px] font-semibold text-slate-500">Operating room portal</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            // 🔒 ซ่อนเมนูระบบ CRUD จัดการระบบพื้นฐานสำหรับผู้ใช้ทั่วไป (เช่น หมอ/พยาบาล) ให้เฉพาะ Admin เห็น
            if (item.adminOnly && roleLabel !== 'Admin') return null;

            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? 'flex items-center gap-3 rounded-2xl bg-[#8D746A] px-3.5 py-2.75 text-sm !font-bold !text-white shadow-lg shadow-blue-200'
                    : 'flex items-center gap-3 rounded-2xl px-3.5 py-2.75 text-sm font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700'
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-xl lg:px-6">
          <button
            type="button"
            className="rounded-2xl p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700 lg:hidden"
            onClick={() => setSidebarOpen(open => !open)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">{displayName || 'User'}</p>
              <p className="text-xs font-medium text-slate-500">{roleLabel || 'User'}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8D746A] text-sm font-bold text-white shadow-lg shadow-blue-200">
              {avatarLabel}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="ml-1 rounded-2xl p-2 text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}