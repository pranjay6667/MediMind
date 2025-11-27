import React from 'react';
import { Medicine, IntakeLog, LogStatus } from '../types';
import MedicineCard from './MedicineCard';
import { Calendar, CloudSun, Moon, Sun, ChevronRight, Zap } from 'lucide-react';

interface DashboardProps {
  medicines: Medicine[];
  logs: IntakeLog[];
  onLogIntake: (medId: string, status: LogStatus) => void;
  userName?: string;
  onProfileClick?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ medicines, logs, onLogIntake, userName, onProfileClick }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentHour = new Date().getHours();
  
  // Determine Greeting & Icon
  let greeting = "Good Day";
  let GreetingIcon = Sun;
  
  if (currentHour < 12) {
    greeting = "Good Morning";
    GreetingIcon = CloudSun;
  } else if (currentHour < 18) {
    greeting = "Good Afternoon";
    GreetingIcon = Sun;
  } else {
    greeting = "Good Evening";
    GreetingIcon = Moon;
  }

  // Sort medicines by time
  const sortedMedicines = [...medicines].sort((a, b) => a.time.localeCompare(b.time));

  const getStatus = (medId: string) => {
    return logs.some(log => log.medicineId === medId && log.dateStr === todayStr);
  };

  const completedCount = logs.filter(l => l.dateStr === todayStr && l.status === LogStatus.TAKEN).length;
  const totalCount = medicines.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // Circular progress calculation
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Enhanced Header Widget */}
      <div 
        onClick={onProfileClick}
        className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-900 dark:to-gray-950 p-6 rounded-[2rem] text-white shadow-2xl shadow-gray-500/20 dark:shadow-black/40 cursor-pointer group transition-transform active:scale-[0.99] border border-white/10"
      >
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -ml-12 -mb-12"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

        <div className="relative z-10 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1 opacity-80">
                <GreetingIcon size={16} className="text-teal-300" />
                <span className="text-xs font-medium tracking-wider uppercase text-teal-100/80">{greeting}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
               {userName || 'Guest'}
               <ChevronRight size={20} className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </h1>
            <p className="text-sm text-gray-400 mt-1">You have {totalCount - completedCount} meds left today.</p>
          </div>

          {/* Circular Progress Indicator */}
          <div className="relative w-16 h-16 flex items-center justify-center">
             {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-gray-700"
                />
                <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="text-teal-400 transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {progress === 100 ? (
                    <Zap size={20} className="text-yellow-400 fill-yellow-400 animate-scale-in" />
                ) : (
                    <span className="text-xs font-bold">{progress}%</span>
                )}
            </div>
          </div>
        </div>
        
        {/* Quick Stats Strip */}
        <div className="mt-6 pt-4 border-t border-white/10 flex gap-6">
            <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wide">Taken</span>
                <span className="text-lg font-bold text-white leading-none mt-1">{completedCount}<span className="text-gray-600 text-sm">/{totalCount}</span></span>
            </div>
             <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wide">Streak</span>
                <span className="text-lg font-bold text-teal-400 leading-none mt-1 flex items-center gap-1">
                    5 <Zap size={12} className="fill-teal-400" />
                </span>
            </div>
        </div>
      </div>

      {/* Schedule */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar size={20} className="text-teal-600 dark:text-teal-400"/> Today's Plan
          </h2>
          <span className="text-xs font-bold px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric' })}
          </span>
        </div>

        {medicines.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 transition-colors">
            <div className="bg-teal-50 dark:bg-teal-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 hover:rotate-6 transition-transform">
                <Calendar size={28} className="text-teal-500 dark:text-teal-400" />
            </div>
            <p className="text-gray-900 dark:text-white font-bold text-lg">All clear for now</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-[200px] mx-auto">Your schedule is empty. Add a medicine to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedMedicines.map((med, index) => (
              <div key={med.id} className="animate-slide-up" style={{ animationDelay: `${index * 75}ms` }}>
                  <MedicineCard 
                    medicine={med} 
                    isTaken={getStatus(med.id)} 
                    onAction={onLogIntake} 
                  />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;