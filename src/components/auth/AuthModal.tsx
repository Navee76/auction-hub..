import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Eye, EyeOff, Lock, Mail, User, X, ShieldAlert } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authMode,
    openAuthModal,
    login,
    register,
    switchDemoUser,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isAuthModalOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (authMode === 'register') {
      if (!fullName.trim()) {
        newErrors.fullName = 'Full name is required.';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (authMode === 'login') {
      const ok = login(email, password);
      if (ok) {
        setEmail('');
        setPassword('');
      }
    } else {
      const ok = register(fullName, email, password);
      if (ok) {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={closeAuthModal}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              openAuthModal('login');
              setErrors({});
            }}
            className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              authMode === 'login'
                ? 'text-[#7C3AED] dark:text-purple-400 border-b-2 border-[#7C3AED]'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              openAuthModal('register');
              setErrors({});
            }}
            className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              authMode === 'register'
                ? 'text-[#7C3AED] dark:text-purple-400 border-b-2 border-[#7C3AED]'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={closeAuthModal}
            className="px-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong className="font-semibold">Internship Prototype Mode:</strong> Local authentication simulated in browser memory. Production requires backend API, hashed passwords (bcrypt), and secure JWT tokens.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-purple-600 focus:outline-hidden transition-all"
                />
              </div>
              {errors.fullName && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.fullName}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-purple-600 focus:outline-hidden transition-all"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-purple-600 focus:outline-hidden transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.password}</p>
            )}
          </div>

          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-purple-600 focus:outline-hidden transition-all"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-[#7C3AED] hover:bg-purple-700 text-white font-semibold rounded-xl text-xs md:text-sm shadow-md transition-colors mt-2"
          >
            {authMode === 'login' ? 'Sign In to Account' : 'Register New Account'}
          </button>

          {authMode === 'login' && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="block text-[11px] text-slate-400 font-semibold mb-2">
                Quick 1-Click Demo Login:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    switchDemoUser('user-1');
                    closeAuthModal();
                  }}
                  className="p-2 text-left bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">Alex Morgan</p>
                  <p className="text-[10px] text-purple-600 dark:text-purple-400">Buyer & Bidder</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    switchDemoUser('user-2');
                    closeAuthModal();
                  }}
                  className="p-2 text-left bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">Sophia Chen</p>
                  <p className="text-[10px] text-purple-600 dark:text-purple-400">Curator & Seller</p>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
