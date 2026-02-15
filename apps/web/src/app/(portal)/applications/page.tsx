import { redirect } from 'next/navigation';

import { ApplicationsView } from '../../../components/applications/ApplicationsView';
import { PageContainer } from '../../../components/layout/PageContainer';
import { readSession } from '../../../lib/auth/session';

export default async function ApplicationsPage() {
  const session = await readSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <PageContainer
      title="Applications"
      subtitle="Launch role-based add-ons and operational tools."
    >
      <ApplicationsView />
    </PageContainer>
  );
}
