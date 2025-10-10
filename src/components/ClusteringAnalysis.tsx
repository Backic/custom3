import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line, Cell } from 'recharts';
import { PieChart, Pie } from 'recharts';
import { TrendingUp, Users, Target, Download, ArrowLeft, Eye } from 'lucide-react';
import { performClustering } from '../lib/clustering';
import { generateCSV, downloadCSV } from '../lib/csv';
import { ClusteringConfig } from './ClusteringConfiguration';
import type { CustomerRecord, ClusterResult, ClusterData } from '../types';

interface ClusteringAnalysisProps {
  data: CustomerRecord[];
  filename: string;
  clusteringConfig: ClusteringConfig | null;
  onBack: () => void;
  onSaveResult: (result: ClusterResult) => void;
}

export function ClusteringAnalysis({ data, filename, clusteringConfig, onBack, onSaveResult }: ClusteringAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [clusterResult, setClusterResult] = useState<{
    clusters: ClusterData[];
    metrics: any;
    elbowData: any[];
    features: string[];
  } | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<ClusterData | null>(null);

  const features = clusteringConfig?.selectedFeatures || [];

  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

  useEffect(() => {
    if (clusteringConfig && features.length >= 2) {
      runClustering();
    }
  }, [clusteringConfig]);

  const runClustering = async () => {
    if (!clusteringConfig || features.length < 2) {
      alert('Need at least 2 numeric columns for clustering');
      return;
    }

    setLoading(true);
    try {
      const k = clusteringConfig.isAutoK ? undefined : clusteringConfig.k;
      const result = performClustering(data, features, k);
      setClusterResult({
        ...result,
        features: features
      });
    } catch (error) {
      alert('Error performing clustering: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!clusterResult) return;

    const clusteredData = data.map(record => {
      const cluster = clusterResult.clusters.find(c => 
        c.customers.some(customer => 
          Object.keys(customer).every(key => customer[key] === record[key])
        )
      );
      return {
        ...record,
        Cluster: cluster ? `Cluster ${cluster.id + 1}` : 'Unknown'
      };
    });

    const csv = generateCSV(clusteredData);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `${filename}_clustered_${timestamp}.csv`);
  };

  const handleExportInsights = () => {
    if (!clusterResult) return;

    // Create cluster insights summary
    const insightsData = clusterResult.clusters.map((cluster, index) => {
      const recommendations = getClusterRecommendations(cluster, index);
      
      // Create a flat object with all characteristics
      const characteristicsFlat = Object.entries(cluster.characteristics).reduce((acc, [key, value]) => {
        acc[`Avg_${key}`] = value.toFixed(2);
        return acc;
      }, {} as Record<string, string>);

      return {
        Cluster_ID: `Cluster ${cluster.id + 1}`,
        Customer_Count: cluster.size,
        Percentage: ((cluster.size / data.length) * 100).toFixed(1) + '%',
        ...characteristicsFlat,
        Priority: recommendations.priority,
        Description: recommendations.description,
        Strategy: recommendations.strategy,
        Key_Tactic_1: recommendations.tactics[0] || '',
        Key_Tactic_2: recommendations.tactics[1] || '',
        Key_Tactic_3: recommendations.tactics[2] || ''
      };
    });

    // Add overall analysis summary
    const summaryData = [{
      Analysis_Type: 'K-Means Clustering',
      Total_Customers: data.length,
      Number_of_Clusters: clusterResult.clusters.length,
      Features_Used: clusterResult.features.join(', '),
      Silhouette_Score: clusterResult.metrics.silhouetteScore.toFixed(3),
      Optimal_K: clusterResult.metrics.optimalK,
      Analysis_Date: new Date().toLocaleDateString(),
      Dataset_Name: filename
    }];

    // Combine summary and insights
    const exportData = [
      ...summaryData,
      {}, // Empty row for separation
      ...insightsData
    ];

    const csv = generateCSV(exportData);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `${filename}_cluster_insights_${timestamp}.csv`);
  };

  const handleSaveResult = () => {
    if (!clusterResult) return;

    const result: ClusterResult = {
      id: Date.now().toString(),
      user_id: 'current_user',
      dataset_id: Date.now().toString(),
      name: `${filename} - ${clusterResult.clusters.length} Clusters`,
      k: clusterResult.clusters.length,
      features: clusterResult.features,
      clusters: clusterResult.clusters,
      metrics: clusterResult.metrics,
      created_at: new Date().toISOString()
    };

    onSaveResult(result);
  };

  if (!clusteringConfig || features.length < 2) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Configuration Required</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please configure clustering parameters before running analysis.
        </p>
        <button
          onClick={onBack}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Configuration
        </button>
      </div>
    );
  }

  if (selectedCluster) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cluster {selectedCluster.id + 1} Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{selectedCluster.customers.length} customers</p>
            </div>
            <button
              onClick={() => setSelectedCluster(null)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Analysis
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {Object.keys(selectedCluster.customers[0] || {}).map(header => (
                    <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {selectedCluster.customers.map((customer, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {Object.entries(customer).map(([key, value]) => (
                      <td key={key} className="px-4 py-3 whitespace-nowrap text-sm">
                        {typeof value === 'number' ? (
                          <span className="font-mono text-blue-900">{value.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-900 dark:text-white">{String(value)}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Clustering Analysis</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Analyzing {data.length} customers using {features.length} features
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Back
            </button>
            {clusterResult && (
              <>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={handleSaveResult}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Analysis
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Running K-Means Analysis...</h3>
          <p className="text-gray-600 dark:text-gray-400">This may take a few moments</p>
        </div>
      ) : clusterResult ? (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Clusters Found</h3>
                  <p className="text-3xl font-bold text-blue-600">{clusterResult.clusters.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Silhouette Score</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {clusterResult.metrics.silhouetteScore.toFixed(3)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Optimal K</h3>
                  <p className="text-3xl font-bold text-purple-600">{clusterResult.metrics.optimalK}</p>
                </div>
                <Target className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Elbow Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Elbow Method - Optimal K Selection</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clusterResult.elbowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="k" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="inertia" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cluster Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cluster Size Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clusterResult.clusters.map(c => ({ name: `Cluster ${c.id + 1}`, size: c.size }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="size">
                      {clusterResult.clusters.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cluster Distribution Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cluster Percentage</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clusterResult.clusters.map(c => ({
                        name: `Cluster ${c.id + 1}`,
                        value: c.size,
                        percentage: ((c.size / data.length) * 100).toFixed(1)
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percentage }) => `${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {clusterResult.clusters.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value} customers (${props.payload.percentage}%)`,
                        props.payload.name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Feature Scatter Plot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feature Scatter Plot */}
            {features.length >= 2 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Cluster Visualization ({features[0]} vs {features[1]})
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid />
                      <XAxis dataKey="x" name={features[0]} />
                      <YAxis dataKey="y" name={features[1]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      {clusterResult.clusters.map((cluster, index) => (
                        <Scatter
                          key={`cluster-${index}`}
                          name={`Cluster ${cluster.id + 1}`}
                          data={cluster.customers.map(customer => ({
                            x: customer[features[0]],
                            y: customer[features[1]]
                          }))}
                          fill={colors[index % colors.length]}
                        />
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Cluster Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Cluster Insights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clusterResult.clusters.map((cluster, index) => (
                <div
                  key={cluster.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCluster(cluster)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold" style={{ color: colors[index % colors.length] }}>
                      Cluster {cluster.id + 1}
                    </h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{cluster.size} customers</span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(cluster.characteristics).map(([feature, value]) => (
                      <div key={feature} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{feature}:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{value.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                    <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                      <Eye className="w-4 h-4" />
                      View Customers
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400">💡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Market Recommendations</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clusterResult.clusters.map((cluster, index) => {
                const recommendations = getClusterRecommendations(cluster, index);
                return (
                  <div
                    key={cluster.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold" style={{ color: colors[index % colors.length] }}>
                        Cluster {cluster.id + 1} Strategy
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        recommendations.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        recommendations.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {recommendations.priority}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {recommendations.description}
                    </p>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Strategy:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{recommendations.strategy}</p>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Key Actions:</p>
                      <ul className="space-y-1">
                        {recommendations.tactics.slice(0, 3).map((tactic, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            {tactic}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-600">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Customers:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{cluster.size}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function getClusterRecommendations(cluster: ClusterData, index: number) {
  // Analyze cluster characteristics to provide recommendations
  const characteristics = cluster.characteristics;
  const avgValues = Object.values(characteristics);
  const avgSum = avgValues.reduce((sum, val) => sum + val, 0) / avgValues.length;
  
  // Determine cluster type based on characteristics
  if (avgSum > 1000) {
    return {
      priority: 'High' as const,
      description: 'High-value customers with strong engagement metrics',
      strategy: 'Retention and premium service focus',
      tactics: [
        'Offer exclusive products and early access',
        'Implement VIP loyalty programs',
        'Provide dedicated customer support',
        'Upsell premium services'
      ]
    };
  } else if (avgSum > 500) {
    return {
      priority: 'Medium' as const,
      description: 'Mid-tier customers with growth potential',
      strategy: 'Engagement and value increase',
      tactics: [
        'Send targeted promotional campaigns',
        'Offer loyalty rewards and incentives',
        'Recommend complementary products',
        'Create personalized experiences'
      ]
    };
  } else if (avgSum > 100) {
    return {
      priority: 'Medium' as const,
      description: 'Emerging customers requiring nurturing',
      strategy: 'Activation and engagement building',
      tactics: [
        'Send welcome series and onboarding',
        'Provide educational content',
        'Offer first-purchase incentives',
        'Collect feedback and preferences'
      ]
    };
  } else {
    return {
      priority: 'Low' as const,
      description: 'Low-engagement customers needing reactivation',
      strategy: 'Win-back and reactivation campaigns',
      tactics: [
        'Send reactivation email campaigns',
        'Offer significant discounts',
        'Survey for feedback and issues',
        'Use different communication channels'
      ]
    };
  }
}