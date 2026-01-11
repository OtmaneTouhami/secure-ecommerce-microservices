import type { InputHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = ({ label, error, id, className = '', ...props }: InputProps) => {
    return (
        <div className="input-wrapper">
            {label && <label htmlFor={id} className="input-label">{label}</label>}
            <input
                id={id}
                className={`input ${error ? 'input-error' : ''} ${className}`}
                {...props}
            />
            {error && <span className="input-error-message">{error}</span>}
        </div>
    );
};

export default Input;
