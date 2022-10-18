import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { CanvasService } from 'src/app/canvas.service';
import { SozoApiService } from 'src/app/sozo-api.service';
import { SozoDataService } from 'src/app/sozo-data.service';
import * as $ from 'jquery';

import { Key } from 'selenium-webdriver';
import { CONSTANTS } from 'src/app/constants/global-constants';
// import { Z_FILTERED } from 'zlib';
// import { BorderAll } from '@mui/icons-material';

export interface paymentErrorMsg {
  cardNumber: boolean;
  ExpDate: boolean;
  CVV: boolean;
}

@Component({
  selector: 'app-workspace-setting',
  templateUrl: './workspace-setting.component.html',
  styleUrls: ['./workspace-setting.component.css'],
})
export class WorkspaceSettingComponent implements OnInit {
  constructor(
    private router: Router,
    private service: CanvasService,
    private SAS: SozoApiService,
    private SDS: SozoDataService
  ) {}

  // PAYMENT MODAL HERE

  cardInputNumber: any = '';
  inputNameOnCard: any = '';

  paymentForm = new FormGroup({
    inputCardNumber: new FormControl(null, [Validators.required]),
    inputCardName: new FormControl(null, [Validators.required]),
    inputExpDate: new FormControl(null, [
      Validators.required,
      Validators.minLength(5),
    ]),
    inputCvvNo: new FormControl(null, [Validators.required]),
    inputZipCode: new FormControl(null, [Validators.required]),
  });

  // initialising payment error state
  paymentErrorMsg: paymentErrorMsg[] = [
    {
      cardNumber: false,
      ExpDate: false,
      CVV: false,
    },
  ];

  check: boolean = true;
  isAmex: boolean = false;

  public cardNumberMaxLength: number = 19;
  // inputCardNumber: Boolean = false;

