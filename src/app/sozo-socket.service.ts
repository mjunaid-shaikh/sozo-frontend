import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from './constants/global-constants';
@Injectable({
  providedIn: 'root',
})
export class SozoSocketService {
  private BASE_URL = CONSTANTS.SOCKET_BASE_URL;
  // private BASE_URL = 'http://localhost:8000/';

  socket;
  roomId: any;
  constructor(private activatedRoute: ActivatedRoute) { }

  initializeSocket() {
    this.socket = io(this.BASE_URL, {
      path: '/socket',
      query: { token: localStorage.getItem('userToken'), roomId: this.roomId },
      transports: ["websocket"]
    });
  }

  listen(eventName: string) {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data) => {
        subscriber.next(data);
      });
    });
  }

  sendingCanvasData(eventName: string, canvasData) {
    this.socket.emit(eventName, canvasData);
  }

}
