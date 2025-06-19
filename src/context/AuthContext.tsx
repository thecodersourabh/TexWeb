import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { getLogoutUri } from '../utils/getRedirectUri';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  logout: () => void;
  loginWithRedirect: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    loginWithRedirect,
    logout,
    user,
    isLoading,
  } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && user) {
      // You can add additional logic here, like fetching user data from your backend
    }
  }, [isAuthenticated, user]);

  const value = {
    isAuthenticated,
    user,
    loading: isLoading,
    logout: () => logout({ logoutParams: { returnTo: getLogoutUri() } }),
    loginWithRedirect,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
