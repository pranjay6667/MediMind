
import React from 'react';
import { Medicine, LogStatus } from '../types';
import { Pill, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface MedicineCardProps {
  medicine: Medicine;
  isTaken: boolean;
  onAction: (id: string, status: LogStatus) => void;
  readonly?: boolean;
  onDelete?: (id: string) => void;
}

const getColorClasses = (color?: string) => {
    switch(color) {
      case 'red': return 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400';
      case 'orange': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400';
      case 'yellow': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400';
      case 'green': return 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400';
      case 'blue': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400';
      case 'purple': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400';
      case 'pink': return 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400';
      default: return 'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400';
    }
};

const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, isTaken, onAction, readonly = false, onDelete }) => {
  const colorClass = getColorClasses(medicine.color);
  const currentStock = medicine.currentStock ?? null;
  const isLowStock = currentStock !== null && currentStock <= (medicine.lowStockThreshold || 5);

  return (
    <div className={`p-4 rounded-xl shadow-sm border transition-all ${
      isTaken 
        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
        : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${isTaken ? 'bg-green-100 text-green-600 dark:bg-green-800/50 dark:text-green-400' : colorClass}`}>
            <Pill size={24} />
          </div>
          <div>
            <h3 className={`font-bold text-lg ${
              isTaken ? 'text-green-800 dark:text-green-400' : 'text-gray-800 dark:text-gray-100'
            }`}>
              {medicine.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                <span className="font-medium">{medicine.dosage}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {medicine.time}</span>
                
                {currentStock !== null && (
                    <>
                        <span>•</span>
                        <span className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md font-bold ${
                            isLowStock 
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                            {isLowStock && <AlertTriangle size={10} />}
                            {currentStock} left
                        </span>
                    </>
                )}
            </div>
            {medicine.notes && <p className="text-xs text-gray-400 mt-1 italic">{medicine.notes}</p>}
          </div>
        </div>

        {!readonly && !isTaken && (
          <div className="flex gap-2">
             <button 
              onClick={() => onAction(medicine.id, LogStatus.SKIPPED)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
              title="Skip"
            >
              <XCircle size={24} />
            </button>
            <button 
              onClick={() => onAction(medicine.id, LogStatus.TAKEN)}
              className="p-2 text-teal-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-full transition-colors"
              title="Take"
            >
              <CheckCircle size={28} />
            </button>
          </div>
        )}

        {readonly && onDelete && (
             <button 
             onClick={() => onDelete(medicine.id)}
             className="text-red-400 hover:text-red-600 text-xs px-2 py-1 bg-red-50 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded hover:bg-red-100 transition-colors"
           >
             Delete
           </button>
        )}

        {isTaken && (
          <div className="text-green-600 dark:text-green-400 font-medium text-sm flex items-center gap-1 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">
            <CheckCircle size={14} /> Taken
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineCard;
