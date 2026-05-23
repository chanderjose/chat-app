export interface User {
    username: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface Message {
    id: string;
    sender: string;
    recipient: string;
    content: string;
    createdAt: number;
}
