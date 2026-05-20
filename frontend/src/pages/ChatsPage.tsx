import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/hooks/useChat';
import { UsersList } from '@/components/chat/UsersList';
import { Chat } from '@/components/chat/Chat';

export default function ChatsPage() {
    const { isAuthenticated, isInitializing, logout } = useAuth();
    const {
        users,
        selectedUser,
        messages,
        unreadCounts,
        isLoadingUsers,
        isLoadingMessages,
        isSending,
        selectUser,
        sendMessage,
        currentUser,
    } = useChat();

    if (isInitializing) {
        return (
            <div className="flex items-center justify-center h-screen text-muted-foreground">
                Verifying session security...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex h-screen bg-background">
            <div className="w-72 shrink-0 border-r border-border">
                <UsersList
                    users={users}
                    currentUser={currentUser.username}
                    selectedUser={selectedUser?.username ?? null}
                    unreadCounts={unreadCounts}
                    onSelectUser={selectUser}
                    onLogout={logout}
                    isLoading={isLoadingUsers}
                />
            </div>
            <div className="flex-1">
                <Chat
                    messages={messages}
                    selectedUser={selectedUser}
                    currentUser={currentUser?.username ?? null}
                    isLoadingMessages={isLoadingMessages}
                    isSending={isSending}
                    onSendMessage={sendMessage}
                />
            </div>
        </div>
    );
}
