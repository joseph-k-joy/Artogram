import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ArtworkIdentityCard from '../components/ArtworkIdentityCard';
import {
  ShieldCheck,
  QrCode,
  FileKey2,
  Calendar,
  Globe,
  MapPin,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Download,
} from 'lucide-react';

const PublicProvenancePage = () => {
  const { provenanceId } = useParams();
  const [provenance, setProvenance] = useState(null);
  const [identityCardData, setIdentityCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('provenance'); // 'provenance' or 'card'

  useEffect(() => {
    const fetchProvenance = async () => {
      setLoading(true);
      try {
        const res = await client.get(`/api/provenance/${provenanceId}/`);
        setProvenance(res.data);

        // Also fetch identity card payload
        const cardRes = await client.get(`/api/provenance/${provenanceId}/identity-card/`);
        setIdentityCardData(cardRes.data);
      } catch (err) {
        setError('Digital provenance record not found or could not be verified.');
      } finally {
        setLoading(false);
      }
    };
    fetchProvenance();
  }, [provenanceId]);

  if (loading) return <LoadingSpinner label="Validating cryptographic provenance record..." />;

  if (error || !provenance) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-[#FAF7F2]">
        <FileKey2 className="w-16 h-16 text-[#C85A32] mb-3" />
        <h2 className="font-serif font-black text-2xl text-[#3D271D]">Provenance Certificate Not Found</h2>
        <p className="text-xs text-[#55443B] mt-1 mb-5 max-w-sm">
          No registered cultural provenance record matches identifier <code className="text-[#C85A32]">{provenanceId}</code>.
        </p>
        <Link to="/explore" className="px-5 py-2.5 bg-[#C85A32] text-[#FAF7F2] rounded-xl text-xs font-bold">
          Search Provenance Registry
        </Link>
      </div>
    );
  }

  const { artwork, audit_history = [] } = provenance;
  const isCommunityVerified = provenance.verification_status === 'community_reviewed';

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Certificate Header Banner */}
        <div className="p-6 sm:p-8 bg-[#FAF7F2] rounded-3xl border-4 border-[#C85A32] shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-[#E8DEC8] pb-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-[#C85A32] text-[#FAF7F2] flex items-center justify-center shadow-md">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#5C6B47] block">
                  Artogram Public Verification Registry
                </span>
                <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#3D271D]">
                  Cultural Provenance Certificate
                </h1>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block font-mono font-black text-base sm:text-lg text-[#C85A32] bg-[#F4EFE6] px-3 py-1 rounded-xl border border-[#C85A32]/40">
                {provenance.provenance_id}
              </span>
              <p className="text-[11px] text-[#55443B] mt-1">
                Issued: {new Date(provenance.registered_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </p>
            </div>
          </div>

          {/* Verification Badge Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#F4EFE6] rounded-2xl border border-[#E8DEC8]">
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 ${
                isCommunityVerified
                  ? 'bg-[#5C6B47] text-[#FAF7F2]'
                  : 'bg-[#C85A32] text-[#FAF7F2]'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{provenance.verification_badge_label}</span>
              </span>

              <span className="text-xs text-[#55443B] hidden sm:inline">
                Registered by: <strong className="text-[#3D271D]">@{provenance.registered_by_username}</strong>
              </span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex space-x-1.5 bg-[#FAF7F2] p-1 rounded-xl border border-[#E8DEC8]">
              <button
                onClick={() => setActiveTab('provenance')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'provenance'
                    ? 'bg-[#3D271D] text-[#FAF7F2]'
                    : 'text-[#55443B] hover:text-[#3D271D]'
                }`}
              >
                Provenance Details
              </button>
              <button
                onClick={() => setActiveTab('card')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 ${
                  activeTab === 'card'
                    ? 'bg-[#C85A32] text-[#FAF7F2]'
                    : 'text-[#55443B] hover:text-[#3D271D]'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Identity Card</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Full Provenance Breakdown */}
        {activeTab === 'provenance' && (
          <div className="space-y-8">
            {/* Artwork Snapshot & QR Verification Code */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-5 space-y-4">
                <div className="rounded-2xl overflow-hidden border-2 border-[#E8DEC8] shadow-md bg-[#211C19]/5">
                  <img
                    src={artwork?.effective_image}
                    alt={artwork?.title}
                    className="w-full h-auto object-cover"
                  />
                </div>

                <div className="text-center">
                  <Link
                    to={`/artworks/${artwork?.id}`}
                    className="text-xs font-bold text-[#C85A32] hover:underline inline-flex items-center space-x-1"
                  >
                    <span>View full social post & discussion &rarr;</span>
                  </Link>
                </div>
              </div>

              <div className="md:col-span-7 space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#5C6B47] block mb-1">
                    {artwork?.art_category}
                  </span>
                  <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#3D271D]">
                    {artwork?.title}
                  </h2>
                  <p className="text-xs text-[#55443B] mt-1 font-semibold">
                    Attributed Creator: <span className="text-[#C85A32] font-bold">{artwork?.original_creator_name}</span>
                  </p>
                </div>

                {/* Cryptographic SHA-256 Card */}
                <div className="p-4 bg-[#FAF7F2] rounded-2xl border-2 border-[#E8DEC8] space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#55443B] block">
                    Cryptographic File Fingerprint (SHA-256)
                  </span>
                  <p className="font-mono text-xs text-[#3D271D] break-all bg-[#F4EFE6] p-2.5 rounded-xl border border-[#E8DEC8]">
                    {provenance.sha256_hash}
                  </p>
                  <div className="flex flex-wrap justify-between text-[11px] text-[#55443B] pt-1">
                    <span>MIME: {provenance.mime_type}</span>
                    <span>File size: {(provenance.file_size_bytes / 1024).toFixed(1)} KB</span>
                    <span>Status: Verified In Database</span>
                  </div>
                </div>

                {/* Cultural Lineage Metadata */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8]">
                    <span className="text-[10px] font-bold uppercase text-[#55443B] block">Cultural Origin</span>
                    <span className="font-semibold text-[#3D271D]">{artwork?.cultural_origin}</span>
                  </div>

                  <div className="p-3 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8]">
                    <span className="text-[10px] font-bold uppercase text-[#55443B] block">Geographic Region</span>
                    <span className="font-semibold text-[#3D271D]">{artwork?.geographic_region || 'Documented Region'}</span>
                  </div>

                  <div className="p-3 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8]">
                    <span className="text-[10px] font-bold uppercase text-[#55443B] block">Classification</span>
                    <span className="font-semibold capitalize text-[#5C6B47]">{artwork?.classification} Form</span>
                  </div>

                  <div className="p-3 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8]">
                    <span className="text-[10px] font-bold uppercase text-[#55443B] block">Declaration</span>
                    <span className="font-semibold capitalize text-[#3D271D]">{artwork?.declaration_type?.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                {/* Attribution Instructions */}
                <div className="p-4 bg-[#F4EFE6] rounded-2xl border border-[#E8DEC8] space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#3D271D] block">
                    Required Credit Format for External Reuse
                  </span>
                  <div className="p-2.5 bg-[#FAF7F2] rounded-xl font-mono text-xs text-[#3D271D] border border-[#E8DEC8]">
                    {artwork?.required_credit || `Artwork: ${artwork?.title} by ${artwork?.original_creator_name}. Provenance ID: ${provenance.provenance_id}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Trail & Event History */}
            <div className="p-6 bg-[#FAF7F2] rounded-3xl border-2 border-[#E8DEC8] shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-[#3D271D] flex items-center space-x-2">
                <Clock className="w-5 h-5 text-[#C85A32]" />
                <span>Provenance Event Audit Trail</span>
              </h3>
              <p className="text-xs text-[#55443B]">
                Append-only log recording registration, certification, and verification milestones for this artwork.
              </p>

              <div className="space-y-3 pt-2">
                {audit_history.length === 0 ? (
                  <p className="text-xs text-[#55443B] italic">Initial registration event logged.</p>
                ) : (
                  audit_history.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8] flex items-start justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-bold text-[#C85A32] uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E8DEC8]">
                            {ev.action}
                          </span>
                          <span className="font-medium text-[#3D271D]">by @{ev.actor_username || 'System'}</span>
                        </div>
                        <p className="text-[#55443B]">{ev.description}</p>
                      </div>
                      <span className="text-[10px] text-[#55443B] font-mono shrink-0 ml-4">
                        {new Date(ev.timestamp).toLocaleDateString()} {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Legal / Ethical Notice */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border-2 border-[#C85A32]/40 text-xs text-[#55443B] space-y-1">
              <span className="font-bold text-[#C85A32] uppercase text-[10px] tracking-wider block">
                IMPORTANT LEGAL & REGULATORY CLARIFICATION:
              </span>
              <p>{provenance.disclaimer}</p>
            </div>
          </div>
        )}

        {/* Tab 2: Identity Card View */}
        {activeTab === 'card' && identityCardData && (
          <div className="py-6 flex flex-col items-center">
            <ArtworkIdentityCard cardData={identityCardData} showControls={true} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProvenancePage;
