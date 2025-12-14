// src/auth/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

/*
  AuthProvider manages the auth token and exposes:
  - token: raw JWT (string or null)
  - isAuthenticated: boolean
  - login(token, redirectTo)
  - logout(redirectTo)

  IMPORTANT: after login/logout we dispatch a custom window event
  so components that are not connected to the context directly
  can react (e.g. GameVault listens for 'user:login' to refresh).
*/
export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // Lazy initial state from localStorage so token survives refresh.
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  });

  // login: save token (localStorage + state) and notify listeners
  const login = (newToken, redirectTo = '/') => {
    try {
      localStorage.setItem('token', newToken);
    } catch {
      /* ignore storage errors */
    }
    setToken(newToken);

    // Dispatch a global event so other parts of the app can respond.
    // This keeps compatibility with existing code that listens to this event.
    try {
      window.dispatchEvent(new Event('user:login'));
    } catch (e) {
      // ignore error
    }

    if (redirectTo) navigate(redirectTo, { replace: true });
  };

  // logout: clear token and notify listeners
  const logout = (redirectTo = '/login') => {
    try {
      localStorage.removeItem('token');
    } catch (e) {
      // ignore error
    }
    setToken(null);

    try {
      window.dispatchEvent(new Event('user:logout'));
    } catch(e) {
      // ignore error
    }

    if (redirectTo) navigate(redirectTo, { replace: true });
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
