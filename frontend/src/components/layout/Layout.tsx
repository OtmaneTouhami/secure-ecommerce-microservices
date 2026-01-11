import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '@/features/auth';
import './Layout.css';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const { isAuthenticated, isAdmin } = useAuth();
    const location = useLocation();

    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <div className="layout">
            <Header />
            <div className="layout-body">
                {isAuthenticated && isAdmin && isAdminRoute && <Sidebar />}
                <main className={`main-content ${isAdminRoute && isAdmin ? 'with-sidebar' : ''}`}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