  // initial add team members form
  @ViewChild('closeButton') closeButton: ElementRef;
  addNewMember = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    first_name: new FormControl('', Validators.required),
    last_name: new FormControl('', Validators.required),
    isAdmin: new FormControl(false),
    phone: new FormControl(''),
  });

  // form invalid state
  InvalidForm: boolean = false;
  getMembersData = [];

  imgPath = 'src/assets/img/Path 56276.svg';

  userData = {};

  ngOnInit(): void {
    // this.paymentErrorMsg[0].cardNumber=false
    // this.paymentErrorMsg[0].ExpDate=false
    // this.paymentErrorMsg[0].CVV=false
    this.getInitial();

    this.getUserPlan();
  }

  // ///////////////
  //  get user plan
  // ///////////////

  async getUserPlan() {
    try {
      const response: any = await this.SAS.getUserData(
        localStorage.getItem('userId')
      );

      if (response.status == CONSTANTS.API_SUCCESS) {
        this.userData = response.user;
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    }
  }

  // ////////////////////////
  //  PAYMENT CARD NUMBER VALIDATION
  // ////////////////////////

  // BILLING CYCLE PAYMENT ONLY ALLOWED NUMBER IN CVV
  onlyNumbersAllowedCvv(event): Boolean {
    let val = event.target.value;
    if (this.isAmex) {
      const charCode = event.which ? event.which : event.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57 || val.length == 4)
      ) {
        return false;
      } else return true;
    } else {
      const charCode = event.which ? event.which : event.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57 || val.length == 3)
      ) {
        return false;
      } else return true;
    }
  }

  onlyNumbersAllowedZipCode(eve) {
    let val = eve.target.value;
    const charCode = eve.which ? eve.which : eve.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
  }

  enterCardNumber(val) {
    if (
      this.cardInputNumber?.length == 0 ||
      this.cardInputNumber?.length == 1 ||
      this.cardInputNumber == null
    ) {
      this.paymentErrorMsg[0].cardNumber = false;
      this.check = true;
      this.isAmex = false;
      $('#visaCard').attr('src', '/assets/img/deactiveVisaCard.svg');
      $('#masterCard').attr('src', '/assets/img/deactiveMasterCard.svg');
      $('#amexCard').attr('src', '/assets/img/deactiveAmexCard.svg');
      $('#discoverCard').attr('src', '/assets/img/deactiveDiscoverCard.svg');
    }

    if (this.cardInputNumber) {
      if (this.cardInputNumber.charAt(0) == '4') {
        this.check = false;
        this.isAmex = false;

        this.paymentErrorMsg[0].cardNumber = false;

        if (this.cardInputNumber.length == 4) {
          this.cardInputNumber += ' ';
        }
        if (this.cardInputNumber.length == 9) {
          this.cardInputNumber += ' ';
        }
        if (this.cardInputNumber.length == 14) {
          this.cardInputNumber += ' ';
        }

        $('#visaCard').attr('src', '/assets/img/visaActiveCard.svg');
      }

      // THIS IS FOR MASTER CARD
      else if (
        this.cardInputNumber.charAt(0) == '5' &&
        (this.cardInputNumber.charAt(1) == '1' ||
          this.cardInputNumber.charAt(1) == '2' ||
          this.cardInputNumber.charAt(1) == '3' ||
          this.cardInputNumber.charAt(1) == '4' ||
          this.cardInputNumber.charAt(1) == '5')
      ) {
        this.check = false;
        this.isAmex = false;
        this.paymentErrorMsg[0].cardNumber = false;

        if (this.cardInputNumber.length == 4) {
          this.cardInputNumber += ' ';
        }
        if (this.cardInputNumber.length == 9) {
          this.cardInputNumber += ' ';
        }
        if (this.cardInputNumber.length == 14) {
          this.cardInputNumber += ' ';
        }

        $('#masterCard').attr('src', '/assets/img/masterActiveCard.svg');
      }
      // THIS IS FOR AMEX card
      else if (
        (this.cardInputNumber.charAt(0) == '3' &&
          this.cardInputNumber.charAt(1) == '4') ||
        (this.cardInputNumber.charAt(0) == '3' &&
          this.cardInputNumber.charAt(1) == '7')
      ) {
        this.check = true;

        this.isAmex = true;
        this.paymentErrorMsg[0].cardNumber = false;

        if (this.cardInputNumber.length == 4) {
          this.cardInputNumber += ' ';
        }
        if (this.cardInputNumber.length == 11) {
          this.cardInputNumber += ' ';
        }

        if (this.cardInputNumber.length <= 17) {
        }

        $('#amexCard').attr('src', '/assets/img/amexActiveCard.svg');
      }
      // THIS IS FOR DISCOVER card
      else if (
        (this.cardInputNumber.charAt(0) == '6' &&
          this.cardInputNumber.charAt(1) == '0' &&
          this.cardInputNumber.charAt(2) == '1' &&
          this.cardInputNumber.charAt(3) == '1') ||
        (this.cardInputNumber.charAt(0) == '6' &&
          this.cardInputNumber.charAt(1) == '5')
      ) {
        this.check = true;
        this.isAmex = false;

        if (this.cardInputNumber.length == 4) {
          this.cardInputNumber += ' ';
        }
        if (this.cardInputNumber.length == 9) {
          this.cardInputNumber += ' ';
        }

        if (this.cardInputNumber.length == 14) {
          this.cardInputNumber += ' ';
        }

        $('#discoverCard').attr('src', '/assets/img/discoverActiveCard.svg');
      } else {
        if (this.cardInputNumber?.length != 0) {
          this.paymentErrorMsg[0].cardNumber = false;
          this.isAmex = true;
        }
      }
    } else {
    }
  }

  limitextned(val) {
    const charCode = val.which ? val.which : val.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    } else {
      if (this.cardInputNumber) {
        if (
          this.cardInputNumber.charAt(0) == '3' &&
          (this.cardInputNumber.charAt(1) == '4' ||
            this.cardInputNumber.charAt(1) == '7')
        ) {
          this.cardNumberMaxLength = 17;
        } else {
          this.cardNumberMaxLength = 19;
        }
        return true;
      }
    }
  }

  // expiry month validation

  expiryMonth(e) {
    this.paymentErrorMsg[0].ExpDate = false;
    if (e.target.value.length == 5) {
      let expireVal;
      expireVal = e.target.value.split('/');

      let date = new Date().getFullYear().toString().slice(-2);
      let month = String(new Date().getMonth() + 1);

      if (month <= '9') {
        month = '0' + month;
      }
      if (expireVal[1] >= date && expireVal[1] <= 50) {
        this.paymentErrorMsg[0].ExpDate = false;
      } else {
        // alert("Invalidate date")
        this.paymentErrorMsg[0].ExpDate = true;
      }

      if (
        (expireVal[0] < month && expireVal[1] == date) ||
        expireVal[0] == '00'
      ) {
        this.paymentErrorMsg[0].ExpDate = true;
      }
    }
    // if (charCode == 32) {
    //   return true;
    // } else return false;
  }

  // RESTRICT NUMBER IN NAME INPUT

  onlyAlphabets(eve) {
    const charCode = eve.which ? eve.which : eve.keyCode;
    if (
      charCode > 31 &&
      (charCode < 48 || charCode > 57) &&
      ((charCode >= 48 && charCode <= 57) ||
        (charCode >= 65 && charCode <= 90) ||
        (charCode >= 97 && charCode <= 122)) &&
      charCode != 8 &&
      charCode != 32
    ) {
      return true;
    }
    if (charCode == 32) {
      return true;
    } else return false;
  }

  // form submit payment

  onSubmitPmtForm() {
    $('#loader').show();

    // to check value is blank
    let formState =
      this.paymentForm.value.inputCardName != '' &&
      this.paymentForm.value.inputCardNumber != '' &&
      this.paymentForm.value.inputCvvNo != '' &&
      this.paymentForm.value.inputExpDate != '' &&
      this.paymentForm.value.inputZipCode != '';

    if (formState) {
      this.closeButton.nativeElement.click();

      this.paymentForm.reset();
      $('#loader').hide();
    } else {
      $('#loader').hide();
    }
  }

  // CLEAR PAYMENT FORM
  clearForm() {
    this.paymentForm.reset();
    this.paymentErrorMsg[0].ExpDate = false;
  }

  // /////////////////////
  // add member section
  // /////////////////////
  addMemberSubmit() {
    try {
      if (this.addNewMember.valid) {
        $('#loader').show();
        this.SAS.addTeamsMember(this.addNewMember.value).subscribe(
          (res) => {
            try {
              this.addNewMember.reset();
              this.InvalidForm = false;
              this.getInitial();
              $('#loader').hide();
              this.closeButton.nativeElement.click();
            } catch (error) {}
          },
          (error) => {
            $('#loader').hide();
            this.SDS.apiErrorHandle(error.status.toString(), error, false);
          }
        );
      } else {
        // alert('Please enter valid deatils')

        this.InvalidForm = true;

        // $('#')
      }
    } catch (error) {}
  }

  // /////////////////////////
  // get members list
  // /////////////////////////
  getInitial() {
    this.SAS.getTeamsMember().subscribe((res) => {
      this.getMembersData = res['users'];
    });
  }
}
