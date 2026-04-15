import { useState, useEffect, useCallback } from 'react';
import { Activity, Waves, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { SensorPackageCard, CreatePackageModal, MonitoringView } from './components';
import type { SensorPackage } from './types';
import { fetchSensorPackages, createSensorPackage, type CreateSensorPackageInput } from './sensorPackageApi';

export type { SensorPackage } from './types';

export interface DashboardProps {
  /** JWT from login; required to load and create sensor packages */
  authToken: string;
}

export function Dashboard({ authToken }: DashboardProps) {
  const [view, setView] = useState<'overview' | 'monitoring'>('overview');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [packages, setPackages] = useState<SensorPackage[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const activePackages = packages.filter(p => p.status === 'active').length;
  const warningPackages = packages.filter(p => p.status === 'warning').length;

  const loadPackages = useCallback(async () => {
    if (!authToken) {
      setLoadError('Not signed in.');
      setLoading(false);
      return;
    }
    setLoadError(null);
    setLoading(true);
    try {
      const list = await fetchSensorPackages(authToken);
      setPackages(list);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Could not load sensor packages');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handleCreatePackage = async (newPackage: CreateSensorPackageInput) => {
    setCreateError(null);
    try {
      const created = await createSensorPackage(authToken, newPackage);
      setPackages((prev) => [...prev, created]);
      setShowCreateModal(false);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Failed to create package');
    }
  };

  const handleViewMonitoring = (packageId: string) => {
    setSelectedPackage(packageId);
    setView('monitoring');
  };

  if (view === 'monitoring' && selectedPackage) {
    const pkg = packages.find(p => p.id === selectedPackage);
    if (pkg) {
      return (
        <MonitoringView
          package={pkg}
          onBack={() => {
            setView('overview');
            setSelectedPackage(null);
          }}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Waves className="text-blue-600" size={40} />
                Flood Detection System
              </h1>
              <p className="text-gray-600 mt-2">Real-time IoT sensor monitoring and flood prediction</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCreateError(null);
                setShowCreateModal(true);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              + Create Sensor Package
            </button>
          </div>
        </div>

        {loadError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm flex flex-wrap items-center justify-between gap-3">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => loadPackages()}
              className="shrink-0 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-900 hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        )}

        {loading && !loadError && (
          <p className="text-gray-600 mb-6" role="status">
            Loading sensor packages…
          </p>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Packages</p>
                <p className="text-3xl font-bold text-gray-900">{packages.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <MapPin className="text-blue-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Sensors</p>
                <p className="text-3xl font-bold text-gray-900">{activePackages}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="text-green-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Warnings</p>
                <p className="text-3xl font-bold text-gray-900">{warningPackages}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <AlertTriangle className="text-orange-600" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Flood Risk</p>
                <p className="text-3xl font-bold text-orange-600">Medium</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Activity className="text-purple-600" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Sensor Packages Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sensor Packages</h2>
          {!loading && !loadError && packages.length === 0 && (
            <p className="text-gray-600 text-sm mb-4">No sensor packages yet. Create one to get started.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(pkg => (
              <SensorPackageCard
                key={pkg.id}
                package={pkg}
                onViewDetails={handleViewMonitoring}
              />
            ))}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreatePackageModal
          onClose={() => {
            setCreateError(null);
            setShowCreateModal(false);
          }}
          onCreate={handleCreatePackage}
          serverError={createError}
        />
      )}
    </div>
  );
}
