import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient } from '@angular/common/http';
import { Chat } from '../model/chat.model';
import { Message } from '../model/message';
import { ChatCreate } from '../model/chat-create.model';
import { User } from '../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class InboxService {

    constructor(private http: HttpClient){}

    getAllChats(): Observable<Chat[]>{
        return this.http.get<Chat[]>('http://localhost:8080/api/chats/getAll');
    }

    getChatName(id: number): Observable<string>{
        return this.http.get(`http://localhost:8080/api/chats/getChatName/${id}`, {responseType: 'text'});
    }

    getReceiverUsername(id: number): Observable<string>{
        return this.http.get(`http://localhost:8080/api/chats/getReceiverUsername/${id}`, {responseType: 'text'});
    }

    getMessagesByChatId(id: number): Observable<Message[]>{
        return this.http.get<Message[]>(`http://localhost:8080/api/message/getByChatId/${id}`);
    }

    getChatsByUser(id: number): Observable<Chat[]>{
        return this.http.get<Chat[]>(`http://localhost:8080/api/chats/getByUser/${id}`);
    }

    getParticipantsByChatId(id: number): Observable<number[]>{
        return this.http.get<number[]>(`http://localhost:8080/api/chats/getParticipants/${id}`);
    }

    createGroup(chat: ChatCreate): Observable<Chat>{
        return this.http.post<Chat>(`http://localhost:8080/api/chats/group`, chat);
    }

    getChatKey(id: number): Observable<string>{
        return this.http.get<string>(`http://localhost:8080/api/chats/getKeyById/${id}`);
    }

    removeUserFromChat(userId: number, chatId: number): Observable<void>{
        return this.http.put<void>(`http://localhost:8080/api/chats/deleteUserFromChat/${userId}/${chatId}`, null);
    }
}