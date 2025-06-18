import React, { useState } from 'react';

interface SearchBarProps {
    onSearch: (term: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = "Rechercher par nom, email, numéro de série..." }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        onSearch(term);
    };

    const clearSearch = () => {
        setSearchTerm('');
        onSearch('');
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'white',
            border: '2px solid #3498db',
            borderRadius: '25px',
            padding: '10px 20px',
            margin: '20px 0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
        }}>
            <span style={{ marginRight: '10px', fontSize: '18px' }}>🔍</span>
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder={placeholder}
                style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '16px',
                    backgroundColor: 'transparent'
                }}
            />
            {searchTerm && (
                <button
                    onClick={clearSearch}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#e74c3c',
                        marginLeft: '10px'
                    }}
                    title="Effacer la recherche"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

export default SearchBar;
