
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

import FitnessDashboard from './pages/FitnessDashboard';
import LogWorkout from './pages/LogWorkout';
import HealthMetrics from './pages/HealthMetrics';
import ActivityHistory from './pages/ActivityHistory';
import CommunityFeed from './pages/CommunityFeed';
import UserProfile from './pages/UserProfile';
import NutritionPlan from './pages/NutritionPlan';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Sidebar from './components/Sidebar';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DataManager from './pages/admin/DataManager';
import AdminSettings from './pages/admin/Settings';
import AdminLayout from './components/AdminLayout';

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';

  return (
    <div className="flex h-full w-full font-display transition-colors duration-300">
      <Sidebar />

      <main className={`flex-1 transition-all duration-300 min-w-0 ${!isAuthPage ? 'pt-20 md:pt-8 pb-12 pl-0 md:pl-20 px-4 sm:px-8 max-w-[1600px] mx-auto' : ''}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/" element={
            <ProtectedRoute>
              <FitnessDashboard />
            </ProtectedRoute>
          } />
          <Route path="/log-workout" element={
            <ProtectedRoute>
              <LogWorkout />
            </ProtectedRoute>
          } />
          <Route path="/metrics" element={
            <ProtectedRoute>
              <HealthMetrics />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <ActivityHistory />
            </ProtectedRoute>
          } />
          <Route path="/community" element={
            <ProtectedRoute>
              <CommunityFeed />
            </ProtectedRoute>
          } />
          <Route path="/nutrition" element={
            <ProtectedRoute>
              <NutritionPlan />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="data" element={<DataManager />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
