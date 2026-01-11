import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import keycloak, {
    initKeycloak,
    login,
    logout,
    hasRole,
    getUsername,
    getUserId,
    getEmail,
    getRoles,
    refreshToken
} from '../services/keycloak';
import type { User } from '../types/auth.types';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    isAdmin: boolean;
    isClient: boolean;
    login: () => void;
    logout: () => void;
    getToken: () => string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const initialized = useRef(false);

    useEffect(() => {
        // Prevent double initialization in React StrictMode
        if (initialized.current) {
            return;
        }
        initialized.current = true;

        const init = async () => {
            try {
                const authenticated = await initKeycloak();
                setIsAuthenticated(authenticated);

                if (authenticated) {
                    setUser({
                        id: getUserId() || '',
                        username: getUsername() || '',
                        email: getEmail(),
                        roles: getRoles(),
                    });
                }
            } catch (error) {
                console.error('Auth initialization failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        init();

        // Token refresh interval - every 60 seconds
        const refreshInterval = setInterval(async () => {
            if (keycloak.authenticated) {
                await refreshToken();
            }
        }, 60000);

        return () => clearInterval(refreshInterval);
    }, []);

    // Check roles after authentication state changes
    const isAdmin = isAuthenticated && hasRole('ADMIN');
    const isClient = isAuthenticated && (hasRole('CLIENT') || hasRole('ADMIN'));

    const value: AuthContextType = {
        isAuthenticated,
        isLoading,
        user,
        isAdmin,
        isClient,
        login,
        logout,
        getToken: () => keycloak.token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
