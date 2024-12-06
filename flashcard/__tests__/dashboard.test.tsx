import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../pages/dashboard/index';
import { BrowserRouter } from 'react-router-dom';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';

// Mock Next Router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/dashboard',
    route: '/dashboard',
    asPath: '/dashboard',
    query: {},
  }),
}));

// Mock useFirebaseDB hook
jest.mock('@/hooks/useFirebaseDB', () => ({
  useFirebaseDB: () => ({
    useDecks: () => ({
      decks: [],
      loading: false,
    }),
  }),
}));

// Mock Firebase to prevent real initialization
jest.mock('../lib/firebase', () => ({
  getAnalytics: jest.fn(),
  isSupported: jest.fn(() => Promise.resolve(false)),
}));

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

it('renders Dashboard component', async () => {
  render(
    <SessionProvider session={null}>
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    </SessionProvider>
  );
  const linkElement = await screen.findByText(/Dashboard/i);
  expect(linkElement).toBeInTheDocument();
});
