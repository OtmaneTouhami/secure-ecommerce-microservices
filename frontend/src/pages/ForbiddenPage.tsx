import { useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import Button from '@/components/common/Button';
import './ErrorPages.css';

const ForbiddenPage = () => {
    const navigate = useNavigate();

    return (
        <div className="error-page">
            <ShieldX size={64} className="error-icon" />
            <h1>403 - Forbidden</h1>
            <p>You don't have permission to access this page.</p>
            <Button onClick={() => navigate('/')}>
                Go to Home
            </Button>
        </div>
    );
};

export default ForbiddenPage;
