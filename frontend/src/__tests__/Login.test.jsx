import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/Login.jsx';
import axios from 'axios';
vi.mock('axios');
import { server, http, HttpResponse } from './setup';

describe('Login page', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('affiche le formulaire de connexion', () => {
    render(<Login onLoginSuccess={vi.fn()} />);

    expect(screen.getByPlaceholderText("Nom d'utilisateur")).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  test('succès de connexion -> stocke token et appelle onLoginSuccess', async () => {
    // Mock axios for login success
    axios.post.mockResolvedValueOnce({ data: { token: 'tok-123' } });

    const onLoginSuccess = vi.fn();
    render(<Login onLoginSuccess={onLoginSuccess} />);

    fireEvent.change(screen.getByPlaceholderText("Nom d'utilisateur"), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('Mot de passe'), { target: { value: 'Pwd123' } });

    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalled());
    expect(sessionStorage.getItem('authToken')).toBe('tok-123');
    expect(screen.queryByText(/identifiants incorrects/i)).not.toBeInTheDocument();
  });

  test('echec de connexion -> affiche message d\'erreur', async () => {
    // Mock axios for login failure
    axios.post.mockRejectedValueOnce({ response: { status: 401, data: { message: 'Identifiants incorrects' } } });

    const onLoginSuccess = vi.fn();
    render(<Login onLoginSuccess={onLoginSuccess} />);

    fireEvent.change(screen.getByPlaceholderText("Nom d'utilisateur"), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('Mot de passe'), { target: { value: 'bad' } });

    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => expect(screen.getByText(/identifiants incorrects/i)).toBeInTheDocument());
    expect(sessionStorage.getItem('authToken')).toBeNull();
    expect(onLoginSuccess).not.toHaveBeenCalled();
  });

  test('bouton afficher mot de passe bascule la visibilité', async () => {
    render(<Login onLoginSuccess={vi.fn()} />);

    const pwd = screen.getByPlaceholderText('Mot de passe');
    const toggle = screen.getByText('👁');

    // initialement en password
    expect(pwd).toHaveAttribute('type', 'password');

    fireEvent.mouseDown(toggle);
    expect(pwd).toHaveAttribute('type', 'text');

    fireEvent.mouseUp(toggle);
    expect(pwd).toHaveAttribute('type', 'password');
  });
});
