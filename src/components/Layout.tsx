import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Navigation } from './Navigation';
import { DNAIcon } from './DNAIcon';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  onProfileClick: () => void;
}

export function Layout({ children, currentView, onViewChange, onProfileClick }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <DNAIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>

            <Navigation 
              currentView={currentView}
              onViewChange={onViewChange}
              onProfileClick={onProfileClick}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}