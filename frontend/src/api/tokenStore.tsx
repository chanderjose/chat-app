let accessToken = null;

export const tokenStore = {
    setToken: (token) => {
        accessToken = token;
    },
    getToken: () => accessToken,
    clearToken: () => {
        accessToken = null;
    },
};