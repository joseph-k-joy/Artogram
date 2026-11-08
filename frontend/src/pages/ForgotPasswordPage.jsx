import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { KeyRound, CheckCircle, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await client.post('/api/auth/forgot-password/', { email });
      setMessage(res.data.message);
    } catch {
      setMessage('Password reset request has been processed. Please check your instructions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-[#FAF7F2]">
      <div className="max-w-md w-full bg-[#FAF7F2] p-8 rounded-2xl border-2 border-[#E8DEC8] shadow-lg space-y-6">
        <div className="text-center">
          <KeyRound className="w-12 h-12 text-[#C85A32] mx-auto mb-2" />
          <h2 className="font-serif font-bold text-2xl text-[#3D271D]">Recover Password</h2>
          <p className="text-xs text-[#55443B] mt-1">Enter your registered email to receive reset instructions</p>
        </div>

        {message ? (
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-center space-y-3">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
            <p className="text-xs">{message}</p>
            <div className="pt-2">
              <Link to="/reset-password" className="text-xs font-bold text-[#C85A32] underline">
                Proceed to Reset Password &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#55443B] mb-1">
                Account Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@cultural.org"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-sm text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#C85A32] hover:bg-[#A9431E] text-[#FAF7F2] font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Sending Request...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs font-bold text-[#55443B] hover:text-[#C85A32] inline-flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
