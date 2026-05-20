export interface User {
    username: string;
}

export interface Message {
    id: string;
    sender: string;
    recipient: string;
    content: string;
    createdAt: number;
}
