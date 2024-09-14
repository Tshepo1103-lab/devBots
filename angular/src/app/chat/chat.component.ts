import { Component, Injector, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router, ActivatedRoute } from '@angular/router';
import { message } from '../chat2/messsages.model';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {IonicModule } from '@ionic/angular';
import { AppComponentBase } from '@shared/app-component-base';

@Component({
  templateUrl: './chat.component.html',
  animations: [appModuleAnimation()],
  styleUrls: ['./chat.component.css']
})
export class AppChatroomComponent extends AppComponentBase implements AfterViewInit {

  eventChatCollection: AngularFirestoreCollection<message>;
  messages: message[] = [];
  p: string = 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg';
  newMessage: string = '';
  selectedImage: File | null = null;
  selectedImageURL: string | null = null;
  selectedVideo: File | null = null;
  selectedVideoURL: string | null = null;
  eventID: string = '';
  current_user = {
    id: '',
    password: '',
    username: '',
    exp: 0,
    iat: 0
  };
  profile = {
    emailAddress: '',
    username: '',
    password: '',
    profilePicture: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg',
    region: '',
    interests: []
  };

  constructor(
    injector: Injector,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialize the reference to the "eventChat" collection
    //this.eventChatCollection = firestore.collection<message>('eventChat', (msg) => msg.orderBy('createdTime'));
    super(injector)
    console.log('chat')
  }
  ngAfterViewInit() {
 }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.eventID = params['eventId'];
      this.getMessages(this.eventID);
    });

    this.loadMessages();
  }

  loadMessages(): void {
    if (this.eventChatCollection) {
      this.eventChatCollection.valueChanges().subscribe((messages: message[]) => {
        this.messages = messages;
        console.log(messages);
      });
    } else {
      console.log('Error with initialization');
    }
  }

  getMessages(eventChatId: string): void {
    this.firestore.collection('eventChat').doc(eventChatId).collection('messages', (msg) => msg.orderBy('createdTime'))
      .valueChanges()
      .subscribe((m: any) => {
        this.messages = m;
        console.log(m);
      });
  }

  sendMessage(): void {
    if (this.newMessage.trim() !== '') {
      const messageData = {
        message: this.newMessage,
        profilePicture: this.profile.profilePicture ?? '',
        userid: this.current_user.username,
        eventid: this.eventID,
        createdTime: new Date()
      };
      
      this.firestore.collection('eventChat').doc(this.eventID).collection('messages').add(messageData);
      this.newMessage = ''; // Clear the input field
    }

    if (this.selectedImage) {
      const imageMessage = {
        imageUrl: this.selectedImageURL,
        profilePicture: this.profile.profilePicture ?? '',
        userid: this.current_user.username,
        eventid: this.eventID,
        createdTime: new Date(),
      };
      this.firestore.collection('eventChat').doc(this.eventID).collection('messages').add(imageMessage);
      this.selectedImage = null;
      this.selectedImageURL = null;
    }

    if (this.selectedVideo) {
      const videoMessage = {
        user: 'You',
        videoUrl: this.selectedVideoURL,
        timestamp: new Date(),
      };
      // Reset the selected video and its preview
      this.selectedVideo = null;
      this.selectedVideoURL = null;
    }
  }

  openImagePicker(): void {
    const fileInput = document.getElementById('imageInput');
    if (fileInput) {
      fileInput.click(); 
    }
  }

  handleImageUpload(event: any): void {
    this.selectedImage = event.target.files[0];
    if (this.selectedImage) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImageURL = e.target.result;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  openVideoPicker(): void {
    const videoInput = document.getElementById('videoInput');
    if (videoInput) {
      videoInput.click(); 
    }
  }

  handleVideoUpload(event: any): void {
    this.selectedVideo = event.target.files[0];
    if (this.selectedVideo) {
      this.selectedVideoURL = URL.createObjectURL(this.selectedVideo);
    }
  }

  uploadFile(file: File): void {
    const storageRef = this.storage.ref('images/' + file.name);
    const uploadTask = storageRef.put(file);
    uploadTask.snapshotChanges().subscribe(() => {
      console.log('File uploaded');
    });
  }

  
}
