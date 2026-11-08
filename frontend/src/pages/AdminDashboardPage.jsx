import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Shield,
  Users,
  Palette,
  FileCheck2,
  AlertTriangle,
  MessageSquare,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Search,
  ExternalLink,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { user, isModerator } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // overview, users, artworks, reports, comments, audit
  const [overview, setOverview] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [artworksList, setArtworksList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [commentsList, setCommentsList] = useState([]);
  const [auditList, setAuditList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status update message
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (!user || !isModerator) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [ovRes, usrRes, artRes, repRes, comRes, audRes] = await Promise.all([
          client.get('/api/moderation/overview/'),
          client.get('/api/moderation/users/'),
          client.get('/api/artworks/'),
          client.get('/api/reports/'),
          client.get('/api/moderation/comments/'),
          client.get('/api/audit/'),
        ]);

        setOverview(ovRes.data);
        setUsersList(usrRes.data);
        setArtworksList(artRes.data);
        setReportsList(repRes.data);
        setCommentsList(comRes.data);
        setAuditList(audRes.data);
      } catch (err) {
        console.error('Admin load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, isModerator]);

  // Update user role
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const res = await client.patch(`/api/moderation/users/${userId}/`, { role: newRole });
      setUsersList((prev) => prev.map((u) => (u.id === userId ? res.data : u)));
      setStatusMsg(`Updated user role to ${newRole}`);
      setTimeout(() => setStatusMsg(''), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  // Update artwork status
  const handleUpdateArtworkStatus = async (artworkId, newStatus, badge) => {
    try {
      await client.patch(`/api/moderation/artworks/${artworkId}/status/`, {
        status: newStatus,
        badge_label: badge,
      });
      setArtworksList((prev) =>
        prev.map((a) => (a.id === artworkId ? { ...a, verification_status: newStatus, verification_badge: badge } : a))
      );
      setStatusMsg(`Updated artwork status to ${newStatus}`);
      setTimeout(() => setStatusMsg(''), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  // Update report status
  const handleUpdateReportStatus = async (reportId, newStatus, notes) => {
    try {
      const res = await client.patch(`/api/reports/${reportId}/update-status/`, {
        status: newStatus,
        admin_notes: notes || 'Reviewed by Artogram Moderator Council',
      });
      setReportsList((prev) => prev.map((r) => (r.id === reportId ? res.data : r)));
      setStatusMsg(`Report #${reportId} set to ${newStatus}`);
      setTimeout(() => setStatusMsg(''), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  // Moderate comment
  const handleToggleCommentVisibility = async (commentId, currentHidden) => {
    try {
      await client.patch(`/api/moderation/comments/${commentId}/`, {
        is_hidden: !currentHidden,
      });
      setCommentsList((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, is_hidden: !currentHidden } : c))
      );
      setStatusMsg(`Comment visibility updated`);
      setTimeout(() => setStatusMsg(''), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner label="Loading Artogram Governance Console..." />;

  const stats = overview?.stats || {};

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b-2 border-[#E8DEC8]">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3D271D] text-[#FAF7F2] flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C85A32] block">
                Platform Administration & Trust
              </span>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#3D271D]">
                Governance Dashboard
              </h1>
            </div>
          </div>

          {statusMsg && (
            <span className="px-3 py-1.5 bg-green-100 text-green-800 text-xs font-bold rounded-xl border border-green-200 animate-in fade-in">
              {statusMsg}
            </span>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-[#E8DEC8] scrollbar-none">
          {[
            { id: 'overview', label: 'Overview & Metrics', icon: Shield },
            { id: 'users', label: `Users (${usersList.length})`, icon: Users },
            { id: 'artworks', label: `Artworks (${artworksList.length})`, icon: Palette },
            { id: 'reports', label: `Misuse Reports (${reportsList.length})`, icon: AlertTriangle },
            { id: 'comments', label: `Comment Moderation (${commentsList.length})`, icon: MessageSquare },
            { id: 'audit', label: `Audit Trail (${auditList.length})`, icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-2 transition-all ${
                  active
                    ? 'bg-[#3D271D] text-[#FAF7F2] shadow-sm'
                    : 'bg-[#F4EFE6] text-[#55443B] hover:bg-[#E8DEC8]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 8 Stats Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 bg-[#FAF7F2] rounded-2xl border-2 border-[#E8DEC8] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#55443B] block">Total Users</span>
                <span className="font-serif font-black text-2xl text-[#3D271D]">{stats.total_users || 0}</span>
              </div>
              <div className="p-5 bg-[#FAF7F2] rounded-2xl border-2 border-[#E8DEC8] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#C85A32] block">Verified Artists</span>
                <span className="font-serif font-black text-2xl text-[#C85A32]">{stats.total_artists || 0}</span>
              </div>
              <div className="p-5 bg-[#FAF7F2] rounded-2xl border-2 border-[#E8DEC8] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#5C6B47] block">Registered Artworks</span>
                <span className="font-serif font-black text-2xl text-[#5C6B47]">{stats.total_artworks || 0}</span>
              </div>
              <div className="p-5 bg-[#FAF7F2] rounded-2xl border-2 border-[#E8DEC8] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#3D271D] block">Social Posts</span>
                <span className="font-serif font-black text-2xl text-[#3D271D]">{stats.total_posts || 0}</span>
              </div>

              <div className="p-5 bg-[#F4EFE6] rounded-2xl border-2 border-amber-300 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Pending Reviews</span>
                <span className="font-serif font-black text-2xl text-amber-900">{stats.pending_artwork_reviews || 0}</span>
              </div>
              <div className="p-5 bg-[#F4EFE6] rounded-2xl border-2 border-red-300 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-red-700 block">Active Reports</span>
                <span className="font-serif font-black text-2xl text-red-800">{stats.pending_reports || 0}</span>
              </div>
              <div className="p-5 bg-[#F4EFE6] rounded-2xl border-2 border-[#E8DEC8] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#5C6B47] block">Pending Permissions</span>
                <span className="font-serif font-black text-2xl text-[#5C6B47]">{stats.pending_permissions || 0}</span>
              </div>
              <div className="p-5 bg-[#F4EFE6] rounded-2xl border-2 border-[#E8DEC8] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#3D271D] block">Community Verifications</span>
                <span className="font-serif font-black text-2xl text-[#3D271D]">{stats.pending_community_verifications || 0}</span>
              </div>
            </div>

            {/* Quick Action shortcuts */}
            <div className="p-6 bg-[#FAF7F2] rounded-3xl border-2 border-[#E8DEC8] space-y-3">
              <h3 className="font-serif font-bold text-lg text-[#3D271D]">Administrative Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab('reports')}
                  className="px-4 py-2 bg-red-700 text-[#FAF7F2] text-xs font-bold rounded-xl"
                >
                  Review Misuse Reports ({stats.pending_reports || 0})
                </button>
                <button
                  onClick={() => setActiveTab('artworks')}
                  className="px-4 py-2 bg-[#5C6B47] text-[#FAF7F2] text-xs font-bold rounded-xl"
                >
                  Inspect Artwork Provenance
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className="px-4 py-2 bg-[#C85A32] text-[#FAF7F2] text-xs font-bold rounded-xl"
                >
                  Manage User Accounts
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className="px-4 py-2 bg-[#3D271D] text-[#FAF7F2] text-xs font-bold rounded-xl"
                >
                  View System Audit Log
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'users' && (
          <div className="bg-[#FAF7F2] rounded-3xl border-2 border-[#E8DEC8] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#E8DEC8] font-bold text-sm text-[#3D271D]">
              Registered Users & Roles
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4EFE6] text-[#55443B] uppercase text-[10px]">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Current Role</th>
                    <th className="p-3">Verified Artist</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DEC8]">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F4EFE6]/50">
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <img
                            src={u.profile?.effective_avatar}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover bg-[#E8DEC8]"
                          />
                          <div>
                            <span className="font-bold text-[#3D271D]">{u.profile?.display_name || u.username}</span>
                            <span className="block text-[10px] text-[#55443B]">@{u.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-[#55443B]">{u.email}</td>
                      <td className="p-3">
                        <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-[#E8DEC8] text-[#3D271D]">
                          {u.profile?.role}
                        </span>
                      </td>
                      <td className="p-3">
                        {u.profile?.is_verified_artist ? (
                          <span className="text-[#5C6B47] font-bold">Yes</span>
                        ) : (
                          <span className="text-[#55443B]">No</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-green-700 font-bold">Active</span>
                      </td>
                      <td className="p-3">
                        <select
                          value={u.profile?.role}
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                          className="px-2 py-1 bg-[#FAF7F2] border border-[#E8DEC8] rounded text-[11px]"
                        >
                          <option value="registered">Registered User</option>
                          <option value="artist">Artist</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ARTWORKS */}
        {activeTab === 'artworks' && (
          <div className="bg-[#FAF7F2] rounded-3xl border-2 border-[#E8DEC8] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#E8DEC8] font-bold text-sm text-[#3D271D]">
              Artwork Registrations & Provenance Status
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4EFE6] text-[#55443B] uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Artwork</th>
                    <th className="p-3">Provenance ID</th>
                    <th className="p-3">Lineage / Origin</th>
                    <th className="p-3">Current Status</th>
                    <th className="p-3">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DEC8]">
                  {artworksList.map((a) => (
                    <tr key={a.id} className="hover:bg-[#F4EFE6]/50">
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <img
                            src={a.effective_image}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover bg-[#E8DEC8]"
                          />
                          <div>
                            <Link to={`/artworks/${a.id}`} className="font-bold text-[#3D271D] hover:underline">
                              {a.title}
                            </Link>
                            <span className="block text-[10px] text-[#C85A32]">{a.original_creator_name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-[#C85A32]">{a.provenance_id}</td>
                      <td className="p-3 text-[#55443B]">{a.cultural_origin}</td>
                      <td className="p-3">
                        <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-[#E8DEC8] text-[#3D271D]">
                          {a.verification_status || 'registered'}
                        </span>
                      </td>
                      <td className="p-3 space-x-1.5">
                        <button
                          onClick={() => handleUpdateArtworkStatus(a.id, 'community_reviewed', 'Community Verified & Approved')}
                          className="px-2 py-1 bg-[#5C6B47] text-[#FAF7F2] rounded text-[10px] font-bold hover:bg-[#475336]"
                        >
                          Approve Verified
                        </button>
                        <button
                          onClick={() => handleUpdateArtworkStatus(a.id, 'verification_rejected', 'Verification Rejected')}
                          className="px-2 py-1 bg-red-700 text-[#FAF7F2] rounded text-[10px] font-bold hover:bg-red-800"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: MISUSE REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {reportsList.length === 0 ? (
              <div className="p-8 text-center bg-[#F4EFE6] rounded-2xl border border-[#E8DEC8]">
                <p className="text-xs text-[#55443B]">No reports submitted.</p>
              </div>
            ) : (
              reportsList.map((rep) => (
                <div
                  key={rep.id}
                  className="p-6 bg-[#FAF7F2] rounded-2xl border-2 border-[#E8DEC8] shadow-sm space-y-3 text-xs"
                >
                  <div className="flex justify-between items-center border-b border-[#E8DEC8] pb-2">
                    <span className="font-bold text-red-700 uppercase tracking-wider">
                      Report #{rep.id}: {rep.report_type.replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-[#E8DEC8]">
                      Status: {rep.status}
                    </span>
                  </div>

                  <p className="text-[#3D271D]">
                    Target Artwork: <strong>{rep.artwork_title}</strong> (ID: {rep.provenance_id})
                  </p>
                  <p className="text-[#55443B] bg-[#F4EFE6] p-2.5 rounded-xl border border-[#E8DEC8]">
                    {rep.description}
                  </p>

                  {rep.suspected_external_url && (
                    <p className="text-[11px] text-[#C85A32]">
                      Suspected External Site: <a href={rep.suspected_external_url} target="_blank" rel="noreferrer" className="underline">{rep.suspected_external_url}</a>
                    </p>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap gap-2 items-center">
                    <button
                      onClick={() => handleUpdateReportStatus(rep.id, 'under_review', 'Currently investigating evidence')}
                      className="px-3 py-1.5 bg-amber-600 text-[#FAF7F2] rounded-lg font-bold text-[10px]"
                    >
                      Set Under Review
                    </button>
                    <button
                      onClick={() => handleUpdateReportStatus(rep.id, 'action_taken', 'Artwork flagged and provenance updated')}
                      className="px-3 py-1.5 bg-red-700 text-[#FAF7F2] rounded-lg font-bold text-[10px]"
                    >
                      Action Taken (Flag Artwork)
                    </button>
                    <button
                      onClick={() => handleUpdateReportStatus(rep.id, 'resolved', 'Resolved with user attribution correction')}
                      className="px-3 py-1.5 bg-[#5C6B47] text-[#FAF7F2] rounded-lg font-bold text-[10px]"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleUpdateReportStatus(rep.id, 'rejected', 'Evidence insufficient')}
                      className="px-3 py-1.5 bg-stone-300 text-[#3D271D] rounded-lg font-bold text-[10px]"
                    >
                      Reject Allegation
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: COMMENTS MODERATION */}
        {activeTab === 'comments' && (
          <div className="bg-[#FAF7F2] rounded-3xl border-2 border-[#E8DEC8] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#E8DEC8] font-bold text-sm text-[#3D271D]">
              Recent Comments Across Platform
            </div>
            <div className="divide-y divide-[#E8DEC8]">
              {commentsList.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between text-xs hover:bg-[#F4EFE6]/50">
                  <div>
                    <span className="font-bold text-[#3D271D]">@{c.username}</span>
                    <span className="text-[#55443B] ml-2">on "{c.post_title}"</span>
                    <p className={`mt-1 ${c.is_hidden ? 'italic text-red-600 line-through' : 'text-[#55443B]'}`}>
                      "{c.text}"
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleCommentVisibility(c.id, c.is_hidden)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-[10px] flex items-center space-x-1 ${
                      c.is_hidden
                        ? 'bg-[#5C6B47] text-[#FAF7F2]'
                        : 'bg-red-700 text-[#FAF7F2]'
                    }`}
                  >
                    {c.is_hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{c.is_hidden ? 'Restore Comment' : 'Hide Comment'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-[#FAF7F2] rounded-3xl border-2 border-[#E8DEC8] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#E8DEC8] font-bold text-sm text-[#3D271D] flex items-center justify-between">
              <span>Append-Only System Audit History</span>
              <span className="text-xs text-[#55443B] font-normal">Immutable database event log</span>
            </div>
            <div className="divide-y divide-[#E8DEC8] max-h-[600px] overflow-y-auto">
              {auditList.map((ev) => (
                <div key={ev.id} className="p-4 text-xs space-y-1 hover:bg-[#F4EFE6]/50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#C85A32] uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-[#E8DEC8]">
                      {ev.action}
                    </span>
                    <span className="font-mono text-[10px] text-[#55443B]">
                      {new Date(ev.timestamp).toLocaleDateString()} {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[#3D271D]">
                    Actor: <strong className="text-[#5C6B47]">@{ev.actor_username || 'System'}</strong> &bull; Target: {ev.entity_type} ({ev.entity_id})
                  </p>
                  <p className="text-[#55443B] bg-[#F4EFE6] p-2 rounded-lg border border-[#E8DEC8]/60">
                    {ev.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
