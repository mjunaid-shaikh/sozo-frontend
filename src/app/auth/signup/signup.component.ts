import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CanvasService } from 'src/app/canvas.service';
import { SozoApiService } from 'src/app/sozo-api.service';
import { SozoDataService } from 'src/app/sozo-data.service';
import { CONSTANTS } from 'src/app/constants/global-constants';
declare const $: any;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  pattern = CONSTANTS.PATTERNS;

  emailFlag: boolean;

  fullNameFlag: boolean;

  constructor(
    private router: Router,

    private service: CanvasService,

    private SAS: SozoApiService,

    private SDS: SozoDataService
  ) {}

  signupData = {
    firstname: '',

    lastname: '',

    email: '',

    password: '',

    confirm_password: '',
  };

  async onSignupSubmit(data) {
    let [firstName, lastName] = data.value.firstname.split(' ');

    this.signupData.firstname = firstName;

    this.signupData.lastname = lastName;

    this.signupData.email = data.value.email;

    this.signupData.password = data.value.password;

    this.signupData.confirm_password = data.value.password;

    try {
      const response = await this.SAS.userSignup(this.signupData).toPromise();

      this.router.navigate(['/login']);
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error, true);
    }
  }

  signinNewAccountNavigation() {
    return this.router.navigate(['/signin']);
  }

  focusOutFunction(text) {
    this.emailFlag = false;

    if (this.pattern.email.test(text.trim())) {
      this.emailFlag = true;
    }
  }

  fullNameValidation(text) {
    this.fullNameFlag = false;

    let fullNameValidator = CONSTANTS.PATTERNS.fullName;

    if (fullNameValidator.test(text)) {
      this.fullNameFlag = true;
    }
  }

  ngOnInit(): void {
    $('#loader').css('display', 'none');
  }

  onSubmit(form: NgForm) {
    $('#loader').css('display', 'block');

    if (!form.valid) {
      return;
    }

    let rqData = {
      fullName: form.value.firstname,

      email: form.value.email,

      password: form.value.password,

      confirm_password: form.value.password,

      inviteId: localStorage.getItem('inviteLinkID')
        ? localStorage.getItem('inviteLinkID')
        : 'none',
    };

    this.SAS.userSignup(rqData)

      .toPromise()

      .then((response: any) => {
        if (response.status == 'success') {
          this.router.navigate(['/login']);
        }
      })

      .catch((error: any) => {
        this.SDS.apiErrorHandle(error?.status.toString(), error, true);
      })

      .finally(() => {
        $('#loader').css('display', 'none');
      });
  }
}
