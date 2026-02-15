import { CardPanel } from '../../../components/layout/CardPanel';
import { PageContainer } from '../../../components/layout/PageContainer';

export default function InboxPage() {
  return (
    <PageContainer title="Inbox" subtitle="Review tasks and notifications.">
      <CardPanel>
        <p style={{ color: 'var(--ff-muted)' }}>
          Inbox module placeholder. Task stream comes later.
        </p>
      </CardPanel>
    </PageContainer>
  );
}
