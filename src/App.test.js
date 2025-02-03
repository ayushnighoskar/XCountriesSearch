import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios');

const mockCountries = [
  { name: { common: 'India' }, flags: { png: 'https://flagcdn.com/in.png' } },
  { name: { common: 'Indonesia' }, flags: { png: 'https://flagcdn.com/id.png' } },
  { name: { common: 'Indiana' }, flags: { png: 'https://flagcdn.com/us-in.png' } },
];

describe('Country App Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
  });

  test('API Calls - should call API and handle success', async () => {
    axios.get.mockResolvedValueOnce({ data: mockCountries });
    render(<App />);

    // Wait for the API call to complete
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    expect(axios.get).toHaveBeenCalledWith('https://restcountries.com/v3.1/all');

    // Check if the countries are rendered
    await waitFor(() => {
      mockCountries.forEach(country => {
        expect(screen.getByText(country.name.common)).toBeInTheDocument();
      });
    });
  });

  test('API Error Handling - logs an error to the console on API failure', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));
    console.error = jest.fn(); // Mock console.error
    render(<App />);

    // Wait for the API call to fail
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    expect(axios.get).toHaveBeenCalledWith('https://restcountries.com/v3.1/all');

    // Check if the error is logged to the console
    await waitFor(() => expect(console.error).toHaveBeenCalledWith('API Error:', 'API Error'));

    // Check if the error message is displayed in the UI
    expect(await screen.findByText('Error fetching countries')).toBeInTheDocument();
  });

  test('Search Functionality - should show 3 containers when searching for "ind"', async () => {
    axios.get.mockResolvedValueOnce({ data: mockCountries });
    render(<App />);

    // Wait for the API call to complete
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    // Simulate user typing "ind" in the search input
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'ind' } });

    // Wait for the filtered results to be displayed
    await waitFor(() => {
      const countryCards = screen.getAllByTestId('country-card');
      expect(countryCards.length).toBe(3); // Expect 3 country cards
    });

    // Verify the names of the filtered countries
    expect(screen.getByText('India')).toBeInTheDocument();
    expect(screen.getByText('Indonesia')).toBeInTheDocument();
    expect(screen.getByText('Indiana')).toBeInTheDocument();
  });
});