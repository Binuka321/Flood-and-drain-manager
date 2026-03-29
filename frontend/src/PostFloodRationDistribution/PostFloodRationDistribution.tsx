import React, { useEffect, useState, useMemo } from "react";
import jsPDF from "jspdf";

// Icons Component - Organized in one place
const Icons = {
  Add: () => <span className="material-icons">add_circle</span>,
  Delete: () => <span className="material-icons">delete</span>,
  Download: () => <span className="material-icons">download</span>,
  Analytics: () => <span className="material-icons">analytics</span>,
  People: () => <span className="material-icons">people</span>,
  Package: () => <span className="material-icons">inventory</span>,
  Warning: () => <span className="material-icons">warning</span>,
  Check: () => <span className="material-icons">check_circle</span>,
  Location: () => <span className="material-icons">location_on</span>,
  Calendar: () => <span className="material-icons">calendar_today</span>,
  Search: () => <span className="material-icons">search</span>,
  File: () => <span className="material-icons">description</span>,
  Truck: () => <span className="material-icons">local_shipping</span>,
  Filter: () => <span className="material-icons">filter_list</span>,
  Edit: () => <span className="material-icons">edit</span>,
  Visibility: () => <span className="material-icons">visibility</span>,
  Print: () => <span className="material-icons">print</span>,
  Share: () => <span className="material-icons">share</span>,
  Map: () => <span className="material-icons">map</span>,
  Sync: () => <span className="material-icons">sync</span>,
  ArrowUp: () => <span className="material-icons">arrow_upward</span>,
  ArrowDown: () => <span className="material-icons">arrow_downward</span>,
  Refresh: () => <span className="material-icons">refresh</span>,
  Boat: () => <span className="material-icons">directions_boat</span>,
  Helicopter: () => <span className="material-icons">flight</span>,
  Person: () => <span className="material-icons">person</span>,
  Today: () => <span className="material-icons">today</span>,
  Priority: () => <span className="material-icons">priority_high</span>,
  Status: () => <span className="material-icons">event_available</span>,
  Sort: () => <span className="material-icons">sort</span>,
  ViewList: () => <span className="material-icons">view_list</span>,
  ViewModule: () => <span className="material-icons">view_module</span>,
  Expand: () => <span className="material-icons">expand_more</span>,
  Info: () => <span className="material-icons">info</span>,
  Layers: () => <span className="material-icons">layers</span>,
  WaterDamage: () => <span className="material-icons">water_damage</span>,
  Emergency: () => <span className="material-icons">emergency</span>,
  Schedule: () => <span className="material-icons">schedule</span>,
  Cancel: () => <span className="material-icons">cancel</span>,
  Bolt: () => <span className="material-icons">bolt</span>,
  Save: () => <span className="material-icons">save</span>,
  Close: () => <span className="material-icons">close</span>,
};

// Reusable Button Components with Sky Blue and Light Purple theme
const PrimaryButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}> = ({ onClick, children, icon, disabled, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      bg-gradient-to-r from-sky-500 to-blue-600 
      hover:from-sky-600 hover:to-blue-700 
      text-white px-5 py-3 rounded-xl 
      font-medium flex items-center justify-center 
      transition-all duration-200 
      shadow-lg hover:shadow-xl 
      disabled:opacity-50 disabled:cursor-not-allowed
      ${className}
    `}
  >
    {icon && <span className="mr-2">{icon}</span>}
    {children}
  </button>
);

const SecondaryButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ onClick, children, icon, className = "" }) => (
  <button
    onClick={onClick}
    className={`
      bg-gradient-to-r from-purple-50 to-indigo-50 
      border border-purple-200 
      text-purple-700 hover:text-purple-800 
      hover:from-purple-100 hover:to-indigo-100 
      px-4 py-2.5 rounded-lg 
      font-medium flex items-center justify-center 
      transition-all duration-200 
      shadow-sm hover:shadow-md
      ${className}
    `}
  >
    {icon && <span className="mr-2">{icon}</span>}
    {children}
  </button>
);

const GhostButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'sky' | 'purple' | 'gray';
  className?: string;
}> = ({ onClick, children, icon, variant = 'sky', className = "" }) => {
  const variantClasses = {
    sky: 'text-sky-600 hover:text-sky-800 hover:bg-sky-50',
    purple: 'text-purple-600 hover:text-purple-800 hover:bg-purple-50',
    gray: 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${variantClasses[variant]}
        px-3 py-1.5 rounded-lg 
        flex items-center 
        transition-all duration-200
        ${className}
      `}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </button>
  );
};

const ActionButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  variant?: 'edit' | 'delete' | 'success' | 'info';
}> = ({ onClick, icon, title, variant = 'info' }) => {
  const variantClasses = {
    edit: 'text-sky-600 hover:text-sky-800 hover:bg-sky-50',
    delete: 'text-red-600 hover:text-red-800 hover:bg-red-50',
    success: 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50',
    info: 'text-purple-600 hover:text-purple-800 hover:bg-purple-50'
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        p-2 rounded-lg 
        transition-all duration-200 
        ${variantClasses[variant]}
      `}
    >
      {icon}
    </button>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'sky' | 'purple' | 'emerald' | 'amber' | 'rose';
  description?: string;
}> = ({ title, value, icon, color, description }) => {
  const colorClasses = {
    sky: 'border-sky-500 bg-gradient-to-r from-sky-50 to-blue-50',
    purple: 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50',
    emerald: 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50',
    amber: 'border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50',
    rose: 'border-rose-500 bg-gradient-to-r from-rose-50 to-pink-50'
  };

  const iconColors = {
    sky: 'text-sky-600 bg-sky-100',
    purple: 'text-purple-600 bg-purple-100',
    emerald: 'text-emerald-600 bg-emerald-100',
    amber: 'text-amber-600 bg-amber-100',
    rose: 'text-rose-600 bg-rose-100'
  };

  return (
    <div className={`rounded-2xl p-5 border-l-4 ${colorClasses[color]} shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 flex items-center mb-1">
            {icon}
            <span className="ml-2">{title}</span>
          </p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${iconColors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Filter Badge Component
const FilterBadge: React.FC<{
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}> = ({ label, icon, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-3 py-1.5 rounded-lg text-sm font-medium flex items-center
      transition-all duration-200
      ${active 
        ? 'bg-sky-100 text-sky-700 border border-sky-200' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
      }
    `}
  >
    {icon && <span className="mr-1.5">{icon}</span>}
    {label}
  </button>
);

// Status Badge Component
const StatusBadge: React.FC<{
  status: 'pending' | 'distributed' | 'in-transit' | 'cancelled';
}> = ({ status }) => {
  const config = {
    pending: { 
      label: 'PENDING', 
      className: 'bg-amber-100 text-amber-800 border border-amber-200',
      icon: <Icons.Schedule />
    },
    'in-transit': { 
      label: 'IN TRANSIT', 
      className: 'bg-sky-100 text-sky-800 border border-sky-200',
      icon: <Icons.Truck />
    },
    distributed: { 
      label: 'DISTRIBUTED', 
      className: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      icon: <Icons.Check />
    },
    cancelled: { 
      label: 'CANCELLED', 
      className: 'bg-rose-100 text-rose-800 border border-rose-200',
      icon: <Icons.Cancel />
    },
  };

  const { label, className, icon } = config[status];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${className}`}>
      {icon}
      <span className="ml-1.5">{label}</span>
    </span>
  );
};

// Priority Badge Component
const PriorityBadge: React.FC<{
  priority: 'low' | 'medium' | 'high' | 'critical';
  showIcon?: boolean;
}> = ({ priority, showIcon = true }) => {
  const config = {
    critical: { 
      label: 'CRITICAL', 
      className: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white',
      icon: <Icons.Warning />
    },
    high: { 
      label: 'HIGH', 
      className: 'bg-gradient-to-r from-orange-400 to-amber-500 text-white',
      icon: <Icons.Warning />
    },
    medium: { 
      label: 'MEDIUM', 
      className: 'bg-gradient-to-r from-amber-300 to-yellow-400 text-gray-800',
      icon: <Icons.Priority />
    },
    low: { 
      label: 'LOW', 
      className: 'bg-gradient-to-r from-emerald-300 to-green-400 text-gray-800',
      icon: <Icons.Check />
    },
  };

  const { label, className, icon } = config[priority];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${className}`}>
      {showIcon && icon}
      <span className={`${showIcon ? 'ml-1.5' : ''}`}>{label}</span>
    </span>
  );
};

// Delivery Method Badge Component
const DeliveryBadge: React.FC<{
  method: 'truck' | 'boat' | 'helicopter' | 'hand-delivery';
}> = ({ method }) => {
  const config = {
    truck: { 
      label: 'TRUCK', 
      className: 'bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700 border border-sky-200',
      icon: <Icons.Truck />
    },
    boat: { 
      label: 'BOAT', 
      className: 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200',
      icon: <Icons.Boat />
    },
    helicopter: { 
      label: 'HELICOPTER', 
      className: 'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border border-violet-200',
      icon: <Icons.Helicopter />
    },
    'hand-delivery': { 
      label: 'HAND DELIVERY', 
      className: 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200',
      icon: <Icons.Person />
    },
  };

  const { label, className, icon } = config[method];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${className}`}>
      {icon}
      <span className="ml-1.5">{label}</span>
    </span>
  );
};

