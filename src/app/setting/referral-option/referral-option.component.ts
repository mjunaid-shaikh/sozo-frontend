import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CanvasService } from 'src/app/canvas.service';
import { SozoApiService } from 'src/app/sozo-api.service';
import { SozoDataService } from 'src/app/sozo-data.service';

@Component({
  selector: 'app-referral-option',
  templateUrl: './referral-option.component.html',
  styleUrls: ['./referral-option.component.css']
})
export class ReferralOptionComponent implements OnInit {

  constructor(private router: Router, private service: CanvasService) {}

  ngOnInit(): void {
  }

}
