import React from 'react';
import { TransferLog, MedalType } from '../types';

interface Props {
  log: TransferLog;
}

const TransferCard: React.FC<Props> = ({ log }) => {
  const getMedalColor = (m: MedalType) => {
    switch (m) {
      case MedalType.GOLD: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case MedalType.SILVER: return 'bg-slate-200 text-slate-800 border-slate-300';
      case MedalType.BRONZE: return 'bg-orange-100 text-orange-800 border-orange-300';
    }
  };

  return (
    <div className={`p-3 mb-2 rounded-lg border-l-4 shadow-sm bg-white flex items-center justify-between animate-fade-in-up ${getMedalColor(log.medal).replace('bg-', 'border-')}`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${getMedalColor(log.medal)}`}>
            {log.medal}
          </span>
          <span className="text-sm font-semibold text-gray-700">{log.event}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Stolen from <span className="font-bold text-red-500">{log.originalCountry}</span> for <span className="font-bold text-green-600">{log.newRegion}</span>
        </div>
        <div className="text-xs text-gray-400 mt-1 italic truncate max-w-[250px]">
          Athletes: {log.athleteNames.join(', ')}
        </div>
      </div>
    </div>
  );
};

export default TransferCard;