import { Component, OnInit, OnDestroy } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent implements OnInit, OnDestroy {

  messages: any[] = [];
  private client!: Client;
  private sessionId = uuidv4();
  private isConnected = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log('Registrujem agenciju, sessionId:', this.sessionId);

    this.http.post(`http://localhost:8080/agency/register/${this.sessionId}`, {})
      .subscribe({
        next: () => {
          console.log('Agencija uspešno registrovana na backendu.');
          this.connectWebSocket();
        },
        error: (err) => {
          console.error('Greška pri registraciji agencije:', err);
        }
      });
  }

  private connectWebSocket(): void {
    if (this.isConnected) {
      console.log('WebSocket već povezan, preskačem.');
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/socket'),
      reconnectDelay: 5000,
    });

    this.client.onConnect = () => {

      const topic = `/topic/agency-messages/${this.sessionId}`;
console.log('Subscribujem se na topic:', topic);


      this.client.subscribe(topic, (message: Message) => {
        try {
          const data = JSON.parse(message.body);
          this.messages.push(data);
          console.log('Poruka primljena:', data);
        } catch {
          // fallback ako nije JSON
          this.messages.push(message.body);
          console.log('Poruka primljena (tekst):', message.body);
        }
      });

      this.isConnected = true;
    };

    this.client.onDisconnect = () => {
      console.log('WebSocket diskonektovan.');
      this.isConnected = false;
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP greška:', frame.headers['message'], frame.body);
    };

    this.client.onWebSocketError = (event) => {
      console.error('WebSocket greška:', event);
    };

    this.client.activate();
  }

  ngOnDestroy(): void {
    console.log('Deaktiviram agenciju:', this.sessionId);

    this.http.post(`http://localhost:8080/agency/unregister/${this.sessionId}`, {})
      .subscribe({
        next: () => console.log('Agencija unregistrirana na backendu.'),
        error: (err) => console.error('Greška pri unregistraciji agencije:', err)
      });

    if (this.client && this.isConnected) {
      this.client.deactivate();
      this.isConnected = false;
    }
  }
}
