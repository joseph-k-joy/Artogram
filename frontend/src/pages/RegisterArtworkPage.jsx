import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Upload,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  FileKey2,
} from 'lucide-react';

const CATEGORIES = [
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
  'Other',
];

const DECLARATION_CHOICES = [
  { value: 'created_by_me', label: 'I created this artwork' },
  { value: 'authorised_representative', label: 'I am an authorised cultural representative' },
  { value: 'submitted_with_permission', label: 'I am submitting this with permission from the creator/lineage' },
  { value: 'documenting_community_work', label: 'I am documenting a community-held cultural work' },
  { value: 'other', label: 'Other documented relationship' },
];

const RegisterArtworkPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    art_category: CATEGORIES[0],
    tags: '',
    original_creator_name: user?.profile?.display_name || user?.username || '',
    cultural_origin: user?.profile?.location || '',
    geographic_region: '',
    language: '',
    cultural_background: '',
    historical_context: '',
    classification: 'traditional',
    creation_period: '',
    information_source: '',
    required_credit: '',
    preferred_attribution_format: '',
    declaration_type: 'created_by_me',
    declaration_details: '',
    visibility: 'public',
    image_url: '',
    // Permissions
    downloading_allowed: false,
    educational_use_allowed: true,
    commercial_use_allowed: false,
    modification_allowed: false,
    additional_conditions: '',
    publish_to_feed: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [contributors, setContributors] = useState([]);
  const [newContribName, setNewContribName] = useState('');
  const [newContribRole, setNewContribRole] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setError('File size exceeds 15MB limit.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleAddContributor = () => {
    if (newContribName.trim()) {
      setContributors([
        ...contributors,
        { name: newContribName.trim(), role: newContribRole.trim() || 'Contributor' },
      ]);
      setNewContribName('');
      setNewContribRole('');
    }
  };

  const handleRemoveContributor = (index) => {
    setContributors(contributors.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Artwork title is required.');
      return;
    }
    if (!formData.cultural_origin.trim()) {
      setError('Cultural origin and heritage lineage are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (imageFile) {
        data.append('image', imageFile);
      }

      data.append('contributors', JSON.stringify(contributors));

      const res = await client.post('/api/artworks/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newProvenanceId = res.data.provenance_id;
      // Redirect to newly minted Identity Card!
      navigate(`/artworks/${newProvenanceId}/identity-card/`);
    } catch (err) {
      const resp = err.response?.data;
      if (resp && typeof resp === 'object') {
        setError(Object.entries(resp).map(([k, v]) => `${k}: ${v}`).join(' '));
      } else {
        setError('Failed to register artwork. Please verify input fields.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#E8DEC8] text-[#5C6B47] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
            <span>Digital Provenance Minting</span>
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#3D271D]">
            Register Artwork Provenance
          </h1>
          <p className="text-xs sm:text-sm text-[#55443B]">
            Cryptographically fingerprint your artwork, assign a permanent ID, and generate your Artogram Identity Card.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center space-x-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8 text-xs">
          {/* Section 1: Basic Artwork Information */}
          <div className="p-6 sm:p-8 bg-[#FAF7F2] rounded-3xl border-2 border-[#E8DEC8] shadow-sm space-y-5">
            <h2 className="font-serif font-bold text-lg text-[#3D271D] border-b border-[#E8DEC8] pb-3 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#C85A32] text-[#FAF7F2] flex items-center justify-center text-xs font-bold">1</span>
              <span>Artwork Identity & Visual Asset</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Artwork Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Spiral Harvest of Palghat"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-sm text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Art Category *
                </label>
                <select
                  value={formData.art_category}
                  onChange={(e) => setFormData({ ...formData, art_category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Media Upload / URL */}
            <div>
              <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                Upload Artwork Image (Calculates SHA-256 Fingerprint) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="border-2 border-dashed border-[#E8DEC8] rounded-2xl p-4 text-center hover:border-[#C85A32] transition-colors bg-[#F4EFE6]/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="artworkFileInput"
                    className="hidden"
                  />
                  <label htmlFor="artworkFileInput" className="cursor-pointer block space-y-2">
                    <Upload className="w-8 h-8 text-[#C85A32] mx-auto" />
                    <span className="block font-bold text-xs text-[#3D271D]">Click to select artwork file</span>
                    <span className="block text-[10px] text-[#55443B]">PNG, JPG, WEBP up to 15MB</span>
                  </label>
                </div>

                {imagePreview ? (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-[#E8DEC8] shadow-inner bg-[#E8DEC8]/50">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-2 text-[9px] bg-[#FAF7F2]/90 px-1.5 py-0.5 rounded font-mono font-bold text-[#C85A32]">
                      Byte Stream Ready
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-[#55443B] mb-1 text-[11px]">
                      Or provide sample image URL:
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image_url}
                      onChange={(e) => {
                        setFormData({ ...formData, image_url: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                Artwork Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe motifs, materials, ritual purpose, and technique..."
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
              ></textarea>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g. warli, harvest, indigenous, rice-paste, ritual"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
              />
            </div>
          </div>

          {/* Section 2: Cultural Lineage & Creator Attributions */}
          <div className="p-6 sm:p-8 bg-[#FAF7F2] rounded-3xl border-2 border-[#E8DEC8] shadow-sm space-y-5">
            <h2 className="font-serif font-bold text-lg text-[#3D271D] border-b border-[#E8DEC8] pb-3 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#5C6B47] text-[#FAF7F2] flex items-center justify-center text-xs font-bold">2</span>
              <span>Cultural Lineage & Heritage Context</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Original Creator / Master Artisan Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.original_creator_name}
                  onChange={(e) => setFormData({ ...formData, original_creator_name: e.target.value })}
                  placeholder="e.g. Maya Dhas / Yoruba Dyeing Guild"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-sm text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Cultural Origin & Lineage *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cultural_origin}
                  onChange={(e) => setFormData({ ...formData, cultural_origin: e.target.value })}
                  placeholder="e.g. Warli Tribe, Maharashtra, India"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-sm text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Geographic Region
                </label>
                <input
                  type="text"
                  value={formData.geographic_region}
                  onChange={(e) => setFormData({ ...formData, geographic_region: e.target.value })}
                  placeholder="e.g. Western Ghats"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Language / Dialect
                </label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  placeholder="e.g. Warli / Marathi"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Classification Form
                </label>
                <select
                  value={formData.classification}
                  onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                >
                  <option value="traditional">Traditional Cultural Expression</option>
                  <option value="contemporary">Contemporary Cultural Expression</option>
                  <option value="hybrid">Fusion / Hybrid Cultural Form</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Cultural Background
                </label>
                <textarea
                  rows={2}
                  value={formData.cultural_background}
                  onChange={(e) => setFormData({ ...formData, cultural_background: e.target.value })}
                  placeholder="Ritual role, traditional significance, sacred materials..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Historical Context & Lineage Source
                </label>
                <textarea
                  rows={2}
                  value={formData.historical_context}
                  onChange={(e) => setFormData({ ...formData, historical_context: e.target.value })}
                  placeholder="Master under whom trained, oral lineage history, museum catalog..."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                ></textarea>
              </div>
            </div>

            {/* Additional Contributors */}
            <div className="p-4 bg-[#F4EFE6] rounded-2xl border border-[#E8DEC8] space-y-3">
              <span className="font-bold text-[#3D271D] uppercase text-[10px] tracking-wider block">
                Additional Cultural Contributors / Workshop Specialists
              </span>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Contributor name"
                  value={newContribName}
                  onChange={(e) => setNewContribName(e.target.value)}
                  className="px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D]"
                />
                <input
                  type="text"
                  placeholder="Role (e.g. Weaver, Dye Master)"
                  value={newContribRole}
                  onChange={(e) => setNewContribRole(e.target.value)}
                  className="px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D]"
                />
                <button
                  type="button"
                  onClick={handleAddContributor}
                  className="px-3 py-1.5 bg-[#5C6B47] text-[#FAF7F2] rounded-xl font-bold hover:bg-[#475336] transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {contributors.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {contributors.map((c, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#FAF7F2] rounded-full border border-[#E8DEC8] text-xs font-medium text-[#3D271D]"
                    >
                      <span>{c.name} ({c.role})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveContributor(idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Legal Relationship Declaration & Reuse Terms */}
          <div className="p-6 sm:p-8 bg-[#FAF7F2] rounded-3xl border-2 border-[#E8DEC8] shadow-sm space-y-5">
            <h2 className="font-serif font-bold text-lg text-[#3D271D] border-b border-[#E8DEC8] pb-3 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#3D271D] text-[#FAF7F2] flex items-center justify-center text-xs font-bold">3</span>
              <span>Relationship Declaration & Reuse Covenants</span>
            </h2>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                Submitter Relationship Declaration *
              </label>
              <select
                value={formData.declaration_type}
                onChange={(e) => setFormData({ ...formData, declaration_type: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
              >
                {DECLARATION_CHOICES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Required Attribution Credit Notice
                </label>
                <input
                  type="text"
                  value={formData.required_credit}
                  onChange={(e) => setFormData({ ...formData, required_credit: e.target.value })}
                  placeholder="e.g. Artwork: Title by Artist. Lineage: Warli Heritage."
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#55443B] mb-1">
                  Preferred Citation Format
                </label>
                <input
                  type="text"
                  value={formData.preferred_attribution_format}
                  onChange={(e) => setFormData({ ...formData, preferred_attribution_format: e.target.value })}
                  placeholder="e.g. Artist Name (Cultural Origin) via Artogram"
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D] focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            {/* Permission Toggles */}
            <div className="p-4 bg-[#F4EFE6] rounded-2xl border border-[#E8DEC8] space-y-3">
              <span className="font-bold text-[#3D271D] uppercase text-[10px] tracking-wider block">
                Reuse Covenants (Manage external usage boundaries)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center space-x-2.5 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E8DEC8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.educational_use_allowed}
                    onChange={(e) => setFormData({ ...formData, educational_use_allowed: e.target.checked })}
                    className="w-4 h-4 text-[#C85A32] rounded focus:ring-[#C85A32]"
                  />
                  <span className="font-semibold text-[#3D271D]">Educational & Academic Use Allowed</span>
                </label>

                <label className="flex items-center space-x-2.5 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E8DEC8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.commercial_use_allowed}
                    onChange={(e) => setFormData({ ...formData, commercial_use_allowed: e.target.checked })}
                    className="w-4 h-4 text-[#C85A32] rounded focus:ring-[#C85A32]"
                  />
                  <span className="font-semibold text-[#3D271D]">Commercial Reproduction Allowed</span>
                </label>

                <label className="flex items-center space-x-2.5 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E8DEC8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.modification_allowed}
                    onChange={(e) => setFormData({ ...formData, modification_allowed: e.target.checked })}
                    className="w-4 h-4 text-[#C85A32] rounded focus:ring-[#C85A32]"
                  />
                  <span className="font-semibold text-[#3D271D]">Remix / Derivative Use Allowed</span>
                </label>

                <label className="flex items-center space-x-2.5 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E8DEC8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.publish_to_feed}
                    onChange={(e) => setFormData({ ...formData, publish_to_feed: e.target.checked })}
                    className="w-4 h-4 text-[#C85A32] rounded focus:ring-[#C85A32]"
                  />
                  <span className="font-semibold text-[#3D271D]">Publish to Artogram Social Feed</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-[#55443B] mb-1 text-[11px]">
                  Additional Covenants / Spiritual or Tribal Directives:
                </label>
                <textarea
                  rows={2}
                  value={formData.additional_conditions}
                  onChange={(e) => setFormData({ ...formData, additional_conditions: e.target.value })}
                  placeholder="e.g. Strictly prohibited for mass textile manufacturing without local council approval."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D]"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#C85A32] hover:bg-[#A9431E] text-[#FAF7F2] font-bold text-base rounded-2xl shadow-xl transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <FileKey2 className="w-5 h-5" />
              <span>
                {loading
                  ? 'Calculating SHA-256 & Minting Digital Provenance...'
                  : 'Register Artwork & Generate Identity Card'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterArtworkPage;
