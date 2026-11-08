import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import ArtworkIdentityCard from '../components/ArtworkIdentityCard';
import ShareModal from '../components/ShareModal';
import { Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';

const IdentityCardPage = () => {
  const { provenanceId } = useParams();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      setLoading(true);
      try {
        const res = await client.get(`/api/provenance/${provenanceId}/identity-card/`);
        setCardData(res.data);
      } catch (err) {
        setError('Could not generate Identity Card for this artwork.');
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, [provenanceId]);

  if (loading) return <LoadingSpinner label="Generating Artogram Identity Card..." />;

  if (error || !cardData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif font-bold text-2xl text-[#3D271D]">Card Generation Failed</h2>
        <p className="text-xs text-[#55443B] mt-2 mb-4">{error}</p>
        <Link to="/explore" className="px-4 py-2 bg-[#C85A32] text-[#FAF7F2] rounded-xl text-xs font-bold">
          Return to Registry
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#E8DEC8]">
          <Link
            to={`/artworks/${cardData.artwork_id}`}
            className="text-xs font-bold text-[#55443B] hover:text-[#C85A32] flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Artwork</span>
          </Link>

          <span className="text-xs font-mono font-bold text-[#C85A32]">
            {cardData.provenance_id}
          </span>
        </div>

        <div className="text-center space-y-1 mb-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#E8DEC8] text-[#5C6B47] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Digital Cultural Identity</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#3D271D]">
            Artogram Identity Card
          </h1>
          <p className="text-xs text-[#55443B]">
            Download, print, or share with institutions & cultural researchers
          </p>
        </div>

        {/* Identity Card Component */}
        <ArtworkIdentityCard
          cardData={cardData}
          onShareInternal={() => setShareOpen(true)}
          showControls={true}
        />

        {/* Share Modal */}
        <ShareModal
          artwork={{
            id: cardData.artwork_id,
            title: cardData.artwork_title,
            effective_image: cardData.artwork_image,
            original_creator_name: cardData.creator_display_name,
            cultural_origin: cardData.cultural_origin,
          }}
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      </div>
    </div>
  );
};

export default IdentityCardPage;
