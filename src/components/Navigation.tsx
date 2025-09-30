import React from 'react';
import { 
  Home, 
  Upload, 
  Eye, 
  Settings, 
  BarChart3, 
  History, 
  Sun, 
  Moon, 
  User 
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onProfileClick: () => void;
}

export function Navigation({ currentView, onViewChange, onProfileClick }: NavigationProps) {
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'upload', label: 'Upload Data', icon: Upload },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'clustering', label: 'Clustering', icon: Settings },
    { id: 'visualizations', label: 'Visualizations', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <nav className="flex items-center gap-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </button>
        );
      })}
      
      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        <button
          onClick={onProfileClick}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <User className="w-4 h-4" />
          <span className="text-sm">Profile</span>
        </button>
      </div>
    </nav>
  );
}