import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Filter, ShieldCheck, Compass, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Indigenous Folk Art',
  'Textile & Weaving',
  'Traditional Pottery & Ceramics',
  'Calligraphy & Manuscript Art',
  'Sculpture & Woodcarving',
  'Tribal & Ritual Painting',
  'Metal Craft & Filigree',
  'Contemporary Cultural Art',
  'Mural & Architecture',
  'Jewelry & Adornment',
];

const ExplorePage = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedClassification, setSelectedClassification] = useState('');

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      let url = `/api/artworks/?q=${encodeURIComponent(searchQuery)}`;
      if (selectedCategory && selectedCategory !== 'All') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (selectedClassification) {
        url += `&classification=${encodeURIComponent(selectedClassification)}`;
      }
      const res = await client.get(url);
      setArtworks(res.data);
    } catch (err) {
      console.error('Failed to load artworks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchArtworks();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedCategory, selectedClassification]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5C6B47]">
            Cultural Art Discovery
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#3D271D]">
            Explore Registered Heritage
          </h1>
          <p className="text-xs sm:text-sm text-[#55443B]">
            Search by artwork title, cultural lineage, geographic region, master artisan, or provenance ID.
          </p>
        </div>

        {/* Search Bar & Classification Filter */}
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 text-[#55443B] absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search motifs, Warli, Yoruba, Celtic, calligraphy, ART-2026..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#FAF7F2] border-2 border-[#E8DEC8] rounded-2xl text-sm text-[#3D271D] placeholder-[#55443B]/60 focus:outline-none focus:border-[#C85A32] shadow-sm"
            />
          </div>

          {/* Classification Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              onClick={() => setSelectedClassification('')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                selectedClassification === ''
                  ? 'bg-[#3D271D] text-[#FAF7F2]'
                  : 'bg-[#E8DEC8] text-[#55443B] hover:bg-[#FAF7F2]'
              }`}
            >
              All Classifications
            </button>
            <button
              onClick={() => setSelectedClassification('traditional')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                selectedClassification === 'traditional'
                  ? 'bg-[#5C6B47] text-[#FAF7F2]'
                  : 'bg-[#E8DEC8] text-[#55443B] hover:bg-[#FAF7F2]'
              }`}
            >
              Traditional
            </button>
            <button
              onClick={() => setSelectedClassification('contemporary')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                selectedClassification === 'contemporary'
                  ? 'bg-[#C85A32] text-[#FAF7F2]'
                  : 'bg-[#E8DEC8] text-[#55443B] hover:bg-[#FAF7F2]'
              }`}
            >
              Contemporary
            </button>
            <button
              onClick={() => setSelectedClassification('hybrid')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                selectedClassification === 'hybrid'
                  ? 'bg-[#55443B] text-[#FAF7F2]'
                  : 'bg-[#E8DEC8] text-[#55443B] hover:bg-[#FAF7F2]'
              }`}
            >
              Hybrid / Fusion
            </button>
          </div>
        </div>

        {/* Category Horizontal Scroll */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#C85A32] text-[#FAF7F2] shadow-sm'
                  : 'bg-[#F4EFE6] text-[#55443B] border border-[#E8DEC8] hover:bg-[#E8DEC8]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Content */}
        {loading ? (
          <LoadingSpinner label="Searching Artogram cultural registry..." />
        ) : artworks.length === 0 ? (
          <div className="text-center py-16 bg-[#F4EFE6] rounded-2xl border-2 border-dashed border-[#E8DEC8] space-y-3">
            <Compass className="w-12 h-12 text-[#5C6B47] mx-auto" />
            <h3 className="font-serif font-bold text-xl text-[#3D271D]">No Artworks Match Your Search</h3>
            <p className="text-xs text-[#55443B] max-w-sm mx-auto">
              Try adjusting your search keywords, clearing classification filters, or browsing other categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedClassification('');
              }}
              className="px-4 py-2 bg-[#C85A32] text-[#FAF7F2] text-xs font-bold rounded-xl mt-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {artworks.map((art) => (
              <div
                key={art.id}
                className="group bg-[#FAF7F2] rounded-2xl border-2 border-[#E8DEC8] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#C85A32] transition-all flex flex-col justify-between"
              >
                <div>
                  <Link to={`/artworks/${art.id}`} className="block relative aspect-square overflow-hidden bg-[#E8DEC8]/50">
                    <img
                      src={art.effective_image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#FAF7F2]/95 backdrop-blur-xs text-[10px] font-mono font-bold text-[#C85A32] border border-[#E8DEC8]">
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
                </div>

                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-[#E8DEC8] flex items-center justify-between text-xs">
                    <Link
                      to={`/profile/${art.submitter_username}`}
                      className="font-bold text-[#C85A32] hover:underline truncate max-w-[140px]"
                    >
                      {art.original_creator_name || `@${art.submitter_username}`}
                    </Link>

                    <Link
                      to={`/artworks/${art.provenance_id}/identity-card/`}
                      className="px-2.5 py-1 bg-[#E8DEC8] hover:bg-[#3D271D] hover:text-[#FAF7F2] text-[#3D271D] text-[10px] font-bold rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#C85A32]" />
                      <span>Card</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
