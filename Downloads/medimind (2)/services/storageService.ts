
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { Medicine, IntakeLog, MedicalProfile } from '../types';

// User interface wrapper
export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

// --- Authentication ---

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      const user: User = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL
      };
      callback(user);
    } else {
      callback(null);
    }
  });
};

export const registerUser = async (name: string, email: string, pass: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(userCredential.user, { displayName: name });
  
  return {
    uid: userCredential.user.uid,
    displayName: name,
    email: userCredential.user.email,
    photoURL: userCredential.user.photoURL
  };
};

export const loginUser = async (email: string, pass: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return {
    uid: userCredential.user.uid,
    displayName: userCredential.user.displayName,
    email: userCredential.user.email,
    photoURL: userCredential.user.photoURL
  };
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const updateUserProfile = async (name: string, email: string) => {
  if (auth.currentUser) {
    // Note: updating email requires re-authentication in strict security modes, 
    // but works in basic setups if recently signed in.
    if (auth.currentUser.email !== email) {
      // Email update is complex in Firebase client SDK (needs verifyBeforeUpdateEmail), 
      // skipping for simple demo or just updating profile display name.
      // For this demo, we focus on Display Name.
    }
    await updateProfile(auth.currentUser, { displayName: name });
  }
};

// --- Data Operations (Firestore) ---

export const fetchMedicines = async (): Promise<Medicine[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'medicines'));
  const meds: Medicine[] = [];
  querySnapshot.forEach((doc) => {
    meds.push(doc.data() as Medicine);
  });
  return meds;
};

export const addMedicine = async (medicine: Medicine): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;
  // Use setDoc with medicine.id to keep IDs consistent
  await setDoc(doc(db, 'users', user.uid, 'medicines', medicine.id), medicine);
};

export const updateMedicine = async (medicine: Medicine): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(doc(db, 'users', user.uid, 'medicines', medicine.id), medicine, { merge: true });
};

export const removeMedicine = async (medicineId: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;
  await deleteDoc(doc(db, 'users', user.uid, 'medicines', medicineId));
};

export const fetchLogs = async (): Promise<IntakeLog[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'logs'));
  const logs: IntakeLog[] = [];
  querySnapshot.forEach((doc) => {
    logs.push(doc.data() as IntakeLog);
  });
  return logs;
};

export const addLog = async (log: IntakeLog): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(doc(db, 'users', user.uid, 'logs', log.id), log);
};

// --- Medical Profile Operations ---

export const fetchMedicalProfile = async (): Promise<MedicalProfile | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  const docRef = doc(db, 'users', user.uid, 'profile', 'medical');
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as MedicalProfile;
  } else {
    return null;
  }
};

export const saveMedicalProfile = async (profile: MedicalProfile): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(doc(db, 'users', user.uid, 'profile', 'medical'), profile);
};
