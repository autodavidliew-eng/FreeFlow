'use client';

import { useEffect, useMemo, useState } from 'react';

import { CardPanel } from '../../../../components/layout/CardPanel';

const emptyList: string[] = [];

type AccessCatalogItem = {
  key?: string;
  appKey?: string;
  name: string;
  type?: string;
  enabled?: boolean;
};

type AccessAssignment = {
  widgets: string[];
  apps: string[];
};

type AccessSnapshot = {
  roles: string[];
  widgets: AccessCatalogItem[];
  apps: AccessCatalogItem[];
  assignments: Record<string, AccessAssignment>;
};

type LoadState = 'loading' | 'ready' | 'error' | 'forbidden';

type ToggleListProps = {
  title: string;
  items: AccessCatalogItem[];
  selected: Set<string>;
  onToggle: (key: string) => void;
  getKey: (item: AccessCatalogItem) => string;
};

function ToggleList({
  title,
  items,
  selected,
  onToggle,
  getKey,
}: ToggleListProps) {
  return (
    <div className="ff-access-list">
      <div className="ff-access-list__title">{title}</div>
      <div className="ff-access-list__items">
        {items.map((item) => {
          const key = getKey(item);
          const isChecked = selected.has(key);
          return (
            <label key={key} className="ff-access-item">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggle(key)}
              />
              <span className="ff-access-item__name">{item.name}</span>
              <span className="ff-access-item__key">{key}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function AccessControlPage() {
  const [snapshot, setSnapshot] = useState<AccessSnapshot | null>(null);
  const [status, setStatus] = useState<LoadState>('loading');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedWidgets, setSelectedWidgets] = useState<Set<string>>(
    new Set()
  );
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch('/api/access-control/roles', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!active) {
          return;
        }

        if (response.status === 401) {
          setStatus('error');
          return;
        }

        if (response.status === 403) {
          setStatus('forbidden');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed');
        }

        const payload = (await response.json()) as AccessSnapshot;
        setSnapshot(payload);
        setSelectedRole(payload.roles[0] ?? null);
        setStatus('ready');
      } catch {
        if (!active) {
          return;
        }
        setStatus('error');
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!snapshot || !selectedRole) {
      return;
    }

    const assignment = snapshot.assignments[selectedRole] ?? {
      widgets: emptyList,
      apps: emptyList,
    };

    setSelectedWidgets(new Set(assignment.widgets));
    setSelectedApps(new Set(assignment.apps));
  }, [snapshot, selectedRole]);

  const roleOptions = snapshot?.roles ?? emptyList;

  const widgetItems = useMemo(() => snapshot?.widgets ?? [], [snapshot]);
  const appItems = useMemo(() => snapshot?.apps ?? [], [snapshot]);

  const toggleWidget = (key: string) => {
    setSelectedWidgets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleApp = (key: string) => {
    setSelectedApps((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedRole) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `/api/access-control/roles/${selectedRole}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            widgets: Array.from(selectedWidgets),
            apps: Array.from(selectedApps),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Unable to save');
      }

      const payload = (await response.json()) as {
        role: string;
        assignment: AccessAssignment;
      };

      setSnapshot((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          assignments: {
            ...prev.assignments,
            [payload.role]: payload.assignment,
          },
        };
      });

      setToast('Access updated');
    } catch {
      setToast('Unable to update access');
    } finally {
      setSaving(false);
    }
  };

  let content = null;

  if (status === 'loading') {
    content = <div className="ff-access-loading">Loading access control…</div>;
  } else if (status === 'forbidden') {
    content = (
      <div className="ff-empty-state">
        You do not have permission to manage role access.
      </div>
    );
  } else if (status === 'error' || !snapshot) {
    content = (
      <div className="ff-empty-state">
        Unable to load access control configuration.
      </div>
    );
  } else {
    content = (
      <div className="ff-access-shell">
        <div className="ff-access-roles">
          {roleOptions.map((role) => (
            <button
              key={role}
              type="button"
              className={`ff-access-role ${
                selectedRole === role ? 'is-active' : ''
              }`}
              onClick={() => setSelectedRole(role)}
            >
              {role}
            </button>
          ))}
        </div>
        <div className="ff-access-grid">
          <ToggleList
            title="Dashboard Widgets"
            items={widgetItems}
            selected={selectedWidgets}
            onToggle={toggleWidget}
            getKey={(item) => item.key ?? ''}
          />
          <ToggleList
            title="Applications"
            items={appItems}
            selected={selectedApps}
            onToggle={toggleApp}
            getKey={(item) => item.appKey ?? ''}
          />
        </div>
        <div className="ff-access-actions">
          <button
            type="button"
            className="ff-button ff-button--primary"
            onClick={handleSave}
            disabled={saving || !selectedRole}
          >
            {saving ? 'Saving…' : 'Save Access'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ff-access-page">
      {toast ? <div className="ff-toast">{toast}</div> : null}
      <CardPanel className="ff-access-panel" variant="soft">
        {content}
      </CardPanel>
    </div>
  );
}
