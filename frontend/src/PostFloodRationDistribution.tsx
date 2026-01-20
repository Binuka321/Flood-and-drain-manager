import React, { useEffect, useState } from "react";

// Small inline icon fallbacks to avoid adding a dependency on `react-icons`
const FaPlus = (props: any) => <span {...props}>➕</span>;
const FaTrash = (props: any) => <span {...props}>🗑️</span>;
const FaDownload = (props: any) => <span {...props}>⬇️</span>;
const FaChartBar = (props: any) => <span {...props}>📊</span>;
const FaMapMarkerAlt = (props: any) => <span {...props}>📍</span>;
const FaCalendarAlt = (props: any) => <span {...props}>📅</span>;
const FaUsers = (props: any) => <span {...props}>👥</span>;
const FaBox = (props: any) => <span {...props}>📦</span>;
const FaFileExport = (props: any) => <span {...props}>📤</span>;
const FaFilter = (props: any) => <span {...props}>🔎</span>;
const FaSearch = (props: any) => <span {...props}>🔍</span>;
const FaEdit = (props: any) => <span {...props}>✏️</span>;
const FaEye = (props: any) => <span {...props}>👁️</span>;
const FaPrint = (props: any) => <span {...props}>🖨️</span>;
const FaShareAlt = (props: any) => <span {...props}>🔗</span>;
const FaExclamationTriangle = (props: any) => <span {...props}>⚠️</span>;
const FaCheckCircle = (props: any) => <span {...props}>✅</span>;
const FaTruck = (props: any) => <span {...props}>🚚</span>;

interface Entry {
  id: string;
  district: string;
  households: number;
  rationsPerHousehold: number;
  totalRations: number;
  date: string;
  status: 'pending' | 'distributed' | 'in-transit';
  priority: 'low' | 'medium' | 'high';
  deliveryMethod: 'truck' | 'boat' | 'helicopter' | 'hand-delivery';
  notes?: string;
}

