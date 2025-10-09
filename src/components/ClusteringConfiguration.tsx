import React, { useState } from 'react';
import { Settings, Play, Users, Target, TrendingUp } from 'lucide-react';
import type { CustomerRecord } from '../types';

interface ClusteringConfigurationProps {
  data: CustomerRecord[];
  onRunClustering: (config: ClusteringConfig) => void;
  onRunRFM: (config: RFMConfig) => void;
  onBack: () => void;
}

export interface ClusteringConfig {
  k: number;
  isAutoK: boolean;
  selectedFeatures: string[];
  analysisType: 'clustering' | 'rfm';
}

export interface RFMConfig {
  recencyField: string;
  frequencyField: string;
  monetaryField: string;
  customerIdField: string;
}

export function ClusteringConfiguration({ data, onRunClustering, onRunRFM, onBack }: ClusteringConfigurationProps) {
  const [k, setK] = useState(3);
  const [isAutoK, setIsAutoK] = useState(true);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [analysisType, setAnalysisType] = useState<'clustering' | 'rfm'>('clustering');
  
  // RFM Configuration
  const [rfmConfig, setRfmConfig] = useState<RFMConfig>({
    recencyField: 'Recency_Days',
    frequencyField: 'Purchase_Frequency',
    monetaryField: 'Total_Amount',
    customerIdField: 'Customer_ID'
  });

  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  
  // Helper function to check if field is numeric
  const isNumeric = (header: string) => {
    const value = data[0]?.[header];
    return typeof value === 'number' || !isNaN(parseFloat(value as string));
  };

  // Filter numeric fields for RFM configuration
  const numericFields = headers.filter(header => isNumeric(header));
  
  // Helper function to determine data type
  const getDataType = (header: string) => {
    const value = data[0]?.[header];
    if (typeof value === 'number') return 'Numeric';
    if (!isNaN(parseFloat(value as string))) return 'Numeric';
    if (typeof value === 'string') return 'Text';
    return 'Other';
  };

  // Categorize ALL fields (not just numeric)
  const demographicFields = headers.filter(header => 
    ['age', 'gender', 'marital_status', 'education', 'occupation', 'location', 'region', 'income', 'city', 'state', 'country'].some(demo => 
      header.toLowerCase().includes(demo)
    )
  );
  
  const transactionalFields = headers.filter(header => 
    ['purchase', 'spending', 'amount', 'frequency', 'recency', 'total', 'order', 'transaction', 'revenue', 'sales', 'price', 'cost'].some(trans => 
      header.toLowerCase().includes(trans)
    )
  );
  
  const identifierFields = headers.filter(header => 
    ['id', 'customer_id', 'user_id', 'account', 'number', 'code'].some(id => 
      header.toLowerCase().includes(id)
    )
  );

  // Get remaining fields that don't fit other categories
  const otherFields = headers.filter(header => 
    !demographicFields.includes(header) && 
    !transactionalFields.includes(header) && 
    !identifierFields.includes(header)
  );

  React.useEffect(() => {
    // Clear selected features when analysis type changes
    if (analysisType === 'clustering') {
      setSelectedFeatures([]);
    }
  }, [data, analysisType]);

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleRunAnalysis = () => {
    if (analysisType === 'clustering') {
      if (selectedFeatures.length < 2) {
        alert('Please select at least 2 features for clustering');
        return;
      }
      onRunClustering({
        k: isAutoK ? 0 : k,
        isAutoK,
        selectedFeatures,
        analysisType: 'clustering'
      });
    } else {
      // Validate RFM fields
      if (!rfmConfig.recencyField || !rfmConfig.frequencyField || !rfmConfig.monetaryField) {
        alert('Please select all required fields for RFM analysis');
        return;
      }
      onRunRFM(rfmConfig);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analysis Configuration</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure and run customer analysis on your data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Configuration</h2>
              </div>

              {/* Analysis Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Analysis Type
                </label>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      checked={analysisType === 'clustering'}
                      onChange={() => setAnalysisType('clustering')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">K-Means Clustering</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Group customers by behavior patterns</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      checked={analysisType === 'rfm'}
                      onChange={() => setAnalysisType('rfm')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">RFM Analysis</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Recency, Frequency, Monetary segmentation</p>
                    </div>
                  </label>
                </div>
              </div>

              {analysisType === 'clustering' ? (
                <>
                  {/* Number of Clusters */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Number of Clusters
                    </label>
                    
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={isAutoK}
                          onChange={() => setIsAutoK(true)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Auto (Optimal K)</span>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          checked={!isAutoK}
                          onChange={() => setIsAutoK(false)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Manual</span>
                      </label>
                    </div>

                    {!isAutoK && (
                      <div className="mt-3">
                        <input
                          type="number"
                          min="2"
                          max="10"
                          value={k}
                          onChange={(e) => setK(parseInt(e.target.value) || 2)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Feature Selection */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Select Features for Clustering
                    </label>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      Choose at least 2 numeric features to perform clustering analysis. Selected features will be used to group customers into segments.
                    </p>
                    
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {/* Demographic Features */}
                      {demographicFields.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                            <span>Demographics</span>
                            <span className="text-xs text-gray-400">({demographicFields.length} fields)</span>
                          </h4>
                          {demographicFields.map((feature) => (
                            <label key={feature} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                              <input
                                type="checkbox"
                                checked={selectedFeatures.includes(feature)}
                                onChange={() => handleFeatureToggle(feature)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{feature}</span>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Sample: {data[0]?.[feature]} | Type: {getDataType(feature)}
                                  {!isNumeric(feature) && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded text-xs">
                                      Non-numeric
                                    </span>
                                  )}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Transactional Features */}
                      {transactionalFields.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                            <span>Transactional</span>
                            <span className="text-xs text-gray-400">({transactionalFields.length} fields)</span>
                          </h4>
                          {transactionalFields.map((feature) => (
                            <label key={feature} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                              <input
                                type="checkbox"
                                checked={selectedFeatures.includes(feature)}
                                onChange={() => handleFeatureToggle(feature)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{feature}</span>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Sample: {data[0]?.[feature]} | Type: {getDataType(feature)}
                                  {!isNumeric(feature) && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded text-xs">
                                      Non-numeric
                                    </span>
                                  )}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Identifier Fields */}
                      {identifierFields.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                            <span>Identifiers</span>
                            <span className="text-xs text-gray-400">({identifierFields.length} fields)</span>
                          </h4>
                          {identifierFields.map((feature) => (
                            <label key={feature} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                              <input
                                type="checkbox"
                                checked={selectedFeatures.includes(feature)}
                                onChange={() => handleFeatureToggle(feature)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{feature}</span>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Sample: {data[0]?.[feature]} | Type: {getDataType(feature)}
                                  {!isNumeric(feature) && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded text-xs">
                                      Non-numeric
                                    </span>
                                  )}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Other Fields */}
                      {otherFields.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                            <span>Other Fields</span>
                            <span className="text-xs text-gray-400">({otherFields.length} fields)</span>
                          </h4>
                          {otherFields.map((feature) => (
                            <label key={feature} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                              <input
                                type="checkbox"
                                checked={selectedFeatures.includes(feature)}
                                onChange={() => handleFeatureToggle(feature)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{feature}</span>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Sample: {data[0]?.[feature]} | Type: {getDataType(feature)}
                                  {!isNumeric(feature) && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded text-xs">
                                      Non-numeric
                                    </span>
                                  )}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {selectedFeatures.length} features selected
                        </span>
                        {selectedFeatures.length > 0 && (
                          <button
                            onClick={() => setSelectedFeatures([])}
                            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      {selectedFeatures.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {selectedFeatures.map((feature) => (
                            <span
                              key={feature}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                            >
                              {feature}
                              <button
                                onClick={() => handleFeatureToggle(feature)}
                                className="hover:text-blue-900 dark:hover:text-blue-200"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      {selectedFeatures.length < 2 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                          ⚠️ Select at least 2 features to enable clustering. Note: Non-numeric fields will be automatically encoded.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* RFM Configuration */
                <div className="mb-8 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recency Field (Days since last purchase)
                    </label>
                    <select
                      value={rfmConfig.recencyField}
                      onChange={(e) => setRfmConfig(prev => ({ ...prev, recencyField: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select field...</option>
                      {numericFields.map(field => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Frequency Field (Number of purchases)
                    </label>
                    <select
                      value={rfmConfig.frequencyField}
                      onChange={(e) => setRfmConfig(prev => ({ ...prev, frequencyField: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select field...</option>
                      {numericFields.map(field => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Monetary Field (Total amount spent)
                    </label>
                    <select
                      value={rfmConfig.monetaryField}
                      onChange={(e) => setRfmConfig(prev => ({ ...prev, monetaryField: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select field...</option>
                      {numericFields.map(field => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Customer ID Field
                    </label>
                    <select
                      value={rfmConfig.customerIdField}
                      onChange={(e) => setRfmConfig(prev => ({ ...prev, customerIdField: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select field...</option>
                      {headers.map(field => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Run Button */}
              <button
                onClick={handleRunAnalysis}
                disabled={
                  analysisType === 'clustering' 
                    ? selectedFeatures.length < 2 
                    : !rfmConfig.recencyField || !rfmConfig.frequencyField || !rfmConfig.monetaryField
                }
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-5 h-5" />
                {analysisType === 'clustering' ? 'Run Clustering' : 'Run RFM Analysis'}
              </button>
            </div>
          </div>

          {/* Ready State */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                {analysisType === 'clustering' ? (
                  <Users className="w-12 h-12 text-gray-400" />
                ) : (
                  <TrendingUp className="w-12 h-12 text-gray-400" />
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to {analysisType === 'clustering' ? 'Cluster' : 'Analyze RFM'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {analysisType === 'clustering' 
                  ? 'Configure your clustering parameters and click "Run Clustering" to begin analysis'
                  : 'Configure RFM fields and click "Run RFM Analysis" to segment customers by value'
                }
              </p>
              
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-sm">
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">{data.length}</p>
                  <p className="text-gray-500 dark:text-gray-400">Customers</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">{headers.length}</p>
                  <p className="text-gray-500 dark:text-gray-400">Total Fields</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {analysisType === 'clustering' ? selectedFeatures.length : 'RFM'}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {analysisType === 'clustering' ? 'Selected' : 'Analysis Type'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}