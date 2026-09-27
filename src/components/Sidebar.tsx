import {
  LayoutDashboard,
  Camera,
  Calendar,
  Frame,
  Users,
  UserCog,
  Receipt,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { StudioLogo } from '@/components/Avatar';
import { useTheme } from '@/lib/theme';
import type { Settings } from '@/lib/types';

export type PageKey =
  | 'dashboard'
  | 'studio'
  | 'events'
  | 'frames'
  | 'customers'
  | 'staff'
  | 'expenses'
  | 'reports'
  | 'settings';

interface NavItem {
  key: PageKey;
  label: string;
  icon: typeof LayoutDashboard;
}

const mainNav: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'studio', label: 'Studio', icon: Camera },
  { key: 'events', label: 'Events', icon: Calendar },
  { key: 'frames', label: 'Frames & Lamination', icon: Frame },
  { key: 'customers', label: 'Customers', icon: Users },
];

const managementNav: NavItem[] = [
  { key: 'staff', label: 'Staff', icon: UserCog },
  { key: 'expenses', label: 'Expenses', icon: Receipt },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
];

const systemNav: NavItem[] = [
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
];

interface SidebarProps {
  current: PageKey;
  onNavigate: (page: PageKey) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ current, onNavigate, mobileOpen, onCloseMobile }: SidebarProps) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    supabase.from('settings').select('*').limit(1).maybeSingle().then(({ data }) => {
      setSettings(data as Settings | null);
    });
  }, []);

  const handleNav = (key: PageKey) => {
    onNavigate(key);
    onCloseMobile();
  };

  const renderSection = (title: string, items: NavItem[]) => (
    <div className="mb-6">
      <p className="px-3 text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--sidebar-text)' }}>
        {title}
      </p>
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleNav(item.key)}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-brand text-white shadow-lg shadow-brand-500/20'
                  : 'hover:bg-white/8 hover:text-white'
              }`}
              style={!isActive ? { color: 'var(--sidebar-text)' } : undefined}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-brand-300" />
              )}
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-white' : 'group-hover:scale-110 group-hover:text-brand-300'}`}
                style={!isActive ? { color: 'var(--sidebar-text)' } : undefined}
              />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 flex flex-col z-40 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ background: 'var(--sidebar-bg)' }}
      >
        {/* Logo header */}
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <StudioLogo src={settings?.logo_url || null} size="md" />
              <div>
                <h1 className="font-serif text-xl font-bold text-white leading-none tracking-wide">
                  LAKSHMI
                </h1>
                <h2 className="font-serif text-xl font-bold text-brand-300 leading-none tracking-wide mt-0.5">
                  STUDIO
                </h2>
                <p className="text-[11px] mt-1.5 tracking-widest uppercase" style={{ color: 'var(--sidebar-text)' }}>
                  {settings?.tagline || 'since 1999'}
                </p>
              </div>
            </div>
            <button
              onClick={onCloseMobile}
              className="lg:hidden transition-colors hover:text-white"
              style={{ color: 'var(--sidebar-text)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nav sections */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          {renderSection('Main', mainNav)}
          {renderSection('Management', managementNav)}
          {renderSection('System', systemNav)}
        </div>

        {/* Footer: theme toggle + user */}
        <div className="px-3 py-4 space-y-2" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          <button
            onClick={toggle}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full hover:bg-white/8 hover:text-white"
            style={{ color: 'var(--sidebar-text)' }}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-5 h-5" />
                Dark Mode
              </>
            ) : (
              <>
                <Sun className="w-5 h-5" />
                Light Mode
              </>
            )}
          </button>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg backdrop-blur-sm" style={{ background: 'var(--sidebar-hover)' }}>
            <div className="w-9 h-9 rounded-full bg-gradient-brand text-white flex items-center justify-center font-semibold text-sm shadow-md">
              OA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Owner / Admin</p>
              <p className="text-[11px]" style={{ color: 'var(--sidebar-text)' }}>LAKSHMI STUDIO</p>
            </div>
          </div>
          <button
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full hover:bg-white/8 hover:text-white"
            style={{ color: 'var(--sidebar-text)' }}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
