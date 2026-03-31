import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';

test('Login component renders correctly', () => {
  render(
    <AuthProvider>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </AuthProvider>
  );

  // Basic rendering checks - these are reliable
  expect(screen.getByText('Login to CoinVault')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('yourusername')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
});

test('Signup link is present', () => {
  render(
    <AuthProvider>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </AuthProvider>
  );

  expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
});