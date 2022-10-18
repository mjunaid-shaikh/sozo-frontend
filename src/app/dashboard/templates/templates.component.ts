import { Component, OnInit, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CanvasService } from 'src/app/canvas.service';
import { SozoApiService } from 'src/app/sozo-api.service';
import { SozoDataService } from 'src/app/sozo-data.service';
import { SozoSocketService } from 'src/app/sozo-socket.service';
declare const $: any;

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.css']
})
export class TemplatesComponent implements OnInit {

  totalRecentDocs: Array<any> = [];
  selectedData: any;
  isSubsribe: boolean = false;
  constructor(
    private http: SozoApiService,
    private SAS: SozoApiService,
    private SDS: SozoDataService,
    private service: CanvasService,
    private SSS: SozoSocketService,
    private router: Router,
    private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.getTemplateList();
    this.getUserInfo();
  }


  // get user details
  getUserInfo() {
    let getUser = async () => {
      try {
        let id = localStorage.getItem('userId');
        let response: any = await this.SAS.getUserData(id);
        if (response) {
          let currentDate = new Date().getTime();
          let planEndDate = new Date(response['user']['order']['plan_end_date']).getTime();
          if (planEndDate > currentDate) {
            this.isSubsribe = false
          } else {
            this.isSubsribe = true
          }
          //console.log("is subscribe", this.isSubsribe);

        }
      } catch (error) {
        this.SDS.apiErrorHandle(error?.status.toString(), error);
      } finally {
        $('#loader').css('display', 'none');
      }
    }
    getUser();
  }

  //get default template list list
  getTemplateList() {
    $('#loader').css('display', 'block');
    this.http.request('get', '/sozo/getTemplate', null).subscribe(res => {
      this.totalRecentDocs = res['documents'];
      $('#loader').css('display', 'none');
    })
  }

  // on select data push to variables
  openRecentDocsHandler(data) {
    this.selectedData = data;

  }

  // create new project using existing templates
  createNewProjectTemplate() {
    this.http.request('post', '/sozo/templetToSozo/' + this.selectedData.sozo._id, null).subscribe(res => {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/drawing', res['id']])
      );
      let userData = JSON.parse(localStorage.getItem('userData'));
      if (userData) {
        userData.isNew = false;
        userData.canvasData = this.selectedData;
      }
      localStorage.setItem('userData', JSON.stringify(userData));
      window.open(url, '_blank');
    })



  }



}
