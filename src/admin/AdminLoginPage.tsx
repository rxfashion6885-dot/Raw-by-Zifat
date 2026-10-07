import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext.js';
import { useStore } from '../context/StoreContext.js';
import { ShieldCheck, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login, isAdmin } = useAdminAuth();
  const { showToast } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAdmin) {
    window.location.href = '/admin';
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('Please enter both username and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const success = await login(username.trim(), password.trim());
      if (success) {
        showToast('Admin authentication verified successfully', 'success');
        window.location.href = '/admin';
      } else {
        showToast('Invalid username or password', 'error');
      }
    } catch {
      showToast('Authentication error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-neutral-200 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
          </div>
          <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-neutral-400 block">
            ADMINISTRATOR ACCESS
          </span>
          <h1 className="text-2xl font-black text-neutral-950 uppercase tracking-tight">
            RAW BY ZIFAT
          </h1>
          <p className="text-xs text-neutral-500">
            Sign in with your admin username & password to access store management.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              User Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="zifat69"
                autoCapitalize="none"
                autoComplete="username"
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-1 focus:ring-black"
              />
              <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="rawbyzifat"
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-1 focus:ring-black"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-neutral-950 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>LOGIN TO ADMIN PANEL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-neutral-100 text-center">
          <p className="text-[11px] text-neutral-400">
            Admin Credentials: <br />
            Username: <code className="text-neutral-900 font-bold bg-neutral-100 px-1.5 py-0.5 rounded">zifat69</code> &nbsp;|&nbsp;
            Password: <code className="text-neutral-900 font-bold bg-neutral-100 px-1.5 py-0.5 rounded">rawbyzifat</code>
          </p>
          <button
            type="button"
            onClick={() => {
              setUsername('zifat69');
              setPassword('rawbyzifat');
            }}
            className="mt-2.5 inline-block text-[11px] font-bold text-neutral-800 hover:text-black bg-neutral-100 hover:bg-neutral-200 px-3 py-1 rounded-full transition-colors cursor-pointer"
          >
            ⚡ Auto-fill Admin Login
          </button>
          <div>
            <a
              href="/"
              className="inline-block mt-3 text-xs text-neutral-500 hover:text-black font-semibold"
            >
              ← Return to Storefront
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
