// Vite configuration for ASTACODE CRM Vanilla JS
// Pure object export without external import dependencies so it runs even with npx vite before npm install
export default {
  // Base './' guarantees relative asset links in builds and subfolder deployments
  base: './',
  server: {
    port: 5173,
    open: true,
    host: true,
    cors: true,
    strictPort: false, // Automatically tries next port (5174, etc.) if busy
    // Shared ERP sidebar (../sidebar.js, ../sidebar.css) lives outside the crm root
    fs: { allow: ['..'] },
  },
  preview: {
    port: 4173,
    open: true,
    host: true,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    emptyOutDir: true,
  },
};
