import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { CanvasService } from '../../canvas.service';

import { SozoApiService } from 'src/app/sozo-api.service';

import { SozoDataService } from 'src/app/sozo-data.service';

declare const $: any;

@Component({
  selector: 'app-starred-document',

  templateUrl: './starred-document.component.html',

  styleUrls: ['./starred-document.component.css'],
})
export class StarredDocumentComponent implements OnInit {
  totalFavoriteDocs: any;

  totalFavoritePortFolio: any;

  showFavoriteEmpty: any = false;

  getStarredFlagStatus: boolean;

  interval: any;

  constructor(
    private SAS: SozoApiService,

    private SDS: SozoDataService,

    private service: CanvasService,

    private router: Router
  ) {}

  ngOnInit(): void {
    $('#loader').css('display', 'block');

    let initializeFavoriteData = async () => {
      try {
        let response: any = await this.SAS.getFavorite();

        if (response) {
          //console.log(response);

          this.totalFavoriteDocs = response.favorites[1].sozo;

          //console.log(this.totalFavoriteDocs);

          this.totalFavoritePortFolio = response.favorites[0].folders;

          // this.totalFavoritePortFolio = this.service.totalFavoriePortFolio;

          this.hoverFolderEventHandler();

          if (this.totalFavoriteDocs.length > 0) {
            this.showFavoriteEmpty = true;
          }

          if (this.totalFavoritePortFolio.length > 0) {
            this.showFavoriteEmpty = true;
          }

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

    initializeFavoriteData();
  }

  renamePortfolioRequestHandler() {
    $('#loader').css('display', 'block');

    let inputFieldData = $('#portfolio-name').val();

    let portFolioID = this.service.renamePortfolioHandler;

    //console.log(inputFieldData);

    if (inputFieldData) {
      let userPortfolioData = async () => {
        try {
          let response = await this.SAS.renameFolderName(
            JSON.stringify({
              folderName: inputFieldData,
            })
          );

          if (response) {
            //console.log(response);

            // $(`#${portFolioID} .title-content`).html(

            //   inputFieldData

            // );

            let filterPortfolio = this.service.portfolioFolder.findIndex(
              (portfolio) => {
                return portfolio._id === portFolioID;
              }
            );

            //console.log(filterPortfolio);

            this.service.portfolioFolder[filterPortfolio].folderName =
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
          }
        } catch (error) {
          this.SDS.apiErrorHandle(error?.status.toString(), error);
        }
      };

      userCanvasData();
    }
  }

  renameFolderHandler(portfolioId) {
    this.service.renamePortfolioHandler = portfolioId;

    //console.log(this.service.renamePortfolioHandler);
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

      $('#loader').css('display', 'none');
    }, 100);
  }

  documentDraggingHandler(ev, id) {
    this.SDS.set('id', id);
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
    this.getSharedDetaial(id);
    this.service.docsProjectName = folderName;

    $('.input_copy_button').val(
      `${this.service.clientBaseUrl}/invitations/accept/invite_${this.service.editShareFolderId}`
    );
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

  renameDocumentHandler(documentId) {
    this.service.renameDocumentHandler = documentId;
  }

  shouldOpenRecentDocsHandler2() {
    this.service.shouldOpenRecentDocs = false;

    this.router.navigate(['/drawing']);
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

  deleteTemplate(data, isFolder) {
    if (isFolder == true) {
      //console.log('1', data);

      this.service.deletefolderDocsId = data;

      //console.log(this.service.deletefolderDocsId);
    } else {
      //console.log('2', data);

      this.service.deleteDocsId = data;
    }
  }

  async removeFavorite(id) {
    $('#loader').css('display', 'block');

    try {
      let rqdata = {
        folder: id,
      };

      //console.log(rqdata, id);

      let response: any = await this.SAS.removeFromFavoritePortfolio(rqdata);

      if (response) {
        //console.log(response);

        this.service.totalFavoriePortFolio.forEach((doc, index) => {
          if (doc._id === rqdata.folder) {
            //console.log(doc._id);

            this.service.totalFavoriePortFolio.splice(index, 1);
          }
        });
      }

      //console.log(response);
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
      $('#loader').css('display', 'none');
    }
  }

  async removeStarredTemplate(id) {
    try {
      let rqdata = {
        sozo: id,
      };

      //console.log(rqdata, id);

      let response: any = await this.SAS.removeFromFavorite(rqdata);

      if (response) {
        //console.log(response);

        this.service.totalFavorieDocs.forEach((doc, index) => {
          if (doc.sozo._id === rqdata.sozo) {
            //console.log(doc.sozo._id);

            this.service.totalFavorieDocs.splice(index, 1);
          }
        });
      }

      //console.log(response);
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    }
  }
}
