
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import Sidebar from './components/Sidebar';

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <Sidebar />

      <main className={`flex-1 transition-all duration-300 min-w-0 ${!isAuthPage ? 'pt-20 md:pt-8 pb-12 md:pl-20 px-4 sm:px-8 max-w-[1600px] mx-auto' : ''}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
