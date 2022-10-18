import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CanvasService } from 'src/app/canvas.service';
import { SozoApiService } from 'src/app/sozo-api.service';
import { SozoDataService } from 'src/app/sozo-data.service';
import { CONSTANTS } from 'src/app/constants/global-constants';
declare const $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  pattern = CONSTANTS.PATTERNS;
  email: string = '';
  password: string = '';
  emailFlag: boolean;

  constructor(
    private router: Router,
    private service: CanvasService,
    private SAS: SozoApiService,
    private SDS: SozoDataService
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('userToken')) {
      this.router.navigate(['/dashboard']);
    }
    // console.log(localStorage.getItem('email'))
  }

  createNewAccountNavigation() {
    return this.router.navigate(['/signup']);
  }
  focusOutFunction(text) {
    this.emailFlag = false;

    if (this.pattern.email.test(text.trim())) {
      this.emailFlag = true;
    }
  }

  ngAfterViewInit(): void {
    $('#loader').css('display', 'none');
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
  }

  onSubmit(form: NgForm) {
 
    $('#loader').css('display', 'block');
    if (!form.valid) {
      return;
    }
    let requiredData = {
      email: form.value.email,
      password: form.value.password,
      inviteId: localStorage.getItem('inviteLinkID')
        ? localStorage.getItem('inviteLinkID')
        : 'none',
    };
    this.SAS.userLogin(requiredData)
      .toPromise()
      .then((response: any) => {
        // this.service.userProfileId = response.user._id;
     
        localStorage.setItem('userId', response.user._id);

        localStorage.setItem('userToken', response.token);
        this.service.allowToDashboard();
        this.SDS.set('authToken', response.token);
        this.router.navigate(['/dashboard']);
        let userDetails = {
          firstName: response.user.first_name,
          lastName: response.user.last_name,
          email: response.user.email,
        };
        localStorage.setItem('userDetails', JSON.stringify(userDetails));
        //   if ($('#rememberMe').is(':checked')) {
        //     console.log('test')
        //     // save username and password
        //     let userName =  $('#email').val();
        //     let password = $('#password').val();
        //     let rememberMe = $('#rememberMe').val();
        //     localStorage.setItem('email',JSON.stringify(userName));
        //     localStorage.setItem('password',JSON.stringify(password));
        //     localStorage.setItem('checkBoxValidation',JSON.stringify(rememberMe));
        // }
      })
      .catch((error: any) => {
        this.SDS.apiErrorHandle(error?.status.toString(), error, true);
      })
      .finally(() => {
        $('#loader').css('display', 'none');
      });
  }
}