interface Entry {
  id: string;
  district: string;
  households: number;
  rationsPerHousehold: number;
  totalRations: number;
  date: string;
  status: 'pending' | 'distributed' | 'in-transit' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  deliveryMethod: 'truck' | 'boat' | 'helicopter' | 'hand-delivery';
  coordinator: string;
  estimatedDeliveryTime: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

interface MapViewData {
  district: string;
  households: number;
  rations: number;
  coordinates: [number, number];
  status: Entry['status'];
  priority: Entry['priority'];
}

export default function PostFloodRationDistribution(): JSX.Element {
  const [districts, setDistricts] = useState<string[]>([]);
  const [district, setDistrict] = useState<string>("");
  const [households, setHouseholds] = useState<number>(0);
  const [rationsPerHousehold, setRationsPerHousehold] = useState<number>(3);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<Entry['status']>('pending');
  const [priority, setPriority] = useState<Entry['priority']>('medium');
  const [deliveryMethod, setDeliveryMethod] = useState<Entry['deliveryMethod']>('truck');
  const [coordinator, setCoordinator] = useState<string>("");
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<string>("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [notes, setNotes] = useState<string>("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterDeliveryMethod, setFilterDeliveryMethod] = useState<string>("all");
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<Partial<Entry>>({});
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'households'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showMap, setShowMap] = useState<boolean>(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [mapView, setMapView] = useState<'heatmap' | 'markers'>('markers');

  // Sample coordinates for Sri Lankan districts
  const districtCoordinates: Record<string, [number, number]> = {
    "Colombo": [6.9271, 79.8612],
    "Galle": [6.0535, 80.2210],
    "Kandy": [7.2906, 80.6337],
    "Matara": [5.9480, 80.5353],
    "Hambantota": [6.1240, 81.1185],
    "Gampaha": [7.0899, 79.9994],
    "Kalutara": [6.5854, 79.9607],
    "Kegalle": [7.2510, 80.3464],
    "Ratnapura": [6.7057, 80.3847],
    "Kurunegala": [7.4863, 80.3623],
    "Anuradhapura": [8.3114, 80.4037],
    "Polonnaruwa": [7.9390, 81.0187],
    "Badulla": [6.9934, 81.0550],
    "Monaragala": [6.8728, 81.3508],
    "Jaffna": [9.6615, 80.0255]
  };

  // Sample coordinators
  const coordinators = ["John Smith", "Maria Garcia", "David Johnson", "Sarah Williams", "Robert Brown"];

  // Statistics state
  const [stats, setStats] = useState({
    totalDistributions: 0,
    totalHouseholds: 0,
    totalRations: 0,
    pendingDistributions: 0,
    highPriority: 0,
    criticalPriority: 0,
    todayDistributions: 0,
    avgHouseholds: 0
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
        const fallback = Object.keys(districtCoordinates).sort();
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
    const highPriority = entries.filter(e => e.priority === 'high' || e.priority === 'critical').length;
    const criticalPriority = entries.filter(e => e.priority === 'critical').length;
    const today = new Date().toISOString().slice(0, 10);
    const todayDistributions = entries.filter(e => e.date === today).length;
    const avgHouseholds = totalDistributions > 0 ? Math.round(totalHouseholds / totalDistributions) : 0;
    
    setStats({
      totalDistributions,
      totalHouseholds,
      totalRations,
      pendingDistributions,
      highPriority,
      criticalPriority,
      todayDistributions,
      avgHouseholds
    });
  }, [entries]);

  // Prepare data for map view
  const mapData: MapViewData[] = useMemo(() => {
    const data: Record<string, MapViewData> = {};
    
    entries.forEach(entry => {
      const coords = districtCoordinates[entry.district] || [6.9271, 79.8612];
      if (!data[entry.district]) {
        data[entry.district] = {
          district: entry.district,
          households: 0,
          rations: 0,
          coordinates: coords,
          status: 'pending',
          priority: 'medium'
        };
      }
      data[entry.district].households += entry.households;
      data[entry.district].rations += entry.totalRations;
      // Use the highest priority and latest status
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      if (priorityOrder[entry.priority] > priorityOrder[data[entry.district].priority]) {
        data[entry.district].priority = entry.priority;
      }
    });
    
    return Object.values(data);
  }, [entries]);

  // Calculate distribution by district
  const districtDistribution = useMemo(() => {
    const distribution: Record<string, { households: number, rations: number, count: number }> = {};
    
    entries.forEach(entry => {
      if (!distribution[entry.district]) {
        distribution[entry.district] = { households: 0, rations: 0, count: 0 };
      }
      distribution[entry.district].households += entry.households;
      distribution[entry.district].rations += entry.totalRations;
      distribution[entry.district].count += 1;
    });
    
    return Object.entries(distribution)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.households - a.households);
  }, [entries]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          alert(`Location captured: ${position.coords.latitude}, ${position.coords.longitude}`);
        },
        () => {
          alert("Unable to retrieve location. Please enter coordinates manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const addEntry = () => {
    if (!district) {
      alert("Please select a district");
      return;
    }
    if (households <= 0) {
      alert("Please enter a valid number of households");
      return;
    }
    if (!coordinator) {
      alert("Please select a coordinator");
      return;
    }

    // Get coordinates for the district if not manually set
    const coords = latitude && longitude ? { latitude, longitude } : districtCoordinates[district] 
      ? { latitude: districtCoordinates[district][0], longitude: districtCoordinates[district][1] }
      : {};

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
      coordinator,
      estimatedDeliveryTime,
      ...coords,
      notes: notes || undefined,
    };
    
    setEntries((s) => [entry, ...s]);

    // Reset form
    setHouseholds(0);
    setNotes("");
    setStatus('pending');
    setPriority('medium');
    setDeliveryMethod('truck');
    setCoordinator("");
    setEstimatedDeliveryTime("");
    setLatitude(undefined);
    setLongitude(undefined);
  };

