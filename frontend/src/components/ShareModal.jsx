import React, { useState } from 'react';
import client from '../api/client';
import { Share2, X, Search, Check, Copy, User } from 'lucide-react';

const ShareModal = ({ artwork, isOpen, onClose }) => {
  const [recipientUsername, setRecipientUsername] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !artwork) return null;

  const artworkUrl = `${window.location.origin}/artworks/${artwork.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(artworkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendShare = async (e) => {
    e.preventDefault();
    if (!recipientUsername.trim()) {
      setErrorMsg('Please enter a recipient username.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await client.post('/api/social/shares/', {
        artwork_id: artwork.id,
        recipient_username: recipientUsername.trim(),
        note: note.trim(),
      });
      setSuccessMsg(`Shared '${artwork.title}' with @${recipientUsername} successfully!`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1800);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.response?.data?.detail || 'Failed to share. Please ensure the username exists.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#FAF7F2] rounded-2xl border-2 border-[#E8DEC8] shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#55443B] hover:bg-[#E8DEC8] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#C85A32] text-[#FAF7F2] flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#3D271D]">Share Artwork</h3>
            <p className="text-xs text-[#55443B]">Preserve cultural attribution and identity</p>
          </div>
        </div>

        {/* Artwork Snapshot */}
        <div className="flex items-center space-x-3 p-3 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8] mb-5">
          <img
            src={artwork.effective_image || artwork.image_url}
            alt={artwork.title}
            className="w-12 h-12 rounded-lg object-cover bg-[#E8DEC8]"
          />
          <div className="truncate">
            <h4 className="font-serif font-bold text-sm text-[#3D271D] truncate">{artwork.title}</h4>
            <p className="text-xs text-[#C85A32] font-semibold">{artwork.original_creator_name}</p>
            <p className="text-[10px] text-[#55443B]">{artwork.cultural_origin}</p>
          </div>
        </div>

        {/* Copy Public Link */}
        <div className="mb-5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#55443B] block mb-1.5">
            Shareable Link
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              readOnly
              value={artworkUrl}
              className="flex-1 px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] font-mono focus:outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 bg-[#5C6B47] text-[#FAF7F2] rounded-xl text-xs font-semibold hover:bg-[#475336] transition-colors flex items-center space-x-1"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Internal Sharing Form */}
        <form onSubmit={handleSendShare} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#55443B] block mb-1.5">
              Send Directly to Artogram User
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#55443B] text-xs font-bold">@</span>
              <input
                type="text"
                placeholder="username"
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                className="w-full pl-7 pr-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-sm text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#55443B] block mb-1.5">
              Personal Note (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Inspiring traditional motifs we discussed..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
            ></textarea>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">{errorMsg}</p>
          )}

          {successMsg && (
            <p className="text-xs text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-200">{successMsg}</p>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#55443B] hover:bg-[#E8DEC8] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#C85A32] hover:bg-[#A9431E] text-[#FAF7F2] text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Artwork'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareModal;
