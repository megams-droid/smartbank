import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Pages
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { BudgetsPage } from '../pages/BudgetsPage';
import { GoalsPage } from '../pages/GoalsPage';
import { ForecastPage } from '../pages/ForecastPage';
import { FinancialHealthPage } from '../pages/FinancialHealthPage';
import { AssistantPage } from '../pages/AssistantPage';
import { KYCPage } from '../pages/KYCPage';
import { CreditRiskPage } from '../pages/CreditRiskPage';
import { ReportsPage } from '../pages/ReportsPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { ProfilePage } from '../pages/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { FraudQueuePage } from '../pages/admin/FraudQueuePage';
import { AdminKYCPage } from '../pages/admin/AdminKYCPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminSystemPage } from '../pages/admin/AdminSystemPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 text-xs font-mono animate-pulse">
        Initializing SmartBank AI Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/insights" element={<FinancialHealthPage />} />
        <Route path="/forecast" element={<ForecastPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/kyc" element={<KYCPage />} />
        <Route path="/credit-risk" element={<CreditRiskPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<ProfilePage />} />

        {/* Admin Risk Center */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/fraud" element={<FraudQueuePage />} />
        <Route path="/admin/kyc" element={<AdminKYCPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/system" element={<AdminSystemPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
