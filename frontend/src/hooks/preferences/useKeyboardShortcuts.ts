import { useEffect, useCallback, useRef, useState } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { DEFAULT_SHORTCUTS } from '../../types/preferences';
import { preferencesService } from '../../services/preferencesService';

type ShortcutCallback = () => void;
type ShortcutMap = Record<string, ShortcutCallback>;

interface ShortcutOptions {
  preventDefault?: boolean;
  stopPropagation?: boolean;
  context?: string; // For context-aware shortcuts
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutMap,
  options: ShortcutOptions = {}
) {
  const { preferences } = usePreferences();
  const shortcutsRef = useRef<ShortcutMap>(shortcuts);
  const optionsRef = useRef<ShortcutOptions>(options);

  // Update refs when props change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
    optionsRef.current = options;
  }, [shortcuts, options]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't handle shortcuts if disabled in preferences
    if (!preferences?.keyboard_shortcuts_enabled) return;

    // Don't handle shortcuts when typing in form fields
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable ||
      target.getAttribute('role') === 'textbox'
    ) {
      return;
    }

    // Check each shortcut
    Object.entries(shortcutsRef.current).forEach(([shortcut, callback]) => {
      if (preferencesService.isShortcutMatch(event, shortcut)) {
        const opts = optionsRef.current;
        
        if (opts.preventDefault !== false) {
          event.preventDefault();
        }
        
        if (opts.stopPropagation) {
          event.stopPropagation();
        }
        
        callback();
      }
    });
  }, [preferences?.keyboard_shortcuts_enabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleKeyDown]);
}

// Hook for global shortcuts
export function useGlobalShortcuts() {
  const shortcuts: ShortcutMap = {
    [DEFAULT_SHORTCUTS.global.search]: () => {
      // Focus search input or open search modal
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      } else {
        // Trigger search modal if no search input is visible
        console.log('Open search modal');
      }
    },
    
    [DEFAULT_SHORTCUTS.global.preferences]: () => {
      // Navigate to preferences page
      window.location.href = '/preferences';
    },
    
    [DEFAULT_SHORTCUTS.global.help]: () => {
      // Show keyboard shortcuts help
      console.log('Show shortcuts help');
    },
    
    [DEFAULT_SHORTCUTS.global.escape]: () => {
      // Close modals, cancel forms, etc.
      const modals = document.querySelectorAll('[role="dialog"]');
      modals.forEach(modal => {
        const closeButton = modal.querySelector('[aria-label="Close"], [data-dismiss="modal"]') as HTMLButtonElement;
        if (closeButton) {
          closeButton.click();
        }
      });
    },
    
    [DEFAULT_SHORTCUTS.global.home]: () => {
      // Navigate to home/dashboard
      window.location.href = '/dashboard';
    }
  };

  useKeyboardShortcuts(shortcuts, {
    context: 'global',
    preventDefault: true,
    stopPropagation: true
  });
}

