'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { SideNav } from '../../components/shell/SideNav';
import { TopBar } from '../../components/shell/TopBar';

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/alarms': 'Alarms & Alerts',
  '/applications': 'Applications',
  '/inbox': 'Inbox',
  '/profile': 'Profile',
};

export default function PortalLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const title = titleMap[pathname] ?? 'Dashboard';

  const toggleNav = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <div>
      <TopBar onMenuToggle={toggleNav} title={title} />
      <div className={`ff-shell ${collapsed ? 'is-collapsed' : ''}`}>
        <SideNav collapsed={collapsed} onToggle={toggleNav} />
        <main className="ff-content">{children}</main>
      </div>
    </div>
  );
}