  const startEditEntry = (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      setEditMode(id);
      setEditingEntry({ ...entry });
    }
  };

  const saveEditEntry = () => {
    if (editMode && editingEntry.id) {
      setEntries(entries.map(entry => 
        entry.id === editMode ? { ...entry, ...editingEntry } : entry
      ));
      setEditMode(null);
      setEditingEntry({});
    }
  };

  const cancelEditEntry = () => {
    setEditMode(null);
    setEditingEntry({});
  };

  const removeEntry = (id: string) => {
    if (!confirm("Are you sure you want to delete this distribution record?")) return;
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
    
    const header = ["ID", "District", "Households", "Rations/HH", "Total Rations", "Date", "Status", "Priority", "Delivery Method", "Coordinator", "Estimated Delivery", "Latitude", "Longitude", "Notes"];
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
      e.coordinator,
      e.estimatedDeliveryTime,
      e.latitude || "",
      e.longitude || "",
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


  // Modal state for report export
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState("");

  const buildReportText = () => {
    const today = new Date().toLocaleDateString();
    return `POST-FLOOD RATION DISTRIBUTION REPORT\nGenerated: ${today}\n===========================================\n\nSUMMARY STATISTICS:\n• Total Distributions: ${stats.totalDistributions}\n• Total Households Assisted: ${stats.totalHouseholds}\n• Total Rations Distributed: ${stats.totalRations}\n• Pending Distributions: ${stats.pendingDistributions}\n• High Priority Cases: ${stats.highPriority}\n• Critical Cases: ${stats.criticalPriority}\n• Distributions Today: ${stats.todayDistributions}\n• Average Households per Distribution: ${stats.avgHouseholds}\n\nDISTRICT-WISE DISTRIBUTION:\n${districtDistribution.map(d => `• ${d.name}: ${d.count} distributions, ${d.households} households, ${d.rations} rations`).join('\\n')}\n\nDETAILED ENTRIES:\n${entries.map(entry => `• ${entry.date} - ${entry.district} (${entry.priority.toUpperCase()})\n  Households: ${entry.households}\n  Rations: ${entry.totalRations} (${entry.rationsPerHousehold} per HH)\n  Status: ${entry.status.toUpperCase()}\n  Delivery: ${entry.deliveryMethod}\n  Coordinator: ${entry.coordinator || ''}\n  ${entry.estimatedDeliveryTime ? `ETA: ${entry.estimatedDeliveryTime}` : ''}\n  ${entry.latitude && entry.longitude ? `Location: ${entry.latitude}, ${entry.longitude}` : ''}\n  ${entry.notes ? `Notes: ${entry.notes}` : ''}`).join('\\n')}\n`;
  };

  const generateReport = () => {
    setReportText(buildReportText());
    setShowReportModal(true);
  };

  const downloadReportText = () => {
    const today = new Date().toLocaleDateString();
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flood_ration_report_${today.replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadReportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 15;

    // Draw frame
    const drawFrame = () => {
      doc.setDrawColor(233, 30, 99); // pink
      doc.setLineWidth(2);
      doc.rect(7, 7, pageWidth - 14, pageHeight - 14, 'S');
    };

    drawFrame();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(233, 30, 99);
    doc.text("POST-FLOOD RATION DISTRIBUTION REPORT", pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Section: Summary
    doc.setFontSize(14);
    doc.setTextColor(233, 30, 99);
    doc.text('Summary Statistics', 15, y);
    y += 7;
    doc.setFontSize(11);
    doc.setTextColor(33, 33, 33);
    const summary = [
      `Total Distributions: ${stats.totalDistributions}`,
      `Total Households Assisted: ${stats.totalHouseholds}`,
      `Total Rations Distributed: ${stats.totalRations}`,
      `Pending Distributions: ${stats.pendingDistributions}`,
      `High Priority Cases: ${stats.highPriority}`,
      `Critical Cases: ${stats.criticalPriority}`,
      `Distributions Today: ${stats.todayDistributions}`,
      `Average Households per Distribution: ${stats.avgHouseholds}`
    ];
    summary.forEach(line => {
      doc.text(line, 18, y);
      y += 6;
    });
    y += 2;

    // Section: District-wise
    doc.setFontSize(14);
    doc.setTextColor(233, 30, 99);
    doc.text('District-wise Distribution', 15, y);
    y += 7;
    doc.setFontSize(11);
    doc.setTextColor(33, 33, 33);
    districtDistribution.forEach(d => {
      doc.text(`• ${d.name}: ${d.count} distributions, ${d.households} households, ${d.rations} rations`, 18, y);
      y += 6;
      if (y > pageHeight - 20) { doc.addPage(); drawFrame(); y = 15; }
    });
    y += 2;

    // Section: Detailed Entries
    doc.setFontSize(14);
    doc.setTextColor(233, 30, 99);
    doc.text('Detailed Entries', 15, y);
    y += 7;

    entries.forEach((entry, idx) => {
      // Prepare entry details
      let details = [
        `Households: ${entry.households}`,
        `Rations: ${entry.totalRations} (${entry.rationsPerHousehold} per HH)`,
        `Status: ${entry.status.toUpperCase()}`,
        `Delivery: ${entry.deliveryMethod}`
      ];
      if (entry.coordinator) details.push(`Coordinator: ${entry.coordinator}`);
      if (entry.estimatedDeliveryTime) details.push(`ETA: ${entry.estimatedDeliveryTime}`);
      if (entry.latitude && entry.longitude) details.push(`Location: ${entry.latitude}, ${entry.longitude}`);
      if (entry.notes) details.push(`Notes: ${entry.notes}`);

      // Calculate required height for this entry
      const lineHeight = 5;
      const titleHeight = 7;
      const boxPadding = 4;
      const boxHeight = titleHeight + details.length * lineHeight + boxPadding * 2;

      if (y + boxHeight > pageHeight - 15) { doc.addPage(); drawFrame(); y = 15; }

      // Draw entry box
      doc.setDrawColor(233, 30, 99);
      doc.setLineWidth(0.5);
      doc.roundedRect(13, y, pageWidth - 26, boxHeight, 2, 2, 'S');

      // Entry title
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      doc.text(`${entry.date} - ${entry.district} (${entry.priority.toUpperCase()})`, 16, y + boxPadding + titleHeight - 2);

      // Entry details
      doc.setFontSize(10);
      details.forEach((line, i) => {
        doc.text(line, 18, y + boxPadding + titleHeight + i * lineHeight + 2);
      });

      y += boxHeight + 4; // Add extra space between entries
    });

    doc.save(`flood_ration_report_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
  };
  // Modal for report export
  {showReportModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full relative">
        <button onClick={() => setShowReportModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
        <h2 className="text-xl font-bold mb-4">Export Report</h2>
        <textarea className="w-full h-64 border rounded p-2 text-xs mb-4" value={reportText} readOnly />
        <div className="flex gap-3 justify-end">
          <button onClick={downloadReportText} className="bg-blue-500 text-white px-4 py-2 rounded">Download TXT</button>
          <button onClick={downloadReportPDF} className="bg-pink-500 text-white px-4 py-2 rounded">Download PDF</button>
        </div>
      </div>
    </div>
  )}

  const printSummary = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Flood Ration Distribution Summary</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              h1 { color: #0ea5e9; }
              .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
              .stat-card { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; }
            </style>
          </head>
          <body>
            <h1>Flood Ration Distribution Summary</h1>
            <div class="stats">
              <div class="stat-card">
                <h3>Total Distributions</h3>
                <p style="font-size: 24px; font-weight: bold;">${stats.totalDistributions}</p>
              </div>
              <div class="stat-card">
                <h3>Households Assisted</h3>
                <p style="font-size: 24px; font-weight: bold;">${stats.totalHouseholds}</p>
              </div>
              <div class="stat-card">
                <h3>Total Rations</h3>
                <p style="font-size: 24px; font-weight: bold;">${stats.totalRations}</p>
              </div>
              <div class="stat-card">
                <h3>Pending</h3>
                <p style="font-size: 24px; font-weight: bold;">${stats.pendingDistributions}</p>
              </div>
            </div>
            <h2>Recent Distributions</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>District</th>
                  <th>Households</th>
                  <th>Rations</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${entries.slice(0, 10).map(entry => `
                  <tr>
                    <td>${entry.date}</td>
                    <td>${entry.district}</td>
                    <td>${entry.households}</td>
                    <td>${entry.totalRations}</td>
                    <td>${entry.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p style="margin-top: 30px; color: #666;">Generated on ${new Date().toLocaleString()}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    let filtered = entries.filter(entry => {
      const matchesSearch = entry.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.coordinator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || entry.status === filterStatus;
      const matchesPriority = filterPriority === "all" || entry.priority === filterPriority;
      const matchesDelivery = filterDeliveryMethod === "all" || entry.deliveryMethod === filterDeliveryMethod;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesDelivery;
    });

    // Sort entries
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch(sortBy) {
        case 'date':
          comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          break;
        case 'priority':
          const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case 'households':
          comparison = b.households - a.households;
          break;
      }
      
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return filtered;
  }, [entries, searchTerm, filterStatus, filterPriority, filterDeliveryMethod, sortBy, sortOrder]);

  const getMapMarkerColor = (priority: Entry['priority']) => {
    switch(priority) {
      case 'critical': return 'bg-gradient-to-br from-rose-500 to-pink-600';
      case 'high': return 'bg-gradient-to-br from-orange-500 to-amber-600';
      case 'medium': return 'bg-gradient-to-br from-amber-400 to-yellow-500';
      case 'low': return 'bg-gradient-to-br from-emerald-400 to-green-500';
      default: return 'bg-gradient-to-br from-gray-400 to-gray-500';
    }
  };

  const getMapMarkerSize = (households: number) => {
    if (households > 500) return 'w-8 h-8';
    if (households > 200) return 'w-7 h-7';
    if (households > 100) return 'w-6 h-6';
    return 'w-5 h-5';
  };

  // Add Material Icons CSS
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-pink-50 text-gray-900 p-4 md:p-6">
      {/* Report Modal (must be at top level of return) */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full relative">
            <button onClick={() => setShowReportModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            <h2 className="text-xl font-bold mb-4">Export Report</h2>
            <textarea className="w-full h-64 border rounded p-2 text-xs mb-4" value={reportText} readOnly />
            <div className="flex gap-3 justify-end">
              <button onClick={downloadReportText} className="bg-blue-500 text-white px-4 py-2 rounded">Download TXT</button>
              <button onClick={downloadReportPDF} className="bg-pink-500 text-white px-4 py-2 rounded">Download PDF</button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center">
                <Icons.WaterDamage className="text-sky-600 mr-3 text-4xl" />
                Post-Flood Ration Distribution System
              </h1>
              <p className="text-gray-600 flex items-center">
                <Icons.Emergency className="text-purple-500 mr-2 text-sm" />
                Emergency Response & Relief Management Platform
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
              <SecondaryButton 
                onClick={() => setShowMap(!showMap)}
                icon={<Icons.Map />}
              >
                {showMap ? 'Hide Map' : 'Show Map'}
              </SecondaryButton>
              <PrimaryButton 
                onClick={exportCSV}
                icon={<Icons.Download />}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                Export CSV
              </PrimaryButton>
              <PrimaryButton 
                onClick={generateReport}
                icon={<Icons.File />}
              >
                Generate Report
              </PrimaryButton>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
            <div className="col-span-2">
              <StatCard
                title="Total Distributions"
                value={stats.totalDistributions}
                icon={<Icons.Analytics />}
                color="sky"
                description="Across all districts"
              />
            </div>
            
            <div className="col-span-2">
              <StatCard
                title="Households Assisted"
                value={stats.totalHouseholds.toLocaleString()}
                icon={<Icons.People />}
                color="purple"
                description={`Avg: ${stats.avgHouseholds} per distribution`}
              />
            </div>
            
            <div className="col-span-2">
              <StatCard
                title="Total Rations"
                value={stats.totalRations.toLocaleString()}
                icon={<Icons.Package />}
                color="emerald"
                description="Emergency supplies distributed"
              />
            </div>
            
            <div>
              <StatCard
                title="Critical"
                value={stats.criticalPriority}
                icon={<Icons.Warning />}
                color="rose"
              />
            </div>
            
            <div>
              <StatCard
                title="Today"
                value={stats.todayDistributions}
                icon={<Icons.Today />}
                color="amber"
              />
            </div>
          </div>
        </header>

        {/* Map View */}
        {showMap && (
          <div className="mb-6 bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Icons.Map className="text-sky-600 mr-2" /> Distribution Map View
              </h2>
              <div className="flex space-x-2">
                <FilterBadge
                  label="Markers"
                  icon={<Icons.Location />}
                  active={mapView === 'markers'}
                  onClick={() => setMapView('markers')}
                />
                <FilterBadge
                  label="Heatmap"
                  icon={<Icons.Layers />}
                  active={mapView === 'heatmap'}
                  onClick={() => setMapView('heatmap')}
                />
                <GhostButton
                  onClick={() => setSelectedDistrict(null)}
                  icon={<Icons.Refresh />}
                  variant="gray"
                >
                  Reset View
                </GhostButton>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-sky-50 to-purple-50">
              {/* Simulated Map Container */}
              <div className="relative h-64 md:h-96 rounded-lg overflow-hidden border border-gray-200 bg-gradient-to-br from-sky-100 to-purple-100">
                {/* Legend */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg z-10">
                  <p className="text-sm font-semibold mb-2 flex items-center">
                    <Icons.Layers className="mr-2" /> Map Legend
                  </p>
                  <div className="space-y-1">
                    {[
                      { color: 'bg-gradient-to-r from-rose-500 to-pink-600', label: 'Critical Priority' },
                      { color: 'bg-gradient-to-r from-orange-500 to-amber-600', label: 'High Priority' },
                      { color: 'bg-gradient-to-r from-amber-400 to-yellow-500', label: 'Medium Priority' },
                      { color: 'bg-gradient-to-r from-emerald-400 to-green-500', label: 'Low Priority' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${item.color}`}></div>
                        <span className="text-xs">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Map Markers */}
                <div className="relative w-full h-full">
                  {mapData.map((districtData, index) => {
                    const x = 20 + (districtData.coordinates[1] * 3);
                    const y = 20 + (districtData.coordinates[0] * 3);
                    
                    return (
                      <div
                        key={districtData.district}
                        className={`absolute ${getMapMarkerSize(districtData.households)} ${getMapMarkerColor(districtData.priority)} rounded-full border-2 border-white shadow-lg cursor-pointer transform transition-transform hover:scale-125`}
                        style={{ left: `${x}%`, top: `${y}%` }}
                        onClick={() => setSelectedDistrict(districtData.district)}
                        title={`${districtData.district}: ${districtData.households} households, ${districtData.rations} rations`}
                      >
                        <div className="flex items-center justify-center h-full text-white text-xs font-bold">
                          {districtData.households > 500 ? 'L' : districtData.households > 200 ? 'M' : 'S'}
                        </div>
                      </div>
                    );
                  })}

                  {/* Selected District Info */}
                  {selectedDistrict && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-xl max-w-md w-full z-20">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800 flex items-center">
                          <Icons.Location className="text-sky-600 mr-2" /> {selectedDistrict}
                        </h3>
                        <GhostButton
                          onClick={() => setSelectedDistrict(null)}
                          icon={<Icons.Close />}
                          variant="gray"
                          className="!p-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-2 rounded">
                          <p className="text-gray-600">Households</p>
                          <p className="font-bold">{districtDistribution.find(d => d.name === selectedDistrict)?.households || 0}</p>
                        </div>
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-2 rounded">
                          <p className="text-gray-600">Rations</p>
                          <p className="font-bold">{districtDistribution.find(d => d.name === selectedDistrict)?.rations || 0}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {districtDistribution.find(d => d.name === selectedDistrict)?.count || 0} distributions
                      </p>
                    </div>
                  )}
                </div>

                {/* Heatmap Overlay */}
                {mapView === 'heatmap' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 via-amber-500/10 to-emerald-500/10 pointer-events-none"></div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-sky-600 flex items-center">
                    <Icons.Location className="mr-2" /> Districts Covered
                  </p>
                  <p className="text-xl font-bold">{mapData.length}</p>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-3 rounded-lg">
                  <p className="text-sm text-emerald-600 flex items-center">
                    <Icons.People className="mr-2" /> Total Mapped Households
                  </p>
                  <p className="text-xl font-bold">{mapData.reduce((sum, d) => sum + d.households, 0)}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg">
                  <p className="text-sm text-purple-600 flex items-center">
                    <Icons.Package className="mr-2" /> Mapped Rations
                  </p>
                  <p className="text-xl font-bold">{mapData.reduce((sum, d) => sum + d.rations, 0)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Entry Form & Distribution List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Distribution Entry Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Icons.Add className="text-sky-600 mr-3" /> Record New Distribution
                </h2>
                <span className="text-sm text-gray-500 bg-gradient-to-r from-sky-50 to-blue-50 px-3 py-1 rounded-full flex items-center border border-sky-100">
                  <Icons.Sync className="mr-1 text-sm" /> {entries.length} records stored
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Form Fields */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <Icons.Location className="text-sky-500 mr-2" /> District *
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 bg-white"
                    value={district} 
                    onChange={(e) => setDistrict(e.target.value)}
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <Icons.People className="text-purple-500 mr-2" /> Households *
                  </label>
                  <input 
                    type="number" 
                    min={0}
                    max={10000}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                    value={households} 
                    onChange={(e) => setHouseholds(Number(e.target.value))}
                    placeholder="Enter number of households"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <Icons.Package className="text-emerald-500 mr-2" /> Rations per Household
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min={1}
                      max={20}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                      value={rationsPerHousehold} 
                      onChange={(e) => setRationsPerHousehold(Number(e.target.value))}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">bags</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <Icons.Calendar className="text-amber-500 mr-2" /> Distribution Date
                  </label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <Icons.Status className="text-emerald-500 mr-2" /> Status
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                    value={status} 
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="in-transit">🚚 In Transit</option>
                    <option value="distributed">✅ Distributed</option>
                    <option value="cancelled">❌ Cancelled</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <Icons.Priority className="text-rose-500 mr-2" /> Priority Level
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <option value="low">🟢 Low Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="high">🔴 High Priority</option>
                    <option value="critical">⚠️ Critical Priority</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Delivery Method</label>
                  <select 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                    value={deliveryMethod} 
                    onChange={(e) => setDeliveryMethod(e.target.value as any)}
                  >
                    <option value="truck">
                      <Icons.Truck className="inline mr-2" /> Truck Delivery
                    </option>
                    <option value="boat">
                      <Icons.Boat className="inline mr-2" /> Boat Delivery
                    </option>
                    <option value="helicopter">
                      <Icons.Helicopter className="inline mr-2" /> Helicopter Delivery
                    </option>
                    <option value="hand-delivery">
                      <Icons.Person className="inline mr-2" /> Hand Delivery
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <Icons.Person className="text-purple-500 mr-2" /> Coordinator *
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                    value={coordinator} 
                    onChange={(e) => setCoordinator(e.target.value)}
                  >
                    <option value="">Select Coordinator</option>
                    {coordinators.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Estimated Delivery Time</label>
                  <input 
                    type="time" 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                    value={estimatedDeliveryTime} 
                    onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                  />
                </div>

                {/* Location Coordinates */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <Icons.Location className="text-sky-500 mr-2" /> Location Coordinates (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input 
                        type="number" 
                        step="0.0001"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                        placeholder="Latitude"
                        value={latitude || ''}
                        onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </div>
                    <div>
                      <input 
                        type="number" 
                        step="0.0001"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                        placeholder="Longitude"
                        value={longitude || ''}
                        onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <GhostButton
                      onClick={getCurrentLocation}
                      icon={<Icons.Location />}
                      variant="sky"
                    >
                      Use Current Location
                    </GhostButton>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center">
                    <Icons.File className="text-purple-500 mr-2" /> Additional Notes
                  </label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Enter any additional notes or special instructions..."
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sky-800 flex items-center">
                      <Icons.Info className="mr-2" /> Summary
                    </p>
                    <p className="text-sm text-sky-600">
                      Total rations: <span className="font-bold">{households * rationsPerHousehold}</span> 
                      ({rationsPerHousehold} per household × {households} households)
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <PrimaryButton
                      onClick={addEntry}
                      disabled={!district || households <= 0 || !coordinator}
                      icon={<Icons.Add />}
                    >
                      Add Distribution Record
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </div>

            {/* Distribution List */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                    <Icons.Package className="text-sky-600 mr-3" /> Distribution Records ({filteredEntries.length})
                  </h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <FilterBadge
                        label="Table View"
                        icon={<Icons.ViewList />}
                        active={viewMode === 'table'}
                        onClick={() => setViewMode('table')}
                      />
                      <FilterBadge
                        label="Card View"
                        icon={<Icons.ViewModule />}
                        active={viewMode === 'cards'}
                        onClick={() => setViewMode('cards')}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <select 
                        className="border border-gray-300 rounded-xl px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                      >
                        <option value="date">Sort by Date</option>
                        <option value="priority">Sort by Priority</option>
                        <option value="households">Sort by Households</option>
                      </select>
                      <GhostButton
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        icon={sortOrder === 'asc' ? <Icons.ArrowUp /> : <Icons.ArrowDown />}
                        variant="gray"
                      >
                        {sortOrder === 'asc' ? 'Asc' : 'Desc'}
                      </GhostButton>
                    </div>
                  </div>
                </div>
                
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search districts, coordinators, or notes..."
                      className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <select 
                      className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in-transit">In Transit</option>
                      <option value="distributed">Distributed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <select 
                      className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                    >
                      <option value="all">All Priority</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredEntries.length === 0 ? (
                <div className="text-center py-12">
                  <Icons.Package className="text-5xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No distribution records found</p>
                  <p className="text-gray-400 mt-2">Try adjusting your filters or add a new record</p>
                </div>
              ) : viewMode === 'table' ? (
                // Table View
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-sky-50 to-blue-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">District</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Households</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rations</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Priority</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50 transition duration-150">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{entry.date}</div>
                            <div className="text-xs text-gray-500">{entry.estimatedDeliveryTime || 'No ETA'}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <Icons.Location className="text-sky-500 mr-2" />
                              <div>
                                <span className="font-medium">{entry.district}</span>
                                <div className="text-xs text-gray-500">{entry.coordinator}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-lg font-bold text-gray-800">{entry.households}</div>
                            <div className="text-xs text-gray-500">× {entry.rationsPerHousehold}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-lg font-bold text-sky-600">{entry.totalRations}</div>
                            <div className="mt-1">
                              <DeliveryBadge method={entry.deliveryMethod} />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={entry.status} />
                          </td>
                          <td className="px-4 py-3">
                            <PriorityBadge priority={entry.priority} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <ActionButton
                                onClick={() => updateEntryStatus(entry.id, 'distributed')}
                                icon={<Icons.Check />}
                                title="Mark as Distributed"
                                variant="success"
                              />
                              <ActionButton
                                onClick={() => startEditEntry(entry.id)}
                                icon={<Icons.Edit />}
                                title="Edit Record"
                                variant="edit"
                              />
                              <ActionButton
                                onClick={() => removeEntry(entry.id)}
                                icon={<Icons.Delete />}
                                title="Delete Record"
                                variant="delete"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                // Card View
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredEntries.map((entry) => (
                    <div key={entry.id} className="bg-gradient-to-br from-white to-slate-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-800 flex items-center">
                            <Icons.Location className="text-sky-500 mr-2" />
                            {entry.district}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Icons.Calendar className="mr-1 text-sm" /> {entry.date} • 
                            <Icons.Person className="ml-2 mr-1 text-sm" /> {entry.coordinator}
                          </p>
                        </div>
                        <PriorityBadge priority={entry.priority} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-2 rounded-lg">
                          <p className="text-xs text-gray-500">Households</p>
                          <p className="text-lg font-bold">{entry.households}</p>
                        </div>
                        <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-2 rounded-lg">
                          <p className="text-xs text-sky-500">Total Rations</p>
                          <p className="text-lg font-bold text-sky-600">{entry.totalRations}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-3">
                        <StatusBadge status={entry.status} />
                        <DeliveryBadge method={entry.deliveryMethod} />
                      </div>
                      
                      {entry.notes && (
                        <p className="text-sm text-gray-600 mb-3 border-t pt-2">{entry.notes}</p>
                      )}
                      
                      <div className="flex justify-end space-x-2">
                        <GhostButton
                          onClick={() => updateEntryStatus(entry.id, 'distributed')}
                          icon={<Icons.Check />}
                          variant="success"
                          className="text-sm"
                        >
                          Mark as Distributed
                        </GhostButton>
                        <GhostButton
                          onClick={() => removeEntry(entry.id)}
                          icon={<Icons.Delete />}
                          variant="delete"
                          className="text-sm"
                        >
                          Delete
                        </GhostButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {filteredEntries.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Showing {filteredEntries.length} of {entries.length} records
                    </p>
                    <div className="flex space-x-3">
                      <GhostButton
                        onClick={clearAll}
                        icon={<Icons.Delete />}
                        variant="delete"
                      >
                        Clear All Records
                      </GhostButton>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Analytics & Actions */}
          <div className="space-y-6">
            {/* District Distribution */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Icons.Location className="text-sky-600 mr-2" /> District Distribution
              </h3>
              <div className="space-y-3">
                {districtDistribution.slice(0, 5).map((district) => (
                  <div key={district.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{district.name}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-gray-500">{district.households} HH</span>
                      <div className="w-24 h-2 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full"
                          style={{ width: `${(district.households / Math.max(...districtDistribution.map(d => d.households))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
                {districtDistribution.length > 5 && (
                  <div className="text-center pt-2">
                    <GhostButton
                      onClick={() => {/* Expand view */}}
                      icon={<Icons.Expand />}
                      variant="sky"
                    >
                      + {districtDistribution.length - 5} more districts
                    </GhostButton>
                  </div>
                )}
              </div>
            </div>

            {/* Status Overview */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Icons.Status className="text-purple-600 mr-2" /> Status Overview
              </h3>
              <div className="space-y-3">
                {[
                  { status: 'pending', label: 'Pending', count: entries.filter(e => e.status === 'pending').length, color: 'bg-gradient-to-r from-amber-400 to-yellow-500', icon: 'schedule' },
                  { status: 'in-transit', label: 'In Transit', count: entries.filter(e => e.status === 'in-transit').length, color: 'bg-gradient-to-r from-sky-400 to-blue-500', icon: 'local_shipping' },
                  { status: 'distributed', label: 'Distributed', count: entries.filter(e => e.status === 'distributed').length, color: 'bg-gradient-to-r from-emerald-400 to-green-500', icon: 'check_circle' },
                  { status: 'cancelled', label: 'Cancelled', count: entries.filter(e => e.status === 'cancelled').length, color: 'bg-gradient-to-r from-rose-400 to-pink-500', icon: 'cancel' },
                ].map((item) => (
                  <div key={item.status} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${item.color} rounded-full mr-3`}></div>
                      <span className="font-medium flex items-center">
                        <span className="material-icons text-sm mr-2">{item.icon}</span>
                        {item.label}
                      </span>
                    </div>
                    <span className="font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Icons.Bolt className="text-purple-600 mr-2" /> Quick Actions
              </h3>
              <div className="space-y-3">
                <SecondaryButton 
                  onClick={exportCSV}
                  icon={<Icons.Download />}
                  className="w-full"
                >
                  Export to CSV
                </SecondaryButton>
                <SecondaryButton 
                  onClick={generateReport}
                  icon={<Icons.File />}
                  className="w-full"
                >
                  Generate Report
                </SecondaryButton>
                <SecondaryButton 
                  onClick={printSummary}
                  icon={<Icons.Print />}
                  className="w-full"
                >
                  Print Summary
                </SecondaryButton>
                <SecondaryButton 
                  onClick={() => setShowMap(!showMap)}
                  icon={<Icons.Map />}
                  className="w-full"
                >
                  {showMap ? 'Hide Map' : 'Show Map'}
                </SecondaryButton>
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Icons.Priority className="text-rose-600 mr-2" /> Priority Distribution
              </h3>
              <div className="space-y-4">
                {[
                  { priority: 'critical', label: 'Critical', count: entries.filter(e => e.priority === 'critical').length, color: 'bg-gradient-to-r from-rose-500 to-pink-600' },
                  { priority: 'high', label: 'High', count: entries.filter(e => e.priority === 'high').length, color: 'bg-gradient-to-r from-orange-500 to-amber-600' },
                  { priority: 'medium', label: 'Medium', count: entries.filter(e => e.priority === 'medium').length, color: 'bg-gradient-to-r from-amber-400 to-yellow-500' },
                  { priority: 'low', label: 'Low', count: entries.filter(e => e.priority === 'low').length, color: 'bg-gradient-to-r from-emerald-400 to-green-500' },
                ].map((item) => (
                  <div key={item.priority}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                    <div className="w-full bg-gradient-to-r from-gray-200 to-gray-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`} 
                        style={{ width: `${(item.count / Math.max(entries.length, 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm flex items-center">
                <Icons.WaterDamage className="text-sky-400 mr-2 text-sm" />
                Post-Flood Ration Distribution System • Emergency Response Tool v1.2
              </p>
              <p className="text-gray-400 text-xs mt-1 flex items-center">
                <Icons.Save className="text-gray-400 mr-1 text-xs" />
                Data is saved locally in your browser • Last updated: {new Date().toLocaleString()}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-500 text-sm flex items-center">
                <Icons.Sync className="text-emerald-500 mr-1 text-sm" />
                Auto-save: Enabled • Records: {entries.length} • 
                Storage: {(JSON.stringify(entries).length / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}