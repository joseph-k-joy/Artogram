import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import ArtworkIdentityCard from '../components/ArtworkIdentityCard';
import {
  ShieldCheck,
  QrCode,
  FileKey2,
  Compass,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Users,
  Feather,
} from 'lucide-react';

const LandingPage = () => {
  const [featuredCard, setFeaturedCard] = useState(null);
  const [recentArtworks, setRecentArtworks] = useState([]);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const res = await client.get('/api/artworks/?ordering=-created_at');
        if (res.data && res.data.length > 0) {
          setRecentArtworks(res.data.slice(0, 4));
          // Fetch identity card for first artwork
          const firstProvId = res.data[0].provenance_id;
          if (firstProvId) {
            const cardRes = await client.get(`/api/provenance/${firstProvId}/identity-card/`);
            setFeaturedCard(cardRes.data);
          }
        }
      } catch (err) {
        console.warn('Landing data fetch:', err);
      }
    };
    fetchLandingData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3D271D]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-[#E8DEC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Mission & Hook */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E8DEC8] text-[#5C6B47] text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-4 h-4 text-[#C85A32]" />
                <span>The Cultural Provenance Network</span>
              </div>

              <h1 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl text-[#3D271D] leading-tight">
                Where Art Meets <span className="text-[#C85A32] underline decoration-[#E8DEC8]">Identity</span>.
              </h1>

              <p className="text-base sm:text-lg text-[#55443B] leading-relaxed max-w-2xl">
                A social platform built specifically for indigenous lineages, cultural custodians, and contemporary artists. Every registered artwork receives a cryptographically fingerprinted digital provenance record, a verifiable QR code, and a shareable <strong className="text-[#3D271D]">Artogram Identity Card</strong>.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/register"
                  className="px-6 py-3.5 rounded-xl bg-[#C85A32] hover:bg-[#A9431E] text-[#FAF7F2] font-bold text-sm sm:text-base flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
                >
                  <span>Join as an Artist or Patron</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/explore"
                  className="px-6 py-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#3D271D] border-2 border-[#E8DEC8] font-bold text-sm sm:text-base flex items-center space-x-2 shadow-xs transition-colors"
                >
                  <Compass className="w-5 h-5 text-[#5C6B47]" />
                  <span>Explore Artwork Registry</span>
                </Link>

                <Link
                  to="/login"
                  className="px-5 py-3.5 rounded-xl text-xs font-bold text-[#55443B] hover:text-[#C85A32] flex items-center"
                >
                  <span>Test Demo Accounts &rarr;</span>
                </Link>
              </div>

              {/* Cultural Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E8DEC8]/80 max-w-lg">
                <div>
                  <span className="block font-serif font-bold text-xl text-[#C85A32]">SHA-256</span>
                  <span className="text-xs text-[#55443B]">Cryptographic Hash</span>
                </div>
                <div>
                  <span className="block font-serif font-bold text-xl text-[#5C6B47]">QR Code</span>
                  <span className="text-xs text-[#55443B]">Physical & Digital Link</span>
                </div>
                <div>
                  <span className="block font-serif font-bold text-xl text-[#3D271D]">Audit Trail</span>
                  <span className="text-xs text-[#55443B]">Transparent Lineage</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Identity Card Showcase */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full">
                <div className="text-center mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#5C6B47] bg-[#E8DEC8] px-3 py-1 rounded-full">
                    Featured Artogram Identity Card
                  </span>
                </div>
                {featuredCard ? (
                  <ArtworkIdentityCard cardData={featuredCard} showControls={true} />
                ) : (
                  <div className="p-8 bg-[#FAF7F2] rounded-2xl border-4 border-[#C85A32] shadow-xl text-center space-y-3">
                    <Feather className="w-10 h-10 text-[#C85A32] mx-auto animate-pulse" />
                    <p className="font-serif font-bold text-lg text-[#3D271D]">Cultural Art Registry</p>
                    <p className="text-xs text-[#55443B]">Loading verified digital provenance identity card...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Triad Core Innovations */}
      <section className="py-16 bg-[#F4EFE6] border-b border-[#E8DEC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C85A32]">The Three Pillars</span>
            <h2 className="font-serif font-black text-3xl text-[#3D271D] mt-1">
              Engineered for Real Cultural Authenticity
            </h2>
            <p className="text-sm text-[#55443B] mt-2">
              Beyond simple image posting, Artogram establishes persistent cultural sovereignty for artists and community-held artistic heritage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-[#FAF7F2] rounded-2xl border border-[#E8DEC8] shadow-sm hover:border-[#C85A32] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center mb-4">
                <FileKey2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#3D271D] mb-2">Digital Provenance Registry</h3>
              <p className="text-xs text-[#55443B] leading-relaxed">
                Every artwork registration calculates a byte-level SHA-256 fingerprint, assigns a sequential ID like <code className="text-[#C85A32]">ART-2026-000001</code>, and logs cultural background, languages, and materials into an append-only audit trail.
              </p>
            </div>

            <div className="p-6 bg-[#FAF7F2] rounded-2xl border border-[#E8DEC8] shadow-sm hover:border-[#5C6B47] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#5C6B47]/10 text-[#5C6B47] flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#3D271D] mb-2">Verifiable QR Certificates</h3>
              <p className="text-xs text-[#55443B] leading-relaxed">
                Unique QR codes resolve directly to public certificate pages. Curators, collectors, and community elders can scan an artwork on an exhibition wall or catalog to verify its creator attribution without needing a login.
              </p>
            </div>

            <div className="p-6 bg-[#FAF7F2] rounded-2xl border border-[#E8DEC8] shadow-sm hover:border-[#3D271D] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#3D271D]/10 text-[#3D271D] flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#3D271D] mb-2">Covenant & Permission Management</h3>
              <p className="text-xs text-[#55443B] leading-relaxed">
                Artists explicitly govern viewing, academic research, and commercial reproduction terms. Interested institutions can request reuse licenses, and suspect infringements can be flagged to the moderation council.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Cultural Registrations Gallery */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#5C6B47]">Live Registry</span>
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#3D271D] mt-1">
                Recently Documented Artworks
              </h2>
            </div>
            <Link
              to="/explore"
              className="text-xs font-bold text-[#C85A32] hover:underline flex items-center space-x-1"
            >
              <span>View all registered works</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentArtworks.map((art) => (
              <Link
                key={art.id}
                to={`/artworks/${art.id}`}
                className="group bg-[#FAF7F2] rounded-2xl border border-[#E8DEC8] overflow-hidden shadow-xs hover:shadow-md hover:border-[#C85A32] transition-all flex flex-col"
              >
                <div className="aspect-square relative overflow-hidden bg-[#E8DEC8]/50">
                  <img
                    src={art.effective_image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#FAF7F2]/90 backdrop-blur-xs text-[10px] font-mono font-bold text-[#C85A32] border border-[#E8DEC8]">
                    {art.provenance_id}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5C6B47] tracking-wider block mb-1">
                      {art.art_category}
                    </span>
                    <h3 className="font-serif font-bold text-base text-[#3D271D] line-clamp-1 group-hover:text-[#C85A32] transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-xs text-[#55443B] mt-0.5 truncate">{art.cultural_origin}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#E8DEC8]/80 flex items-center justify-between text-[11px] text-[#55443B]">
                    <span className="font-medium text-[#C85A32]">{art.original_creator_name}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#E8DEC8] font-bold">
                      {art.classification}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-[#3D271D] text-[#FAF7F2] relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <Feather className="w-12 h-12 text-[#C85A32] mx-auto" />
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-[#FAF7F2]">
            Ready to Safeguard Your Cultural Art?
          </h2>
          <p className="text-sm sm:text-base text-[#E8DEC8]/90 max-w-xl mx-auto leading-relaxed">
            Create an artist profile, register your artwork with cryptographic SHA-256 provenance, and generate your Artogram Identity Card in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-[#C85A32] hover:bg-[#A9431E] text-[#FAF7F2] font-bold text-sm shadow-md transition-all"
            >
              Register as an Artist
            </Link>
            <Link
              to="/explore"
              className="px-6 py-3 rounded-xl bg-[#FAF7F2]/10 hover:bg-[#FAF7F2]/20 text-[#FAF7F2] border border-[#E8DEC8]/30 font-bold text-sm transition-colors"
            >
              Browse Artworks
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
