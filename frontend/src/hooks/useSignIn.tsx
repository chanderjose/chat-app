import { useState } from 'react';
import { apiService } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/errors';

export function useSignIn() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { loginStateUpdate } = useAuth();

    const signIn = async (username: string) => {
        setIsLoading(true);
        setError(null);
        try {
            // Backend should set the long-lived refresh token in a secure HttpOnly cookie
            const data = await apiService.signIn(username);

            loginStateUpdate({ username, status: 'ACTIVE' }, data.accessToken);
        } catch (err: unknown) {
            const errorMessage: string = getErrorMessage(err);
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { signIn, isLoading, error };
}