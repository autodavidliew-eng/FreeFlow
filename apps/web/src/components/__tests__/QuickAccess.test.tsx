import { render, screen } from '@testing-library/react';
import { QuickAccess } from '../QuickAccess';

describe('QuickAccess', () => {
  it('renders all quick access items', () => {
    render(<QuickAccess />);

    expect(screen.getByText('Quick Access')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Mini Apps')).toBeInTheDocument();
    expect(screen.getByText('Task Inbox')).toBeInTheDocument();
    expect(screen.getByText('Alarms')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
});
