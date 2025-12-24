import GeoFencingMap from "../components/GeoFencingMap";
import ScorecardBuilder from "../components/ScorecardBuilder";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function RiskEngine() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-200">
          <ShieldCheckIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Risk & Eligibility Engine</h1>
          <p className="text-slate-500 font-medium">Configure global knockout rules, scoring models, and geo-restrictions.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
        
        {/* Left Column: Scorecards */}
        <div className="h-full">
          <ScorecardBuilder />
        </div>

        {/* Right Column: Geo-Fencing */}
        <div className="h-full">
          <GeoFencingMap />
        </div>

      </div>
    </div>
  );
}
