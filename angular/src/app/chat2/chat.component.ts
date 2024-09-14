import { Component, Injector, ElementRef, ViewChild, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import firebase from 'firebase/compat/app';
import { Chart, registerables } from 'chart.js';
import {message} from './messsages.model'
import {Contact} from './contact.model'
import { Observable } from 'rxjs';

Chart.register(...registerables);

@Component({
  templateUrl: './chat.component.html',
  animations: [appModuleAnimation()],
  styleUrls:['./chat.component.css']
})
export class ChatComponent extends AppComponentBase implements OnInit {
  @ViewChild('barChart') private chartRef: ElementRef;
  chart: any;
  eventChatCollection: AngularFirestoreCollection<message>;
  messages: message[];
  p: string = 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg';
  newMessage: string = '';
  eventID: string = '';
  current_user = {
    id: 1,
    password: '',
    username: 'clinton',
    profilePicture: '',
    exp: 0,
    iat: 0
  };
  profile = {
    emailAddress: '',
    username: 'tshepo',
    password: '',
    profilePicture: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg',
    region: '',
    interests: []
  };

  contacts:Contact[]=[
    {username:'tshepo'},
    {username:'pablo'},
    {username:'sipha'},
    {username:'jake'}

  ]
  constructor(injector: Injector,private firestore: AngularFirestore,private storage: AngularFireStorage) {
    super(injector);
    this.eventChatCollection = this.firestore.collection<message>('chats', (msg) => msg.orderBy('createdTime'));
  }

  ngOnInit() {
    //this.loadMessages();
    this.getMessages(this.current_user.username,this.profile.username).subscribe(
      (response: message[]) => {
        this.messages = response;
        console.log(this.messages)
      },
      error => {
        console.error('Error fetching messages:', error);
      });
  }
  
  getMessages(sender: string= this.current_user.username, receiver: string = this.profile.username): Observable<message[]> {
    const chatId = this.generateChatId(sender, receiver);
    return this.firestore.collection('chats').doc(chatId).collection<message>('messages', ref => 
    ref.orderBy('timestamp')  
  ).valueChanges();
  }

  generateChatId(sender: string, receiver: string): string {
    return sender < receiver ? `${sender}_${receiver}` : `${receiver}_${sender}`;
  }

  async sendMessage(sender: string = this.current_user.username, receiver: string = this.profile.username, message: string=this.newMessage) {
    if(this.newMessage.length==0) return;

    const chatId = this.generateChatId(sender, receiver);
    const chatRef = this.firestore.collection('chats').doc(chatId);
    
    // Create or update the chat document
    this.newMessage=''
    await chatRef.set({
      participants: [sender, receiver],
      lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    // Add the message to the messages subcollection
    return chatRef.collection('messages').add({
      sender,
      receiver,
      message,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
  changeChat(username:string){
    console.log(username)
    this.profile.username=username;
    this.getMessages().subscribe(
      (response: message[]) => {
        this.messages = response;
        console.log(this.messages)
      },
      error => {
        console.error('Error fetching messages:', error);
      });
  }
}  