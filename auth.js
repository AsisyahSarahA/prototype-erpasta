/**
 * ==========================================================================
 * ASTACODE ERP - PROTOTYPE AUTHENTICATION CONTROLLER (auth.js)
 * Lightweight prototype authentication & session manager
 * ==========================================================================
 */

(function() {
  'use strict';

  const AUTH_KEY = 'asta_auth_user';

  // Helper to determine path prefix to root based on current URL
  function getRootPrefix() {
    const p = window.location.pathname.toLowerCase().replace(/\\/g, '/');
    if (p.includes('/crm/') || p.includes('/finance/') || p.includes('/marketing/') || p.includes('/project/') || p.includes('/hr/')) {
      return '../';
    }
    return './';
  }

  // Get current logged in session
  function getUser() {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Error reading auth state:', e);
      return null;
    }
  }

  // Set user login session
  function setUser(userData) {
    const session = {
      email: userData.email || 'admin@astacode.com',
      name: 'admin123',
      role: userData.role || 'Executive / Super Admin',
      avatar: 'AD',
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return session;
  }

  // Logout session
  function logout() {
    localStorage.removeItem(AUTH_KEY);
    const prefix = getRootPrefix();
    window.location.href = prefix + 'login.html';
  }

  // Check auth protection on protected pages
  function checkAuth() {
    const p = window.location.pathname.toLowerCase().replace(/\\/g, '/');
    const isLoginPage = p.endsWith('login.html');

    const currentUser = getUser();

    if (isLoginPage) {
      // If already logged in, redirect away from login page to dashboard
      if (currentUser) {
        window.location.replace('index.html#dashboard');
      }
      return;
    }

    // For any other page, if NOT logged in, redirect to login
    if (!currentUser) {
      const prefix = getRootPrefix();
      // Store redirect target if desired
      const currentTarget = window.location.pathname.split('/').pop() + (window.location.hash || '');
      sessionStorage.setItem('asta_auth_redirect', currentTarget);
      window.location.replace(prefix + 'login.html');
    }
  }

  // Expose to global window
  window.AstaAuth = {
    getUser,
    setUser,
    logout,
    checkAuth,
    getRootPrefix
  };

  // Run protection once DOM is ready to avoid early execution issues
  document.addEventListener('DOMContentLoaded', checkAuth);

})();
