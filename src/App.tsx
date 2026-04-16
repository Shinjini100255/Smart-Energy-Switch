/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { ProfileSetup } from './pages/ProfileSetup';
import { Dashboard } from './pages/Dashboard';
import { AIRecommendations } from './pages/AIRecommendations';
import { VendorComparison } from './pages/VendorComparison';
import { RecipeGenerator } from './pages/RecipeGenerator';
import { CommunityInsights } from './pages/CommunityInsights';
import { Settings } from './pages/Settings';
import { GovernmentSchemes } from './pages/GovernmentSchemes';
import { EmergencyContacts } from './pages/EmergencyContacts';
import { getProfile } from './lib/storage';
import { getSettings, applySettings } from './lib/settings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const profile = getProfile();
  if (!profile) {
    return <Navigate to="/profile-setup" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  useEffect(() => {
    applySettings(getSettings());
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Protected Routes (wrapped in Layout) */}
        <Route path="/profile-setup" element={<Layout><ProfileSetup /></Layout>} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/recommendations" element={<Layout><AIRecommendations /></Layout>} />
        <Route path="/community" element={<Layout><CommunityInsights /></Layout>} />
        <Route path="/vendors" element={<Layout><VendorComparison /></Layout>} />
        <Route path="/recipes" element={<Layout><RecipeGenerator /></Layout>} />
        <Route path="/schemes" element={<Layout><GovernmentSchemes /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="/emergency" element={<Layout><EmergencyContacts /></Layout>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
