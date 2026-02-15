'use client';

import { IconButton } from '../layout/IconButton';

import { QuickIcons } from './QuickIcons';
import { UserMenu } from './UserMenu';

export type TopBarProps = {
  onMenuToggle?: () => void;
  title?: string;
};

export function TopBar({ onMenuToggle, title = 'Dashboard' }: TopBarProps) {
  return (
    <header className="ff-topbar">
      <div className="ff-topbar__left">
        <IconButton
          onClick={onMenuToggle}
          aria-label="Toggle navigation"
          data-testid="topbar-menu"
        >
          <span className="ff-icon">☰</span>
        </IconButton>
        <div className="ff-brand">
          <div className="ff-brand__badge">SSA</div>
          <div>
            <div className="ff-brand__name">FreeFlow</div>
            <div className="ff-brand__meta">Smart Space Application</div>
          </div>
        </div>
      </div>
      <div className="ff-topbar__center">
        <span className="ff-page-chip">{title}</span>
      </div>
      <div className="ff-topbar__right">
        <QuickIcons />
        <UserMenu />
      </div>
    </header>
  );
}
