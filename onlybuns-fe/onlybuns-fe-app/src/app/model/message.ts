export interface Message {
    id: number,
    chatId: number,
    senderId: number,
    receiverIds: number[],
    message: string,
    dateTime: string
}
