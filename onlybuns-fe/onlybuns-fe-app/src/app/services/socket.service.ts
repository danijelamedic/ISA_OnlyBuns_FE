import { Injectable } from '@angular/core';
import * as SockJS from 'sockjs-client';
import { Client, IMessage, Stomp } from '@stomp/stompjs';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Message } from '../model/message';
import { Chat } from '../model/chat.model';


@Injectable({
  providedIn: 'root',
})
export class SocketService {
  url: string = "ws://localhost:8080/socket";
  restUrl:string = environment.url + "/sendMessageRest";

  constructor(private http: HttpClient) { }

  post(data: Message) {
    return this.http.post<Message>(this.url, data)
      .pipe(map((data: Message) => { return data; }));
  }

  postRest(data: Message) {
    return this.http.post<Message>('http://localhost:8080/api/message/send', data)
      .pipe(map((data: Message) => { return data; }));
  }

}