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
  const [pageInput, setPageInput] = useState('');
  const [isEditingPage, setIsEditingPage] = useState(false);
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

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
    setPageInput('');
    setIsEditingPage(false);
  };

  const handlePageClick = () => {
    setIsEditingPage(true);
    setPageInput(currentPage.toString());
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Dataset Preview</h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="truncate max-w-32 sm:max-w-none">{filename}</span>
              </span>
              <span>{data.length} rows</span>
              <span>{headers.length} columns</span>
              <span>{numericColumns.length} numeric columns</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onBack}
              className="px-3 sm:px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              Back
            </button>
            <button
              onClick={onAnalyze}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 text-sm"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Start Analysis</span>
              <span className="sm:hidden">Analyze</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-fade-in animation-delay-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b dark:border-gray-600"
                  >
                    <span className="truncate block max-w-24 sm:max-w-none">{header}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {currentData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      {typeof row[header] === 'number' ? (
                        <span className="font-mono text-blue-900 dark:text-blue-400">
                          {row[header].toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-900 dark:text-white truncate block max-w-24 sm:max-w-none">{String(row[header])}</span>
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
          <div className="bg-gray-50 dark:bg-gray-700 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t dark:border-gray-600 gap-4 sm:gap-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} rows
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {isEditingPage ? (
                <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Page</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onBlur={() => {
                      setIsEditingPage(false);
                      setPageInput('');
                    }}
                    className="w-12 px-1 py-1 text-xs sm:text-sm text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">of {totalPages}</span>
                </form>
              ) : (
                <span 
                  className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  onClick={handlePageClick}
                  title="Click to enter page number"
                >
                  Page {currentPage} of {totalPages}
                </span>
              )}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}