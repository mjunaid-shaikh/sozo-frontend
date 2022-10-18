import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CONSTANTS } from '../constants/global-constants';
import { SozoApiService } from '../sozo-api.service';
import { SozoDataService } from '../sozo-data.service';

declare const $: any;
@Component({
  selector: 'app-subscription-package-plan',
  templateUrl: './subscription-package-plan.component.html',
  styleUrls: ['./subscription-package-plan.component.css'],
})
export class SubscriptionPackagePlanComponent implements OnInit {
  planList: any = [];
  userData: any = {};
  userPaymentDetail: any = [];
  userPlanIdForModal: any = '';
  isSubsribe: boolean = false;

  constructor(
    private router: Router,
    private SAS: SozoApiService,
    private SDS: SozoDataService,
    @Inject(DOCUMENT) private document: Document
  ) { }

  toggleFlag = [];

  ngOnInit(): void {
    this.getUserPlan();
    this.getUserInfo();
  }


  // get user info
  getUserInfo() {
    let getUser = async () => {
      try {
        let id = localStorage.getItem('userId');
        let response: any = await this.SAS.getUserData(id);

        if (response) {

          let currentDate = new Date().getTime();
          let planEndDate = new Date(response['user']['order']['plan_end_date']).getTime();

          if (planEndDate > currentDate) {
            this.isSubsribe = true
          } else {
            this.isSubsribe = false
          }

         // console.log("is sub scirbe", this.isSubsribe);


        }
      } catch (error) {
        this.SDS.apiErrorHandle(error?.status.toString(), error);
      } finally {
        $('#loader').css('display', 'none');
      }
    };
    getUser();
  }

  async getPlans() {
    try {
      this.SDS.displayLoader();
      const response: any = await this.SAS.getPlans();
      if (response.status == CONSTANTS.API_SUCCESS) {

        this.planList = response?.plans?.plans;

       // console.log("plan list",this.planList);
        
        let container = false;

        this.toggleFlag = this.planList.map((item, index) => {
          return container;
        });

        this.userPaymentDetail = response?.paymentData;
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
      this.SDS.removeLoader();
    }
  }
  async cancelSubscriptionPlan() {
    this.SDS.displayLoader();

    try {
      let response: any = await this.SAS.getCancelPlan();

      if (response.status == CONSTANTS.API_SUCCESS) {
        this.getUserPlan();
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
      this.SDS.removeLoader();
    }
  }
  async getUserPlan() {
    this.planList = [];
    this.userData = {};
    this.userPaymentDetail = [];
    try {
      this.SDS.displayLoader();
      const response: any = await this.SAS.getUserData(
        localStorage.getItem('userId')
      );
      if (response.status == CONSTANTS.API_SUCCESS) {
        this.userData = response.user;

       // console.log("user data", this.userData);
        
        await this.getPlans();
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
      this.SDS.removeLoader();
    }
  }

  getPlanTypeInfo(item, flag) {
    if (item?.type == 'Monthly') {
      return 'Single user, paid monthly';
    } else if (item?.type == 'Annual') {
      return `Single user paid annually at $${item?.annualy_price.annualy}`;
    } else {
      return `Single user, paid monthly`;
    }
  }

  planExpire: boolean = false;

  calculateDate() {
    let currentDate = Date.now();
    let endDate: any = new Date(this.userData?.order?.plan_end_date);

    const dayCount = Math.floor(
      (endDate - currentDate) / (1000 * 60 * 60 * 24)
    );

    if (dayCount < 0) {
      this.planExpire = true;
    }
    return dayCount;
  }

  modelChangeFn(val, index) {
    this.toggleFlag[index] = val;
  }

  async stripePlansCheckout(id, isFromModal: boolean = false) {
    if (id == null) {
      return;
    }
    if (!isFromModal) {
      if (this.userData.order.current_plan.type != 'Trial') {
        this.userPlanIdForModal = id;
        $('#upgradeSubscription').modal('show');
        return;
      }
    }
    this.SDS.displayLoader();
    try {
      const response: any = await this.SAS.stripePlansCheckout(id);

      if (response.status == CONSTANTS.API_SUCCESS) {
        if (response?.session?.url) {
          this.document.location.href = response.session.url;
        } else {
          const delay = (time) => new Promise((res) => setTimeout(res, time));

          await delay(500);
          await this.getUserPlan();
          $('#upgradeSubscriptionSuccessfull').modal('show');
        }
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status?.toString(), error);
    } finally {
      this.SDS.removeLoader();
    }
  }
}
