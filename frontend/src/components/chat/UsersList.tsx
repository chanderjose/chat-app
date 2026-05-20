import type { User as UserType } from '@/types/chat';
import { User } from '@/components/chat/User';
import { Separator } from '@/components/ui/separator';

interface UsersListProps {
    users: UserType[];
    currentUser: string | null;
    selectedUser: string | null;
    unreadCounts: Record<string, number>;
    onSelectUser: (user: UserType) => void;
    onLogout: () => void;
    isLoading: boolean;
}

export function UsersList({ users, currentUser, selectedUser, unreadCounts, onSelectUser, onLogout, isLoading }: UsersListProps) {
    const initial = currentUser.charAt(0).toUpperCase();

    return (
        <div className="flex flex-col h-full">
            <div className="p-4">
                <h2 className="text-lg font-heading font-semibold flex items-center gap-3 w-full p-3 rounded-lg transition-colors text-left cursor-pointer">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold shrink-0 bg-primary-foreground text-primary">
                        {initial}
                    </div>
                    <div className="flex flex-col">
                        <span>{currentUser}</span>
                        <button
                            onClick={onLogout}
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors text-left"
                        >
                            Logout
                        </button>
                    </div>
                </h2>
            </div>
            <Separator />
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        Loading users...
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        No users available
                    </div>
                ) : (
                    users.map(user => (
                        <User
                            key={user.username}
                            user={user}
                            isSelected={selectedUser === user.username}
                            unreadCount={unreadCounts[user.username] ?? 0}
                            onSelect={onSelectUser}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
