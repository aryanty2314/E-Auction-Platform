import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  // AuthContext's user initialization is synchronous from localStorage,
  // so a loading state here for user object readiness isn't strictly necessary
  // unless AuthContext itself introduces an async phase for user loading.
  const { isAuthenticated, hasAnyRole, user } = useAuth();

  if (!isAuthenticated()) {
    // User not authenticated
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, check roles if specified
  if (roles.length > 0 && !hasAnyRole(roles)) {
    // User does not have any of the required roles
    // Redirect to a general page like auctions or a specific "access denied" page
    // For now, redirecting to auctions. Could show a toast message before redirect.
    console.warn(`User ${user?.username} with role ${user?.role} tried to access a route restricted to roles: ${roles.join(', ')}.`);
    return <Navigate to="/auctions" replace />; 
  }

  // User is authenticated and has the required role (if any roles were specified)
  return children;
};

export default ProtectedRoute;