
import React, { useState } from 'react';
import { User, Lock, ArrowRight, Shield, Key, Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginUser, registerUser } from '../services/storageService';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); // Changed from email to username
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Auto-generate email from username if no @ symbol is present
    // This allows users to login with just "alex" instead of "alex@email.com"
    const finalEmail = username.includes('@') 
        ? username 
        : `${username.toLowerCase().replace(/\s+/g, '')}@medimind.com`;

    try {
      let user;
      if (isRegistering) {
        if (!name) throw new Error("Display Name is required");
        user = await registerUser(name, finalEmail, password);
      } else {
        user = await loginUser(finalEmail, password);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError("Invalid username or password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Username already taken.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 px-6 pt-10 pb-6 transition-colors duration-300 overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="bg-teal-100 dark:bg-teal-900/30 p-5 rounded-full mb-6 text-teal-600 dark:text-teal-400 shadow-sm ring-1 ring-teal-500/20">
                <Shield size={40} strokeWidth={1.5} />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-xs leading-relaxed text-sm">
               {isRegistering 
                ? "Create a profile to sync your medicine cabinet."
                : "Sign in with your username to access your reminders."}
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
                {isRegistering && (
                  <div className="space-y-1 animate-slide-up">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-wide">
                          Full Name
                      </label>
                      <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User size={18} className="text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                          </div>
                          <input
                              type="text"
                              required={isRegistering}
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white dark:focus:bg-gray-800 transition-all shadow-sm"
                              placeholder="Alex Doe"
                          />
                      </div>
                  </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-wide">
                        Username
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={18} className="text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white dark:focus:bg-gray-800 transition-all shadow-sm"
                            placeholder="alex_123"
                            autoCapitalize="none"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-wide">
                        Password
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white dark:focus:bg-gray-800 transition-all shadow-sm"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {error && (
                  <div className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-900/50">
                    {error}
                  </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-teal-500/20 text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all active:scale-[0.98] mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        {isRegistering ? 'Sign Up' : 'Sign In'} <ArrowRight size={18} />
                      </>
                    )}
                </button>
            </form>

            <div className="mt-6 flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {isRegistering ? "Already have an account?" : "Don't have an account?"}
              </span>
              <button 
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }}
                className="text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline"
              >
                {isRegistering ? "Sign In" : "Register"}
              </button>
            </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4 opacity-75">
            <Key size={12} />
            <p>Secure Cloud Storage</p>
        </div>
    </div>
  );
};

export default LoginPage;
