
import { Medicine, IntakeLog, MedicalProfile } from '../types';

// Mock User interface to match previous Firebase usage
export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

// --- Local Storage Keys ---
const USERS_KEY = 'medimind_users';
const CURRENT_USER_KEY = 'medimind_current_user';
const MEDICINES_KEY = 'medimind_medicines';
const LOGS_KEY = 'medimind_logs';
const MEDICAL_PROFILE_KEY = 'medimind_medical_profile';

// --- Authentication (Local Storage Mock) ---

let authStateListeners: ((user: User | null) => void)[] = [];

const notifyAuthListeners = (user: User | null) => {
  authStateListeners.forEach(listener => listener(user));
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  // Add listener
  authStateListeners.push(callback);
  
  // Initial check
  const storedUser = localStorage.getItem(CURRENT_USER_KEY);
  if (storedUser) {
    try {
      callback(JSON.parse(storedUser));
    } catch (e) {
      console.error("Failed to parse user", e);
      callback(null);
    }
  } else {
    callback(null);
  }

  // Return unsubscribe function (mimicking Firebase)
  return () => {
    authStateListeners = authStateListeners.filter(l => l !== callback);
  };
};

export const registerUser = async (name: string, email: string, pass: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const newUser: User = {
    uid: crypto.randomUUID(),
    displayName: name,
    email: email,
    photoURL: null
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  notifyAuthListeners(newUser);
  return newUser;
};

export const loginUser = async (email: string, pass: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For demo purposes, we create a session for the provided email.
  // In a full implementation, we would verify against stored credentials.
  const user: User = {
    uid: btoa(email), // simple deterministic fake uid
    displayName: email.split('@')[0],
    email: email,
    photoURL: null
  };
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  notifyAuthListeners(user);
  return user;
};

export const logoutUser = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  localStorage.removeItem(CURRENT_USER_KEY);
  notifyAuthListeners(null);
};

export const updateUserProfile = async (name: string, email: string) => {
  const storedStr = localStorage.getItem(CURRENT_USER_KEY);
  if (storedStr) {
    const user = JSON.parse(storedStr);
    const updated = { ...user, displayName: name, email: email };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    notifyAuthListeners(updated);
  }
};

// --- Data Operations (Local Storage Mock) ---

const getCurrentUserId = () => {
  const storedStr = localStorage.getItem(CURRENT_USER_KEY);
  if (!storedStr) return null;
  try {
    return JSON.parse(storedStr).uid;
  } catch {
    return null;
  }
};

export const fetchMedicines = async (): Promise<Medicine[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const uid = getCurrentUserId();
  if (!uid) return [];

  const allMedsStr = localStorage.getItem(MEDICINES_KEY);
  const allMeds: (Medicine & { userId: string })[] = allMedsStr ? JSON.parse(allMedsStr) : [];
  
  return allMeds.filter(m => m.userId === uid);
};

export const addMedicine = async (medicine: Medicine): Promise<void> => {
  const uid = getCurrentUserId();
  if (!uid) return;

  const allMedsStr = localStorage.getItem(MEDICINES_KEY);
  const allMeds = allMedsStr ? JSON.parse(allMedsStr) : [];
  
  const newEntry = { ...medicine, userId: uid, createdAt: Date.now() };
  allMeds.push(newEntry);
  
  localStorage.setItem(MEDICINES_KEY, JSON.stringify(allMeds));
};

export const updateMedicine = async (medicine: Medicine): Promise<void> => {
  const uid = getCurrentUserId();
  if (!uid) return;

  const allMedsStr = localStorage.getItem(MEDICINES_KEY);
  let allMeds = allMedsStr ? JSON.parse(allMedsStr) : [];
  
  // Find and update
  const index = allMeds.findIndex((m: any) => m.id === medicine.id && m.userId === uid);
  if (index !== -1) {
    allMeds[index] = { ...allMeds[index], ...medicine };
    localStorage.setItem(MEDICINES_KEY, JSON.stringify(allMeds));
  }
};

export const removeMedicine = async (medicineId: string): Promise<void> => {
  const uid = getCurrentUserId();
  if (!uid) return;

  const allMedsStr = localStorage.getItem(MEDICINES_KEY);
  let allMeds = allMedsStr ? JSON.parse(allMedsStr) : [];
  
  allMeds = allMeds.filter((m: any) => !(m.id === medicineId && m.userId === uid));
  
  localStorage.setItem(MEDICINES_KEY, JSON.stringify(allMeds));
};

export const fetchLogs = async (): Promise<IntakeLog[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const uid = getCurrentUserId();
  if (!uid) return [];

  const allLogsStr = localStorage.getItem(LOGS_KEY);
  const allLogs: (IntakeLog & { userId: string })[] = allLogsStr ? JSON.parse(allLogsStr) : [];

  return allLogs.filter(l => l.userId === uid);
};

export const addLog = async (log: IntakeLog): Promise<void> => {
  const uid = getCurrentUserId();
  if (!uid) return;

  const allLogsStr = localStorage.getItem(LOGS_KEY);
  const allLogs = allLogsStr ? JSON.parse(allLogsStr) : [];

  const newEntry = { ...log, userId: uid };
  allLogs.push(newEntry);

  localStorage.setItem(LOGS_KEY, JSON.stringify(allLogs));
};

// --- Medical Profile Operations ---

export const fetchMedicalProfile = async (): Promise<MedicalProfile | null> => {
  const uid = getCurrentUserId();
  if (!uid) return null;
  
  const allProfilesStr = localStorage.getItem(MEDICAL_PROFILE_KEY);
  const allProfiles = allProfilesStr ? JSON.parse(allProfilesStr) : {};
  
  return allProfiles[uid] || null;
};

export const saveMedicalProfile = async (profile: MedicalProfile): Promise<void> => {
  const uid = getCurrentUserId();
  if (!uid) return;

  const allProfilesStr = localStorage.getItem(MEDICAL_PROFILE_KEY);
  const allProfiles = allProfilesStr ? JSON.parse(allProfilesStr) : {};
  
  allProfiles[uid] = profile;
  localStorage.setItem(MEDICAL_PROFILE_KEY, JSON.stringify(allProfiles));
};
