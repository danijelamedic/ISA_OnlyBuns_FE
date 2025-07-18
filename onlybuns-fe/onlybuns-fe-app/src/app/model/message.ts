export interface Message {
    id?: number,
    chatId?: number,
    senderId: number,
    senderUsername?: string,
    receiverIds: number[],
    message: string,
    dateTime: string,
    chatKey: string
}
