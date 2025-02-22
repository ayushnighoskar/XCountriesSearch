import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom for custom matchers
import App from './App';

test('renders search input', () => {
  render(<App />);
  const searchInput = screen.getByPlaceholderText(/search for countries/i);
  expect(searchInput).toBeInTheDocument();
});