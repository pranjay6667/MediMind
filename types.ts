
export enum Frequency {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  AS_NEEDED = 'As Needed'
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  time: string; // HH:mm format
  frequency: Frequency;
  notes?: string;
  color?: string;
  currentStock?: number;
  lowStockThreshold?: number;
}

export enum LogStatus {
  TAKEN = 'taken',
  SKIPPED = 'skipped',
  MISSED = 'missed'
}

export interface IntakeLog {
  id: string;
  medicineId: string;
  timestamp: number;
  status: LogStatus;
  dateStr: string; // YYYY-MM-DD for easy grouping
}

export interface AIResponse {
  text: string;
  isError: boolean;
}

export interface MedicalProfile {
  bloodType: string;
  allergies: string;
  conditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export type ViewState = 'dashboard' | 'medicines' | 'history' | 'ai-chat' | 'profile';
