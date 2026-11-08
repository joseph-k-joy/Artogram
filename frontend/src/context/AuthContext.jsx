import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('artogram_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('artogram_access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await client.get('/api/auth/me/');
      setUser(res.data);
      localStorage.setItem('artogram_user', JSON.stringify(res.data));
    } catch (err) {
      console.warn('Failed to fetch auth me:', err);
      // If token is invalid, log out
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleLogoutEvent = () => {
      setUser(null);
    };
    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, []);

  const login = async (username, password) => {
    const res = await client.post('/api/auth/login/', { username, password });
    const { user: userData, tokens } = res.data;
    localStorage.setItem('artogram_access_token', tokens.access);
    localStorage.setItem('artogram_refresh_token', tokens.refresh);
    localStorage.setItem('artogram_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await client.post('/api/auth/register/', formData);
    const { user: userData, tokens } = res.data;
    localStorage.setItem('artogram_access_token', tokens.access);
    localStorage.setItem('artogram_refresh_token', tokens.refresh);
    localStorage.setItem('artogram_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('artogram_access_token');
    localStorage.removeItem('artogram_refresh_token');
    localStorage.removeItem('artogram_user');
    setUser(null);
  };

  const isArtist = user?.profile?.role === 'artist';
  const isAdmin = user?.is_staff || user?.profile?.role === 'admin';
  const isModerator = isAdmin || user?.profile?.role === 'moderator';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshMe: fetchCurrentUser,
        isArtist,
        isAdmin,
        isModerator,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
