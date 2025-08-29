import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    // Try to get user from shell context
    const shellUser = window.shellContext?.user;
    
    if (shellUser) {
      setUser(shellUser);
      
      // Determine user type based on role or other field
      // QUESTION: What field determines the user type?
      // Adjust this logic based on your actual user data structure
      if (shellUser.role === 'admin' || shellUser.isConshipUser) {
        setUserType('conship');
      } else if (shellUser.isForeignPartner || shellUser.country !== 'US') {
        setUserType('foreign_partner');
      } else {
        setUserType('business_partner');
      }
    }
    
    setLoading(false);
  }, []);

  const value = {
    user,
    userType,
    loading,
    isConshipUser: userType === 'conship',
    isBusinessPartner: userType === 'business_partner',
    isForeignPartner: userType === 'foreign_partner',
    
    // Helper function to check service access
    canAccessService: (service) => {
      if (userType === 'foreign_partner') {
        return service === 'export';
      }
      return true; // Conship and Business Partners have full access
    }
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
