import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tokenStore } from '@/api/tokenStore';
import { apiService } from '@/services/apiService';
import { apiClient } from '@/api/apiClient';
import type { User } from '@/types/chat';

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    loginStateUpdate: (userData: User, accessToken: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isInitializing, setIsInitializing] = useState<boolean>(true);

    const logout = useCallback(async () => {
        try {
            await apiService.signOut();
        } catch {
            // ignore
        } finally {
            tokenStore.clearToken();
            setUser(null);
            setIsAuthenticated(false);
        }
    }, []);

    // On boot, perform a silent refresh immediately to see if the user has an active cookie session
    useEffect(() => {
        const bootSession = async () => {
            try {
                const data = await apiClient('api/auth/refresh', { method: 'POST', credentials: 'include' });
                if (data && data.accessToken) {
                    tokenStore.setToken(data.accessToken);
                    // Ensure the User shape is satisfied (status is required on User)
                    setUser({ username: data.username, status: data.status ?? 'ACTIVE' } as User);
                    setIsAuthenticated(true);
                }
            } catch {
                console.log('No active session found.');
            } finally {
                setIsInitializing(false);
            }
        };

        console.log('performing boot session check...');

        bootSession();
    }, []);

    // useEffect(() => {
    //     window.addEventListener('auth:unauthorized', logout);
    //     return () => window.removeEventListener('auth:unauthorized', logout);
    // }, [/*logout*/]);

    const loginStateUpdate = (userData: User, accessToken: string) => {
        tokenStore.setToken(accessToken);
        setUser(userData);
        setIsAuthenticated(true);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isInitializing, loginStateUpdate, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}