import React, { useState, useRef } from 'react';
import { Upload, FileText, Download } from 'lucide-react';
import { parseCSV, sampleCustomerData } from '../lib/csv';
import type { CustomerRecord } from '../types';

interface DataUploadProps {
  onDataUploaded: (data: CustomerRecord[], filename: string) => void;
}

export function DataUpload({ onDataUploaded }: DataUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      try {
        const data = parseCSV(csvText);
        if (data.length === 0) {
          alert('No valid data found in the CSV file.');
          return;
        }
        onDataUploaded(data, file.name);
      } catch (error) {
        alert('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.endsWith('.csv'));
    
    if (csvFile) {
      handleFileUpload(csvFile);
    } else {
      alert('Please upload a CSV file.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const loadSampleData = () => {
    const data = parseCSV(sampleCustomerData);
    onDataUploaded(data, 'sample_customer_data.csv');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 animate-slide-up">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
          <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Upload Customer Data</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Upload a CSV file to begin customer segmentation analysis</p>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all ${
          dragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
          Drop your CSV file here, or click to browse
        </p>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm sm:text-base">
          Supported format: CSV files with customer data
        </p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-blue-700 transition-all transform hover:scale-105 text-sm sm:text-base"
        >
          Choose File
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Try Sample Data</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Use our sample customer dataset to explore the features</p>
          </div>
          <button
            onClick={loadSampleData}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Load Sample</span>
            <span className="sm:hidden">Sample</span>
          </button>
        </div>
      </div>
    </div>
  );
}