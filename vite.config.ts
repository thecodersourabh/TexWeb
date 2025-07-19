import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(() => {
  // Use different base paths for web vs mobile builds
  const base = process.env.CAPACITOR_PLATFORM ? './' : '/TexWeb/';
  
  return {
    base,
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            three: ['three', '@react-three/fiber', '@react-three/drei'],
            router: ['react-router-dom'],
          },
        },
      },
    },
    define: {
      global: 'globalThis',
    },
  };
});
