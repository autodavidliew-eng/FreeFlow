import { render, screen } from '@testing-library/react';

import { FormsMiniApp } from '../FormsMiniApp';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@formio/react', () => ({
  Form: ({ form }: { form: { title?: string } }) => (
    <div>Formio: {form?.title}</div>
  ),
}));

describe('FormsMiniApp', () => {
  const originalFetch = global.fetch;
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('renders a schema title from the api', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        title: 'Inspection Form',
      }),
    });

    render(<FormsMiniApp formId="inspection" />);

    expect(await screen.findByText(/inspection form/i)).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/forms/inspection/schema',
      expect.objectContaining({ method: 'GET' })
    );
  });
});
