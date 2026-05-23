import { apiClient } from "@/api/apiClient";

export const apiService = {
    signIn: (username: string) => {
        return apiClient("api/auth/login", {
            method: "POST",
            headers: [],
            body: JSON.stringify({ username }),
            credentials: "include",
        });
    },

    listUsers: () => {
        return apiClient("api/users", {
            method: "GET",
            headers: [],
            body: null,
            credentials: "include",
        });
    },

    signOut: () => {
        return apiClient("api/auth/logout", {
            method: "POST",
            headers: [],
            body: null,
        });
    },
}