import { createBrowserRouter } from 'react-router-dom';
import { DashboardPage } from '@/pages/Dashboard';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { LoginPage } from '@/pages/Login';
import { RegisterPage } from '@/pages/Register';
import { PrivateRoute } from '@/components/PrivateRoute';
import { RoleRoute } from '@/components/RoleRoute';
import NotFoundPage from '@/pages/NotFound';
import { DemoFlow } from '@/pages/LandingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  },
  {
    path: '/landing',
    element: <DemoFlow />
  },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <RoleRoute allowedRoles={['issuer', 'investor']}>
          <DashboardPage />
        </RoleRoute>
      </PrivateRoute>
    )
  },
  {
    path: '/admin',
    element: (
      <PrivateRoute>
        <RoleRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </RoleRoute>
      </PrivateRoute>
    )
  }
]);