// Hook for page-specific shortcuts
export function usePageShortcuts(page: string) {
  const getPageShortcuts = useCallback((pageName: string): ShortcutMap => {
    switch (pageName) {
      case 'dashboard':
        return {
          [DEFAULT_SHORTCUTS.dashboard.refresh]: () => {
            window.location.reload();
          },
          [DEFAULT_SHORTCUTS.dashboard.export]: () => {
            console.log('Export dashboard data');
          },
          [DEFAULT_SHORTCUTS.dashboard.stats]: () => {
            // Scroll to or focus stats section
            const statsSection = document.querySelector('[data-widget="stats"]');
            if (statsSection) {
              statsSection.scrollIntoView({ behavior: 'smooth' });
            }
          },
          [DEFAULT_SHORTCUTS.dashboard.charts]: () => {
            // Scroll to or focus charts section
            const chartsSection = document.querySelector('[data-widget="charts"]');
            if (chartsSection) {
              chartsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }
        };
        
      case 'games':
        return {
          [DEFAULT_SHORTCUTS.games.add]: () => {
            // Navigate to add game page or open modal
            const addButton = document.querySelector('[data-action="add-game"]') as HTMLButtonElement;
            if (addButton) {
              addButton.click();
            }
          },
          [DEFAULT_SHORTCUTS.games.search]: () => {
            // Focus search input
            const searchInput = document.querySelector('input[placeholder*="jeu"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
          },
          [DEFAULT_SHORTCUTS.games.filter]: () => {
            // Toggle filter panel
            const filterButton = document.querySelector('[data-action="toggle-filters"]') as HTMLButtonElement;
            if (filterButton) {
              filterButton.click();
            }
          }
        };
        
      case 'members':
        return {
          [DEFAULT_SHORTCUTS.members.add]: () => {
            // Navigate to add member page or open modal
            const addButton = document.querySelector('[data-action="add-member"]') as HTMLButtonElement;
            if (addButton) {
              addButton.click();
            }
          },
          [DEFAULT_SHORTCUTS.members.search]: () => {
            // Focus search input
            const searchInput = document.querySelector('input[placeholder*="membre"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
          }
        };
        
      case 'borrowings':
        return {
          [DEFAULT_SHORTCUTS.borrowings.create]: () => {
            // Open new borrowing modal
            const createButton = document.querySelector('[data-action="new-borrowing"]') as HTMLButtonElement;
            if (createButton) {
              createButton.click();
            }
          },
          [DEFAULT_SHORTCUTS.borrowings.return]: () => {
            // Open return modal
            const returnButton = document.querySelector('[data-action="return-game"]') as HTMLButtonElement;
            if (returnButton) {
              returnButton.click();
            }
          },
          [DEFAULT_SHORTCUTS.borrowings.history]: () => {
            // Navigate to history tab
            const historyTab = document.querySelector('[data-tab="history"]') as HTMLButtonElement;
            if (historyTab) {
              historyTab.click();
            }
          }
        };
        
      default:
        return {};
    }
  }, []);

  const shortcuts = getPageShortcuts(page);
  
  useKeyboardShortcuts(shortcuts, {
    context: page,
    preventDefault: true
  });
}

// Hook for shortcuts help display
export function useShortcutsHelp() {
  const { preferences } = usePreferences();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const toggleHelp = useCallback(() => {
    setIsHelpOpen(prev => !prev);
  }, []);

  // Show help with '?' key
  useKeyboardShortcuts(
    { '?': toggleHelp },
    { context: 'help' }
  );

  const getActiveShortcuts = useCallback(() => {
    if (!preferences?.keyboard_shortcuts_enabled) return {};

    const context = getShortcutContext();
    const globalShortcuts = DEFAULT_SHORTCUTS.global;
    const contextShortcuts = context ? (DEFAULT_SHORTCUTS as any)[context] || {} : {};

    return {
      global: globalShortcuts,
      [context || 'page']: contextShortcuts
    };
  }, [preferences?.keyboard_shortcuts_enabled]);

  return {
    isHelpOpen,
    setIsHelpOpen,
    toggleHelp,
    activeShortcuts: getActiveShortcuts(),
    isEnabled: preferences?.keyboard_shortcuts_enabled || false
  };
}

// Utility function to get current shortcut context based on URL
function getShortcutContext(): string | null {
  const path = window.location.pathname;
  
  if (path.includes('/dashboard')) return 'dashboard';
  if (path.includes('/games')) return 'games';
  if (path.includes('/members')) return 'members';
  if (path.includes('/borrowings')) return 'borrowings';
  if (path.includes('/preferences')) return 'preferences';
  
  return null;
}

// Custom hook for form shortcuts
export function useFormShortcuts(formActions: {
  save?: () => void;
  cancel?: () => void;
  reset?: () => void;
}) {
  const shortcuts: ShortcutMap = {};
  
  if (formActions.save) {
    shortcuts['Ctrl+S'] = formActions.save;
  }
  
  if (formActions.cancel) {
    shortcuts['Escape'] = formActions.cancel;
  }
  
  if (formActions.reset) {
    shortcuts['Ctrl+R'] = formActions.reset;
  }

  useKeyboardShortcuts(shortcuts, {
    context: 'form',
    preventDefault: true
  });
}

// Custom hook for list/table shortcuts
export function useListShortcuts(listActions: {
  selectNext?: () => void;
  selectPrevious?: () => void;
  selectFirst?: () => void;
  selectLast?: () => void;
  delete?: () => void;
  edit?: () => void;
  create?: () => void;
}) {
  const shortcuts: ShortcutMap = {};
  
  if (listActions.selectNext) {
    shortcuts['ArrowDown'] = listActions.selectNext;
    shortcuts['j'] = listActions.selectNext;
  }
  
  if (listActions.selectPrevious) {
    shortcuts['ArrowUp'] = listActions.selectPrevious;
    shortcuts['k'] = listActions.selectPrevious;
  }
  
  if (listActions.selectFirst) {
    shortcuts['Home'] = listActions.selectFirst;
  }
  
  if (listActions.selectLast) {
    shortcuts['End'] = listActions.selectLast;
  }
  
  if (listActions.delete) {
    shortcuts['Delete'] = listActions.delete;
  }
  
  if (listActions.edit) {
    shortcuts['Enter'] = listActions.edit;
    shortcuts['e'] = listActions.edit;
  }
  
  if (listActions.create) {
    shortcuts['n'] = listActions.create;
  }

  useKeyboardShortcuts(shortcuts, {
    context: 'list',
    preventDefault: true
  });
}