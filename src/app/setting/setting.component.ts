import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CanvasService } from 'src/app/canvas.service';
import { SozoApiService } from 'src/app/sozo-api.service';
import { SozoDataService } from 'src/app/sozo-data.service';
import { CONSTANTS } from '../constants/global-constants';
import { SozoSocketService } from '../sozo-socket.service';
declare const $: any;
@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css'],
})
export class SettingComponent implements OnInit {
  email: any;
  firstName: string = '';
  lastName: string = '';
  fullName: string = '';
  userNameFirstLetter: string;
  selectedProfileImage: any;
  userData = JSON.parse(localStorage.getItem('userDetails'));

  notificationList: any = [];
  notificationPop: boolean = false;

  adminHide: boolean = false;
  // dataFromChild:any;
  // data: any;

  constructor(
    private SAS: SozoApiService,
    private router: Router,
    private service: CanvasService,
    private SSS: SozoSocketService,
    private SDS: SozoDataService
  ) { }

  dashboardNavigation() {
    this.router.navigate(['/dashboard/Home']);
  }
  // eventFromChild(data) {
  //   //console.log(data)
  //   this.dataFromChild = data;
  // }

  ngOnInit(): void {
    if (!localStorage.getItem('userToken')) {
      this.router.navigate(['/login']);
    }
    this.getUser();
    this.SSS.initializeSocket();
    this.SSS.socket.on('comments', (value) => {
      if (value.user_id != this.userData?._id) {
        this.notificationPop = true;
      }
    });

    this.service.data$.subscribe((res: any) => {
      //console.log('test');
      //console.log(res);
      this.firstName = res?.first_name || '';
      this.lastName = res?.last_name || '';
      this.userNameFirstLetter = this.firstName.split('')[0];
      this.selectedProfileImage = res?.profile_image || 'assets/img/user.svg';
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
  settingNevigation() {
    return this.router.navigate(['/setting']);
  }
  userProfileOption() {
    $('.user-profile').toggle();
  }
  notificationOption() {
    $('.dropDown_notify').toggle();
  }

  getUser = async () => {
    $('#loader').css('display', 'block');
    try {
      let id = localStorage.getItem('userId');
      let response: any = await this.SAS.getUserData(id);
      if (response.status == 'success') {
        //console.log("user data--", response);
        this.adminHide = (response['user']['team'] ? true : false) && (response['user']['isAdmin']==true ? true : false);
        //console.log("is admin",response['user']['isAdmin']);
        
        //console.log("admin hide",this.adminHide);
        this.email = response?.user?.email;
        this.firstName = response?.user?.first_name;
        this.lastName = response?.user?.last_name;
        this.userNameFirstLetter = this.firstName.split('')[0];
        this.selectedProfileImage = response.user.profile_image;
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
      $('#loader').css('display', 'none');
    }
  };

  async notification() {
    try {
      $('#notificationPop').toast('show');
      const response: any = await this.SAS.getNotification();

      if (response.status == CONSTANTS.API_SUCCESS) {
        this.notificationPop = false;
        this.notificationList = response.notification ?? [];
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
    }
  }
}
