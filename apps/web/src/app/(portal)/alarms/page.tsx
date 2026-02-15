import { CardPanel } from '../../../components/layout/CardPanel';
import { PageContainer } from '../../../components/layout/PageContainer';

export default function AlarmsPage() {
  return (
    <PageContainer
      title="Alarms & Alerts"
      subtitle="Track critical events across your monitored assets."
    >
      <CardPanel>
        <p style={{ color: 'var(--ff-muted)' }}>
          Alarm listing UI will be implemented in P6.1.
        </p>
      </CardPanel>
    </PageContainer>
  );
}
