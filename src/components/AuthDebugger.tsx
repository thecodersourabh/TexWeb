import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../context/AuthContext';
import { Capacitor } from '@capacitor/core';

interface AuthDebugInfo {
  timestamp: string;
  platform: string;
  auth0State: {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any;
    error: any;
  };
  authContextState: {
    isAuthenticated: boolean;
    loading: boolean;
    userCreated: boolean;
    creatingUser: boolean;
  };
  urlInfo: {
    href: string;
    hash: string;
    search: string;
  };
  localStorageKeys: string[];
}

export const AuthDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [deepLinkHistory, setDeepLinkHistory] = useState<string[]>([]);
  
  const auth0 = useAuth0();
  const authContext = useAuth();

  const updateDebugInfo = () => {
    const info: AuthDebugInfo = {
      timestamp: new Date().toISOString(),
      platform: Capacitor.isNativePlatform() ? `Native (${Capacitor.getPlatform()})` : 'Web',
      auth0State: {
        isAuthenticated: auth0.isAuthenticated,
        isLoading: auth0.isLoading,
        user: auth0.user,
        error: auth0.error,
      },
      authContextState: {
        isAuthenticated: authContext.isAuthenticated,
        loading: authContext.loading,
        userCreated: authContext.userCreated,
        creatingUser: authContext.creatingUser,
      },
      urlInfo: {
        href: window.location.href,
        hash: window.location.hash,
        search: window.location.search,
      },
      localStorageKeys: Object.keys(localStorage).filter(key => 
        key.startsWith('auth0') || key.includes('@@auth0')
      ),
    };
    
    setDebugInfo(info);
  };

  useEffect(() => {
    // Update debug info immediately
    updateDebugInfo();
    
    // Set up periodic updates
    const interval = setInterval(updateDebugInfo, 2000);
    
    // Listen for deep link events (if needed in the future)
    // const handleDeepLink = (event: any) => {
    //   const url = event.detail?.url || 'Unknown URL';
    //   setDeepLinkHistory(prev => [`${new Date().toISOString()}: ${url}`, ...prev.slice(0, 9)]);
    // };
    
    // Listen for auth callback events
    const handleAuthCallback = (event: any) => {
      console.log('🔐 AuthDebugger: Auth callback event detected:', event.detail);
      setDeepLinkHistory(prev => [
        `${new Date().toISOString()}: AUTH CALLBACK - ${JSON.stringify(event.detail)}`,
        ...prev.slice(0, 9)
      ]);
      updateDebugInfo();
    };
    
    window.addEventListener('auth0-callback-processed', handleAuthCallback);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('auth0-callback-processed', handleAuthCallback);
    };
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    updateDebugInfo();
  }, [auth0.isAuthenticated, auth0.isLoading, authContext.isAuthenticated, authContext.loading]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-2 rounded-full text-xs z-50"
        style={{ fontSize: '10px' }}
      >
        🐛 Auth Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">🐛 Authentication Debugger</h2>
          <button
            onClick={() => setIsVisible(false)}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
          >
            Close
          </button>
        </div>
        
        {debugInfo && (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-blue-600">System Info</h3>
              <p><strong>Platform:</strong> {debugInfo.platform}</p>
              <p><strong>Timestamp:</strong> {debugInfo.timestamp}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-600">URL Info</h3>
              <p><strong>Current URL:</strong> {debugInfo.urlInfo.href}</p>
              <p><strong>Hash:</strong> {debugInfo.urlInfo.hash || 'None'}</p>
              <p><strong>Search:</strong> {debugInfo.urlInfo.search || 'None'}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-600">Auth0 State</h3>
              <p><strong>Authenticated:</strong> {debugInfo.auth0State.isAuthenticated ? '✅' : '❌'}</p>
              <p><strong>Loading:</strong> {debugInfo.auth0State.isLoading ? '⏳' : '✅'}</p>
              <p><strong>User:</strong> {debugInfo.auth0State.user?.email || 'None'}</p>
              <p><strong>Error:</strong> {debugInfo.auth0State.error?.message || 'None'}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-600">Auth Context State</h3>
              <p><strong>Authenticated:</strong> {debugInfo.authContextState.isAuthenticated ? '✅' : '❌'}</p>
              <p><strong>Loading:</strong> {debugInfo.authContextState.loading ? '⏳' : '✅'}</p>
              <p><strong>User Created:</strong> {debugInfo.authContextState.userCreated ? '✅' : '❌'}</p>
              <p><strong>Creating User:</strong> {debugInfo.authContextState.creatingUser ? '⏳' : '✅'}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-600">Local Storage</h3>
              {debugInfo.localStorageKeys.length > 0 ? (
                <ul className="list-disc ml-4">
                  {debugInfo.localStorageKeys.map(key => (
                    <li key={key}>{key}</li>
                  ))}
                </ul>
              ) : (
                <p>No auth-related keys found</p>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-600">Deep Link History</h3>
              {deepLinkHistory.length > 0 ? (
                <ul className="list-disc ml-4 space-y-1">
                  {deepLinkHistory.map((entry, index) => (
                    <li key={index} className="text-xs font-mono">{entry}</li>
                  ))}
                </ul>
              ) : (
                <p>No deep links processed yet</p>
              )}
            </div>
            
            <div className="flex gap-2 pt-4">
              <button
                onClick={updateDebugInfo}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              >
                Refresh
              </button>
              <button
                onClick={() => {
                  console.log('🐛 Manual Auth Debug Info:', debugInfo);
                  console.log('🐛 Deep Link History:', deepLinkHistory);
                }}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
              >
                Log to Console
              </button>
              <button
                onClick={() => {
                  setDeepLinkHistory([]);
                }}
                className="bg-orange-500 text-white px-3 py-1 rounded text-sm"
              >
                Clear History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
