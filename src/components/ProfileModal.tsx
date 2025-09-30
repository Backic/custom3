import React, { useState } from 'react';
import { X, User, Mail, Calendar, Database, BarChart3, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  const stats = {
    datasets: 5,
    analyses: 12,
    exports: 8
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-900 p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <nav className="space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'settings', label: 'Settings', icon: User },
                { id: 'security', label: 'Security', icon: User },
                { id: 'activity', label: 'Activity', icon: BarChart3 }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Profile Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user?.email?.split('@')[0] || 'User'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Member since {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Edit Profile
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Database className="w-6 h-6 text-blue-600" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Datasets</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{stats.datasets}</p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Analyses</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{stats.analyses}</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Download className="w-6 h-6 text-purple-600" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Exports</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">{stats.exports}</p>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="border-t dark:border-gray-700 pt-8">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Actions</h4>
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 dark:text-white">Export All Data</span>
                        <Download className="w-4 h-4 text-gray-500" />
                      </div>
                    </button>
                    <button 
                      onClick={signOut}
                      className="w-full text-left px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Account Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your display name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Security Settings</h3>
                <div className="space-y-4">
                  <button className="w-full text-left px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-white">Change Password</span>
                      <span className="text-sm text-gray-500">Last changed 30 days ago</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Clustering analysis completed</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Upload className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Dataset uploaded</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}