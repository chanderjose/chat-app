import type { Message as MessageType } from '@/types/chat';
import { cn } from '@/lib/utils';

interface MessageProps {
    message: MessageType;
    isOwn: boolean;
}

export function Message({ message, isOwn }: MessageProps) {
    const time = new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className={cn(
            "flex",
            isOwn ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "max-w-[70%] rounded-2xl px-4 py-2",
                isOwn
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
            )}>
                <p className="text-sm">{message.content}</p>
                <span className={cn(
                    "text-xs mt-1 block",
                    isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                    {time}
                </span>
            </div>
        </div>
    );
}
