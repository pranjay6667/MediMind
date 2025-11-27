import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, RefreshCw, CheckCircle, AlertCircle, BrainCircuit } from 'lucide-react';

interface HumanVerificationPageProps {
  onVerified: () => void;
}

const HumanVerificationPage: React.FC<HumanVerificationPageProps> = ({ onVerified }) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState<'+' | '-' | '*'>('+');
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const generateProblem = () => {
    const ops: ('+' | '-' | '*')[] = ['+', '-', '*'];
    const selectedOp = ops[Math.floor(Math.random() * ops.length)];
    setOperator(selectedOp);

    let n1 = 0;
    let n2 = 0;

    if (selectedOp === '*') {
      // Keep multiplication simple (2-9)
      n1 = Math.floor(Math.random() * 8) + 2;
      n2 = Math.floor(Math.random() * 8) + 2;
    } else if (selectedOp === '-') {
      // Ensure result is positive
      n1 = Math.floor(Math.random() * 40) + 10;
      n2 = Math.floor(Math.random() * (n1 - 1)) + 1;
    } else {
      // Addition (10-50)
      n1 = Math.floor(Math.random() * 40) + 10;
      n2 = Math.floor(Math.random() * 40) + 10;
    }

    setNum1(n1);
    setNum2(n2);
    setUserAnswer('');
    setError(false);
  };

  useEffect(() => {
    generateProblem();
  }, []);

  const calculateResult = () => {
    switch(operator) {
        case '+': return num1 + num2;
        case '-': return num1 - num2;
        case '*': return num1 * num2;
        default: return 0;
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correct = calculateResult();
    
    if (parseInt(userAnswer) === correct) {
      setSuccess(true);
      setTimeout(() => {
        onVerified();
      }, 1000);
    } else {
      setError(true);
      // Shake effect timeout
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 px-6 justify-center items-center transition-colors">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 animate-scale-in relative overflow-hidden">
        
        {/* Background decorative blob */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-100 dark:bg-teal-900/30 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className={`p-4 rounded-full mb-6 transition-all duration-500 ${success ? 'bg-green-100 text-green-600' : 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400'}`}>
            {success ? <CheckCircle size={40} /> : <BrainCircuit size={40} />}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Security Check</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            Prove you are human by solving this math problem.
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="flex items-center justify-center gap-3 text-3xl font-bold text-gray-800 dark:text-gray-100 font-mono">
              <span>{num1}</span>
              <span className="text-teal-500">{operator === '*' ? '×' : operator}</span>
              <span>{num2}</span>
              <span>=</span>
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => {
                    setUserAnswer(e.target.value);
                    setError(false);
                }}
                className={`w-24 h-16 text-center rounded-xl border-2 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-4 transition-all ${
                    error 
                    ? 'border-red-400 focus:ring-red-200 animate-[pulse_0.2s_ease-in-out_2]' 
                    : success 
                        ? 'border-green-500 text-green-600'
                        : 'border-gray-200 dark:border-gray-700 focus:border-teal-500 focus:ring-teal-500/20 dark:text-white'
                }`}
                placeholder="?"
                autoFocus
              />
            </div>

            {error && (
                <div className="flex items-center justify-center gap-2 text-red-500 text-sm font-medium animate-fade-in">
                    <AlertCircle size={16} /> Incorrect, try again.
                </div>
            )}

            <button
              type="submit"
              disabled={!userAnswer || success}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-teal-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                  success 
                  ? 'bg-green-500 text-white cursor-default'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:shadow-teal-500/30'
              }`}
            >
              {success ? (
                  <>Verified <CheckCircle size={20}/></>
              ) : (
                  <>Verify <Lock size={20}/></>
              )}
            </button>
          </form>

          {!success && (
            <button 
                onClick={generateProblem}
                className="mt-6 flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
                <RefreshCw size={12} /> Get new problem
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HumanVerificationPage;