import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CanvasService } from '../canvas.service';
import { SozoApiService } from '../sozo-api.service';
import { SozoDataService } from '../sozo-data.service';
import { SozoSocketService } from '../sozo-socket.service';
import { CONSTANTS } from '../constants/global-constants';
declare const $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  showOpenSidebarIcon = true;
  showCloseSidebarIcon = false;
  sozoCollapseIcon = false;
  sozoCollapseLogo = true;
  shouldOpenhandler: boolean;
  folderName = '';
  folderNameArr = [];
  userTags = [];
  folderInputData: any = '';
  selectedProfileImage: any;
  addPeopleLink: any;
  addPeopleFolderLink: any;
  BASE_URL = CONSTANTS.SOCKET_BASE_URL;
  userData: any = {};
  notificationList: any = [];
  notificationPop: boolean = false;
  convertDate: any;
  // share user list...
  userList: boolean = false;
  sharedUserDetails: any = [];
  isSubsribe: boolean = false;

  constructor(
    private SAS: SozoApiService,
    private SDS: SozoDataService,
    private service: CanvasService,
    private SSS: SozoSocketService,
    private router: Router
  ) { }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.code === 'Enter') {
      if ($('#folder').css('display') === 'block') {
        this.addFolder();
        $('#folder').modal('hide');
      }
    }
  }

  ngOnInit(): void {
    let currentDate = new Date();
    this.convertDate = currentDate.toISOString();
    this.shouldOpenhandler = this.service.shouldOpenRecentDocs;

    // behaviour subject for shared userlist
    this.SDS.currentSharedUserList.subscribe((res) => {
      this.sharedUserDetails = res;
    });

    this.SSS.initializeSocket();

    this.SSS.socket.on('comments', (value) => {
      if (value.user_id != this.userData?._id) {
        this.notificationPop = true;
      }
    });

    $('#shareModal').on('hidden.bs.modal', function () {
      $('.input_copy_button').val('');
      $('#userInput').tagsinput('removeAll');
      $('#comments').val('');
      this.addPeopleLink = null;
      $('.permission-list img').remove();
      $('.permission-list span').remove();
      let spanDataToPush = $(`<span class="">Edit and share</span>`).css({
        color: '#000',
      });
      let iconToPush = $(
        ' <img src="assets/img/caretIcon.svg" class="ml-2" width="10">'
      );
      $('.permission-list').append(spanDataToPush, iconToPush);

      $('.people_drop_button img').remove();
      $('.people_drop_button img').remove();
      let addImgToPush = $(
        `<img src="assets/img/dashboradShareEditActive.svg">`
      ).css({
        width: '1.1rem',
        'margin-right': '0.4rem',
      });

      let addIconToPush = $(
        ' <img src="assets/img/dashboardShareWithDropdown.svg" class="float-right mt-2" width="10">'
      );
      $('.people_drop_button').append(addImgToPush, addIconToPush);
    });

    $(document).ready(() => {
      $('#searchContent').focusin(() => {
        this.router.navigate(['/dashboard/search-result']);
      });

      $('.form-search').on('submit', () => {
        $('div.template_list').css('display', 'flex');
        if ($('#searchContent').val() === '') {
          this.router.navigate(['/dashboard/home']);
          $('div.template_list').css('display', 'flex');
        }
        return false;
      });

      $('.form-search .search_btn').on('click', (e) => {
        var query = $('#searchContent').val().toLowerCase();

        $('div.docs-project .recent-docs-name').each(function () {
          var $this = $(this);
          if ($this.text().toLowerCase().indexOf(query) === -1) {
            $this.closest('div.docs-project').fadeOut();
          } else {
            $this.closest('div.docs-project').fadeIn();
          }
        });
      });
    });

    $('#userInput').tagsinput({
      trimValue: true,
    });
    $('#userInput').on('beforeItemAdd', function (event) {
      if (/^\w+[\w-\.]*\@\w+((-\w+)|(\w*))\.[a-z]{2,3}$/i.test(event.item)) {
        event.cancel = false;
      } else {
        event.cancel = true;
        $('.alert').css('display', 'block');
        setTimeout(function () {
          $('.alert').css('display', 'none');
        }, 2000);
      }
    });
    $('#userFolderInput').tagsinput({
      trimValue: true,
    });
    $('#userFolderInput').on('beforeItemAdd', function (event) {
      if (/^\w+[\w-\.]*\@\w+((-\w+)|(\w*))\.[a-z]{2,3}$/i.test(event.item)) {
        event.cancel = false;
      } else {
        event.cancel = true;
        $('.alert').css('display', 'block');
        setTimeout(function () {
          $('.alert').css('display', 'none');
        }, 2000);
      }
    });
    if (localStorage.getItem('userToken')) {
      this.SDS.set('authToken', localStorage.getItem('userToken'));
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }

    this.getUserInfo();
    $('.header-sidebar .common').click(function () {
      $('.header-sidebar .common').removeClass('active');

      $(this).addClass('active');
    });

    $('.home-recent .common').click(function () {
      $('.home-recent .common').removeClass('active').css({ color: 'black' });

      $(this).addClass('active').css({ color: '#137ef9 ' });
    });

    $('.add_more_user_btn a').click(function () {
      $('.people_drop_button img').remove();
      $('.people_drop_button img').remove();
      let imgNamePush = $(this).find('img:nth-child(2)').attr('src').split('/');

      imgNamePush = imgNamePush[imgNamePush.length - 1];

      let imgToPush = $(`<img src="assets/img/${imgNamePush}">`).css({
        width: '1.1rem',
        'margin-right': '0.4rem',
      });

      let iconToPush = $(
        ' <img src="assets/img/dashboardShareWithDropdown.svg" class="float-right mt-2" width="10">'
      );
      $('.people_drop_button').append(imgToPush, iconToPush);
    });

    $('.permission-Opt a').click(function () {
      $('.permission-list img').remove();
      $('.permission-list span').remove();
      let spanTagToPush = $(this).find('span').html();

      let spanDataToPush = $(`<span class="">${spanTagToPush}</span>`).css({
        color: '#000',
      });
      let iconToPush = $(
        ' <img src="assets/img/caretIcon.svg" class="ml-2" width="10">'
      );
      $('.permission-list').append(spanDataToPush, iconToPush);
    });

    $('.copy_input_button').click(() => {
      $('#liveToast').toast('show');
      document.addEventListener(
        'copy',
        function (e) {
          e.clipboardData.setData('text/plain', $('.input_copy_button').val());
          e.preventDefault();
        },
        true
      );
      document.execCommand('copy');
    });
    $('.copy-folder-link').click(() => {
      $('#liveToast').toast('show');
      document.addEventListener(
        'copy',
        function (e) {
          e.clipboardData.setData('text/plain', $('.input_copy_button').val());
          e.preventDefault();
        },
        true
      );
      document.execCommand('copy');
    });
  }

  // get user info
  getUserInfo() {
    $('#loader').css('display', 'block');
    let getUser = async () => {
      try {
        let id = localStorage.getItem('userId');
        let response: any = await this.SAS.getUserData(id);

        if (response) {
          this.userData = response.user;
          this.selectedProfileImage = response.user.profile_image;

          let currentDate = new Date().getTime();
          let planEndDate = new Date(response['user']['order']['plan_end_date']).getTime();

          if (planEndDate > currentDate) {

            this.isSubsribe = true
          } else {
            this.isSubsribe = false
          }

          //console.log("is sub scirbe", this.isSubsribe);


        }
      } catch (error) {
        this.SDS.apiErrorHandle(error?.status.toString(), error);
      } finally {
        $('#loader').css('display', 'none');
      }
    };
    getUser();
  }

  ngAfterViewInit() {
    (function activeFunction() {
      const btns = document.getElementsByClassName('sub-menu');
      for (let i = 0; i < btns.length; i++) {
        btns[i].addEventListener('mousedown', function () {
          let current = document.getElementsByClassName('active');
          current[0].className = current[0].className.replace(' active', '');
          this.className += ' active';
        });
      }
    })();
  }
  addMoreUserTags() {
    let userDataTags = $('#userInput').val();
    this.userTags.push(userDataTags);
  }
  deleteUserTags(i) {
    this.userTags.splice(i, 1);
  }

  openRecentDocsHandler() {
    this.service.shouldOpenRecentDocs = false;

    let userCanvasData = async () => {

      try {
        const response: any = await this.SAS.newCanvas({ document: [] });
        const url = this.router.serializeUrl(
          this.router.createUrlTree(['/drawing', response.id])
        );
        let userData = {
          documentID: response.id,
          isNew: true,
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        window.open(url, '_blank');
      } catch (error) {
        this.SDS.apiErrorHandle(error?.status.toString(), error);
      }
    };
    userCanvasData();
  }
  settingNevigation() {
    return this.router.navigate(['/setting']);
  }
  addPeopleEditShareLinkGen() {
    this.addPeopleLink = `${this.service.clientBaseUrl}/invitations/accept/invite_${this.service.editShareDocsId}`;
  }
  addPeopleEditLinkGen() {
    this.addPeopleLink = `${this.service.clientBaseUrl}/invitations/accept/invite_${this.service.editDocsId}`;
  }
  addPeopleViewLinkGen() {
    this.addPeopleLink = `${this.service.clientBaseUrl}/invitations/accept/invite_${this.service.viewDocsId}`;
  }
  editShareLinkGen() {
    $('.input_copy_button').val(
      `${this.service.clientBaseUrl}/invitations/accept/invite_${this.service.editShareDocsId}`
    );
  }
  editLinkGen() {
    $('.input_copy_button').val(
      `${this.service.clientBaseUrl}/invitations/accept/invite_${this.service.editDocsId}`
    );
  }
  viewLinkGen() {
    $('.input_copy_button').val(
      `${this.service.clientBaseUrl}/invitations/accept/invite_${this.service.viewDocsId}`
    );
  }
  editShareFolderLinkGen() {
    $('.input_copy_button').val(
      `${this.service.clientBaseUrl}/invitations/accept/invite_${this.service.editShareFolderId}`
    );
  }
  editFolderLinkGen() {
    $('.input_copy_button').val(
      `${this.service.clientBaseUrl}/invitations/accept/invite_${this.service.editFolderId}`
    );
  }
  viewFolderLinkGen() {
    $('.input_copy_button').val(
      `${this.service.clientBaseUrl}/invitations/accept/invite_${this.service.viewFolderId}`
    );
  }

  addPeopleEditShareFolderLinkGen() {
    this.addPeopleFolderLink = `${this.service.clientBaseUrl}/invitations/accept/invite_${this.service.editShareFolderId}`;
  }
  addPeopleEditFolderLinkGen() {
    this.addPeopleFolderLink = `${this.service.clientBaseUrl}/invitations/accept/invite_${this.service.editFolderId}`;
  }
  addPeopleViewFolderLinkGen() {
    this.addPeopleFolderLink = `${this.service.clientBaseUrl}/invitations/accept/invite_${this.service.viewFolderId}`;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
  closeSidebar() {
    $('#sidebar,#routeContent').hasClass('sidebar-collapsed');
    $('#sidebar,#routeContent').removeClass('sidebar-collapsed');
    $('.sidebar-collapse-icon').removeClass('sidebar-collapsed');
    $('.side-menu-name').css('display', 'block');

    this.sozoCollapseIcon = false;
    this.sozoCollapseLogo = true;
    this.showOpenSidebarIcon = true;
    this.showCloseSidebarIcon = false;
  }

  async addFolder() {
    let checkFolderValue =
      this.folderInputData === '' ? 'New Portfolio' : this.folderInputData;
    try {
      const rqData = {
        folderName: checkFolderValue,
      };
      let response: any = await this.SAS.createFolder(rqData);

      if (response) {
        $('#loader').css('display', 'none');
        this.service.portfolioFolder.push(response.folder);
        this.hoverFolderEventHandler();
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    }

    this.router.navigate(['/dashboard/myPortfolios']);
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
  removeTemplate() {
    if (this.service.deleteDocsId != null) {
      this.deleteUserDoc();
    }

    if (this.service.deletefolderDocsId != null) {
      this.deletefolderDoc();
    }
  }
  dropProject(ev) { }
  allowDrop(ev) {
    ev.preventDefault();
  }
  deleteUserDoc = async () => {
    try {
      $('#loader').css('display', 'block');
      let response: any = await this.SAS.deleteUserDocument(
        this.service.deleteDocsId
      );
      if (response) {
        this.service.totalRecentDocs.filter((docs, index) => {
          if (docs.sozo._id === this.service.deleteDocsId) {
            this.service.totalRecentDocs.splice(index, 1);
          }
        });
        this.service.totalFolderDocs.filter((doc, index) => {
          if (doc.sozo._id === this.service.deleteDocsId) {
            this.service.totalFolderDocs.splice(index, 1);
          }
        });
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
      $('#loader').css('display', 'none');
    }
  };

  deletefolderDoc = async () => {
    try {
      $('#loader').css('display', 'block');
      let response: any = await this.SAS.deleteFolderDocument(
        this.service?.deletefolderDocsId
      );
      if (response) {
        $('#loader').css('display', 'none');

        this.service.portfolioFolder.filter((doc, index) => {
          if (doc.folder._id === this.service.deletefolderDocsId) {
            this.service.portfolioFolder.splice(index, 1);
          }
        });
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
      $('#loader').css('display', 'none');
    }
  };

  advanceCollaboration() {
    var x = document.getElementById('collab');
    if (x.style.display === 'none') {
      x.style.display = 'block';
    } else {
      x.style.display = 'none';
    }
  }
  shouldOpenRecentDocsHandler2() {
    this.service.shouldOpenRecentDocs = false;
    this.router.navigate(['/drawing']);
  }
  editPeopleShare() {
    var tempId = document.getElementById('editPeople');
    tempId.remove();
  }
  modalClose() {
    $('.share-modal').modal('hide');
  }

  async sharePeopleSubmit() {
    $('#loader').css('display', 'block');
    let emailData = $('#userInput').val().split(',');
    let commentData = $('#comments').val();
    if (emailData.includes('')) {
      this.SDS.triggerError('Please provide email address');
      $('#loader').css('display', 'none');
      return;
    }

    let rqData = {
      email: emailData,
      comments: commentData,
      invitationUrl:
        this.addPeopleLink ??
        `${this.service.clientBaseUrl}/invitations/accept/invite_${this.service.editShareDocsId}`,
      projectName: this.service.docsProjectName,
    };

    this.SAS.addPeopleEmail(rqData)
      .then((response: any) => { })
      .catch((error: any) => {
        this.SDS.apiErrorHandle(error?.status.toString(), error);
      })
      .finally(() => {
        $('#loader').css('display', 'none');
      });
  }
  async shareFolderPeopleSubmit() {
    $('#loader').css('display', 'block');
    let emailData = $('#userInput').val().split(',');
    let commentData = $('#comments').val();
    if (emailData.includes('')) {
      this.SDS.triggerError('Please provide email address');
      $('#loader').css('display', 'none');
      return;
    }
    let rqData = {
      email: emailData,
      comments: commentData,
      invitationUrl:
        this.addPeopleFolderLink ??
        `${this.service.clientBaseUrl}/invitations/accept/invite_${this.service.editShareFolderId}`,
      projectName: this.service.docsProjectName,
    };

    this.SAS.addPeopleEmail(rqData)
      .then((response: any) => { })
      .catch((error: any) => {
        this.SDS.apiErrorHandle(error?.status.toString(), error);
      })
      .finally(() => {
        $('#loader').css('display', 'none');
      });
  }
  shareDocsOrPortfolios() {
    if (this.service.sendDocsOrPortfolio == 'Document') {
      this.sharePeopleSubmit();
    } else {
      this.shareFolderPeopleSubmit();
    }
  }

  collapseSidebar() {
    $('#sidebar,#routeContent').hasClass('sidebar-collapsed');
    $('#sidebar,#routeContent').addClass('sidebar-collapsed');
    $('.sidebar-collapse-icon').addClass('sidebar-collapsed');
    $('.side-menu-name').css('display', 'none');

    $('#myProjectCollapse').collapse('hide');
    this.sozoCollapseIcon = true;
    this.sozoCollapseLogo = false;
    this.showOpenSidebarIcon = false;
    this.showCloseSidebarIcon = true;
  }

  myProjectCollapsed() {
    $('#myProjectAccordian').addClass('active');
  }

  NavigateToSubcription() {
    this.router.navigate(['/setting/subscription']);
  }

  async notification() {
    try {
      $('#notificationPop').toast('show');
      const response: any = await this.SAS.getNotification();

      if (response.status == CONSTANTS.API_SUCCESS) {
        this.notificationPop = false;
        this.notificationList = response.notification ?? [];
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    } finally {
    }
  }
}
