'use client';

import { useState } from 'react';

import { CardPanel } from '../layout/CardPanel';

export type ProfileTabsProps = {
  name?: string;
  email?: string;
  roles: string[];
  tenant?: string;
  expiresAt?: string;
};

type TabKey = 'information' | 'security';

const formatFallback = (value?: string) => value ?? 'Not available';

export function ProfileTabs({
  name,
  email,
  roles,
  tenant,
  expiresAt,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('information');

  return (
    <div className="ff-profile">
      <div className="ff-profile-tabs" role="tablist" aria-label="Profile">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'information'}
          className={`ff-profile-tab ${
            activeTab === 'information' ? 'is-active' : ''
          }`}
          onClick={() => setActiveTab('information')}
        >
          Information
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'security'}
          className={`ff-profile-tab ${
            activeTab === 'security' ? 'is-active' : ''
          }`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      {activeTab === 'information' ? (
        <CardPanel className="ff-profile-panel" variant="soft">
          <div
            role="tabpanel"
            aria-label="Information"
            className="ff-profile-grid"
          >
            <div className="ff-profile-field">
              <div className="ff-profile-label">Name</div>
              <div className="ff-profile-value">{formatFallback(name)}</div>
            </div>
            <div className="ff-profile-field">
              <div className="ff-profile-label">Email</div>
              <div className="ff-profile-value">{formatFallback(email)}</div>
            </div>
            <div className="ff-profile-field">
              <div className="ff-profile-label">Tenant</div>
              <div className="ff-profile-value">{formatFallback(tenant)}</div>
            </div>
            <div className="ff-profile-field">
              <div className="ff-profile-label">Roles</div>
              {roles.length === 0 ? (
                <div className="ff-profile-value">No roles assigned</div>
              ) : (
                <div className="ff-profile-role-list">
                  {roles.map((role) => (
                    <span key={role} className="pill">
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardPanel>
      ) : (
        <CardPanel className="ff-profile-panel" variant="soft">
          <div
            role="tabpanel"
            aria-label="Security"
            className="ff-profile-grid"
          >
            <div className="ff-profile-field">
              <div className="ff-profile-label">Session Expiration</div>
              <div className="ff-profile-value">
                {formatFallback(expiresAt)}
              </div>
            </div>
            <div className="ff-profile-field">
              <div className="ff-profile-label">Sign-in Provider</div>
              <div className="ff-profile-value">Keycloak OIDC</div>
            </div>
          </div>
        </CardPanel>
      )}
    </div>
  );
}
