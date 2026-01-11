import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield } from 'lucide-react';
import './UserMenu.css';

const UserMenu = () => {
    const { user, isAdmin, logout } = useAuth();

    if (!user) return null;

    return (
        <div className="user-menu">
            <div className="user-info">
                <User size={20} />
                <span className="username">{user.username}</span>
                {isAdmin && (
                    <span className="role-badge admin">
                        <Shield size={14} />
                        Admin
                    </span>
                )}
            </div>
            <button className="logout-btn" onClick={logout}>
                <LogOut size={18} />
                Logout
            </button>
        </div>
    );
};

export default UserMenu;
