/**
 * Fonction de debounce pour retarder l'execution d'une fonction
 * @param func - La fonction a debouncer
 * @param wait - Le delai en millisecondes
 * @param immediate - Si true, execute la fonction immediatement puis debounce
 * @returns La fonction debouncee
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  
  function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
    
    if (callNow) {
      func(...args);
    }
  }
  
  executedFunction.cancel = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return executedFunction;
}

/**
 * Hook personnalise pour utiliser debounce dans les composants React
 * @param value - La valeur a debouncer
 * @param delay - Le delai en millisecondes
 * @returns La valeur debouncee
 */
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook pour debouncer une fonction callback
 * @param callback - La fonction callback a debouncer
 * @param delay - Le delai en millisecondes
 * @returns La fonction callback debouncee
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const [debouncedCallback] = useState(() => debounce(callback, delay));
  
  useEffect(() => {
    return () => {
      // Nettoyer le timer si le composant est demonte
      if (debouncedCallback) {
        debouncedCallback.cancel();
      }
    };
  }, [debouncedCallback]);
  
  return debouncedCallback;
}