import React from 'react';
import { CountryStats } from '../types';

interface Props {
  stats: CountryStats[];
  loading: boolean;
}

const MedalTable: React.FC<Props> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-gray-400 animate-pulse">
        Processing Data...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold tracking-wider">
          <tr>
            <th className="p-4 border-b border-slate-200 w-16 text-center">Rank</th>
            <th className="p-4 border-b border-slate-200">Nation / Region</th>
            <th className="p-4 border-b border-slate-200 w-16 text-center bg-yellow-50 text-yellow-700">Gold</th>
            <th className="p-4 border-b border-slate-200 w-16 text-center bg-slate-50 text-slate-700">Silver</th>
            <th className="p-4 border-b border-slate-200 w-16 text-center bg-orange-50 text-orange-800">Bronze</th>
            <th className="p-4 border-b border-slate-200 w-16 text-center font-black">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {stats.map((row) => (
            <tr 
              key={row.countryCode} 
              className="transition-colors hover:bg-slate-50"
            >
              <td className="p-4 text-center font-mono text-slate-400 font-bold">{row.rank}</td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-6 relative shadow-sm rounded-sm overflow-hidden flex-shrink-0 bg-slate-200">
                    <img src={row.flagUrl} alt={row.countryName} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-bold text-slate-800">
                    {row.countryName}
                  </span>
                </div>
              </td>
              <td className="p-4 text-center font-bold text-yellow-600 bg-yellow-50/30">{row.gold}</td>
              <td className="p-4 text-center font-bold text-slate-600 bg-slate-50/30">{row.silver}</td>
              <td className="p-4 text-center font-bold text-orange-700 bg-orange-50/30">{row.bronze}</td>
              <td className="p-4 text-center font-black text-slate-800">{row.total}</td>
            </tr>
          ))}
          {stats.length === 0 && (
             <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No medals recorded yet.</td>
             </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MedalTable;