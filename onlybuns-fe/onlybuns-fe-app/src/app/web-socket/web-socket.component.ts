import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SocketService } from '../services/socket.service';
import { Message } from '../model/message';
import { environment } from 'src/environments/environment';

import * as SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

@Component({
  selector: 'app-socket',
  templateUrl: './web-socket.component.html',
  styleUrls: ['./web-socket.component.css']
})
export class SocketComponent implements OnInit {

  private serverUrl = environment.url + 'socket'
  private stompClient: any;
  form!: FormGroup;
  userForm!: FormGroup;

  isLoaded: boolean = false;
  isCustomSocketOpened = false;
  messages: Message[] = [];

  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.form = new FormGroup({
      message: new FormControl(null, [Validators.required]),
      chatId: new FormControl(null, [Validators.required])
    })

    this.userForm = new FormGroup({
      fromId: new FormControl(null, [Validators.required]),
      toId: new FormControl(null),
    })

    this.initializeWebSocketConnection();
  }

  initializeWebSocketConnection() {
    let ws = new WebSocket(this.serverUrl); 
    this.stompClient = Stomp.over(ws); 
    let that = this;
  
    this.stompClient.connect({}, function () {
      that.isLoaded = true;
      that.openGlobalSocket();
    });
  }

  sendMessageUsingRest() {
    if (this.userForm.valid) {
      let rawToId = this.userForm.value.toId;
      let recieverIds: number[] = [];

      if (rawToId) {
        recieverIds = rawToId.split(",")
                            .map((id: string) => Number(id.trim()))
                            .filter((id: number) => !isNaN(id));
      }
      let message: Message = {
        message: this.form.value.message,
        senderId: this.userForm.value.fromId,
        receiverIds: recieverIds,
        chatId: 0,
        dateTime: '',
        id: 0,
        chatKey: ''
      };

      console.log(message);
      this.socketService.postRest(message).subscribe(res => {
        console.log(res);
      })
    }
  }

  openGlobalSocket() {
    if (this.isLoaded) {
      this.stompClient.subscribe("/socket-publisher", (message: { body: string; }) => {
        this.handleResult(message);
      });
    }
  }

  openSocket() {
    if (this.isLoaded) {
    let rawToId = this.userForm.value.toId;
      let recieverIds: number[] = [];

      if (rawToId) {
        recieverIds = rawToId.split(",")
                            .map((id: string) => Number(id.trim()))
                            .filter((id: number) => !isNaN(id));
      }

      this.isCustomSocketOpened = true;
      this.stompClient.subscribe("/topic/chat." + this.generateChatKey(this.userForm.value.fromId, recieverIds), (message: { body: string; }) => {
        this.handleResult(message);
      });
      console.log("chat key u open socketu: ", this.generateChatKey(this.userForm.value.fromId, recieverIds));
    }
  }

  handleResult(message: { body: string; }) {
    if (message.body) {
      let messageResult: Message = JSON.parse(message.body);
      this.messages.push(messageResult);
    }
  }

  generateChatKey(senderId: number, receiverIds: number[]): string {
  if (receiverIds.length === 1) {
    const ids = [senderId, receiverIds[0]].sort((a, b) => a - b);
    console.log("ChatKey:", ids.join('_'));
    return ids.join('_');
  } else {
    console.log("ChatKey:", 'group_' + receiverIds.sort().join('_'));
    return 'group_' + receiverIds.sort().join('_');
  }
}
}
