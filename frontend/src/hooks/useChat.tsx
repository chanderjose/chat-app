import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { apiService } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { tokenStore } from '@/api/tokenStore';
import type { User, Message } from '@/types/chat';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function useChat() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [conversations, setConversations] = useState<Map<string, Message[]>>(new Map());
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user: currentUser } = useAuth();
    const socketRef = useRef<ReturnType<typeof io> | null>(null);
    const selectedUserRef = useRef<User | null>(null);

    useEffect(() => {
        const socket = io(SOCKET_URL, {
            auth: { token: tokenStore.getToken() },
        });

        socket.on('user_connected', (user: User) => {
            const loadUsers = async () => {
                setIsLoadingUsers(true);
                setError(null);
                try {
                    const data = await apiService.listUsers();
                    const filtered = data.users.filter(u => u.username !== currentUser?.username);
                    setUsers(filtered);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setIsLoadingUsers(false);
                }
            };

            loadUsers();
        });

        socket.on('user_disconnected', (user: User) => {
            const loadUsers = async () => {
                setIsLoadingUsers(true);
                setError(null);
                try {
                    const data = await apiService.listUsers();
                    const filtered = data.users.filter(u => u.username !== currentUser?.username);
                    setUsers(filtered);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setIsLoadingUsers(false);
                }
            };
            loadUsers();
        });

        socket.on('message', (msg: Message) => {
            setConversations(prev => {
                const updated = new Map(prev);
                const otherId = msg.sender;
                const existing = updated.get(otherId) ?? [];
                updated.set(otherId, [...existing, msg]);
                return updated;
            });

            setUnreadCounts(prev => {
                if (msg.sender === selectedUserRef.current?.username) return prev;
                return { ...prev, [msg.sender]: (prev[msg.sender] ?? 0) + 1 };
            });
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const loadUsers = async () => {
            setIsLoadingUsers(true);
            setError(null);
            try {
                const data = await apiService.listUsers();
                const filtered = data.users.filter(u => u.username !== currentUser?.username);
                setUsers(filtered);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        loadUsers();
    }, []);

    const selectUser = (user: User) => {
        setSelectedUser(user);
        selectedUserRef.current = user;
        setUnreadCounts(prev => ({ ...prev, [user.username]: 0 }));
    };

    const sendMessage = (content: string) => {
        if (!selectedUser || !content.trim() || !socketRef.current) return;

        const localMessage: Message = {
            id: `temp_${Date.now()}`,
            sender: currentUser?.username ?? 'unknown',
            recipient: selectedUser.username,
            content,
            createdAt: Date.now(),
        };

        setConversations(prev => {
            const updated = new Map(prev);
            const existing = updated.get(selectedUser.username) ?? [];
            updated.set(selectedUser.username, [...existing, localMessage]);

            console.log('updated conversation', updated);

            return updated;
        });

        socketRef.current.emit('message', {
            recipient: localMessage.recipient,
            content,
            createdAt: localMessage.createdAt
        });
    };

    const messages = selectedUser ? (conversations.get(selectedUser.username) ?? []) : [];

    return {
        users,
        selectedUser,
        messages,
        unreadCounts,
        isLoadingUsers,
        isLoadingMessages: false,
        isSending: false,
        error,
        selectUser,
        sendMessage,
        currentUser,
    };
}
