export interface User {
    id: string;
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
}

export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    token: string | null;
}
