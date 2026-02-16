'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { SideNav } from '../../components/shell/SideNav';
import { TopBar } from '../../components/shell/TopBar';
import { useCurrentUser } from '../../lib/auth/useCurrentUser';

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/alarms': 'Alarms & Alerts',
  '/applications': 'Applications',
  '/inbox': 'Inbox',
  '/miniapps/forms': 'Forms',
  '/profile': 'Profile',
};

export default function PortalLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const title = titleMap[pathname] ?? 'Dashboard';
  const { user } = useCurrentUser();
  const showNav = Boolean(user);

  const toggleNav = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <div>
      <TopBar
        onMenuToggle={showNav ? toggleNav : undefined}
        title={title}
        showMenuToggle={showNav}
        showUserMenu={showNav}
      />
      <div
        className={`ff-shell ${collapsed ? 'is-collapsed' : ''} ${
          showNav ? '' : 'ff-shell--no-nav'
        }`}
      >
        {showNav ? (
          <SideNav collapsed={collapsed} onToggle={toggleNav} />
        ) : null}
        <main className={`ff-content ${showNav ? '' : 'ff-content--full'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
