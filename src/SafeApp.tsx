import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useTransition } from "react";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
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
import { AuthFlowDebugger } from "./components/AuthFlowDebugger";
import * as config from "./auth_config.json";
import { getRedirectUri } from "./utils/getRedirectUri";
import { deepLinkHandler } from "./utils/DeepLinkHandler";

// Configure future flags for React Router v7
const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

// Auth0 callback handler component that has access to useAuth0 hook
function Auth0CallbackHandler() {
  const { handleRedirectCallback, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    // Listen for our custom callback ready event
    const handleAuth0CallbackReady = async (event: any) => {
      console.log('🔐 Auth0CallbackHandler: Callback ready event received:', event.detail);
      
      try {
        console.log('✅ Auth0CallbackHandler: Current URL when processing callback:', window.location.href);
        
        // Since DeepLinkHandler has already set the URL correctly, 
        // let Auth0 SDK process it without additional parameters
        console.log('✅ Auth0CallbackHandler: Triggering handleRedirectCallback with current URL');
        
        const result = await handleRedirectCallback();
        console.log('✅ Auth0CallbackHandler: handleRedirectCallback completed successfully:', result);
        
        // Navigate to home after successful processing
        setTimeout(() => {
          console.log('🔄 Auth0CallbackHandler: Navigating to home page after successful auth');
          window.location.hash = '/';
        }, 1000);
        
      } catch (error) {
        console.error('❌ Auth0CallbackHandler: Error in handleRedirectCallback:', error);
        
        // Check if this is a CORS-related error (Failed to fetch)
        if (error instanceof Error && (
            error.message.includes('Failed to fetch') ||
            error.message.includes('CORS') ||
            error.message.includes('Network request failed')
        )) {
          console.log('🔧 Auth0CallbackHandler: CORS error detected! Using mobile workaround...');
          
          // Get and clear callback info
          const callbackInfo = sessionStorage.getItem('auth0_mobile_callback_info');
          if (callbackInfo) {
            console.log('📱 Auth0CallbackHandler: Found mobile callback info, clearing it');
            sessionStorage.removeItem('auth0_mobile_callback_info');
            
            // For CORS errors, try to get tokens silently since we have a valid auth code
            console.log('📱 Auth0CallbackHandler: Attempting silent token retrieval...');
            
            try {
              // Try to get access token silently - this might work even when CORS blocks the callback
              const token = await getAccessTokenSilently({
                cacheMode: 'off'
              });
              
              if (token) {
                console.log('✅ Auth0CallbackHandler: Silent token retrieval successful!');
                console.log('📱 Auth0CallbackHandler: Auth code was valid, navigating to profile');
                
                // Mark that we processed a callback recently
                sessionStorage.setItem('auth0_mobile_callback_processed_time', Date.now().toString());
                
                setTimeout(() => {
                  window.location.hash = '/profile';
                }, 1000);
              } else {
                console.log('⚠️ Auth0CallbackHandler: Silent token retrieval returned no token');
                // Still navigate since auth code was valid
                sessionStorage.setItem('auth0_mobile_callback_processed_time', Date.now().toString());
                setTimeout(() => {
                  window.location.hash = '/profile';
                }, 1000);
              }
            } catch (silentError) {
              console.log('❌ Auth0CallbackHandler: Silent token retrieval failed:', silentError);
              console.log('📱 Auth0CallbackHandler: Still proceeding - auth code was valid from Auth0');
              
              // Even if silent auth fails, the auth code was valid (we got the callback)
              // Navigate to profile and let Auth0 eventually sync
              sessionStorage.setItem('auth0_mobile_callback_processed_time', Date.now().toString());
              setTimeout(() => {
                window.location.hash = '/profile';
              }, 1000);
            }
          } else {
            console.log('📱 Auth0CallbackHandler: No callback info found, but proceeding anyway');
            // Even without callback info, if we got a callback URL, proceed
            sessionStorage.setItem('auth0_mobile_callback_processed_time', Date.now().toString());
            setTimeout(() => {
              window.location.hash = '/profile';
            }, 1000);
          }
          
        } else if (error instanceof Error && error.message && error.message.includes('Invalid state')) {
          console.log('🔄 Auth0CallbackHandler: State validation failed - this is common with mobile deep links');
          console.log('🔄 Auth0CallbackHandler: Attempting alternative approach...');
          
          // Check if we have the callback info stored
          const callbackInfo = sessionStorage.getItem('auth0_mobile_callback_info');
          if (callbackInfo) {
            console.log('📱 Auth0CallbackHandler: Found stored mobile callback info');
            const info = JSON.parse(callbackInfo);
            console.log('� Auth0CallbackHandler: Mobile callback info:', info);
            
            // For mobile, let the app naturally process the authentication
            // The presence of the authorization code should trigger Auth0's internal mechanisms
            console.log('📱 Auth0CallbackHandler: Letting Auth0 process naturally...');
            
            // Clear the callback info since we've processed it
            sessionStorage.removeItem('auth0_mobile_callback_info');
            
            // Navigate to home and let Auth0 sync naturally
            setTimeout(() => {
              console.log('📱 Auth0CallbackHandler: Navigating to home for natural Auth0 processing');
              window.location.hash = '/';
            }, 2000);
          } else {
            console.log('⚠️ Auth0CallbackHandler: No mobile callback info found, redirecting to home');
            window.location.hash = '/';
          }
        }
      }
    };

    window.addEventListener('auth0-callback-ready', handleAuth0CallbackReady);

    return () => {
      window.removeEventListener('auth0-callback-ready', handleAuth0CallbackReady);
    };
  }, [handleRedirectCallback]);

  // Log auth state changes for debugging
  useEffect(() => {
    console.log('🔐 Auth0CallbackHandler: Auth state changed:', { isAuthenticated, isLoading });
    
    // If we become authenticated, ensure we're on the right page
    if (isAuthenticated && !isLoading) {
      console.log('✅ Auth0CallbackHandler: User is now authenticated!');
      
      // Check if we're still on a callback URL and need to navigate
      if (window.location.hash.includes('code=') || window.location.hash.includes('state=')) {
        console.log('🔄 Auth0CallbackHandler: Still on callback URL, navigating to profile');
        setTimeout(() => {
          window.location.hash = '/profile';
        }, 500);
      }
    }
    
    // Additional monitoring for profile page without authentication
    if (!isAuthenticated && !isLoading && window.location.hash.includes('/profile')) {
      console.log('⚠️ Auth0CallbackHandler: On profile page but not authenticated - Auth0 may need more time to sync');
      
      // Check if we recently processed a callback
      const recentCallback = sessionStorage.getItem('auth0_mobile_callback_processed_time');
      if (recentCallback) {
        const timeSinceCallback = Date.now() - parseInt(recentCallback);
        console.log(`⏰ Auth0CallbackHandler: ${timeSinceCallback}ms since callback processing`);
        
        if (timeSinceCallback < 15000) { // Within 15 seconds
          console.log('⏳ Auth0CallbackHandler: Recent callback detected, waiting for Auth0 to sync...');
          
          // Try one more time to get access token silently
          if (timeSinceCallback > 5000 && timeSinceCallback < 6000) { // After 5 seconds, try once
            console.log('🔄 Auth0CallbackHandler: Attempting final silent auth...');
            getAccessTokenSilently({ cacheMode: 'off' }).then((token) => {
              if (token) {
                console.log('✅ Auth0CallbackHandler: Final silent auth successful!');
                // Force a re-render to update auth state
                window.location.reload();
              }
            }).catch((error) => {
              console.log('❌ Auth0CallbackHandler: Final silent auth failed:', error);
              // Redirect to auth page after timeout
              setTimeout(() => {
                console.log('🔄 Auth0CallbackHandler: Redirecting to auth page due to persistent auth failure');
                window.location.hash = '/auth?error=mobile_auth_failed';
              }, 3000);
            });
          }
        } else {
          console.log('❌ Auth0CallbackHandler: Auth0 sync timeout, callback may have failed');
          sessionStorage.removeItem('auth0_mobile_callback_processed_time');
          // Redirect to auth page
          setTimeout(() => {
            window.location.hash = '/auth?error=auth_timeout';
          }, 1000);
        }
      }
    }
  }, [isAuthenticated, isLoading]);

  return null; // This component doesn't render anything
}

