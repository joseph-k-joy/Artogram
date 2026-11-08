import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import {
  Download,
  Share2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Info,
  Sparkles,
} from 'lucide-react';

const ArtworkIdentityCard = ({
  cardData,
  onShareInternal,
  showControls = true,
  compact = false,
}) => {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!cardData) return null;

  const {
    provenance_id,
    artwork_id,
    artwork_title,
    artwork_image,
    creator_username,
    creator_display_name,
    cultural_origin,
    classification,
    sha256_hash,
    qr_code_data_url,
    verification_status,
    verification_badge_label,
    registered_at,
    required_credit,
    preferred_attribution_format,
    permissions = {},
  } = cardData;

  const publicProvenanceUrl = `${window.location.origin}/artworks/${provenance_id}/provenance/`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicProvenanceUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#FAF7F2',
        logging: false,
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Artogram_IdentityCard_${provenance_id}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to export identity card image:', err);
    } finally {
      setDownloading(false);
    }
  };

  const isVerified = verification_status === 'community_reviewed';

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      {/* The Printable / Renderable Cultural Card */}
      <div
        ref={cardRef}
        className={`w-full bg-[#FAF7F2] text-[#3D271D] rounded-2xl border-4 ${
          isVerified ? 'border-[#5C6B47]' : 'border-[#C85A32]'
        } shadow-2xl overflow-hidden p-6 sm:p-7 relative select-none`}
        style={{
          boxShadow: '0 20px 40px -15px rgba(61, 39, 29, 0.25)',
        }}
      >
        {/* Subtle decorative cultural corner borders */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#C85A32]"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#C85A32]"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#C85A32]"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#C85A32]"></div>

        {/* Card Header */}
        <div className="flex justify-between items-start border-b-2 border-[#E8DEC8] pb-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#C85A32] text-[#FAF7F2] flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-serif font-black text-lg tracking-wider text-[#3D271D]">ARTOGRAM</span>
                <span className="text-[10px] font-bold tracking-widest text-[#5C6B47] uppercase bg-[#E8DEC8] px-1.5 py-0.5 rounded">
                  IDENTITY CARD
                </span>
              </div>
              <p className="text-[10px] font-medium text-[#55443B]">Digital Cultural Provenance Record</p>
            </div>
          </div>

          <div className="text-right">
            <span className="block text-[11px] font-mono font-bold text-[#C85A32] bg-[#FAF7F2] px-2 py-0.5 border border-[#C85A32]/40 rounded">
              {provenance_id}
            </span>
            <span className="text-[9px] text-[#55443B]">
              {registered_at ? new Date(registered_at).toLocaleDateString() : 'Active Record'}
            </span>
          </div>
        </div>

        {/* Artwork Image & Main Details */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 mb-5 items-center">
          <div className="sm:col-span-5 relative group">
            <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-[#E8DEC8] shadow-inner bg-[#E8DEC8]/50">
              <img
                src={artwork_image}
                alt={artwork_title}
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Status Stamp */}
            <div className="absolute bottom-2 left-2 right-2 bg-[#FAF7F2]/90 backdrop-blur-xs py-1 px-2 rounded-lg text-center border border-[#E8DEC8] shadow-xs">
              <div className="flex items-center justify-center space-x-1">
                {isVerified ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5C6B47]" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32]" />
                )}
                <span className="text-[10px] font-bold text-[#3D271D] truncate">
                  {verification_badge_label || (isVerified ? 'Community Verified' : 'Self-Registered')}
                </span>
              </div>
            </div>
          </div>

          <div className="sm:col-span-7 space-y-2.5">
            <div>
              <h3 className="font-serif font-black text-xl text-[#3D271D] leading-tight line-clamp-2">
                {artwork_title}
              </h3>
              <p className="text-xs font-semibold text-[#55443B]">
                Creator: <span className="text-[#C85A32] font-bold">{creator_display_name || creator_username}</span>
                {creator_username && <span className="text-[#55443B]/70 font-normal"> (@{creator_username})</span>}
              </p>
            </div>

            <div className="text-xs space-y-1 bg-[#F4EFE6] p-2.5 rounded-xl border border-[#E8DEC8]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#55443B] block">Cultural Origin</span>
                <span className="font-medium text-[#3D271D]">{cultural_origin}</span>
              </div>
              {classification && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#55443B] block">Classification</span>
                  <span className="font-medium capitalize text-[#5C6B47]">{classification} Expression</span>
                </div>
              )}
            </div>

            {/* Cryptographic SHA-256 preview */}
            <div className="text-[9px] font-mono text-[#55443B] bg-[#FAF7F2] p-1.5 rounded border border-[#E8DEC8]/60 truncate">
              <span className="font-bold text-[#3D271D]">SHA-256: </span>
              {sha256_hash}
            </div>
          </div>
        </div>

        {/* QR Code and Attribution Footer Section */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#F4EFE6] p-4 rounded-xl border border-[#E8DEC8] mb-4">
          {/* QR Code */}
          <div className="sm:col-span-4 flex flex-col items-center justify-center">
            {qr_code_data_url ? (
              <img
                src={qr_code_data_url}
                alt={`QR code for ${provenance_id}`}
                className="w-24 h-24 rounded-lg border border-[#3D271D] p-1 bg-[#FAF7F2] shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 bg-[#E8DEC8] rounded-lg flex items-center justify-center text-xs text-[#55443B]">
                QR Code
              </div>
            )}
            <span className="text-[8px] font-mono tracking-wider uppercase text-[#55443B] mt-1 font-semibold">
              Scan to Verify
            </span>
          </div>

          {/* Permissions and Attribution Summary */}
          <div className="sm:col-span-8 space-y-2 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#55443B] block">
                Reuse Terms & Covenants
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1 ${
                  permissions.educational_use_allowed ? 'bg-[#5C6B47]/15 text-[#5C6B47]' : 'bg-red-100 text-red-700'
                }`}>
                  {permissions.educational_use_allowed ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                  <span>Educational Use</span>
                </span>

                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1 ${
                  permissions.commercial_use_allowed ? 'bg-[#5C6B47]/15 text-[#5C6B47]' : 'bg-stone-200 text-[#55443B]'
                }`}>
                  {permissions.commercial_use_allowed ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                  <span>Commercial Use</span>
                </span>

                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#C85A32]/15 text-[#C85A32] flex items-center space-x-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Attribution Mandatory</span>
                </span>
              </div>
            </div>

            <div className="text-[10px] text-[#55443B] leading-tight">
              <span className="font-bold text-[#3D271D]">Required Credit: </span>
              <span className="italic">{required_credit || `Artwork: ${artwork_title} by ${creator_display_name || creator_username}`}</span>
            </div>
          </div>
        </div>

        {/* Verification Link button inside card */}
        <div className="flex items-center justify-between text-[10px] text-[#55443B] pt-2 border-t border-[#E8DEC8]">
          <span className="truncate max-w-[240px]">Registered on Artogram Public Registry</span>
          <Link
            to={`/artworks/${provenance_id}/provenance/`}
            className="text-[#C85A32] font-bold hover:underline flex items-center space-x-1"
          >
            <span>Inspect Provenance Certificate</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Control Buttons (Export, Share, Copy Link) */}
      {showControls && (
        <div className="w-full mt-4 flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="px-4 py-2 bg-[#C85A32] hover:bg-[#A9431E] text-[#FAF7F2] text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Exporting...' : 'Download Identity Card (PNG)'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#3D271D] border border-[#E8DEC8] text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-[#5C6B47]" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Public URL'}</span>
          </button>

          {onShareInternal && (
            <button
              onClick={onShareInternal}
              className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#3D271D] border border-[#E8DEC8] text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Share With User</span>
            </button>
          )}

          <Link
            to={`/artworks/${provenance_id}/provenance/`}
            className="px-3.5 py-2 bg-[#5C6B47] hover:bg-[#475336] text-[#FAF7F2] text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Full Provenance</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ArtworkIdentityCard;
