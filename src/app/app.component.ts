import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { SozoDataService } from './sozo-data.service';
declare const $: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'SOZO';
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.code === 'Enter') {
      $('#successModal').modal('hide');
    }
  }
  constructor(private SDS: SozoDataService,private router: Router) {}

  ngOnInit() {
    this.SDS.initializeState();
  }
}
