
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import BoardPage from '@/pages/BoardPage';
import { InvitationHandler } from "@/components/invitations/InvitationHandler";

// A wrapper for routes that require authentication
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // You might want to render a loading spinner here
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect to the login page if not authenticated
    return <Navigate to="/auth" />;
  }

  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" />,
  },
  {
    path: "/dashboard",
    element: (
      <AuthRoute>
        <Dashboard />
      </AuthRoute>
    ),
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/board/:boardId",
    element: (
      <AuthRoute>
        <BoardPage />
      </AuthRoute>
    ),
  },
  {
    path: "/invitations/:invitationId/:action",
    element: (
      <AuthRoute>
        <InvitationHandler />
      </AuthRoute>
    ),
  },
]);

// Main App component that provides authentication context
function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
