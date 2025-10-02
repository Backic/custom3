import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthForm } from './components/AuthForm';
import { Layout } from './components/Layout';
import { ProfileModal } from './components/ProfileModal';
import { ClusteringConfiguration, ClusteringConfig } from './components/ClusteringConfiguration';
import { RFMAnalysis } from './components/RFMAnalysis';
import { DataUpload } from './components/DataUpload';
import { DataPreview } from './components/DataPreview';
import { ClusteringAnalysis } from './components/ClusteringAnalysis';
import { ClusteringHistory } from './components/ClusteringHistory';
import { BarChart3, Upload, History, ArrowRight, Download } from 'lucide-react';
import { generateCSV, downloadCSV } from './lib/csv';
import type { CustomerRecord, ClusterResult } from './types';
import { RFMConfig } from './components/ClusteringConfiguration';

type ViewType = 'dashboard' | 'upload' | 'preview' | 'clustering' | 'analysis' | 'rfm' | 'visualizations' | 'history';

function Dashboard() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [currentData, setCurrentData] = useState<CustomerRecord[]>([]);
  const [currentFilename, setCurrentFilename] = useState('');
  const [clusteringHistory, setClusteringHistory] = useState<ClusterResult[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [clusteringConfig, setClusteringConfig] = useState<ClusteringConfig | null>(null);
  const [rfmConfig, setRfmConfig] = useState<RFMConfig | null>(null);
  const { user } = useAuth();

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(`clustering_history_${user?.id}`);
    if (savedHistory) {
      setClusteringHistory(JSON.parse(savedHistory));
    }
  }, [user]);

  const handleDataUploaded = (data: CustomerRecord[], filename: string) => {
    setCurrentData(data);
    setCurrentFilename(filename);
    setCurrentView('preview');
  };

  const handleRunClustering = (config: ClusteringConfig) => {
    setClusteringConfig(config);
    if (config.analysisType === 'clustering') {
      setCurrentView('analysis');
    }
  };

  const handleRunRFM = (config: RFMConfig) => {
    setRfmConfig(config);
    setCurrentView('rfm');
  };

  const handleSaveResult = (result: ClusterResult) => {
    const updatedHistory = [...clusteringHistory, result];
    setClusteringHistory(updatedHistory);
    localStorage.setItem(`clustering_history_${user?.id}`, JSON.stringify(updatedHistory));
    alert('Analysis saved successfully!');
  };

  const handleViewHistoryResult = (result: ClusterResult) => {
    // For now, just show an alert with details
    alert(`Viewing analysis: ${result.name}\nClusters: ${result.k}\nSilhouette Score: ${result.metrics.silhouetteScore.toFixed(3)}`);
  };

  const handleExportHistory = () => {
    if (clusteringHistory.length === 0) {
      alert('No analysis history to export');
      return;
    }

    const exportData = clusteringHistory.map(result => ({
      Name: result.name,
      Clusters: result.k,
      Features: result.features.join(', '),
      'Silhouette Score': result.metrics.silhouetteScore.toFixed(3),
      'Created At': new Date(result.created_at).toLocaleDateString()
    }));

    const csv = generateCSV(exportData);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `clustering_history_${timestamp}.csv`);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'upload':
        return (
          <DataUpload 
            onDataUploaded={handleDataUploaded}
          />
        );
      case 'preview':
        return (
          <DataPreview
            data={currentData}
            filename={currentFilename}
            onAnalyze={() => setCurrentView('clustering')}
            onBack={() => setCurrentView('upload')}
          />
        );
      case 'clustering':
        return (
          <ClusteringConfiguration
            data={currentData}
            onRunClustering={handleRunClustering}
            onRunRFM={handleRunRFM}
            onBack={() => setCurrentView('preview')}
          />
        );
      case 'analysis':
        return (
          <ClusteringAnalysis
            data={currentData}
            filename={currentFilename}
            clusteringConfig={clusteringConfig}
            onBack={() => setCurrentView('clustering')}
            onSaveResult={handleSaveResult}
          />
        );
      case 'rfm':
        return (
          <RFMAnalysis
            data={currentData}
            filename={currentFilename}
            rfmConfig={rfmConfig}
            onBack={() => setCurrentView('clustering')}
            onSaveResult={handleSaveResult}
          />
        );
      case 'visualizations':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Visualizations</h2>
            <p className="text-gray-600 dark:text-gray-400">Advanced visualization features coming soon</p>
          </div>
        );
      case 'history':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analysis History</h2>
                  <p className="text-gray-600 dark:text-gray-400">View and manage your previous analyses</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleExportHistory}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>
            <ClusteringHistory
              history={clusteringHistory}
              onViewResult={handleViewHistoryResult}
              onBack={() => setCurrentView('dashboard')}
            />
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 dark:from-blue-700 dark:via-purple-700 dark:to-blue-800 rounded-2xl text-white p-6 sm:p-12 text-center animate-slide-up">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-10 h-10" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-4">Welcome to SegmentAI</h1>
              <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Discover hidden patterns in your customer data using advanced AI and machine learning algorithms
              </p>
              <button
                onClick={() => setCurrentView('upload')}
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 text-sm sm:text-base"
              >
                <Upload className="w-5 h-5" />
                Start New Analysis
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in animation-delay-200">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Upload Dataset</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start by uploading your customer data in CSV format. Our system will automatically detect numeric columns for clustering.
                </p>
                <button
                  onClick={() => setCurrentView('upload')}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Upload Data <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <History className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Analysis History</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Review your previous clustering analyses, compare results, and export segmented data.
                </p>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentView('history')}
                    className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                  >
                    View History <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {clusteringHistory.length} saved
                  </span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 animate-slide-up animation-delay-400">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Clustering</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                    Automatic K-means clustering with optimal cluster count detection using elbow method
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Interactive Visualizations</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                    Rich charts and graphs to understand customer segments and cluster characteristics
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Export & History</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                    Save analyses, export segmented data, and track your clustering experiments over time
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Layout 
        currentView={currentView}
        onViewChange={setCurrentView}
        onProfileClick={() => setShowProfile(true)}
      >
        {renderCurrentView()}
      </Layout>
      <ProfileModal 
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
}

function AppContent() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {isLogin ? (
          <AuthForm isLogin={true} onToggle={() => setIsLogin(false)} />
        ) : (
          <AuthForm isLogin={false} onToggle={() => setIsLogin(true)} />
        )}
      </>
    );
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}