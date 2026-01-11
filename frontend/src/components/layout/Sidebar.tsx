import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    AlertTriangle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import './Sidebar.css';

interface NavItem {
    to: string;
    icon: React.ReactNode;
    label: string;
}

const navItems: NavItem[] = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/products', icon: <Package size={20} />, label: 'Products' },
    { to: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'Orders' },
    { to: '/admin/low-stock', icon: <AlertTriangle size={20} />, label: 'Low Stock' },
];

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                {!isCollapsed && <span className="sidebar-title">Admin Panel</span>}
                <button
                    className="sidebar-toggle"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        title={isCollapsed ? item.label : undefined}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
