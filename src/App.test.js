import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

const mockCountries = [
  { cca3: '1', name: { common: 'India' }, flags: { png: 'india-flag.png' } },
  { cca3: '2', name: { common: 'Indonesia' }, flags: { png: 'indonesia-flag.png' } },
  { cca3: '3', name: { common: 'Indiana' }, flags: { png: 'indiana-flag.png' } },
  { cca3: '4', name: { common: 'USA' }, flags: { png: 'usa-flag.png' } },
];

beforeEach(() => {
  // Mock the fetch API
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true, // Ensure the response is "ok"
      json: () => Promise.resolve(mockCountries),
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('fetches and displays countries on successful API call', async () => {
  render(<App />);

  // Wait for the API call to resolve and data to be rendered
  await waitFor(() => {
    expect(screen.getByText('India')).toBeInTheDocument();
    expect(screen.getByText('Indonesia')).toBeInTheDocument();
    expect(screen.getByText('Indiana')).toBeInTheDocument();
  });
});

test('logs error to console on API failure', async () => {
  // Mock a failed API call
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: false, // Simulate a failed response
      statusText: 'Network response was not ok',
    })
  );

  // Spy on console.error to verify the error is logged
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  render(<App />);

  // Wait for the API call to fail
  await waitFor(() => {
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching data: ', expect.any(Error));
  });

  // Restore console.error
  consoleSpy.mockRestore();
});

test('filters and displays 3 countries when searching for "ind"', async () => {
  render(<App />);

  // Wait for the API call to resolve and data to be rendered
  await waitFor(() => {
    expect(screen.getByText('India')).toBeInTheDocument();
    expect(screen.getByText('Indonesia')).toBeInTheDocument();
    expect(screen.getByText('Indiana')).toBeInTheDocument();
  });

  // Simulate user typing "ind" in the search box
  const searchInput = screen.getByPlaceholderText(/search for countries/i);
  fireEvent.change(searchInput, { target: { value: 'ind' } });

  // Verify that only 3 countries are displayed
  await waitFor(() => {
    expect(screen.getByText('India')).toBeInTheDocument();
    expect(screen.getByText('Indonesia')).toBeInTheDocument();
    expect(screen.getByText('Indiana')).toBeInTheDocument();
    expect(screen.queryByText('USA')).not.toBeInTheDocument(); // Ensure non-matching countries are hidden
  });
});