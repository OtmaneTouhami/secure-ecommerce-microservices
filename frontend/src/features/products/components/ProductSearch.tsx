import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Input from '@/components/common/Input';
import './ProductSearch.css';

interface ProductSearchProps {
    onSearch: (query: string) => void;
    placeholder?: string;
}

const ProductSearch = ({ onSearch, placeholder = 'Search products...' }: ProductSearchProps) => {
    const [query, setQuery] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    return (
        <div className="product-search">
            <Search size={18} className="search-icon" />
            <Input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
            />
        </div>
    );
};

export default ProductSearch;
