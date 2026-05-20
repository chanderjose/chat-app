import { useState } from 'react';
import { apiService } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';

export function useSignIn() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { loginStateUpdate } = useAuth();

    const signIn = async (username: string) => {
        setIsLoading(true);
        setError(null);
        try {
            // Backend should set the long-lived refresh token in a secure HttpOnly cookie
            const data = await apiService.signIn(username);

            loginStateUpdate({ username }, data.accessToken);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { signIn, isLoading, error };
}