
import React, { useState, useRef } from 'react';
import { Medicine, Frequency } from '../types';
import { Plus, X, Camera, Loader2, Sparkles, Image as ImageIcon, Check, ChevronRight, RotateCcw, Palette, Package } from 'lucide-react';
import { scanPrescription } from '../services/geminiService';

interface AddMedicineFormProps {
  onAdd: (med: Medicine) => void;
  onCancel: () => void;
}

const COLORS = [
  { id: 'teal', value: 'bg-teal-500' },
  { id: 'red', value: 'bg-red-500' },
  { id: 'orange', value: 'bg-orange-500' },
  { id: 'yellow', value: 'bg-yellow-400' },
  { id: 'green', value: 'bg-green-500' },
  { id: 'blue', value: 'bg-blue-500' },
  { id: 'purple', value: 'bg-purple-500' },
  { id: 'pink', value: 'bg-pink-500' },
];

const AddMedicineForm: React.FC<AddMedicineFormProps> = ({ onAdd, onCancel }) => {
  const [step, setStep] = useState<'scan' | 'verify'>('scan');
  
  // Form State
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00');
  const [frequency, setFrequency] = useState<Frequency>(Frequency.DAILY);
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('teal'); // Default color
  
  // Inventory State
  const [currentStock, setCurrentStock] = useState<string>('');
  const [lowStockThreshold, setLowStockThreshold] = useState<string>('5');
  
  // Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dosage || !time) return;

    const newMed: Medicine = {
      id: crypto.randomUUID(),
      name,
      dosage,
      time,
      frequency,
      notes,
      color,
      currentStock: currentStock ? parseInt(currentStock) : undefined,
      lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : 5
    };
    onAdd(newMed);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show Preview Immediately
    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64Full = reader.result?.toString();
        setPreviewImage(base64Full || null);
        
        if (base64Full) {
            setIsScanning(true);
            const base64String = base64Full.split(',')[1];
            try {
                const results = await scanPrescription(base64String);
                if (results && results.length > 0) {
                    const med = results[0];
                    if (med.name) setName(med.name);
                    if (med.dosage) setDosage(med.dosage);
                    if (med.time) setTime(med.time);
                    if (med.frequency) setFrequency(med.frequency as Frequency);
                    if (med.notes) setNotes(med.notes);
                    
                    // Move to form
                    setStep('verify');
                } else {
                    alert("Could not identify medicine. Please enter manually.");
                    setStep('verify'); // Fail gracefully to manual entry
                }
            } catch (error) {
                console.error(error);
                alert("Scanning failed.");
                setStep('verify');
            } finally {
                setIsScanning(false);
            }
        }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onCancel}></div>
      
      {/* Modal Content */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-up sm:animate-scale-in overflow-hidden flex flex-col max-h-[90vh] relative z-10">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {step === 'scan' ? (
                <>
                    <Camera className="text-teal-500" size={24} /> 
                    <span>Add Medicine</span>
                </>
            ) : (
                <>
                    <Sparkles className="text-purple-500" size={24} />
                    <span>Verify Details</span>
                </>
            )}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 scrollbar-thin">
            
            {/* Step 1: Scan / Options */}
            {step === 'scan' && (
                <div className="space-y-6">
                    {/* Scanner Preview UI */}
                    {isScanning ? (
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center mb-6">
                            {previewImage && <img src={previewImage} className="absolute inset-0 w-full h-full object-cover opacity-60" />}
                            <div className="absolute inset-0 animate-scan scan-line"></div>
                            <div className="relative z-10 text-white flex flex-col items-center">
                                <Loader2 size={32} className="animate-spin mb-2" />
                                <span className="font-semibold text-sm tracking-widest uppercase">Analyzing...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-8 border-2 border-dashed border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-900/10 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all group"
                            >
                                <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                    <Camera size={32} className="text-teal-600 dark:text-teal-400" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-gray-800 dark:text-white text-lg">Scan Prescription</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Auto-fill details from bottle or paper</p>
                                </div>
                            </button>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-medium">Or</span>
                                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                            </div>

                            <button 
                                onClick={() => setStep('verify')}
                                className="w-full py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-semibold flex items-center justify-center gap-2 transition-colors"
                            >
                                <Plus size={20} /> Enter Manually
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Step 2: Form */}
            {step === 'verify' && (
                <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
                    
                    {previewImage && (
                        <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-900/50 mb-4">
                             <img src={previewImage} className="w-12 h-12 rounded-lg object-cover" />
                             <div className="flex-1">
                                <p className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase">AI Analysis</p>
                                <p className="text-xs text-teal-600/80 dark:text-teal-400/80">Details pre-filled. Please verify.</p>
                             </div>
                             <button type="button" onClick={() => { setStep('scan'); setPreviewImage(null); }} className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                                <RotateCcw size={14} className="text-gray-500" />
                             </button>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Medicine Name</label>
                        <input 
                        type="text" 
                        required
                        className="w-full mt-1 p-4 bg-gray-50 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-teal-500 rounded-2xl outline-none text-lg font-semibold text-gray-900 dark:text-white transition-all shadow-sm"
                        placeholder="e.g. Lisinopril"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Dosage</label>
                        <input 
                            type="text" 
                            required
                            className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-teal-500 rounded-xl outline-none font-medium text-gray-900 dark:text-white transition-all shadow-sm"
                            placeholder="e.g. 10mg"
                            value={dosage}
                            onChange={(e) => setDosage(e.target.value)}
                        />
                        </div>
                        <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Time</label>
                        <input 
                            type="time" 
                            required
                            className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-teal-500 rounded-xl outline-none font-medium text-gray-900 dark:text-white transition-all shadow-sm"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                        </div>
                    </div>

                    {/* Inventory Section */}
                    <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Package size={16} className="text-gray-500 dark:text-gray-400" />
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Inventory Tracker (Optional)</label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase font-semibold">Current Stock</label>
                                <input 
                                    type="number" 
                                    className="w-full mt-1 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-sm"
                                    placeholder="Total pills"
                                    value={currentStock}
                                    onChange={(e) => setCurrentStock(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase font-semibold">Refill Warning At</label>
                                <input 
                                    type="number" 
                                    className="w-full mt-1 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none text-sm"
                                    placeholder="Default: 5"
                                    value={lowStockThreshold}
                                    onChange={(e) => setLowStockThreshold(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1 flex items-center gap-1">
                            <Palette size={12} /> Color Tag
                        </label>
                        <div className="flex gap-3 mt-2 overflow-x-auto pb-2 scrollbar-hide">
                            {COLORS.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setColor(c.id)}
                                    className={`w-8 h-8 rounded-full ${c.value} transition-transform flex items-center justify-center flex-shrink-0 ${
                                        color === c.id ? 'scale-125 ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600' : 'hover:scale-110 opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    {color === c.id && <Check size={14} className="text-white drop-shadow-md" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Frequency</label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            {Object.values(Frequency).map((f) => (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => setFrequency(f)}
                                    className={`py-2 px-1 rounded-lg text-sm font-medium transition-all ${
                                        frequency === f 
                                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30 transform scale-[1.02]' 
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Notes</label>
                        <textarea 
                        className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-800 border border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-teal-500 rounded-xl outline-none text-gray-900 dark:text-white transition-all shadow-sm resize-none"
                        placeholder="e.g. Take with food"
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 pb-2">
                        <button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-teal-500/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                        >
                            <Check size={20} /> Save Medicine
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default AddMedicineForm;
