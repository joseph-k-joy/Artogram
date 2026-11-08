import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import FeedPage from './pages/FeedPage';
import ExplorePage from './pages/ExplorePage';
import ArtworkDetailPage from './pages/ArtworkDetailPage';
import PublicProvenancePage from './pages/PublicProvenancePage';
import IdentityCardPage from './pages/IdentityCardPage';
import ArtistProfilePage from './pages/ArtistProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import RegisterArtworkPage from './pages/RegisterArtworkPage';
import SavedArtworksPage from './pages/SavedArtworksPage';
import NotificationsPage from './pages/NotificationsPage';
import PermissionRequestsPage from './pages/PermissionRequestsPage';
import MisuseReportsPage from './pages/MisuseReportsPage';
import CommunitiesPage from './pages/CommunitiesPage';
import VerifyHashPage from './pages/VerifyHashPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Admin Route wrapper
const AdminRoute = ({ children }) => {
  const { user, isModerator, loading } = useAuth();
  if (loading) return null;
  if (!user || !isModerator) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#FAF7F2] text-[#3D271D]">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/verify-hash" element={<VerifyHashPage />} />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/artworks/:id" element={<ArtworkDetailPage />} />
              <Route path="/artworks/:provenanceId/provenance/" element={<PublicProvenancePage />} />
              <Route path="/artworks/:provenanceId/identity-card/" element={<IdentityCardPage />} />
              <Route path="/profile/:username" element={<ArtistProfilePage />} />

              {/* Authenticated Routes */}
              <Route
                path="/feed"
                element={
                  <ProtectedRoute>
                    <FeedPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/register-artwork"
                element={
                  <ProtectedRoute>
                    <RegisterArtworkPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-profile"
                element={
                  <ProtectedRoute>
                    <EditProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <SavedArtworksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/permission-requests"
                element={
                  <ProtectedRoute>
                    <PermissionRequestsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-reports"
                element={
                  <ProtectedRoute>
                    <MisuseReportsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
