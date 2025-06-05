import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null); // Initialize with null

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Initialize user to null

  useEffect(() => {
    // Load user from localStorage on initial load
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const username = localStorage.getItem('username');
      const id = localStorage.getItem('id');
      if (token && role && username) { // Ensure all parts are present
        setUser({ token, role, username });
      } else {
        // If any part is missing, clear all auth-related localStorage items
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');

        setUser(null);
      }
    } catch (error) {
      console.error("Error reading user from localStorage:", error);
      setUser(null); // Fallback to logged out state on error
    }
  }, []);

  const login = useCallback((userData) => {
    if (userData && userData.token && userData.role && userData.username) {
      localStorage.setItem('token', userData.token);
      localStorage.setItem('role', userData.role);
      localStorage.setItem('username', userData.username);
      setUser({
        token: userData.token,
        role: userData.role,
        username: userData.username
      });
    } else {
      console.error("Login attempt with incomplete userData:", userData);
      // Optionally: throw new Error("Login data incomplete");
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setUser(null);
    // Forcing a full reload can sometimes help clear any residual state in complex apps,
    // though usually navigating to /login and relying on React's state updates is preferred.
    // window.location.href = '/login'; // Or navigate('/login') if useNavigate is available here
  }, []);

  const isAuthenticated = useCallback(() => !!user && !!user.token, [user]);
  const getUserRole = useCallback(() => user?.role, [user]);
  const hasRole = useCallback((role) => user?.role === role, [user]);
  const hasAnyRole = useCallback((roles = []) => Array.isArray(roles) && roles.includes(user?.role), [user]);

  const contextValue = {
    user,
    login,
    logout,
    isAuthenticated,
    getUserRole,
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};