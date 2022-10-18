import { Component, OnInit } from '@angular/core';

import { CanvasService } from '../../canvas.service';

import { Router } from '@angular/router';

import { SozoApiService } from 'src/app/sozo-api.service';

import { SozoDataService } from 'src/app/sozo-data.service';

import { DomSanitizer } from '@angular/platform-browser';

declare const $: any;

@Component({
  selector: 'app-my-document',

  templateUrl: './my-document.component.html',

  styleUrls: ['./my-document.component.css'],
})
export class MyDocumentComponent implements OnInit {
  portfolioData: any;

  shouldOpenhandler: boolean;

  totalFolderDocs: any;

  interval: any;

  constructor(
    private SDS: SozoDataService,

    private SAS: SozoApiService,

    private service: CanvasService,

    private router: Router,

    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.shouldOpenhandler = this.service.shouldOpenRecentDocs;

    this.portfolioData = this.service.portfolioFolder;

    $('#loader').css('display', 'block');

    let initializePortfolioData = async () => {
      try {
        let response: any = await this.SAS.getPortfolio();

        if (response) {
          // // $('#loader').css('display', 'none')

          this.service.totalFolderDocs = response?.portfolio[1]?.sozo;

          this.totalFolderDocs = this.service.totalFolderDocs;

          this.service.portfolioFolder = response?.portfolio[0]?.folders;

          this.portfolioData = this.service.portfolioFolder;

          this.hoverFolderEventHandler();

          setTimeout(() => {
            $('.recent-docs-container').mouseenter((e) => {
              $(`div[id=${e.currentTarget.id}]`)
                .find('.share-and-more')

                .css('display', 'flex');

              $(`div[id=${e.currentTarget.id}]`)
                .find('.lastchange-details')

                .css('display', 'none');
            });

            $('.recent-docs-container').mouseleave((e) => {
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
          }, 100);
        }
      } catch (error) {
        this.SDS.apiErrorHandle(error?.status.toString(), error);
      } finally {
      }
    };

    initializePortfolioData();
  }

  deleteTemplate(data, isFolder) {
    if (isFolder == true) {
      this.service.deletefolderDocsId = data;
    } else {
      this.service.deleteDocsId = data;
    }
  }

  base64ToImage(image) {
    if (image) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(image);
    } else {
      return '';
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

      //console.log(response);

      if (response.users.length >=1) {
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

          let li = $(
            '<li class="list-group-item pb-0 d-flex align-items-center"></li>'
          );

          let div = $(
            `<div class="rounded-circle text-white border-dark bg-success d-flex justify-content-center align-items-center share-name-initial font-weight-bold">${nameInitial}</div>`
          );

          let label = $(
            `<label class="mb-0 ml-2 font-weight-bold">${data.userName}</label>`
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
      this.SDS.apiErrorHandle(error?.status.toString(), error);
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

  allowDrop(ev) {
    ev.preventDefault();
  }

  hoverFolderEventHandler() {
    setTimeout(() => {
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
    }, 100);
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

  renameDocumentHandler(documentId) {
    this.service.renameDocumentHandler = documentId;
  }

  renamePortfolioRequestHandler() {
    $('#loader').css('display', 'block');

    let inputFieldData = $('#portfolio-name').val();

    let portFolioID = this.service.renamePortfolioHandler;

    if (inputFieldData) {
      let userPortfolioData = async () => {
        try {
          let response = await this.SAS.renameFolderName(
            JSON.stringify({
              folderName: inputFieldData,
            })
          );

          if (response) {
            // $(`#${portFolioID} .title-content`).html(

            //   inputFieldData

            // );

            let filterPortfolio = this.service.portfolioFolder.findIndex(
              (portfolio) => {
                return portfolio._id === portFolioID;
              }
            );

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

  renameFolderHandler(portfolioId) {
    this.service.renamePortfolioHandler = portfolioId;
  }

  moreOption(id) {
    let mainElement = $(`div[id=${id}]`);

    mainElement.find('.lastchange-details').css('display', 'none');

    mainElement.find('.share-and-more').css('display', 'flex');
  }

  moreFolderOption(id) {
    let mainFolderElement = $(`div[id=${id}]`);

    mainFolderElement.find('.bottom-bar').css('display', 'none');

    mainFolderElement.find('.share-folder').css('display', 'flex');
  }

  async addStarredTemplate(id) {
    $('#loader').css('display', 'block');

    try {
      let rqdata = {
        sozo: id,
      };

      let response: any = await this.SAS.addtofavorite(rqdata);

      if (response) {
        let mainElement = $(`div[id=${rqdata.sozo}]`);

        mainElement.find('#addFavorite').css('display', 'none');

        mainElement.find('#removeFavorite').css('display', 'block');

        mainElement.find('#favoriteIcon').css('display', 'block');
      }

      // //console.log(response);
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
      $('#loader').css('display', 'none');
    }
  }

  async removeStarredTemplate(id) {
    $('#loader').css('display', 'block');

    try {
      let rqdata = {
        sozo: id,
      };

      let response: any = await this.SAS.removeFromFavorite(rqdata);

      if (response) {
        // this.getStarredFlagStatus = false;

        // this.showRemoveFromFavorite = false;

        this.service.totalFavorieDocs.filter((doc, index) => {
          if (doc.sozo._id === rqdata.sozo) {
            this.service.totalFavorieDocs.splice(index, 1);

            let mainElement = $(`div[id=${doc.sozo._id}]`);

            mainElement.find('#addFavorite').css('display', 'block');

            mainElement.find('#removeFavorite').css('display', 'none');

            mainElement.find('#favoriteIcon').css('display', 'none');
          }
        });
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
      $('#loader').css('display', 'none');
    }
  }

  async addFavoritePortfolio(id) {
    $('#loader').css('display', 'block');

    try {
      let rqdata = {
        folder: id,
      };

      let response: any = await this.SAS.addtofavoritePortfolio(rqdata);

      if (response) {
        let mainElement = $(`div[id=${rqdata.folder}]`);

        mainElement.find('#addFavorite').css('display', 'none');

        mainElement.find('#removeFavorite').css('display', 'block');

        mainElement.find('#favoriteIcon').css('display', 'block');
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
      $('#loader').css('display', 'none');
    }
  }

  async removeFavorite(id) {
    $('#loader').css('display', 'block');

    try {
      let rqdata = {
        folder: id,
      };

      let response: any = await this.SAS.removeFromFavoritePortfolio(rqdata);

      if (response) {
        this.service.totalFavoriePortFolio.forEach((doc, index) => {
          if (doc.folder._id === rqdata.folder) {
            this.service.totalFavoriePortFolio.splice(index, 1);
          }
        });
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
      $('#loader').css('display', 'none');
    }
  }

  openRecentDocsHandler(data) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/drawing', data.sozo._id])
    );

    let userData = JSON.parse(localStorage.getItem('userData'));

    if (userData) {
      userData.isNew = false;

      userData.canvasData = data;
    }

    localStorage.setItem('userData', JSON.stringify(userData));

    window.open(url, '_blank');
  }
}