function SafeApp() {
  const [isPending] = useTransition();
  const [authError, setAuthError] = useState<string | null>(null);
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

    // Initialize deep link handler for mobile platforms
    if (Capacitor.isNativePlatform()) {
      console.log('🔗 SafeApp: Initializing deep link handler for native platform');
      deepLinkHandler.initialize();
      
      // Add a listener to monitor deep link events
      const linkListener = (url: string) => {
        console.log('🔗 SafeApp: Deep link received:', url);
      };
      
      deepLinkHandler.addListener(linkListener);
      
      // Listen for the custom auth callback event
      const authCallbackListener = (event: any) => {
        console.log('🔐 SafeApp: Auth callback event received:', event.detail);
        
        // Force a re-render by updating a state variable
        setTimeout(() => {
          console.log('🔐 SafeApp: Triggering auth state refresh...');
          // Trigger any necessary state updates here
        }, 100);
      };
      
      // Listen for auth navigation complete event
      const authNavigationListener = () => {
        console.log('🔐 SafeApp: Auth navigation complete event received');
      };
      
      // Listen for auth state refresh event
      const authStateRefreshListener = () => {
        console.log('🔐 SafeApp: Auth state refresh event received');
        // Force a component update by triggering a state change
        setAuthError(null); // This will cause a re-render
      };
      
      // Listen for auth0 callback ready event from DeepLinkHandler
      const auth0CallbackReadyListener = async (event: any) => {
        console.log('🔐 SafeApp: Auth0 callback ready event received (fallback):', event.detail);
        console.log('🔐 SafeApp: Current URL after callback setup:', window.location.href);
        console.log('ℹ️ SafeApp: Callback processing is now handled by Auth0CallbackHandler component');
      };
      
      window.addEventListener('auth0-callback-processed', authCallbackListener);
      window.addEventListener('auth-navigation-complete', authNavigationListener);
      window.addEventListener('auth-state-refresh', authStateRefreshListener);
      window.addEventListener('auth0-callback-ready', auth0CallbackReadyListener);
      
      return () => {
        clearTimeout(timer);
        console.log('🧹 SafeApp: Cleaning up deep link handler');
        deepLinkHandler.removeListener(linkListener);
        window.removeEventListener('auth0-callback-processed', authCallbackListener);
        window.removeEventListener('auth-navigation-complete', authNavigationListener);
        window.removeEventListener('auth-state-refresh', authStateRefreshListener);
        window.removeEventListener('auth0-callback-ready', auth0CallbackReadyListener);
        deepLinkHandler.cleanup();
      };
    } else {
      console.log('🌐 SafeApp: Running on web platform, skipping deep link initialization');
    }

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Cross-platform auth configuration
  const getAuthConfig = () => {
    console.log('⚙️ SafeApp: Generating auth configuration...');
    
    try {
      const baseConfig = {
        audience: config.authorizationParams.audience,
        scope: "openid profile email",
      };

      if (Capacitor.isNativePlatform()) {
        // Mobile app configuration
        const mobileConfig = {
          ...baseConfig,
          redirect_uri: 'com.texweb.app://callback',
        };
        console.log('📱 SafeApp: Mobile auth config:', mobileConfig);
        return mobileConfig;
      } else {
        // Web configuration
        const webConfig = {
          ...baseConfig,
          redirect_uri: getRedirectUri(),
        };
        console.log('🌐 SafeApp: Web auth config:', webConfig);
        return webConfig;
      }
    } catch (error) {
      console.error('❌ SafeApp: Auth config error:', error);
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
    console.log('🔄 SafeApp: Handling redirect callback...', appState);
    console.log('🔄 SafeApp: Current URL when callback triggered:', window.location.href);
    
    try {
      if (Capacitor.isNativePlatform()) {
        // Mobile: Use React Router navigation
        const redirectUrl = appState?.returnTo || '/';
        console.log('📱 SafeApp: Mobile redirect to:', redirectUrl);
        
        // For mobile, ensure we navigate to the home route after successful auth
        setTimeout(() => {
          console.log('📱 SafeApp: Executing mobile navigation after delay');
          window.location.hash = redirectUrl;
          
          // Check authentication state after navigation
          setTimeout(() => {
            console.log('📱 SafeApp: Post-navigation auth check');
            // Trigger a custom event to force re-render if needed
            window.dispatchEvent(new CustomEvent('auth-navigation-complete'));
          }, 500);
        }, 100);
      } else {
        // Web: Use window.location
        const redirectUrl = appState?.returnTo || window.location.pathname;
        console.log('🌐 SafeApp: Web redirect to:', redirectUrl);
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error('❌ SafeApp: Redirect callback error:', error);
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
          {/* Add the callback handler that has access to useAuth0 hook */}
          <Auth0CallbackHandler />
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
                  {/* Enhanced Auth Flow Debugger - always available for debugging */}
                  <AuthFlowDebugger 
                    isVisible={debuggerVisible} 
                    onToggle={() => setDebuggerVisible(!debuggerVisible)}
                  />
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
