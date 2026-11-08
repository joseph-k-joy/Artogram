import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ShareModal from '../components/ShareModal';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ShieldCheck,
  PlusCircle,
  Send,
  ExternalLink,
  Sparkles,
  Compass,
} from 'lucide-react';

const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' or 'following'
  const [loading, setLoading] = useState(true);

  // Active comments expansion
  const [expandedPostComments, setExpandedPostComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [postCommentsData, setPostCommentsData] = useState({});

  // Share modal state
  const [shareModalArtwork, setShareModalArtwork] = useState(null);

  const fetchFeed = async (currentFilter = filter) => {
    setLoading(true);
    try {
      const res = await client.get(`/api/social/feed/?filter=${currentFilter}`);
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(filter);
  }, [filter]);

  // Handle Like Toggle
  const handleLike = async (postId) => {
    if (!user) return;
    try {
      const res = await client.post(`/api/social/posts/${postId}/like/`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, is_liked: res.data.is_liked, like_count: res.data.like_count }
            : p
        )
      );
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  // Handle Bookmark Toggle
  const handleBookmark = async (artworkId) => {
    if (!user) return;
    try {
      const res = await client.post('/api/social/bookmarks/', { artwork_id: artworkId });
      setPosts((prev) =>
        prev.map((p) =>
          p.artwork_id === artworkId ? { ...p, is_bookmarked: res.data.is_bookmarked } : p
        )
      );
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  // Toggle comments
  const toggleComments = async (postId) => {
    const isExpanded = !!expandedPostComments[postId];
    setExpandedPostComments((prev) => ({ ...prev, [postId]: !isExpanded }));

    if (!isExpanded && !postCommentsData[postId]) {
      try {
        const res = await client.get(`/api/social/posts/${postId}/comments/`);
        setPostCommentsData((prev) => ({ ...prev, [postId]: res.data }));
      } catch (err) {
        console.error('Fetch comments error:', err);
      }
    }
  };

  // Submit comment
  const handleAddComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      const res = await client.post(`/api/social/posts/${postId}/comments/`, { text });
      setPostCommentsData((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.data],
      }));
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p))
      );
    } catch (err) {
      console.error('Add comment error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Feed Header & Filters */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#E8DEC8]">
          <div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#3D271D]">Cultural Feed</h1>
            <p className="text-xs text-[#55443B] uppercase tracking-wider font-semibold">
              Live Cultural Art & Provenance Stream
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#F4EFE6] p-1 rounded-xl border border-[#E8DEC8]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-[#C85A32] text-[#FAF7F2] shadow-xs'
                  : 'text-[#55443B] hover:text-[#3D271D]'
              }`}
            >
              All Artworks
            </button>
            <button
              onClick={() => setFilter('following')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'following'
                  ? 'bg-[#C85A32] text-[#FAF7F2] shadow-xs'
                  : 'text-[#55443B] hover:text-[#3D271D]'
              }`}
            >
              Following
            </button>
          </div>
        </div>

        {/* Create Post Prompt for Artists */}
        {user && (
          <div className="mb-6 p-4 bg-[#F4EFE6] rounded-2xl border-2 border-[#E8DEC8] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={user.profile?.effective_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                alt=""
                className="w-10 h-10 rounded-full object-cover bg-[#E8DEC8]"
              />
              <div>
                <p className="text-xs font-bold text-[#3D271D]">Share your cultural creation</p>
                <p className="text-[11px] text-[#55443B]">Register provenance and share with the network</p>
              </div>
            </div>
            <Link
              to="/register-artwork"
              className="px-4 py-2 bg-[#C85A32] hover:bg-[#A9431E] text-[#FAF7F2] text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Art</span>
            </Link>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSpinner label="Curating cultural art feed..." />}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-16 px-4 bg-[#F4EFE6] rounded-2xl border-2 border-dashed border-[#E8DEC8] space-y-4">
            <Compass className="w-12 h-12 text-[#5C6B47] mx-auto" />
            <h3 className="font-serif font-bold text-xl text-[#3D271D]">No Posts Found</h3>
            <p className="text-xs text-[#55443B] max-w-sm mx-auto">
              {filter === 'following'
                ? 'Artists you follow have not posted yet. Switch to "All Artworks" or explore the directory.'
                : 'No cultural artwork posts are currently visible. Register the first artwork!'}
            </p>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setFilter('all')}
                className="px-4 py-2 bg-[#5C6B47] text-[#FAF7F2] text-xs font-bold rounded-xl"
              >
                View All Public Works
              </button>
              <Link
                to="/explore"
                className="px-4 py-2 bg-[#FAF7F2] border border-[#E8DEC8] text-xs font-bold rounded-xl"
              >
                Explore Artists
              </Link>
            </div>
          </div>
        )}

        {/* Posts Stream */}
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-[#FAF7F2] rounded-2xl border-2 border-[#E8DEC8] shadow-md overflow-hidden transition-all hover:border-[#C85A32]/60"
            >
              {/* Card Author Header */}
              <div className="p-4 flex items-center justify-between border-b border-[#E8DEC8]">
                <Link
                  to={`/profile/${post.author_username}`}
                  className="flex items-center space-x-3 group"
                >
                  <img
                    src={post.author_avatar}
                    alt={post.author_username}
                    className="w-10 h-10 rounded-full object-cover border border-[#E8DEC8] bg-[#E8DEC8] group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-serif font-bold text-sm text-[#3D271D] group-hover:text-[#C85A32] transition-colors">
                        {post.author_display_name || post.author_username}
                      </h4>
                      {post.author_role === 'artist' && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#E8DEC8] text-[#5C6B47]">
                          Artist
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#55443B]">@{post.author_username}</p>
                  </div>
                </Link>

                <div className="text-right">
                  <span className="text-[10px] text-[#55443B] block">
                    {new Date(post.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <Link
                    to={`/artworks/${post.provenance_id}/provenance/`}
                    className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold text-[#C85A32] hover:underline"
                  >
                    <span>{post.provenance_id}</span>
                  </Link>
                </div>
              </div>

              {/* Artwork Media Display */}
              <div className="relative group bg-[#211C19]/5">
                <Link to={`/artworks/${post.artwork_id}`}>
                  <img
                    src={post.artwork_image}
                    alt={post.artwork_title}
                    className="w-full max-h-[550px] object-cover mx-auto"
                  />
                </Link>

                {/* Provenance Badge Overlay */}
                <div className="absolute bottom-3 left-3 bg-[#FAF7F2]/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#E8DEC8] shadow-sm flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#5C6B47]" />
                  <span className="text-[10px] font-bold text-[#3D271D]">
                    {post.verification_badge || 'Registered Provenance'}
                  </span>
                </div>

                {/* Identity Card Shortcut Pill */}
                <Link
                  to={`/artworks/${post.provenance_id}/identity-card/`}
                  className="absolute bottom-3 right-3 bg-[#3D271D]/90 hover:bg-[#3D271D] text-[#FAF7F2] px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-md flex items-center space-x-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Identity Card</span>
                </Link>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-4 space-y-3">
                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-4">
                    {/* Like Button */}
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center space-x-1.5 text-xs font-bold text-[#55443B] hover:text-[#C85A32] transition-colors focus:outline-none"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          post.is_liked ? 'fill-[#C85A32] text-[#C85A32]' : 'text-[#55443B]'
                        }`}
                      />
                      <span>{post.like_count}</span>
                    </button>

                    {/* Comment Button */}
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center space-x-1.5 text-xs font-bold text-[#55443B] hover:text-[#3D271D] transition-colors focus:outline-none"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.comment_count}</span>
                    </button>

                    {/* Share Modal Trigger */}
                    <button
                      onClick={() =>
                        setShareModalArtwork({
                          id: post.artwork_id,
                          title: post.artwork_title,
                          effective_image: post.artwork_image,
                          original_creator_name: post.author_display_name,
                          cultural_origin: post.cultural_origin,
                        })
                      }
                      className="text-[#55443B] hover:text-[#C85A32] transition-colors focus:outline-none"
                      title="Share Artwork Internally"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Bookmark */}
                    <button
                      onClick={() => handleBookmark(post.artwork_id)}
                      className="p-1 text-[#55443B] hover:text-[#C85A32] transition-colors focus:outline-none"
                      title="Save to Bookmarks"
                    >
                      <Bookmark
                        className={`w-5 h-5 ${
                          post.is_bookmarked ? 'fill-[#C85A32] text-[#C85A32]' : ''
                        }`}
                      />
                    </button>

                    {/* Full Provenance Link */}
                    <Link
                      to={`/artworks/${post.provenance_id}/provenance/`}
                      className="px-2.5 py-1 bg-[#E8DEC8] hover:bg-[#C85A32] hover:text-[#FAF7F2] text-[#3D271D] text-[10px] font-bold rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <span>Provenance</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>

                {/* Title & Caption */}
                <div className="space-y-1">
                  <div className="flex items-baseline space-x-2">
                    <Link
                      to={`/artworks/${post.artwork_id}`}
                      className="font-serif font-bold text-base text-[#3D271D] hover:text-[#C85A32] transition-colors"
                    >
                      {post.artwork_title}
                    </Link>
                    <span className="text-[10px] uppercase font-bold text-[#5C6B47]">
                      &bull; {post.art_category}
                    </span>
                  </div>

                  {post.caption && (
                    <p className="text-xs text-[#55443B] leading-relaxed">
                      <span className="font-bold text-[#3D271D] mr-1.5">{post.author_username}</span>
                      {post.caption}
                    </p>
                  )}

                  <p className="text-[11px] text-[#55443B]/80 italic">
                    Origin: {post.cultural_origin}
                  </p>
                </div>

                {/* Expandable Comments Drawer */}
                {expandedPostComments[post.id] && (
                  <div className="mt-3 pt-3 border-t border-[#E8DEC8] space-y-3">
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {postCommentsData[post.id]?.length === 0 ? (
                        <p className="text-xs text-[#55443B] italic">
                          No comments yet. Be the first to share cultural appreciation!
                        </p>
                      ) : (
                        postCommentsData[post.id]?.map((c) => (
                          <div
                            key={c.id}
                            className="text-xs p-2 rounded-xl bg-[#F4EFE6] border border-[#E8DEC8]"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-[#3D271D]">
                                {c.display_name || c.username}
                              </span>
                              <span className="text-[9px] text-[#55443B]">
                                {new Date(c.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-[#55443B]">{c.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment Input */}
                    {user ? (
                      <div className="flex space-x-2 pt-1">
                        <input
                          type="text"
                          placeholder="Add a respectful comment..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          className="flex-1 px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="px-3 py-1.5 bg-[#C85A32] hover:bg-[#A9431E] text-[#FAF7F2] rounded-xl text-xs font-bold transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-[#55443B]">
                        <Link to="/login" className="text-[#C85A32] font-bold underline">
                          Sign in
                        </Link>{' '}
                        to join the conversation.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Internal Share Modal */}
      <ShareModal
        artwork={shareModalArtwork}
        isOpen={!!shareModalArtwork}
        onClose={() => setShareModalArtwork(null)}
      />
    </div>
  );
};

export default FeedPage;
