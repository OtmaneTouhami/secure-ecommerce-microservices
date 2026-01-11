import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import Button from '@/components/common/Button';
import { ArrowRight, Package, ShoppingBag, Shield } from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
    const { isAuthenticated, isAdmin, login } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="home-page">
            <section className="hero">
                <h1>Welcome to E-Commerce</h1>
                <p>Your one-stop shop for all your needs. Browse our catalog and place orders with ease.</p>
                <div className="hero-actions">
                    <Button size="lg" onClick={() => navigate('/products')}>
                        Browse Products
                        <ArrowRight size={18} />
                    </Button>
                    {!isAuthenticated && (
                        <Button size="lg" variant="outline" onClick={login}>
                            Login to Order
                        </Button>
                    )}
                </div>
            </section>

            <section className="features">
                <div className="feature-card">
                    <Package size={32} />
                    <h3>Product Catalog</h3>
                    <p>Browse our extensive catalog of products with detailed descriptions and real-time stock information.</p>
                </div>
                <div className="feature-card">
                    <ShoppingBag size={32} />
                    <h3>Easy Ordering</h3>
                    <p>Add products to your cart and checkout with a simple, streamlined process.</p>
                </div>
                <div className="feature-card">
                    <Shield size={32} />
                    <h3>Secure Authentication</h3>
                    <p>Your account is protected with industry-standard OAuth2/OpenID Connect security.</p>
                </div>
            </section>

            {isAuthenticated && isAdmin && (
                <section className="admin-cta">
                    <h2>Admin Panel</h2>
                    <p>Manage products, orders, and inventory from the admin dashboard.</p>
                    <Button onClick={() => navigate('/admin/dashboard')}>
                        Go to Dashboard
                        <ArrowRight size={18} />
                    </Button>
                </section>
            )}
        </div>
    );
};

export default HomePage;
