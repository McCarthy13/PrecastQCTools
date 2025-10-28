'use client';

import { useState } from 'react';
import { useAuthStore } from '@/state/authStore';
import { useShallow } from 'zustand/react/shallow';
import { LoginScreen } from '@/features/auth/login';
import { RegistrationScreen } from '@/features/auth/registration';
import { RequestSuccessScreen } from '@/features/auth/request-success';
import { ChangePasswordScreen } from '@/features/auth/change-password';
import { AdminApprovalScreen } from '@/features/auth/admin-approval';
import { ProtectedApp } from './protected-app';

type AuthView = 'login' | 'registration' | 'requestSuccess' | 'adminApproval';

export default function AppPage() {
  const { currentUser, logout } = useAuthStore(
    useShallow((state) => ({
      currentUser: state.currentUser,
      logout: state.logout,
    }))
  );
  const [authView, setAuthView] = useState<AuthView>('login');

  if (!currentUser) {
    switch (authView) {
      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={(requiresPasswordChange) => {
              if (requiresPasswordChange) {
                // The change password screen will display once the user object is set
                // with the temporary password flag.
              }
            }}
            onRequestAccess={() => setAuthView('registration')}
            onAdminApproval={() => setAuthView('adminApproval')}
          />
        );
      case 'registration':
        return (
          <RegistrationScreen
            onBack={() => setAuthView('login')}
            onSuccess={() => setAuthView('requestSuccess')}
          />
        );
      case 'requestSuccess':
        return <RequestSuccessScreen onBackToLogin={() => setAuthView('login')} />;
      case 'adminApproval':
        return <AdminApprovalScreen onBack={() => setAuthView('login')} />;
      default:
        return null;
    }
  }

  if (currentUser.isTemporaryPassword) {
    return (
      <ChangePasswordScreen
        onComplete={() => {
          // Once password is updated the auth store updates the user flag,
          // triggering the main app to render.
        }}
        onLogout={() => {
          logout();
          setAuthView('login');
        }}
      />
    );
  }

  return <ProtectedApp />;
}
