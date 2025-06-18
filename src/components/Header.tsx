import React from 'react';
import AuthService from '../services/authService';

interface HeaderProps {
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
    const user = AuthService.getCurrentUser();

    const handleLogout = () => {
        AuthService.logout();
        onLogout();
    };

    return (
        <header style={{
            backgroundColor: '#2c3e50',
            color: 'white',
            padding: '15px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '20px' }}>
                    🎮 Gestionnaire de Réparations
                </h1>
                <span style={{
                    marginLeft: '20px',
                    fontSize: '12px',
                    backgroundColor: '#27ae60',
                    padding: '4px 8px',
                    borderRadius: '10px'
                }}>
                    🔒 Sécurisé
                </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        👤 {user?.username}
                    </div>
                    <div style={{ fontSize: '11px', color: '#bdc3c7' }}>
                        {user?.role === 'admin' ? '🔑 Administrateur Alexandre' : '👥 Utilisateur'}
                    </div>
                </div>
                
                <button
                    onClick={handleLogout}
                    style={{
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 15px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}
                >
                    🚪 Déconnexion
                </button>
            </div>
        </header>
    );
};

export default Header;
