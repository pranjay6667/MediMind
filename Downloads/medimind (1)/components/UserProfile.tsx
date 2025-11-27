import React, { useState, useEffect } from 'react';
import { User, Shield, CheckCircle, ChevronRight, Settings, Save, X, Bell, BellOff, Zap, Activity, Heart, Smartphone, Flame, FileText, Calendar, Edit3 } from 'lucide-react';
import { IntakeLog, LogStatus, Medicine, MedicalProfile } from '../types';
import { requestNotificationPermission, sendNotification } from '../services/notificationService';
import { fetchMedicalProfile, saveMedicalProfile } from '../services/storageService';

interface UserProfileProps {
  userName: string;
  email: string;
  medicines: Medicine[];
  logs: IntakeLog[];
  onUpdateProfile: (name: string, email: string) => void;
  onLogout: () => void;
  onBack: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  userName, 
  email, 
  medicines, 
  logs, 
  onUpdateProfile, 
  onLogout,
  onBack
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Medical ID State
  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile>({
    bloodType: '',
    allergies: '',
    conditions: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });
  const [isEditingMedID, setIsEditingMedID] = useState(false);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
    loadMedicalProfile();
  }, []);

  const loadMedicalProfile = async () => {
    const profile = await fetchMedicalProfile();
    if (profile) {
      setMedicalProfile(profile);
    }
  };

  const handleSaveMedID = async () => {
    await saveMedicalProfile(medicalProfile);
    setIsEditingMedID(false);
  };

  const totalDoses = logs.filter(l => l.status === LogStatus.TAKEN).length;
  
  // --- Streak Calculation ---
  const calculateStreak = () => {
    const takenDates = [...new Set(logs.filter(l => l.status === LogStatus.TAKEN).map(l => l.dateStr))].sort();
    if (takenDates.length === 0) return { current: 0, longest: 0 };

    let maxStreak = 1;
    let runningStreak = 1;

    for (let i = 1; i < takenDates.length; i++) {
      const prevDateStr = takenDates[i-1] as string;
      const currDateStr = takenDates[i] as string;
      
      const prev = new Date(prevDateStr);
      const curr = new Date(currDateStr);
      const diffTime = Math.abs(curr.getTime() - prev.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        runningStreak++;
      } else {
        maxStreak = Math.max(maxStreak, runningStreak);
        runningStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, runningStreak);
    
    // Determine if current streak is active (today or yesterday)
    const lastDateStr = takenDates[takenDates.length - 1] as string;
    const lastDate = new Date(lastDateStr);
    const today = new Date();
    const diffToToday = Math.ceil(Math.abs(today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // If last taken was today or yesterday, streak is alive. Else 0.
    const activeCurrentStreak = diffToToday <= 1 ? runningStreak : 0;

    return { current: activeCurrentStreak, longest: maxStreak };
  };

  const { current: currentStreak, longest: longestStreak } = calculateStreak();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editName, email);
    setIsEditing(false);
  };

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      sendNotification("Notifications Active", "You will now receive reminders for your medicines.");
    } else {
      alert("Please enable notifications in your browser settings.");
    }
  };

  const testNotification = () => {
    sendNotification("MediMind Test", "This is how your medicine reminders will look!");
  };

  return (
    <div className="flex flex-col h-full animate-slide-up pb-24">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ChevronRight className="rotate-180 text-gray-600 dark:text-gray-300" size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Profile</h2>
      </div>

      {/* Profile Card */}
      <div className="glass-card p-6 rounded-3xl shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <User size={120} />
        </div>
        
        <div className="flex flex-col items-center z-10 relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4 ring-4 ring-white dark:ring-gray-800">
                {userName.charAt(0).toUpperCase()}
            </div>
            
            {!isEditing ? (
                <>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{userName}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        {email.includes('@medimind.com') ? `@${email.split('@')[0]}` : email}
                    </p>
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Edit Name
                    </button>
                </>
            ) : (
                <form onSubmit={handleSave} className="w-full max-w-xs space-y-3 animate-fade-in">
                    <div>
                        <input 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full p-2 text-center bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-gray-900 dark:text-white"
                            placeholder="Display Name"
                        />
                    </div>
                    <div className="flex gap-2 justify-center mt-2">
                        <button type="button" onClick={() => setIsEditing(false)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            <X size={18} />
                        </button>
                        <button type="submit" className="p-2 rounded-full bg-teal-500 text-white shadow-lg shadow-teal-500/30">
                            <Save size={18} />
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>

      {/* Stats Grid */}
      <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ml-1">Health Stats</h4>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <CheckCircle size={20} />
            </div>
            <span className="text-2xl font-bold text-gray-800 dark:text-white">{totalDoses}</span>
            <span className="text-xs text-gray-500 font-medium uppercase">Total Doses</span>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                <Flame size={20} />
            </div>
            <span className="text-2xl font-bold text-gray-800 dark:text-white">{currentStreak} <span className="text-sm text-gray-400 font-normal">/ {longestStreak}</span></span>
            <span className="text-xs text-gray-500 font-medium uppercase">Streak (Cur/Max)</span>
        </div>
      </div>

      {/* Medical ID Card */}
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Medical ID</h4>
        {!isEditingMedID && (
           <button onClick={() => setIsEditingMedID(true)} className="text-teal-600 dark:text-teal-400 text-xs font-bold flex items-center gap-1">
             <Edit3 size={12} /> Edit
           </button>
        )}
      </div>
      
      <div className="bg-red-500 dark:bg-red-600 rounded-3xl shadow-xl shadow-red-500/20 text-white p-6 relative overflow-hidden mb-6 transition-all">
        <div className="absolute top-0 right-0 p-6 opacity-20">
            <Activity size={100} />
        </div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 border-b border-white/20 pb-4">
                <Heart className="fill-white" size={24} />
                <h3 className="text-xl font-bold tracking-tight">Emergency Info</h3>
            </div>
            
            {isEditingMedID ? (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] uppercase font-bold opacity-80">Blood Type</label>
                            <select 
                                value={medicalProfile.bloodType}
                                onChange={(e) => setMedicalProfile({...medicalProfile, bloodType: e.target.value})}
                                className="w-full mt-1 bg-white/20 border border-white/30 rounded-lg p-2 text-sm focus:outline-none text-white placeholder-white/50"
                            >
                                <option value="" className="text-gray-800">Select...</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                                    <option key={t} value={t} className="text-gray-800">{t}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold opacity-80">Contact Phone</label>
                            <input 
                                value={medicalProfile.emergencyContactPhone}
                                onChange={(e) => setMedicalProfile({...medicalProfile, emergencyContactPhone: e.target.value})}
                                className="w-full mt-1 bg-white/20 border border-white/30 rounded-lg p-2 text-sm focus:outline-none text-white placeholder-white/50"
                                placeholder="555-0123"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold opacity-80">Allergies</label>
                        <input 
                            value={medicalProfile.allergies}
                            onChange={(e) => setMedicalProfile({...medicalProfile, allergies: e.target.value})}
                            className="w-full mt-1 bg-white/20 border border-white/30 rounded-lg p-2 text-sm focus:outline-none text-white placeholder-white/50"
                            placeholder="Peanuts, Penicillin..."
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold opacity-80">Emergency Contact Name</label>
                        <input 
                            value={medicalProfile.emergencyContactName}
                            onChange={(e) => setMedicalProfile({...medicalProfile, emergencyContactName: e.target.value})}
                            className="w-full mt-1 bg-white/20 border border-white/30 rounded-lg p-2 text-sm focus:outline-none text-white placeholder-white/50"
                            placeholder="Jane Doe"
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button onClick={() => setIsEditingMedID(false)} className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold text-xs">Cancel</button>
                        <button onClick={handleSaveMedID} className="flex-1 py-2 bg-white text-red-600 rounded-lg font-bold text-xs shadow-lg">Save Info</button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                        <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Blood Type</p>
                        <p className="text-lg font-bold">{medicalProfile.bloodType || 'Not Set'}</p>
                    </div>
                    <div>
                         <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Conditions</p>
                        <p className="text-sm font-medium leading-tight">{medicalProfile.conditions || 'None listed'}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-[10px] uppercase font-bold opacity-70 mb-1">Allergies</p>
                        <p className="text-sm font-medium leading-tight">{medicalProfile.allergies || 'No known allergies'}</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-white/20">
                         <p className="text-[10px] uppercase font-bold opacity-70 mb-2">Emergency Contact</p>
                         <div className="flex items-center gap-3">
                             <div className="bg-white/20 p-2 rounded-full">
                                 <Smartphone size={18} />
                             </div>
                             <div>
                                 <p className="font-bold text-sm">{medicalProfile.emergencyContactName || 'Not Set'}</p>
                                 <p className="text-xs opacity-90 font-mono">{medicalProfile.emergencyContactPhone}</p>
                             </div>
                         </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Notifications Demo Section */}
      <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ml-1">Notifications</h4>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${notificationsEnabled ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600' : 'bg-gray-100 text-gray-400'}`}>
                {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
            </div>
            <div>
                <p className="font-medium text-gray-900 dark:text-white">Reminders</p>
                <p className="text-xs text-gray-500">{notificationsEnabled ? 'Enabled & Ready' : 'Permissions needed'}</p>
            </div>
         </div>
         <div className="flex gap-2">
            {!notificationsEnabled ? (
                <button onClick={enableNotifications} className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-lg shadow-md shadow-teal-500/20">
                    Enable
                </button>
            ) : (
                <button onClick={testNotification} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg flex items-center gap-1">
                    <Zap size={12} /> Test
                </button>
            )}
         </div>
      </div>

      {/* Settings List */}
      <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ml-1">Account</h4>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                    <Settings size={18} className="text-gray-600 dark:text-gray-300" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-200">App Settings</span>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
        </button>
        <button 
            onClick={onLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"
        >
            <div className="flex items-center gap-3">
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                    <User size={18} className="text-red-500" />
                </div>
                <span className="font-medium text-red-600 dark:text-red-400">Log Out</span>
            </div>
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400">MediMind v1.0.3</p>
      </div>
    </div>
  );
};

export default UserProfile;