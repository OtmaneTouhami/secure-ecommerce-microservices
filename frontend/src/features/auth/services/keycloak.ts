import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
};

// Create a single instance
const keycloak = new Keycloak(keycloakConfig);

// Track initialization state
let isInitialized = false;
let initPromise: Promise<boolean> | null = null;

export const initKeycloak = async (): Promise<boolean> => {
    // Return existing promise if initialization is in progress
    if (initPromise) {
        return initPromise;
    }

    // Return cached result if already initialized
    if (isInitialized) {
        return keycloak.authenticated || false;
    }

    initPromise = (async () => {
        try {
            const authenticated = await keycloak.init({
                onLoad: 'check-sso',
                pkceMethod: 'S256',
                checkLoginIframe: false,
                silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
            });
            isInitialized = true;
            return authenticated;
        } catch (error) {
            console.error('Keycloak init failed:', error);
            isInitialized = true; // Mark as initialized even on error to prevent retries
            return false;
        }
    })();

    return initPromise;
};

export const login = () => keycloak.login();

export const logout = () => keycloak.logout({
    redirectUri: window.location.origin
});

export const getToken = () => keycloak.token;

export const isAuthenticated = () => !!keycloak.authenticated;

export const hasRole = (role: string): boolean => {
    return keycloak.hasRealmRole(role);
};

export const getUsername = (): string | undefined => {
    return keycloak.tokenParsed?.preferred_username as string | undefined;
};

export const getUserId = (): string | undefined => {
    return keycloak.tokenParsed?.sub;
};

export const getEmail = (): string | undefined => {
    return keycloak.tokenParsed?.email as string | undefined;
};

export const getRoles = (): string[] => {
    return keycloak.tokenParsed?.realm_access?.roles || [];
};

export const refreshToken = async (): Promise<boolean> => {
    if (!keycloak.authenticated) {
        return false;
    }

    try {
        const refreshed = await keycloak.updateToken(30);
        return refreshed;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
};

export default keycloak;
