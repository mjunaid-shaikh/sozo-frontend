import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CONSTANTS } from './constants/global-constants';
@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  canvasData: any
  isAuth: boolean = false;
  fromSavedDocs = false;
  clientBaseUrl = CONSTANTS.CLIENT_BASE_URL;
  private _portfolioFolder: any = [];
  private _shouldOpenRecentDocs = false;
  templateStarredFlag = false;
  private _canvasSavedData: any;
  private _totalRecentDocs: any;
  private _totalFolderDocs: any;
  private _deleteDocsId: any;
  private _viewDocsId: any;
  private _editDocsId: any;
  private _editShareDocsId: any;
  private _renameDocumentId: any;
  private _renamePortfolioHandler: any;
  private _totalFavoriePortFolio: any;
  private _totalFavorieDocs: any;
  testData: any = false;
  private _deleteFolderDocsId: any;
  private _editFolderId: any;
  private _editShareFolderId: any;
  private _viewFolderId: any;
  private _sendDocsOrPortfolio: any;
  private _docsShareName: any;
  private data = new BehaviorSubject('default data');
  data$ = this.data.asObservable();
  

  constructor() { }

  func(data) {
    this.canvasData = data;
  }
  allowToDashboard() {
    return this.isAuth = true;
  }
  set shouldOpenRecentDocs(data) {
    this._shouldOpenRecentDocs = data
  }
  get shouldOpenRecentDocs() {
    return this._shouldOpenRecentDocs
  }

  set deleteDocsId(data) {
    this._deleteDocsId = data
  }
  get deleteDocsId() {
    return this._deleteDocsId
  }
  set deletefolderDocsId(data) {
    this._deleteFolderDocsId = data
  }
  get deletefolderDocsId() {
    return this._deleteFolderDocsId
  }
  set renameDocumentHandler(data) {
    this._renameDocumentId = data
  }
  get renameDocumentHandler() {
    return this._renameDocumentId
  }

  set viewDocsId(data) {
    this._viewDocsId = data
  }
  get viewDocsId() {
    return this._viewDocsId
  }

  set editShareDocsId(data) {
    this._editShareDocsId = data
  }
  get editShareDocsId() {
    return this._editShareDocsId
  }

  set editDocsId(data) {
    this._editDocsId = data
  }
  get editDocsId() {
    return this._editDocsId
  }
  set viewFolderId(data) {
    this._viewFolderId = data
  }
  get viewFolderId() {
    return this._viewFolderId
  }

  set editShareFolderId(data) {
    this._editShareFolderId = data
  }
  get editShareFolderId() {
    return this._editShareFolderId
  }

  set editFolderId(data) {
    this._editFolderId = data
  }
  get editFolderId() {
    return this._editFolderId
  }

  set canvasSavedData(data) {
    this._canvasSavedData = data
  }
  get totalRecentDocs() {
    return this._totalRecentDocs
  }
  set totalRecentDocs(data) {

    this._totalRecentDocs = data
  }
  get canvasSavedData() {
    return this._canvasSavedData
  }
  set portfolioFolder(data) {
    this._portfolioFolder = data
  }
  get portfolioFolder() {
    return this._portfolioFolder
  }
  set totalFolderDocs(data) {
    this._totalFolderDocs = data
  }
  get totalFolderDocs() {
    return this._totalFolderDocs;
  }
  set renamePortfolioHandler(data) {
    this._renamePortfolioHandler = data;
  }
  get renamePortfolioHandler() {
    return this._renamePortfolioHandler;
  }
  get totalFavorieDocs() {
    return this._totalFavorieDocs
  }
  set totalFavorieDocs(data) {
    this._totalFavorieDocs = data
  }
  get totalFavoriePortFolio() {
    return this._totalFavoriePortFolio
  }
  set totalFavoriePortFolio(data) {
    this._totalFavoriePortFolio = data
  }
  get sendDocsOrPortfolio() {
    return this._sendDocsOrPortfolio
  }
  set sendDocsOrPortfolio(data) {
    this._sendDocsOrPortfolio = data
  }

  get docsProjectName(){
    return this._docsShareName
  }
  set docsProjectName(data){
    this._docsShareName = data
  }
  changeData(data: string) {
    this.data.next(data)
  }
}
