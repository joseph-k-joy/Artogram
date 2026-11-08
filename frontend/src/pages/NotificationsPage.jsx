import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  KeyRound,
  ShieldAlert,
  Check,
  CheckCheck,
} from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/notifications/');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await client.post(`/api/notifications/${id}/read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await client.post('/api/notifications/read-all/');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-[#C85A32] fill-current" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-[#5C6B47]" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-[#3D271D]" />;
      case 'permission_request':
      case 'permission_decision':
        return <KeyRound className="w-4 h-4 text-[#C85A32]" />;
      case 'report_status':
      case 'moderation_update':
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-[#55443B]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DEC8]">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#5C6B47] text-[#FAF7F2] flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#3D271D]">Notifications</h1>
              <p className="text-xs text-[#55443B]">Updates on your artworks, followers, and permissions</p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#E8DEC8] border border-[#E8DEC8] text-xs font-bold text-[#3D271D] rounded-xl transition-colors flex items-center space-x-1"
            >
              <CheckCheck className="w-4 h-4 text-[#5C6B47]" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner label="Retrieving updates..." />
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center bg-[#F4EFE6] rounded-3xl border-2 border-dashed border-[#E8DEC8] space-y-2">
            <Bell className="w-10 h-10 text-[#55443B] mx-auto opacity-50" />
            <h3 className="font-serif font-bold text-lg text-[#3D271D]">All Caught Up</h3>
            <p className="text-xs text-[#55443B]">You have no recent notifications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border-2 transition-colors flex items-start justify-between space-x-3 ${
                  n.is_read
                    ? 'bg-[#FAF7F2] border-[#E8DEC8] opacity-80'
                    : 'bg-[#F4EFE6] border-[#C85A32]/40 shadow-xs'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-[#FAF7F2] border border-[#E8DEC8] shadow-xs mt-0.5">
                    {getIcon(n.notification_type)}
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-xs text-[#3D271D]">{n.title}</p>
                    <p className="text-xs text-[#55443B]">{n.message}</p>
                    <span className="text-[10px] text-[#55443B]/80 font-mono">
                      {new Date(n.created_at).toLocaleDateString()} at{' '}
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {n.target_url && (
                    <Link
                      to={n.target_url}
                      className="px-2.5 py-1 bg-[#FAF7F2] border border-[#E8DEC8] text-[10px] font-bold text-[#C85A32] rounded-lg hover:bg-[#E8DEC8]"
                    >
                      View
                    </Link>
                  )}
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="p-1 rounded-lg text-[#55443B] hover:text-[#5C6B47] hover:bg-[#FAF7F2]"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
