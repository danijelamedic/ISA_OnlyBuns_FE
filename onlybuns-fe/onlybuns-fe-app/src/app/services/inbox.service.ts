import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient } from '@angular/common/http';
import { Chat } from '../model/chat.model';
import { Message } from '../model/message';

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
}