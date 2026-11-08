import React, { useState } from 'react';
import client from '../api/client';
import { KeyRound, X, AlertCircle, CheckCircle } from 'lucide-react';

const USAGE_OPTIONS = [
  'Educational Exhibition',
  'Academic Research & Thesis',
  'Documentary & Cultural Media',
  'Commercial Publication',
  'Digital / Online Project',
  'Community Archiving',
  'Other',
];

const PermissionRequestModal = ({ artwork, isOpen, onClose }) => {
  const [intendedUsage, setIntendedUsage] = useState(USAGE_OPTIONS[0]);
  const [isCommercial, setIsCommercial] = useState(false);
  const [description, setDescription] = useState('');
  const [expectedPlatform, setExpectedPlatform] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !artwork) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please describe your intended purpose and project context in detail.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await client.post('/api/permissions/requests/', {
        artwork_id: artwork.id,
        intended_usage: intendedUsage,
        is_commercial: isCommercial,
        description: description.trim(),
        expected_platform: expectedPlatform.trim(),
        additional_info: additionalInfo.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2200);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-2xl border-2 border-[#E8DEC8] shadow-2xl max-w-lg w-full p-6 relative my-8 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#55443B] hover:bg-[#E8DEC8] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#5C6B47] text-[#FAF7F2] flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#3D271D]">Request Artwork Reuse Permission</h3>
            <p className="text-xs text-[#55443B]">Direct consultation with creator & cultural guardians</p>
          </div>
        </div>

        {/* Artwork summary */}
        <div className="p-3 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8] mb-4 flex items-center space-x-3">
          <img
            src={artwork.effective_image || artwork.image_url}
            alt={artwork.title}
            className="w-12 h-12 rounded-lg object-cover bg-[#E8DEC8]"
          />
          <div className="truncate">
            <h4 className="font-serif font-bold text-sm text-[#3D271D] truncate">{artwork.title}</h4>
            <p className="text-xs text-[#55443B]">Lineage: <span className="font-semibold text-[#C85A32]">{artwork.cultural_origin}</span></p>
          </div>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-[#5C6B47] mx-auto animate-bounce" />
            <h4 className="font-serif font-bold text-lg text-[#3D271D]">Permission Request Submitted!</h4>
            <p className="text-xs text-[#55443B] max-w-sm mx-auto">
              Your request has been delivered to the artist. You can monitor the review decision under your Permission Requests dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold uppercase tracking-wider text-[#55443B] block mb-1">
                Intended Usage Category *
              </label>
              <select
                value={intendedUsage}
                onChange={(e) => setIntendedUsage(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
              >
                {USAGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 p-2.5 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8]">
              <input
                type="checkbox"
                id="isCommercial"
                checked={isCommercial}
                onChange={(e) => setIsCommercial(e.target.checked)}
                className="w-4 h-4 text-[#C85A32] rounded focus:ring-[#C85A32]"
              />
              <label htmlFor="isCommercial" className="font-semibold text-[#3D271D] cursor-pointer">
                This project involves commercial monetization or merchandise
              </label>
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-[#55443B] block mb-1">
                Project Description & Purpose *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain how the artwork will be presented, audience reach, and how attribution covenants will be fulfilled..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold uppercase tracking-wider text-[#55443B] block mb-1">
                  Expected Platform / Medium
                </label>
                <input
                  type="text"
                  placeholder="e.g. Museum Catalog, Documentary, Web"
                  value={expectedPlatform}
                  onChange={(e) => setExpectedPlatform(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-[#55443B] block mb-1">
                  Additional Context
                </label>
                <input
                  type="text"
                  placeholder="e.g. Institutional affiliations, grants"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            <div className="p-3 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-[11px] text-[#55443B] space-y-1">
              <p className="font-bold text-[#C85A32]">ATTRIBUTION COVENANT:</p>
              <p>All approved reuses must include the complete Artogram Provenance ID and required creator attribution.</p>
            </div>

            {errorMsg && (
              <p className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-200">{errorMsg}</p>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-[#55443B] hover:bg-[#E8DEC8] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#5C6B47] hover:bg-[#475336] text-[#FAF7F2] font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Send Permission Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PermissionRequestModal;
