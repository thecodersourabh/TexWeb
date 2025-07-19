import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

export function DebugApp() {
  const [errors, setErrors] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const addLog = (message: string) => {
      console.log(message);
      setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const addError = (error: string) => {
      console.error(error);
      setErrors(prev => [...prev, `${new Date().toLocaleTimeString()}: ${error}`]);
    };

    addLog('DebugApp mounted');
    addLog(`Platform: ${Capacitor.getPlatform()}`);
    addLog(`Is native platform: ${Capacitor.isNativePlatform()}`);
    addLog(`Current URL: ${window.location.href}`);
    addLog(`Document title: ${document.title}`);
    
    // Check if CSS is loading
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    addLog(`Stylesheets loaded: ${styles.length}`);
    
    // Check if JS is loading
    const scripts = document.querySelectorAll('script');
    addLog(`Scripts loaded: ${scripts.length}`);

    // Check for errors
    window.addEventListener('error', (e) => {
      addError(`Global error: ${e.error?.message || e.message}`);
    });

    window.addEventListener('unhandledrejection', (e) => {
      addError(`Unhandled promise rejection: ${e.reason}`);
    });
    
    // Add a simple test element
    const testDiv = document.createElement('div');
    testDiv.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: green;
      color: white;
      padding: 10px;
      border-radius: 4px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 12px;
    `;
    testDiv.textContent = `✅ Debug App Active`;
    document.body.appendChild(testDiv);
    
    // Remove test div after 10 seconds
    setTimeout(() => {
      if (document.body.contains(testDiv)) {
        document.body.removeChild(testDiv);
      }
    }, 10000);

    addLog('DebugApp initialization complete');
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f0f0', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px'
    }}>
      <h1 style={{ color: '#333', textAlign: 'center', marginBottom: '30px' }}>
        🐛 Debug Mode - TexWeb
      </h1>
      
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        display: 'grid',
        gap: '20px'
      }}>
        {/* Platform Information */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#007bff', marginBottom: '15px' }}>📱 Platform Information</h2>
          <p><strong>Platform:</strong> {Capacitor.getPlatform()}</p>
          <p><strong>Is Native:</strong> {Capacitor.isNativePlatform() ? 'Yes' : 'No'}</p>
          <p><strong>User Agent:</strong> {navigator.userAgent}</p>
          <p><strong>Current URL:</strong> {window.location.href}</p>
          <p><strong>Screen:</strong> {window.screen.width}x{window.screen.height}</p>
        </div>

        {/* App Status */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#28a745', marginBottom: '15px' }}>✅ App Status</h2>
          <p style={{ color: 'green' }}>✅ React is working</p>
          <p style={{ color: 'green' }}>✅ Capacitor is loaded</p>
          <p style={{ color: 'green' }}>✅ JavaScript is executing</p>
          <p style={{ color: 'green' }}>✅ Component is rendering</p>
          
          <button 
            onClick={() => {
              alert('Button works! 🎉');
              setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: Button clicked`]);
            }}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '10px'
            }}
          >
            🧪 Test Button
          </button>
        </div>

        {/* Logs */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#6c757d', marginBottom: '15px' }}>📋 Logs ({logs.length})</h2>
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            {logs.length === 0 ? (
              <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{ marginBottom: '2px' }}>{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #f5c6cb'
          }}>
            <h2 style={{ color: '#721c24', marginBottom: '15px' }}>❌ Errors ({errors.length})</h2>
            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              {errors.map((error, index) => (
                <div key={index} style={{ marginBottom: '2px', color: '#721c24' }}>{error}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
