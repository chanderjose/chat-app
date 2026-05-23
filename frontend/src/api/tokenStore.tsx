let accessToken: string | null = null;

export const tokenStore = {
    setToken: (token: string) => {
        accessToken = token;
    },
    getToken: (): string | null => accessToken,
    clearToken: (): void => {
        accessToken = null;
    },
};