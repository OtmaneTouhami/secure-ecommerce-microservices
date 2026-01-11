import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/context/ThemeContext';
import UserMenu from '@/features/auth/components/UserMenu';
import { ShoppingCart, Sun, Moon, Package } from 'lucide-react';
import { useCart } from '@/features/orders/context/CartContext';
import './Header.css';

const Header = () => {
    const { isAuthenticated, isAdmin, login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { totalItems } = useCart();
    const location = useLocation();

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="header-logo">
                    <Package size={24} />
                    <span>E-Commerce</span>
                </Link>

                <nav className="header-nav">
                    <Link
                        to="/products"
                        className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}
                    >
                        Products
                    </Link>
                    {isAuthenticated && (
                        <Link
                            to="/orders"
                            className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
                        >
                            My Orders
                        </Link>
                    )}
                    {isAdmin && (
                        <Link
                            to="/admin/dashboard"
                            className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                        >
                            Dashboard
                        </Link>
                    )}
                </nav>

                <div className="header-actions">
                    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {isAuthenticated && (
                        <Link to="/cart" className="cart-btn">
                            <ShoppingCart size={20} />
                            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                        </Link>
                    )}

                    {isAuthenticated ? (
                        <UserMenu />
                    ) : (
                        <button className="login-btn" onClick={login}>
                            Login
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
