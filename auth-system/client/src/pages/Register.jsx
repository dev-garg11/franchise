import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, Award } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('brand_owner'); // brand_owner or investor

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Input Validation
    if (!name.trim()) return setError('Please enter your full name.');
    if (!email.trim()) return setError('Please enter your email.');
    if (!mobile.trim()) return setError('Please enter your mobile number.');
    if (!password) return setError('Please enter your password.');
    if (password.length < 8) return setError('Password must be at least 8 characters long.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const user = await register({ name, email, mobile, password, role });
      setSuccess('Account created successfully!');
      
      // Auto-detect role and redirect after success message
      setTimeout(() => {
        if (user.role === 'brand_owner') {
          navigate('/brand-owner/dashboard');
        } else {
          navigate('/investor/dashboard');
        }
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#8B0000]/20 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#8B0000]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Glassmorphism Card */}
      <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#8B0000]/10 border border-[#8B0000]/30 rounded-xl mb-4 text-[#8B0000]">
            <Award className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Register Account</h2>
          <p className="text-sm text-slate-400 mt-2">Get started by creating a brand or investor account</p>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                disabled={loading}
                className="w-full bg-slate-900/60 border border-white/10 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] transition"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                disabled={loading}
                className="w-full bg-slate-900/60 border border-white/10 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] transition"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Mobile Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Phone className="w-5 h-5" />
              </span>
              <input
                type="tel"
                required
                disabled={loading}
                className="w-full bg-slate-900/60 border border-white/10 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] transition"
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          </div>

          {/* Role Dropdown Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Register As</label>
            <select
              disabled={loading}
              className="w-full bg-slate-900 border border-white/10 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] transition cursor-pointer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="brand_owner">Brand Owner</option>
              <option value="investor">Investor</option>
            </select>
          </div>

          {/* Passwords Input Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  className="w-full bg-slate-900/60 border border-white/10 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] transition"
                  placeholder="Min 8 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  className="w-full bg-slate-900/60 border border-white/10 text-white rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] transition"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B0000] hover:bg-[#a30000] text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-[#8B0000]/20 active:scale-[0.98] transition duration-150 flex items-center justify-center mt-2"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Creating Account...
              </span>
            ) : (
              'Register Now'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-[#8B0000] hover:text-[#a30000] hover:underline font-semibold transition">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
