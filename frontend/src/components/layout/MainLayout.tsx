import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Fermer la sidebar sur redimensionnement en desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Gestion de l'accessibilité : focus trap quand sidebar ouverte sur mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
          <Header 
            onToggleSidebar={handleToggleSidebar} 
            isSidebarOpen={isSidebarOpen}
          />

          {/* Page content */}
          <main 
            className="flex-1 relative overflow-y-auto focus:outline-none"
            tabIndex={-1}
            aria-label="Contenu principal"
          >
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}