import React, { useState } from 'react';
import {
  Scale,
  Activity,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Users,
  Search,
  CheckCircle,
  Clock,
  Navigation,
  ArrowRight,
  ShieldAlert,
  Zap,
  RefreshCw,
  FileSpreadsheet,
  Building2,
  ChevronDown
} from 'lucide-react';
import { StakeholderItem } from '../../../types';

interface AdminCommandCenterProps {
  showToast: (title: string, desc: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  onEmergencyAudit: () => void;
  onOpenStakeholder: (stakeholder: StakeholderItem) => void;
}

const INITIAL_STAKEHOLDERS: StakeholderItem[] = [
  {
    id: 'STK-01',
    name: 'Bharat Petroleum Retail Hub #104',
    subtext: 'Fuel & Weighbridge Operator • Sion-Trombay',
    licenseNo: 'MH-WB-2022-8812',
    role: 'Weighbridge Owner',
    roleType: 'trader',
    status: 'certified',
    complianceScore: 99.2
  },
  {
    id: 'STK-02',
    name: 'Apex Retail Weighing Solutions Ltd.',
    subtext: 'Class III & IV NAWI Importer • Andheri East',
    licenseNo: 'MH-BOM-2023-4410',
    role: 'LMPC Importer',
    roleType: 'importer',
    status: 'certified',
    complianceScore: 97.8
  },
  {
    id: 'STK-03',
    name: 'Maharashtra Weighing Scales Co.',
    subtext: 'Commercial Scale Assembly • Pune Industrial',
    licenseNo: 'MH-MFR-2021-0034',
    role: 'Manufacturer',
    roleType: 'manufacturer',
    status: 'pending',
    complianceScore: 88.5
  },
  {
    id: 'STK-04',
    name: 'Godrej Agrovet Silo Scales',
    subtext: 'Agricultural Bulk Terminal • Vikhroli',
    licenseNo: 'MH-IND-2019-9011',
    role: 'Bulk Operator',
    roleType: 'trader',
    status: 'certified',
    complianceScore: 98.4
  },
  {
    id: 'STK-05',
    name: 'Avery Weigh-Tronix Service Node',
    subtext: 'Authorized Verification Service & Repair',
    licenseNo: 'MH-REP-2020-1188',
    role: 'Authorized Repairer',
    roleType: 'repairer',
    status: 'active',
    complianceScore: 99.5
  },
  {
    id: 'STK-06',
    name: 'Vashi Grain Traders Guild Scale #12',
    subtext: 'APMC Market Mandi • Sector 19',
    licenseNo: 'MH-APMC-2023-7721',
    role: 'Market Scale',
    roleType: 'trader',
    status: 'flagged',
    complianceScore: 78.2
  }
];

export const AdminCommandCenter: React.FC<AdminCommandCenterProps> = ({
  showToast,
  onEmergencyAudit,
  onOpenStakeholder
}) => {
  const [zone, setZone] = useState('Western Zone - Mumbai & Suburban');
  const [period, setPeriod] = useState('Q3-Q4 2024');
  const [stakeholderTab, setStakeholderTab] = useState<'all' | 'pending' | 'active' | 'flagged'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecalculatingTSP, setIsRecalculatingTSP] = useState(false);
  const [workloadReallocated, setWorkloadReallocated] = useState(false);

  // TSP Routing Simulated Stops
  const tspStops = [
    { id: 1, name: 'APMC Grain Terminal Platform 4', status: 'Completed', time: '09:15 AM' },
    { id: 2, name: 'Bharat Petroleum Hub #104 Weighbridge', status: 'Completed', time: '10:40 AM' },
    { id: 3, name: 'Godrej Agrovet Silo Scale B', status: 'Completed', time: '12:10 PM' },
    { id: 4, name: 'Metro Cash & Carry Weighbridge #2', status: 'In Progress (Current)', time: '02:00 PM' },
    { id: 5, name: 'Vashi Cold Storage Platform Scale', status: 'En Route', time: '03:30 PM' },
    { id: 6, name: 'Navi Mumbai Freight Terminal', status: 'Scheduled', time: '04:45 PM' }
  ];

  const handleRecalculateTSP = () => {
    setIsRecalculatingTSP(true);
    setTimeout(() => {
      setIsRecalculatingTSP(false);
      showToast(
        'Optimal Tour Recalculated',
        'TSP Engine updated inspector route: 14.2 km total distance, saving 63% travel time.',
        'success'
      );
    }, 900);
  };

  const handleExecuteReallocation = () => {
    setWorkloadReallocated(true);
    showToast(
      'Workload Reallocation Executed',
      '4 Inspectors dispatched from Zone 1 to Zone 4B for Festive Surge coverage.',
      'success'
    );
  };

