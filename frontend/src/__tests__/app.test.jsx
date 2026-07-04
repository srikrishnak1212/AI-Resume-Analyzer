import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from '../pages/Landing/LandingPage';
import NotFoundPage from '../pages/NotFound/NotFoundPage';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

describe('LandingPage component', () => {
  it('renders landing page content correctly', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <LandingPage />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );

    // Verify main headlines and CTAs using specific queries
    expect(screen.getByRole('heading', { level: 1, name: /Get Recruiter-Quality/i })).toBeInTheDocument();
    expect(screen.getByText(/Analyse my resume free/i)).toBeInTheDocument();
    expect(screen.getByText(/See how it works/i)).toBeInTheDocument();
    expect(screen.getByText(/Everything you need to land your next role/i)).toBeInTheDocument();
  });
});

describe('NotFoundPage component', () => {
  it('renders 404 page content correctly', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/404 — Page not found/i)).toBeInTheDocument();
    expect(screen.getByText(/This page doesn't exist/i)).toBeInTheDocument();
    expect(screen.getByText(/Go to homepage/i)).toBeInTheDocument();
  });
});
