import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CanvasService } from '../canvas.service';
import { CONSTANTS } from '../constants/global-constants';
import { SozoApiService } from '../sozo-api.service';
import { SozoDataService } from '../sozo-data.service';
declare const $: any;
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  password = '';
  confirmPassword = '';
  token = this.route.snapshot.queryParams['reset_password_token'];

  
  pattern = CONSTANTS.PATTERNS;
  email: string = '';
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: CanvasService,
    private SAS: SozoApiService,
    private SDS: SozoDataService
  ) { }

  ngOnInit(): void {
  }
  onSubmit(form: NgForm) {
    $('#loader').css('display', 'block');

    // if (!form.valid) {
    //   return;
    // }
    let requiredData = {
      password: form.value.password,
      confirm_password: form.value.confirmPassword,
      token: this.token,
    };
    this.SAS.userResetPassword(requiredData)
      .toPromise()
      .then((response: any) => {
        this.router.navigate(['/login']);
      })
      .catch((error: any) => {
        this.SDS.apiErrorHandle(error?.status.toString(), error,true);
      })
      .finally(() => {
        $('#loader').css('display', 'none');
      });
    }
}
