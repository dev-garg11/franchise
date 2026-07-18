import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import { LogOut, User, ShieldAlert, Sparkles, Building2, UserCircle } from 'lucide-react';

// Protected Route component (RBAC)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8B0000]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Simple Dashboard Components with unique aesthetic styling
const DashboardLayout = ({ title, icon: Icon, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B0000]/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header bar */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#8B0000]/10 border border-[#8B0000]/30 rounded-lg text-[#8B0000]">
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-wider text-white uppercase">{title}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-slate-400 font-mono capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/5 hover:bg-[#8B0000] border border-white/10 hover:border-transparent px-4 py-2 rounded-lg text-sm text-slate-300 hover:text-white transition duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Content wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 z-10">
        {children}
      </main>
    </div>
  );
};

const AdminDashboard = () => (
  <DashboardLayout title="Admin Panel" icon={ShieldAlert}>
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
      <h1 className="text-3xl font-bold text-white mb-4">Hello Administrator!</h1>
      <p className="text-slate-300 mb-6">
        This is the secure management center. You have permission to manage brands, verify investors, and monitor logs.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 p-6 rounded-xl border border-white/5">
          <h3 className="font-semibold text-white mb-2">Total Brands</h3>
          <span className="text-4xl font-extrabold text-[#8B0000]">124</span>
        </div>
        <div className="bg-white/5 p-6 rounded-xl border border-white/5">
          <h3 className="font-semibold text-white mb-2">Registered Investors</h3>
          <span className="text-4xl font-extrabold text-[#8B0000]">482</span>
        </div>
        <div className="bg-white/5 p-6 rounded-xl border border-white/5">
          <h3 className="font-semibold text-white mb-2">Platform Revenue</h3>
          <span className="text-4xl font-extrabold text-[#8B0000]">$45,210</span>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

const BrandOwnerDashboard = () => (
  <DashboardLayout title="Brand Dashboard" icon={Building2}>
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
      <h1 className="text-3xl font-bold text-white mb-4">Hello Brand Owner!</h1>
      <p className="text-slate-300 mb-6">
        Manage your franchise details, upload training agreements, edit locations, and view inquiries from potential investors.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 p-6 rounded-xl border border-white/5">
          <h3 className="font-semibold text-white mb-2">Franchise Inquiries</h3>
          <p className="text-slate-400 text-sm mb-4">You have 5 new investor inquiries waiting for response.</p>
          <button className="bg-[#8B0000] hover:bg-[#a30000] text-white px-4 py-2 rounded-lg text-sm transition">
            View Inquiries
          </button>
        </div>
        <div className="bg-white/5 p-6 rounded-xl border border-white/5">
          <h3 className="font-semibold text-white mb-2">Brand Verification Status</h3>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold rounded-full mt-2">
            Approved & Verified
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
);

const InvestorDashboard = () => (
  <DashboardLayout title="Investor Panel" icon={UserCircle}>
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
      <h1 className="text-3xl font-bold text-white mb-4">Hello Investor!</h1>
      <p className="text-slate-300 mb-6">
        Browse franchise lists, sort by budget, filter by industries, and request direct meetings with brand owners.
      </p>
      <div className="bg-white/5 p-6 rounded-xl border border-white/5">
        <h3 className="font-semibold text-white mb-2">Matching Franchises</h3>
        <p className="text-slate-400 text-sm mb-4">We found 8 hot opportunities matching your food-industry profile.</p>
        <button className="bg-[#8B0000] hover:bg-[#a30000] text-white px-4 py-2 rounded-lg text-sm transition">
          Browse Matches
        </button>
      </div>
    </div>
  </DashboardLayout>
);

const Unauthorized = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 mb-6">
      <ShieldAlert className="w-16 h-16" />
    </div>
    <h1 className="text-3xl font-bold mb-2">403 - Unauthorized</h1>
    <p className="text-slate-400 mb-6 text-center max-w-md">
      You do not have access rights to view this dashboard resource.
    </p>
    <Link to="/login" className="bg-[#8B0000] hover:bg-[#a30000] text-white px-6 py-2.5 rounded-lg transition font-medium">
      Return to Sign In
    </Link>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected Role-Based Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brand-owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={['brand_owner']}>
                <BrandOwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['investor']}>
                <InvestorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Root Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
