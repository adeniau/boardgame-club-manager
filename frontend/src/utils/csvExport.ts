/**
 * Utilitaires pour l'export de donnees en CSV
 */

export interface CSVColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
}

/**
 * Convertit un tableau d'objets en CSV
 * @param data - Les donnees a exporter
 * @param columns - Configuration des colonnes
 * @param filename - Nom du fichier (sans extension)
 */
export function exportToCSV<T>(
  data: T[],
  columns: CSVColumn[],
  filename: string = 'export'
): void {
  if (data.length === 0) {
    throw new Error('Aucune donnee a exporter');
  }

  // Creer l'en-tete CSV
  const headers = columns.map(col => `"${col.label}"`).join(',');
  
  // Creer les lignes de donnees
  const rows = data.map(item => {
    return columns.map(col => {
      const value = (item as any)[col.key];
      const formattedValue = col.format ? col.format(value) : String(value || '');
      
      // Echapper les guillemets doubles et encapsuler dans des guillemets
      const escapedValue = formattedValue.replace(/"/g, '""');
      return `"${escapedValue}"`;
    }).join(',');
  });
  
  // Combiner l'en-tete et les donnees
  const csvContent = [headers, ...rows].join('\n');
  
  // Ajouter BOM UTF-8 pour une meilleure compatibilite avec Excel
  const bom = '\uFEFF';
  const csvWithBom = bom + csvContent;
  
  // Creer et telecharger le fichier
  const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // Fallback pour les navigateurs plus anciens
    if ((navigator as any).msSaveBlob) {
      (navigator as any).msSaveBlob(blob, `${filename}.csv`);
    } else {
      throw new Error('Votre navigateur ne supporte pas le telechargement de fichiers');
    }
  }
}

/**
 * Formatters communs pour les colonnes CSV
 */
export const csvFormatters = {
  /**
   * Formate une date au format francais
   */
  frenchDate: (value: string | null): string => {
    if (!value) return '';
    try {
      return new Date(value).toLocaleDateString('fr-FR');
    } catch {
      return value;
    }
  },

  /**
   * Formate une date et heure au format francais
   */
  frenchDateTime: (value: string | null): string => {
    if (!value) return '';
    try {
      return new Date(value).toLocaleString('fr-FR');
    } catch {
      return value;
    }
  },

  /**
   * Formate un boolean en Oui/Non
   */
  yesNo: (value: boolean | null): string => {
    if (value === null || value === undefined) return '';
    return value ? 'Oui' : 'Non';
  },

  /**
   * Formate un nombre avec separateur de milliers
   */
  number: (value: number | null): string => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('fr-FR').format(value);
  },

  /**
   * Formate une duree en jours
   */
  durationDays: (borrowDate: string, returnDate: string | null): string => {
    if (!borrowDate) return '';
    
    const borrow = new Date(borrowDate);
    const returnD = returnDate ? new Date(returnDate) : new Date();
    const diffTime = returnD.getTime() - borrow.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} jour${diffDays !== 1 ? 's' : ''}`;
  },

  /**
   * Formate un statut d'emprunt
   */
  borrowingStatus: (returnDate: string | null): string => {
    return returnDate ? 'Retourne' : 'En cours';
  }
};

/**
 * Configuration predefinies pour les exports courants
 */
export const csvConfigs = {
  borrowingsHistory: [
    { key: 'game_name', label: 'Jeu' },
    { key: 'member_firstname', label: 'Prenom membre' },
    { key: 'member_lastname', label: 'Nom membre' },
    { key: 'member_email', label: 'Email membre' },
    { key: 'borrow_date', label: 'Date d\'emprunt', format: csvFormatters.frenchDate },
    { key: 'return_date', label: 'Date de retour', format: csvFormatters.frenchDate },
    { 
      key: 'status', 
      label: 'Statut', 
      format: (_value: any, item: any) => csvFormatters.borrowingStatus(item?.return_date)
    },
    { 
      key: 'duration', 
      label: 'Duree', 
      format: (_value: any, item: any) => csvFormatters.durationDays(item?.borrow_date, item?.return_date)
    },
    { key: 'comment', label: 'Commentaire' },
    { key: 'season_name', label: 'Saison' }
  ] as CSVColumn[],

  currentBorrowings: [
    { key: 'game_name', label: 'Jeu' },
    { key: 'member_firstname', label: 'Prenom membre' },
    { key: 'member_lastname', label: 'Nom membre' },
    { key: 'member_email', label: 'Email membre' },
    { key: 'member_phone', label: 'Telephone membre' },
    { key: 'borrow_date', label: 'Date d\'emprunt', format: csvFormatters.frenchDate },
    { 
      key: 'duration', 
      label: 'Duree (jours)', 
      format: (_value: any, item: any) => {
        const borrow = new Date(item?.borrow_date);
        const now = new Date();
        const diffTime = now.getTime() - borrow.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return String(diffDays);
      }
    }
  ] as CSVColumn[],

  members: [
    { key: 'firstname', label: 'Prenom' },
    { key: 'name', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telephone' },
    { key: 'is_admin', label: 'Administrateur', format: csvFormatters.yesNo }
  ] as CSVColumn[],

  games: [
    { key: 'name', label: 'Nom du jeu' },
    { key: 'available', label: 'Disponible', format: csvFormatters.yesNo }
  ] as CSVColumn[]
};

/**
 * Hook React pour utiliser l'export CSV
 */
import { useState } from 'react';

export function useCSVExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportData = async <T>(
    data: T[],
    columns: CSVColumn[],
    filename: string = 'export'
  ): Promise<void> => {
    setIsExporting(true);
    setExportError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Petit delai pour l'UX
      exportToCSV(data, columns, filename);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'export';
      setExportError(message);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportData,
    isExporting,
    exportError,
    clearError: () => setExportError(null)
  };
}