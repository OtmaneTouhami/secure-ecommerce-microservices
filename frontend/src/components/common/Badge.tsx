import type { ReactNode } from 'react';
import './Badge.css';

interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
    className?: string;
}

const Badge = ({ children, variant = 'default', className = '' }: BadgeProps) => {
    return (
        <span className={`badge badge-${variant} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
