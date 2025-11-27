
import React, { useState, useEffect, useRef } from 'react';
import { Medicine, IntakeLog, LogStatus, ViewState } from './types';
import { 
  fetchMedicines, 
  addMedicine, 
  removeMedicine, 
  updateMedicine,
  fetchLogs, 
  addLog,
  subscribeToAuth,
  logoutUser,
  updateUserProfile
} from './services/storageService';
import Dashboard from './components/Dashboard';
import AddMedicineForm from './components/AddMedicineForm';
import HistoryView from './components/HistoryView';
import MedicineCard from './components/MedicineCard';
import AIChat from './components/AIChat';
import WelcomePage from './components/WelcomePage';
import LoginPage from './components/LoginPage';
import UserProfile from './components/UserProfile';
import HumanVerificationPage from './components/HumanVerificationPage';
import { LayoutGrid, Pill, ChartNoAxesColumn, Bot, Plus, Moon, Sun, HeartPulse, Loader2 } from 'lucide-react';
import { requestNotificationPermission, sendNotification } from './services/notificationService';

const App: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [logs, setLogs] = useState<IntakeLog[]>([]);
  const [view, setView] = useState<ViewState>('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Theme, Auth and Onboarding State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('medimind_theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  const [showWelcome, setShowWelcome] = useState(true);
  const [isVerified, setIsVerified] = useState(false); 
  const [currentUser, setCurrentUser] = useState<any>(null); // Store full firebase user object

  // Notification State Tracking
  const lastCheckedMinute = useRef<string>("");

  // Initial Auth & Data Load
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setIsLoading(true);
      if (user) {
        setCurrentUser(user);
        try {
          // Parallel fetch for speed
          const [fetchedMeds, fetchedLogs] = await Promise.all([
            fetchMedicines(),
            fetchLogs()
          ]);
          setMedicines(fetchedMeds);
          setLogs(fetchedLogs);
        } catch (error) {
          console.error("Failed to sync data:", error);
        }
      } else {
        setCurrentUser(null);
        setMedicines([]);
        setLogs([]);
      }
      setIsLoading(false);
    });

    const visited = localStorage.getItem('medimind_visited');
    if (visited) setShowWelcome(false);

    return () => unsubscribe();
  }, []);

  // Request Notification Permissions on Login
  useEffect(() => {
    if (currentUser) {
      requestNotificationPermission();
    }
  }, [currentUser]);

  // Notification Scheduler - Runs every 10 seconds
  useEffect(() => {
    if (!currentUser || medicines.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      const currentMinuteStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // HH:mm
      const todayStr = now.toISOString().split('T')[0];

      // Prevent checking continuously in the same minute
      if (lastCheckedMinute.current === currentMinuteStr) return;
      
      lastCheckedMinute.current = currentMinuteStr;

      medicines.forEach(med => {
        if (med.time === currentMinuteStr) {
          // Check if already taken today
          const isTaken = logs.some(
            l => l.medicineId === med.id && l.dateStr === todayStr && l.status === LogStatus.TAKEN
          );

          if (!isTaken) {
            sendNotification(
              `Time for ${med.name}`,
              `It's ${med.time}. Please take ${med.dosage}.`
            );
          }
        }
      });
    };

    // Run interval
    const intervalId = setInterval(checkReminders, 10000); // Check every 10 seconds

    return () => clearInterval(intervalId);
  }, [medicines, logs, currentUser]);


  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('medimind_theme', newMode ? 'dark' : 'light');
  };

  const handleGetStarted = () => {
    localStorage.setItem('medimind_visited', 'true');
    setShowWelcome(false);
  };

  const handleVerified = () => {
    setIsVerified(true);
  };

  const handleUpdateProfile = async (name: string, email: string) => {
    try {
      await updateUserProfile(name, email);
      // Force refresh of user state mostly for display name update
      setCurrentUser({ ...currentUser, displayName: name, email: email });
    } catch (e) {
      alert("Failed to update profile. " + e);
    }
  };

  const handleLogout = async () => {
      if(confirm("Log out?")){
          await logoutUser();
          setIsVerified(false);
          setView('dashboard');
      }
  };

  const handleAddMedicine = async (med: Medicine) => {
    const updated = [...medicines, med];
    setMedicines(updated); // Optimistic Update
    setShowAddForm(false);
    
    try {
      await addMedicine(med);
    } catch (e) {
      console.error("Failed to save medicine", e);
      setMedicines(medicines); // Revert on fail
      alert("Failed to save medicine to cloud.");
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    if(confirm("Delete this medicine? History will be kept.")){
        const previousMeds = medicines;
        const updated = medicines.filter(m => m.id !== id);
        setMedicines(updated);

        try {
            await removeMedicine(id);
        } catch (e) {
            console.error("Failed to delete medicine", e);
            setMedicines(previousMeds);
            alert("Failed to delete. Check connection.");
        }
    }
  };

  const handleLogIntake = async (medId: string, status: LogStatus) => {
    const newLog: IntakeLog = {
      id: crypto.randomUUID(),
      medicineId: medId,
      timestamp: Date.now(),
      status,
      dateStr: new Date().toISOString().split('T')[0]
    };
    
    const previousLogs = logs;
    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);

    // Optimistic Inventory Update
    const medIndex = medicines.findIndex(m => m.id === medId);
    let previousMeds = [...medicines];
    
    if (status === LogStatus.TAKEN && medIndex !== -1) {
        const med = medicines[medIndex];
        // If stock tracking is enabled
        if (med.currentStock !== undefined && med.currentStock > 0) {
            const newStock = med.currentStock - 1;
            const updatedMed = { ...med, currentStock: newStock };
            
            const newMeds = [...medicines];
            newMeds[medIndex] = updatedMed;
            setMedicines(newMeds);

            // Check for low stock alert
            const threshold = med.lowStockThreshold || 5;
            if (newStock <= threshold) {
                sendNotification(
                    "Refill Warning",
                    `Low stock for ${med.name}. Only ${newStock} doses left!`
                );
            }
            
            // Sync stock update to DB
            updateMedicine(updatedMed).catch(e => console.error("Stock update failed", e));
        }
    }

    try {
        await addLog(newLog);
    } catch (e) {
        console.error("Failed to save log", e);
        setLogs(previousLogs);
        if (status === LogStatus.TAKEN) setMedicines(previousMeds); // Revert stock
    }
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard medicines={medicines} logs={logs} onLogIntake={handleLogIntake} userName={currentUser?.displayName || 'User'} onProfileClick={() => setView('profile')} />;
      case 'medicines':
        return (
          <div className="pb-20 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 py-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cabinet</h2>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-teal-500/20"
                >
                  <Plus size={18} strokeWidth={3} /> Add
                </button>
            </div>
            {medicines.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                    <Pill size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Cabinet is empty</p>
                </div>
            )}
            {medicines.map(med => (
              <MedicineCard 
                key={med.id} 
                medicine={med} 
                isTaken={false}
                readonly={true}
                onAction={() => {}} 
                onDelete={handleDeleteMedicine}
              />
            ))}
          </div>
        );
      case 'history':
        return <HistoryView logs={logs} />;
      case 'ai-chat':
        return <AIChat medicines={medicines} logs={logs} userName={currentUser?.displayName} />;
      case 'profile':
        return (
          <UserProfile 
            userName={currentUser?.displayName || 'User'} 
            email={currentUser?.email || ''}
            medicines={medicines}
            logs={logs}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
            onBack={() => setView('dashboard')}
          />
        );
      default:
        return <Dashboard medicines={medicines} logs={logs} onLogIntake={handleLogIntake} userName={currentUser?.displayName} />;
    }
  };

  // Loading Screen for initial auth check
  if (isLoading && !currentUser && !showWelcome) {
    return (
        <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'dark bg-gray-950' : 'bg-gray-50'}`}>
            <Loader2 size={40} className="text-teal-500 animate-spin" />
        </div>
    );
  }

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-gray-100 dark:bg-black flex justify-center font-sans`}>
      <div className="w-full max-w-md bg-gray-50 dark:bg-gray-950 min-h-screen shadow-2xl relative flex flex-col transition-colors duration-300 overflow-hidden ring-1 ring-black/5">
        
        {/* Onboarding Flow: Welcome -> Login -> Verification -> App */}
        {showWelcome ? (
          <WelcomePage onGetStarted={handleGetStarted} />
        ) : !currentUser ? (
            <LoginPage onLoginSuccess={() => {}} />
        ) : !isVerified ? (
          <HumanVerificationPage onVerified={handleVerified} />
        ) : (
          <>
            {/* Header - Hide on Profile view for custom header */}
            {view !== 'profile' && (
                <header className="px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 z-30 sticky top-0 transition-colors duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                    <div className="bg-gradient-to-tr from-teal-500 to-emerald-400 p-2 rounded-xl shadow-lg shadow-teal-500/20">
                        <HeartPulse className="text-white" size={20} strokeWidth={3} />
                    </div>
                    <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">MediMind</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                        >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button 
                        onClick={() => setView('profile')}
                        className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-200 shadow-inner"
                        >
                            {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
                        </button>
                    </div>
                </div>
                </header>
            )}

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto scrollbar-hide">
              {renderView()}
            </main>

            {/* Bottom Navigation - Hide on Profile view */}
            {view !== 'profile' && (
                <nav className="fixed bottom-0 w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 px-6 py-2 flex justify-between items-end z-40 pb-5 transition-all h-[80px]">
                    <NavButton 
                        active={view === 'dashboard'} 
                        onClick={() => setView('dashboard')} 
                        icon={<LayoutGrid size={24} />} 
                        label="Home" 
                    />
                    <NavButton 
                        active={view === 'medicines'} 
                        onClick={() => setView('medicines')} 
                        icon={<Pill size={24} />} 
                        label="Meds" 
                    />
                    
                    {/* FAB */}
                    <div className="relative -top-6">
                        <button 
                            onClick={() => setShowAddForm(true)}
                            className="bg-gradient-to-tr from-teal-500 to-emerald-600 text-white p-4 rounded-2xl shadow-xl shadow-teal-500/40 border-[6px] border-gray-50 dark:border-gray-950 transition-transform active:scale-90 group"
                        >
                            <Plus size={28} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>

                    <NavButton 
                        active={view === 'history'} 
                        onClick={() => setView('history')} 
                        icon={<ChartNoAxesColumn size={24} />} 
                        label="History" 
                    />
                    <NavButton 
                        active={view === 'ai-chat'} 
                        onClick={() => setView('ai-chat')} 
                        icon={<Bot size={24} />} 
                        label="AI Help" 
                    />
                </nav>
            )}

            {/* Modal */}
            {showAddForm && (
              <AddMedicineForm 
                onAdd={handleAddMedicine} 
                onCancel={() => setShowAddForm(false)} 
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all w-16 ${
            active 
            ? 'text-teal-600 dark:text-teal-400 -translate-y-2' 
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
        }`}
    >
        {React.cloneElement(icon as React.ReactElement<any>, { strokeWidth: active ? 2.5 : 2 })}
        <span className={`text-[10px] font-bold ${active ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
    </button>
);

export default App;
