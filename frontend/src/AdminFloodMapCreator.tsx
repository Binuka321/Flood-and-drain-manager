import React, { useState, useRef } from 'react';

interface AdminFloodMapCreatorProps {
  token: string;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AdminFloodMapCreator({ token }: AdminFloodMapCreatorProps) {
  const [district, setDistrict] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [monthValues, setMonthValues] = useState<string[]>(Array(12).fill(''));
  const [status, setStatus] = useState('');
  const [pdfStatus, setPdfStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

  const handleMonthChange = (index: number, value: string) => {
    const updated = [...monthValues];
    updated[index] = value;
    setMonthValues(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const monthlyData = monthValues.map((value, index) => {
      const avgRainfall = parseFloat(value);
      if (value && Number.isNaN(avgRainfall)) {
        throw new Error(`Month ${monthNames[index]} needs a valid number`);
      }
      return { month: monthNames[index], avgRainfall: avgRainfall || 0 };
    });

    // Check if at least some rainfall data is provided
    const hasRainfallData = monthlyData.some(m => m.avgRainfall > 0);
    if (!hasRainfallData) {
      setStatus('Please provide at least some monthly rainfall data');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/rainfall/admin/add-district`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          district,
          latitude: Number(latitude),
          longitude: Number(longitude),
          monthlyData
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus(`Error: ${data.error || data.message || 'Could not save'}`);
        return;
      }

      setStatus(`District ${data.district.district} created successfully`);
      setDistrict('');
      setLatitude('');
      setLongitude('');
      setMonthValues(Array(12).fill(''));
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'network'}`);
    }
  };

  const handlePdfUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileInputRef.current?.files?.[0]) {
      setPdfStatus('Please select a PDF file first');
      return;
    }

    const file = fileInputRef.current.files[0];
    if (file.type !== 'application/pdf') {
      setPdfStatus('Only PDF files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      setPdfStatus('Processing PDF...');
      const res = await fetch(`${API_BASE}/rainfall/admin/upload-pdf`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        setPdfStatus(`Error: ${data.error || 'Could not process PDF'}`);
        return;
      }

      // Pre-fill form with extracted data
      const { extractedData } = data;
      setDistrict(extractedData.district || '');
      setLatitude(extractedData.latitude?.toString() || '');
      setLongitude(extractedData.longitude?.toString() || '');

      const newMonthValues = Array(12).fill('');
      extractedData.monthlyData?.forEach((monthData: any, index: number) => {
        if (index < 12) {
          newMonthValues[index] = monthData.avgRainfall?.toString() || '';
        }
      });
      setMonthValues(newMonthValues);

      setPdfStatus(`PDF processed successfully. Found ${extractedData.monthlyData?.length || 0} months of data. Form pre-filled with extracted data.`);
    } catch (error) {
      setPdfStatus(`Error: ${error instanceof Error ? error.message : 'network'}`);
    }
  };

  return (
    <div className="bg-slate-900/80 p-6 rounded-xl shadow-2xl mt-4 text-white max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-3">Admin Flood Map Data Builder</h2>
      <p className="mb-3 text-sm text-gray-300">Only admins can access this section. Fill district and monthly rainfall averages to add a new flood map district.</p>

      {/* PDF Upload Section */}
      <div className="bg-slate-800/50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Upload PDF to Extract Data</h3>
        <p className="text-sm text-gray-400 mb-3">Upload a PDF containing district rainfall data to automatically extract and pre-fill the form.</p>
        <form onSubmit={handlePdfUpload} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">PDF File</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="w-full p-2 rounded bg-slate-700 border border-cyan-500/30 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-cyan-600 file:text-white hover:file:bg-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 font-semibold"
          >
            Extract Data
          </button>
        </form>
        {pdfStatus && <p className="mt-3 text-sm text-orange-300">{pdfStatus}</p>}
      </div>

      {/* Manual Form Section */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <input value={district} onChange={e => setDistrict(e.target.value)} required placeholder="District" className="p-2 rounded bg-slate-800 border border-cyan-500" />
          <input value={latitude} onChange={e => setLatitude(e.target.value)} required placeholder="Latitude" type="number" step="any" className="p-2 rounded bg-slate-800 border border-cyan-500" />
          <input value={longitude} onChange={e => setLongitude(e.target.value)} required placeholder="Longitude" type="number" step="any" className="p-2 rounded bg-slate-800 border border-cyan-500" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {monthNames.map((m, idx) => (
            <label key={m} className="flex flex-col text-sm text-gray-200">
              <span>{m}</span>
              <input
                value={monthValues[idx]}
                onChange={e => handleMonthChange(idx, e.target.value)}
                placeholder="avg mm (optional)"
                type="number"
                step="any"
                className="p-1 rounded bg-slate-800 border border-cyan-500"
              />
            </label>
          ))}
        </div>

        <button type="submit" className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 font-semibold">Create District Entry</button>
      </form>
      {status && <p className="mt-3 text-sm text-orange-300">{status}</p>}
    </div>
  );
}
