import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { IntakeLog, LogStatus } from '../types';
import { TrendingUp, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface HistoryViewProps {
  logs: IntakeLog[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ logs }) => {
  // Generate last 7 days data
  const getLast7DaysData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayLogs = logs.filter(l => l.dateStr === dateStr);
      const taken = dayLogs.filter(l => l.status === LogStatus.TAKEN).length;
      const skipped = dayLogs.filter(l => l.status === LogStatus.SKIPPED).length;
      
      data.push({
        name: dayLabel,
        taken,
        skipped,
        total: taken + skipped,
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    return data;
  };

  const data = getLast7DaysData();
  const totalTaken = logs.filter(l => l.status === LogStatus.TAKEN).length;
  const totalSkipped = logs.filter(l => l.status === LogStatus.SKIPPED).length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 text-sm">
          <p className="font-bold text-gray-800 dark:text-gray-200 mb-2">{payload[0].payload.date}</p>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
            <CheckCircle size={14} />
            <span>Taken: <span className="font-bold">{payload[0].value}</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 mt-1">
             <XCircle size={14} />
             <span>Skipped: <span className="font-bold">{payload[0].payload.skipped}</span></span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Adherence History</h2>
        <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-xl text-teal-600 dark:text-teal-400">
            <TrendingUp size={20} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 dark:bg-teal-900/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Calendar size={14} /> Weekly Overview
        </h3>
        
        <div className="h-64 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTaken" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.4}/>
                </linearGradient>
                <linearGradient id="colorEmpty" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e5e7eb" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#e5e7eb" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grid-color, #f3f4f6)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                fontSize={12} 
                tick={{fill: '#9ca3af', fontWeight: 500}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                fontSize={12} 
                tick={{fill: '#9ca3af'}} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              <Bar 
                dataKey="taken" 
                fill="url(#colorTaken)" 
                radius={[8, 8, 8, 8]} 
                barSize={16}
                animationDuration={1500}
              >
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center transition-colors hover:shadow-md duration-300">
          <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-2">
            <CheckCircle size={20} />
          </div>
          <span className="text-3xl font-bold text-gray-800 dark:text-white">{totalTaken}</span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">Total Doses</span>
        </div>
         <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center transition-colors hover:shadow-md duration-300">
          <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 mb-2">
            <Calendar size={20} />
          </div>
          <span className="text-3xl font-bold text-gray-800 dark:text-white">{data[data.length-1].taken}</span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">Taken Today</span>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 rounded-2xl shadow-lg shadow-blue-500/20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="relative z-10">
            <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-200" /> Keep it up!
            </h4>
            <p className="text-sm text-blue-100 opacity-90 leading-relaxed">
                Consistency is key. You've maintained a great streak this week. Your health is your wealth!
            </p>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;