import type { ReactNode } from 'react';
import './Card.css';

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

const Card = ({ children, className = '', onClick, hoverable = false }: CardProps) => {
    return (
        <div
            className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

const CardHeader = ({ children, className = '' }: CardHeaderProps) => (
    <div className={`card-header ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }: CardHeaderProps) => (
    <h3 className={`card-title ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }: CardHeaderProps) => (
    <p className={`card-description ${className}`}>{children}</p>
);

const CardContent = ({ children, className = '' }: CardHeaderProps) => (
    <div className={`card-content ${className}`}>{children}</div>
);

const CardFooter = ({ children, className = '' }: CardHeaderProps) => (
    <div className={`card-footer ${className}`}>{children}</div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
