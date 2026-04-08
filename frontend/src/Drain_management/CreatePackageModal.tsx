import { useState } from 'react';
import { X, MapPin, Cpu, Droplets, Wind, CloudRain, Waves } from 'lucide-react';
import type { SensorPackage } from './types';

interface CreatePackageModalProps {
  onClose: () => void;
  onCreate: (pkg: Omit<SensorPackage, 'id' | 'status' | 'lastUpdate' | 'currentReadings'>) => void;
}

export function CreatePackageModal({ onClose, onCreate }: CreatePackageModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    locationName: '',
    latitude: '',
    longitude: '',
    address: '',
    ultrasonic: 0,
    flow: 0,
    rain: 0,
    turbidity: 0,
    esp32: false,
    uno: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPackage: Omit<SensorPackage, 'id' | 'status' | 'lastUpdate' | 'currentReadings'> = {
      name: formData.name,
      location: {
        name: formData.locationName,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        address: formData.address
      },
      sensors: {
        ultrasonic: formData.ultrasonic,
        flow: formData.flow,
        rain: formData.rain,
        turbidity: formData.turbidity
      },
      boards: {
        esp32: formData.esp32,
        uno: formData.uno
      }
    };

    onCreate(newPackage);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold">Create Sensor Package</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Package Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Package Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., River Station Alpha"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Location Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-900">Location Details</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  placeholder="e.g., Kelani River - Bridge Point"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="6.9271"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="79.8612"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g., Colombo District, Western Province"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Sensors Section */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Select Sensors</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Droplets className="text-blue-600" size={20} />
                  <span className="font-medium text-gray-700">Ultrasonic Sensor</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.ultrasonic}
                  onChange={(e) => setFormData({ ...formData, ultrasonic: parseInt(e.target.value) || 0 })}
                  placeholder="Number of sensors"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-cyan-400 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Wind className="text-cyan-600" size={20} />
                  <span className="font-medium text-gray-700">Flow Sensor</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.flow}
                  onChange={(e) => setFormData({ ...formData, flow: parseInt(e.target.value) || 0 })}
                  placeholder="Number of sensors"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-400 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <CloudRain className="text-indigo-600" size={20} />
                  <span className="font-medium text-gray-700">Rain Sensor</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.rain}
                  onChange={(e) => setFormData({ ...formData, rain: parseInt(e.target.value) || 0 })}
                  placeholder="Number of sensors"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-teal-400 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Waves className="text-teal-600" size={20} />
                  <span className="font-medium text-gray-700">Turbidity Sensor</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={formData.turbidity}
                  onChange={(e) => setFormData({ ...formData, turbidity: parseInt(e.target.value) || 0 })}
                  placeholder="Number of sensors"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Board Selection */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-900">Select Boards *</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.esp32
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-400'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.esp32}
                  onChange={(e) => setFormData({ ...formData, esp32: e.target.checked })}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="font-bold text-lg mb-1">ESP32</div>
                  <div className="text-sm text-gray-600">Wi-Fi & Bluetooth</div>
                  {formData.esp32 && (
                    <div className="mt-2 inline-block px-2 py-1 bg-blue-600 text-white text-xs rounded">
                      Selected
                    </div>
                  )}
                </div>
              </label>

              <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.uno
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-400'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.uno}
                  onChange={(e) => setFormData({ ...formData, uno: e.target.checked })}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="font-bold text-lg mb-1">UNO Board</div>
                  <div className="text-sm text-gray-600">Arduino Compatible</div>
                  {formData.uno && (
                    <div className="mt-2 inline-block px-2 py-1 bg-blue-600 text-white text-xs rounded">
                      Selected
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              Create Package
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
