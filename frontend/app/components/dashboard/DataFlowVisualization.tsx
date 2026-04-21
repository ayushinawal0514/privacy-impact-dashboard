import React from "react";

export default function DataFlowVisualization() {
  return (
    <div className="rounded-lg border bg-white p-8 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-8">
        Healthcare Data Flow Architecture
      </h3>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-0">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-lg bg-blue-100 border-2 border-blue-400 flex items-center justify-center mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">👤</p>
              <p className="text-xs font-semibold text-blue-700 mt-1">Patient</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 text-center">Data Source</p>
        </div>
        <div className="hidden lg:flex items-center justify-center w-12">
          <div className="w-full h-1 bg-slate-300" />
          <div className="absolute w-3 h-3 bg-slate-400 transform rotate-45 ml-2" />
        </div>
        <div className="lg:hidden w-1 h-8 bg-slate-300 relative">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-400 rotate-45 translate-y-1" />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-lg bg-green-100 border-2 border-green-400 flex items-center justify-center mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">☁️</p>
              <p className="text-xs font-semibold text-green-700 mt-1">Cloud</p>
              <p className="text-xs font-semibold text-green-700">Storage</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 text-center">Data Lake</p>
        </div>
        <div className="hidden lg:flex items-center justify-center w-12">
          <div className="w-full h-1 bg-slate-300" />
          <div className="absolute w-3 h-3 bg-slate-400 transform rotate-45 ml-2" />
        </div>
        <div className="lg:hidden w-1 h-8 bg-slate-300 relative">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-400 rotate-45 translate-y-1" />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-lg bg-purple-100 border-2 border-purple-400 flex items-center justify-center mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">🤖</p>
              <p className="text-xs font-semibold text-purple-700 mt-1">Risk</p>
              <p className="text-xs font-semibold text-purple-700">Analyzer</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 text-center">Analysis Engine</p>
        </div>
        <div className="hidden lg:flex items-center justify-center w-12">
          <div className="w-full h-1 bg-slate-300" />
          <div className="absolute w-3 h-3 bg-slate-400 transform rotate-45 ml-2" />
        </div>
        <div className="lg:hidden w-1 h-8 bg-slate-300 relative">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-400 rotate-45 translate-y-1" />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-lg bg-orange-100 border-2 border-orange-400 flex items-center justify-center mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">✓</p>
              <p className="text-xs font-semibold text-orange-700 mt-1">Compliance</p>
              <p className="text-xs font-semibold text-orange-700">Engine</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 text-center">Enforcement</p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs text-slate-600">
          <span className="font-semibold text-slate-900">Architecture Overview:</span> Patient healthcare data flows through cloud storage systems, where automated ML-powered risk analyzers identify potential privacy vulnerabilities. The compliance engine validates data handling against regulatory standards (HIPAA, DPDP) and enforces corrective actions.
        </p>
      </div>
    </div>
  );
}
