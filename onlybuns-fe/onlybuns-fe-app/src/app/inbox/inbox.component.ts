import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { InboxService } from '../services/inbox.service';
import { Chat } from '../model/chat.model';
import { Message } from '../model/message';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SocketService } from '../services/socket.service';
import { environment } from 'src/environments/environment';
import { Stomp } from '@stomp/stompjs';
import { catchError, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
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
  // loginForm: FormGroup;
  userId: number = Number(localStorage.getItem("userId"));
  private serverUrl = environment.url + 'socket'
  private stompClient: any;
  isLoaded: boolean = false;

  constructor(private inboxService: InboxService, 
              private fb: FormBuilder,
              private socketService: SocketService,
              private userService: UserService) {

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

  isAddUserOpened = false;

  showUserModal = false;
  selectedUser: User | null = null;

  senderUsernames: { [userId: number]: string } = {};

  chatName: string = '';

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
                if(this.userId){
                  this.inboxService.getReceiverUsername(chat.id, this.userId).subscribe(username => {
                    chat.receiverUsername = username;
                    console.log("Postavljen receiverUsername:", chat.receiverUsername);
                  });
                }
                
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
        this.messages.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());


        this.inboxService.getChatName(id).subscribe({
          next: (chatNameResponse) => {
            this.chatName = chatNameResponse;
            console.log("chat name:", this.chatName);

            if(this.chatName){
              this.loadSenderUsernames(this.messages);
            }

            console.log("messages: ", this.messages);
            setTimeout(() => {
              this.scrollToBottom();
            }, 0);
          },
          error: (err) => {
            console.log("error fetching chat name: ", err);
          }
        });
      },
      error: (err) => {
        console.error('Error fetching messages', err);
      }
    })

  }

  setUserId(id: number): void{
    this.userId = id;
  }

  // onLogin(): void {
  //   const inputId = this.loginForm.value.userId;
  //   if (inputId) {
  //     this.userId = +inputId;
  //     this.getChatsByUser(this.userId);
  //   }
  // }

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
      let message: Message = {
        message: this.newMessageText,
        senderId: this.userId,
        receiverIds: this.chatParticipants,
        dateTime: '',
        id: 0,
        chatKey: this.selectedChat.chatKey
      };

      console.log(message);
      this.socketService.postRest(message).subscribe(res => {
        console.log(res);

        if (this.selectedChat && !this.selectedChat.id && res && res.chatId) {
          this.selectedChat.id = res.chatId;
          const exists = this.chats.some(chat => chat.id === res.id);
          if (!exists) {
            this.chats.push(this.selectedChat);
          }
        }

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

  generateChatKey(senderId: number, receiverId: number): string {
      const ids = [senderId, receiverId].sort((a, b) => a - b);
      console.log("ChatKey:", ids.join('_'));
      return ids.join('_');
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
    this.isNewGroupModalOpen = true;
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

  get suggestedUsers(): User[] {
    return this.allUsers
      .filter(u => !this.chatParticipants.some(sel => sel === u.id))
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
    this.closeAddUserPart();
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
    else if(this.selectedChat && this.selectedChat.adminId && this.selectedChat.adminId != this.userId){
      alert("You are not admin of this group");
    }
    
  }

  addUser(){
    this.isAddUserOpened = true;
  }

  closeAddUserPart(){
    this.isAddUserOpened = false;
  }

  addUserToGroup(id: number){
    this.setChatParticipants();
    if(this.selectedChat && this.selectedChat.adminId && this.selectedChat.adminId == this.userId){
      console.log("chat admin: ", this.selectedChat.adminId);
      if(this.selectedChat){
        this.userService.getUserById(id).subscribe(user => {
          this.participants.push(user);
        });
        this.inboxService.addUserToChat(id, this.selectedChat.id).subscribe({
          next: () => {
            console.log(`User ${id} added to group`);
          },
          error: (err) => {
            console.error(`Error adding user: `, err);
          }
        })
      }
    }
    else{
      alert("You are not admin of this group");
    }
  }

  openNewPrivateChatModal() {
    this.showUserModal = true;
    console.log('Modal opened');
  }

  closeUserModal() {
    this.showUserModal = false;
  }

  openChat(receiverId: number) {
    this.closeUserModal();

    const receiver = this.allUsers.find(u => u.id === receiverId);
    if (!receiver) return;

    this.selectedUser = receiver;

    if(this.userId){
      this.selectedChatKey = this.generateChatKey(this.userId, receiverId);
      this.openSocket();
    }


    this.selectedChat = {
      id: 0,
      chatKey: this.selectedChatKey,
      receiverUsername: receiver.username,
      name: null,
      type: 'PRIVATE'
    };

    this.messages = [];
  }

  loadSenderUsernames(messages: Message[]) {
    const uniqueSenderIds = [...new Set(messages.map(m => m.senderId))];
    uniqueSenderIds.forEach(id => {
      this.userService.getUserById(id).subscribe(user => {
        this.senderUsernames[id] = user.username;
      });
    });
  }

  shouldShowDate(index: number): boolean {
  if (index === 0) return true;

  const current = new Date(this.messages[index].dateTime);
  const previous = new Date(this.messages[index - 1].dateTime);

  return current.toDateString() !== previous.toDateString();
}

  
}