import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CONSTANTS } from '../constants/global-constants';
import { SozoApiService } from '../sozo-api.service';
import { SozoDataService } from '../sozo-data.service';

@Component({
  selector: 'app-payment-error',
  templateUrl: './payment-error.component.html',
  styleUrls: ['./payment-error.component.css'],
})
export class PaymentErrorComponent implements OnInit {
  constructor(
    private router: Router,
    private SDS: SozoDataService,
    private SAS: SozoApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((res) => this.stripePaymentSuccess(res.id));
  }
  NavigateToSubcription() {
    this.router.navigate(['/setting/subscription']);
  }

  async stripePaymentSuccess(id) {
    if (id == null) {
      return;
    }
    this.SDS.displayLoader();
    try {
      const response: any = await this.SAS.stripePaymentFailure(id);
   
      if (response.status == CONSTANTS.API_SUCCESS) {
     
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
      this.SDS.removeLoader();
    }
  }
}
