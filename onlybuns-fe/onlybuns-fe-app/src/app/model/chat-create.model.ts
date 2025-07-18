export interface ChatCreate{
    name: string | null;
    type: string;
    participantIds?: number[];
    adminId: number;
}