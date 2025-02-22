import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

const mockCountries = [
  { cca3: '1', name: { common: 'India' }, flags: { png: 'india-flag.png' } },
  { cca3: '2', name: { common: 'Indonesia' }, flags: { png: 'indonesia-flag.png' } },
  { cca3: '3', name: { common: 'Indiana' }, flags: { png: 'indiana-flag.png' } },
  { cca3: '4', name: { common: 'USA' }, flags: { png: 'usa-flag.png' } },
];

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockCountries),
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Test Case 1: UI Elements - should have an input field for searching
test('should have an input field for searching', () => {
  render(<App />);
  const searchInput = screen.getByPlaceholderText(/search for countries/i);
  expect(searchInput).toBeInTheDocument();
});

// Test Case 2: API Calls - should call API and handle success
test('fetches and displays countries on successful API call', async () => {
  await act(async () => {
    render(<App />);
  });

  await waitFor(() => {
    expect(screen.getByText('India')).toBeInTheDocument();
    expect(screen.getByText('Indonesia')).toBeInTheDocument();
    expect(screen.getByText('Indiana')).toBeInTheDocument();
  }, { timeout: 3000 });
});

// Test Case 3: API Error Handling - logs an error to the console on API failure
test('logs error to console on API failure', async () => {
  global.fetch = jest.fn(() =>
    Promise.reject(new Error('API failed'))
  );

  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  await act(async () => {
    render(<App />);
  });

  await waitFor(() => {
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching data: ', expect.any(Error));
  }, { timeout: 3000 });

  consoleSpy.mockRestore();
});

// Test Case 4: Display of Country Containers - should have containers with country flag and name
test('should have containers with country flag and name', async () => {
  await act(async () => {
    render(<App />);
  });

  await waitFor(() => {
    // Exact text matching with regex boundaries
    const indiaFlag = screen.getByAltText(/^Flag of India$/i);
    const indonesiaFlag = screen.getByAltText(/^Flag of Indonesia$/i);
    const indianaFlag = screen.getByAltText(/^Flag of Indiana$/i);
    const usaFlag = screen.getByAltText(/^Flag of USA$/i);

    expect(indiaFlag).toBeInTheDocument();
    expect(indonesiaFlag).toBeInTheDocument();
    expect(indianaFlag).toBeInTheDocument();
    expect(usaFlag).toBeInTheDocument();
  }, { timeout: 3000 });
});

// Test Case 5: Search Functionality - should filter countries based on search and show results accordingly
test('should filter countries based on search and show results accordingly', async () => {
  await act(async () => {
    render(<App />);
  });

  await waitFor(() => {
    expect(screen.getByText('India')).toBeInTheDocument();
  }, { timeout: 3000 });

  const searchInput = screen.getByPlaceholderText(/search for countries/i);
  await act(async () => {
    fireEvent.change(searchInput, { target: { value: 'ind' } });
  });

  await waitFor(() => {
    expect(screen.getByText('India')).toBeInTheDocument();
    expect(screen.getByText('Indonesia')).toBeInTheDocument();
    expect(screen.getByText('Indiana')).toBeInTheDocument();
    expect(screen.queryByText('USA')).not.toBeInTheDocument();
  }, { timeout: 3000 });
});

// Test Case 6: Search Functionality - should show no results when no matching countries are found
test('should show no results when no matching countries are found', async () => {
  await act(async () => {
    render(<App />);
  });

  await waitFor(() => {
    expect(screen.getByText('India')).toBeInTheDocument();
  }, { timeout: 3000 });

  const searchInput = screen.getByPlaceholderText(/search for countries/i);
  await act(async () => {
    fireEvent.change(searchInput, { target: { value: 'xyz' } });
  });

  await waitFor(() => {
    expect(screen.queryByText('India')).not.toBeInTheDocument();
    expect(screen.queryByText('Indonesia')).not.toBeInTheDocument();
    expect(screen.queryByText('Indiana')).not.toBeInTheDocument();
    expect(screen.queryByText('USA')).not.toBeInTheDocument();
  }, { timeout: 3000 });
});

// Test Case 7: Search Functionality - should show 3 containers when searching for "ind"
test('filters and displays 3 countries when searching for "ind"', async () => {
  await act(async () => {
    render(<App />);
  });

  await waitFor(() => {
    expect(screen.getByText('India')).toBeInTheDocument();
  }, { timeout: 3000 });

  const searchInput = screen.getByPlaceholderText(/search for countries/i);
  await act(async () => {
    fireEvent.change(searchInput, { target: { value: 'ind' } });
  });

  await waitFor(() => {
    const countryCards = screen.getAllByTestId('country-card');
    expect(countryCards.length).toBe(3);
  }, { timeout: 3000 });
});