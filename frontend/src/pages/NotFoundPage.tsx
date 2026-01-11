import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import Button from '@/components/common/Button';
import './ErrorPages.css';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="error-page">
            <FileQuestion size={64} className="error-icon" />
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')}>
                Go to Home
            </Button>
        </div>
    );
};

export default NotFoundPage;
