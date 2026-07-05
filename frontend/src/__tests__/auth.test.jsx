import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import ForgotPasswordPage from '../pages/Auth/ForgotPasswordPage';
import { AuthContext } from '../context/AuthContext';

// Mock react-hot-toast to avoid errors during test execution
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ── Mock Auth Value ───────────────────────────────────────────────────────────
const mockAuthValue = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

const renderWithProviders = (ui, authValue = mockAuthValue) => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authValue}>
        {ui}
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('LoginPage', () => {
  it('renders all form fields and action links', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText(/^Email address\*?$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password\*?$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    expect(screen.getByText('Sign up for free')).toBeInTheDocument();
  });

  it('validates empty inputs on submit', async () => {
    renderWithProviders(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('Email is required.')).toBeInTheDocument();
      expect(screen.getByText('Password is required.')).toBeInTheDocument();
    });
  });

  it('validates invalid email format', async () => {
    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/^Email address\*?$/i), { target: { value: 'notanemail' } });
    fireEvent.change(screen.getByLabelText(/^Password\*?$/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });
  });
});

describe('RegisterPage', () => {
  it('renders registration fields', () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByLabelText(/^Full name\*?$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email address\*?$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password\*?$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm password\*?$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });

  it('displays password strength indicator on typing password', async () => {
    renderWithProviders(<RegisterPage />);

    const passwordInput = screen.getByLabelText(/^Password\*?$/i);
    fireEvent.change(passwordInput, { target: { value: 'Weak1' } });

    await waitFor(() => {
      expect(screen.getByText(/Password strength:/i)).toBeInTheDocument();
    });
  });

  it('validates password match on submit', async () => {
    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/^Full name\*?$/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/^Email address\*?$/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password\*?$/i), { target: { value: 'StrongPass1' } });
    fireEvent.change(screen.getByLabelText(/^Confirm password\*?$/i), { target: { value: 'DifferentPass2' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });
});

describe('ForgotPasswordPage', () => {
  it('renders email input and back navigation', () => {
    renderWithProviders(<ForgotPasswordPage />);

    expect(screen.getByLabelText(/^Email address\*?$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send reset link' })).toBeInTheDocument();
    expect(screen.getAllByText('Back to sign in').length).toBeGreaterThan(0);
  });

  it('shows validation error for invalid email', async () => {
    renderWithProviders(<ForgotPasswordPage />);

    fireEvent.change(screen.getByLabelText(/^Email address\*?$/i), { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    });
  });
});
