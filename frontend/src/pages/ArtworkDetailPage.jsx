import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ShareModal from '../components/ShareModal';
import PermissionRequestModal from '../components/PermissionRequestModal';
import MisuseReportModal from '../components/MisuseReportModal';
import {
  ShieldCheck,
  QrCode,
  Share2,
  Bookmark,
  Sparkles,
  AlertTriangle,
  KeyRound,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Users,
  Calendar,
  Globe,
  MapPin,
  BookOpen,
} from 'lucide-react';

const ArtworkDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [shareOpen, setShareOpen] = useState(false);
  const [permOpen, setPermOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const fetchArtwork = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/api/artworks/${id}/`);
      setArtwork(res.data);
    } catch (err) {
      setError('Artwork not found or is restricted.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtwork();
  }, [id]);

  const handleBookmarkToggle = async () => {
    if (!user || !artwork) return;
    try {
      const res = await client.post('/api/social/bookmarks/', { artwork_id: artwork.id });
      setArtwork((prev) => ({ ...prev, is_bookmarked: res.data.is_bookmarked }));
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  if (loading) return <LoadingSpinner label="Retrieving digital provenance record..." />;

  if (error || !artwork) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif font-bold text-2xl text-[#3D271D]">Artwork Record Not Found</h2>
        <p className="text-xs text-[#55443B] mt-2 mb-4">{error || 'This artwork record could not be loaded.'}</p>
        <Link to="/explore" className="px-4 py-2 bg-[#C85A32] text-[#FAF7F2] rounded-xl text-xs font-bold">
          Return to Registry
        </Link>
      </div>
    );
  }

  const p = artwork.permissions_summary || {};

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Breadcrumb & Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8DEC8]">
          <div className="flex items-center space-x-2 text-xs text-[#55443B]">
            <Link to="/explore" className="hover:text-[#C85A32]">Registry</Link>
            <span>/</span>
            <span className="font-bold text-[#3D271D]">{artwork.art_category}</span>
            <span>/</span>
            <span className="font-mono text-[#C85A32] font-semibold">{artwork.provenance_id}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8DEC8] text-[#5C6B47] flex items-center space-x-1.5 border border-[#5C6B47]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{artwork.verification_badge || 'Self-Registered Cultural Work'}</span>
            </span>

            <Link
              to={`/artworks/${artwork.provenance_id}/identity-card/`}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#C85A32] hover:bg-[#A9431E] text-[#FAF7F2] shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>View Identity Card</span>
            </Link>
          </div>
        </div>

        {/* Main Artwork Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Visual Artwork & QR Seal */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl overflow-hidden border-4 border-[#E8DEC8] shadow-xl bg-[#211C19]/5">
              <img
                src={artwork.effective_image}
                alt={artwork.title}
                className="w-full max-h-[600px] object-contain mx-auto bg-[#F4EFE6]"
              />
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#F4EFE6] rounded-2xl border-2 border-[#E8DEC8]">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShareOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DEC8] text-xs font-bold text-[#3D271D] hover:bg-[#E8DEC8] transition-colors flex items-center space-x-1.5"
                >
                  <Share2 className="w-4 h-4 text-[#C85A32]" />
                  <span>Share</span>
                </button>

                <button
                  onClick={handleBookmarkToggle}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                    artwork.is_bookmarked
                      ? 'bg-[#C85A32] border-[#C85A32] text-[#FAF7F2]'
                      : 'bg-[#FAF7F2] border-[#E8DEC8] text-[#3D271D] hover:bg-[#E8DEC8]'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${artwork.is_bookmarked ? 'fill-current' : ''}`} />
                  <span>{artwork.is_bookmarked ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPermOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#5C6B47] hover:bg-[#475336] text-[#FAF7F2] text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Request Permission</span>
                </button>

                <button
                  onClick={() => setReportOpen(true)}
                  className="px-3 py-2 rounded-xl bg-[#FAF7F2] hover:bg-red-50 border border-red-200 text-red-700 text-xs font-semibold transition-colors flex items-center space-x-1"
                  title="Report Misuse"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Report</span>
                </button>
              </div>
            </div>

            {/* Cultural Context & Background */}
            <div className="p-6 bg-[#FAF7F2] rounded-2xl border-2 border-[#E8DEC8] shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-[#3D271D] flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-[#C85A32]" />
                <span>Cultural Background & Historical Context</span>
              </h3>

              {artwork.cultural_background ? (
                <div className="text-xs text-[#55443B] leading-relaxed space-y-2">
                  <p>{artwork.cultural_background}</p>
                </div>
              ) : (
                <p className="text-xs text-[#55443B] italic">No detailed cultural background submitted.</p>
              )}

              {artwork.historical_context && (
                <div className="pt-3 border-t border-[#E8DEC8] text-xs text-[#55443B] space-y-1">
                  <span className="font-bold text-[#3D271D] uppercase text-[10px] tracking-wider block">Historical Lineage</span>
                  <p>{artwork.historical_context}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Provenance Metadata & Permissions */}
          <div className="lg:col-span-5 space-y-6">
            {/* Title & Creator Block */}
            <div className="p-6 bg-[#FAF7F2] rounded-2xl border-2 border-[#E8DEC8] shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#5C6B47] block mb-1">
                  {artwork.art_category}
                </span>
                <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#3D271D] leading-tight">
                  {artwork.title}
                </h1>
              </div>

              {/* Creator Card */}
              <div className="p-3.5 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8] flex items-center space-x-3">
                <img
                  src={artwork.submitter_avatar}
                  alt={artwork.original_creator_name}
                  className="w-12 h-12 rounded-full object-cover border border-[#E8DEC8] bg-[#E8DEC8]"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#55443B] block">Attributed Creator</span>
                  <Link
                    to={`/profile/${artwork.submitter_username}`}
                    className="font-bold text-sm text-[#C85A32] hover:underline"
                  >
                    {artwork.original_creator_name}
                  </Link>
                  <p className="text-[11px] text-[#55443B]">@{artwork.submitter_username}</p>
                </div>
              </div>

              {/* Description */}
              {artwork.description && (
                <p className="text-xs text-[#55443B] leading-relaxed border-t border-[#E8DEC8] pt-3">
                  {artwork.description}
                </p>
              )}

              {/* Cultural Attributes Table */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-2.5 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8]">
                  <span className="text-[10px] uppercase font-bold text-[#55443B] flex items-center space-x-1">
                    <Globe className="w-3 h-3 text-[#5C6B47]" />
                    <span>Cultural Origin</span>
                  </span>
                  <span className="font-semibold text-[#3D271D] block mt-0.5">{artwork.cultural_origin}</span>
                </div>

                <div className="p-2.5 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8]">
                  <span className="text-[10px] uppercase font-bold text-[#55443B] flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-[#C85A32]" />
                    <span>Region</span>
                  </span>
                  <span className="font-semibold text-[#3D271D] block mt-0.5">{artwork.geographic_region || 'Documented'}</span>
                </div>

                <div className="p-2.5 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8]">
                  <span className="text-[10px] uppercase font-bold text-[#55443B] flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-[#3D271D]" />
                    <span>Period / Cycle</span>
                  </span>
                  <span className="font-semibold text-[#3D271D] block mt-0.5">{artwork.creation_period || 'Traditional'}</span>
                </div>

                <div className="p-2.5 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8]">
                  <span className="text-[10px] uppercase font-bold text-[#55443B]">Classification</span>
                  <span className="font-semibold capitalize text-[#5C6B47] block mt-0.5">{artwork.classification}</span>
                </div>
              </div>
            </div>

            {/* Digital Provenance Certificate Summary */}
            <div className="p-6 bg-[#FAF7F2] rounded-2xl border-2 border-[#E8DEC8] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#3D271D] flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-[#5C6B47]" />
                  <span>Digital Provenance Certificate</span>
                </h3>
                <span className="font-mono text-xs font-bold text-[#C85A32]">{artwork.provenance_id}</span>
              </div>

              {/* QR and SHA */}
              <div className="flex items-center space-x-4 p-3 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8]">
                {artwork.qr_code_data_url && (
                  <img
                    src={artwork.qr_code_data_url}
                    alt="Provenance QR"
                    className="w-20 h-20 rounded-lg border border-[#3D271D] p-1 bg-[#FAF7F2] shrink-0"
                  />
                )}
                <div className="text-xs space-y-1 truncate">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#55443B] block">
                    Cryptographic SHA-256 Fingerprint:
                  </span>
                  <p className="font-mono text-[10px] text-[#3D271D] break-all bg-[#FAF7F2] p-1.5 rounded border border-[#E8DEC8]">
                    {artwork.sha256_hash}
                  </p>
                  <Link
                    to={`/artworks/${artwork.provenance_id}/provenance/`}
                    className="text-xs font-bold text-[#C85A32] hover:underline inline-flex items-center space-x-1"
                  >
                    <span>Inspect Public Provenance Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Attribution Requirement */}
              <div className="text-xs space-y-1 p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DEC8]">
                <span className="text-[10px] uppercase font-bold text-[#55443B] block">
                  Mandatory Credit Notice
                </span>
                <p className="italic text-[#55443B]">{artwork.required_credit}</p>
              </div>
            </div>

            {/* Reuse Permission Matrix */}
            <div className="p-6 bg-[#FAF7F2] rounded-2xl border-2 border-[#E8DEC8] shadow-sm space-y-3">
              <h3 className="font-serif font-bold text-base text-[#3D271D]">
                Reuse Permissions & Covenants
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2 p-2 bg-[#F4EFE6] rounded-lg border border-[#E8DEC8]">
                  {p.educational_use_allowed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#5C6B47]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>Educational Use</span>
                </div>

                <div className="flex items-center space-x-2 p-2 bg-[#F4EFE6] rounded-lg border border-[#E8DEC8]">
                  {p.commercial_use_allowed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#5C6B47]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-stone-400" />
                  )}
                  <span>Commercial Use</span>
                </div>

                <div className="flex items-center space-x-2 p-2 bg-[#F4EFE6] rounded-lg border border-[#E8DEC8]">
                  {p.modification_allowed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#5C6B47]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-stone-400" />
                  )}
                  <span>Modification / Remix</span>
                </div>

                <div className="flex items-center space-x-2 p-2 bg-[#F4EFE6] rounded-lg border border-[#E8DEC8]">
                  {p.downloading_allowed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#5C6B47]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-stone-400" />
                  )}
                  <span>Downloading Allowed</span>
                </div>
              </div>

              {p.additional_conditions && (
                <div className="text-[11px] text-[#55443B] pt-2">
                  <span className="font-bold text-[#3D271D]">Additional Covenants: </span>
                  <span>{p.additional_conditions}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ShareModal
        artwork={artwork}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />

      <PermissionRequestModal
        artwork={artwork}
        isOpen={permOpen}
        onClose={() => setPermOpen(false)}
      />

      <MisuseReportModal
        artwork={artwork}
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
};

export default ArtworkDetailPage;
