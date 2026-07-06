import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';


interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {

  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }


  return <>{children}</>;
};

export default ProtectedRoute;