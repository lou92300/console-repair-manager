// Service d'authentification pour le frontend
const API_BASE_URL = 'http://localhost:3001/api';

export interface User {
    id: string;
    username: string;
    role: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: User;
    error?: string;
}

class AuthService {
    private static TOKEN_KEY = 'repair_manager_token';
    private static USER_KEY = 'repair_manager_user';

    // Connexion
    static async login(username: string, password: string): Promise<AuthResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success && data.token) {
                // Stocker le token et les infos utilisateur
                localStorage.setItem(this.TOKEN_KEY, data.token);
                localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
                
                console.log('✅ Connexion réussie:', data.user.username);
                return data;
            } else {
                console.error('❌ Échec de connexion:', data.error);
                return { success: false, error: data.error || 'Connexion échouée' };
            }
        } catch (error) {
            console.error('❌ Erreur de connexion:', error);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    }

    // Déconnexion
    static logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        console.log('👋 Déconnexion réussie');
    }

    // Obtenir le token actuel
    static getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    // Obtenir l'utilisateur actuel
    static getCurrentUser(): User | null {
        const userJson = localStorage.getItem(this.USER_KEY);
        if (userJson) {
            try {
                return JSON.parse(userJson);
            } catch {
                return null;
            }
        }
        return null;
    }

    // Vérifier si l'utilisateur est connecté
    static isAuthenticated(): boolean {
        const token = this.getToken();
        const user = this.getCurrentUser();
        return !!(token && user);
    }

    // Vérifier si l'utilisateur est admin
    static isAdmin(): boolean {
        const user = this.getCurrentUser();
        return user?.role === 'admin';
    }

    // Obtenir les headers d'authentification
    static getAuthHeaders(): Record<string, string> {
        const token = this.getToken();
        if (token) {
            return {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            };
        }
        return {
            'Content-Type': 'application/json',
        };
    }

    // Requête authentifiée
    static async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
        const headers = {
            ...this.getAuthHeaders(),
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        // Si le token a expiré, déconnecter
        if (response.status === 401) {
            this.logout();
            window.location.href = '/';
        }

        return response;
    }

    // Vérifier la validité du token (simple vérification de connectivité)
    static async validateToken(): Promise<boolean> {
        try {
            const response = await this.authenticatedFetch(`${API_BASE_URL}/test`);
            return response.ok;
        } catch {
            return false;
        }
    }

    // Décoder le payload du JWT côté client (sans vérification de signature)
    // Utilisé uniquement pour récupérer l'expiration
    static isTokenExpired(): boolean {
        const token = this.getToken();
        if (!token) return true;

        try {
            // Décoder le payload du JWT (partie centrale entre les points)
            const payload = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payload));
            
            // Vérifier l'expiration
            if (decodedPayload.exp) {
                const now = Math.floor(Date.now() / 1000);
                return decodedPayload.exp < now;
            }
            
            return false;
        } catch {
            return true;
        }
    }
}

export default AuthService;