export default function PostFloodRationDistribution(): JSX.Element {
  const [districts, setDistricts] = useState<string[]>([]);
  const [district, setDistrict] = useState<string>("");
  const [households, setHouseholds] = useState<number>(0);
  const [rationsPerHousehold, setRationsPerHousehold] = useState<number>(3);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<'pending' | 'distributed' | 'in-transit'>('pending');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [deliveryMethod, setDeliveryMethod] = useState<'truck' | 'boat' | 'helicopter' | 'hand-delivery'>('truck');
  const [notes, setNotes] = useState<string>("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [stats, setStats] = useState({
    totalDistributions: 0,
    totalHouseholds: 0,
    totalRations: 0,
    pendingDistributions: 0,
    highPriority: 0
  });

  useEffect(() => {
    // Load districts from geojson or fallback
    const loadDistricts = async () => {
      try {
        const response = await fetch("/src/data/sri_lanka_districts.geojson");
        const data = await response.json();
        const names = new Set<string>();
        if (data && data.features) {
          data.features.forEach((f: any) => {
            const name = f?.properties?.NAME_2 || f?.properties?.name || f?.properties?.NAME;
            if (name) names.add(name);
          });
        }
        const list = Array.from(names).sort();
        setDistricts(list);
        if (list.length && !district) setDistrict(list[0]);
      } catch {
        const fallback = ["Colombo", "Galle", "Kandy", "Matara", "Hambantota", "Gampaha", "Kalutara", "Kegalle", "Ratnapura"];
        setDistricts(fallback);
        if (!district) setDistrict(fallback[0]);
      }
    };

    loadDistricts();

    // Load saved entries
    const raw = localStorage.getItem("ration_entries");
    if (raw) {
      try {
        const savedEntries = JSON.parse(raw);
        setEntries(savedEntries);
      } catch (e) {
        console.error("Error loading saved entries:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ration_entries", JSON.stringify(entries));
    
    // Calculate statistics
    const totalDistributions = entries.length;
    const totalHouseholds = entries.reduce((s, e) => s + e.households, 0);
    const totalRations = entries.reduce((s, e) => s + e.totalRations, 0);
    const pendingDistributions = entries.filter(e => e.status === 'pending').length;
    const highPriority = entries.filter(e => e.priority === 'high').length;
    
    setStats({
      totalDistributions,
      totalHouseholds,
      totalRations,
      pendingDistributions,
      highPriority
    });
  }, [entries]);

  const addEntry = () => {
    if (!district) {
      alert("Please select a district");
      return;
    }
    if (households <= 0) {
      alert("Please enter a valid number of households");
      return;
    }

    const entry: Entry = {
      id: String(Date.now() + Math.random()),
      district,
      households,
      rationsPerHousehold,
      totalRations: households * rationsPerHousehold,
      date,
      status,
      priority,
      deliveryMethod,
      notes: notes || undefined,
    };
    
    setEntries((s) => [entry, ...s]);

    // Reset form
    setHouseholds(0);
    setNotes("");
    setStatus('pending');
    setPriority('medium');
    setDeliveryMethod('truck');
  };

  const removeEntry = (id: string) => {
    setEntries((s) => s.filter((e) => e.id !== id));
  };

  const updateEntryStatus = (id: string, newStatus: Entry['status']) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, status: newStatus } : entry
    ));
  };

  const clearAll = () => {
    if (!confirm("Are you sure you want to clear all recorded distributions? This action cannot be undone.")) return;
    setEntries([]);
  };

  const exportCSV = () => {
    if (!entries.length) {
      alert("No data to export");
      return;
    }
    
    const header = ["ID", "District", "Households", "Rations/HH", "Total Rations", "Date", "Status", "Priority", "Delivery Method", "Notes"];
    const rows = entries.map((e) => [
      e.id,
      e.district,
      String(e.households),
      String(e.rationsPerHousehold),
      String(e.totalRations),
      e.date,
      e.status,
      e.priority,
      e.deliveryMethod,
      (e.notes || "")
    ]);
    
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flood_ration_distributions_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    const report = `
      POST-FLOOD RATION DISTRIBUTION REPORT
      Generated: ${new Date().toLocaleDateString()}
      ===========================================
      
      SUMMARY STATISTICS:
      - Total Distributions: ${stats.totalDistributions}
      - Total Households Assisted: ${stats.totalHouseholds}
      - Total Rations Distributed: ${stats.totalRations}
      - Pending Distributions: ${stats.pendingDistributions}
      - High Priority Cases: ${stats.highPriority}
      
      DETAILED ENTRIES:
      ${entries.map(entry => `
      • ${entry.date} - ${entry.district}
        Households: ${entry.households}
        Rations: ${entry.totalRations}
        Status: ${entry.status.toUpperCase()}
        Priority: ${entry.priority.toUpperCase()}
        Delivery: ${entry.deliveryMethod}
        ${entry.notes ? `Notes: ${entry.notes}` : ''}
      `).join('\n')}
    `;
    
    alert(report);
  };

  // Filter entries based on search and filters
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || entry.status === filterStatus;
    const matchesPriority = filterPriority === "all" || entry.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: Entry['status']) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-transit': return 'bg-blue-100 text-blue-800';
      case 'distributed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Entry['priority']) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryIcon = (method: Entry['deliveryMethod']) => {
    switch(method) {
      case 'truck': return <FaTruck className="inline mr-1" />;
      case 'boat': return '🚤';
      case 'helicopter': return '🚁';
      case 'hand-delivery': return '👤';
      default: return '📦';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 text-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Post-Flood Ration Distribution System
              </h1>
              <p className="text-gray-600">
                Track and manage ration distribution to affected areas
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button 
                onClick={exportCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition duration-200"
              >
                <FaDownload className="mr-2" /> Export CSV
              </button>
              <button 
                onClick={generateReport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition duration-200"
              >
                <FaFileExport className="mr-2" /> Generate Report
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Distributions</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalDistributions}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaChartBar className="text-blue-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Households Assisted</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalHouseholds}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <FaUsers className="text-green-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Rations</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalRations}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <FaBox className="text-purple-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.pendingDistributions}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <FaExclamationTriangle className="text-yellow-600 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">High Priority</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.highPriority}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <FaExclamationTriangle className="text-red-600 text-xl" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Entry Form */}
          <div className="lg:col-span-2">
            {/* Distribution Entry Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaPlus className="mr-3 text-blue-600" /> Record New Distribution
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaMapMarkerAlt className="inline mr-2" /> District *
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    value={district} 
                    onChange={(e) => setDistrict(e.target.value)}
                  >
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaUsers className="inline mr-2" /> Number of Households *
                  </label>
                  <input 
                    type="number" 
                    min={0}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    value={households} 
                    onChange={(e) => setHouseholds(Number(e.target.value))}
                    placeholder="Enter number of households"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaBox className="inline mr-2" /> Rations per Household
                  </label>
                  <input 
                    type="number" 
                    min={1}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    value={rationsPerHousehold} 
                    onChange={(e) => setRationsPerHousehold(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaCalendarAlt className="inline mr-2" /> Distribution Date
                  </label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    value={status} 
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-transit">In Transit</option>
                    <option value="distributed">Distributed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Delivery Method
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    value={deliveryMethod} 
                    onChange={(e) => setDeliveryMethod(e.target.value as any)}
                  >
                    <option value="truck">Truck Delivery</option>
                    <option value="boat">Boat Delivery</option>
                    <option value="helicopter">Helicopter Delivery</option>
                    <option value="hand-delivery">Hand Delivery</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Enter any additional notes or special instructions..."
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button 
                  onClick={addEntry}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition duration-200 shadow-lg hover:shadow-xl"
                >
                  <FaPlus className="mr-2" /> Add Distribution Record
                </button>
                <button 
                  onClick={clearAll}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition duration-200"
                >
                  <FaTrash className="mr-2" /> Clear All Records
                </button>
              </div>
            </div>

            {/* Distribution List */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                  Distribution Records ({filteredEntries.length})
                </h2>
                
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search districts or notes..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <select 
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in-transit">In Transit</option>
                      <option value="distributed">Distributed</option>
                    </select>
                    <select 
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                    >
                      <option value="all">All Priority</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredEntries.length === 0 ? (
                <div className="text-center py-12">
                  <FaBox className="text-5xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No distribution records found</p>
                  <p className="text-gray-400 mt-2">Start by adding a new distribution record above</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">District</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Households</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rations</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Priority</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Delivery</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50 transition duration-150">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{entry.date}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="text-blue-500 mr-2" />
                              <span className="font-medium">{entry.district}</span>
                            </div>
                            {entry.notes && (
                              <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                {entry.notes}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-lg font-bold text-gray-800">{entry.households}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-lg font-bold text-blue-600">{entry.totalRations}</div>
                            <div className="text-xs text-gray-500">{entry.rationsPerHousehold} per HH</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                              {entry.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(entry.priority)}`}>
                              {entry.priority.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              {getDeliveryIcon(entry.deliveryMethod)}
                              <span className="ml-2 text-sm capitalize">{entry.deliveryMethod.replace('-', ' ')}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateEntryStatus(entry.id, 'distributed')}
                                className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                                title="Mark as Distributed"
                              >
                                <FaCheckCircle />
                              </button>
                              <button
                                onClick={() => removeEntry(entry.id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                title="Delete Record"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="px-4 py-3 font-semibold">Totals</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 font-semibold text-lg">{stats.totalHouseholds}</td>
                        <td className="px-4 py-3 font-semibold text-lg text-blue-600">{stats.totalRations}</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary & Analytics */}
          <div className="space-y-6">
            {/* Priority Distribution */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Priority Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-red-600">High Priority</span>
                    <span className="text-sm font-medium">{stats.highPriority}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${(stats.highPriority / Math.max(stats.totalDistributions, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-yellow-600">Medium Priority</span>
                    <span className="text-sm font-medium">
                      {entries.filter(e => e.priority === 'medium').length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(entries.filter(e => e.priority === 'medium').length / Math.max(stats.totalDistributions, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-green-600">Low Priority</span>
                    <span className="text-sm font-medium">
                      {entries.filter(e => e.priority === 'low').length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(entries.filter(e => e.priority === 'low').length / Math.max(stats.totalDistributions, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Overview */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="font-medium">Pending</span>
                  </div>
                  <span className="font-bold text-yellow-700">{stats.pendingDistributions}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="font-medium">In Transit</span>
                  </div>
                  <span className="font-bold text-blue-700">
                    {entries.filter(e => e.status === 'in-transit').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium">Distributed</span>
                  </div>
                  <span className="font-bold text-green-700">
                    {entries.filter(e => e.status === 'distributed').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={exportCSV}
                  className="w-full bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-lg flex items-center justify-center transition duration-200"
                >
                  <FaDownload className="mr-2" /> Export to CSV
                </button>
                <button 
                  onClick={generateReport}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg flex items-center justify-center transition duration-200"
                >
                  <FaFileExport className="mr-2" /> Generate Report
                </button>
                <button 
                  onClick={clearAll}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-700 px-4 py-3 rounded-lg flex items-center justify-center transition duration-200"
                >
                  <FaTrash className="mr-2" /> Clear All Records
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {entries.slice(0, 3).map(entry => (
                  <div key={entry.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{entry.district}</p>
                        <p className="text-sm text-gray-500">{entry.households} households • {entry.totalRations} rations</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{entry.date}</p>
                  </div>
                ))}
                {entries.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-gray-500 text-sm">
            <p>Post-Flood Ration Distribution System • Emergency Response Tool</p>
            <p className="mt-1">Data is saved locally in your browser • Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}