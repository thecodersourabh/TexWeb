import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface AuthFlowDebuggerProps {
  isVisible: boolean;
  onToggle: () => void;
}

interface CallbackInfo {
  code?: string;
  state?: string;
  originalUrl?: string;
  timestamp?: string;
}

interface DebugInfo {
  auth0State: any;
  urlInfo: {
    current: string;
    hash: string;
    search: string;
  };
  storageInfo: {
    localStorage: Record<string, any>;
    sessionStorage: Record<string, any>;
  };
  callbackInfo?: CallbackInfo;
}

export const AuthFlowDebugger: React.FC<AuthFlowDebuggerProps> = ({ isVisible, onToggle }) => {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    error,
    getAccessTokenSilently,
    loginWithRedirect,
    logout
  } = useAuth0();
  
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const refreshDebugInfo = () => {
    try {
      // Get current URL info
      const urlInfo = {
        current: window.location.href,
        hash: window.location.hash,
        search: window.location.search
      };

      // Get localStorage info
      const localStorage: Record<string, any> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          try {
            const value = window.localStorage.getItem(key);
            localStorage[key] = value ? JSON.parse(value) : value;
          } catch {
            localStorage[key] = window.localStorage.getItem(key);
          }
        }
      }

      // Get sessionStorage info
      const sessionStorage: Record<string, any> = {};
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key) {
          try {
            const value = window.sessionStorage.getItem(key);
            sessionStorage[key] = value ? JSON.parse(value) : value;
          } catch {
            sessionStorage[key] = window.sessionStorage.getItem(key);
          }
        }
      }

      // Get callback info from session storage
      let callbackInfo: CallbackInfo | undefined;
      try {
        const callbackData = window.sessionStorage.getItem('auth0_mobile_callback_info');
        if (callbackData) {
          callbackInfo = JSON.parse(callbackData);
        }
      } catch (error) {
        console.error('Error parsing callback info:', error);
      }

      const auth0State = {
        isAuthenticated,
        isLoading,
        user: user ? {
          email: user.email,
          name: user.name,
          sub: user.sub,
          email_verified: user.email_verified
        } : null,
        error: error ? {
          message: error.message,
          name: error.name
        } : null
      };

      setDebugInfo({
        auth0State,
        urlInfo,
        storageInfo: {
          localStorage,
          sessionStorage
        },
        callbackInfo
      });

      setRefreshCount(count => count + 1);
      console.log('🔍 AuthFlowDebugger: Debug info refreshed', { auth0State, urlInfo });
    } catch (error) {
      console.error('Error refreshing debug info:', error);
    }
  };

  useEffect(() => {
    if (isVisible) {
      refreshDebugInfo();
      const interval = setInterval(refreshDebugInfo, 2000); // Refresh every 2 seconds
      return () => clearInterval(interval);
    }
  }, [isVisible, isAuthenticated, isLoading, user, error]);

  const testAuth0Methods = async () => {
    try {
      console.log('🧪 Testing Auth0 methods...');
      
      if (isAuthenticated) {
        console.log('✅ User is authenticated, testing getAccessTokenSilently...');
        const token = await getAccessTokenSilently();
        console.log('✅ Got access token:', token.substring(0, 20) + '...');
      } else {
        console.log('❌ User not authenticated');
      }
    } catch (error) {
      console.error('❌ Error testing Auth0 methods:', error);
    }
  };

  const clearAllStorage = () => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    console.log('🧹 Cleared all storage');
    refreshDebugInfo();
  };

  const simulateLogin = () => {
    console.log('🔐 Simulating login...');
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin + '/#/'
      }
    });
  };

  const simulateLogout = () => {
    console.log('🚪 Simulating logout...');
    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 z-50"
      >
        🔍 Debug Auth
      </button>
    );
  }

  return (
    <div className="fixed inset-4 bg-black bg-opacity-90 text-white p-4 rounded-lg shadow-2xl z-50 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">🔍 Auth Flow Debugger</h2>
        <div className="flex gap-2">
          <button
            onClick={refreshDebugInfo}
            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
          >
            🔄 Refresh ({refreshCount})
          </button>
          <button
            onClick={onToggle}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
          >
            ❌ Close
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Auth0 State */}
        <div className="bg-gray-800 p-3 rounded">
          <h3 className="font-semibold mb-2 text-green-400">🔐 Auth0 State</h3>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(debugInfo?.auth0State, null, 2)}
          </pre>
        </div>

        {/* URL Info */}
        <div className="bg-gray-800 p-3 rounded">
          <h3 className="font-semibold mb-2 text-blue-400">🌐 URL Info</h3>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(debugInfo?.urlInfo, null, 2)}
          </pre>
        </div>

        {/* Callback Info */}
        {debugInfo?.callbackInfo && (
          <div className="bg-gray-800 p-3 rounded">
            <h3 className="font-semibold mb-2 text-yellow-400">📱 Mobile Callback Info</h3>
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(debugInfo.callbackInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Storage Info */}
        <div className="bg-gray-800 p-3 rounded">
          <h3 className="font-semibold mb-2 text-purple-400">💾 Storage Info</h3>
          <div className="text-xs">
            <div className="mb-2">
              <strong>LocalStorage:</strong>
              <pre className="overflow-auto max-h-20">
                {JSON.stringify(debugInfo?.storageInfo.localStorage, null, 2)}
              </pre>
            </div>
            <div>
              <strong>SessionStorage:</strong>
              <pre className="overflow-auto max-h-20">
                {JSON.stringify(debugInfo?.storageInfo.sessionStorage, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={testAuth0Methods}
          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
        >
          🧪 Test Auth0 Methods
        </button>
        <button
          onClick={clearAllStorage}
          className="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-sm"
        >
          🧹 Clear Storage
        </button>
        <button
          onClick={simulateLogin}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
        >
          🔐 Test Login
        </button>
        {isAuthenticated && (
          <button
            onClick={simulateLogout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
          >
            🚪 Test Logout
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm"
        >
          🔄 Reload Page
        </button>
      </div>

      {/* Real-time Log */}
      <div className="mt-4 bg-gray-900 p-3 rounded">
        <h3 className="font-semibold mb-2 text-gray-300">📋 Quick Status</h3>
        <div className="text-sm space-y-1">
          <div>🔐 Authenticated: <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>{isAuthenticated ? 'YES' : 'NO'}</span></div>
          <div>⏳ Loading: <span className={isLoading ? 'text-yellow-400' : 'text-gray-400'}>{isLoading ? 'YES' : 'NO'}</span></div>
          <div>👤 User Email: <span className="text-blue-400">{user?.email || 'None'}</span></div>
          <div>❌ Error: <span className="text-red-400">{error?.message || 'None'}</span></div>
          <div>📱 Has Callback: <span className={debugInfo?.callbackInfo ? 'text-green-400' : 'text-gray-400'}>{debugInfo?.callbackInfo ? 'YES' : 'NO'}</span></div>
        </div>
      </div>
    </div>
  );
};
