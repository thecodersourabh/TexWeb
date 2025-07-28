import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export class DeepLinkHandler {
  private static instance: DeepLinkHandler;
  private listeners: Array<(url: string) => void> = [];

  private constructor() {}

  public static getInstance(): DeepLinkHandler {
    if (!DeepLinkHandler.instance) {
      DeepLinkHandler.instance = new DeepLinkHandler();
    }
    return DeepLinkHandler.instance;
  }

  public initialize(): void {
    console.log('🔧 DeepLinkHandler: Initializing...');
    
    if (Capacitor.isNativePlatform()) {
      console.log('📱 DeepLinkHandler: Running on native platform:', Capacitor.getPlatform());
      
      // Listen for app state changes and URL opens
      App.addListener('appUrlOpen', (event) => {
        console.log('🔗 DeepLinkHandler: App URL opened:', event.url);
        this.handleDeepLink(event.url);
      });

      // Check if app was opened with a URL
      App.getLaunchUrl().then((result) => {
        console.log('🚀 DeepLinkHandler: Launch URL check result:', result);
        if (result?.url) {
          console.log('🔗 DeepLinkHandler: App launched with URL:', result.url);
          this.handleDeepLink(result.url);
        } else {
          console.log('ℹ️ DeepLinkHandler: No launch URL found');
        }
      }).catch((error) => {
        console.error('❌ DeepLinkHandler: Error getting launch URL:', error);
      });
    } else {
      console.log('🌐 DeepLinkHandler: Running on web platform - deep link handling disabled');
    }
  }

  private handleDeepLink(url: string): void {
    console.log('🔄 DeepLinkHandler: Processing deep link:', url);
    
    // Check if this is an Auth0 callback
    if (url.includes('com.texweb.app://callback')) {
      console.log('🔐 DeepLinkHandler: Detected Auth0 callback URL');
      this.processAuth0Callback(url);
    } else {
      console.log('ℹ️ DeepLinkHandler: Not an Auth0 callback URL');
    }

    // Notify all listeners
    console.log(`📢 DeepLinkHandler: Notifying ${this.listeners.length} listeners`);
    this.listeners.forEach((listener, index) => {
      console.log(`📢 DeepLinkHandler: Notifying listener ${index + 1}`);
      try {
        listener(url);
      } catch (error) {
        console.error(`❌ DeepLinkHandler: Error in listener ${index + 1}:`, error);
      }
    });
  }

  private processAuth0Callback(url: string): void {
    console.log('🔐 DeepLinkHandler: Starting Auth0 callback processing...');
    console.log('🔐 DeepLinkHandler: Original URL:', url);
    
    try {
      // Parse the URL to extract parameters
      console.log('🔍 DeepLinkHandler: Parsing URL...');
      const urlObj = new URL(url);
      console.log('🔍 DeepLinkHandler: URL object created:', {
        protocol: urlObj.protocol,
        host: urlObj.host,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash
      });
      
      let params: URLSearchParams;
      
      // Auth0 might send params in hash or query
      if (urlObj.hash && urlObj.hash.includes('=')) {
        console.log('🔍 DeepLinkHandler: Found parameters in hash');
        params = new URLSearchParams(urlObj.hash.substring(1));
      } else if (urlObj.search) {
        console.log('🔍 DeepLinkHandler: Found parameters in search');
        params = new URLSearchParams(urlObj.search.substring(1));
      } else {
        console.log('🔍 DeepLinkHandler: Extracting parameters from full URL');
        // Extract from the full URL if no standard format
        const paramString = url.split('?')[1] || url.split('#')[1];
        console.log('🔍 DeepLinkHandler: Extracted param string:', paramString);
        params = new URLSearchParams(paramString);
      }

      // Log all parameters found
      console.log('🔍 DeepLinkHandler: All URL parameters:');
      for (const [key, value] of params.entries()) {
        console.log(`  ${key}: ${value}`);
      }

      // Extract Auth0 parameters
      const code = params.get('code');
      const error = params.get('error');
      const errorDescription = params.get('error_description');
      const accessToken = params.get('access_token');
      const state = params.get('state');

      console.log('🔍 DeepLinkHandler: Auth0 parameters extracted:', {
        hasCode: !!code,
        hasError: !!error,
        hasAccessToken: !!accessToken,
        hasState: !!state,
        code: code ? `${code.substring(0, 10)}...` : null,
        error,
        errorDescription
      });

      if (error) {
        console.error('❌ DeepLinkHandler: Auth0 error detected:', error, errorDescription);
        // Navigate to error page
        const errorUrl = '/auth?error=' + encodeURIComponent(error);
        console.log('🔄 DeepLinkHandler: Navigating to error page:', errorUrl);
        window.location.hash = errorUrl;
        return;
      }

      if (code || accessToken) {
        console.log('✅ DeepLinkHandler: Valid Auth0 parameters found, processing...');
        
        // Instead of manually handling the URL, let's trigger Auth0's built-in processing
        // by simulating what would happen if the browser received this callback URL
        
        // First, store the callback data for Auth0 to process
        const callbackData = {
          code,
          state: params.get('state'),
          originalUrl: url,
          timestamp: Date.now()
        };
        
        // Store this for Auth0 to pick up
        sessionStorage.setItem('pending_auth0_callback', JSON.stringify(callbackData));
        console.log('� DeepLinkHandler: Stored callback data:', callbackData);
        
        // Convert to the format Auth0 expects
        const webCompatibleUrl = this.convertToWebUrl(url, params);
        console.log('🔄 DeepLinkHandler: Generated web-compatible URL:', webCompatibleUrl);
        
        // Update the browser URL to match what Auth0 expects
        window.history.replaceState({}, '', webCompatibleUrl);
        console.log('🔄 DeepLinkHandler: Updated browser URL to:', window.location.href);
        
        // Now trigger the events that Auth0 listens for
        console.log('� DeepLinkHandler: Triggering browser events for Auth0...');
        
        // Dispatch hash change event
        const hashChangeEvent = new HashChangeEvent('hashchange', {
          oldURL: window.location.origin + '/#/',
          newURL: window.location.href
        });
        window.dispatchEvent(hashChangeEvent);
        
        // Dispatch popstate event
        const popStateEvent = new PopStateEvent('popstate', { 
          state: { auth0_callback: true } 
        });
        window.dispatchEvent(popStateEvent);
        
        // Trigger a location change event
        setTimeout(() => {
          console.log('� DeepLinkHandler: Triggering location reload simulation...');
          
          // Dispatch a custom event to trigger Auth0 processing
          window.dispatchEvent(new CustomEvent('auth0-mobile-callback', {
            detail: callbackData
          }));
          
          // Check if Auth0 SDK is available and manually trigger processing
          console.log('🔍 DeepLinkHandler: Checking for Auth0 SDK...');
          
          // Look for Auth0 instance in common places
          const auth0Client = (window as any).auth0Client || 
                             (window as any).Auth0Client ||
                             (window as any).__auth0Client__;
          
          if (auth0Client && typeof auth0Client.handleRedirectCallback === 'function') {
            console.log('✅ DeepLinkHandler: Found Auth0 client, triggering handleRedirectCallback');
            try {
              auth0Client.handleRedirectCallback().then(() => {
                console.log('✅ DeepLinkHandler: Auth0 handleRedirectCallback completed');
                this.exchangeCodeForTokens(code!, params.get('state') || '', url, accessToken);
              }).catch((error: any) => {
                console.error('❌ DeepLinkHandler: Auth0 handleRedirectCallback failed:', error);
                this.exchangeCodeForTokens(code!, params.get('state') || '', url, accessToken);
              });
            } catch (error) {
              console.error('❌ DeepLinkHandler: Error calling handleRedirectCallback:', error);
              this.exchangeCodeForTokens(code!, params.get('state') || '', url, accessToken);
            }
          } else {
            console.log('⚠️ DeepLinkHandler: Auth0 client not found, using manual token exchange');
            this.exchangeCodeForTokens(code!, params.get('state') || '', url, accessToken);
          }
        }, 100);
      } else {
        console.warn('⚠️ DeepLinkHandler: No valid Auth0 parameters found in callback URL');
      }
    } catch (error) {
      console.error('❌ DeepLinkHandler: Error processing Auth0 callback:', error);
      console.error('❌ DeepLinkHandler: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Fallback navigation
      console.log('🔄 DeepLinkHandler: Performing fallback navigation to home');
      window.location.hash = '/';
    }
  }

  private completeAuthFlow(originalUrl: string, code: string | null, accessToken: string | null): void {
    console.log('🔄 DeepLinkHandler: Completing authentication flow...');
    
    // Clean up session storage
    sessionStorage.removeItem('pending_auth0_callback');
    
    // Check authentication status
    setTimeout(() => {
      console.log('🔍 DeepLinkHandler: Checking final authentication status...');
      
      const auth0Keys = Object.keys(localStorage).filter(key => 
        key.includes('@@auth0') || key.includes('auth0spajs') || key.includes('_legacy_')
      );
      
      console.log('🔍 DeepLinkHandler: Auth0 storage keys found:', auth0Keys);
      
      if (auth0Keys.length > 0) {
        console.log('✅ DeepLinkHandler: Authentication tokens detected');
      } else {
        console.log('⚠️ DeepLinkHandler: No authentication tokens found');
      }
      
      // Dispatch completion event
      window.dispatchEvent(new CustomEvent('auth0-callback-processed', { 
        detail: { 
          url: originalUrl, 
          code, 
          accessToken, 
          processed: true,
          hasTokens: auth0Keys.length > 0
        } 
      }));
      console.log('📢 DeepLinkHandler: Dispatched auth0-callback-processed event');
      
      // Navigate to home page
      setTimeout(() => {
        console.log('🔄 DeepLinkHandler: Final navigation to home page');
        window.location.hash = '/';
        
        // Force a final check after navigation
        setTimeout(() => {
          console.log('🔍 DeepLinkHandler: Post-navigation authentication check');
          const finalAuth0Keys = Object.keys(localStorage).filter(key => 
            key.includes('@@auth0') || key.includes('auth0spajs') || key.includes('_legacy_')
          );
          console.log('🔍 DeepLinkHandler: Final auth keys:', finalAuth0Keys);
          
          // Trigger auth state refresh in React components
          window.dispatchEvent(new CustomEvent('auth-state-refresh'));
        }, 500);
      }, 1000);
    }, 1000);
  }

  private async exchangeCodeForTokens(code: string, _state: string, originalUrl: string, accessToken: string | null): Promise<void> {
    console.log('💱 DeepLinkHandler: Starting token exchange process...');
    
    try {
      // Get Auth0 configuration from the window or import it
      const auth0Config = await this.getAuth0Config();
      
      if (!auth0Config) {
        console.error('❌ DeepLinkHandler: Cannot get Auth0 configuration');
        this.completeAuthFlow(originalUrl, code, accessToken);
        return;
      }

      const { domain, clientId } = auth0Config;
      
      console.log('🔧 DeepLinkHandler: Using Auth0 config:', { domain, clientId });
      
      // Prepare the token exchange request
      const tokenUrl = `https://${domain}/oauth/token`;
      const requestBody = {
        grant_type: 'authorization_code',
        client_id: clientId,
        code: code,
        redirect_uri: 'com.texweb.app://callback',
      };
      
      console.log('📡 DeepLinkHandler: Making token exchange request to:', tokenUrl);
      console.log('📡 DeepLinkHandler: Request body:', { ...requestBody, code: code.substring(0, 10) + '...' });
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('📡 DeepLinkHandler: Token exchange response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ DeepLinkHandler: Token exchange failed:', response.status, errorText);
        this.completeAuthFlow(originalUrl, code, accessToken);
        return;
      }
      
      const tokenData = await response.json();
      console.log('✅ DeepLinkHandler: Token exchange successful');
      console.log('🔑 DeepLinkHandler: Received tokens:', {
        hasAccessToken: !!tokenData.access_token,
        hasIdToken: !!tokenData.id_token,
        hasRefreshToken: !!tokenData.refresh_token,
        expiresIn: tokenData.expires_in
      });
      
      // Store tokens in localStorage using Auth0's format
      this.storeAuth0Tokens(tokenData, clientId);
      
      // Complete the authentication flow
      this.completeAuthFlow(originalUrl, code, tokenData.access_token);
      
    } catch (error) {
      console.error('❌ DeepLinkHandler: Error during token exchange:', error);
      this.completeAuthFlow(originalUrl, code, accessToken);
    }
  }

  private async getAuth0Config(): Promise<{ domain: string; clientId: string } | null> {
    try {
      // Try to get config from the global window object or import
      const configModule = await import('../auth_config.json');
      return {
        domain: configModule.domain,
        clientId: configModule.clientId
      };
    } catch (error) {
      console.error('❌ DeepLinkHandler: Failed to load Auth0 config:', error);
      return null;
    }
  }

  private storeAuth0Tokens(tokenData: any, clientId: string): void {
    console.log('💾 DeepLinkHandler: Storing Auth0 tokens...');
    
    try {
      // Store tokens in the format that Auth0 React SDK expects
      const auth0Key = `@@auth0spajs@@::${clientId}::https://dev-arrows.au.auth0.com/api/v2/::openid profile email`;
      
      const auth0Data = {
        body: {
          access_token: tokenData.access_token,
          id_token: tokenData.id_token,
          scope: tokenData.scope || 'openid profile email',
          expires_in: tokenData.expires_in || 86400,
          token_type: tokenData.token_type || 'Bearer',
        },
        expiresAt: Math.floor(Date.now() / 1000) + (tokenData.expires_in || 86400)
      };
      
      localStorage.setItem(auth0Key, JSON.stringify(auth0Data));
      console.log('💾 DeepLinkHandler: Stored tokens with key:', auth0Key);
      
      // Also store user info if available in id_token
      if (tokenData.id_token) {
        try {
          const payload = this.parseJWT(tokenData.id_token);
          const userKey = `${auth0Key}::user`;
          localStorage.setItem(userKey, JSON.stringify(payload));
          console.log('👤 DeepLinkHandler: Stored user info:', {
            sub: payload.sub,
            email: payload.email,
            name: payload.name
          });
        } catch (error) {
          console.warn('⚠️ DeepLinkHandler: Failed to parse ID token:', error);
        }
      }
      
    } catch (error) {
      console.error('❌ DeepLinkHandler: Error storing tokens:', error);
    }
  }

  private parseJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('❌ DeepLinkHandler: Error parsing JWT:', error);
      return {};
    }
  }

  private convertToWebUrl(originalUrl: string, params: URLSearchParams): string {
    console.log('🔄 DeepLinkHandler: Converting deep link to web URL...');
    console.log('🔄 DeepLinkHandler: Original URL:', originalUrl);
    console.log('🔄 DeepLinkHandler: Parameters to convert:', Array.from(params.entries()));
    
    // Convert com.texweb.app://callback?params to /#/?params for Auth0 processing
    const paramString = params.toString();
    let webUrl: string;
    
    if (paramString) {
      webUrl = `/#/?${paramString}`;
      console.log('🔄 DeepLinkHandler: Generated web URL with params:', webUrl);
    } else {
      webUrl = '/#/';
      console.log('🔄 DeepLinkHandler: Generated web URL without params:', webUrl);
    }
    
    return webUrl;
  }

  public addListener(callback: (url: string) => void): void {
    console.log('📢 DeepLinkHandler: Adding new listener. Total listeners will be:', this.listeners.length + 1);
    this.listeners.push(callback);
  }

  public removeListener(callback: (url: string) => void): void {
    const initialLength = this.listeners.length;
    this.listeners = this.listeners.filter(listener => listener !== callback);
    console.log(`📢 DeepLinkHandler: Removed listener. Listeners count: ${initialLength} → ${this.listeners.length}`);
  }

  public cleanup(): void {
    console.log('🧹 DeepLinkHandler: Starting cleanup...');
    
    if (Capacitor.isNativePlatform()) {
      console.log('🧹 DeepLinkHandler: Removing all App listeners');
      App.removeAllListeners();
    }
    
    const listenerCount = this.listeners.length;
    this.listeners = [];
    console.log(`🧹 DeepLinkHandler: Cleared ${listenerCount} listeners`);
    console.log('✅ DeepLinkHandler: Cleanup completed');
  }
}

// Export singleton instance
export const deepLinkHandler = DeepLinkHandler.getInstance();
