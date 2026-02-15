import { render, screen } from '@testing-library/react';

import { ApplicationsView } from '../applications/ApplicationsView';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

describe('ApplicationsView', () => {
  const originalFetch = global.fetch;
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('renders tiles from api response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          {
            appKey: 'report',
            name: 'Report',
            icon: 'file-text',
            launchUrl: '/apps/report',
            integrationMode: 'embedded',
            enabled: true,
          },
          {
            appKey: 'rule-engine',
            name: 'Rule Engine',
            icon: 'sliders',
            launchUrl: '/apps/rule-engine',
            integrationMode: 'embedded',
            enabled: true,
          },
        ],
        total: 2,
      }),
    });

    render(<ApplicationsView />);

    expect(await screen.findByText('Report')).toBeInTheDocument();
    expect(screen.getByText('report')).toBeInTheDocument();
    expect(screen.getByText('Rule Engine')).toBeInTheDocument();

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/addons/apps',
      expect.objectContaining({ method: 'GET' })
    );
  });
});
