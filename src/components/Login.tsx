import React, { useState } from 'react';
import AuthService from '../services/authService';

interface LoginProps {
    onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await AuthService.login(username, password);
            
            if (result.success) {
                onLoginSuccess();
            } else {
                setError(result.error || 'Erreur de connexion');
            }
        } catch (error) {
            setError('Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>
                        🔐 Connexion Sécurisée
                    </h1>
                    <p style={{ color: '#7f8c8d' }}>
                        Gestionnaire de Réparations
                    </p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fee',
                        color: '#d63031',
                        padding: '10px',
                        borderRadius: '5px',
                        marginBottom: '20px',
                        border: '1px solid #fab1a0'
                    }}>
                        ❌ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold',
                            color: '#2c3e50'
                        }}>
                            👤 Nom d'utilisateur
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '16px',
                                boxSizing: 'border-box'
                            }}
                            placeholder="Entrez votre nom d'utilisateur"
                        />
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold',
                            color: '#2c3e50'
                        }}>
                            🔑 Mot de passe
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '16px',
                                boxSizing: 'border-box'
                            }}
                            placeholder="Entrez votre mot de passe"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '15px',
                            backgroundColor: isLoading ? '#95a5a6' : '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.3s'
                        }}
                    >
                        {isLoading ? '🔄 Connexion en cours...' : '🚀 Se connecter'}
                    </button>
                </form>

                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#e8f4f8',
                    borderRadius: '5px',
                    fontSize: '12px',
                    color: '#5a6c7d'
                }}>
                    <strong>🛡️ Sécurité:</strong><br/>
                    • Authentification JWT<br/>
                    • Données chiffrées<br/>
                    • Sessions sécurisées
                </div>
            </div>
        </div>
    );
};

export default Login;
