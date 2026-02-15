import { CardPanel } from '../../../components/layout/CardPanel';
import { PageContainer } from '../../../components/layout/PageContainer';

export default function ApplicationsPage() {
  return (
    <PageContainer
      title="Applications"
      subtitle="Launch available add-ons and operational tools."
    >
      <CardPanel>
        <p style={{ color: 'var(--ff-muted)' }}>
          Application tiles and handoff flow will be implemented in P7.3.
        </p>
      </CardPanel>
    </PageContainer>
  );
}
