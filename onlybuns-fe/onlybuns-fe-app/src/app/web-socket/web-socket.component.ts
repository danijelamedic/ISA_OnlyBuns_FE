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
      toId: new FormControl(null)
    })

    this.userForm = new FormGroup({
      fromId: new FormControl(null, [Validators.required])
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

  sendMessageUsingSocket() {
    if (this.form.valid) {
      let message: Message = {
        message: this.form.value.message,
        fromId: this.userForm.value.fromId,
        toId: this.form.value.toId
      };

      this.stompClient.send("/socket-subscriber/send/message", {}, JSON.stringify(message));
    }
  }

  sendMessageUsingRest() {
    if (this.form.valid) {
      let message: Message = {
        message: this.form.value.message,
        fromId: this.userForm.value.fromId,
        toId: this.form.value.toId
      };

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
      this.isCustomSocketOpened = true;
      this.stompClient.subscribe("/socket-publisher/" + this.userForm.value.fromId, (message: { body: string; }) => {
        this.handleResult(message);
      });
    }
  }

  handleResult(message: { body: string; }) {
    if (message.body) {
      let messageResult: Message = JSON.parse(message.body);
      this.messages.push(messageResult);
    }
  }

}
