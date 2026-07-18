import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2, Info } from 'lucide-react';

export default function Login() {
  const { login, redirectByRole } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Input Validation
    if (!identifier.trim()) {
      return setError('Please enter your email or mobile number.');
    }
    if (!password) {
      return setError('Please enter your password.');
    }
    if (password.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }

    setLoading(true);
    try {
      const user = await login(identifier, password, rememberMe);
      setSuccess('Logged in successfully!');
      
      // Auto-detect role and redirect after success message
      setTimeout(() => {
        redirectByRole(user.role, navigate);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or connection error.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#8B0000]/20 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#8B0000]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Glassmorphism Card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#8B0000]/10 border border-[#8B0000]/30 rounded-xl mb-4 text-[#8B0000]">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Sign In</h2>
          <p className="text-sm text-slate-400 mt-2">Access your secure user dashboard</p>
        </div>

        {/* Demo Credentials Box */}
        <div className="bg-[#8B0000]/5 border border-[#8B0000]/20 rounded-xl p-3.5 mb-6 text-xs text-slate-300 space-y-1">
          <p className="font-semibold text-white flex items-center gap-1.5 mb-1 text-sm">
            <Info className="w-4 h-4 text-[#8B0000]" /> Demo Admin Account:
          </p>
          <p>Email/Mobile: <span className="text-[#e64d4d] font-mono select-all">admin@authsystem.com</span></p>
          <p>Password: <span className="text-[#e64d4d] font-mono select-all">adminpassword123</span></p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6 text-center animate-pulse">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg mb-6 text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email / Mobile input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email or Mobile Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="text"
                disabled={loading}
                className="w-full bg-slate-900/60 border border-white/10 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] transition duration-200 placeholder-slate-500"
                placeholder="email@domain.com or 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                disabled={loading}
                className="w-full bg-slate-900/60 border border-white/10 text-white rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] transition duration-200 placeholder-slate-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition duration-150"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password link */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={loading}
                className="rounded bg-slate-900 border-white/10 text-[#8B0000] focus:ring-0 focus:ring-offset-0 mr-2 w-4 h-4 cursor-pointer"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-[#8B0000] hover:text-[#a30000] hover:underline font-medium transition">
              Forgot Password?
            </Link>
          </div>

          {/* Login Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B0000] hover:bg-[#a30000] text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-[#8B0000]/20 active:scale-[0.98] transition duration-150 flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          New here?{' '}
          <Link to="/register" className="text-[#8B0000] hover:text-[#a30000] hover:underline font-semibold transition">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
}
