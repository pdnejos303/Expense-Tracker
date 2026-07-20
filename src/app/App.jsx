import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ThemeSettingsProvider, useThemeSettings } from '@/app/ThemeContext';
import { AuthProvider } from '@/features/auth/contexts/AuthContext';
import PrivateRoute from '@/features/auth/components/PrivateRoute';
import Layout from '@/shared/components/Layout';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import LoadingScreen from '@/shared/components/LoadingScreen';

import { useAuth } from '@/features/auth/hooks/useAuth';

// Eager load auth pages (needed immediately)
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';

// Lazy load all other routes
const LandingPage = lazy(() => import('@/features/landing/pages/LandingPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const AddTransactionPage = lazy(() => import('@/features/transactions/pages/AddTransactionPage'));
const TransactionsPage = lazy(() => import('@/features/transactions/pages/TransactionsPage'));
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage'));
const BudgetManagementPage = lazy(() => import('@/features/budget/pages/BudgetManagementPage'));
const CategoriesPage = lazy(() => import('@/features/categories/pages/CategoriesPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));
const HistoryPage = lazy(() => import('@/features/history/pages/HistoryPage'));
const PlannerPage = lazy(() => import('@/features/planner/pages/PlannerPage'));
const SupportPage = lazy(() => import('@/features/support/pages/SupportPage'));

function RootRedirect() {
  const { currentUser, authLoading } = useAuth();
  if (authLoading) return <LoadingScreen />;
  return currentUser ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

function AppContent() {
  const { theme } = useThemeSettings();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <Layout>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/add-transaction" element={<PrivateRoute><AddTransactionPage /></PrivateRoute>} />
                <Route path="/transactions" element={<PrivateRoute><TransactionsPage /></PrivateRoute>} />
                <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
                <Route path="/budget-management" element={<PrivateRoute><BudgetManagementPage /></PrivateRoute>} />
                <Route path="/categories" element={<PrivateRoute><CategoriesPage /></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
                <Route path="/planner" element={<PrivateRoute><PlannerPage /></PrivateRoute>} />
                <Route path="/support" element={<PrivateRoute><SupportPage /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeSettingsProvider>
        <AppContent />
      </ThemeSettingsProvider>
    </AuthProvider>
  );
}

export default App;
