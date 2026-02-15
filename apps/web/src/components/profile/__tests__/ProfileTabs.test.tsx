import { fireEvent, render, screen } from '@testing-library/react';

import { ProfileTabs } from '../ProfileTabs';

describe('ProfileTabs', () => {
  it('switches between information and security tabs', () => {
    render(
      <ProfileTabs
        name="Ada Lovelace"
        email="ada@example.com"
        roles={['Admin']}
        tenant="freeflow-tenant"
        expiresAt="2026-02-15T12:00:00.000Z"
      />
    );

    const infoTab = screen.getByRole('tab', { name: /information/i });
    const securityTab = screen.getByRole('tab', { name: /security/i });

    expect(infoTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();

    fireEvent.click(securityTab);

    expect(securityTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Session Expiration')).toBeInTheDocument();
  });
});
