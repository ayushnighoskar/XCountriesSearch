import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios');

const mockCountries = [
  { name: { common: 'India' }, flags: { png: 'https://flagcdn.com/in.png' } },
  { name: { common: 'Indonesia' }, flags: { png: 'https://flagcdn.com/id.png' } },
  { name: { common: 'Indiana' }, flags: { png: 'https://flagcdn.com/us-in.png' } },
];

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

test('Country App Tests - API Calls - should call API and handle success', async () => {
  axios.get.mockResolvedValueOnce({ data: mockCountries });
  render(<App />);
  await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
  expect(axios.get).toHaveBeenCalledWith('https://restcountries.com/v3.1/all');
});

test('Country App Tests - API Error Handling - logs an error to the console on API failure', async () => {
  axios.get.mockRejectedValueOnce(new Error('API Error'));
  console.error = jest.fn();
  render(<App />);
  await waitFor(() => expect(console.error).toHaveBeenCalledWith('API Error:', 'API Error'));
});

test('Country App Tests - Display of Country Containers - should have containers with country flag and name', async () => {
  axios.get.mockResolvedValueOnce({ data: mockCountries });
  render(<App />);
  await waitFor(() => {
    mockCountries.forEach(country => {
      expect(screen.getByText(country.name.common)).toBeInTheDocument();
      expect(screen.getByAltText(`Flag of ${country.name.common}`)).toBeInTheDocument();
    });
  });
});

test('Country App Tests - Search Functionality - should filter countries based on search and show results accordingly', async () => {
  axios.get.mockResolvedValueOnce({ data: mockCountries });
  render(<App />);
  await waitFor(() => {
    const input = screen.getByPlaceholderText('Search for a Country...');
    expect(input).toBeInTheDocument();
  });
  const input = screen.getByPlaceholderText('Search for a Country...');
  input.value = 'Ind';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await waitFor(() => {
    expect(screen.getByText('India')).toBeInTheDocument();
    expect(screen.getByText('Indonesia')).toBeInTheDocument();
    expect(screen.getByText('Indiana')).toBeInTheDocument();
  });
});

test('Country App Tests - Search Functionality - should show 3 containers when searching for "ind"', async () => {
  axios.get.mockResolvedValueOnce({ data: mockCountries });
  render(<App />);
  await waitFor(() => {
    const input = screen.getByPlaceholderText('Search for a Country...');
    expect(input).toBeInTheDocument();
  });
  const input = screen.getByPlaceholderText('Search for a Country...');
  input.value = 'ind';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await waitFor(() => {
    const countryCards = screen.getAllByRole('img');
    expect(countryCards.length).toBe(3);
  });
});