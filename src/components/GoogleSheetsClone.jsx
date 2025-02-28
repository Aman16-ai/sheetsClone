import React, { useState } from 'react';

const GoogleSheetsClone = () => {
  const [formula, setFormula] = useState('=SUM(A2,A3)');
  
  // Generate columns A-Z
  const columns = Array.from({ length: 15 }, (_, i) => String.fromCharCode(65 + i));
  
  // Generate rows 1-23
  const rows = Array.from({ length: 23 }, (_, i) => i + 1);
  
  // Cell data
  const cellData = {
    'A2': '56',
    'A3': '86',
    'A4': '$142.00'
  };
  
  return (
    <div className="flex flex-col h-screen bg-white">
     
      
      {/* Menu bar */}
      <div className="flex items-center px-4 py-2 border-b border-gray-300">
        <div className="w-8 h-8 bg-green-500 rounded mr-2 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
        </div>
        <div className="text-gray-700 mr-4">Untitled spreadsheet</div>
        <div className="flex space-x-4 text-gray-700 text-sm">
          <div>File</div>
          <div>Edit</div>
          <div>View</div>
          <div>Insert</div>
          <div>Format</div>
          <div>Data</div>
          <div>Tools</div>
          <div>Extensions</div>
          <div>Help</div>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center">
          <button className="p-2 mx-1 text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
          <button className="p-2 mx-1 text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </button>
          <button className="bg-blue-100 text-blue-700 rounded px-4 py-1 mx-2 flex items-center">
            Share <span className="ml-1">▼</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm">A</div>
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="flex items-center px-2 py-1 border-b border-gray-300 text-sm">
        <button className="p-1 mx-1 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        <button className="p-1 mx-1 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
        <button className="p-1 mx-1 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
        <button className="p-1 mx-1 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="6" width="12" height="12" rx="2" ry="2" />
            <path d="M9 3h6v3H9zM9 18h6v3H9zM3 9v6h3V9zM18 9v6h3V9z" />
          </svg>
        </button>
        <select className="mx-2 border border-gray-300 rounded px-1">
          <option>100%</option>
        </select>
        <button className="p-1 mx-1 text-gray-600">$</button>
        <button className="p-1 mx-1 text-gray-600">%</button>
        <button className="p-1 mx-1 text-gray-600">.0</button>
        <button className="p-1 mx-1 text-gray-600">.00</button>
        <span className="mx-1 text-gray-500">123</span>
        <select className="mx-2 border border-gray-300 rounded px-1">
          <option>Default</option>
        </select>
        <button className="p-1 mx-1 text-gray-600">−</button>
        <button className="p-1 mx-1 text-gray-600">10</button>
        <button className="p-1 mx-1 text-gray-600">+</button>
        <button className="p-1 mx-1 text-gray-600 font-bold">B</button>
        <button className="p-1 mx-1 text-gray-600 italic">I</button>
        <button className="p-1 mx-1 text-gray-600 underline">S</button>
        <div className="mx-1 border-l border-gray-300 h-6"></div>
        <button className="p-1 mx-1 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10h18" />
            <path d="M3 14h18" />
            <path d="M3 6h18" />
            <path d="M3 18h18" />
          </svg>
        </button>
      </div>
      
      {/* Formula bar */}
      <div className="flex items-center px-2 py-1 border-b border-gray-300">
        <div className="flex items-center border rounded border-gray-300 px-2 mr-2">
          <span className="text-gray-600 text-sm">A4</span>
          <span className="ml-1">▼</span>
        </div>
        <div className="px-2 mr-2">
          <span className="text-gray-600">fx</span>
        </div>
        <input 
          type="text" 
          value={formula} 
          onChange={(e) => setFormula(e.target.value)} 
          className="flex-1 border border-gray-300 rounded p-1 text-sm" 
        />
      </div>
      
      {/* Spreadsheet */}
      <div className="flex-1 overflow-auto">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className="w-10 bg-gray-100 border border-gray-300"></th>
              {columns.map(col => (
                <th key={col} className="w-24 bg-gray-100 border border-gray-300 text-center py-1 text-sm font-normal text-gray-700">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row}>
                <td className="bg-gray-100 border border-gray-300 text-center py-1 text-sm text-gray-700">{row}</td>
                {columns.map(col => {
                  const cellId = `${col}${row}`;
                  const value = cellData[cellId] || '';
                  return (
                    <td key={cellId} className={`border border-gray-300 px-2 py-1 text-sm ${cellId === 'A4' ? 'text-blue-600 border-blue-400' : ''}`}>
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Bottom bar */}
      <div className="flex items-center border-t border-gray-300 bg-gray-100 px-2 py-1">
        <button className="p-1 text-gray-600">+</button>
        <button className="p-1 mx-1 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
        <button className="bg-blue-100 text-blue-700 rounded px-3 py-1 mx-2 flex items-center">
          Sheet1 <span className="ml-1">▼</span>
        </button>
      </div>
    </div>
  );
};

export default GoogleSheetsClone;