import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CanvasService } from 'src/app/canvas.service';
import { SozoApiService } from 'src/app/sozo-api.service';
import { SozoDataService } from 'src/app/sozo-data.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {

  constructor(private router: Router, private service: CanvasService) {}

  ngOnInit(): void {
  }

  cancelBtn(){
    this.router.navigate(['/home']);
  }

}
