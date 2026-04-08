import { useState } from 'react';
import { Activity, Waves, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { SensorPackageCard, CreatePackageModal, MonitoringView } from './components';
import type { SensorPackage } from './types';

export type { SensorPackage } from './types';

export function Dashboard() {
  const [view, setView] = useState<'overview' | 'monitoring'>('overview');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [packages, setPackages] = useState<SensorPackage[]>([
    {
      id: '1',
      name: 'River Station Alpha',
      location: {
        name: 'Kelani River - Bridge Point',
        latitude: 6.9271,
        longitude: 79.8612,
        address: 'Colombo District, Western Province'
      },
      sensors: {
        ultrasonic: 2,
        flow: 1,
        rain: 1,
        turbidity: 1
      },
      boards: {
        esp32: true,
        uno: false
      },
      status: 'active',
      lastUpdate: new Date(),
      currentReadings: {
        waterLevel: 2.4,
        flowRate: 1.8,
        rainfall: 12,
        turbidity: 45
      }
    },
    {
      id: '2',
      name: 'Urban Monitoring Point B',
      location: {
        name: 'Dehiwala Canal Junction',
        latitude: 6.8520,
        longitude: 79.8650,
        address: 'Dehiwala-Mount Lavinia, Western Province'
      },
      sensors: {
        ultrasonic: 1,
        flow: 0,
        rain: 2,
        turbidity: 1
      },
      boards: {
        esp32: true,
        uno: true
      },
      status: 'warning',
      lastUpdate: new Date(),
      currentReadings: {
        waterLevel: 3.8,
        rainfall: 28,
        turbidity: 120
      }
    },
    {
      id: '3',
      name: 'Coastal Monitor Station',
      location: {
        name: 'Negombo Lagoon Outlet',
        latitude: 7.2083,
        longitude: 79.8358,
        address: 'Negombo, Western Province'
      },
      sensors: {
        ultrasonic: 1,
        flow: 1,
        rain: 1,
        turbidity: 0
      },
      boards: {
        esp32: true,
        uno: false
      },
      status: 'active',
      lastUpdate: new Date(),
      currentReadings: {
        waterLevel: 1.2,
        flowRate: 0.9,
        rainfall: 5
      }
    }
  ]);

  const activePackages = packages.filter(p => p.status === 'active').length;
  const warningPackages = packages.filter(p => p.status === 'warning').length;

  const handleCreatePackage = (newPackage: Omit<SensorPackage, 'id' | 'status' | 'lastUpdate' | 'currentReadings'>) => {
    const packageWithDefaults: SensorPackage = {
      ...newPackage,
      id: String(packages.length + 1),
      status: 'active',
      lastUpdate: new Date(),
      currentReadings: {}
    };
    setPackages([...packages, packageWithDefaults]);
    setShowCreateModal(false);
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
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              + Create Sensor Package
            </button>
          </div>
        </div>

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
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreatePackage}
        />
      )}
    </div>
  );
}
