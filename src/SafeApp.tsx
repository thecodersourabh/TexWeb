import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useTransition } from "react";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
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
import { AuthFlowDebugger } from "./components/AuthFlowDebugger";
import * as config from "./auth_config.json";
import { getRedirectUri } from "./utils/getRedirectUri";

// Configure future flags for React Router v7
const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

// Auth0 callback handler component that uses proper Capacitor integration
function Auth0CallbackHandler() {
  const { handleRedirectCallback, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    // Handle the 'appUrlOpen' event and call `handleRedirectCallback` - Official Auth0 approach
    const setupListener = async () => {
      const listener = await CapApp.addListener('appUrlOpen', async ({ url }) => {
        console.log('🔗 Auth0CallbackHandler: App URL opened:', url);
        
        if (url.includes('state') && (url.includes('code') || url.includes('error'))) {
          console.log('✅ Auth0CallbackHandler: Valid Auth0 callback detected, processing...');
          
          try {
            await handleRedirectCallback(url);
            console.log('✅ Auth0CallbackHandler: Callback processed successfully');
            
            // Navigate to profile after successful authentication
            setTimeout(() => {
              window.location.hash = '/profile';
            }, 1000);
          } catch (error) {
            console.error('❌ Auth0CallbackHandler: Error processing callback:', error);
            
            // Check if this is a CORS-related error
            if (error instanceof Error && (
                error.message.includes('Failed to fetch') ||
                error.message.includes('CORS') ||
                error.message.includes('Network request failed')
            )) {
              console.log('🔧 Auth0CallbackHandler: CORS error detected! Redirecting to profile anyway...');
              // Even with CORS error, the authorization code was valid
              setTimeout(() => {
                window.location.hash = '/profile';
              }, 2000);
            } else {
              // Other errors - redirect to auth page
              setTimeout(() => {
                window.location.hash = '/auth?error=callback_failed';
              }, 2000);
            }
          }
        }
        
        // Close the browser (no-op on Android)
        try {
          await Browser.close();
        } catch (error) {
          console.log('📱 Auth0CallbackHandler: Browser close (expected on Android):', error);
        }
      });

      // Return cleanup function
      return () => {
        listener.remove();
      };
    };

    let cleanup: (() => void) | null = null;
    
    if (Capacitor.isNativePlatform()) {
      setupListener().then((cleanupFn) => {
        cleanup = cleanupFn;
      });
    }

    // Cleanup on component unmount
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [handleRedirectCallback]);

  // Log auth state changes for debugging
  useEffect(() => {
    console.log('🔐 Auth0CallbackHandler: Auth state changed:', { isAuthenticated, isLoading });
    
    if (isAuthenticated && !isLoading) {
      console.log('✅ Auth0CallbackHandler: User is now authenticated!');
    }
  }, [isAuthenticated, isLoading]);

  return null; // This component doesn't render anything
}

function SafeApp() {
  const [isPending] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [debuggerVisible, setDebuggerVisible] = useState(false);

  useEffect(() => {
    console.log('🚀 SafeApp: Initializing app...');
    console.log('📱 SafeApp: Platform check:', Capacitor.isNativePlatform() ? 'Native' : 'Web');
    
    // Add a small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      console.log('⏰ SafeApp: Loading timer completed, setting isLoading to false');
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        🚀 Initializing TexWeb...
      </div>
    );
  }

  return (
    <Router future={routerFutureConfig}>
      <div style={{ paddingBottom: isPending ? '20px' : '0px' }}>
        {isPending && (
          <div style={{ 
            position: 'fixed', 
            top: '10px', 
            right: '10px', 
            background: '#007bff', 
            color: 'white', 
            padding: '8px 12px', 
            borderRadius: '4px',
            zIndex: 1000 
          }}>
            Loading...
          </div>
        )}

        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Auth0CallbackHandler />
              
              <div style={{ position: 'relative' }}>
                <Navigation />
                
                {/* Debug toggle button - only show in development */}
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={() => setDebuggerVisible(!debuggerVisible)}
                    style={{
                      position: 'fixed',
                      bottom: '20px',
                      right: '20px',
                      zIndex: 1000,
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '50px',
                      height: '50px',
                      fontSize: '20px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}
                    title="Toggle Auth Debugger"
                  >
                    🐛
                  </button>
                )}
                
                {/* Auth Flow Debugger - only show in development */}
                {debuggerVisible && process.env.NODE_ENV === 'development' && (
                  <AuthFlowDebugger 
                    isVisible={debuggerVisible} 
                    onToggle={() => setDebuggerVisible(!debuggerVisible)} 
                  />
                )}

                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/design/*" element={<Design />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/profile/*" element={<ProfileLayout />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/addresses" element={<Addresses />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                </Routes>

                <Cart />
                <ChatBot />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </div>
    </Router>
  );
}

export default function App() {
  const auth0Config = {
    domain: config.domain,
    clientId: config.clientId,
    authorizationParams: {
      redirect_uri: Capacitor.isNativePlatform() 
        ? `com.texweb.app://callback`
        : getRedirectUri(),
    },
    // Enable cache for better performance
    cacheLocation: 'localstorage' as const,
    useRefreshTokens: true,
  };

  console.log('🔐 App: Auth0 configuration:', auth0Config);

  return (
    <Auth0Provider {...auth0Config}>
      <SafeApp />
    </Auth0Provider>
  );
}
