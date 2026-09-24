import { LoginForm } from '@/components/auth/(login-register)/login/login-form';
import { authClient } from '@/lib/auth/auth-client';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders as render } from '../../test-utils';

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock('@/lib/auth/auth-client', () => ({
  authClient: {
    signIn: { email: vi.fn(), social: vi.fn() },
    getSession: vi.fn(),
  },
}));

const mockedSignIn = vi.mocked(authClient.signIn.email);
const mockedGetSession = vi.mocked(authClient.getSession);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginForm', { tags: ['frontend'] }, () => {
  it('shows validation errors for empty fields', async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(
      await screen.findByText('Please enter a valid email address.'),
    ).toBeTruthy();
    expect(await screen.findByText('Password is required.')).toBeTruthy();
    expect(mockedSignIn).not.toHaveBeenCalled();
  });

  it('signs in and redirects a regular user to /encyclopedia', async () => {
    mockedSignIn.mockImplementation(async (_data, opts) => {
      await opts?.onSuccess?.({} as never);
      return { error: null } as never;
    });
    mockedGetSession.mockResolvedValue({
      data: { user: { role: 'user' } },
    } as never);

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'User@12345' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/encyclopedia'));
    expect(mockedSignIn).toHaveBeenCalledWith(
      { email: 'user@test.com', password: 'User@12345' },
      expect.any(Object),
    );
  });

  it('shows an error message on wrong credentials', async () => {
    mockedSignIn.mockResolvedValue({
      error: { status: 401, message: 'Wrong email or password' },
    } as never);

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@test.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'badpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(await screen.findByText('Wrong email or password')).toBeTruthy();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
