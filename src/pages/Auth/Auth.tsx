import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../../context/AuthContext';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import * as config from '../../auth_config.json';

export const Auth = () => {
  // Always call hooks at the top level
  const { userCreated, creatingUser } = useAuth();
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

  // Handle login with proper Capacitor integration
  const handleLogin = async () => {
    if (Capacitor.isNativePlatform()) {
      // Use Browser plugin for mobile - Official Auth0 approach
      console.log('📱 Auth: Starting mobile login with Browser plugin');
      
      const authUrl = `https://${config.domain}/authorize?` +
        `response_type=code&` +
        `client_id=${config.clientId}&` +
        `redirect_uri=${encodeURIComponent('com.texweb.app://dev-arrows.au.auth0.com/capacitor/com.texweb.app/callback')}&` +
        `scope=openid%20profile%20email&` +
        `state=${Math.random().toString(36).substring(2)}`;
      
      console.log('🔗 Auth: Opening browser with URL:', authUrl);
      
      await Browser.open({
        url: authUrl,
        windowName: '_self'
      });
    } else {
      // Use regular Auth0 redirect for web
      console.log('🌐 Auth: Starting web login with Auth0 redirect');
      loginWithRedirect();
    }
  };

  // Handle logout with proper Capacitor integration  
  const handleLogout = async () => {
    if (Capacitor.isNativePlatform()) {
      // Use Browser plugin for mobile logout
      console.log('📱 Auth: Starting mobile logout');
      
      const logoutUrl = `https://${config.domain}/v2/logout?` +
        `client_id=${config.clientId}&` +
        `returnTo=${encodeURIComponent('com.texweb.app://dev-arrows.au.auth0.com/capacitor/com.texweb.app/callback')}`;
      
      await Browser.open({
        url: logoutUrl,
        windowName: '_self'
      });
    } else {
      // Use regular Auth0 logout for web
      logout({ logoutParams: { returnTo: window.location.origin } });
    }
  };

  if (isLoading || creatingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 mx-auto"></div>
          {creatingUser && (
            <p className="mt-4 text-sm text-gray-600">Setting up your account...</p>
          )}
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="z-10 max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-2xl">
          <div className="text-center">
            <img
              src={user?.picture}
              alt={user?.name}
              className="mx-auto h-24 w-24 rounded-full"
            />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome, {user?.name}!
            </h2>
            <p className="mt-2 text-sm text-gray-600">{user?.email}</p>
            {userCreated && (
              <p className="mt-2 text-xs text-green-600"> Account synced with database</p>
            )}
          </div>
          <div className="mt-8">
            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1528578950694-9f79b45a3397?auto=format&fit=crop&q=80")',
        }}
      />
      <div className="z-10 max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to TexWeb
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please sign in to continue
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={handleLogin}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors duration-200"
          >
            Sign In / Sign Up with Auth0
          </button>
        </div>
      </div>
    </div>
  );
};
