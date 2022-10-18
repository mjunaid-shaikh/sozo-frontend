import { Component, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SozoApiService } from '../../sozo-api.service';
import { SozoDataService } from '../../sozo-data.service';
import { CONSTANTS } from '../../constants/global-constants';

@Component({
  selector: 'app-billing-cycle',
  templateUrl: './billing-cycle.component.html',
  styleUrls: ['./billing-cycle.component.css'],
})
export class BillingCycleComponent implements OnInit {
  constructor(private SAS: SozoApiService, private SDS: SozoDataService) {}

  billingCycleData: any = [];

  ngOnInit(): void {
    this.getBillingCycle();
  }

  // GETTING BILLING CYCLE RESPONSE FROM BACKEND
  async getBillingCycle() {
    try {
      this.SDS.displayLoader();
      const response: any = await this.SAS.getBillingCycle();
      // console.log('show res data', response.data);
      
      this.billingCycleData = response?.data;
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
      this.SDS.removeLoader();
    }
  }
}
