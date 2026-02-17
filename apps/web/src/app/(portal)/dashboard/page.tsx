import { ROLE_KEYS, type RoleKey } from '@freeflow/rbac-config';
import { redirect } from 'next/navigation';

import { WidgetRenderer } from '../../../components/dashboard/WidgetRenderer';
import { readSession } from '../../../lib/auth/session';
import { getDashboardData } from '../../../lib/widgets/data';

export default async function DashboardPage() {
  const session = await readSession();

  if (!session) {
    redirect('/auth/login');
  }

  const roles = session.roles ?? [];
  const hasRoleAccess = roles.some((role) =>
    ROLE_KEYS.includes(role as RoleKey)
  );
  if (!hasRoleAccess) {
    redirect('/403');
  }

  const { layout, catalog, source } = await getDashboardData(
    session.accessToken
  );
  const allowedWidgets = new Set(catalog.map((item) => item.key));

  const hasWidgets = layout.sections.some((section) =>
    section.widgets.some((widget) => allowedWidgets.has(widget.widgetId))
  );

  return (
    <div className="ff-dashboard-shell">
      <section className="ff-dashboard-header">
        <div>
          <div className="ff-dashboard-title">SSA Main Dashboard</div>
          <div className="ff-dashboard-subtitle">
            Riverside Primary School • Source: {source}
          </div>
        </div>
        <div className="ff-dashboard-roles">
          {roles.length === 0 ? (
            <span className="pill">No roles assigned</span>
          ) : (
            roles.map((role) => (
              <span key={role} className="pill">
                {role}
              </span>
            ))
          )}
        </div>
      </section>

      {!hasWidgets ? (
        <div className="ff-empty-state">
          No dashboard widgets are available for your role set.
        </div>
      ) : (
        <WidgetRenderer layout={layout} allowedWidgets={allowedWidgets} />
      )}
    </div>
  );
}
