import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import Profile from '../pages/Profile.jsx';

vi.mock('axios');

describe('Profile page', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  test('fetches and displays profile when token present', async () => {
    sessionStorage.setItem('authToken', 'tok-123');

    // Mock /system/profile response
    axios.get
      .mockResolvedValueOnce({
        data: {
          username: 'sysadmin',
          email: 'admin@local',
          lastLogin: new Date().toISOString(),
          lastPasswordChange: null,
          active: true,
          backend: 'ok',
          mongo: 'connected',
          uptime: 3600,
        },
      })
      // Mock /api/users/notified-emails
      .mockResolvedValueOnce({ data: ['a@b.com', 'c@d.com'] });

    render(<Profile />);

    await waitFor(() => expect(screen.getByText(/sysadmin/i)).toBeInTheDocument());
    // admin email is not shown directly in the layout; check status and notified emails
    expect(screen.getByText(/Actif/i)).toBeInTheDocument();
    // Notified emails displayed
    expect(screen.getByText('a@b.com')).toBeInTheDocument();
    expect(screen.getByText('c@d.com')).toBeInTheDocument();
  });

  test('fetches notified emails even without token', async () => {
    // When no token, component still fetches notified emails
    axios.get.mockResolvedValueOnce({ data: ['notify@x.com'] });

    render(<Profile />);

    await waitFor(() => expect(screen.getByText('notify@x.com')).toBeInTheDocument());
  });

  test('change password success clears fields and shows success', async () => {
    sessionStorage.setItem('authToken', 'tok-xyz');

    // initial GETs
    axios.get
      .mockResolvedValueOnce({
        data: {
          username: 'sysadmin',
          email: 'admin@local',
          lastLogin: new Date().toISOString(),
          lastPasswordChange: null,
          active: true,
          backend: 'ok',
          mongo: 'connected',
          uptime: 3600,
        },
      })
      .mockResolvedValueOnce({ data: [] });

    // Mock change-password success
    axios.post.mockResolvedValueOnce({ status: 200, data: { message: 'Mot de passe modifié. Reconnexion requise.' } });

    render(<Profile />);

    // Open change password form
    fireEvent.click(screen.getByRole('button', { name: /Changer le mot de passe/i }));

    // Fill inputs
    fireEvent.change(screen.getByPlaceholderText('Mot de passe actuel'), { target: { value: 'OldPass123' } });
    fireEvent.change(screen.getByPlaceholderText('Nouveau mot de passe'), { target: { value: 'NewStrong1' } });
    fireEvent.change(screen.getByPlaceholderText('Confirmer le nouveau mot de passe'), { target: { value: 'NewStrong1' } });

    fireEvent.click(screen.getByRole('button', { name: /Valider/i }));

    // Expect success message and cleared fields
    await waitFor(() => expect(screen.getByText(/Mot de passe modifié avec succès/i)).toBeInTheDocument());
    expect(screen.getByPlaceholderText('Mot de passe actuel').value).toBe('');
    expect(screen.getByPlaceholderText('Nouveau mot de passe').value).toBe('');
    expect(screen.getByPlaceholderText('Confirmer le nouveau mot de passe').value).toBe('');
  });

  test('change password 401 -> session expired and token removed', async () => {
    sessionStorage.setItem('authToken', 'tok-exp');

    // initial GETs
    axios.get
      .mockResolvedValueOnce({
        data: {
          username: 'sysadmin',
          email: 'admin@local',
          lastLogin: new Date().toISOString(),
          lastPasswordChange: null,
          active: true,
          backend: 'ok',
          mongo: 'connected',
          uptime: 3600,
        },
      })
      .mockResolvedValueOnce({ data: [] });

    axios.post.mockRejectedValueOnce({ response: { status: 401 } });

    render(<Profile />);

    fireEvent.click(screen.getByRole('button', { name: /Changer le mot de passe/i }));

    fireEvent.change(screen.getByPlaceholderText('Mot de passe actuel'), { target: { value: 'OldPass123' } });
    fireEvent.change(screen.getByPlaceholderText('Nouveau mot de passe'), { target: { value: 'NewStrong1' } });
    fireEvent.change(screen.getByPlaceholderText('Confirmer le nouveau mot de passe'), { target: { value: 'NewStrong1' } });

    fireEvent.click(screen.getByRole('button', { name: /Valider/i }));

    await waitFor(() => expect(screen.getByText(/Votre session a expiré/i)).toBeInTheDocument());
    expect(sessionStorage.getItem('authToken')).toBeNull();
  });
});
