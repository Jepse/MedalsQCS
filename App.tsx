import React, { useState, useEffect } from 'react';
import MedalTable from './components/MedalTable';
import { processMedals } from './utils/processor';
import { OLYMPIC_DATA } from './data/currentData'; // Updated import source
import { INITIAL_COUNTRY_STATS } from './data/mockOlympics'; // Keeping initial country list
import { CountryStats } from './types';
import { REGIONS } from './data/regionalData';

const App: React.FC = () => {
  const [useRegionalLogic, setUseRegionalLogic] = useState<boolean>(true);
  const [stats, setStats] = useState<CountryStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // In a real app, this would be a fetch call to the scraper JSON endpoint
  // Effect runs whenever the toggle changes
  useEffect(() => {
    setLoading(true);
    
    // Simulate slight processing delay for realism
    const timer = setTimeout(() => {
      if (useRegionalLogic) {
        // Run the "State-less" re-attribution logic
        const result = processMedals(OLYMPIC_DATA, INITIAL_COUNTRY_STATS);
        setStats(result.stats);
      } else {
        // Just standard logic: Aggregate OLYMPIC_DATA by countryCode
        // This is a simplified "Official" view
        const officialStatsMap = new Map<string, CountryStats>();
        
        // Init base
        INITIAL_COUNTRY_STATS.forEach(c => officialStatsMap.set(c.countryCode, {...c}));
        
        OLYMPIC_DATA.forEach(win => {
            if (!officialStatsMap.has(win.countryCode)) {
                 officialStatsMap.set(win.countryCode, {
                    rank: 0,
                    countryCode: win.countryCode,
                    countryName: win.countryCode, // simplified
                    flagUrl: `https://flagcdn.com/w320/${win.countryCode.toLowerCase().slice(0,2)}.png`,
                    gold: 0, silver: 0, bronze: 0, total: 0
                });
            }
            const stat = officialStatsMap.get(win.countryCode)!;
            if (win.medal === 'Gold') stat.gold++;
            if (win.medal === 'Silver') stat.silver++;
            if (win.medal === 'Bronze') stat.bronze++;
            stat.total++;
        });

        const sortedOfficial = Array.from(officialStatsMap.values()).sort((a, b) => {
           if (b.gold !== a.gold) return b.gold - a.gold;
           if (b.silver !== a.silver) return b.silver - a.silver;
           if (b.bronze !== a.bronze) return b.bronze - a.bronze;
           return a.countryName.localeCompare(b.countryName);
        });
        
        sortedOfficial.forEach((s, i) => s.rank = i + 1);

        setStats(sortedOfficial);
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [useRegionalLogic]);

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 shadow-lg relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
             <div className="flex -space-x-4">
                 <div className="w-16 h-16 rounded-full border-4 border-blue-400"></div>
                 <div className="w-16 h-16 rounded-full border-4 border-yellow-400"></div>
                 <div className="w-16 h-16 rounded-full border-4 border-gray-100"></div>
                 <div className="w-16 h-16 rounded-full border-4 border-green-500"></div>
                 <div className="w-16 h-16 rounded-full border-4 border-red-500"></div>
             </div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Milano Cortina 2026</h1>
            <p className="text-blue-200 font-medium">Medals</p>
          </div>
          
          <div className="bg-white/10 p-1 rounded-lg flex items-center gap-1 backdrop-blur-sm">
             <button 
                onClick={() => setUseRegionalLogic(false)}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${!useRegionalLogic ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-white/5'}`}
             >
                Official
             </button>
             <button 
                onClick={() => setUseRegionalLogic(true)}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${useRegionalLogic ? 'bg-blue-500 text-white shadow-sm' : 'text-blue-100 hover:bg-white/5'}`}
             >
                Independent Nations
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-6 mt-6">
        
        {/* Single Column: The Table */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                    {useRegionalLogic ? 'Including Independent Nations' : 'Official Medal Table'}
                </h2>
            </div>
            
            <MedalTable stats={stats} loading={loading} />

        </div>

      </main>

       <footer className="max-w-6xl mx-auto p-6 text-center text-slate-400 text-sm">
           &copy; 2025 Regional Attribution Project. Not affiliated with the IOC.
       </footer>
    </div>
  );
};

export default App;