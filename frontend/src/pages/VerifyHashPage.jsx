import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import {
  FileCheck2,
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldAlert,
  Info,
} from 'lucide-react';

const VerifyHashPage = () => {
  const [hashInput, setHashInput] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setHashInput('');
      setResult(null);
      setError('');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!file && !hashInput.trim()) {
      setError('Please select an image file or enter a 64-character SHA-256 hash string.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        res = await client.post('/api/provenance/verify-hash/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await client.post('/api/provenance/verify-hash/', { hash: hashInput.trim() });
      }
      setResult(res.data);
    } catch (err) {
      setError('Verification service unavailable. Please check backend status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#E8DEC8] text-[#5C6B47] text-xs font-bold uppercase tracking-wider">
            <FileCheck2 className="w-4 h-4 text-[#C85A32]" />
            <span>Cryptographic Fingerprint Integrity</span>
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#3D271D]">
            Verify Artwork SHA-256
          </h1>
          <p className="text-xs sm:text-sm text-[#55443B]">
            Upload an image file to calculate its raw byte SHA-256 cryptographic hash and check whether it exists in the Artogram Provenance Registry.
          </p>
        </div>

        {/* Verification Card */}
        <div className="p-8 bg-[#FAF7F2] rounded-3xl border-2 border-[#E8DEC8] shadow-lg space-y-6">
          <form onSubmit={handleVerify} className="space-y-6">
            {/* File Upload Zone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#55443B] mb-2">
                Option A: Select Local Artwork File
              </label>
              <div className="border-2 border-dashed border-[#E8DEC8] hover:border-[#C85A32] rounded-2xl p-6 text-center bg-[#F4EFE6]/40 cursor-pointer transition-colors relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  id="verifyFile"
                  className="hidden"
                />
                <label htmlFor="verifyFile" className="cursor-pointer block space-y-2">
                  <Upload className="w-10 h-10 text-[#C85A32] mx-auto" />
                  <span className="block font-bold text-sm text-[#3D271D]">
                    {file ? file.name : 'Click to select artwork image to verify'}
                  </span>
                  <span className="block text-[11px] text-[#55443B]">
                    Calculates byte-exact SHA-256 checksum locally on upload
                  </span>
                </label>
              </div>

              {preview && (
                <div className="mt-3 flex items-center space-x-3 p-3 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8]">
                  <img src={preview} alt="Verify target" className="w-12 h-12 object-cover rounded-lg" />
                  <div className="truncate text-xs">
                    <p className="font-bold text-[#3D271D] truncate">{file?.name}</p>
                    <p className="text-[#55443B]">{(file?.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              )}
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#E8DEC8]"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-[#55443B] uppercase">Or</span>
              <div className="flex-grow border-t border-[#E8DEC8]"></div>
            </div>

            {/* Manual Hash String Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#55443B] mb-1">
                Option B: Paste 64-Character SHA-256 Hash
              </label>
              <input
                type="text"
                placeholder="e.g. 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
                value={hashInput}
                onChange={(e) => {
                  setHashInput(e.target.value);
                  setFile(null);
                  setPreview('');
                  setResult(null);
                }}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-mono text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            {error && (
              <p className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#C85A32] hover:bg-[#A9431E] text-[#FAF7F2] font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Computing SHA-256 & Searching Registry...' : 'Verify Cryptographic Fingerprint'}
            </button>
          </form>

          {/* Verification Results Output */}
          {result && (
            <div
              className={`p-6 rounded-2xl border-2 space-y-3 ${
                result.matched
                  ? 'bg-green-50/70 border-[#5C6B47] text-[#3D271D]'
                  : 'bg-amber-50/70 border-amber-300 text-[#3D271D]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                {result.matched ? (
                  <CheckCircle2 className="w-6 h-6 text-[#5C6B47]" />
                ) : (
                  <XCircle className="w-6 h-6 text-amber-700" />
                )}
                <h3 className="font-serif font-bold text-lg">
                  {result.matched ? 'Exact Match Verified In Registry' : 'No Byte-Exact Match Found'}
                </h3>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DEC8] font-mono text-[11px] break-all">
                <span className="font-bold text-[#55443B]">Calculated SHA-256: </span>
                {result.sha256_hash}
              </div>

              <p className="text-xs leading-relaxed">{result.message}</p>

              {result.matched && (
                <div className="pt-2 border-t border-[#E8DEC8] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-[#3D271D]">{result.artwork_title}</span>
                    <span className="text-[#55443B] ml-2 font-mono">({result.provenance_id})</span>
                  </div>
                  <Link
                    to={result.provenance_url}
                    className="px-3 py-1.5 bg-[#5C6B47] text-[#FAF7F2] rounded-xl font-bold hover:bg-[#475336] transition-colors flex items-center space-x-1"
                  >
                    <span>Inspect Provenance Record</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Integrity Note */}
          <div className="p-4 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8] text-[11px] text-[#55443B] space-y-1">
            <span className="font-bold text-[#3D271D] block">TECHNICAL SPECIFICATION:</span>
            <p>
              Artogram SHA-256 hashes evaluate byte-exact file streams. If an image is cropped, resized, recompressed or watermarked, its cryptographic hash will differ. The SHA-256 hash certifies exact file reproduction, not legal ownership.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyHashPage;
