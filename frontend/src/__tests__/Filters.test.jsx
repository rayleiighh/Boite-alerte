import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Filters from '../components/Filters';

describe('Filters Component - US #31', () => {
  
  const defaultInitial = { type: 'all' };
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('Le composant s\'affiche correctement', () => {
    render(<Filters initial={defaultInitial} onChange={mockOnChange} />);
    
    // Select type présent
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    
    // Champ recherche présent
    expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
    
    // Bouton réinitialiser présent
    expect(screen.getByText('Réinitialiser')).toBeInTheDocument();
  });

  test('Le select de type affiche les bonnes options', () => {
    render(<Filters initial={defaultInitial} onChange={mockOnChange} />);
    
    const select = screen.getByRole('combobox');
    
    expect(select).toContainHTML('Tous les types');
    expect(select).toContainHTML('Courrier');
    expect(select).toContainHTML('Colis');
    expect(select).toContainHTML('Ouverture');
  });

  test('Changer le type appelle onChange avec la nouvelle valeur', async () => {
    const user = userEvent.setup();
    render(<Filters initial={defaultInitial} onChange={mockOnChange} />);
    
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'courrier');
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'courrier' })
    );
  });

  test('Taper dans la recherche appelle onChange', async () => {
    const user = userEvent.setup();
    render(<Filters initial={defaultInitial} onChange={mockOnChange} />);
    
    const searchInput = screen.getByPlaceholderText('Rechercher...');
    await user.type(searchInput, 'esp32');
    
    // onChange est appelé pour chaque caractère tapé
    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'esp32' })
    );
  });

  test('Le bouton Réinitialiser remet les valeurs initiales', async () => {
    const user = userEvent.setup();
    render(<Filters initial={defaultInitial} onChange={mockOnChange} />);
    
    // Changer le type
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'colis');
    
    mockOnChange.mockClear();
    
    // Cliquer sur réinitialiser
    const resetBtn = screen.getByText('Réinitialiser');
    await user.click(resetBtn);
    
    // onChange doit être appelé avec les valeurs initiales
    expect(mockOnChange).toHaveBeenCalledWith(defaultInitial);
    
    // Le select doit afficher la valeur initiale
    expect(select.value).toBe('all');
  });

  test('Le composant accepte des valeurs initiales personnalisées', () => {
    const customInitial = { type: 'courrier', search: 'test' };
    render(<Filters initial={customInitial} onChange={mockOnChange} />);
    
    const select = screen.getByRole('combobox');
    const searchInput = screen.getByPlaceholderText('Rechercher...');
    
    expect(select.value).toBe('courrier');
    expect(searchInput.value).toBe('test');
  });

  test('Les champs de date sont présents et fonctionnels', async () => {
    const user = userEvent.setup();
    render(<Filters initial={defaultInitial} onChange={mockOnChange} />);
    
    // Il y a 2 inputs de type date
    const dateInputs = document.querySelectorAll('input[type="date"]');
    expect(dateInputs.length).toBe(2);
  });
});
