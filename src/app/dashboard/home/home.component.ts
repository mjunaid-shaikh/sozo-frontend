import { Component, OnInit } from '@angular/core';

import { CanvasService } from '../../canvas.service';

import { Router } from '@angular/router';

import { SozoApiService } from 'src/app/sozo-api.service';

import { SozoDataService } from 'src/app/sozo-data.service';

import { SozoSocketService } from 'src/app/sozo-socket.service';

import { DomSanitizer } from '@angular/platform-browser';

declare const $: any;

@Component({
  selector: 'app-home',

  templateUrl: './home.component.html',

  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  shouldOpenhandler: boolean;

  portfolioData: any;

  getStarredFlagStatus: any = false;

  canvasSavedData: boolean;

  totalRecentDocs: any = [];

  userNameDisplay: any;

  totalFolderDocs: any;

  hideLastDetailClass: boolean = false;

  indexOfMoreOpt = '';

  indexOfMoreFolderOpt = '';

  showRemoveFromFavorite = true;

  showAddToFavorite = false;

  mouseLeaveAccess: boolean = true;

  interval: any;

  intervalPortfolio: any;
  access = true;
  // subscribe
  isSubsribe: boolean = false;
  constructor(
    private SAS: SozoApiService,

    private SDS: SozoDataService,

    private service: CanvasService,

    private SSS: SozoSocketService,

    private router: Router,

    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.portfolioData = this.service.portfolioFolder;

    let userDetails = JSON.parse(localStorage.getItem('userDetails'));

    this.userNameDisplay = `Welcome, ${userDetails.firstName} ${userDetails.lastName}!`;

    this.getStarredFlagStatus = this.service.templateStarredFlag;

    this.shouldOpenhandler = this.service.shouldOpenRecentDocs;

    this.canvasSavedData = !!this.service.canvasSavedData;

    if (!!this.service.canvasSavedData) {
      $('.recent-docs-hover').css({ display: 'block' });
    }

    this.recentProject();

    // call user info api
    this.getUserInfo()

    this.SSS.socket.on('thumbnail', (value) => {
      this.totalRecentDocs.forEach((element, index) => {
        if (element.sozo._id == value._id) {
          this.totalRecentDocs[index].sozo.imgData = value.imgData;

          this.totalRecentDocs[index].sozo.name = value.name;
        }
      });
    });
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
          if(planEndDate>currentDate)
          {
            this.isSubsribe=false
          }else
          {
            this.isSubsribe=true

          }
        }
      } catch (error) {
        this.SDS.apiErrorHandle(error?.status.toString(), error);
      } finally {
        $('#loader').css('display', 'none');
      }
    }
    getUser();
  }

  async recentProject() {
    $('#loader').css('display', 'block');

    try {
      let response: any = await this.SAS.userInitialData();
    
      if (response) {
        // this.interval = setInterval(() => {

        //   let callAgain = async () => {

        //     try {

        //       let response: any = await this.SAS.userInitialData();

        //       // let access = true;

        //       if (response) {

        //         // //////console.log(response)

        //         if (this.access) {

        //           //////console.log(this.access)

        //           this.service.totalRecentDocs = response.documents;

        //           // //////console.log(this.service.totalRecentDocs)

        //           this.service.totalRecentDocs.forEach((docs) => {

        //             // //////console.log(docs.sozo)

        //             let mainElement = $(`div[id=${docs.sozo._id}]`);

        //             // //////console.log(mainElement)

        //             mainElement

        //               .find('#canvasImg')

        //               .attr('src', docs.sozo.imgData);

        //             mainElement

        //               .find('.recent-docs-name')

        //               .html(docs.sozo.name);

        //           });

        //         }

        //       }

        //     } catch (error) {

        //       //////console.log(error);

        //     }

        //   };

        //   callAgain();

        // }, 5000);

        // //////console.log(response.documents);

        this.service.totalRecentDocs = response.documents;

        this.totalRecentDocs = this.service.totalRecentDocs;

        ////console.log("total recent docs--", this.totalRecentDocs[0]);

        this.hoverDocsEventHandler();
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
    }
  }

  async myPortfolios() {
    $('#loader').css('display', 'block');

    try {
      let response: any = await this.SAS.getPortfolio();

      this.hoverFolderEventHandler();

      this.hoverDocsEventHandler();

      if (response) {
        // //////console.log(response);

        this.service.portfolioFolder = response?.portfolio[0]?.folders;

        this.portfolioData = this.service.portfolioFolder;

        this.service.totalFolderDocs = response?.portfolio[1]?.sozo;

        this.totalFolderDocs = this.service.totalFolderDocs;

        this.hoverFolderEventHandler();

        this.hoverDocsEventHandler();
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
    }
  }

  hoverDocsEventHandler() {
    setTimeout(() => {
      //////console.log($('.recent-docs-hover'));

      $('.recent-docs-hover').mouseenter((e) => {
        $(`div[id=${e.currentTarget.id}]`)
          .find('.share-and-more')

          .css('display', 'flex');

        $(`div[id=${e.currentTarget.id}]`)
          .find('.lastchange-details')

          .css('display', 'none');
      });

      $('.recent-docs-hover').mouseleave((e) => {
        if (
          $(`div[id=${e.currentTarget.id}]`)
            .find('.more_list')

            .css('display') === 'none'
        ) {
          $(`div[id=${e.currentTarget.id}]`)
            .find('.share-and-more')

            .css('display', 'none');

          $(`div[id=${e.currentTarget.id}]`)
            .find('.lastchange-details')

            .css('display', 'flex');
        }
      });

      $('#loader').css('display', 'none');
    }, 0);
  }

  hoverFolderEventHandler() {
    setTimeout(() => {
      //////console.log($('.recent-folder'));

      $('.recent-folder').mouseenter((e) => {
        $(`div[id=${e.currentTarget.id}]`)
          .find('.share-folder')

          .css('display', 'flex');

        $(`div[id=${e.currentTarget.id}]`)
          .find('.bottom-bar')

          .css('display', 'none');
      });

      $('.recent-folder').mouseleave((e) => {
        if (
          $(`div[id=${e.currentTarget.id}]`)
            .find('.more_folder_list')

            .css('display') === 'none'
        ) {
          $(`div[id=${e.currentTarget.id}]`)
            .find('.share-folder')

            .css('display', 'none');

          $(`div[id=${e.currentTarget.id}]`)
            .find('.bottom-bar')

            .css('display', 'flex');
        }
      });

      $('#loader').css('display', 'none');
    }, 0);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  ngAfterViewInit(): void {
    $(document).on('mouseup', () => {
      this.hideDropDown();
    });
  }

  hideDropDown() {
    $('.share-and-more').css('display', 'none');

    $('.lastchange-details').css('display', 'flex');

    $('.bottom-bar').css('display', 'flex');

    $('.share-folder').css('display', 'none');
  }

  renameDocumentRequestHandler() {
    $('#loader').css('display', 'block');

    let inputFieldData = $('#recipient-name').val();

    if (inputFieldData) {
      let userCanvasData = async () => {
        try {
          let response = await this.SAS.renameDocumentName(
            JSON.stringify({
              name: inputFieldData,
            })
          );

          if (response) {
            $(`#${this.service.renameDocumentHandler} .recent-docs-name`).html(
              inputFieldData
            );

            $('#loader').css('display', 'none');
          }
        } catch (error) {
          this.SDS.apiErrorHandle(error?.status.toString(), error);
        }
      };

      userCanvasData();
    }
  }

  renamePortfolioRequestHandler() {
    $('#loader').css('display', 'block');

    let inputFieldData = $('#portfolio-name').val();

    let portFolioID = this.service.renamePortfolioHandler;

    //////console.log(inputFieldData);

    if (inputFieldData) {
      let userPortfolioData = async () => {
        try {
          let response = await this.SAS.renameFolderName(
            JSON.stringify({
              folderName: inputFieldData,
            })
          );

          if (response) {
            //////console.log(response);

            // $(`#${portFolioID} .title-content`).html(

            //   inputFieldData

            // );

            let filterPortfolio = this.service.portfolioFolder.findIndex(
              (portfolio) => {
                return portfolio.folder._id === portFolioID;
              }
            );

            //////console.log(filterPortfolio);

            this.service.portfolioFolder[filterPortfolio].folder.folderName =
              inputFieldData;

            $('#loader').css('display', 'none');
          }
        } catch (error) {
          this.SDS.apiErrorHandle(error?.status.toString(), error);
        }
      };

      userPortfolioData();
    }
  }

  async getDocs(id) {
    try {
      let response: any = await this.SAS.getFolderDocs(id);

      if (response) {
        this.router.navigate(['/dashboard/portfolio-docs', id]);
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    }
  }

  documentDraggingHandler(ev, id) {
    this.SDS.set('id', id);
  }

  async drop(ev, id) {
    ev.preventDefault();

    $('#loader').css('display', 'block');

    try {
      let rqdata = {
        sozo: this.SDS.get('id'),
      };

      let response: any = await this.SAS.updateFolder(rqdata, id);

      if (response) {
        this.service.totalFolderDocs.forEach((doc, index) => {
          if (doc.sozo._id === rqdata.sozo) {
            this.service.totalFolderDocs.splice(index, 1);
          }
        });
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
      $('#loader').css('display', 'none');
    }
  }

  allowDrop(ev) {
    ev.preventDefault();
  }

  renameDocumentHandler(documentId) {
    this.service.renameDocumentHandler = documentId;
  }

  renameFolderHandler(portfolioId) {
    this.service.renamePortfolioHandler = portfolioId;
  }

  shouldOpenRecentDocsHandler2() {
    this.service.shouldOpenRecentDocs = false;

    this.router.navigate(['/drawing']);
  }

  savePermissionsId(viewId, editId, editShareId, id, docsName) {
    this.service.viewDocsId = viewId;

    this.service.editDocsId = editId;

    this.service.editShareDocsId = editShareId;
    this.service.sendDocsOrPortfolio = 'Document';
    this.service.docsProjectName = docsName;

    this.getSharedDetaial(id);

    $('.input_copy_button').val(
      `${this.service.clientBaseUrl}/invitations/accept/invite_${this.service.editShareDocsId}`
    );
  }

  async getSharedDetaial(docsId) {
    try {
      $('#loader').css('display', 'block');

      let response: any = await this.SAS.getSharedData(docsId);

      if (response.users.length >= 1) {
        $('.shared-with-none').css('display', 'none');

        $('.shared-user-list').css('display', 'block');

        $('.shared-user-list').find('li').remove();

        response.users.filter((data) => {
          let userInitialName = data.userName.split(' ');

          var firstNameChar = '';
          var lastNameChar = '';
          if (userInitialName.length == 2) {
            firstNameChar = userInitialName[0].split('')[0];
            lastNameChar = userInitialName[1].split('')[0];
          } else {
            firstNameChar = userInitialName[0].split('')[0];
          }

          let nameInitial = firstNameChar + lastNameChar;
          let initialData = nameInitial.toUpperCase();
          let fullName = data.userName.toUpperCase();

          let li = $(
            '<li class="list-group-item pb-0 d-flex align-items-center"></li>'
          );

          let div = $(
            `<div class="rounded-circle text-white border-dark bg-success d-flex justify-content-center align-items-center share-name-initial font-weight-bold">${initialData}</div>`
          );

          let label = $(
            `<label class="mb-0 ml-2 font-weight-bold">${fullName}</label>`
          );

          li.append(div);

          li.append(label);

          $('.shared-user-list').append(li);
        });
      } else {
        $('.shared-with-none').css('display', 'block');

        $('.shared-user-list').css('display', 'none');
      }

      $('#loader').css('display', 'none');
    } catch (error) {
      // this.SDS.apiErrorHandle(error?.status.toString(), error);
    }
  }

  saveFolderPermissionsId(viewId, editId, editShareId, id, folderName) {
    this.service.viewFolderId = viewId;

    this.service.editFolderId = editId;

    this.service.editShareFolderId = editShareId;
    this.service.sendDocsOrPortfolio = 'Folder';
    this.service.docsProjectName = folderName;
    this.getSharedDetaial(id);
    $('.input_copy_button').val(
      `${this.service.clientBaseUrl}/invitations/accept/invite_${this.service.editShareFolderId}`
    );
  }
  deleteTemplate(data) {
    //////console.log(data);

    this.service.deleteDocsId = data;
  }

  deleteFolder(id) {
    //////console.log(id);

    this.service.deletefolderDocsId = id;
  }

  openRecentDocsHandler(data) {
    ////console.log("open handeler", data);

    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/drawing', data.sozo._id])
    );

    let userData = JSON.parse(localStorage.getItem('userData'));

    if (userData) {
      userData.isNew = false;

      userData.canvasData = data;
    }

    localStorage.setItem('userData', JSON.stringify(userData));

    // Open Dashboard projects in new window
    window.open(url, '_blank');
  }

  advanceCollaboration() {
    var x = document.getElementById('collab');

    if (x.style.display === 'none') {
      x.style.display = 'block';
    } else {
      x.style.display = 'none';
    }
  }

  removeTemplate() {
    var tempId = document.getElementById('temp');

    tempId.remove();

    this.service.canvasSavedData = null;
  }

  whiteboard() {
    this.router.navigate(['../drawing']);
  }

  moreOption(id) {
    this.access = false;

    let mainElement = $(`div[id=${id}]`);

    mainElement.find('.lastchange-details').css('display', 'none');

    mainElement.find('.share-and-more').css('display', 'flex');
  }

  moreFolderOption(id) {
    let mainFolderElement = $(`div[id=${id}]`);

    mainFolderElement.find('.bottom-bar').css('display', 'none');

    mainFolderElement.find('.share-folder').css('display', 'flex');
  }

  async addStarredTemplate(id, isRecent = true) {
    this.SDS.displayLoader();

    try {
      let rqdata = {
        sozo: id,
      };

      let response: any = await this.SAS.addtofavorite(rqdata);

      if (response) {
        if (isRecent) {
          this.service.totalRecentDocs[
            this.service.totalRecentDocs.findIndex((e) => e.sozo._id == id)
          ].isFavorite = true;
        } else {
          this.totalFolderDocs[
            this.totalFolderDocs.findIndex((e) => e.sozo._id == id)
          ].isFavorite = true;
        }
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
      this.SDS.removeLoader();
    }
  }

  async removeStarredTemplate(id, isRecent = true) {
    this.SDS.displayLoader();

    try {
      let rqdata = {
        sozo: id,
      };

      let response: any = await this.SAS.removeFromFavorite(rqdata);

      if (response) {
        // this.getStarredFlagStatus = false;

        if (isRecent) {
          this.service.totalRecentDocs[
            this.service.totalRecentDocs.findIndex((e) => e.sozo._id == id)
          ].isFavorite = false;
        } else {
          this.totalFolderDocs[
            this.totalFolderDocs.findIndex((e) => e.sozo._id == id)
          ].isFavorite = false;
        }
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
      this.SDS.removeLoader();
    }
  }

  async addFavoritePortfolio(id) {
    this.SDS.displayLoader();

    try {
      let rqdata = {
        folder: id,
      };

      let response: any = await this.SAS.addtofavoritePortfolio(rqdata);

      if (response) {
        this.portfolioData[
          this.portfolioData.findIndex((e) => e.folder._id == id)
        ].folder.isFavorite = true;
      }
    } catch (error) {
      //////console.log(error);
    } finally {
      this.SDS.removeLoader();
    }
  }

  async removeFavorite(id) {
    this.SDS.displayLoader();

    try {
      let rqdata = {
        folder: id,
      };

      let response: any = await this.SAS.removeFromFavoritePortfolio(rqdata);

      if (response) {
        this.portfolioData[
          this.portfolioData.findIndex((e) => e.folder._id == id)
        ].folder.isFavorite = false;
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
      this.SDS.removeLoader();
    }
  }
}
