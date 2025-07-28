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
        
        // Convert the deep link URL to a web-compatible format that Auth0 can process
        const webCompatibleUrl = this.convertToWebUrl(url, params);
        console.log('🔄 DeepLinkHandler: Converted to web-compatible URL:', webCompatibleUrl);
        
        // Update the current URL to match what Auth0 expects
        console.log('🔄 DeepLinkHandler: Updating browser history...');
        window.history.replaceState({}, '', webCompatibleUrl);
        console.log('🔄 DeepLinkHandler: Current URL after history update:', window.location.href);
        
        // Check current authentication state
        console.log('🔍 DeepLinkHandler: Current window location:', {
          href: window.location.href,
          hash: window.location.hash,
          search: window.location.search
        });
        
        // Trigger Auth0's handleRedirectCallback manually if needed
        console.log('⏰ DeepLinkHandler: Setting timeout for navigation...');
        setTimeout(() => {
          console.log('🔄 DeepLinkHandler: Navigating to home page');
          console.log('🔄 DeepLinkHandler: Previous hash:', window.location.hash);
          window.location.hash = '/';
          console.log('🔄 DeepLinkHandler: New hash:', window.location.hash);
          
          // Check if Auth0 state has changed
          setTimeout(() => {
            console.log('🔍 DeepLinkHandler: Post-navigation check - Current URL:', window.location.href);
            // Trigger a custom event to notify other components
            window.dispatchEvent(new CustomEvent('auth0-callback-processed', { 
              detail: { url, code, accessToken } 
            }));
            console.log('📢 DeepLinkHandler: Dispatched auth0-callback-processed event');
          }, 500);
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
