'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type {
  AddonApp,
  AddonHandoffResponse,
  AppCatalogResponse,
} from '../../lib/addons/types';
import { CardPanel } from '../layout/CardPanel';

type LoadState = 'loading' | 'ready' | 'error';

const emptyApps: AddonApp[] = [];

const buildInitials = (name: string) => {
  const parts = name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return 'APP';
  }

  const initials = parts.map((part) => part[0]?.toUpperCase()).join('');
  return initials.slice(0, 2) || parts[0].slice(0, 2).toUpperCase();
};

const buildLaunchUrl = (launchUrl: string, token: string, returnTo: string) => {
  const url = new URL(launchUrl, window.location.origin);
  url.searchParams.set('token', token);
  url.searchParams.set('returnTo', returnTo);
  return url.toString();
};

const shouldOpenSameTab = (response: AddonHandoffResponse) => {
  if (response.integrationMode === 'embedded') {
    return true;
  }

  return response.launchUrl.startsWith('/');
};

type ToastProps = {
  message: string;
  onClose: () => void;
};

function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timeout = setTimeout(onClose, 3200);
    return () => clearTimeout(timeout);
  }, [message, onClose]);

  return (
    <div className="ff-toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}

export function ApplicationsGrid({
  items,
  onLaunch,
  launchingKey,
}: {
  items: AddonApp[];
  onLaunch: (app: AddonApp) => void;
  launchingKey?: string | null;
}) {
  return (
    <div className="ff-apps-grid" role="list">
      {items.map((app) => {
        const initials = buildInitials(app.name);
        const isLaunching = launchingKey === app.appKey;

        return (
          <button
            key={app.appKey}
            type="button"
            className="ff-app-card"
            onClick={() => onLaunch(app)}
            disabled={isLaunching}
            role="listitem"
          >
            <div className="ff-app-icon" aria-hidden="true">
              {initials}
            </div>
            <div className="ff-app-name">{app.name}</div>
            <div className="ff-app-key">{app.appKey}</div>
            <div className="ff-app-mode">
              {isLaunching ? 'Launching...' : app.integrationMode}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function ApplicationsView() {
  const router = useRouter();
  const [apps, setApps] = useState<AddonApp[]>(emptyApps);
  const [status, setStatus] = useState<LoadState>('loading');
  const [toast, setToast] = useState<string | null>(null);
  const [launchingKey, setLaunchingKey] = useState<string | null>(null);

  const hasApps = apps.length > 0;

  useEffect(() => {
    let active = true;

    const loadApps = async () => {
      try {
        const response = await fetch('/api/addons/apps', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!active) {
          return;
        }

        if (response.status === 401) {
          router.replace('/auth/login');
          return;
        }

        if (response.status === 403) {
          setToast('Access denied');
          setApps(emptyApps);
          setStatus('error');
          return;
        }

        if (!response.ok) {
          setStatus('error');
          setToast('Unable to load applications.');
          return;
        }

        const payload = (await response.json()) as AppCatalogResponse;
        setApps(payload.items ?? emptyApps);
        setStatus('ready');
      } catch {
        if (!active) {
          return;
        }
        setStatus('error');
        setToast('Unable to load applications.');
      }
    };

    loadApps();

    return () => {
      active = false;
    };
  }, [router]);

  const handleLaunch = async (app: AddonApp) => {
    setLaunchingKey(app.appKey);

    try {
      const response = await fetch('/api/addons/handoff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appKey: app.appKey,
          returnTo: `${window.location.origin}/applications`,
        }),
      });

      if (response.status === 401) {
        router.replace('/auth/login');
        return;
      }

      if (response.status === 403) {
        setToast('Access denied');
        return;
      }

      if (!response.ok) {
        setToast('Unable to launch application.');
        return;
      }

      const payload = (await response.json()) as AddonHandoffResponse;
      const launchUrl = buildLaunchUrl(
        payload.launchUrl,
        payload.token,
        `${window.location.origin}/applications`
      );

      if (shouldOpenSameTab(payload)) {
        window.location.assign(launchUrl);
      } else {
        window.open(launchUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      setToast('Unable to launch application.');
    } finally {
      setLaunchingKey(null);
    }
  };

  let body;

  if (status === 'loading') {
    body = <div className="ff-apps-loading">Loading applications...</div>;
  } else if (!hasApps) {
    body = (
      <div className="ff-empty-state">
        No applications are available for your role set.
      </div>
    );
  } else {
    body = (
      <ApplicationsGrid
        items={apps}
        onLaunch={handleLaunch}
        launchingKey={launchingKey}
      />
    );
  }

  return (
    <div className="ff-apps-shell">
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
      <CardPanel className="ff-apps-panel" variant="soft">
        {body}
      </CardPanel>
    </div>
  );
}
