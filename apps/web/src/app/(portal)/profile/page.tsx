import { CardPanel } from '../../../components/layout/CardPanel';
import { PageContainer } from '../../../components/layout/PageContainer';

export default function ProfilePage() {
  return (
    <PageContainer title="Account Details" subtitle="Manage your profile.">
      <CardPanel>
        <p style={{ color: 'var(--ff-muted)' }}>
          Profile layout will be implemented in P8.1.
        </p>
      </CardPanel>
    </PageContainer>
  );
}
