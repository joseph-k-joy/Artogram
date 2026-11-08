import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, Heart, Sparkles } from 'lucide-react';

const Footer = () => {
  const [provenanceQuery, setProvenanceQuery] = useState('');
  const navigate = useNavigate();

  const handleLookup = (e) => {
    e.preventDefault();
    if (provenanceQuery.trim()) {
      navigate(`/artworks/${provenanceQuery.trim().toUpperCase()}/provenance/`);
    }
  };

  return (
    <footer className="bg-[#3D271D] text-[#FAF7F2] border-t-4 border-[#C85A32] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#C85A32] flex items-center justify-center text-[#FAF7F2] font-bold text-lg">
                A
              </div>
              <span className="font-serif font-black text-2xl tracking-wider">ARTOGRAM</span>
            </div>
            <p className="text-xs uppercase tracking-widest text-[#E8DEC8] font-semibold">Where Art Meets Identity</p>
            <p className="text-sm text-[#E8DEC8]/80 leading-relaxed max-w-md">
              A cultural social media network bridging traditional artisan lineages and contemporary creators through persistent digital provenance, cryptographic file hashing, and verifiable Identity Cards.
            </p>
            <div className="p-3.5 bg-[#211C19]/60 rounded-xl border border-[#E8DEC8]/20 text-xs text-[#E8DEC8]/90">
              <span className="font-bold text-[#C85A32] block mb-1">CULTURAL INTEGRITY NOTICE:</span>
              Artogram records artwork provenance and community attribution claims. Cryptographic SHA-256 fingerprints certify digital byte integrity but do not independently grant copyright or establish legal ownership.
            </div>
          </div>

          {/* Quick Provenance Lookup */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-[#E8DEC8] mb-3 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
              <span>Verify Provenance</span>
            </h4>
            <p className="text-xs text-[#E8DEC8]/70 mb-3">
              Scan or enter a unique ID (e.g., <code className="text-[#C85A32]">ART-2026-000001</code>) to inspect its provenance certificate.
            </p>
            <form onSubmit={handleLookup} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ART-2026-XXXXXX"
                  value={provenanceQuery}
                  onChange={(e) => setProvenanceQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-[#211C19] border border-[#E8DEC8]/30 rounded-lg text-xs text-[#FAF7F2] placeholder-[#FAF7F2]/40 focus:outline-none focus:border-[#C85A32]"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-[#C85A32] hover:bg-[#A9431E] rounded-md text-xs font-semibold transition-colors flex items-center"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
            <div className="mt-4">
              <Link to="/verify-hash" className="text-xs text-[#E8DEC8] hover:text-[#C85A32] underline flex items-center space-x-1">
                <span>Upload artwork to verify file hash &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-[#E8DEC8] mb-3">Explore Artogram</h4>
            <ul className="space-y-2 text-xs text-[#E8DEC8]/80">
              <li>
                <Link to="/explore" className="hover:text-[#FAF7F2] transition-colors">Cultural Art Registry</Link>
              </li>
              <li>
                <Link to="/register-artwork" className="hover:text-[#FAF7F2] transition-colors">Register New Artwork</Link>
              </li>
              <li>
                <Link to="/communities" className="hover:text-[#FAF7F2] transition-colors">Artisan Guilds & Communities</Link>
              </li>
              <li>
                <Link to="/permission-requests" className="hover:text-[#FAF7F2] transition-colors">Permission Request Hub</Link>
              </li>
              <li>
                <Link to="/my-reports" className="hover:text-[#FAF7F2] transition-colors">Community Misuse Reporting</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E8DEC8]/20 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E8DEC8]/60">
          <p>&copy; {new Date().getFullYear()} Artogram Cultural Platform. Dedicated to indigenous and global creators.</p>
          <div className="flex items-center space-x-4 mt-3 sm:mt-0">
            <span>Built with React &bull; Django &bull; PWA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
