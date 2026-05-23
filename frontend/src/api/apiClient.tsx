import { getErrorMessage } from "@/lib/errors";
import { tokenStore } from "./tokenStore";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || '';

let isRefreshing = false;
let refreshSubscribers: Array<(newToken: string) => void> = [];

// Helper to queue requests while the token is being refreshed
function subscribeTokenRefresh(cb: (newToken: string) => void) {
    refreshSubscribers.push(cb);
}

// Helper to execute all queued requests once the token is renewed
function onRefreshed(newToken: string) {
    refreshSubscribers.forEach((cb) => cb(newToken));
    refreshSubscribers = [];
}

export async function apiClient(endpoint: string, options: RequestInit = { headers: {}, credentials: 'include' }) {
    const token = tokenStore.getToken();

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...token ? { 'Authorization': `Bearer ${token}` } : {},
        ...options.headers,
    };

    const config: RequestInit = {
        ...options,
        headers,
        credentials: options.credentials ?? 'include',
    };

    const response = await fetch(`${BASE_API_URL}/${endpoint}`, config);

    if (!response.ok) {
        // Intercept 401 Unauthorized globally
        if (response.status === 401) {
            // If it's already the refresh endpoint failing, stop to prevent infinite loops
            if (endpoint === 'api/auth/refresh') {
                tokenStore.clearToken();
                window.dispatchEvent(new Event('auth:unauthorized'));
                throw new Error('Session expired');
            }

            // Wrap the retry logic in a promise
            const retryOriginalRequest = new Promise((resolve) => {
                subscribeTokenRefresh((newToken) => {
                    // Replace the old token with the new one and re-fetch
                    const headers = new Headers(config.headers);
                    headers.set('Authorization', `Bearer ${newToken}`);
                    config.headers = headers;
                    resolve(fetch(`${BASE_API_URL}/${endpoint}`, config).then(res => res.json()));
                });
            });

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    // Hit the silent refresh endpoint
                    const refreshResponse = await fetch(`${BASE_API_URL}/api/auth/refresh`, {
                        method: 'POST',
                        credentials: 'include', // Ensures the refresh cookie is sent
                        headers: { 'Content-Type': 'application/json' },
                    });

                    if (!refreshResponse.ok) {
                        throw new Error('Refresh token invalid or expired');
                    }

                    const data = await refreshResponse.json();
                    // Assume backend returns: { accessToken: "..." }
                    tokenStore.setToken(data.accessToken);

                    isRefreshing = false;
                    onRefreshed(data.accessToken); // Wake up queued requests
                } catch (err: unknown) {
                    isRefreshing = false;
                    tokenStore.clearToken();
                    window.dispatchEvent(new Event('auth:unauthorized')); // Kick user out

                    throw getErrorMessage(err);
                }
            }

            return retryOriginalRequest;
        }

        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP Error: ${response.status}`;
        throw new Error(errorMessage);
    }

    const data = await response.json();

    return data;
};
