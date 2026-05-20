import { useState, useRef, useEffect } from 'react';
import type { User as UserType, Message as MessageType } from '@/types/chat';
import { Message } from '@/components/chat/Message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Send } from 'lucide-react';

interface ChatProps {
    messages: MessageType[];
    selectedUser: UserType | null;
    currentUser: string | null;
    isLoadingMessages: boolean;
    isSending: boolean;
    onSendMessage: (content: string) => void;
}

export function Chat({ messages, selectedUser, currentUser, isLoadingMessages, isSending, onSendMessage }: ChatProps) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!selectedUser) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select a user to start chatting</p>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isSending) return;
        onSendMessage(input.trim());
        setInput('');
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted-foreground/20 text-foreground text-xs font-semibold">
                    {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-lg font-heading font-semibold">{selectedUser.username}</h2>
            </div>
            <Separator />
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        Loading messages...
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        No messages yet. Say hello!
                    </div>
                ) : (
                    messages.map(msg => (
                        <Message
                            key={msg.id}
                            message={msg}
                            isOwn={msg.sender === currentUser}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <Separator />
            <form onSubmit={handleSubmit} className="p-4 flex gap-2">
                <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    disabled={isSending}
                    className="flex-1"
                />
                <Button type="submit" disabled={!input.trim() || isSending} size="icon">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
