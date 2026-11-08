import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Shield, User, Sparkles, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/feed';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username/email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (userVal, passVal) => {
    setUsername(userVal);
    setPassword(passVal);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2]">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#C85A32] text-[#FAF7F2] flex items-center justify-center mx-auto mb-3 shadow-md">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="font-serif font-black text-3xl text-[#3D271D]">Welcome Back</h2>
          <p className="text-xs uppercase tracking-widest text-[#5C6B47] font-semibold mt-1">
            Access Your Provenance & Profile
          </p>
        </div>

        {/* Demo Fast-Login Helpers */}
        <div className="p-4 bg-[#F4EFE6] rounded-2xl border-2 border-[#E8DEC8] space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#3D271D]">
            <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Fast Demo Login (1-Click Fill):</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('artogram_admin', 'AdminArtogram2026!')}
              className="px-2 py-2 bg-[#FAF7F2] hover:bg-[#E8DEC8] border border-[#E8DEC8] rounded-xl text-[11px] font-bold text-[#3D271D] text-center shadow-xs transition-colors flex flex-col items-center"
            >
              <Shield className="w-3.5 h-3.5 text-[#3D271D] mb-1" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('maya_warli', 'ArtistPass2026!')}
              className="px-2 py-2 bg-[#FAF7F2] hover:bg-[#E8DEC8] border border-[#E8DEC8] rounded-xl text-[11px] font-bold text-[#C85A32] text-center shadow-xs transition-colors flex flex-col items-center"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C85A32] mb-1" />
              <span>Artist</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('catherine_curator', 'UserPass2026!')}
              className="px-2 py-2 bg-[#FAF7F2] hover:bg-[#E8DEC8] border border-[#E8DEC8] rounded-xl text-[11px] font-bold text-[#5C6B47] text-center shadow-xs transition-colors flex flex-col items-center"
            >
              <User className="w-3.5 h-3.5 text-[#5C6B47] mb-1" />
              <span>Patron</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#FAF7F2] p-8 rounded-2xl border-2 border-[#E8DEC8] shadow-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#55443B] mb-1">
                Username or Email
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. maya_warli or email"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-sm text-[#3D271D] focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#55443B]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#C85A32] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-sm text-[#3D271D] focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#C85A32] hover:bg-[#A9431E] text-[#FAF7F2] font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Artogram'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E8DEC8] text-center text-xs text-[#55443B]">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-[#C85A32] hover:underline">
              Join Artogram now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
