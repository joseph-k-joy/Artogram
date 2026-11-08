import React, { useState } from 'react';
import client from '../api/client';
import { AlertTriangle, X, ShieldAlert, CheckCircle } from 'lucide-react';

const REPORT_CATEGORIES = [
  { value: 'missing_attribution', label: 'Missing Attribution / Source Omission' },
  { value: 'unauthorised_commercial_use', label: 'Unauthorised Commercial Use / Reproduction' },
  { value: 'misleading_ownership_claim', label: 'Misleading Ownership or Lineage Claim' },
  { value: 'impersonation', label: 'Impersonation of Cultural Creator or Lineage' },
  { value: 'unauthorised_modification', label: 'Unauthorised Modification or Derivation' },
  { value: 'cultural_misrepresentation', label: 'Cultural Misrepresentation or Sacrilege' },
  { value: 'other', label: 'Other Misuse' },
];

const MisuseReportModal = ({ artwork, isOpen, onClose }) => {
  const [reportType, setReportType] = useState(REPORT_CATEGORIES[0].value);
  const [suspectedUrl, setSuspectedUrl] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !artwork) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please describe the suspected misuse in detail.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await client.post('/api/reports/', {
        artwork_id: artwork.id,
        report_type: reportType,
        suspected_external_url: suspectedUrl.trim(),
        description: description.trim(),
        evidence_url: evidenceUrl.trim(),
        evidence_description: evidenceDescription.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2400);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit report. Please try again.');
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
          <div className="w-10 h-10 rounded-xl bg-red-600 text-[#FAF7F2] flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#3D271D]">Report Suspected Artwork Misuse</h3>
            <p className="text-xs text-[#55443B]">Protect creator attribution and cultural lineage integrity</p>
          </div>
        </div>

        {/* Artwork Header */}
        <div className="p-3 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8] mb-4 flex items-center space-x-3">
          <img
            src={artwork.effective_image || artwork.image_url}
            alt={artwork.title}
            className="w-12 h-12 rounded-lg object-cover bg-[#E8DEC8]"
          />
          <div className="truncate">
            <h4 className="font-serif font-bold text-sm text-[#3D271D] truncate">{artwork.title}</h4>
            <p className="text-xs text-[#55443B]">ID: <span className="font-mono font-semibold text-[#C85A32]">{artwork.provenance_id || 'Registered'}</span></p>
          </div>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-[#5C6B47] mx-auto animate-bounce" />
            <h4 className="font-serif font-bold text-lg text-[#3D271D]">Report Successfully Logged</h4>
            <p className="text-xs text-[#55443B] max-w-sm mx-auto">
              Your report has been queued for moderator review. Both the submitting party and artist will receive updates in the audit history.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold uppercase tracking-wider text-[#55443B] block mb-1">
                Category of Suspected Violation *
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
              >
                {REPORT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-[#55443B] block mb-1">
                Suspected Infringing Webpage or Channel URL
              </label>
              <input
                type="url"
                placeholder="https://third-party-site.com/unauthorized-usage"
                value={suspectedUrl}
                onChange={(e) => setSuspectedUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-[#55443B] block mb-1">
                Detailed Allegation Description *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe where the artwork was found, how it was misrepresented, and any supporting facts..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold uppercase tracking-wider text-[#55443B] block mb-1">
                  Supporting Evidence URL (Screenshot / Archive)
                </label>
                <input
                  type="url"
                  placeholder="https://archive.org/..."
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-[#55443B] block mb-1">
                  Evidence Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Screenshot of commercial storefront"
                  value={evidenceDescription}
                  onChange={(e) => setEvidenceDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-[#55443B]">
              <span className="font-bold text-amber-800 block mb-0.5">MODERATION STANDARDS:</span>
              A report is an allegation requiring objective review. Artogram will inspect evidence and contact relevant parties without prejudging guilt.
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
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-[#FAF7F2] font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting Report...' : 'File Official Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MisuseReportModal;
