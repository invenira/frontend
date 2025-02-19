import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DOMPurify from 'dompurify';
import { CustomIFrame } from './CustomIFrame';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('CustomIFrame', () => {
  // Reset mocks after each test.
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should display an error message if url is invalid', async () => {
    render(<CustomIFrame url="" />);
    await waitFor(() => {
      expect(screen.getByText('Invalid URL')).toBeInTheDocument();
    });
  });

  it('should render sanitized HTML when fetch is successful', async () => {
    const fakeHtml = '<p>Test Content</p>';
    // Spy on DOMPurify.sanitize to verify it is being called.
    const sanitizeSpy = vi
      .spyOn(DOMPurify, 'sanitize')
      .mockImplementation((input) => input as any as string);

    // Mock fetch to return a successful response.
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(fakeHtml),
    } as Response);

    render(<CustomIFrame url="https://example.com" />);

    // Wait for the content to appear.
    await waitFor(() => {
      const contentDiv = document.querySelector('.content');
      expect(contentDiv).toBeInTheDocument();
      expect(contentDiv?.innerHTML).toBe(fakeHtml);
    });

    // Verify that the sanitizer was called with the fetched HTML.
    expect(sanitizeSpy).toHaveBeenCalledWith(fakeHtml);
  });

  it('should display an error message if fetch returns a non-ok response', async () => {
    // Mock fetch to return a response with ok: false.
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    } as Response);

    render(<CustomIFrame url="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText('Not Found')).toBeInTheDocument();
    });
  });

  it('should display an error message if fetch fails', async () => {
    const errorMessage = 'Network Error';
    // Mock fetch to reject.
    global.fetch = vi.fn().mockRejectedValue(new Error(errorMessage));

    render(<CustomIFrame url="https://example.com" />);
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
