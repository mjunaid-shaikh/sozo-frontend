import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

declare let $: any;

@Injectable({
  providedIn: 'root',
})
export class SozoDataService {
  // for shared project user list
  SharedUserList = new BehaviorSubject([]);
  currentSharedUserList = this.SharedUserList.asObservable();
  constructor(private router: Router) {}

  private data: any;

  private selectedShapedata: any;

  initializeState() {
    this.data = {
      LOADER_STACK: 0,
    };
  }

  get(key) {
    return this.data[key];
  }

  set(key, data) {
    this.data[key] = data;
  }

  // to set shapes and data

  getSelectedShape() {
    return this.selectedShapedata;
  }

  setSelectedShape(data) {
    this.selectedShapedata = data;
  }
  // to set shared data
  setgetSharedData(data) {
    this.SharedUserList.next(data);
  }

  displayLoader() {
    $('#loader').show();
    this.data.LOADER_STACK++;
  }

  removeLoader() {
    if (this.data.LOADER_STACK > 0) {
      this.data.LOADER_STACK--;
    }

    if (this.data.LOADER_STACK == 0) {
      $('#loader').hide();
    }
  }

  triggerError(errorText) {
    $('#errorModalText').text(errorText);
    $('#errorModal').modal('show');
  }

  triggerSuccess(successText) {
    $('#successModalText').text(successText);
    $('#successModal').modal('show');
  }

  apiErrorHandle(status: any, error: any, isAuth: boolean = false) {
    $('#loader').css('display', 'none');

    switch (status) {
      case '400':
        this.triggerError(error?.error?.message);
        break;
      case '401':
        if (isAuth) {
          this.triggerError(error?.error?.message);
        } else {
          localStorage.clear();
          this.router.navigate(['/login']);
        }
        break;
      case '500':
        ``;
        this.triggerError(error?.error?.message);
        break;
      case '404':
        this.triggerError(error?.error?.message);
        break;
    }
  }
}
