import type { CustomerRecord } from '../types';

export function parseCSV(csvText: string): CustomerRecord[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const records: CustomerRecord[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const record: CustomerRecord = {};
      headers.forEach((header, index) => {
        const value = values[index];
        // Try to parse as number, otherwise keep as string
        const numValue = parseFloat(value);
        record[header] = isNaN(numValue) ? value : numValue;
      });
      records.push(record);
    }
  }
  
  return records;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

export function generateCSV(records: CustomerRecord[]): string {
  if (records.length === 0) return '';
  
  const headers = Object.keys(records[0]);
  const csvLines = [headers.join(',')];
  
  records.forEach(record => {
    const values = headers.map(header => {
      const value = record[header];
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains comma or quote
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvLines.push(values.join(','));
  });
  
  return csvLines.join('\n');
}

export function downloadCSV(data: string, filename: string) {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Sample dataset for testing
export const sampleCustomerData = `Customer_ID,Age,Income,Spending_Score,Years_Customer,Region
1,23,15000,39,1,North,Male,Single,College,Manager,5,2,1200,Electronics
2,23,15000,81,1,South,Female,Single,High School,Sales,12,8,2400,Fashion
3,27,16000,6,2,East,Male,Married,Graduate,Engineer,3,1,300,Electronics
4,27,16000,77,2,West,Female,Married,College,Teacher,15,10,3500,Home
5,39,17000,40,3,North,Male,Married,Graduate,Manager,8,4,1800,Electronics
6,39,17000,76,3,South,Female,Single,College,Designer,18,12,4200,Fashion
7,43,18000,6,4,East,Male,Married,High School,Technician,2,1,200,Electronics
8,43,18000,94,4,West,Female,Married,Graduate,Doctor,25,18,6800,Health
9,28,19000,3,1,North,Male,Single,College,Developer,4,2,800,Electronics
10,28,19000,72,1,South,Female,Single,Graduate,Lawyer,16,11,4000,Fashion
11,35,20000,14,2,East,Male,Married,College,Manager,6,3,1400,Home
12,35,20000,99,2,West,Female,Married,Graduate,Executive,22,15,5500,Fashion
13,25,21000,35,3,North,Male,Single,High School,Sales,9,5,2100,Electronics
14,25,21000,61,3,South,Female,Single,College,Designer,14,9,3200,Fashion
15,32,22000,7,4,East,Male,Married,Graduate,Engineer,3,2,600,Electronics
16,32,22000,87,4,West,Female,Married,College,Manager,20,13,4800,Home
17,25,23000,20,1,North,Male,Single,College,Developer,7,4,1600,Electronics
18,25,23000,73,1,South,Female,Single,Graduate,Consultant,17,11,3800,Fashion
19,30,24000,5,2,East,Male,Married,High School,Technician,2,1,400,Electronics
20,30,24000,92,2,West,Female,Married,Graduate,Doctor,24,16,6200,Health
21,28,25000,47,3,North,Male,Single,College,Sales,11,6,2800,Electronics
22,28,25000,75,3,South,Female,Single,Graduate,Lawyer,19,12,4500,Fashion
23,40,26000,42,4,East,Male,Married,College,Manager,10,5,2400,Home
24,40,26000,91,4,West,Female,Married,Graduate,Executive,23,15,5800,Fashion
25,32,27000,20,1,North,Male,Single,High School,Sales,8,4,1800,Electronics
26,32,27000,84,1,South,Female,Single,College,Designer,21,13,4900,Fashion
27,24,28000,17,2,East,Male,Married,Graduate,Engineer,6,3,1200,Electronics
28,24,28000,73,2,West,Female,Married,College,Teacher,18,11,3600,Home
29,25,29000,11,3,North,Male,Single,College,Developer,5,3,1000,Electronics
30,25,29000,61,3,South,Female,Single,Graduate,Consultant,15,9,3400,Fashion`;

// Updated header to include new demographic and transactional fields
export const sampleCustomerDataHeaders = [
  'Customer_ID', 'Age', 'Income', 'Spending_Score', 'Years_Customer', 'Region',
  'Gender', 'Marital_Status', 'Education', 'Occupation', 'Purchase_Frequency',
  'Recency_Days', 'Total_Amount', 'Product_Category'
];