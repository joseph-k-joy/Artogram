import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  KeyRound,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const PermissionRequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [mode, setMode] = useState('incoming'); // 'incoming' or 'outgoing'
  const [loading, setLoading] = useState(true);

  // Response form state for artists
  const [respondingId, setRespondingId] = useState(null);
  const [decision, setDecision] = useState('approved');
  const [responseNote, setResponseNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async (currMode = mode) => {
    setLoading(true);
    try {
      const res = await client.get(`/api/permissions/requests/?mode=${currMode}`);
      setRequests(res.data);
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(mode);
  }, [mode]);

  const handleRespond = async (requestId) => {
    setActionLoading(true);
    try {
      const res = await client.post(`/api/permissions/requests/${requestId}/respond/`, {
        status: decision,
        artist_response_note: responseNote.trim(),
      });
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? res.data : r))
      );
      setRespondingId(null);
      setResponseNote('');
    } catch (err) {
      console.error('Respond error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5C6B47]/15 text-[#5C6B47] border border-[#5C6B47]/30 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 flex items-center space-x-1">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      case 'clarification_requested':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1">
            <HelpCircle className="w-3 h-3" />
            <span>More Info Requested</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8DEC8] text-[#3D271D] border border-[#E8DEC8] flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E8DEC8]">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#5C6B47] text-[#FAF7F2] flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#3D271D]">Permission Hub</h1>
              <p className="text-xs text-[#55443B]">Manage cultural reuse licenses, covenants & institutional requests</p>
            </div>
          </div>

          <div className="flex bg-[#F4EFE6] p-1 rounded-xl border border-[#E8DEC8]">
            <button
              onClick={() => setMode('incoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'incoming'
                  ? 'bg-[#C85A32] text-[#FAF7F2] shadow-xs'
                  : 'text-[#55443B] hover:text-[#3D271D]'
              }`}
            >
              Incoming Requests (For My Art)
            </button>
            <button
              onClick={() => setMode('outgoing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'outgoing'
                  ? 'bg-[#C85A32] text-[#FAF7F2] shadow-xs'
                  : 'text-[#55443B] hover:text-[#3D271D]'
              }`}
            >
              My Outgoing Requests
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading permission requests..." />
        ) : requests.length === 0 ? (
          <div className="p-16 text-center bg-[#F4EFE6] rounded-3xl border-2 border-dashed border-[#E8DEC8] space-y-2">
            <KeyRound className="w-10 h-10 text-[#55443B] mx-auto opacity-50" />
            <h3 className="font-serif font-bold text-lg text-[#3D271D]">No Permission Requests Found</h3>
            <p className="text-xs text-[#55443B] max-w-sm mx-auto">
              {mode === 'incoming'
                ? 'No institutions or users have requested reuse licenses for your artworks yet.'
                : 'You have not submitted any reuse permission requests.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => (
              <div
                key={r.id}
                className="p-6 bg-[#FAF7F2] rounded-2xl border-2 border-[#E8DEC8] shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E8DEC8] pb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={r.artwork_image}
                      alt={r.artwork_title}
                      className="w-12 h-12 rounded-xl object-cover bg-[#E8DEC8] border border-[#E8DEC8]"
                    />
                    <div>
                      <Link
                        to={`/artworks/${r.artwork_id}`}
                        className="font-serif font-bold text-base text-[#3D271D] hover:text-[#C85A32] transition-colors"
                      >
                        {r.artwork_title}
                      </Link>
                      <p className="text-xs text-[#55443B]">
                        {mode === 'incoming' ? (
                          <>Requested by: <strong className="text-[#3D271D]">@{r.requester_username}</strong></>
                        ) : (
                          <>Artist: <strong className="text-[#C85A32]">@{r.artist_username}</strong></>
                        )}
                      </p>
                    </div>
                  </div>

                  <div>{getStatusBadge(r.status)}</div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8]">
                    <span className="text-[10px] font-bold uppercase text-[#55443B] block">Proposed Purpose</span>
                    <span className="font-semibold text-[#3D271D]">{r.intended_usage}</span>
                    <span className={`inline-block ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      r.is_commercial ? 'bg-amber-100 text-amber-800' : 'bg-[#5C6B47]/20 text-[#5C6B47]'
                    }`}>
                      {r.is_commercial ? 'Commercial' : 'Non-Commercial'}
                    </span>
                  </div>

                  <div className="p-3 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8]">
                    <span className="text-[10px] font-bold uppercase text-[#55443B] block">Distribution Platform</span>
                    <span className="font-semibold text-[#3D271D]">{r.expected_platform || 'Not specified'}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="font-bold text-[#3D271D]">Project Scope & Description:</span>
                  <p className="text-[#55443B] leading-relaxed bg-[#F4EFE6] p-3 rounded-xl border border-[#E8DEC8]">
                    {r.description}
                  </p>
                </div>

                {r.artist_response_note && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-[#55443B] space-y-1">
                    <span className="font-bold text-[#3D271D] block">Artist Decision Note:</span>
                    <p className="italic">{r.artist_response_note}</p>
                  </div>
                )}

                {/* Action button if incoming and pending */}
                {mode === 'incoming' && r.status === 'pending' && (
                  <div className="pt-2">
                    {respondingId === r.id ? (
                      <div className="p-4 bg-[#F4EFE6] rounded-xl border border-[#E8DEC8] space-y-3">
                        <span className="font-bold text-xs text-[#3D271D] block">Respond to Permission Request</span>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => setDecision('approved')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                              decision === 'approved' ? 'bg-[#5C6B47] text-[#FAF7F2]' : 'bg-[#FAF7F2] text-[#3D271D]'
                            }`}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setDecision('rejected')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                              decision === 'rejected' ? 'bg-red-700 text-[#FAF7F2]' : 'bg-[#FAF7F2] text-[#3D271D]'
                            }`}
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => setDecision('clarification_requested')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                              decision === 'clarification_requested' ? 'bg-amber-600 text-[#FAF7F2]' : 'bg-[#FAF7F2] text-[#3D271D]'
                            }`}
                          >
                            Ask Clarification
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          placeholder="Add covenant conditions or reason for decision..."
                          value={responseNote}
                          onChange={(e) => setResponseNote(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs text-[#3D271D]"
                        ></textarea>

                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setRespondingId(null)}
                            className="px-3 py-1.5 text-xs text-[#55443B]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleRespond(r.id)}
                            className="px-4 py-1.5 bg-[#C85A32] text-[#FAF7F2] font-bold text-xs rounded-xl"
                          >
                            {actionLoading ? 'Recording...' : 'Submit Decision'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRespondingId(r.id)}
                        className="px-4 py-2 bg-[#C85A32] hover:bg-[#A9431E] text-[#FAF7F2] text-xs font-bold rounded-xl transition-colors"
                      >
                        Respond to Request
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionRequestsPage;
