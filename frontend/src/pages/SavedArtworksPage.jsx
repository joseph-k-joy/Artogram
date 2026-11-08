import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { Bookmark, Sparkles, Trash2, Compass } from 'lucide-react';

const SavedArtworksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/social/bookmarks/');
      setBookmarks(res.data);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (artworkId) => {
    try {
      await client.post('/api/social/bookmarks/', { artwork_id: artworkId });
      setBookmarks((prev) => prev.filter((b) => b.artwork.id !== artworkId));
    } catch (err) {
      console.error('Remove error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DEC8]">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#C85A32] text-[#FAF7F2] flex items-center justify-center">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#3D271D]">Saved Cultural Artworks</h1>
              <p className="text-xs text-[#55443B]">Your personal collection of bookmarked cultural treasures</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#5C6B47] bg-[#E8DEC8] px-3 py-1 rounded-full">
            {bookmarks.length} Bookmarked
          </span>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading saved artworks..." />
        ) : bookmarks.length === 0 ? (
          <div className="p-16 text-center bg-[#F4EFE6] rounded-3xl border-2 border-dashed border-[#E8DEC8] space-y-3">
            <Bookmark className="w-12 h-12 text-[#55443B] mx-auto opacity-50" />
            <h3 className="font-serif font-bold text-xl text-[#3D271D]">No Saved Artworks Yet</h3>
            <p className="text-xs text-[#55443B] max-w-sm mx-auto">
              Bookmark artworks while browsing the feed or registry to keep track of cultural pieces and identity cards.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-[#C85A32] text-[#FAF7F2] text-xs font-bold rounded-xl mt-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Cultural Artworks</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((b) => (
              <div
                key={b.id}
                className="bg-[#FAF7F2] rounded-2xl border-2 border-[#E8DEC8] overflow-hidden shadow-xs hover:border-[#C85A32] transition-colors flex flex-col justify-between"
              >
                <div>
                  <Link to={`/artworks/${b.artwork.id}`} className="block relative aspect-square overflow-hidden bg-[#E8DEC8]/50">
                    <img
                      src={b.artwork.effective_image}
                      alt={b.artwork.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#FAF7F2]/90 text-[10px] font-mono font-bold text-[#C85A32] border border-[#E8DEC8]">
                      {b.artwork.provenance_id}
                    </div>
                  </Link>

                  <div className="p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#5C6B47]">
                      {b.artwork.art_category}
                    </span>
                    <Link
                      to={`/artworks/${b.artwork.id}`}
                      className="font-serif font-bold text-base text-[#3D271D] hover:text-[#C85A32] line-clamp-1 block"
                    >
                      {b.artwork.title}
                    </Link>
                    <p className="text-xs text-[#55443B] line-clamp-1">{b.artwork.cultural_origin}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-[#E8DEC8] flex items-center justify-between text-xs mt-2">
                  <Link
                    to={`/artworks/${b.artwork.provenance_id}/identity-card/`}
                    className="text-xs font-bold text-[#C85A32] hover:underline flex items-center space-x-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Identity Card</span>
                  </Link>

                  <button
                    onClick={() => handleRemoveBookmark(b.artwork.id)}
                    className="p-1.5 text-[#55443B] hover:text-red-600 rounded-lg transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedArtworksPage;
