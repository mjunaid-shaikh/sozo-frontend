import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SozoDataService } from './sozo-data.service';
import { CanvasService } from './canvas.service';
import { SozoSocketService } from './sozo-socket.service';
import { CONSTANTS } from './constants/global-constants';
@Injectable({
  providedIn: 'root',
})
export class SozoApiService {
  constructor(
    private SDS: SozoDataService,
    private http: HttpClient,
    private service: CanvasService,
    private SSS: SozoSocketService
  ) { }

  BASE_URL = CONSTANTS.BASE_URL;
  CLIENT_BASE_URL = CONSTANTS.CLIENT_BASE_URL;
  // private BASE_URL = 'http://localhost:8000/api/v1';
  private LOGIN = this.BASE_URL + '/user/login';
  private SIGNUP = this.BASE_URL + '/user/signup';
  private NEWCANVAS = this.BASE_URL + '/sozo';
  private UPDATECANVAS = this.BASE_URL + '/sozo/';
  private DUPLICATECANVAS = this.BASE_URL + '/sozo/duplicate/';
  private INVITELINK = this.BASE_URL + '/sozo/invitations/accept/';
  private MEETING = this.BASE_URL + '/sozo/meeting';
  private FORGOTPASSWORD = this.BASE_URL + '/user/forgotPassword';
  private RESETPASSWORD = this.BASE_URL + '/user/resetPassword';
  private CHANGEPASSWORD = this.BASE_URL + '/user/changePassword';
  private GETPORTFOLIOS = this.BASE_URL + '/sozo/folder/portfolio';
  private CREATEANDUPDATEFOLDER = this.BASE_URL + '/sozo/folder';
  private GETFOLDERDOCS = this.BASE_URL + '/sozo/folder/portfolio';
  private FOLDERRENAME = this.BASE_URL + '/sozo/folder/rename';
  private ADDTOFAVORITE = this.BASE_URL + '/sozo/addToFavorite';
  private GETFAVORITEITEM = this.BASE_URL + '/sozo/getFavorite';
  private REMOVEFAVORITEITEM = this.BASE_URL + '/sozo/removeToFavorite';
  private REMOVEFAVORITEPORTFOLIO = this.BASE_URL + '/sozo/removeToFavorite';
  private ADDTOFAVORITEPORTFOLIOS = this.BASE_URL + '/sozo/addToFavorite';
  private UPLOADPROFILEIMAGE = this.BASE_URL + '/user';
  private GETUSERDETAIL = this.BASE_URL + '/user/getuser';
  private ADDPEOPLEEMAIL = this.BASE_URL + '/sozo/invitations';
  private GETSHAREDDATA = this.BASE_URL + '/sozo/sharedUser';
  private GETPLANS = this.BASE_URL + '/plans';
  private STRIPECHECKOUT = this.BASE_URL + '/plans/stripeUrl/';
  private PAYMENTSUCESS = this.BASE_URL + '/plans/success/';
  private PAYMENTFAILURE = this.BASE_URL + '/plans/cancel/';
  private COMMENTEDDATA = this.BASE_URL + '/notification';
  private CANCELPLAN = this.BASE_URL + '/plans/cancelPlan';
  private TEAMS = this.BASE_URL + '/teams';
  private BILLINGCYCLE = this.BASE_URL + '/plans/billingCycle';

  getHeader(): any {
    return {
      headers: new HttpHeaders()
        .set('Authorization', 'Bearer ' + localStorage.getItem('userToken'))
        .set('Content-Type', 'application/json'),
    };
  }
  getFormDataHeader(): any {
    return {
      headers: new HttpHeaders().set(
        'Authorization',
        'Bearer ' + localStorage.getItem('userToken')
      ),
    };
  }

  // common function for api integration
  // function for CRUD
  request(requestType: string, requestURL: string, requestBody: any): Observable<any> {

    // for get request..
    if (requestType === 'get') {
      return this.http.get<any>(this.BASE_URL + requestURL, this.getHeader());
    }

    // for post request(adding)..
    if (requestType === 'post') {
      return this.http.post<any>(this.BASE_URL + requestURL, requestBody, this.getHeader());
    }

    // for put request(updating with all required values)..        
    if (requestType === 'put') {
      return this.http.put<any>(this.BASE_URL + requestURL, requestBody, this.getHeader());
    }

    // for patch request(updating with specific values)..
    if (requestType === 'patch') {
      return this.http.patch<any>(this.BASE_URL + requestURL, requestBody, this.getHeader());
    }

    // for delete request..
    if (requestType === 'delete') {
      return this.http.delete<any>(this.BASE_URL + requestURL, this.getHeader());
    }

  }

  checkingVideoCallStatus() {
    return this.http
      .get(this.MEETING + '/' + this.SSS.roomId, this.getHeader())
      .toPromise();
  }

  userLogin(credentials: any) {
    return this.http.post(this.LOGIN, credentials);
  }

  userSignup(credentials: any) {
    return this.http.post(this.SIGNUP, credentials);
  }
  userForgotPassword(credentials: any) {
    return this.http.post(this.FORGOTPASSWORD, credentials);
  }

  userResetPassword(credentials: any) {
    return this.http.post(this.RESETPASSWORD, credentials);
  }
  userChangePassword(credentials: any) {
    return this.http.post(this.CHANGEPASSWORD, credentials, this.getHeader());
  }
  getFolderDocs(id) {
    return this.http
      .get(this.GETFOLDERDOCS + '/' + id, this.getHeader())
      .toPromise();
  }

  userInitialData() {
    return this.http.get(this.UPDATECANVAS, this.getHeader()).toPromise();
  }


