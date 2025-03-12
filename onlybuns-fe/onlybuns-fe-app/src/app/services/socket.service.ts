import { Injectable } from '@angular/core';
import * as SockJS from 'sockjs-client';
import { Client, IMessage, Stomp } from '@stomp/stompjs';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Message } from '../model/message';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  url: string = environment.url + "api/socket";
  restUrl:string = environment.url + "/sendMessageRest";

  constructor(private http: HttpClient) { }

  post(data: Message) {
    return this.http.post<Message>(this.url, data)
      .pipe(map((data: Message) => { return data; }));
  }

  postRest(data: Message) {
    return this.http.post<Message>(this.restUrl, data)
      .pipe(map((data: Message) => { return data; }));
  }
}