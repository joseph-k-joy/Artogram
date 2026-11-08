import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

const CommunitiesPage = () => {
  const [communities, setCommunities] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [commRes, verifRes] = await Promise.all([
          client.get('/api/communities/'),
          client.get('/api/communities/verifications/'),
        ]);
        setCommunities(commRes.data);
        setVerifications(verifRes.data);
      } catch (err) {
        console.error('Communities error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5C6B47]">
            Cultural Councils & Guilds
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#3D271D]">
            Community Verification Guilds
          </h1>
          <p className="text-xs sm:text-sm text-[#55443B]">
            Indigenous representative bodies, artisan trusts, and master guilds reviewing traditional cultural claims.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading cultural communities registry..." />
        ) : (
          <>
            {/* Guilds Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communities.map((c) => (
                <div
                  key={c.id}
                  className="p-6 bg-[#FAF7F2] rounded-3xl border-2 border-[#E8DEC8] shadow-sm space-y-4 hover:border-[#5C6B47] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#5C6B47] text-[#FAF7F2] flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#3D271D]">{c.name}</h3>
                      <p className="text-xs text-[#C85A32] font-semibold">{c.cultural_tradition}</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#55443B] leading-relaxed">{c.description}</p>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-[#E8DEC8]">
                    <span className="text-[#55443B]">Region: <strong className="text-[#3D271D]">{c.geographic_region}</strong></span>
                    <span className="px-2.5 py-1 bg-[#E8DEC8] rounded-lg font-bold text-[#5C6B47] text-[10px]">
                      {c.artworks_verified_count} Works Verified
                    </span>
                  </div>

                  {c.reviewers && c.reviewers.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] uppercase font-bold text-[#55443B] block mb-1">
                        Designated Lineage Reviewers:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {c.reviewers.map((rev) => (
                          <span
                            key={rev.id}
                            className="px-2 py-0.5 rounded-md bg-[#F4EFE6] border border-[#E8DEC8] text-[10px] text-[#3D271D]"
                          >
                            @{rev.username} &bull; {rev.title_or_role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Verifications Log */}
            <div className="p-6 bg-[#FAF7F2] rounded-3xl border-2 border-[#E8DEC8] shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-xl text-[#3D271D] flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#C85A32]" />
                <span>Community Review Pipeline</span>
              </h3>

              <div className="space-y-3">
                {verifications.length === 0 ? (
                  <p className="text-xs text-[#55443B] italic">No community verification requests recorded.</p>
                ) : (
                  verifications.map((v) => (
                    <div
                      key={v.id}
                      className="p-4 bg-[#F4EFE6] rounded-2xl border border-[#E8DEC8] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={v.artwork_image}
                          alt={v.artwork_title}
                          className="w-12 h-12 rounded-xl object-cover bg-[#E8DEC8]"
                        />
                        <div>
                          <Link
                            to={`/artworks/${v.artwork}`}
                            className="font-serif font-bold text-sm text-[#3D271D] hover:text-[#C85A32]"
                          >
                            {v.artwork_title}
                          </Link>
                          <p className="text-[#55443B]">
                            Community: <strong className="text-[#5C6B47]">{v.community_name}</strong>
                          </p>
                          {v.comments && <p className="text-[11px] text-[#55443B] italic mt-0.5">"{v.comments}"</p>}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          v.status === 'approved'
                            ? 'bg-[#5C6B47] text-[#FAF7F2]'
                            : 'bg-[#E8DEC8] text-[#3D271D]'
                        }`}>
                          {v.status.toUpperCase()}
                        </span>
                        <Link
                          to={`/artworks/${v.provenance_id}/provenance/`}
                          className="px-2.5 py-1 bg-[#FAF7F2] border border-[#E8DEC8] rounded-lg text-[10px] font-bold text-[#C85A32]"
                        >
                          Certificate
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CommunitiesPage;
