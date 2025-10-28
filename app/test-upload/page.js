'use client';
import { useState } from 'react';

export default function TestUpload() {
  const [result, setResult] = useState('');

  const testEnv = async () => {
    try {
      const res = await fetch('/api/test-env');
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult('Error: ' + err.message);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Upload Test</h1>
      <button 
        onClick={testEnv}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Test Environment Variables
      </button>
      <pre className="bg-gray-100 p-4 rounded">{result}</pre>
    </div>
  );
}