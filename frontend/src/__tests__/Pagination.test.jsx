import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from '../components/Pagination';

describe('Pagination Component - US #32', () => {
  
  const mockOnPage = vi.fn();

  beforeEach(() => {
    mockOnPage.mockClear();
  });

  test('Le composant affiche les boutons de navigation', () => {
    render(<Pagination page={1} limit={5} total={20} onPage={mockOnPage} />);
    
    expect(screen.getByText('← Précédent')).toBeInTheDocument();
    expect(screen.getByText('Suivant →')).toBeInTheDocument();
  });

  test('Le composant affiche les informations de pagination', () => {
    render(<Pagination page={2} limit={5} total={20} onPage={mockOnPage} />);
    
    // Page X / Y
    expect(screen.getByText(/Page 2 \/ 4/)).toBeInTheDocument();
    
    // Total éléments
    expect(screen.getByText(/20 éléments/)).toBeInTheDocument();
  });

  test('Le bouton Précédent est désactivé sur la première page', () => {
    render(<Pagination page={1} limit={5} total={20} onPage={mockOnPage} />);
    
    const prevBtn = screen.getByText('← Précédent');
    expect(prevBtn).toBeDisabled();
  });

  test('Le bouton Suivant est désactivé sur la dernière page', () => {
    render(<Pagination page={4} limit={5} total={20} onPage={mockOnPage} />);
    
    const nextBtn = screen.getByText('Suivant →');
    expect(nextBtn).toBeDisabled();
  });

  test('Les deux boutons sont actifs sur une page intermédiaire', () => {
    render(<Pagination page={2} limit={5} total={20} onPage={mockOnPage} />);
    
    const prevBtn = screen.getByText('← Précédent');
    const nextBtn = screen.getByText('Suivant →');
    
    expect(prevBtn).not.toBeDisabled();
    expect(nextBtn).not.toBeDisabled();
  });

  test('Cliquer sur Suivant appelle onPage avec page + 1', async () => {
    const user = userEvent.setup();
    render(<Pagination page={1} limit={5} total={20} onPage={mockOnPage} />);
    
    const nextBtn = screen.getByText('Suivant →');
    await user.click(nextBtn);
    
    expect(mockOnPage).toHaveBeenCalledWith(2);
  });

  test('Cliquer sur Précédent appelle onPage avec page - 1', async () => {
    const user = userEvent.setup();
    render(<Pagination page={3} limit={5} total={20} onPage={mockOnPage} />);
    
    const prevBtn = screen.getByText('← Précédent');
    await user.click(prevBtn);
    
    expect(mockOnPage).toHaveBeenCalledWith(2);
  });

  test('Le calcul du nombre de pages est correct', () => {
    // 23 éléments / 5 par page = 5 pages (arrondi supérieur)
    render(<Pagination page={1} limit={5} total={23} onPage={mockOnPage} />);
    
    expect(screen.getByText(/Page 1 \/ 5/)).toBeInTheDocument();
  });

  test('Affiche au minimum 1 page même avec 0 éléments', () => {
    render(<Pagination page={1} limit={5} total={0} onPage={mockOnPage} />);
    
    expect(screen.getByText(/Page 1 \/ 1/)).toBeInTheDocument();
  });

  test('Les boutons ne font rien quand cliqués aux limites', async () => {
    const user = userEvent.setup();
    
    // Page 1 - Précédent désactivé
    const { rerender } = render(
      <Pagination page={1} limit={5} total={20} onPage={mockOnPage} />
    );
    
    const prevBtn = screen.getByText('← Précédent');
    await user.click(prevBtn);
    expect(mockOnPage).not.toHaveBeenCalled();
    
    // Page 4 (dernière) - Suivant désactivé
    rerender(<Pagination page={4} limit={5} total={20} onPage={mockOnPage} />);
    
    const nextBtn = screen.getByText('Suivant →');
    await user.click(nextBtn);
    expect(mockOnPage).not.toHaveBeenCalled();
  });
});
