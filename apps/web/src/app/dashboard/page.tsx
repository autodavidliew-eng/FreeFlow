import { redirect } from 'next/navigation';
import { readSession } from '../../lib/auth/session';
import { getAllowedWidgetsForRoles, hasKnownRole } from '../../lib/rbac';
import { WidgetRenderer } from '../../components/dashboard/WidgetRenderer';
import { getDashboardLayout } from '../../lib/widgets/schema';

export default async function DashboardPage() {
  const session = readSession();

  if (!session) {
    redirect('/auth/login');
  }

  const roles = session.roles ?? [];
  const hasRoleAccess = await hasKnownRole(roles);
  if (!hasRoleAccess) {
    redirect('/403');
  }

  const allowedWidgets = await getAllowedWidgetsForRoles(roles);
  const layout = await getDashboardLayout();
  const visibleWidgetCount = layout.sections.reduce((count, section) => {
    const visible = section.widgets.filter((widget) =>
      allowedWidgets.has(widget.widgetId),
    );
    return count + visible.length;
  }, 0);
  const hasWidgets = visibleWidgetCount > 0;

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <section
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>
            Operations Dashboard
          </h1>
          <p style={{ color: 'var(--muted)' }}>
            Role-gated widgets based on your access profile.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
        <div
          className="plane-card"
          style={{ textAlign: 'center', color: 'var(--muted)' }}
        >
          No dashboard widgets are available for your role set.
        </div>
      ) : (
        <WidgetRenderer layout={layout} allowedWidgets={allowedWidgets} />
      )}
    </div>
  );
}
