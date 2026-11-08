import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  FileText,
} from 'lucide-react';

const MisuseReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/reports/');
      setReports(res.data);
    } catch (err) {
      console.error('Fetch reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'action_taken':
      case 'resolved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5C6B47]/15 text-[#5C6B47] border border-[#5C6B47]/30 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span className="uppercase">{status.replace('_', ' ')}</span>
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>UNDER REVIEW</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-[#55443B] flex items-center space-x-1">
            <XCircle className="w-3 h-3" />
            <span>REJECTED</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8DEC8] text-[#3D271D] flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>SUBMITTED</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DEC8]">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-[#FAF7F2] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#3D271D]">Misuse Reports</h1>
              <p className="text-xs text-[#55443B]">Track investigation status and decisions on reported violations</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#55443B] bg-[#E8DEC8] px-3 py-1 rounded-full">
            {reports.length} Filed
          </span>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading reports log..." />
        ) : reports.length === 0 ? (
          <div className="p-16 text-center bg-[#F4EFE6] rounded-3xl border-2 border-dashed border-[#E8DEC8] space-y-2">
            <ShieldAlert className="w-10 h-10 text-[#55443B] mx-auto opacity-50" />
            <h3 className="font-serif font-bold text-lg text-[#3D271D]">No Misuse Reports Logged</h3>
            <p className="text-xs text-[#55443B]">You haven't filed any reports regarding artwork attribution misuse.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-6 bg-[#FAF7F2] rounded-2xl border-2 border-[#E8DEC8] shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E8DEC8] pb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={rep.artwork_image}
                      alt={rep.artwork_title}
                      className="w-12 h-12 rounded-xl object-cover bg-[#E8DEC8] border border-[#E8DEC8]"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/artworks/${rep.artwork_id}`}
                          className="font-serif font-bold text-base text-[#3D271D] hover:text-[#C85A32] transition-colors"
                        >
                          {rep.artwork_title}
                        </Link>
                        <span className="text-[10px] font-mono text-[#C85A32] font-semibold">
                          ({rep.provenance_id})
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#5C6B47] uppercase tracking-wider">
                        Violation: {rep.report_type.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>

                  <div>{getStatusBadge(rep.status)}</div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="font-bold text-[#3D271D]">Allegation Description:</span>
                  <p className="text-[#55443B] leading-relaxed bg-[#F4EFE6] p-3 rounded-xl border border-[#E8DEC8]">
                    {rep.description}
                  </p>
                </div>

                {rep.suspected_external_url && (
                  <div className="text-xs">
                    <span className="font-bold text-[#3D271D] mr-1.5">Reported URL:</span>
                    <a
                      href={rep.suspected_external_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#C85A32] underline break-all inline-flex items-center space-x-1"
                    >
                      <span>{rep.suspected_external_url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {rep.admin_notes && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-[#55443B] space-y-1">
                    <span className="font-bold text-[#3D271D] block">Moderator Investigation Findings:</span>
                    <p className="italic">{rep.admin_notes}</p>
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

export default MisuseReportsPage;
