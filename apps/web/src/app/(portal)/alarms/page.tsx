import { AlarmsView } from '../../../components/alarms/AlarmsView';
import { PageContainer } from '../../../components/layout/PageContainer';
import { getAlarms } from '../../../lib/alarms/client';

export default async function AlarmsPage() {
  const alarms = await getAlarms();

  return (
    <PageContainer
      title="Alarms & Alerts"
      subtitle="Monitor alarms, acknowledge issues, and track resolution status."
    >
      <AlarmsView alarms={alarms} />
    </PageContainer>
  );
}
