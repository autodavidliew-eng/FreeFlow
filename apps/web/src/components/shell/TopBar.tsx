'use client';

import { IconButton } from '../layout/IconButton';

import { QuickIcons } from './QuickIcons';
import { UserMenu } from './UserMenu';

export type TopBarProps = {
  onMenuToggle?: () => void;
  title?: string;
  showMenuToggle?: boolean;
  showUserMenu?: boolean;
};

export function TopBar({
  onMenuToggle,
  title = 'Dashboard',
  showMenuToggle = true,
  showUserMenu = true,
}: TopBarProps) {
  return (
    <header className="ff-topbar">
      <div className="ff-topbar__left">
        {showMenuToggle ? (
          <IconButton
            onClick={onMenuToggle}
            aria-label="Toggle navigation"
            data-testid="topbar-menu"
          >
            <span className="ff-icon">☰</span>
          </IconButton>
        ) : null}
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
      {showUserMenu ? (
        <div className="ff-topbar__right">
          <QuickIcons />
          <UserMenu />
        </div>
      ) : null}
    </header>
  );
}
