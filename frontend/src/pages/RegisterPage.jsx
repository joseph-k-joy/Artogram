import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Palette, Users, AlertCircle, Sparkles } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'artist', // default to artist
    primary_art_form: '',
    location: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register(formData);
      navigate('/feed');
    } catch (err) {
      const resp = err.response?.data;
      if (resp) {
        if (typeof resp === 'string') {
          setError(resp);
        } else if (resp.username) {
          setError(`Username: ${resp.username.join(' ')}`);
        } else if (resp.email) {
          setError(`Email: ${resp.email.join(' ')}`);
        } else {
          setError(Object.values(resp).flat().join(' '));
        }
      } else {
        setError('Registration failed. Please check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2]">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#C85A32] text-[#FAF7F2] flex items-center justify-center mx-auto mb-3 shadow-md">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="font-serif font-black text-3xl text-[#3D271D]">Join Artogram</h2>
          <p className="text-xs uppercase tracking-widest text-[#5C6B47] font-semibold mt-1">
            Where Art Meets Identity & Digital Provenance
          </p>
        </div>

        <div className="bg-[#FAF7F2] p-8 rounded-2xl border-2 border-[#E8DEC8] shadow-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#55443B] mb-2">
                I am joining as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, role: 'artist' }))}
                  className={`p-3 rounded-xl border-2 text-left flex items-start space-x-2.5 transition-all ${
                    formData.role === 'artist'
                      ? 'border-[#C85A32] bg-[#F4EFE6] shadow-xs'
                      : 'border-[#E8DEC8] bg-[#FAF7F2] hover:bg-[#F4EFE6]'
                  }`}
                >
                  <Palette className={`w-5 h-5 shrink-0 ${formData.role === 'artist' ? 'text-[#C85A32]' : 'text-[#55443B]'}`} />
                  <div>
                    <span className="block font-bold text-xs text-[#3D271D]">Artist / Artisan</span>
                    <span className="text-[10px] text-[#55443B]">Register cultural artworks & issue provenance</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, role: 'registered' }))}
                  className={`p-3 rounded-xl border-2 text-left flex items-start space-x-2.5 transition-all ${
                    formData.role === 'registered'
                      ? 'border-[#5C6B47] bg-[#F4EFE6] shadow-xs'
                      : 'border-[#E8DEC8] bg-[#FAF7F2] hover:bg-[#F4EFE6]'
                  }`}
                >
                  <Users className={`w-5 h-5 shrink-0 ${formData.role === 'registered' ? 'text-[#5C6B47]' : 'text-[#55443B]'}`} />
                  <div>
                    <span className="block font-bold text-xs text-[#3D271D]">Patron / Researcher</span>
                    <span className="text-[10px] text-[#55443B]">Explore, collect, license, and verify art</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Full Name / Artisan Name
                </label>
                <input
                  type="text"
                  required
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Maya Dhas"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-sm text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Unique Username
                </label>
                <input
                  type="text"
                  required
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. maya_warli"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-sm text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#55443B] mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="maya@artisan.org"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-sm text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Primary Art Form
                </label>
                <input
                  type="text"
                  name="primary_art_form"
                  value={formData.primary_art_form}
                  onChange={handleChange}
                  placeholder="e.g. Warli Painting, Adire Dyeing"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-sm text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Cultural Region / Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra, India"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-sm text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-sm text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-sm text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#C85A32] hover:bg-[#A9431E] text-[#FAF7F2] font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account & Initializing Profile...' : 'Create Artogram Account'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E8DEC8] text-center text-xs text-[#55443B]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#C85A32] hover:underline">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