  // //////////////////////////
  // team members
  // //////////////////////////
  // add team members
  addTeamsMember(rqData: any) {
    return this.http.post(this.TEAMS, rqData, this.getHeader());
  }
  // add team members
  updateTeamsMember(id:any,rqData: any) {
    return this.http.patch(this.TEAMS+'/'+id, rqData, this.getHeader());
  }
  //GET TEAM MEMBERS
  getTeamsMember() {
    return this.http.get(this.TEAMS, this.getHeader());
  }


  inviteLinkHandler(id) {
    return this.http.get(this.INVITELINK + id, this.getHeader()).toPromise();
  }
  deleteUserDocument(id) {
    return this.http
      .delete(this.UPDATECANVAS + id, this.getHeader())
      .toPromise();
  }
  deleteFolderDocument(id) {
    return this.http
      .delete(this.CREATEANDUPDATEFOLDER + '/' + id, this.getHeader())
      .toPromise();
  }

  userDocumentData() {

    let id = localStorage.getItem('duplicateID')
      ? localStorage.getItem('duplicateID')
      : this.SDS.get('userID');
    localStorage.setItem('duplicateID', '');
   // console.log(id)
    return this.http.get(this.UPDATECANVAS + id, this.getHeader()).toPromise();
  }
  boardModalDocument(id) {
    return this.http.get(this.UPDATECANVAS + id, this.getHeader()).toPromise();
  }
  newCanvas(credentials: any) {
    return this.http
      .post(this.NEWCANVAS, credentials, this.getHeader())
      .toPromise();
  }

  savingUserCanvasData(credentials: any) {
    return this.http
      .patch(
        this.UPDATECANVAS + this.SDS.get('userID'),
        credentials,
        this.getHeader()
      )
      .toPromise();
  }

  renameDocumentName(credentials: any) {
    return this.http
      .patch(
        this.UPDATECANVAS + this.service.renameDocumentHandler,
        credentials,
        this.getHeader()
      )
      .toPromise();
  }
  renameFolderName(credentials: any) {
    return this.http
      .patch(
        this.FOLDERRENAME + '/' + this.service.renamePortfolioHandler,
        credentials,
        this.getHeader()
      )
      .toPromise();
  }

  duplicateCanvas(credentials: any) {
    return this.http
      .post(
        this.DUPLICATECANVAS + this.SDS.get('userID'),
        credentials,
        this.getHeader()
      )
      .toPromise();
  }
  getPortfolio() {
    return this.http.get(this.GETPORTFOLIOS, this.getHeader()).toPromise();
  }

  createFolder(credentials: any) {
    return this.http
      .post(this.CREATEANDUPDATEFOLDER, credentials, this.getHeader())
      .toPromise();
  }
  updateFolder(credentials: any, id) {
    return this.http
      .patch(
        this.CREATEANDUPDATEFOLDER + '/' + id,
        credentials,
        this.getHeader()
      )
      .toPromise();
  }
  addtofavorite(credentials: any) {
    return this.http
      .post(this.ADDTOFAVORITE, credentials, this.getHeader())
      .toPromise();
  }
  removeFromFavorite(credentials: any) {
    return this.http
      .post(this.REMOVEFAVORITEITEM, credentials, this.getHeader())
      .toPromise();
  }
  getFavorite() {
    return this.http.get(this.GETFAVORITEITEM, this.getHeader()).toPromise();
  }
  uploadImage(credentials: any, id) {
    return this.http
      .patch(
        this.UPLOADPROFILEIMAGE + '/' + id,
        credentials,
        this.getFormDataHeader()
      )
      .toPromise();
  }
  addtofavoritePortfolio(credentials: any) {
    return this.http
      .post(this.ADDTOFAVORITEPORTFOLIOS, credentials, this.getHeader())
      .toPromise();
  }
  removeFromFavoritePortfolio(credentials: any) {
    return this.http
      .post(this.REMOVEFAVORITEPORTFOLIO, credentials, this.getHeader())
      .toPromise();
  }
  getUserData(id) {
    return this.http
      .get(this.GETUSERDETAIL + '/' + id, this.getHeader())
      .toPromise();
  }
  addPeopleEmail(credentials: any) {
    return this.http
      .post(this.ADDPEOPLEEMAIL, credentials, this.getHeader())
      .toPromise();
  }
  getSharedData(id) {
    return this.http
      .get(this.GETSHAREDDATA + '/' + id, this.getHeader())
      .toPromise();
  }

  getPlans() {
    return this.http.get(this.GETPLANS, this.getHeader()).toPromise();
  }

  stripePlansCheckout(id) {
    return this.http
      .get(this.STRIPECHECKOUT + id, this.getHeader())
      .toPromise();
  }

  sendCommentedData(credentials: any) {
    return this.http
      .post(this.COMMENTEDDATA, credentials, this.getHeader())
      .toPromise();
  }

  stripePaymentSuccess(id) {
    return this.http.get(this.PAYMENTSUCESS + id, this.getHeader()).toPromise();
  }

  stripePaymentFailure(id) {
    return this.http
      .get(this.PAYMENTFAILURE + id, this.getHeader())
      .toPromise();
  }

  getNotification() {
    return this.http.get(this.COMMENTEDDATA, this.getHeader()).toPromise();
  }
  getCancelPlan() {
    return this.http.get(this.CANCELPLAN, this.getHeader()).toPromise();
  }
  // BILLING CYCLE PLANS GET API
  getBillingCycle(){
    return this.http.get(this.BILLINGCYCLE, this.getHeader()).toPromise();
  }
}
