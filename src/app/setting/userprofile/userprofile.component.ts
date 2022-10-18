import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { CONSTANTS } from '../../constants/global-constants';
import { CanvasService } from '../../canvas.service';
import { SozoApiService } from '../../sozo-api.service';
import { SozoDataService } from '../../sozo-data.service';
declare const $: any;
@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.css'],
})
export class UserprofileComponent implements OnInit {
  firstName: string;
  lastName: string;
  email: any;
  selectedFile: any;
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  pattern = CONSTANTS.PATTERNS;
  selectedProfileImage: any;
  defaultProfileImage = 'assets/img/Group 18756.svg';
  enableButton = false;

  // @Input() dataFromParent: String;
  // @Output() sendDataToParent = new EventEmitter<string>();

  constructor(
    private router: Router,
    private service: CanvasService,
    private SAS: SozoApiService,
    private SDS: SozoDataService
  ) { }

  ngOnInit(): void {
    let userData = JSON.parse(localStorage.getItem('userDetails'));
    this.firstName = userData.firstName;
    this.lastName = userData.lastName;
    this.email = userData.email;
    $('#loader').css('display', 'block');
    if (!localStorage.getItem('userToken')) {
      this.router.navigate(['/login']);
    }
    let getUser = async () => {
      try {
        let id = localStorage.getItem('userId');
        let response: any = await this.SAS.getUserData(id);

        if (response) {
         // console.log(response);
          this.selectedProfileImage = response.user.profile_image
        }
      } catch (error) {
        this.SDS.apiErrorHandle(error?.status.toString(), error);
      } finally {
        $('#loader').css('display', 'none');
      }
    }
    getUser();
  }
  onSubmit(form: NgForm) {
    // this.SDS.displayLoader();
    $('#loader').css('display', 'block');

    // if (!form.valid) {
    //   return;
    // }

    if (form.value.currentPassword == "" || form.value.newPassword == "" || form.value.confirmPassword == "") {
      $('#loader').css('display', 'none');
      this.SDS.triggerError("Please enter proper password");
      return;
    }

    let requiredData = {
      current_password: form.value.currentPassword,
      password: form.value.newPassword,
      confirm_password: form.value.confirmPassword,
    };

    this.SAS.userChangePassword(requiredData)
      .toPromise()
      .then((response: any) => {
       // console.log(response);
        this.SDS.triggerSuccess(response?.message);
        localStorage.clear();
        this.router.navigate(['/login']);
      })
      .catch((error: any) => {
        this.SDS.apiErrorHandle(error?.status.toString(), error);
      })
      .finally(() => {
        $('#loader').css('display', 'none');
      });
  }
  changeFirstName() {
    this.enableButton = true;
  }
  changeLastName() {
    this.enableButton = true;
  }
  saveChangedDetail() {
    $('#loader').css('display', 'block');
    let id = localStorage.getItem('userId');
    const payload = new FormData();
    payload.append('first_name', this.firstName);
    payload.append('last_name', this.lastName);
    if (this.selectedFile != null) {
      payload.append('profile_image', this.selectedFile);
    }

    this.SAS.uploadImage(payload, id)
      .then((response: any) => {
        if (response) {
          // this.sendDataToParent.emit(response.user);
          // this.service.userDetail = response.user;
          this.service.changeData(response.user);
          let objToBeSaved = {
            firstName: response.user.first_name,
            lastName: response.user.last_name,
            email: response.user.email
          }
          localStorage.setItem('userDetails', JSON.stringify(objToBeSaved));
        }
      })
      .catch((error: any) => {
        this.SDS.apiErrorHandle(error?.status.toString(), error);
      })
      .finally(() => {
        this.enableButton = false;
        $('#loader').css('display', 'none');
      });

  }

  cancelBtn(){
    this.router.navigate(['/home']);
  }
  onSelectFile(event) {
    // called each time file input changes

    if (event.target.files[0]) {
      let type = event.target.files[0].type.split("/")[0];

      if (type != "image") {
        this.SDS.triggerError("Please choose image");
        return;
      }

      this.enableButton = true;
      this.selectedFile = event.target.files[0];
      let reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (_event) => {
        this.selectedProfileImage = reader.result;
      };
    }
  }
}