  const filteredStakeholders = INITIAL_STAKEHOLDERS.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.licenseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase());

    if (stakeholderTab === 'pending') return matchesSearch && s.status === 'pending';
    if (stakeholderTab === 'flagged') return matchesSearch && s.status === 'flagged';
    if (stakeholderTab === 'active') return matchesSearch && (s.status === 'active' || s.status === 'certified');
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Filter Controls Bar */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-xl text-[#121d26]">
            Directorate Executive Command Center
          </h1>
          <p className="text-xs text-[#4e6073] mt-0.5">
            National Metrological Oversight, Predictive Analytics &amp; Enroute TSP Clusters
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Zone Selector */}
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#d8e4f1] bg-white text-[#121d26] focus:outline-none"
          >
            <option>Western Zone - Mumbai &amp; Suburban</option>
            <option>Northern Zone - Delhi NCR</option>
            <option>Southern Zone - Bengaluru Hub</option>
            <option>Eastern Zone - Kolkata Port</option>
          </select>

          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#d8e4f1] bg-white text-[#121d26] focus:outline-none"
          >
            <option>Q3-Q4 2024 (Harvest &amp; Festive)</option>
            <option>Q1-Q2 2024 (Annual Cycle)</option>
            <option>Historical 2023</option>
          </select>

          {/* Export Report */}
          <button
            onClick={() => showToast('Report Exported', 'Statutory Q3 summary exported as verified CSV.', 'info')}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#d8e4f1] hover:bg-[#f8f9fa] text-[#4e6073] flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#27ae60]" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Regulated Devices */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4e6073] uppercase tracking-wider">
              Regulated Instruments
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#eef8f1] text-[#16a34a] flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-metric text-2xl font-extrabold text-[#0c2340]">482,910</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              +4.2% YoY
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[#4e6073]">
            12.8k new registrations in Q3
          </div>
        </div>

        {/* Card 2: National Compliance Rate */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4e6073] uppercase tracking-wider">
              Statutory Compliance
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-metric text-2xl font-extrabold text-[#27ae60]">98.4%</span>
            <span className="text-xs font-semibold text-[#4e6073]">Target: 98.0%</span>
          </div>
          <div className="mt-1 text-[11px] text-[#4e6073]">
            +0.6% improvement post-digitization
          </div>
        </div>

        {/* Card 3: Route Mileage Saved */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4e6073] uppercase tracking-wider">
              Route Mileage Saved
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-metric text-2xl font-extrabold text-[#0c2340]">31.8%</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              -24.4 km/day
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[#4e6073]">
            TSP heuristic cluster optimization
          </div>
        </div>

        {/* Card 4: Pending Re-verifications */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4e6073] uppercase tracking-wider">
              Due Re-verifications
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-metric text-2xl font-extrabold text-red-600">1,420</span>
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
              Due &lt;14d
            </span>
          </div>
          <div className="mt-1 text-[11px] text-[#4e6073]">
            Action mandated under Section 24
          </div>
        </div>
      </div>

      {/* Middle Grid: Predictive Workload Analytics + TSP Geospatial Route Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Predictive Workload Analytics Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <div>
                <h3 className="font-display font-bold text-base text-[#0c2340] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#16a34a]" />
                  Predictive Seasonal Workload Analytics
                </h3>
                <p className="text-xs text-[#4e6073] mt-0.5">
                  Algorithmic projection of inspection demand vs standard inspector capacity
                </p>
              </div>
              <span className="text-[11px] font-mono font-semibold bg-[#eef8f1] text-[#15803d] px-2 py-0.5 rounded border border-[#c6edd0]">
                ML-Forecast v3.2
              </span>
            </div>

            {/* Custom High-Precision CSS Bar Chart */}
            <div className="mt-6 space-y-4">
              {/* Capacity Reference Line */}
              <div className="relative pt-2 pb-4">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                  <span>Capacity Threshold (26,000 devices/qtr)</span>
                  <span className="font-mono font-bold text-[#e67e22]">26.0k Baseline</span>
                </div>
                <div className="w-full h-1 bg-[#f1f5f9] relative">
                  <div className="absolute top-0 bottom-0 left-0 w-full border-t border-dashed border-[#e67e22]"></div>
                </div>
              </div>

              {/* Bar 1: Q1 Post-Audit */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#121d26]">Q1: Baseline Industrial</span>
                  <span className="font-mono text-gray-600">18.2k verified (70% cap)</span>
                </div>
                <div className="w-full h-6 bg-[#f1f5f9] rounded-md overflow-hidden flex">
                  <div className="h-full bg-[#3498db] transition-all" style={{ width: '43%' }}></div>
                </div>
              </div>

              {/* Bar 2: Q2 Pre-Kharif Cycle */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#121d26]">Q2: Pre-Kharif Agri Cycle</span>
                  <span className="font-mono text-gray-600">24.5k verified (94% cap)</span>
                </div>
                <div className="w-full h-6 bg-[#f1f5f9] rounded-md overflow-hidden flex">
                  <div className="h-full bg-[#3498db] transition-all" style={{ width: '58%' }}></div>
                </div>
              </div>

              {/* Bar 3: Q3 Harvest Spike */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#121d26]">Q3: Harvest Mandi Surge</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 rounded">
                      +48% Spike
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[#e67e22]">42.1k projected (162% cap)</span>
                </div>
                <div className="w-full h-6 bg-[#f1f5f9] rounded-md overflow-hidden flex">
                  <div className="h-full bg-[#e67e22] transition-all" style={{ width: '92%' }}></div>
                </div>
              </div>

              {/* Bar 4: Q4 Festive Retail Surge */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#121d26]">Q4: Diwali &amp; Retail Peak</span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 rounded">
                      Festive Peak
                    </span>
                  </div>
                  <span className="font-mono font-bold text-purple-700">39.8k projected (153% cap)</span>
                </div>
                <div className="w-full h-6 bg-[#f1f5f9] rounded-md overflow-hidden flex">
                  <div className="h-full bg-[#9b59b6] transition-all" style={{ width: '87%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Automated Workload Recommendation Callout */}
          <div className="mt-6 p-3.5 bg-[#eef8f1] border border-[#c6edd0] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-[#15803d]">Automated Workload Recommendation:</div>
                <p className="text-gray-700 mt-0.5">
                  {workloadReallocated
                    ? '4 Inspectors reallocated to Zone 4B (Vashi APMC Hub). Projected backlog reduced by 78%.'
                    : 'Reallocate 4 inspectors from Zone 1 to Zone 4B for festive retail surge to prevent backlog.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleExecuteReallocation}
              disabled={workloadReallocated}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 shadow-2xs cursor-pointer ${
                workloadReallocated
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.98] text-white'
              }`}
            >
              {workloadReallocated ? '✓ Deployed' : 'Execute'}
            </button>
          </div>
        </div>

        {/* Right Column: Geospatial Route Optimization (TSP Engine) (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <div>
                <h3 className="font-display font-bold text-base text-[#0c2340] flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#16a34a]" />
                  Geospatial Route Optimization
                </h3>
                <p className="text-xs text-[#4e6073] mt-0.5">
                  TSP (Traveling Salesperson) dynamic cluster routing
                </p>
              </div>
              <button
                onClick={handleRecalculateTSP}
                disabled={isRecalculatingTSP}
                className="p-1.5 text-[#4e6073] hover:text-[#121d26] hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                title="Recalculate Optimal Tour"
              >
                <RefreshCw className={`w-4 h-4 ${isRecalculatingTSP ? 'animate-spin text-[#16a34a]' : ''}`} />
              </button>
            </div>

            {/* Map Preview Container */}
            <div className="mt-4 relative rounded-xl overflow-hidden border border-[#d8e4f1] h-48 bg-slate-900 group">
              {/* Satellite / Geospatial background */}
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
                alt="Geospatial Map Satellite Cluster"
                className="w-full h-full object-cover opacity-60 filter contrast-125"
                referrerPolicy="no-referrer"
              />

              {/* Map Overlays: Route Path & Inspection Nodes */}
              <div className="absolute inset-0 bg-radial from-transparent to-black/70 pointer-events-none"></div>

              {/* Inspector Current Position Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27ae60] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#27ae60] border-2 border-white"></span>
                </span>
                <span className="mt-1 px-2 py-0.5 bg-black/80 text-white rounded text-[9px] font-bold font-mono tracking-wider backdrop-blur-xs">
                  A. Verma • Stop #4
                </span>
              </div>

              {/* Other Route Waypoints */}
              <div className="absolute top-6 left-12 w-2.5 h-2.5 rounded-full bg-blue-400 border border-white"></div>
              <div className="absolute bottom-8 right-16 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white"></div>
              <div className="absolute top-10 right-20 w-2.5 h-2.5 rounded-full bg-white border border-gray-400"></div>

              {/* Route Summary Badge */}
              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md rounded-lg p-2 text-white text-xs border border-white/10">
                <div className="flex items-center gap-3 font-mono">
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase">Optimized</span>
                    <span className="font-bold text-emerald-400">14.2 km</span>
                  </div>
                  <div className="h-4 w-px bg-white/20"></div>
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase">Unoptimized</span>
                    <span className="line-through text-gray-400">38.6 km</span>
                  </div>
                  <div className="h-4 w-px bg-white/20"></div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded">
                    Saved 63%
                  </span>
                </div>
              </div>
            </div>

            {/* Stop Sequence List */}
            <div className="mt-4 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#4e6073]">
                Today's Inspection Sequence (APMC &amp; Port Belt)
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1 text-xs">
                {tspStops.map((stop) => (
                  <div
                    key={stop.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#f8f9fa] border border-[#e2e8f0]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-[10px] text-gray-700 shrink-0">
                        {stop.id}
                      </span>
                      <span className="font-medium text-[#121d26] truncate">{stop.name}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${
                        stop.status.includes('Completed')
                          ? 'bg-emerald-50 text-emerald-700'
                          : stop.status.includes('Current')
                          ? 'bg-amber-100 text-amber-800 font-bold'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {stop.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center justify-between">
            <span className="text-xs text-[#4e6073]">
              Active Officer: <strong>Anand Verma</strong> (MH-LM-1092)
            </span>
            <button
              onClick={handleRecalculateTSP}
              className="text-xs font-semibold text-[#16a34a] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Re-Calculate Optimal Tour
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Stakeholder Governance & Licensing Directory */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fafbfc]">
          <div>
            <h3 className="font-display font-bold text-base text-[#0c2340] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#16a34a]" />
              Regulated Stakeholder Governance Directory
            </h3>
            <p className="text-xs text-[#4e6073] mt-0.5">
              Manufacturers, repairers, commercial weighbridge operators and licensed traders
            </p>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search stakeholder or license..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#d8e4f1] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/30 w-56 sm:w-64 bg-white"
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-[#e2e8f0] px-4 bg-white text-xs font-semibold gap-4">
          <button
            onClick={() => setStakeholderTab('all')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              stakeholderTab === 'all'
                ? 'border-[#16a34a] text-[#15803d]'
                : 'border-transparent text-[#4e6073] hover:text-[#121d26]'
            }`}
          >
            All Stakeholders (4,210)
          </button>
          <button
            onClick={() => setStakeholderTab('pending')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              stakeholderTab === 'pending'
                ? 'border-[#16a34a] text-[#15803d]'
                : 'border-transparent text-[#4e6073] hover:text-[#121d26]'
            }`}
          >
            Pending Approval (14)
          </button>
          <button
            onClick={() => setStakeholderTab('active')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              stakeholderTab === 'active'
                ? 'border-[#16a34a] text-[#15803d]'
                : 'border-transparent text-[#4e6073] hover:text-[#121d26]'
            }`}
          >
            Active &amp; Certified (4,180)
          </button>
          <button
            onClick={() => setStakeholderTab('flagged')}
            className={`py-3 border-b-2 transition-colors ${
              stakeholderTab === 'flagged'
                ? 'border-[#e74c3c] text-[#e74c3c]'
                : 'border-transparent text-[#4e6073] hover:text-[#121d26]'
            }`}
          >
            Flagged for Audit (16)
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8f9fa] text-[#4e6073] font-semibold border-b border-[#e2e8f0]">
              <tr>
                <th className="py-3 px-4">Organization / Establishment</th>
                <th className="py-3 px-4">License Number</th>
                <th className="py-3 px-4">Stakeholder Role</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">Compliance Score</th>
                <th className="py-3 px-4 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {filteredStakeholders.map((s) => (
                <tr key={s.id} className="hover:bg-[#f8f9fa] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#121d26]">{s.name}</div>
                    <div className="text-[11px] text-[#4e6073]">{s.subtext}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#0c2340]">
                    {s.licenseNo}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {s.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {s.status === 'certified' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        Certified
                      </span>
                    )}
                    {s.status === 'active' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        Active Node
                      </span>
                    )}
                    {s.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Pending Approval
                      </span>
                    )}
                    {s.status === 'flagged' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                        <AlertTriangle className="w-3 h-3" />
                        Flagged Non-compliant
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            s.complianceScore > 90
                              ? 'bg-emerald-500'
                              : s.complianceScore > 80
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${s.complianceScore}%` }}
                        ></div>
                      </div>
                      <span className="font-mono font-bold text-[#121d26]">
                        {s.complianceScore}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => onOpenStakeholder(s)}
                      className="px-2.5 py-1 rounded-lg bg-[#eef8f1] hover:bg-[#dcfce7] text-[#15803d] font-semibold transition-colors cursor-pointer border border-[#c6edd0]"
                    >
                      View Profile
                    </button>
                    {s.status === 'flagged' ? (
                      <button
                        onClick={onEmergencyAudit}
                        className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-semibold transition-colors"
                      >
                        Deactivate / Audit
                      </button>
                    ) : s.status === 'pending' ? (
                      <button
                        onClick={() => showToast('License Approved', `Approved license for ${s.name}`, 'success')}
                        className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold transition-colors"
                      >
                        Approve License
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
