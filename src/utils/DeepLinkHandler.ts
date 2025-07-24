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
    if (Capacitor.isNativePlatform()) {
      // Listen for app state changes and URL opens
      App.addListener('appUrlOpen', (event) => {
        this.handleDeepLink(event.url);
      });

      // Check if app was opened with a URL
      App.getLaunchUrl().then((result) => {
        if (result?.url) {
          this.handleDeepLink(result.url);
        }
      });
    }
  }

  private handleDeepLink(url: string): void {
    // Check if this is an Auth0 callback
    if (url.includes('com.texweb.app://callback')) {
      this.processAuth0Callback(url);
    }

    // Notify all listeners
    this.listeners.forEach(listener => listener(url));
  }

  private processAuth0Callback(url: string): void {
    try {
      // Parse the URL to extract parameters
      const urlObj = new URL(url);
      let params: URLSearchParams;
      
      // Auth0 might send params in hash or query
      if (urlObj.hash && urlObj.hash.includes('=')) {
        params = new URLSearchParams(urlObj.hash.substring(1));
      } else if (urlObj.search) {
        params = new URLSearchParams(urlObj.search.substring(1));
      } else {
        // Extract from the full URL if no standard format
        const paramString = url.split('?')[1] || url.split('#')[1];
        params = new URLSearchParams(paramString);
      }

      // Extract Auth0 parameters
      const code = params.get('code');
      const error = params.get('error');
      const errorDescription = params.get('error_description');
      const accessToken = params.get('access_token');

      if (error) {
        console.error('Auth0 error:', error, errorDescription);
        // Navigate to error page
        window.location.hash = '/auth?error=' + encodeURIComponent(error);
        return;
      }

      if (code || accessToken) {
        // Convert the deep link URL to a web-compatible format that Auth0 can process
        const webCompatibleUrl = this.convertToWebUrl(url, params);
        
        // Update the current URL to match what Auth0 expects
        window.history.replaceState({}, '', webCompatibleUrl);
        
        // Trigger Auth0's handleRedirectCallback manually if needed
        setTimeout(() => {
          window.location.hash = '/';
        }, 100);
      }
    } catch (error) {
      console.error('Error processing Auth0 callback:', error);
      // Fallback navigation
      window.location.hash = '/';
    }
  }

  private convertToWebUrl(_originalUrl: string, params: URLSearchParams): string {
    // Convert com.texweb.app://callback?params to /#/?params for Auth0 processing
    const paramString = params.toString();
    if (paramString) {
      return `/#/?${paramString}`;
    }
    return '/#/';
  }

  public addListener(callback: (url: string) => void): void {
    this.listeners.push(callback);
  }

  public removeListener(callback: (url: string) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  public cleanup(): void {
    if (Capacitor.isNativePlatform()) {
      App.removeAllListeners();
    }
    this.listeners = [];
  }
}

// Export singleton instance
export const deepLinkHandler = DeepLinkHandler.getInstance();
