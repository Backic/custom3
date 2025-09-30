import React from 'react';
import { Calendar, Users, Target, Download, Eye } from 'lucide-react';
import type { ClusterResult } from '../types';

interface ClusteringHistoryProps {
  history: ClusterResult[];
  onViewResult: (result: ClusterResult) => void;
  onBack: () => void;
}

export function ClusteringHistory({ history, onViewResult, onBack }: ClusteringHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Clustering History</h2>
            <p className="text-gray-600">View and manage your previous analyses</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis History</h3>
          <p className="text-gray-600">Start by uploading a dataset and running your first analysis</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {history.map((result) => (
            <div key={result.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{result.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {formatDate(result.created_at)}
                  </div>
                </div>
                <button
                  onClick={() => onViewResult(result)}
                  className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-lg font-bold text-blue-600">{result.k}</span>
                  </div>
                  <p className="text-xs text-gray-500 uppercase">Clusters</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="text-lg font-bold text-green-600">
                      {result.metrics.silhouetteScore.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 uppercase">Silhouette</p>
                </div>
                <div className="text-center">
                  <span className="text-lg font-bold text-purple-600">
                    {result.clusters.reduce((sum, c) => sum + c.size, 0)}
                  </span>
                  <p className="text-xs text-gray-500 uppercase">Customers</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex flex-wrap gap-2">
                  {result.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}