import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App.tsx';
import SafeApp from './SafeApp.tsx';
import { DebugApp } from './components/DebugApp.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Initialize Capacitor for mobile platforms
if (Capacitor.isNativePlatform()) {
  console.log('Running on native platform:', Capacitor.getPlatform());
}

// Use debug app for testing - change this to false once debugging is complete
const DEBUG_MODE = false;
// Use safe app to handle Auth0 errors gracefully
const USE_SAFE_APP = true;

const AppComponent = DEBUG_MODE ? DebugApp : (USE_SAFE_APP ? SafeApp : App);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppComponent />
    </ErrorBoundary>
  </StrictMode>
);
