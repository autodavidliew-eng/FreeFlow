'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { IconButton } from '../layout/IconButton';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Alarm / Alert', href: '/alarms' },
  { label: 'Applications', href: '/applications' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Electric Meter', href: '/electric-meter' },
  { label: 'Equipment Management', href: '/equipment' },
  { label: 'Operation Scheduler', href: '/scheduler' },
  { label: 'Report', href: '/report' },
  { label: 'Rule Engine', href: '/rules' },
  { label: 'Scene Management', href: '/scenes' },
  { label: 'Vendor', href: '/vendor' },
  { label: 'Water Meter', href: '/water-meter' },
];

export type SideNavProps = {
  collapsed: boolean;
  onToggle?: () => void;
};

export function SideNav({ collapsed, onToggle }: SideNavProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`ff-sidenav ${collapsed ? 'is-collapsed' : ''}`}
      data-testid="side-nav"
    >
      <div className="ff-sidenav__header">
        <div className="ff-sidenav__title">MOE</div>
        <IconButton
          active={collapsed}
          aria-label="Collapse navigation"
          onClick={onToggle}
          data-testid="side-nav-toggle"
        >
          <span className="ff-icon">⇤</span>
        </IconButton>
      </div>
      <nav className="ff-sidenav__nav">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`ff-sidenav__link ${active ? 'is-active' : ''}`}
            >
              <span className="ff-sidenav__dot" />
              <span className="ff-sidenav__label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
