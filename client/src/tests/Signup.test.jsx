import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Signup from '../pages/Signup';

test('renders signup form', () => {
  render(
    <BrowserRouter>
      <Signup />
    </BrowserRouter>
  );

  expect(screen.getByPlaceholderText('username')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('password')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
});