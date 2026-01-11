import './Spinner.css';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
}

const Spinner = ({ size = 'md', fullScreen = false }: SpinnerProps) => {
    if (fullScreen) {
        return (
            <div className="spinner-overlay">
                <div className={`spinner spinner-${size}`} />
            </div>
        );
    }

    return <div className={`spinner spinner-${size}`} />;
};

export default Spinner;
