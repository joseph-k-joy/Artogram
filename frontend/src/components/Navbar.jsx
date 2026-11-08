import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import {
  Compass,
  Home,
  PlusCircle,
  Bookmark,
  Bell,
  Shield,
  Search,
  User as UserIcon,
  LogOut,
  Download,
  Menu,
  X,
  FileCheck2,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isArtist, isAdmin, isModerator } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [installPrompt, setInstallPrompt] = useState(null);

  // PWA install prompt listener
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Poll unread notifications if logged in
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await client.get('/api/notifications/');
        setUnreadNotifications(res.data.unread_count || 0);
      } catch (err) {
        // silent
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    setProfileDropdown(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DEC8] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={user ? "/feed" : "/"} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#C85A32] flex items-center justify-center text-[#FAF7F2] shadow-sm group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <div>
              <span className="font-serif font-black text-xl tracking-wider text-[#3D271D]">ARTOGRAM</span>
              <span className="hidden sm:block text-[10px] tracking-widest text-[#5C6B47] uppercase font-semibold">Where Art Meets Identity</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {user ? (
              <>
                <Link
                  to="/feed"
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                    isActive('/feed')
                      ? 'bg-[#E8DEC8] text-[#C85A32] font-semibold'
                      : 'text-[#55443B] hover:bg-[#F4EFE6] hover:text-[#C85A32]'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Feed</span>
                </Link>

                <Link
                  to="/explore"
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                    isActive('/explore')
                      ? 'bg-[#E8DEC8] text-[#C85A32] font-semibold'
                      : 'text-[#55443B] hover:bg-[#F4EFE6] hover:text-[#C85A32]'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore</span>
                </Link>

                <Link
                  to="/verify-hash"
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                    isActive('/verify-hash')
                      ? 'bg-[#E8DEC8] text-[#C85A32] font-semibold'
                      : 'text-[#55443B] hover:bg-[#F4EFE6] hover:text-[#C85A32]'
                  }`}
                >
                  <FileCheck2 className="w-4 h-4 text-[#5C6B47]" />
                  <span>Verify Hash</span>
                </Link>

                <Link
                  to="/register-artwork"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-[#C85A32] text-[#FAF7F2] hover:bg-[#A9431E] transition-all flex items-center space-x-1.5 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register Art</span>
                </Link>

                <Link
                  to="/saved"
                  className={`p-2 rounded-lg text-[#55443B] hover:bg-[#F4EFE6] hover:text-[#C85A32] transition-colors relative ${
                    isActive('/saved') ? 'text-[#C85A32] bg-[#E8DEC8]' : ''
                  }`}
                  title="Saved Artworks"
                >
                  <Bookmark className="w-5 h-5" />
                </Link>

                <Link
                  to="/notifications"
                  className={`p-2 rounded-lg text-[#55443B] hover:bg-[#F4EFE6] hover:text-[#C85A32] transition-colors relative ${
                    isActive('/notifications') ? 'text-[#C85A32] bg-[#E8DEC8]' : ''
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#C85A32] text-[#FAF7F2] text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </Link>

                {isModerator && (
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition-colors ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-[#3D271D] text-[#FAF7F2]'
                        : 'border border-[#3D271D] text-[#3D271D] hover:bg-[#3D271D] hover:text-[#FAF7F2]'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/explore"
                  className="px-3 py-2 text-sm font-medium text-[#55443B] hover:text-[#C85A32]"
                >
                  Explore Registry
                </Link>
                <Link
                  to="/verify-hash"
                  className="px-3 py-2 text-sm font-medium text-[#5C6B47] hover:text-[#3D271D]"
                >
                  Verify Hash
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm font-medium text-[#3D271D] hover:text-[#C85A32]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#C85A32] text-[#FAF7F2] hover:bg-[#A9431E] transition-all shadow-sm"
                >
                  Join Artogram
                </Link>
              </>
            )}

            {/* PWA Install Button */}
            {installPrompt && (
              <button
                onClick={handleInstallClick}
                className="px-2.5 py-1.5 bg-[#5C6B47] text-[#FAF7F2] text-xs font-semibold rounded-lg hover:bg-[#475336] transition-all flex items-center space-x-1 shadow-sm"
                title="Install Artogram PWA"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}

            {/* Profile Dropdown */}
            {user && (
              <div className="relative ml-2">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center space-x-2 p-1 rounded-full border-2 border-[#E8DEC8] hover:border-[#C85A32] transition-colors focus:outline-none"
                >
                  <img
                    src={user.profile?.effective_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover bg-[#E8DEC8]"
                  />
                </button>

                {profileDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-[#FAF7F2] border border-[#E8DEC8] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setProfileDropdown(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#E8DEC8]">
                      <p className="text-sm font-bold text-[#3D271D] truncate">
                        {user.profile?.display_name || user.username}
                      </p>
                      <p className="text-xs text-[#55443B] truncate">@{user.username}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase font-bold rounded bg-[#E8DEC8] text-[#5C6B47]">
                        {user.profile?.role || 'User'}
                      </span>
                    </div>

                    <Link
                      to={`/profile/${user.username}`}
                      onClick={() => setProfileDropdown(false)}
                      className="px-4 py-2 text-sm text-[#3D271D] hover:bg-[#F4EFE6] flex items-center space-x-2"
                    >
                      <UserIcon className="w-4 h-4 text-[#C85A32]" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/permission-requests"
                      onClick={() => setProfileDropdown(false)}
                      className="px-4 py-2 text-sm text-[#3D271D] hover:bg-[#F4EFE6] flex items-center space-x-2"
                    >
                      <KeyRound className="w-4 h-4 text-[#5C6B47]" />
                      <span>Permission Requests</span>
                    </Link>

                    <Link
                      to="/my-reports"
                      onClick={() => setProfileDropdown(false)}
                      className="px-4 py-2 text-sm text-[#3D271D] hover:bg-[#F4EFE6] flex items-center space-x-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-[#C85A32]" />
                      <span>Misuse Reports</span>
                    </Link>

                    <Link
                      to="/edit-profile"
                      onClick={() => setProfileDropdown(false)}
                      className="px-4 py-2 text-sm text-[#3D271D] hover:bg-[#F4EFE6] flex items-center space-x-2"
                    >
                      <Compass className="w-4 h-4 text-[#55443B]" />
                      <span>Edit Profile</span>
                    </Link>

                    <div className="border-t border-[#E8DEC8] my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {installPrompt && (
              <button
                onClick={handleInstallClick}
                className="p-1.5 bg-[#5C6B47] text-[#FAF7F2] rounded-lg text-xs"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-[#3D271D] hover:bg-[#F4EFE6]"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#E8DEC8] bg-[#FAF7F2] px-4 pt-2 pb-6 space-y-2">
          {user ? (
            <>
              <div className="flex items-center space-x-3 py-3 border-b border-[#E8DEC8]">
                <img
                  src={user.profile?.effective_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover bg-[#E8DEC8]"
                />
                <div>
                  <p className="font-bold text-[#3D271D]">{user.profile?.display_name || user.username}</p>
                  <p className="text-xs text-[#55443B]">@{user.username} ({user.profile?.role})</p>
                </div>
              </div>

              <Link
                to="/feed"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-[#3D271D] hover:bg-[#F4EFE6]"
              >
                Home Feed
              </Link>
              <Link
                to="/explore"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-[#3D271D] hover:bg-[#F4EFE6]"
              >
                Explore Artworks
              </Link>
              <Link
                to="/verify-hash"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-[#3D271D] hover:bg-[#F4EFE6]"
              >
                Verify Hash
              </Link>
              <Link
                to="/register-artwork"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-semibold bg-[#C85A32] text-[#FAF7F2]"
              >
                + Register Artwork
              </Link>
              <Link
                to={`/profile/${user.username}`}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-[#3D271D] hover:bg-[#F4EFE6]"
              >
                My Profile
              </Link>
              <Link
                to="/saved"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-[#3D271D] hover:bg-[#F4EFE6]"
              >
                Saved Artworks
              </Link>
              <Link
                to="/notifications"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-[#3D271D] hover:bg-[#F4EFE6]"
              >
                Notifications ({unreadNotifications})
              </Link>
              <Link
                to="/permission-requests"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-[#3D271D] hover:bg-[#F4EFE6]"
              >
                Permission Requests
              </Link>
              <Link
                to="/my-reports"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-[#3D271D] hover:bg-[#F4EFE6]"
              >
                Misuse Reports
              </Link>

              {isModerator && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-bold bg-[#3D271D] text-[#FAF7F2]"
                >
                  Admin Control Panel
                </Link>
              )}

              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block text-center w-full py-2.5 rounded-lg border border-[#3D271D] font-semibold text-[#3D271D]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block text-center w-full py-2.5 rounded-lg bg-[#C85A32] text-[#FAF7F2] font-semibold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
