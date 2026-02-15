'use client';

import { useMemo, useState } from 'react';

import { useCurrentUser } from '../../lib/auth/useCurrentUser';

const buildInitials = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'GF';
  }

  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
};

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const { user } = useCurrentUser();
  const displayName =
    user?.preferredUsername ?? user?.name ?? user?.email ?? 'Guest';
  const initials = useMemo(() => buildInitials(displayName), [displayName]);

  return (
    <div className="ff-user-menu">
      <button
        type="button"
        className="ff-user-chip"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="ff-user-avatar">{initials}</span>
        <span className="ff-user-name">{displayName}</span>
      </button>
      {open ? (
        <div className="ff-user-menu__dropdown">
          <a className="ff-user-menu__item" href="/profile">
            Account
          </a>
          <a className="ff-user-menu__item" href="/auth/logout">
            Logout
          </a>
        </div>
      ) : null}
    </div>
  );
}
