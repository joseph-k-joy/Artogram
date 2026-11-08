import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { User, Palette, MapPin, Globe, CheckCircle, ArrowLeft } from 'lucide-react';

const EditProfilePage = () => {
  const { user, refreshMe } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    location: '',
    primary_art_form: '',
    website_link: '',
    avatar_url: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        display_name: user.profile.display_name || '',
        bio: user.profile.bio || '',
        location: user.profile.location || '',
        primary_art_form: user.profile.primary_art_form || '',
        website_link: user.profile.website_link || '',
        avatar_url: user.profile.avatar_url || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await client.put('/api/profiles/me/update/', formData);
      await refreshMe();
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => navigate(`/profile/${user.username}`), 1400);
    } catch (err) {
      setErrorMsg('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DEC8]">
          <Link
            to={user ? `/profile/${user.username}` : '/feed'}
            className="text-xs font-bold text-[#55443B] hover:text-[#C85A32] flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </Link>
          <span className="text-xs font-bold uppercase text-[#5C6B47]">Account Settings</span>
        </div>

        <div className="p-8 bg-[#FAF7F2] rounded-3xl border-2 border-[#E8DEC8] shadow-md space-y-6">
          <div>
            <h1 className="font-serif font-black text-2xl text-[#3D271D]">Edit Artist Profile</h1>
            <p className="text-xs text-[#55443B]">Manage your public bio, regional lineage, and art forms</p>
          </div>

          {successMsg && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                Display Name / Artisan Collective
              </label>
              <input
                type="text"
                required
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-sm text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                Profile Avatar URL
              </label>
              <input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Primary Art Form
                </label>
                <input
                  type="text"
                  value={formData.primary_art_form}
                  onChange={(e) => setFormData({ ...formData, primary_art_form: e.target.value })}
                  placeholder="e.g. Traditional Pottery, Indigo Dyeing"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Cultural Region / City
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Abeokuta, Nigeria"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                External Portfolio / Documentation Link
              </label>
              <input
                type="url"
                value={formData.website_link}
                onChange={(e) => setFormData({ ...formData, website_link: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                Artist Biography & Cultural Lineage
              </label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share your lineage, traditional training, masters, materials, and artistic philosophy..."
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
              ></textarea>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#C85A32] hover:bg-[#A9431E] text-[#FAF7F2] font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
