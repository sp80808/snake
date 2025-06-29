import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface AdaptiveUIProps {
  children: React.ReactNode;
  isFullscreen: boolean;
  isDarkMode: boolean;
  headerContent: React.ReactNode;
  footerContent: React.ReactNode;
}

export const AdaptiveUI: React.FC<AdaptiveUIProps> = ({
  children,
  isFullscreen,
  isDarkMode,
  headerContent,
  footerContent
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when going fullscreen
  useEffect(() => {
    if (isFullscreen) {
      setIsMobileMenuOpen(false);
    }
  }, [isFullscreen]);

  if (isFullscreen) {
    return (
      <div className="w-screen h-screen overflow-hidden">
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        {/* Mobile Header */}
        <header className={`sticky top-0 z-40 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-lg backdrop-blur-sm bg-opacity-95`}>
          <div className="flex items-center justify-between p-4">
            <h1 className={`text-lg font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Snake Game
            </h1>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg ${
                isDarkMode 
                  ? 'text-white hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className={`border-t ${
              isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <div className="p-4">
                {headerContent}
              </div>
            </div>
          )}
        </header>

        {/* Mobile Content */}
        <main className="p-4 pb-24">
          {children}
        </main>

        {/* Mobile Footer */}
        <footer className={`fixed bottom-0 left-0 right-0 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-lg backdrop-blur-sm bg-opacity-95 p-4`}>
          {footerContent}
        </footer>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Desktop Header */}
      <header className="mb-6">
        {headerContent}
      </header>

      {/* Desktop Content */}
      <main className="px-4">
        {children}
      </main>

      {/* Desktop Footer */}
      <footer className="mt-6">
        {footerContent}
      </footer>
    </div>
  );
};