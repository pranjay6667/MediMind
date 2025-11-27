import React from 'react';
import { Activity, ShieldCheck, Bell, ArrowRight, Bot, Sparkles } from 'lucide-react';

interface WelcomePageProps {
  onGetStarted: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-700 text-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-teal-300/20 rounded-full blur-3xl"></div>
      <div className="absolute top-[20%] left-[10%] w-20 h-20 bg-emerald-400/20 rounded-full blur-2xl"></div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 z-10">
        {/* Logo/Hero Section */}
        <div className="mb-8 text-center animate-in slide-in-from-bottom-5 fade-in duration-700">
          <div className="bg-white/20 p-6 rounded-3xl backdrop-blur-md inline-block mb-6 shadow-2xl border border-white/10 relative">
             <Activity size={56} className="text-white drop-shadow-md" strokeWidth={2.5} />
             <div className="absolute -top-2 -right-2 bg-yellow-400 p-1.5 rounded-full shadow-lg">
                <Sparkles size={16} className="text-yellow-900" />
             </div>
          </div>
          <h1 className="text-5xl font-extrabold mb-3 tracking-tight drop-shadow-sm">MediMind</h1>
          <p className="text-teal-100 text-lg font-medium opacity-90">Your intelligent health companion.</p>
        </div>

        {/* Features List */}
        <div className="space-y-4 w-full max-w-xs animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-150">
          <FeatureRow
            icon={<Bell size={20} className="text-teal-600" />}
            title="Smart Reminders"
            desc="Never miss a dose with timely alerts."
          />
          <FeatureRow
            icon={<ShieldCheck size={20} className="text-teal-600" />}
            title="Track Progress"
            desc="Monitor your adherence history."
          />
          <FeatureRow
            icon={<Bot size={20} className="text-teal-600" />}
            title="AI Health Insights"
            desc="Check interactions & ask questions."
          />
        </div>
      </div>

      {/* Action Area */}
      <div className="p-8 z-10 pb-12 animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-300">
        <button 
          onClick={onGetStarted}
          className="w-full bg-white text-teal-700 font-bold text-xl py-4 rounded-2xl shadow-xl shadow-teal-900/20 hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-3 group"
        >
          Get Started
          <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const FeatureRow = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex items-center gap-4 bg-white/10 p-3 rounded-2xl border border-white/5 backdrop-blur-sm hover:bg-white/15 transition-colors">
    <div className="bg-white p-2.5 rounded-xl shadow-sm shrink-0">
      {icon}
    </div>
    <div className="text-left">
      <h3 className="font-bold text-white text-base leading-tight">{title}</h3>
      <p className="text-sm text-teal-50/80 leading-tight mt-0.5">{desc}</p>
    </div>
  </div>
);

export default WelcomePage;