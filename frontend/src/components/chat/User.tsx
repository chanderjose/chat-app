import type { User as UserType } from '@/types/chat';
import { cn } from '@/lib/utils';

interface UserProps {
    user: UserType;
    isSelected: boolean;
    unreadCount: number;
    onSelect: (user: UserType) => void;
}

export function User({ user, isSelected, unreadCount, onSelect }: UserProps) {
    const initial = user.username.charAt(0).toUpperCase();

    return (
        <button
            type="button"
            onClick={() => onSelect(user)}
            className={cn(
                "flex flex-col w-full p-3 rounded-lg transition-colors text-left cursor-pointer",
                isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
            )}
        >
            <div className='flex items-center gap-3 '>
                <div className="relative inline-block">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold shrink-0 bg-primary-foreground text-primary">
                        {initial}
                    </span>
                    <span className="absolute bottom-0 right-0 flex h-3 w-3">
                        <span className={cn(
                            "absolute inline-flex h-full w-full rounded-full opacity-75 ",
                            user.status === 'ACTIVE' ? "animate-ping bg-green-400" : "bg-gray-400"
                            )}></span>
                        <span className={cn(
                            "relative inline-flex h-3 w-3 rounded-full ring-2 ring-white ",
                            user.status === 'ACTIVE' ? "bg-green-500" : "bg-gray-400"
                            )}></span>
                    </span>
                </div>
                <span className="font-medium truncate flex-1">{user.username}</span>
                {unreadCount > 0 && (
                    <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {unreadCount}
                    </span>
                )}
            </div>
        </button>
    );
}
