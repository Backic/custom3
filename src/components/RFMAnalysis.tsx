import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Target, Download, ArrowLeft, Lightbulb, CheckCircle } from 'lucide-react';
import { calculateRFM, getMarketRecommendations } from '../lib/rfm';
import { generateCSV, downloadCSV } from '../lib/csv';
import { RFMConfig } from './ClusteringConfiguration';
import type { CustomerRecord, RFMAnalysis, MarketRecommendation } from '../types';

interface RFMAnalysisProps {
  data: CustomerRecord[];
  filename: string;
  rfmConfig: RFMConfig;
  onBack: () => void;
  onSaveResult: (result: any) => void;
}

export function RFMAnalysis({ data, filename, rfmConfig, onBack, onSaveResult }: RFMAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [rfmResult, setRfmResult] = useState<RFMAnalysis[] | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'];

  useEffect(() => {
    if (rfmConfig) {
      runRFMAnalysis();
    }
  }, [rfmConfig]);

  const runRFMAnalysis = async () => {
    setLoading(true);
    try {
      const result = calculateRFM(
        data,
        rfmConfig.recencyField,
        rfmConfig.frequencyField,
        rfmConfig.monetaryField,
        rfmConfig.customerIdField
      );
      setRfmResult(result);
    } catch (error) {
      alert('Error performing RFM analysis: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!rfmResult) return;

    const exportData = rfmResult.map(customer => ({
      Customer_ID: customer.customerId,
      Recency: customer.recency,
      Frequency: customer.frequency,
      Monetary: customer.monetary,
      RFM_Score: customer.rfmScore,
      Segment: customer.segment
    }));

    const csv = generateCSV(exportData);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `${filename}_rfm_analysis_${timestamp}.csv`);
  };

  const handleSaveResult = () => {
    if (!rfmResult) return;

    // Create a proper ClusterResult-like structure for RFM
    const result = {
      id: Date.now().toString(),
      user_id: 'current_user',
      dataset_id: Date.now().toString(),
      name: `${filename} - RFM Analysis`,
      k: getSegmentDistribution().length,
      features: [rfmConfig.recencyField, rfmConfig.frequencyField, rfmConfig.monetaryField],
      clusters: getSegmentDistribution().map((seg, index) => ({
        id: index,
        centroid: [],
        customers: getSegmentCustomers(seg.segment),
        size: seg.count,
        characteristics: {}
      })),
      metrics: {
        silhouetteScore: 0.8, // Default for RFM
        inertia: 0,
        optimalK: getSegmentDistribution().length
      },
      created_at: new Date().toISOString()
    };

    onSaveResult(result);
  };

  const getSegmentDistribution = () => {
    if (!rfmResult) return [];
    
    const segmentCounts = rfmResult.reduce((acc, customer) => {
      acc[customer.segment] = (acc[customer.segment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(segmentCounts).map(([segment, count]) => ({
      segment,
      count,
      percentage: ((count / rfmResult.length) * 100).toFixed(1)
    }));
  };

  const getSegmentCustomers = (segment: string) => {
    if (!rfmResult) return [];
    return rfmResult.filter(customer => customer.segment === segment);
  };

  const recommendations = getMarketRecommendations();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Running RFM Analysis...</h3>
        <p className="text-gray-600 dark:text-gray-400">Calculating customer segments</p>
      </div>
    );
  }

  if (!rfmResult) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Analysis Failed</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Unable to perform RFM analysis. Please check your configuration.
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

  const segmentDistribution = getSegmentDistribution();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">RFM Analysis Results</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Customer segmentation based on Recency, Frequency, and Monetary value
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Back
            </button>
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
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Total Customers</h3>
              <p className="text-3xl font-bold text-blue-600">{rfmResult.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Segments</h3>
              <p className="text-3xl font-bold text-green-600">{segmentDistribution.length}</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Avg Recency</h3>
              <p className="text-3xl font-bold text-purple-600">
                {(rfmResult.reduce((sum, c) => sum + c.recency, 0) / rfmResult.length).toFixed(0)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Avg Monetary</h3>
              <p className="text-3xl font-bold text-orange-600">
                ${(rfmResult.reduce((sum, c) => sum + c.monetary, 0) / rfmResult.length).toFixed(0)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segment Distribution Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Segment Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="segment" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count">
                  {segmentDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Segment Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Segment Percentage</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ segment, percentage }) => `${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {segmentDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} customers (${props.payload.percentage}%)`,
                    props.payload.segment
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Market Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Market Recommendations</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations
            .filter(rec => segmentDistribution.some(seg => seg.segment === rec.segment))
            .map((recommendation, index) => {
              const segmentData = segmentDistribution.find(seg => seg.segment === recommendation.segment);
              return (
                <div
                  key={recommendation.segment}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{recommendation.segment}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      recommendation.priority === 'High' ? 'bg-red-100 text-red-800' :
                      recommendation.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {recommendation.priority}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {recommendation.description}
                  </p>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Strategy:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{recommendation.strategy}</p>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tactics:</p>
                    <ul className="space-y-1">
                      {recommendation.tactics.slice(0, 2).map((tactic, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {tactic}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {segmentData && (
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-600">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Customers:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {segmentData.count} ({segmentData.percentage}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}