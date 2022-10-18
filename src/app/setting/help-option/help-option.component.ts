import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CanvasService } from 'src/app/canvas.service';
import { SozoApiService } from 'src/app/sozo-api.service';
import { SozoDataService } from 'src/app/sozo-data.service';

@Component({
  selector: 'app-help-option',
  templateUrl: './help-option.component.html',
  styleUrls: ['./help-option.component.css']
})
export class HelpOptionComponent implements OnInit {

  constructor(private router: Router, private service: CanvasService) {}

  ngOnInit(): void {
  }

}
