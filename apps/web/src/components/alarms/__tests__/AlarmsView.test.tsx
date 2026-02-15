import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { AlarmRecord } from '../../../lib/alarms/types';
import { AlarmsView } from '../AlarmsView';

const alarms: AlarmRecord[] = [
  {
    id: 'a1',
    site: 'Riverside Primary School',
    device: 'Pump 1',
    category: 'Water',
    severity: 'High',
    description: 'Leak detected',
    timestamp: '2026-02-15 09:00 AM',
    status: 'Open',
  },
  {
    id: 'a2',
    site: 'Hillcrest Campus',
    device: 'Generator A',
    category: 'Electrical',
    severity: 'Low',
    description: 'Voltage dip',
    timestamp: '2026-02-15 10:00 AM',
    status: 'Resolved',
  },
  {
    id: 'a3',
    site: 'Lakeside Annex',
    device: 'HVAC Unit 2',
    category: 'HVAC',
    severity: 'Medium',
    description: 'Temperature variance',
    timestamp: '2026-02-15 11:00 AM',
    status: 'Acknowledged',
  },
];

describe('AlarmsView', () => {
  it('filters alarms by severity', async () => {
    const user = userEvent.setup();
    render(<AlarmsView alarms={alarms} />);

    expect(screen.getByText('Riverside Primary School')).toBeInTheDocument();
    expect(screen.getByText('Hillcrest Campus')).toBeInTheDocument();
    expect(screen.getByText('Lakeside Annex')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'High' }));

    expect(screen.getByText('Riverside Primary School')).toBeInTheDocument();
    expect(screen.queryByText('Hillcrest Campus')).not.toBeInTheDocument();
    expect(screen.queryByText('Lakeside Annex')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByText('Hillcrest Campus')).toBeInTheDocument();
    expect(screen.getByText('Lakeside Annex')).toBeInTheDocument();
  });
});
