import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  MapPin,
  Palette,
  Globe,
  Calendar,
  Users,
  UserCheck,
  UserPlus,
  Edit3,
  ShieldCheck,
  Sparkles,
  Grid,
} from 'lucide-react';

const ArtistProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followingActionLoading, setFollowingActionLoading] = useState(false);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [profRes, artRes] = await Promise.all([
        client.get(`/api/profiles/${username}/`),
        client.get(`/api/artworks/?submitter=${username}`),
      ]);
      setProfile(profRes.data);
      setArtworks(artRes.data);
    } catch (err) {
      setError('Profile not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const handleFollowToggle = async () => {
    if (!currentUser || !profile) return;
    setFollowingActionLoading(true);
    try {
      const res = await client.post(`/api/profiles/${username}/follow/`);
      setProfile((prev) => ({
        ...prev,
        is_following: res.data.is_following,
        followers_count: res.data.followers_count,
      }));
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setFollowingActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading artist profile..." />;

  if (error || !profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif font-bold text-2xl text-[#3D271D]">Profile Not Found</h2>
        <p className="text-xs text-[#55443B] mt-2 mb-4">{error}</p>
        <Link to="/explore" className="px-4 py-2 bg-[#C85A32] text-[#FAF7F2] rounded-xl text-xs font-bold">
          Explore Artworks
        </Link>
      </div>
    );
  }

  const isOwner = currentUser?.username?.toLowerCase() === profile.username?.toLowerCase();

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Header Card */}
        <div className="p-6 sm:p-8 bg-[#FAF7F2] rounded-3xl border-2 border-[#E8DEC8] shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
                alt={profile.display_name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[#E8DEC8] shadow-md bg-[#E8DEC8]"
              />
              {profile.is_verified_artist && (
                <div className="absolute bottom-1 right-1 p-1 bg-[#5C6B47] text-[#FAF7F2] rounded-full shadow-sm" title="Verified Artist Lineage">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Profile Bio & Stats */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#3D271D]">
                      {profile.display_name || profile.username}
                    </h1>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#E8DEC8] text-[#5C6B47]">
                      {profile.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#55443B] font-semibold">@{profile.username}</p>
                </div>

                {/* Follow / Edit Button */}
                <div>
                  {isOwner ? (
                    <Link
                      to="/edit-profile"
                      className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#F4EFE6] border border-[#E8DEC8] text-xs font-bold text-[#3D271D] rounded-xl shadow-xs transition-colors inline-flex items-center space-x-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>Edit Profile</span>
                    </Link>
                  ) : currentUser ? (
                    <button
                      onClick={handleFollowToggle}
                      disabled={followingActionLoading}
                      className={`px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 ${
                        profile.is_following
                          ? 'bg-[#E8DEC8] text-[#3D271D] hover:bg-red-50 hover:text-red-700'
                          : 'bg-[#C85A32] hover:bg-[#A9431E] text-[#FAF7F2]'
                      }`}
                    >
                      {profile.is_following ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Follow Artist</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="px-4 py-2 bg-[#C85A32] text-[#FAF7F2] rounded-xl text-xs font-bold shadow-sm"
                    >
                      Sign In to Follow
                    </Link>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-xs text-[#55443B] leading-relaxed max-w-2xl">
                  {profile.bio}
                </p>
              )}

              {/* Badges / Location / Art Form */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#55443B] pt-1">
                {profile.primary_art_form && (
                  <div className="flex items-center space-x-1">
                    <Palette className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>{profile.primary_art_form}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-[#5C6B47]" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website_link && (
                  <a
                    href={profile.website_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-[#C85A32] hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Portfolio</span>
                  </a>
                )}
              </div>

              {/* Stats Counters */}
              <div className="flex items-center justify-center sm:justify-start space-x-6 pt-3 border-t border-[#E8DEC8]/80 text-xs">
                <div>
                  <strong className="text-sm font-bold text-[#3D271D]">{artworks.length}</strong>
                  <span className="text-[#55443B] ml-1">Artworks</span>
                </div>
                <div>
                  <strong className="text-sm font-bold text-[#3D271D]">{profile.followers_count || 0}</strong>
                  <span className="text-[#55443B] ml-1">Followers</span>
                </div>
                <div>
                  <strong className="text-sm font-bold text-[#3D271D]">{profile.following_count || 0}</strong>
                  <span className="text-[#55443B] ml-1">Following</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-3">
            <h3 className="font-serif font-bold text-lg text-[#3D271D] flex items-center space-x-2">
              <Grid className="w-5 h-5 text-[#C85A32]" />
              <span>Registered Artworks ({artworks.length})</span>
            </h3>
            {isOwner && (
              <Link
                to="/register-artwork"
                className="text-xs font-bold text-[#C85A32] hover:underline"
              >
                + Register New Artwork
              </Link>
            )}
          </div>

          {artworks.length === 0 ? (
            <div className="p-12 text-center bg-[#F4EFE6] rounded-2xl border-2 border-dashed border-[#E8DEC8] space-y-2">
              <Palette className="w-8 h-8 text-[#55443B] mx-auto" />
              <p className="font-serif font-bold text-sm text-[#3D271D]">No Artworks Registered</p>
              <p className="text-xs text-[#55443B]">This creator has not registered digital provenance yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {artworks.map((art) => (
                <div
                  key={art.id}
                  className="group bg-[#FAF7F2] rounded-2xl border border-[#E8DEC8] overflow-hidden shadow-xs hover:shadow-md hover:border-[#C85A32] transition-all flex flex-col justify-between"
                >
                  <Link to={`/artworks/${art.id}`} className="block relative aspect-square overflow-hidden bg-[#E8DEC8]/50">
                    <img
                      src={art.effective_image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#FAF7F2]/90 backdrop-blur-xs text-[10px] font-mono font-bold text-[#C85A32] border border-[#E8DEC8]">
                      {art.provenance_id}
                    </div>
                  </Link>

                  <div className="p-4 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#5C6B47] tracking-wider block">
                      {art.art_category}
                    </span>
                    <Link
                      to={`/artworks/${art.id}`}
                      className="font-serif font-bold text-base text-[#3D271D] hover:text-[#C85A32] transition-colors line-clamp-1 block"
                    >
                      {art.title}
                    </Link>
                    <p className="text-xs text-[#55443B] line-clamp-1">{art.cultural_origin}</p>
                  </div>

                  <div className="p-4 pt-0 border-t border-[#E8DEC8] flex items-center justify-between text-xs mt-2">
                    <Link
                      to={`/artworks/${art.id}`}
                      className="text-xs font-semibold text-[#55443B] hover:text-[#C85A32]"
                    >
                      Details &rarr;
                    </Link>
                    <Link
                      to={`/artworks/${art.provenance_id}/identity-card/`}
                      className="px-2.5 py-1 bg-[#E8DEC8] text-[#3D271D] text-[10px] font-bold rounded-lg hover:bg-[#C85A32] hover:text-[#FAF7F2] transition-colors"
                    >
                      Identity Card
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistProfilePage;
