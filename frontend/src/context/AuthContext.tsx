import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tokenStore } from '@/api/tokenStore';
import { apiService } from '@/services/apiService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

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
                const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
                const res = await fetch(`${BASE_URL}/api/auth/refresh`, { method: 'POST', credentials: 'include' });

                if (res.ok) {
                    const data = await res.json();
                    tokenStore.setToken(data.accessToken);
                    setUser(data.user); // If your refresh endpoint also returns user info
                    setIsAuthenticated(true);
                }
            } catch (err) {
                console.log('No active session found.');
            } finally {
                setIsInitializing(false);
            }
        };

        bootSession();
    }, []);

    // useEffect(() => {
    //     window.addEventListener('auth:unauthorized', logout);
    //     return () => window.removeEventListener('auth:unauthorized', logout);
    // }, [/*logout*/]);

    const loginStateUpdate = (userData, accessToken) => {
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

export function useAuth() {
    return useContext(AuthContext);
}