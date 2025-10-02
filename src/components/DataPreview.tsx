import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, Eye, Download } from 'lucide-react';
import type { CustomerRecord } from '../types';

interface DataPreviewProps {
  data: CustomerRecord[];
  filename: string;
  onAnalyze: () => void;
  onBack: () => void;
}

export function DataPreview({ data, filename, onAnalyze, onBack }: DataPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;
  
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);
  
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  const numericColumns = headers.filter(header => 
    typeof data[0]?.[header] === 'number' || 
    !isNaN(parseFloat(data[0]?.[header] as string))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Dataset Preview</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {filename}
              </span>
              <span>{data.length} rows</span>
              <span>{headers.length} columns</span>
              <span>{numericColumns.length} numeric columns</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={onAnalyze}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              Start Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                  >
                    {header}
                    {numericColumns.includes(header) && (
                      <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm">
                      {typeof row[header] === 'number' ? (
                        <span className="font-mono text-blue-900">
                          {row[header].toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-900">{String(row[header])}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} rows
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Column Types Legend */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-gray-700">Numeric columns (will be used for clustering)</span>
          </div>
          <div className="text-gray-600">
            Non-numeric columns will be excluded from clustering analysis
          </div>
        </div>
      </div>
    </div>
  );
}