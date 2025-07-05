import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { InboxService } from '../services/inbox.service';
import { Chat } from '../model/chat.model';
import { Message } from '../model/message';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SocketService } from '../services/socket.service';
import { environment } from 'src/environments/environment';
import { Stomp } from '@stomp/stompjs';
import { forkJoin, Observable, of, switchMap, tap } from 'rxjs';
import { ChatCreate } from '../model/chat-create.model';
import { UserService } from '../services/user.service';
import { User } from '../model/user.model';

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
              private socketService: SocketService,
              private userService: UserService) {
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
    receiverUsername: '',
    adminId: 0
  }

  selectedChat?: Chat;
  selectedChatKey: string ='';
  chatParticipants: number[] = [];
  participants: User[] = [];

  messages: Message[] = [];
  myMessages: Message[] = [];
  message: Message = {
    id: 0,
    chatId: 0,
    senderId: 0,
    receiverIds: [],
    message: '',
    dateTime: '',
    chatKey: ''
  }
  newMessageText: string = '';

  isNewGroupModalOpen = false;
  newUserId: number | null = null;
  participantsInput: string = '';

  isNewChatModalOpen = false;
  isParticipantsModalOpen = false;

  newGroup = {
    name: '',
    participantIds: [] as number[],
    type: 'GROUP',
    adminId: 0
  }

  allUsers: User[] = [];
  selectedUsers: User[] = [];
  searchTerm: string = '';

  ngOnInit(): void {
    if(this.userId)
      this.getChatsByUser(this.userId);
    this.initializeWebSocketConnection();
    this.getAllUsers();
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

  selectChat(chat: Chat): void{
    this.selectedChat = chat;
    this.selectedChatKey = chat.chatKey;
    this.getMessagesByChat(this.selectedChat.id);
    
    this.openSocket();
  }

  getChatDisplayName(chat: Chat): string{
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
    this.setChatParticipants();
    if (!this.newMessageText.trim()) return;
    if (this.userId && this.chatParticipants && this.selectedChat) {
      //   recieverIds = rawToId.split(",")
      //                       .map((id: string) => Number(id.trim()))
      //                       .filter((id: number) => !isNaN(id));
      // }
      let message: Message = {
        message: this.newMessageText,
        senderId: this.userId,
        receiverIds: this.chatParticipants,
        chatId: this.selectedChat.id, 
        dateTime: '',
        id: 0,
        chatKey: this.selectedChat.chatKey
      };

      console.log(message);
      this.socketService.postRest(message).subscribe(res => {
        console.log(res);
      })
      this.newMessageText = '';
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
    if(this.isLoaded && this.userId && this.selectedChatKey){
      const topic = "/topic/chat." + this.selectedChatKey;
      this.stompClient.subscribe(topic, (message: { body: string; }) => {
        this.handleResult(message);
      });
      console.log("Subscribed to topic:", topic);
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
    if (this.selectedChat) {
      return this.inboxService.getParticipantsByChatId(this.selectedChat.id).pipe(
        tap(response => {
          this.chatParticipants = response.filter(item => item !== this.userId);
          console.log("participants: ", this.chatParticipants);
        })
      );
    }
    return of([]);
  }

  createGroup(chat: ChatCreate): void{
    this.inboxService.createGroup(chat).subscribe({
      next: (response) => {
        const chat = response;
        this.selectedChatKey = response.chatKey;
        this.openSocket();
        this.selectedChat = chat;
        console.log("new chat: ", chat);
      },
      error: (err) => {
        console.error('Error creating new chat', err);
      }
    })
  }

  openNewChatModal(): void{
    this.isNewChatModalOpen = true;
  }

  openNewGroupModal(): void{
    this.isNewGroupModalOpen = true;
  }

  closeNewGroupModal(): void{
    this.isNewGroupModalOpen = false;
    this.newGroup = {
      name: '',
      participantIds: [],
      type: 'GROUP',
      adminId: 0
    };
    this.participantsInput = '';
  }

  onSubmit(){
    const ids = this.selectedUsers.map(user => user.id);

    if(this.userId){
      this.newGroup.adminId = this.userId;

      if (!ids.includes(this.userId)) {
        ids.push(this.userId);
      }
    }
    this.newGroup.participantIds = ids;

    this.createGroup(this.newGroup);
    this.closeNewGroupModal();
    window.location.reload();
  }

  getAllUsers(){
    this.userService.getAllUsers().subscribe({
      next : (response) => {
        if(response){
          this.allUsers = response;
        }
      },
      error : (err) => {
        console.error('Error fetching users');
      }
    })
  }

  selectUser(user: User){
    if(!this.selectedUsers.find(u => u.id === user.id)){
      this.selectedUsers.push(user);
    }
  }

  removeUser(userId: number){
    this.selectedUsers = this.selectedUsers.filter(u => u.id !== userId);
  }

  get filteredUsers(): User[] {
    return this.allUsers
      .filter(u => !this.selectedUsers.some(sel => sel.id === u.id))
  }

  openParticipantsModal(){
    if(this.selectedChat){
      if(this.selectedChat.name){
        this.getUsersFromChatParticipants();
        this.isParticipantsModalOpen = true;
      }
    }
  }

  getUsersFromChatParticipants(){
    this.setChatParticipants().pipe(
      switchMap((ids: number[]) => {
        const request = ids.map(id => this.userService.getUserById(id));
        return forkJoin(request);
      })
    ).subscribe({
      next: (users: User[]) => {
        this.participants = users;
        console.log("korisnici: ", users);
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    })
  }


  closeParticipantsModal(){
    this.isParticipantsModalOpen = false;
  }

  removeUserFromGroup(id: number){
    if(this.selectedChat && this.selectedChat.adminId && this.selectedChat.adminId == this.userId){
      console.log("chat admin: ", this.selectedChat.adminId);
      const confirmed = window.confirm('Are you sure you want to remove this user from group?');
      if(confirmed && this.selectedChat){
        this.participants = this.participants.filter(user => user.id !== id);
        this.inboxService.removeUserFromChat(id, this.selectedChat.id).subscribe({
          next: () => {
            console.log(`User ${id} removed from group`);
          },
          error: (err) => {
            console.error(`Error deleting user: `, err);
          }
        })
      }
    }
    alert("You are not admin of this group");
    
  }


  //TODO:
  addUserToGroup(id: number){

  }
  //TODO:
  getLast10Messages(){

  }

  
}