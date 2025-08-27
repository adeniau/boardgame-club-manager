import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, CogIcon } from '@heroicons/react/24/outline';
import { SearchBar } from '../search';
import { NotificationBell } from '../notifications';
import { useState } from 'react';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth();
  const { effectiveTheme, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleLanguageToggle = async () => {
    const newLanguage = language === 'fr' ? 'en' : 'fr';
    try {
      await setLanguage(newLanguage);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label={isSidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isSidebarOpen}
            aria-controls="sidebar"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <h1 className="text-xl font-semibold text-gray-900 dark:text-white hidden sm:block">
            Board Game Club Manager
          </h1>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white sm:hidden">
            BGCM
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:block w-96">
            <SearchBar
              placeholder={t('common.actions.search') + '...'}
              size="sm"
              redirectOnSearch={true}
              showFilters={false}
            />
          </div>

          {/* Mobile Search Button */}
          <button
            onClick={() => navigate('/search')}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            title={t('common.actions.search')}
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            title={effectiveTheme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {effectiveTheme === 'dark' ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Notifications */}
          <NotificationBell
            className=""
            showBadge={true}
            badgeVariant="danger"
          />

          {/* Language Toggle */}
          <button
            onClick={handleLanguageToggle}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            title={language === 'fr' ? 'Switch to English' : 'Passer en français'}
          >
            <span className="text-sm font-medium">
              {language === 'fr' ? '🇫🇷' : '🇺🇸'}
            </span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                <span>Bienvenue, {user?.email}</span>
              </div>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/preferences');
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <CogIcon className="h-4 w-4 mr-2" />
                  {t('common.navigation.preferences')}
                </button>
                <hr className="border-gray-200 dark:border-gray-600" />
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('common.navigation.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}