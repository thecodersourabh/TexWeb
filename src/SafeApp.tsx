import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useTransition } from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import { Capacitor } from '@capacitor/core';
import { Navigation } from "./components/Navigation";
import { ChatBot } from "./components/ChatBot";
import { Cart } from "./components/Cart";
import { About } from "./pages/About";
import { Home } from "./pages/Home";
import { Design } from "./pages/Design/Design";
import { Auth } from "./pages/Auth/Auth";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ProfileLayout } from "./pages/Profile/ProfileLayout";
import { Orders } from "./pages/Orders/Orders";
import { Addresses } from "./pages/Profile/Addresses/Addresses";
import { Wishlist } from "./pages/Profile/Wishlist/Wishlist";
import * as config from "./auth_config.json";
import { getRedirectUri } from "./utils/getRedirectUri";
import { deepLinkHandler } from "./utils/DeepLinkHandler";

// Configure future flags for React Router v7
const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

function SafeApp() {
  const [isPending] = useTransition();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Initialize deep link handler for mobile platforms
    if (Capacitor.isNativePlatform()) {
      deepLinkHandler.initialize();
    }

    return () => {
      clearTimeout(timer);
      if (Capacitor.isNativePlatform()) {
        deepLinkHandler.cleanup();
      }
    };
  }, []);

  // Cross-platform auth configuration
  const getAuthConfig = () => {
    try {
      const baseConfig = {
        audience: config.authorizationParams.audience,
        scope: "openid profile email",
      };

      if (Capacitor.isNativePlatform()) {
        // Mobile app configuration
        return {
          ...baseConfig,
          redirect_uri: 'com.texweb.app://callback',
        };
      } else {
        // Web configuration
        return {
          ...baseConfig,
          redirect_uri: getRedirectUri(),
        };
      }
    } catch (error) {
      console.error('Auth config error:', error);
      setAuthError('Authentication configuration error');
      return {
        audience: '',
        scope: "openid profile email",
        redirect_uri: window.location.origin,
      };
    }
  };

  // Cross-platform redirect handling
  const handleRedirectCallback = (appState: any) => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Mobile: Use React Router navigation
        window.history.replaceState({}, '', appState?.returnTo || '/');
      } else {
        // Web: Use window.location
        window.location.href = appState?.returnTo || window.location.pathname;
      }
    } catch (error) {
      console.error('Redirect callback error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading TexWeb...</p>
          <p className="text-sm text-gray-500 mt-2">Platform: {Capacitor.getPlatform()}</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4 bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h1 className="text-lg font-semibold text-red-800 mb-2">
              Authentication Error
            </h1>
            <p className="text-red-600 mb-4">
              {authError}
            </p>
            <button
              onClick={() => {
                setAuthError(null);
                setIsLoading(true);
                window.location.reload();
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  try {
    return (
      <Router future={routerFutureConfig}>
        <Auth0Provider
          domain={config.domain}
          clientId={config.clientId}
          authorizationParams={getAuthConfig()}
          cacheLocation="localstorage"
          onRedirectCallback={handleRedirectCallback}
          useRefreshTokens={true}
          useRefreshTokensFallback={false}
        >
          <CartProvider>
            <AuthProvider>
              <WishlistProvider>
                <div className="min-h-screen bg-white">
                  <Navigation />
                  {isPending && (
                    <div className="fixed top-0 left-0 w-full h-1">
                      <div
                        className="h-full bg-rose-600 animate-[loading_1s_ease-in-out_infinite]"
                        style={{ width: "25%" }}
                      />
                    </div>
                  )}
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/design/*" element={<Design />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/profile" element={<ProfileLayout />}>
                      <Route path="my-designs" element={<Design />} />
                      <Route path="wishlist" element={<Wishlist />} />
                      <Route
                        path="payments"
                        element={<div>Payments Coming Soon</div>}
                      />
                      <Route path="addresses" element={<Addresses />} />
                      <Route
                        path="settings"
                        element={<div>Settings Coming Soon</div>}
                      />
                    </Route>
                  </Routes>
                  <Cart />
                  <ChatBot />
                </div>
              </WishlistProvider>
            </AuthProvider>
          </CartProvider>
        </Auth0Provider>
      </Router>
    );
  } catch (error) {
    console.error('App render error:', error);
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-center">
            <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
            <h1 className="text-lg font-semibold text-yellow-800 mb-2">
              Application Error
            </h1>
            <p className="text-yellow-600 mb-4">
              Something went wrong while loading the application.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default SafeApp;
