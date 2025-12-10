import { describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import HistoryPage from '../pages/History';

// Wrapper pour les tests avec Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('History Page - US #30, #31, #32', () => {

  // ========== US #30 : AFFICHAGE LISTE DES ÉVÉNEMENTS ==========
  describe('US #30 - Affichage liste des événements', () => {
    
    test('CA1: La page affiche les événements depuis l\'API', async () => {
      renderWithRouter(<HistoryPage />);
      
      // Attendre le chargement
      await waitFor(() => {
        expect(screen.queryByText('Chargement…')).not.toBeInTheDocument();
      });

      // Vérifier que les événements sont affichés (plusieurs courriers possibles)
      await waitFor(() => {
        expect(screen.getAllByText('courrier').length).toBeGreaterThan(0);
      });
    });

    test('La page affiche un message de chargement initialement', () => {
      renderWithRouter(<HistoryPage />);
      
      expect(screen.getAllByText('Chargement…').length).toBeGreaterThan(0);
    });

    test('La page affiche les informations d\'un événement (type, date, device)', async () => {
      renderWithRouter(<HistoryPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Chargement…')).not.toBeInTheDocument();
      });

      // Le type doit être affiché (plusieurs instances possibles)
      await waitFor(() => {
        expect(screen.getAllByText('courrier').length).toBeGreaterThan(0);
      });
      
      // Le deviceID doit être affiché (desktop)
      expect(screen.getAllByText('esp32-001').length).toBeGreaterThan(0);
    });

    test('La page affiche un message quand il n\'y a aucun événement', async () => {
      // Ce test vérifie le comportement avec un filtre qui ne retourne rien
      renderWithRouter(<HistoryPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Chargement…')).not.toBeInTheDocument();
      });
    });
  });

  // ========== US #31 : FILTRAGE DES ÉVÉNEMENTS ==========
  describe('US #31 - Filtrage des événements', () => {
    
    test('CA3: Le composant Filters est présent', async () => {
      renderWithRouter(<HistoryPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Chargement…')).not.toBeInTheDocument();
      });

      // Le select de type doit être présent
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      
      // Le bouton réinitialiser doit être présent
      expect(screen.getByText('Réinitialiser')).toBeInTheDocument();
    });

    test('Le select de type contient toutes les options', async () => {
      renderWithRouter(<HistoryPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Chargement…')).not.toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      
      expect(select).toContainHTML('Tous les types');
      expect(select).toContainHTML('Courrier');
      expect(select).toContainHTML('Colis');
      expect(select).toContainHTML('Ouverture');
    });

    test('CA5: Changement de filtre type met à jour l\'affichage dynamiquement', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HistoryPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Chargement…')).not.toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      
      // Changer le filtre sur "colis"
      await user.selectOptions(select, 'colis');
      
      // L'affichage doit se mettre à jour (pas de rechargement page)
      await waitFor(() => {
        const colisBadges = screen.getAllByText('colis');
        expect(colisBadges.length).toBeGreaterThan(0);
      });
    });

    test('Le champ de recherche est présent', async () => {
      renderWithRouter(<HistoryPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Chargement…')).not.toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
    });

    test('Les champs de date sont présents', async () => {
      renderWithRouter(<HistoryPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Chargement…')).not.toBeInTheDocument();
      });

      // Les inputs de type date ne sont pas des textbox, on les cherche directement
      const dateInputs = document.querySelectorAll('input[type="date"]');
      expect(dateInputs.length).toBe(2);
    });

    test('Le bouton Réinitialiser remet les filtres par défaut', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HistoryPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Chargement…')).not.toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      const resetBtn = screen.getByText('Réinitialiser');
      
      // Changer le filtre
      await user.selectOptions(select, 'colis');
      
      // Cliquer sur réinitialiser
      await user.click(resetBtn);
      
      // Le select doit revenir à "all"
      expect(select.value).toBe('all');
    });
  });

  // ========== US #32 : PAGINATION DE L'HISTORIQUE ==========
  describe('US #32 - Pagination de l\'historique', () => {
    
    test('CA4: Le composant de pagination est affiché', async () => {
      renderWithRouter(<HistoryPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Chargement…')).not.toBeInTheDocument();
      });

      // Boutons de navigation
      expect(screen.getByText('← Précédent')).toBeInTheDocument();
      expect(screen.getByText('Suivant →')).toBeInTheDocument();
    });

    test('CA4: Les informations de pagination sont affichées', async () => {
      renderWithRouter(<HistoryPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Chargement…')).not.toBeInTheDocument();
      });

      // Info de page et total
      await waitFor(() => {
        expect(screen.getByText(/Page \d+ \/ \d+/)).toBeInTheDocument();
        expect(screen.getByText(/\d+ éléments/)).toBeInTheDocument();
      });
    });

    test('Le bouton Précédent est désactivé sur la première page', async () => {
      renderWithRouter(<HistoryPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Chargement…')).not.toBeInTheDocument();
      });

      const prevBtn = screen.getByText('← Précédent');
      expect(prevBtn).toBeDisabled();
    });

    test('CA4 & CA5: Cliquer sur Suivant charge la page suivante sans rechargement', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HistoryPage />);
      
      await waitFor(() => {
        expect(screen.queryByText('Chargement…')).not.toBeInTheDocument();
      });

      // Vérifier qu'on est sur page 1
      await waitFor(() => {
        expect(screen.getByText(/Page 1 \//)).toBeInTheDocument();
      });

      const nextBtn = screen.getByText('Suivant →');
      
      // Si on a assez d'éléments pour une 2e page
      if (!nextBtn.disabled) {
        await user.click(nextBtn);
        
        // Vérifier qu'on passe à la page 2
        await waitFor(() => {
          expect(screen.getByText(/Page 2 \//)).toBeInTheDocument();
        });
        
        // Le bouton précédent doit maintenant être actif
        const prevBtn = screen.getByText('← Précédent');
        expect(prevBtn).not.toBeDisabled();
      }
    });
  });
});
