import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CanvasService } from '../../canvas.service';
import { SozoApiService } from 'src/app/sozo-api.service';
import { SozoDataService } from 'src/app/sozo-data.service';
declare const $: any;
@Component({
  selector: 'app-portfolio-document',
  templateUrl: './portfolio-document.component.html',
  styleUrls: ['./portfolio-document.component.css'],
})
export class PortfolioDocumentComponent implements OnInit {
  totalFolderDocs: any;
  showPortfolioEmpty: any = false;
  interval: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private SAS: SozoApiService,
    private service: CanvasService,
    private router: Router,
    private SDS: SozoDataService
  ) {}

  ngOnInit(): void {
    $('#loader').css('display', 'block');
    let initializePortfolioDocs = async () => {
      try {
        //console.log(this.activatedRoute.snapshot.params.id);
        let response: any = await this.SAS.getFolderDocs(
          this.activatedRoute.snapshot.params.id
        );
        if (response) {
          //console.log(response);
          this.service.totalFolderDocs = response.sozo;
          this.totalFolderDocs = this.service.totalFolderDocs;

          if (this.totalFolderDocs.length > 0) {
            this.showPortfolioEmpty = true;
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
          }, 100);
          // this.router.navigate(['/dashboard/portfolio-docs',id]);
        }
      } catch (error) {
        this.SDS.apiErrorHandle(error?.status.toString(), error);
      } finally {
        $('#loader').css('display', 'none');
      }
    };
    initializePortfolioDocs();
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
  savePermissionsId(viewId, editId, editShareId, id,docsName) {
    this.service.viewDocsId = viewId;
    this.service.editDocsId = editId;
    this.service.editShareDocsId = editShareId;
    this.getSharedDetaial(id);
    this.service.sendDocsOrPortfolio = 'Document';
    this.service.docsProjectName = docsName;
    $('.input_copy_button').val(
      `${this.service.clientBaseUrl}/invitations/accept/invite_${this.service.editShareDocsId}`
    );
  }
  async getSharedDetaial(docsId) {
    try {
      $('#loader').css('display', 'block');
      let response: any = await this.SAS.getSharedData(docsId);
    
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
  moreOption(id) {
    let mainElement = $(`div[id=${id}]`);
    mainElement.find('.lastchange-details').css('display', 'none');
    mainElement.find('.share-and-more').css('display', 'flex');
  }
  renameDocumentHandler(documentId) {
    this.service.renameDocumentHandler = documentId;
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
  async addStarredTemplate(id) {
    $('#loader').css('display', 'block');
    try {
      let rqdata = {
        sozo: id,
      };

      //console.log(rqdata, id);

      let response: any = await this.SAS.addtofavorite(rqdata);
      //console.log(response);
      if (response) {
        let mainElement = $(`div[id=${rqdata.sozo}]`);
        mainElement.find('#addFavorite').css('display', 'none');
        mainElement.find('#removeFavorite').css('display', 'block');
        mainElement.find('#favoriteIcon').css('display', 'block');
        //console.log(mainElement);
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

      //console.log(rqdata, id);

      let response: any = await this.SAS.removeFromFavorite(rqdata);
      if (response) {
        // this.getStarredFlagStatus = false;
        //console.log(response);
        // this.showRemoveFromFavorite = false;
        this.service.totalFavorieDocs.filter((doc, index) => {
          if (doc.sozo._id === rqdata.sozo) {
            //console.log(doc.sozo._id);
            //console.log(response.rqdata);
            this.service.totalFavorieDocs.splice(index, 1);
            let mainElement = $(`div[id=${doc.sozo._id}]`);
            mainElement.find('#addFavorite').css('display', 'block');
            mainElement.find('#removeFavorite').css('display', 'none');
            mainElement.find('#favoriteIcon').css('display', 'none');
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
}
