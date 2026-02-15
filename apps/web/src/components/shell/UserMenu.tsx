'use client';

import { useState } from 'react';

export function UserMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="ff-user-menu">
      <button
        type="button"
        className="ff-user-chip"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="ff-user-avatar">HL</span>
        <span className="ff-user-name">HPLIEW</span>
      </button>
      {open ? (
        <div className="ff-user-menu__dropdown">
          <button type="button" className="ff-user-menu__item">
            Account
          </button>
          <button type="button" className="ff-user-menu__item">
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
