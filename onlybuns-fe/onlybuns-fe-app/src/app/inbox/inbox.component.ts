import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { InboxService } from '../services/inbox.service';
import { Chat } from '../model/chat.model';
import { Message } from '../model/message';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SocketService } from '../services/socket.service';
import { environment } from 'src/environments/environment';
import { Stomp } from '@stomp/stompjs';
import { Observable, of, tap } from 'rxjs';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.css']
})
export class InboxComponent implements OnInit {
  @ViewChild('scrollMe') private messagesContainer!: ElementRef;
  loginForm: FormGroup;
  userId: number | null = null;
  private serverUrl = environment.url + 'socket'
  private stompClient: any;
  isLoaded: boolean = false;


  constructor(private inboxService: InboxService, 
              private fb: FormBuilder,
              private socketService: SocketService) {
    this.loginForm = this.fb.group({
      userId: ['']
    });
  }

  chats: Chat[] = [];
  chat: Chat = {
    id: 0,
    chatKey: '',
    name: '',
    type: '',
    receiverUsername: ''
  }

  selectedChatId?: number;
  chatParticipants: number[] = [];

  messages: Message[] = [];
  myMessages: Message[] = [];
  message: Message = {
    id: 0,
    chatId: 0,
    senderId: 0,
    receiverIds: [],
    message: '',
    dateTime: ''
  }
  newMessageText: string = '';


  ngOnInit(): void {
    if(this.userId)
      this.getChatsByUser(this.userId);
    this.initializeWebSocketConnection();
  }

  getChatsByUser(id: number): void{
    
    this.inboxService.getChatsByUser(id).subscribe({
      next: (response) => {
        if(Array.isArray(response)){
          this.chats = response;

          this.chats.forEach(chat => {
            this.inboxService.getChatName(chat.id).subscribe(name => {
              if(name){
                chat.name = name;
              }
              else{
                this.inboxService.getReceiverUsername(chat.id).subscribe(username => {
                  chat.receiverUsername = username;
                  console.log("Postavljen receiverUsername:", chat.receiverUsername);
                });
              }
            });
          });
          console.log("chats:", this.chats);

        }
        else{
          console.error('Response does not contain valid chat data');
        }
      },
      error: (err) => {
        console.error('Error fetching chats', err);
      }
    });
  }

  selectChat(id: number): void{
    this.selectedChatId = id;
    this.getMessagesByChat(this.selectedChatId);
    
    this.setChatParticipants().subscribe(() => {
      this.openSocket();
    });
  }

  getChatDisplayName(id?: number): string{
    const chat = this.chats.find(c => c.id === id);
    return chat?.name || chat?.receiverUsername || "chat";
  }

  getMessagesByChat(id: number): void{
    this.inboxService.getMessagesByChatId(id).subscribe({
      next: (response) => {
        this.messages = response;
        console.log("messages: ", this.messages);
        setTimeout(() => {
        this.scrollToBottom();
      }, 0);
        
      },
      error: (err) => {
        console.error('Error fetching messages', err);
      }
    })
  }

  setUserId(id: number): void{
    this.userId = id;
  }

  onLogin(): void {
    const inputId = this.loginForm.value.userId;
    if (inputId) {
      this.userId = +inputId;
      this.getChatsByUser(this.userId);
    }
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll failed', err);
    }
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

  sendMessage() {
    // this.setChatParticipants();
    if (!this.newMessageText.trim()) return;
    if (this.userId && this.chatParticipants) {
      //   recieverIds = rawToId.split(",")
      //                       .map((id: string) => Number(id.trim()))
      //                       .filter((id: number) => !isNaN(id));
      // }
      let message: Message = {
        message: this.newMessageText,
        senderId: this.userId,
        receiverIds: this.chatParticipants,
        chatId: 0, 
        dateTime: '',
        id: this.selectedChatId || 0
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
      // let recieverIds: number[] = [];

      // if (this.userId) {
      //   recieverIds = rawToId.split(",")
      //                       .map((id: string) => Number(id.trim()))
      //                       .filter((id: number) => !isNaN(id));
      // }

      if(this.userId)
      this.stompClient.subscribe("/topic/chat." + this.generateChatKey(this.userId, this.chatParticipants), (message: { body: string; }) => {
        this.handleResult(message);
      });
      if(this.userId)
      console.log("chat key u open socketu: ", this.generateChatKey(this.userId, this.chatParticipants));
    }
  }

  handleResult(message: { body: string; }) {
    if (message.body) {
      let messageResult: Message = JSON.parse(message.body);
      this.messages.push(messageResult);
      this.scrollToBottom();
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

  setChatParticipants(): Observable<number[]> {
  if (this.selectedChatId) {
    return this.inboxService.getParticipantsByChatId(this.selectedChatId).pipe(
      tap(response => {
        this.chatParticipants = response.filter(item => item !== this.userId);
        console.log("participants: ", this.chatParticipants);
      })
    );
  }
  return of([]);
}

}