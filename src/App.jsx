// Uses HashRouter to be compatible with GitHub Pages deployment

import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import ProtectedRoute from './auth/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import GameVault from './components/GameVault';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes: authentication pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected app route */}
          {/* Redirects to /login if no valid token is found */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <GameVault />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
