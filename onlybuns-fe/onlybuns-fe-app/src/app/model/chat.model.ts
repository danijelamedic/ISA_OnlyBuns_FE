export interface Chat{
    id: number;
    chatKey: string;
    name: string | null;
    type: string;
    receiverUsername?: string,
    adminId?: number;
}