import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '@/components/common/Spinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'ADMIN' | 'CLIENT';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, isAdmin, isClient, login } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <Spinner fullScreen />;
    }

    if (!isAuthenticated) {
        login();
        return <Spinner fullScreen />;
    }

    if (requiredRole === 'ADMIN' && !isAdmin) {
        return <Navigate to="/forbidden" state={{ from: location }} replace />;
    }

    if (requiredRole === 'CLIENT' && !isClient && !isAdmin) {
        return <Navigate to="/forbidden" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
