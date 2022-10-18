import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { CanvasService } from '../canvas.service';
import { CONSTANTS } from '../constants/global-constants';
import { SozoApiService } from '../sozo-api.service';
import { SozoDataService } from '../sozo-data.service';
declare const $: any;
@Component({
  selector: 'app-forgot-passowrd',
  templateUrl: './forgot-passowrd.component.html',
  styleUrls: ['./forgot-passowrd.component.css']
})
export class ForgotPassowrdComponent implements OnInit {
  pattern = CONSTANTS.PATTERNS;
  email: string = '';
  constructor(
    private router: Router,
    private service: CanvasService,
    private SAS: SozoApiService,
    private SDS: SozoDataService
  ) { }

  ngOnInit(): void {
  }
  onSubmit(form: NgForm) {
    // this.SDS.displayLoader();
    $('#loader').css('display', 'block');

    if (!form.valid) {
      return;
    }
    let requiredData = {
      email: form.value.email,
    };
    this.SAS.userForgotPassword(requiredData)
      .toPromise()
      .then((response: any) => {

        window.location.href = response.restUrl;
      })
      .catch((error: any) => {
        this.SDS.apiErrorHandle(error?.status.toString(), error);
      })
      .finally(() => {
        $('#loader').css('display', 'none');
        // this.SDS.removeLoader();
      });
  }
}
