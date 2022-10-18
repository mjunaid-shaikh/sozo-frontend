import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SozoApiService } from 'src/app/sozo-api.service';
import 'fabric';
import jsPDF from 'jspdf';
import pptxgen from 'pptxgenjs';
import { CanvasService } from '../canvas.service';
import { SozoDataService } from '../sozo-data.service';
import { parseGIF, decompressFrames } from 'gifuct-js';
import { SozoSocketService } from '../sozo-socket.service';
import { Observable, Observer, fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { drawingObjectRetriever } from '../utilities/objects/free-drawing';

import { uploadImageHandler } from '../utilities/objects/image-upload';
import { reCreateGif, uploadGifHandler } from '../utilities/objects/gif-upload';
import {
  backup,
  retrieveObjectHandler,
} from '../utilities/helper-function/recreate-objects';
import { sozoKeyboardEventsHandler } from '../utilities/helper-function/keyboard-event';
import {
  convertCanvasDataToJson,
  designToolbarHideHandler,
  getCurrentMiddlePosOfCanvas,
  getObjectById,
  initAligningGuidelines,
  initCenteringGuidelines,
  isObjectInGivenRegion,
  isObjectIsPartOfMainShape,
  isObjectIsShape,
  objectOnCanvasExistOrNot,
  redo,
  removeObjectComment,
  setCanvasWidthHeight,
  setContainerNonSelectable,
  setStrokeAndStrokeWidthFromToolbar,
  toolbarPosHandler,
  undo,
  updateFreeDrawingToolbarState,
  updateImageToolbarState,
  updateShapeToolbarState,
  userIdealConditionRedirectHandler,
  addCommentHandler,
} from '../utilities/helper-function/general-helper';
import { initializeSozo } from '../utilities/helper-function/initialize-sozo';
import { emitObjectRemoved } from '../utilities/socket-events/socket-emit';
import { objectBackgroundTransparent } from '../utilities/helper-function/shape-toolbar';
// import { FamilyRestroomOutlined } from '@mui/icons-material';
import { ResizeEvent } from 'angular-resizable-element';

declare const fabric: any;
declare const $: any;
fabric.Object.prototype.transparentCorners = true;
fabric.Object.prototype.cornerColor = '#87CEFA';
fabric.Object.prototype.cornerStyle = 'circle';
fabric.Object.prototype.borderColor = '#137EF9';
fabric.Object.prototype.cornerStrokeColor = '#137EF9';
fabric.Object.prototype.strokeUniform = true;
fabric.Object.prototype.noScaleCache = false;
fabric.Object.prototype.objectCaching = false;

fabric.Object.prototype.setControlsVisibility({
  bl: true,
  br: true,
  tl: true,
  tr: true,
  mb: false,
  ml: false,
  mr: false,
  mt: false,
  mtr: true,
});

const [PLAY, PAUSE, STOP] = [0, 1, 2];
/**
 * gifToSprite "async"
 * @param {string|input File} gif can be a URL, dataURL or an "input File"
 * @param {number} maxWidth Optional, scale to maximum width
 * @param {number} maxHeight Optional, scale to maximum height
 * @param {number} maxDuration Optional, in milliseconds reduce the gif frames to a maximum duration, ex: 2000 for 2 seconds
 * @returns {*} {error} object if any or a sprite sheet of the converted gif as dataURL
 */
@Component({
  selector: 'app-drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.css'],
})
export class DrawingComponent {
  @ViewChild('videoWrapper') videoWrapper: ElementRef;
  objectDisMeasureOff: number = 5;
  pixelToInchFactor: number = 0.0264583333;
  shouldAddBoardInOverlappingOrder: boolean = false;
  allMyDocs: any;
  currentModalBoardSelectedDocs: any = null;
  modalTemplateData: boolean = false;
  isComponentLostInternet: boolean = false;
  shapeConnectionRange: number = 10;
  sharedUserDetails: any = [];
  whichArrowTypeShouldDraw = 'straight';
  arrowHeadLengthFactor: number = 3;
  prevLeftArrowHead: any;
  prevRightArrowHead: any;
  curveArrowLine: any;
  strokeWidthOfCurveLine: any = 3;
  strokeColorOfCurveLineWithArrowHeads: any = 'rgba(255,0,0,1)';
  sizeOfArrowHead: any = 10;
  strokeColorOfArrowHead: any = 'rgba(255,0,0,1)';
  strokeWidthOfArrowHead: any = 0;
  fillColorOfArrowHead: any = 'rgba(255,0,0,1)';
  curveLineWithArrowhead1Visible: any = true;
  curveLineWithArrowhead2Visible: any = true;
  startXPos: any;
  startYPos: any;
  controlPoints: any = [];
  controlPointsLength: any = 1;
  controlPointArrow1: any;
  controlPointArrow2: any;
  sizeOfControlPoint: any = 8;
  fillColorOfControlPoint: any = 'rgba(0,0,255,0.5)';
  controlPointMoved: boolean = false;
  tX: any;
  tY: any;
  controlPointLeft: any;
  controlPointTop: any;
  zTypeArrowLine: any;
  perpendicularArrowhead1Visible: any = true;
  perpendicularArrowhead2Visible: any = true;
  strokeWidthOfArrow: any = 2;
  strokeColorOfPerpendicularLine: any = 'rgba(255,0,0,1)';
  controlPointsAdded: any = false;
  controlPoint1: any;
  controlPoint2: any;
  controlPoint3: any;
  strokeColorOfControlPoint: any = '';
  strokeWidthOfControlPoint: any = 0;
  connectionIndicationDeboucingTimer: any;
  objectCreateOnDblClickDeboucingTimer: any;
  userIdealConditionRedirectDeboucingTimer: any;
  copyTotalObjectComments: any;
  textDeboucingTimer: any;
  zoomInDeboucingTimer: any;
  zoomOutDeboucingTimer: any;
  undoDeboucingTimer: any;
  redoDeboucingTimer: any;
  responseCanvasObjects: any;
  globalMatchedData = [];
  friendsCursorPointer: any = [];
  freeDrawingCurrentStroke: any = 2;
  currentSelectedAllObjectsToolbar: any;
  filteredText: any = [];
  shouldSavedWithImage: boolean = true;
  miniImage: any;
  allSelectedObjectsActive: any;
  beforeVanishData: any;
  shouldDrawArrow: boolean = false;
  isArrowDrawing: boolean = false;
  arrowLine: any;
  arrowHeadEnd: any;
  arrowHeadStart: any;
  arrowHeadStartHollow: any;
  arrowHeadEndHollow: any;
  arrowHeadStartLine: any;
  arrowHeadEndLine: any;
  shouldUnloadTrigger: boolean = true;
  allowSelection: any = 'allow';
  shouldEmitObjectAddEvent: boolean = true;
  containerGroupBackup: any;
  shouldSaveCanvasObjects: any = true;
  canvasAllObjects: any;
  groupObjectText: any;
  testOneTimeAccess: boolean = true;
  alreadyVideoExistStatus: boolean = false;
  myPeerId: any;
  globalRectline: any;
  incomingVideoCallUserData: any;
  myPeer: any;
  liveCallStatus: any = 'End';
  totalStreams: any = [];
  totalUsersOnMeeting: any = [];
  myStreamVideo: any;
  oneTimeAccess: boolean = true;
  totalPeers: any = {};
  userAccess: any;
  isOwner: boolean = false;
  arrowLineType: any = 'straight';
  documentTitle = 'New Project';
  allObjectSelected: any = 1;
  canvas: any;
  savedDocument: any;
  linkAddTextbox;
  currentCanvasZoomStatus: any = 0;
  deletingFreeDrawingObj = false;
  zoomPercentage: any = 75;
  currentRatio: any;
  pdraw;
  checkCanvas: boolean = true;
  freeDrawingColor = '';
  gridGroup;
  gridGroup1;
  gridGroup2;
  copyActiveObject;
  copy;
  checkBox = false;
  isGrabbing = false;
  eraserActive = false;
  objectUniqueID: any;
  objectDataToBeFormed: any = 'sticky-group';
  objectDataToBeFormedSingle: any = '';
  stickyInitialColor: any = '#EAE15F';
  groupRecentData: any;
  textRecentData: any;
  newColor: any;
  onfocusInput: boolean = false;
  minimap: any;
  pasteCounter: any = 20;
  cutObjectData: any;
  shouldSendData: boolean = true;
  pasteLockStatus: boolean = false;
  currentCommentObjectId: any = null;
  permissionLinkGen: any;
  filteredDocs: any;
  projectID: any;
  colorSpect: any;
  permissionInviteLink: any;
  whiteboardCommentsAllData = [];
  commentsToBeShown = [];
  shouldAddComment = true;
  noCommentShow = false;
  shouldDeleteObject: boolean = true;
  userList: boolean = false;
  undoRedoConfig = {
    canvasState: [],
    currentIndex: -1,
  };
  undoRedoData = {
    canvasState: [],
    currentIndex: -1,
  };
  drawingColorList = [
    '#FFF1AA',
    '#EAE15F',
    '#B8DECD',
    '#B8DECD',
    '#F8AD96',
    '#D5D2E2',
    '#58C2BF',
    '#AACDE9',
    '#FA7811',
    '#C094C1',
    '#1468CE',
    '#31BDDF',
    '#E81313',
    '#EF5F9E',
    '#680094',
    '#008A0E',
    'black',
    'white',
    // '#f8f8f826'
    'rgba(255,255,255, .1)',
  ];

  fontFamilies = [
    'Courier',
    'Trebuchet MS',
    'Arial',
    'Florence, cursive',
    'Monaco',
    'Georgia',
    'Calibri',
    'Arial Black',
    'Impact',
    'Monospace',
  ];

  fontSizes = [
    '8',
    '10',
    '12',
    '14',
    '16',
    '18',
    '20',
    '22',
    '24',
    '26',
    '28',
    '30',
    '32',
    '34',
    '36',
    '38',
    '40',
    '42',
    '44',
    '46',
    '48',
    '50',
    '52',
    '54',
    '56',
  ];

  //TOOLBAR HIDING ON CLICK
  ToolbarMinimiseFlag: Boolean = true;

  //VIDEO CONFERENCE MODEL INCREASE & DECREASE
  icreaseVideoModelFlag: boolean = true;

  arrowStrokeWidth = ['1', '2', '3', '4', '5', '6', '7', '8'];
  showCommentStatus = false;
  showAddedPeople = false;
  showNotes = false;
  showMessage = false;
  showSearchBox = false;
  showRevisionHistory = false;
  showFullScreen = true;
  showCloseScreen = false;
  arrowToolbarPreviousData: any = {
    prevActiveObjectTopPos: '',
    preActiveObjectLeftPos: '',
    prevActiveObjectWidth: '',
    prevActiveObjectScaleX: '',
    prevActiveObjectScaleY: '',
  };
  freeDrawingToolbarElements: any = {
    objectToolbar: '',
    objectColorPicker: '',
    objectStroke_1: '',
    objectStroke_2: '',
    objectStroke_3: '',
    objectStroke_4: '',
    objectLockIcon: '',
  };
  // make full screen-video & close full-screen video
  showFullScreenVideo = true;
  showCloseScreenVideo = false;

  userPointers: any = [];
  imageSrc =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMjY0IiBoZWlnaHQ9IjI2NCIgdmlld0JveD0iMCAwIDI2NCAyNjQiPgogIDxkZWZzPgogICAgPGNsaXBQYXRoIGlkPSJjbGlwLXBhdGgiPgogICAgICA8cmVjdCB3aWR0aD0iMjA1IiBoZWlnaHQ9IjIwNCIgZmlsbD0ibm9uZSIvPgogICAgPC9jbGlwUGF0aD4KICA8L2RlZnM+CiAgPGcgaWQ9Ikdyb3VwXzE4ODkwIiBkYXRhLW5hbWU9Ikdyb3VwIDE4ODkwIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMzc5MSAtMTQ2ODIpIj4KICAgIDxyZWN0IGlkPSJSZWN0YW5nbGVfNzE4OCIgZGF0YS1uYW1lPSJSZWN0YW5nbGUgNzE4OCIgd2lkdGg9IjI2NCIgaGVpZ2h0PSIyNjQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMzc5MSAxNDY4MikiIGZpbGw9IiNmYWZkZmYiLz4KICAgIDxnIGlkPSJSZXBlYXRfR3JpZF80NyIgZGF0YS1uYW1lPSJSZXBlYXQgR3JpZCA0NyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEzNzYxIDE0NzEyKSIgY2xpcC1wYXRoPSJ1cmwoI2NsaXAtcGF0aCkiPgogICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMzczOSAtMTQ3MTIpIj4KICAgICAgICA8Y2lyY2xlIGlkPSJFbGxpcHNlXzE0NTgiIGRhdGEtbmFtZT0iRWxsaXBzZSAxNDU4IiBjeD0iMyIgY3k9IjMiIHI9IjMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMzczOSAxNDcxMikiIGZpbGw9IiNjZmVlZmYiLz4KICAgICAgPC9nPgogICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMzgwNSAtMTQ3MTIpIj4KICAgICAgICA8Y2lyY2xlIGlkPSJFbGxpcHNlXzE0NTgtMiIgZGF0YS1uYW1lPSJFbGxpcHNlIDE0NTgiIGN4PSIzIiBjeT0iMyIgcj0iMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEzNzM5IDE0NzEyKSIgZmlsbD0iI2NmZWVmZiIvPgogICAgICA8L2c+CiAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEzODcxIC0xNDcxMikiPgogICAgICAgIDxjaXJjbGUgaWQ9IkVsbGlwc2VfMTQ1OC0zIiBkYXRhLW5hbWU9IkVsbGlwc2UgMTQ1OCIgY3g9IjMiIGN5PSIzIiByPSIzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTM3MzkgMTQ3MTIpIiBmaWxsPSIjY2ZlZWZmIi8+CiAgICAgIDwvZz4KICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTM5MzcgLTE0NzEyKSI+CiAgICAgICAgPGNpcmNsZSBpZD0iRWxsaXBzZV8xNDU4LTQiIGRhdGEtbmFtZT0iRWxsaXBzZSAxNDU4IiBjeD0iMyIgY3k9IjMiIHI9IjMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMzczOSAxNDcxMikiIGZpbGw9IiNjZmVlZmYiLz4KICAgICAgPC9nPgogICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMzczOSAtMTQ2NDYpIj4KICAgICAgICA8Y2lyY2xlIGlkPSJFbGxpcHNlXzE0NTgtNSIgZGF0YS1uYW1lPSJFbGxpcHNlIDE0NTgiIGN4PSIzIiBjeT0iMyIgcj0iMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEzNzM5IDE0NzEyKSIgZmlsbD0iI2NmZWVmZiIvPgogICAgICA8L2c+CiAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEzODA1IC0xNDY0NikiPgogICAgICAgIDxjaXJjbGUgaWQ9IkVsbGlwc2VfMTQ1OC02IiBkYXRhLW5hbWU9IkVsbGlwc2UgMTQ1OCIgY3g9IjMiIGN5PSIzIiByPSIzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTM3MzkgMTQ3MTIpIiBmaWxsPSIjY2ZlZWZmIi8+CiAgICAgIDwvZz4KICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTM4NzEgLTE0NjQ2KSI+CiAgICAgICAgPGNpcmNsZSBpZD0iRWxsaXBzZV8xNDU4LTciIGRhdGEtbmFtZT0iRWxsaXBzZSAxNDU4IiBjeD0iMyIgY3k9IjMiIHI9IjMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMzczOSAxNDcxMikiIGZpbGw9IiNjZmVlZmYiLz4KICAgICAgPC9nPgogICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMzkzNyAtMTQ2NDYpIj4KICAgICAgICA8Y2lyY2xlIGlkPSJFbGxpcHNlXzE0NTgtOCIgZGF0YS1uYW1lPSJFbGxpcHNlIDE0NTgiIGN4PSIzIiBjeT0iMyIgcj0iMyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEzNzM5IDE0NzEyKSIgZmlsbD0iI2NmZWVmZiIvPgogICAgICA8L2c+CiAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEzNzM5IC0xNDU4MCkiPgogICAgICAgIDxjaXJjbGUgaWQ9IkVsbGlwc2VfMTQ1OC05IiBkYXRhLW5hbWU9IkVsbGlwc2UgMTQ1OCIgY3g9IjMiIGN5PSIzIiByPSIzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTM3MzkgMTQ3MTIpIiBmaWxsPSIjY2ZlZWZmIi8+CiAgICAgIDwvZz4KICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTM4MDUgLTE0NTgwKSI+CiAgICAgICAgPGNpcmNsZSBpZD0iRWxsaXBzZV8xNDU4LTEwIiBkYXRhLW5hbWU9IkVsbGlwc2UgMTQ1OCIgY3g9IjMiIGN5PSIzIiByPSIzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTM3MzkgMTQ3MTIpIiBmaWxsPSIjY2ZlZWZmIi8+CiAgICAgIDwvZz4KICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTM4NzEgLTE0NTgwKSI+CiAgICAgICAgPGNpcmNsZSBpZD0iRWxsaXBzZV8xNDU4LTExIiBkYXRhLW5hbWU9IkVsbGlwc2UgMTQ1OCIgY3g9IjMiIGN5PSIzIiByPSIzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTM3MzkgMTQ3MTIpIiBmaWxsPSIjY2ZlZWZmIi8+CiAgICAgIDwvZz4KICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTM5MzcgLTE0NTgwKSI+CiAgICAgICAgPGNpcmNsZSBpZD0iRWxsaXBzZV8xNDU4LTEyIiBkYXRhLW5hbWU9IkVsbGlwc2UgMTQ1OCIgY3g9IjMiIGN5PSIzIiByPSIzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTM3MzkgMTQ3MTIpIiBmaWxsPSIjY2ZlZWZmIi8+CiAgICAgIDwvZz4KICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTM3MzkgLTE0NTE0KSI+CiAgICAgICAgPGNpcmNsZSBpZD0iRWxsaXBzZV8xNDU4LTEzIiBkYXRhLW5hbWU9IkVsbGlwc2UgMTQ1OCIgY3g9IjMiIGN5PSIzIiByPSIzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTM3MzkgMTQ3MTIpIiBmaWxsPSIjY2ZlZWZmIi8+CiAgICAgIDwvZz4KICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTM4MDUgLTE0NTE0KSI+CiAgICAgICAgPGNpcmNsZSBpZD0iRWxsaXBzZV8xNDU4LTE0IiBkYXRhLW5hbWU9IkVsbGlwc2UgMTQ1OCIgY3g9IjMiIGN5PSIzIiByPSIzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTM3MzkgMTQ3MTIpIiBmaWxsPSIjY2ZlZWZmIi8+CiAgICAgIDwvZz4KICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTM4NzEgLTE0NTE0KSI+CiAgICAgICAgPGNpcmNsZSBpZD0iRWxsaXBzZV8xNDU4LTE1IiBkYXRhLW5hbWU9IkVsbGlwc2UgMTQ1OCIgY3g9IjMiIGN5PSIzIiByPSIzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTM3MzkgMTQ3MTIpIiBmaWxsPSIjY2ZlZWZmIi8+CiAgICAgIDwvZz4KICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTM5MzcgLTE0NTE0KSI+CiAgICAgICAgPGNpcmNsZSBpZD0iRWxsaXBzZV8xNDU4LTE2IiBkYXRhLW5hbWU9IkVsbGlwc2UgMTQ1OCIgY3g9IjMiIGN5PSIzIiByPSIzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTM3MzkgMTQ3MTIpIiBmaWxsPSIjY2ZlZWZmIi8+CiAgICAgIDwvZz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo=';

  confOptions = {
    openBridgeChannel: true,
  };

  initOptions = {
    disableAudioLevels: true,
    desktopSharingChromeExtId: 'mbocklcggfhnbahlnepmldehdhpjfcjp',
    desktopSharingChromeDisabled: false,
    desktopSharingChromeSources: ['screen', 'window'],
    desktopSharingChromeMinExtVersion: '0.1',
    desktopSharingFirefoxDisabled: true,
  };

  option = {
    connection: {
      hosts: {
        domain: 'peer.wesozo.com',
        muc: `conference.peer.wesozo.com`,
        focus: 'focus.peer.wesozo.com',
      },
      serviceUrl: `https://peer.wesozo.com/http-bind?room=${this.activatedRoute.snapshot.params.id}`,
      clientNode: 'http://jitsi.org/jitsimeet',
    },
    conference: {
      enableLayerSuspension: true,
      p2p: {
        enabled: false,
      },
    },
  };

  jitsi: any;
  connection: any;
  isJoined = false;
  room: any;
  remoteTracks = {};
  participantIds = [];
  userTracks: any = [];
  userDisplayNames: any = [];
  // dynamic id store arrya gird view
  videoDynamicID = [];
  audioDynamicID = [];
  gridType: string = 'temp1';

  // screen share
  screenTracks = [];
  isScreenShare: boolean = false;
  isShareScreenOn: boolean = false;

  // templates variables
  templatesList: any = [];

  toggleMuteIcon: boolean = false;
  isMuteIconEnabled: boolean = true;

  isAdminUserStatus: boolean = false;

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    sozoKeyboardEventsHandler(event, this.scopeOfThis());
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setCanvasWidthHeight(this.scopeOfThis());
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event) {
    // on beforeunload
  }

  constructor(
    private service: CanvasService,
    private router: Router,
    private SAS: SozoApiService,
    private SDS: SozoDataService,
    private activatedRoute: ActivatedRoute,
    private SSS: SozoSocketService,
    private renderer: Renderer2
  ) {
    this.jitsi = (window as any).JitsiMeetJS;
  }

  config = {
    canvasState: [],
    currentStateIndex: -1,
    undoStatus: false,
    redoStatus: false,
    undoFinishedStatus: 1,
    redoFinishedStatus: 1,
  };

  public style: object = {};
  onResizeEnd(event: ResizeEvent): void {
    console.log('Element was resized', event);
    this.style = {
      position: 'fixed',
      left: `${event.rectangle.left}px`,
      top: `${event.rectangle.top}px`,
      width: `${event.rectangle.width}px`,
      height: `${event.rectangle.height}px`,
    };
  }

  validate(event: ResizeEvent): boolean {
    const MIN_DIMENSIONS_PX: number = 50;
    if (
      event.rectangle.width &&
      event.rectangle.height &&
      (event.rectangle.width < MIN_DIMENSIONS_PX ||
        event.rectangle.height < MIN_DIMENSIONS_PX)
    ) {
      return false;
    }
    return true;
  }

  duplicateCanvas() {
    let duplicateHandler = async () => {
      try {
        const response: any = await this.SAS.duplicateCanvas({ document: [] });
        // this.SDS.set('userID', response.document._id);
        // this.SDS.set('duplicateID', response.document.sozo);
        localStorage.setItem('duplicateID', response.document.sozo);
        const url = this.router.serializeUrl(
          this.router.createUrlTree(['/drawing', response.id])
        );
        let windowInstance: any = window.open(url, '_blank');
        windowInstance.instanceData = {
          authToken: this.SDS.get('authToken'),
          userId: this.SDS.get('userID'),
          new: true,
          duplicate: true,
          duplicateID: response.document.sozo,
        };
      } catch (error) {
        // this.router.navigate(['/login']);
        this.SDS.apiErrorHandle(error?.status.toString(), error);
      }
    };
    duplicateHandler();
  }

  async sendCommentedObjectData(data) {
    try {
      let response: any = await this.SAS.sendCommentedData(data);
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    }
  }

  focusIn() {
    this.onfocusInput = true;
  }
  focusOut() {
    this.onfocusInput = false;
  }

  setObjectToCenterWidthDefaultZoom(object) {
    let zoom = 0.75;
    let centerPoint = object.getCenterPoint();
    let originXY = fabric.util.transformPoint(
      new fabric.Point(centerPoint.x, centerPoint.y),
      this.canvas.viewportTransform
    );
    this.canvas.zoomToPoint(new fabric.Point(originXY.x, originXY.y), zoom);
    this.zoomPercentage = Math.floor(zoom * 100);
    let scrollLeft = $('.canvas-content')[0].scrollLeft;
    let scrollTop = $('.canvas-content')[0].scrollTop;
    let xDiff = originXY.x - scrollLeft;
    let yDiff = originXY.y - scrollTop;
    let offsetX = window.innerWidth / 2;
    let offsetY = window.innerHeight / 2;
    $('.canvas-content')[0].scrollLeft = scrollLeft + xDiff - offsetX;
    $('.canvas-content')[0].scrollTop = scrollTop + yDiff - offsetY;
  }

  previousSearchedText() {
    let switchTextElement = $('.canvas-search-items');
    let previousText = parseInt(switchTextElement.find('.current-text').html());
    if (previousText > 1) {
      this.setObjectToCenterWidthDefaultZoom(
        this.filteredText[previousText - 2]
      );
      switchTextElement.find('.current-text').html(previousText - 1);
    }
  }

  nextSearchedText() {
    let switchTextElement = $('.canvas-search-items');
    let nextText = parseInt(switchTextElement.find('.current-text').html());
    if (this.filteredText.length > nextText) {
      this.setObjectToCenterWidthDefaultZoom(this.filteredText[nextText]);
      switchTextElement.find('.current-text').html(nextText + 1);
    }
  }

  objectSearch() {
    this.filteredText = [];
    let switchTextElement = $('.canvas-search-items');
    switchTextElement.find('.current-text').html(1);
    let textValue = (<HTMLInputElement>document.getElementById('searchText'))
      .value;
    let textObjects = this.canvas
      .getObjects()
      .filter((ob) => ob?.type === 'textbox');
    textObjects.forEach((text) => {
      if (text.text.includes(textValue)) {
        if (textValue === '') return;
        this.filteredText.push(text);
      }
    });
    if (this.filteredText.length > 0) {
      switchTextElement.find('.total-text').html(this.filteredText.length);
      let firstMatchedText = this.filteredText[0];
      this.setObjectToCenterWidthDefaultZoom(firstMatchedText);
      if (switchTextElement.css('display') === 'none') {
        switchTextElement.css({ display: 'flex' });
      }
    } else {
      switchTextElement.css({ display: 'none' });
    }
  }

  openFullScreenConference() {
    $('.fullscreen-conference').css('display', 'block');
    $('.drawing-right-iconpallete').css({
      'box-shadow': 'none',
      background: '#515859',
    });
  }

  shapeObjectHoldHandler(objName, color = null) {
    this.objectDataToBeFormed = objName;
    this.objectDataToBeFormedSingle = objName;
    if (color) {
      this.stickyInitialColor = color;
    }
  }

  setFreeDrawingColor(item) {
    let activeObject = this.canvas.getActiveObject();
    activeObject.set('stroke', item);
    this.canvas.renderAll();
  }

  toggleDrawingMode() {
    if (this.canvas.isDrawingMode === true) {
      this.canvas.isDrawingMode = false;
    } else {
      this.canvas.isDrawingMode = true;
    }
  }

  checkboxUnchanges(val: boolean) {
    this.checkCanvas = val;
    if (val == false) {
      this.canvas.setBackgroundColor('#fff', () => {
        this.canvas.renderAll();
      });
    } else {
      this.canvas.setBackgroundColor(
        { source: this.imageSrc, repeat: 'repeat' },
        () => {
          this.canvas.renderAll();
        }
      );
    }
  }

  selectAllObjs() {
    this.canvas.discardActiveObject();
    this.isGrabbing = !this.isGrabbing;
    if (this.isGrabbing) {
      designToolbarHideHandler(this.scopeOfThis());
      this.canvas.getObjects().forEach((ob) => {
        ob.set({ selectable: false, evented: false });
      });
      $('.cursor-Active-icon').attr('src', 'assets/img/handCursor-icon.svg');
      this.canvas.on('mouse:down', (opt) => {
        var evt = opt.e;
        if (this.isGrabbing) {
          this.canvas.isDragging = true;
          this.canvas.selection = false;
          this.canvas.lastPosX = evt.clientX;
          this.canvas.lastPosY = evt.clientY;
        }
      });
    } else {
      $('.cursor-Active-icon').attr('src', 'assets/img/cursorActiveIcon.svg');
      this.canvas.set({ hoverCursor: 'all-scroll' });
      this.canvas.getObjects().forEach((ob) => {
        ob.set({ selectable: true, evented: true });
      });
    }
    this.canvas.renderAll();
  }

  print() {
    var data = this.canvas.toDataURL();

    var html = '<html><head><title></title></head>';
    html += '<body style="width: 100%; padding: 0; margin: 0;"';
    html += ' onload="window.focus(); window.print(); window.close()">';
    html += '<img src="' + data + '" width="1000"/></body></html>';

    var printWindow = window.open('', 'to_print');

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  canvasSearch() {
    this.showSearchBox = true;
  }

  closeSearch() {
    let switchTextElement = $('.canvas-search-items');
    this.showSearchBox = false;
    switchTextElement.css({ display: 'none' });
  }

  saveMsg() {
    if (this.shouldSaveCanvasObjects) {
      this.savedDocs();
      $('.saving-icon').css('display', 'none');
      $('.lds-dual-ring').css('display', 'block');
      setTimeout(() => {
        $('.saving-icon').css('display', 'block');
        $('.lds-dual-ring').css('display', 'none');
      }, 1000);
    }

    this.updateMiniMapVP();
  }

  //******** Free Drawing Function Stuffs Starts *************/

  brush1() {
    this.canvas.isDrawingMode = true;
    this.canvas.freeDrawingBrush.width = 2;
    this.freeDrawingCurrentStroke = 2;
    this.canvas.freeDrawingBrush.color =
      this.freeDrawingColor === '' ? '#000' : this.freeDrawingColor;
  }

  brush2() {
    this.canvas.isDrawingMode = true;
    this.canvas.freeDrawingBrush.width = 5;
    this.freeDrawingCurrentStroke = 5;
    this.canvas.freeDrawingBrush.color =
      this.freeDrawingColor === '' ? '#000' : this.freeDrawingColor;
  }
  brush3() {
    this.canvas.isDrawingMode = true;
    this.canvas.freeDrawingBrush.width = 8;
    this.freeDrawingCurrentStroke = 8;
    this.canvas.freeDrawingBrush.color =
      this.freeDrawingColor === '' ? '#000' : this.freeDrawingColor;
  }
  brush4() {
    this.canvas.isDrawingMode = true;
    this.canvas.freeDrawingBrush.color =
      this.freeDrawingColor === '' ? '#000' : this.freeDrawingColor;
    this.canvas.freeDrawingBrush.width = 16;
    this.freeDrawingCurrentStroke = 16;
  }

  setColor(item) {
    this.canvas.isDrawingMode = true;
    this.canvas.freeDrawingBrush.color = item;
    this.canvas.freeDrawingBrush.width = this.freeDrawingCurrentStroke;
    this.freeDrawingColor = item;
  }

  erase() {
    this.canvas.isDrawingMode = false;
    this.deletingFreeDrawingObj = true;

    this.canvas.set({ hoverCursor: 'url("assets/img/eraser.svg"), auto' });
  }

  //******** Free Drawing Function Stuffs Ends *************/

  findObjectByComment(commentId) {
    designToolbarHideHandler(this.scopeOfThis());
    let correspondingObject = getObjectById(commentId, this.scopeOfThis());
    if (!correspondingObject) return;
    let centerPoint = correspondingObject?.getCenterPoint();
    let originXY = fabric.util.transformPoint(
      new fabric.Point(centerPoint?.x, centerPoint.y),
      this.canvas.viewportTransform
    );
    if (
      correspondingObject.top > window.innerHeight ||
      correspondingObject.left > window.innerWidth
    ) {
      $('.canvas-content')[0].scrollLeft = originXY.x - window.innerWidth / 2;
      $('.canvas-content')[0].scrollTop = originXY.y - window.innerHeight / 2;
    } else {
      $('.canvas-content')[0].scrollLeft = 0;
      $('.canvas-content')[0].scrollTop = 0;
    }
    this.canvas.setActiveObject(correspondingObject);
    toolbarPosHandler(
      $(`div[id=${commentId}]`),
      correspondingObject,
      this.currentRatio,
      this.scopeOfThis()
    );
    // $(`div[id=${commentId}]`).css('display','flex')

    this.canvas.renderAll();
  }

  async boardTemplateModal() {
    $('#board-template-modal').modal('show');
    try {
      let response: any = await this.SAS.userInitialData();
      if (response) {
        this.modalTemplateData = true;
        this.allMyDocs = response.documents;
      }
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    }
  }

  //  template list function..
  defaultTemplates() {
    $('#template-modal').modal('show');
    this.SAS.request('get', '/sozo/getTemplate', null).subscribe((res) => {
      this.modalTemplateData = true;
      this.templatesList = res['documents'];
    });
  }

  boardModalDocument(e: any, doc: any) {
    $('.board-template-body').css({ border: 'none' });
    e.style.border = '3px solid #7cbb69';
    this.currentModalBoardSelectedDocs = doc;
  }

  async selectedBoardOfModal() {
    if (this.currentModalBoardSelectedDocs) {
      const targetDocId = this.currentModalBoardSelectedDocs.sozo._id;

      $('#board-template-modal').modal('hide');
      $('#template-modal').modal('hide');
      try {
        const response: any = await this.SAS.boardModalDocument(targetDocId);
        if (this.shouldAddBoardInOverlappingOrder) {
          backup(response.documents, null, null, false, this.scopeOfThis());
        } else {
          const allLeftData = [];
          const allTopData = [];

          response.documents.document.forEach((obj) => {
            allLeftData.push(obj.left);
            allTopData.push(obj.top);
          });

          const extremeLeft = Math.max(...allLeftData);
          const extremeTop = Math.max(...allTopData);

          const currentWidth = this.canvas.width;
          const currentHeight = this.canvas.height;

          const updatedHeight = currentHeight + 700 * 4;
          const updatedWidth = currentWidth + 1200 * 4;

          this.canvas.setHeight(updatedHeight);
          this.canvas.setWidth(updatedWidth);
          this.canvas.requestRenderAll();

          const docs = response.documents.document.map((obj) => {
            obj.left = obj.left + extremeLeft;
            return obj;
          });
          backup({ document: docs }, null, null, false, this.scopeOfThis());
        }
      } catch (error) {
        this.SDS.apiErrorHandle(error?.status.toString(), error);
      }
    }
  }

  deleteDrawing() {
    let object = this.canvas.getObjects();
    object.forEach((objData) => {
      if (objData.objType === 'free-drawing') {
        this.canvas.remove(objData);
        emitObjectRemoved(objData.UID, this.scopeOfThis());
        $(`div[id=${objData.UID}]`).remove();
      }
    });
    this.canvas.requestRenderAll();
  }

  commentState() {
    if ($('.comment_drop').css('display') === 'none') {
      this.shouldAddComment = false;
      this.commentsToBeShown = this.whiteboardCommentsAllData;
      $('.comment_drop').css('display', 'block');
      $('.notes_drop').css('display', 'none');
      this.showAddedPeople = false;
    } else {
      $('.comment_drop').css('display', 'none');
    }
  }
  closeComment() {
    $('.comment_drop').css('display', 'none');
  }
  addPeople() {
    this.showSearchBox = false;
    this.showAddedPeople = true;
    // this.showCommentStatus = false;
    $('.notes_drop').css('display', 'none');
    $('.comment_drop').css('display', 'none');
  }
  closeAddPeople() {
    this.showAddedPeople = false;
  }
  noteState() {
    this.showSearchBox = false;
    $('.notes_drop').css('display', 'block');
    $('.comment_drop').css('display', 'none');
    this.showAddedPeople = false;
  }
  closeNotes() {
    $('.notes_drop').css('display', 'none');
  }
  zoomIn() {
    let zoom = this.canvas.getZoom();
    zoom = zoom + 0.1;
    if (zoom > 2) zoom = 2;
    let xPos =
      $('.canvas-content')[0].scrollLeft +
      window.innerWidth -
      window.innerWidth / 2;
    let yPos =
      $('.canvas-content')[0].scrollTop +
      window.innerHeight -
      window.innerHeight / 2;
    this.canvas.zoomToPoint(new fabric.Point(xPos, yPos), zoom);
    this.canvas.renderAll();
    this.canvas.calcOffset();
    designToolbarHideHandler(this.scopeOfThis());
    this.zoomPercentage = Math.floor(zoom * 100);
    // this.emitCanvasZoom({ zoomIn: true, xPos: xPos, yPos: yPos });
    clearInterval(this.zoomInDeboucingTimer);
    this.zoomInDeboucingTimer = setTimeout(() => {
      this.updateMiniMapVP();
      this.shouldSavedWithImage && this.saveMsg();
    }, 500);
  }
  zoomOut() {
    let zoom = this.canvas.getZoom();
    zoom = zoom - 0.1;
    if (zoom < 0.05) zoom = 0.05;
    let xPos =
      $('.canvas-content')[0].scrollLeft +
      window.innerWidth -
      window.innerWidth / 2;
    let yPos =
      $('.canvas-content')[0].scrollTop +
      window.innerHeight -
      window.innerHeight / 2;
    this.canvas.zoomToPoint(new fabric.Point(xPos, yPos), zoom);

    this.canvas.renderAll();
    this.canvas.calcOffset();

    this.zoomPercentage = Math.floor(zoom * 100);
    designToolbarHideHandler(this.scopeOfThis());
    // this.emitCanvasZoom({ zoomIn: false, xPos: xPos, yPos: yPos });
    clearInterval(this.zoomOutDeboucingTimer);
    this.zoomOutDeboucingTimer = setTimeout(() => {
      this.updateMiniMapVP();
      this.shouldSavedWithImage && this.saveMsg();
    }, 500);
  }

  uploadImage(event) {
    uploadImageHandler(event, this.scopeOfThis());
  }

  uploadGif(event) {
    uploadGifHandler(event, this.scopeOfThis());
  }

  gifToSprite = async (gif, maxWidth, maxHeight, maxDuration) => {
    let arrayBuffer;
    let error;
    let frames;
    // if the gif is an input file, get the arrayBuffer with FileReader
    if (gif?.type) {
      const reader = new FileReader();
      try {
        arrayBuffer = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(gif);
        });
      } catch (err) {
        error = err;
      }
    }
    // else the gif is a URL or a dataUrl, fetch the arrayBuffer
    else {
      try {
        arrayBuffer = await fetch(gif).then((resp) => resp.arrayBuffer());
      } catch (err) {
        error = err;
      }
    }

    // Parse and decompress the gif arrayBuffer to frames with the "gifuct-js" library
    if (!error) frames = decompressFrames(parseGIF(arrayBuffer), true);
    if (!error && (!frames || !frames.length)) error = 'No_frame_error';
    if (error) {
      return { error };
    }

    // Create the needed canvass
    const dataCanvas = document.createElement('canvas');
    const dataCtx = dataCanvas.getContext('2d');
    const frameCanvas = document.createElement('canvas');
    const frameCtx = frameCanvas.getContext('2d');
    const spriteCanvas = document.createElement('canvas');
    const spriteCtx = spriteCanvas.getContext('2d');

    // Get the frames dimensions and delay
    let [width, height, delay] = [
      frames[0].dims.width,
      frames[0].dims.height,
      frames.reduce((acc, cur) => (acc = !acc ? cur.delay : acc), null),
    ];

    // Set the Max duration of the gif if any
    // FIXME handle delay for each frame
    const duration = frames.length * delay;
    maxDuration = maxDuration || duration;
    if (duration > maxDuration) frames.splice(Math.ceil(maxDuration / delay));

    // Set the scale ratio if any
    maxWidth = maxWidth || width;
    maxHeight = maxHeight || height;
    const scale = Math.min(maxWidth / width, maxHeight / height);
    width = width * scale;
    height = height * scale;

    //Set the frame and sprite canvass dimensions
    frameCanvas.width = width;
    frameCanvas.height = height;
    spriteCanvas.width = width * frames.length;
    spriteCanvas.height = height;

    frames.forEach((frame, i) => {
      // Get the frame imageData from the "frame.patch"
      const frameImageData = dataCtx.createImageData(
        frame.dims.width,
        frame.dims.height
      );
      frameImageData.data.set(frame.patch);
      dataCanvas.width = frame.dims.width;
      dataCanvas.height = frame.dims.height;
      dataCtx.putImageData(frameImageData, 0, 0);

      // Draw a frame from the imageData
      if (frame.disposalType === 2) frameCtx.clearRect(0, 0, width, height);
      frameCtx.drawImage(
        dataCanvas,
        frame.dims.left * scale,
        frame.dims.top * scale,
        frame.dims.width * scale,
        frame.dims.height * scale
      );

      // Add the frame to the sprite sheet
      spriteCtx.drawImage(frameCanvas, width * i, 0);
    });

    // Get the sprite sheet dataUrl
    const dataUrl = spriteCanvas.toDataURL();

    // Clean the dom, dispose of the unused canvass
    dataCanvas.remove();
    frameCanvas.remove();
    spriteCanvas.remove();

    return {
      dataUrl,
      frameWidth: width,
      framesLength: frames.length,
      delay,
    };
  };

  exportAsPdf() {
    let pdfName = $('#documentTitle').val();
    let fileWidth = 208;
    let fileHeight = (this.canvas.height * fileWidth) / this.canvas.width;
    var imgData = this.canvas.toDataURL('image/jpeg');
    var pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, fileWidth, fileHeight);
    pdf.save(`${pdfName}.pdf`);
    $('.dropdown-submenu div.dropdown-menu').css('display', 'none');
  }
  exportAsPpt() {
    let pptName = $('#documentTitle').val();
    var imgData = this.canvas.toDataURL('image/jpeg');
    var pptx = new pptxgen();
    var slide = pptx.addSlide();
    slide.addImage({ data: imgData, x: 1, y: 1, w: 8, h: 4 });
    pptx.writeFile({ fileName: `${pptName}.pptx` });
  }
  opneInsert() {
    $('.dropdown-submenu div.dropdown-menu').css('display', 'none');
  }
  opneExport() {
    $('.dropdown-submenu div.dropdown-menu').css('display', 'none');
  }

  // for togglefullScreenVideoConference
  // globalListenFunc: Function;

  // show full-screen & close full-screen on click
  elem = document.documentElement;

  fullScreen() {
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    }
    this.showFullScreen = false;
    this.showCloseScreen = true;
  }
  closeFullScreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    this.showFullScreen = true;
    this.showCloseScreen = false;
  }
  getJsonDataForGivenArray(data) {
    const allCanvasObjectsInJSON = convertCanvasDataToJson(this.scopeOfThis());
    const filteredData = [];
    data.forEach((obj) => {
      allCanvasObjectsInJSON?.objects?.forEach((ob) => {
        if (ob?.objType === obj?.objType && ob?.UID === obj?.UID) {
          filteredData.push(ob);
        }
      });
    });
    return filteredData;
  }
  updateCanvasState(data = null) {
    // const jsonData = this.getJsonDataForGivenArray(data)
    // this.undoRedoData.canvasState.push(jsonData);
    // this.undoRedoData.currentIndex = this.undoRedoData.canvasState.length - 1;
    // let jsonData = this.savedDocs(true);
    // if (
    //   this.undoRedoConfig.canvasState.length -
    //     this.undoRedoConfig.currentIndex ===
    //   1
    // ) {
    //   this.undoRedoConfig.canvasState.push(jsonData);
    //   this.undoRedoConfig.currentIndex += 1;
    // } else {
    //   let newUndoRedoState = this.undoRedoConfig.canvasState.slice(
    //     0,
    //     this.undoRedoConfig.currentIndex + 1
    //   );
    //   newUndoRedoState.push(jsonData);
    //   this.undoRedoConfig.canvasState = newUndoRedoState;
    //   this.undoRedoConfig.currentIndex += 1;
    // }
  }

  updateUndoRedoState(data) {
    const jsonData = this.getJsonDataForGivenArray(data);

    if (
      this.undoRedoData.canvasState.length - this.undoRedoData.currentIndex ===
      1
    ) {
      this.undoRedoData.canvasState.push(jsonData);
      this.undoRedoData.currentIndex += 1;
    } else {
      let newUndoRedoState = this.undoRedoData.canvasState.slice(
        0,
        this.undoRedoData.currentIndex + 1
      );
      newUndoRedoState.push(jsonData);
      this.undoRedoData.canvasState = newUndoRedoState;
      this.undoRedoData.currentIndex += 1;
    }
  }

  addCheckList(context) {
    var ui = $.summernote.ui;
    var button = ui.button({
      contents:
        '<img src="assets/img/notes-check-box-icon.svg" width="15" class="mb-1">',
      tooltip: 'Insert a Checklist',
      click: function () {
        context.invoke(
          'editor.pasteHTML',
          '<span contentEditable="false" class=""><input type="checkbox" class="note-editor-checkbox"/></span>&nbsp;'
        );
      },
    });
    return button.render();
  }

  closeDropdown() {
    $('.dropdown-submenu div.dropdown-menu').css('display', 'none');
    $('.dropdown-submenu div.dropdown-menu').css('display', 'none');
  }

  emitCanvasZoom(zoom) {
    this.SSS.socket.emit('canvas:zoom', zoom);
  }

  newCanvasHandler() {
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
        // localStorage.clear();
        // this.router.navigate(['/login']);
        this.SDS.apiErrorHandle(error?.status.toString(), error);
      }
    };
    userCanvasData();
  }

  ngOnInit(): void {
    initializeSozo(this.scopeOfThis());

    // drag toolbar and vidoe confrence div...
    this.dragToolbarFunction();

    // get user credentials

    this.getuserDetails();

    // this.globalListenFunc = this.renderer.listen('document', 'keypress', e => {
    //   console.log("hello atul",e);
    // });
  }

  // //////////////////////////
  // drag toolbar function....
  // //////////////////////////
  dragToolbarFunction() {
    // positioning the element initially
    $('#conferenceControl').css({ top: '540px', left: '370px' });

    // Drag and drop, Conference Container

    dragElement(document.getElementById('videoContainer'));
    dragElement(document.getElementById('conferenceControl'));
    dragElement(document.getElementById('ShareScreenContainer'));

    function dragElement(elmnt: any) {
      var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
      if (document.getElementById(elmnt.id + 'header')) {
        /* if present, the header is where you move the DIV from:*/
        document
          .getElementById(elmnt.id + 'header')
          ?.addEventListener('onmousedown', dragMouseDown);
      } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
      }

      function dragMouseDown(e: any) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
      }

      function elementDrag(e: any) {
        e = e || window.event;
        e.preventDefault();
        var winW =
            document.documentElement.clientWidth || document.body.clientWidth,
          winH =
            document.documentElement.clientHeight || document.body.clientHeight;
        var maxX = winW - elmnt.offsetWidth - 1,
          maxY = winH - elmnt.offsetHeight - 1;

        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        // set the element's new position:
        if (elmnt.offsetTop - pos2 <= maxY && elmnt.offsetTop - pos2 >= 0) {
          elmnt.style.top = elmnt.offsetTop - pos2 + 'px';
        }
        // if (elmnt.offsetLeft - pos1 <= maxX && elmnt.offsetLeft - pos1 >= 0) {
        //   elmnt.style.left = elmnt.offsetLeft - pos1 + 'px';
        // }

        if ($('#audio').is(':visible')) {
          if (elmnt.offsetLeft - pos1 <= maxX && elmnt.offsetLeft - pos1 >= 0) {
            elmnt.style.left = elmnt.offsetLeft - pos1 + 'px';
          }
        } else {
          if (
            elmnt.offsetLeft - pos1 <= maxX &&
            elmnt.offsetLeft - pos1 >= -505
          ) {
            elmnt.style.left = elmnt.offsetLeft - pos1 + 'px';
          }
        }
      }

      function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
      }
    }
  }

  // get user credentials
  getuserDetails() {
    this.SAS.request(
      'get',
      '/user/getuser/' + localStorage.getItem('userId'),
      null
    ).subscribe((resp) => {
      this.isAdminUserStatus = resp.user.isAdmin;
    });
  }

  testFunc() {
    // this.canvas.width = 7000
    this.canvas.setHeight(7000);
    this.canvas.setWidth(7000);
    this.canvas.requestRenderAll();
  }

  zoomInputHandler() {
    let changedZoom = parseInt($('.zoom-input-handler').val()) / 100;
    if (changedZoom >= 2) {
      changedZoom = 2;
      $('.zoom-input-handler').val('200');
    }
    if (changedZoom <= 0.05) {
      changedZoom = 0.05;
      $('.zoom-input-handler').val('5');
    }
    this.zoomPercentage = JSON.stringify(changedZoom * 100).split('.')[0];
    let xPos =
      $('.canvas-content')[0].scrollLeft +
      window.innerWidth -
      window.innerWidth / 2;
    let yPos =
      $('.canvas-content')[0].scrollTop +
      window.innerHeight -
      window.innerHeight / 2;
    this.canvas.zoomToPoint(new fabric.Point(xPos, yPos), changedZoom);

    this.canvas.renderAll();
    this.canvas.calcOffset();
    this.updateMiniMapVP();
    this.shouldSavedWithImage && this.saveMsg();
  }

  initialFreeDrawing() {
    this.canvas.isDrawingMode = true;
    this.canvas.freeDrawingBrush.width = 2;
    this.canvas.freeDrawingBrush.color =
      this.freeDrawingColor === '' ? '#000' : this.freeDrawingColor;
  }

  ngOnDestroy() {
    this.SSS.socket.emit('disconnected');
    this.disconnectLive();
  }

  async newCanvasData() {
    let response: any = await this.SAS.userDocumentData();
    this.filteredDocs = response.documents;
  }

  async getSharedDetail() {
    let response: any = await this.SAS.userDocumentData();
    let whiteboardID = response.documents._id;
    try {
      $('#loader').css('display', 'block');
      let response: any = await this.SAS.getSharedData(whiteboardID);
      response.users.forEach((data) => {
        let userInitialName = data.userName.split(' ');
        let firstNameChar = userInitialName[0].split('')[0];
        let lastNameChar = userInitialName[1].split('')[0];
        this.sharedUserDetails.push({
          name: data.userName,
          nameInitial: firstNameChar + lastNameChar,
        });
      });

      if (this.sharedUserDetails.length > 0) {
        this.userList = true;
      } else {
        this.userList = false;
      }

      $('#loader').css('display', 'none');
    } catch (error) {
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    }
  }

  sendPermissionsId() {
    $('.input_copy_button').val(
      `${this.SAS.CLIENT_BASE_URL}/invitations/accept/invite_${this.filteredDocs.editShareLink}`
    );
    this.getSharedDetail();
    $('.shared-user-list li').remove();
  }

  addPeopleEditShareLinkGen() {
    this.permissionInviteLink = `${this.SAS.CLIENT_BASE_URL}/invitations/accept/invite_${this.filteredDocs.editShareLink}`;
  }
  addPeopleEditLinkGen() {
    this.permissionInviteLink = `${this.SAS.CLIENT_BASE_URL}/invitations/accept/invite_${this.filteredDocs.editLink}`;
  }
  addPeopleViewLinkGen() {
    this.permissionInviteLink = `${this.SAS.CLIENT_BASE_URL}/invitations/accept/invite_${this.filteredDocs.viewLink}`;
  }
  editShareLinkGen() {
    $('.input_copy_button').val(
      `${this.SAS.CLIENT_BASE_URL}/invitations/accept/invite_${this.filteredDocs.editShareLink}`
    );
  }
  editLinkGen() {
    $('.input_copy_button').val(
      `${this.SAS.CLIENT_BASE_URL}/invitations/accept/invite_${this.filteredDocs.editLink}`
    );
  }

  undo() {
    undo(this.scopeOfThis());
  }

  redo() {
    redo(this.scopeOfThis());
  }

  viewLinkGen() {
    $('.input_copy_button').val(
      `${this.SAS.CLIENT_BASE_URL}/invitations/accept/invite_${this.filteredDocs.viewLink}`
    );
  }

  async shareWhiteboardEmail() {
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
        this.permissionInviteLink ??
        `${this.service.clientBaseUrl}/invitations/accept/invite_${this.filteredDocs.editShareLink}`,
      projectName: this.documentTitle,
    };

    this.SAS.addPeopleEmail(rqData)
      .then((response: any) => {})
      .catch((error: any) => {
        this.SDS.triggerError(error?.message);
      })
      .finally(() => {
        $('#loader').css('display', 'none');
      });
  }

  createCanvasEl() {
    let minimapRatio = fabric.util.findScaleToFit(this.canvas, this.minimap);
    let scaling = this.minimap.getRetinaScaling();
    let canvas = this.canvas.toCanvasElement(minimapRatio * scaling);
    this.canvas.renderAll();
    return canvas;
  }

  updateMiniMap() {
    let canvas = this.createCanvasEl();
    this.minimap.backgroundImage._element = canvas;
    this.minimap.requestRenderAll();
  }

  updateMiniMapVP() {
    let designSize = {
      width: this.canvas.getWidth(),
      height: this.canvas.getHeight(),
    };
    let rect = this.minimap.getObjects();
    let designRatio = fabric.util.findScaleToFit(designSize, this.canvas);
    let finalRatio = designRatio / this.canvas.getZoom();

    if (rect?.length > 0) {
      rect.forEach((obj) => {
        if (obj.objType === 'minimap-rect') {
          obj.scaleX = finalRatio;
          obj.scaleY = finalRatio;
        }
      });
      this.minimap.requestRenderAll();
    }
  }

  initMinimap() {
    let canvas = this.createCanvasEl();

    let backgroundImage = new fabric.Image(canvas);

    backgroundImage.scaleX = 1 / this.canvas.getRetinaScaling();
    backgroundImage.scaleY = 1 / this.canvas.getRetinaScaling();
    this.minimap.centerObject(backgroundImage);
    this.minimap.backgroundColor = 'white';
    this.minimap.backgroundImage = backgroundImage;
    this.minimap.backgroundImage.top = 0;

    let minimapView = new fabric.Rect({
      top: backgroundImage.top,
      left: backgroundImage.left,
      width: 35,
      height: 25,
      fill: 'transparent',
      objType: 'minimap-rect',
      transparentCorners: false,
      stroke: 'blue',
      strokeWidth: 2,
      noScaleCache: false,
      strokeUniform: true,
    });

    this.minimap.on('mouse:down', (events) => {
      let pointer = this.minimap.getPointer(events.e);
      let posX = pointer.x - minimapView.width;
      let posY = pointer.y - minimapView.height;
      let objectWidth = minimapView.width / 2;
      let objectHeight = minimapView.height / 2;
      let objXRatio = posX + objectWidth;
      let objYRatio = posY + objectHeight;
      let objX = this.canvas.getWidth() / this.minimap.getWidth();
      let objY = this.canvas.getHeight() / this.minimap.getHeight();
      $('.canvas-content')[0].scrollLeft = objX * objXRatio;
      $('.canvas-content')[0].scrollTop = objY * objYRatio;
      minimapView.set('top', pointer.y - objectHeight);
      minimapView.set('left', pointer.x - objectWidth);

      minimapView.setCoords();

      this.minimap.renderAll();
    });

    this.minimap.on('object:moving', (events) => {
      let pointer = this.minimap.getPointer(events.e);
      let posX = pointer.x - minimapView.width;
      let posY = pointer.y - minimapView.heightbackup;
      let objectWidth = minimapView.width / 2;
      let objectHeight = minimapView.height / 2;
      let objXRatio = posX + objectWidth;
      let objYRatio = posY + objectHeight;
      let objX = this.canvas.getWidth() / this.minimap.getWidth();
      let objY = this.canvas.getHeight() / this.minimap.getHeight();
      $('.canvas-content')[0].scrollLeft = objX * objXRatio;
      $('.canvas-content')[0].scrollTop = objY * objYRatio;

      let obj = events.target;
      // if object is too big ignore
      if (
        obj.currentHeight > obj.canvas.height ||
        obj.currentWidth > obj.canvas.width
      ) {
        return;
      }
      obj.setCoords();
      // top-left  corner
      if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
        obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
        obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
      }
      // bot-right corner
      if (
        obj.getBoundingRect().top + obj.getBoundingRect().height >
          obj.canvas.height ||
        obj.getBoundingRect().left + obj.getBoundingRect().width >
          obj.canvas.width
      ) {
        obj.top = Math.min(
          obj.top,
          obj.canvas.height -
            obj.getBoundingRect().height +
            obj.top -
            obj.getBoundingRect().top
        );
        obj.left = Math.min(
          obj.left,
          obj.canvas.width -
            obj.getBoundingRect().width +
            obj.left -
            obj.getBoundingRect().left
        );
      }
      this.minimap.renderAll();
    });
    minimapView.hasControls = false;
    this.minimap.add(minimapView);
    this.minimap.renderAll();
  }

  // OPEN LIVE CONFERENCE ON CANVAS
  openLiveConf() {
    $('#conferenceControl').collapse('show');

    let liveConference = $('.live-conference-main').css('display');
    $('.live-conference').css('background-color', '#57D45B');
    if (liveConference === 'none') {
      $('.live-conference-main').css('display', 'flex');
      if (this.isJoined === true) {
        $('.videocall-clients-container').css('display', 'flex');
      }
    } else {
      $('.live-conference-main').css('display', 'none');
      $('.videocall-clients-container').css('display', 'none');
    }
  }
  miniMap() {
    $('.revision_history').css('display', 'none');
    let x = $('#canvasMap').css('display');
    if (x === 'none') {
      x = 'block';
      $('#canvasMap').css('display', x);
    } else {
      x = 'none';
      $('#canvasMap').css('display', x);
    }
  }

  closeVideoCallAlert() {
    $('.alert-video-call').css('display', 'none');
  }

  savingAnimationHandler() {
    $('.saving-icon').css('display', 'none');
    $('.lds-dual-ring').css('display', 'block');
  }

  selfAudioController = async () => {
    if (this.isJoined != true) {
      return;
    }
    for (let i = 0; i < this.localTracks.length; i++) {
      if (this.localTracks[i].getType() == 'audio') {
        if (this.localTracks[i].isMuted()) {
          await this.localTracks[i].unmute();
          this.audioSectionReset();
          const element = document.getElementById('custome_icon_mute');
          const element2 = document.getElementById('muteIcon');

          if (element) {
            element.remove();
            element2.remove();
          }
        } else {
          await this.localTracks[i].mute();

          $('#videoContainer').append(
            `
   <div id='localdiv' style='display: contents;'>
   </div>
   `
          );

          $('#localdiv').append(
            `
            <div id="custome_icon_mute" style="bottom: 2rem; position:relative;"><img id="muteIcon" class="muteVideoIcon" style="position:absolute; height:1.3rem; left:0.4rem;" style="height:1.5rem" src="assets/img/white-microphone.svg" alt="muteIcon"></div>
            </div>
            `
          );

          this.gridViewChange(this.gridType);

          $('.audio-section-content p').html('Unmute');
          $('.audio-section-content img').remove();
          let imgElement = $(
            '<img src="assets/img/white-microphone.svg"></img>'
          ).css({
            width: '1.8rem',
          });

          $('.audio-section-content .img-wrapper').append(imgElement);
        }
      }
    }
  };

  // SELF VIDEO CONTROLLER (TOOLBAR, SCREEN STOP & STOP ALL)
  selfVideoController = async () => {
    if (this.isJoined != true) {
      return;
    }
    for (let i = 0; i < this.localTracks.length; i++) {
      if (this.localTracks[i].getType() == 'video') {
        if (this.localTracks[i].isMuted()) {
          await this.localTracks[i].unmute();
          $(`#localmute${i}`).remove();
          $(`#localVideo${i}`).css('display', 'flex');
          this.gridViewChange(this.gridType);
          this.videoSectionReset();
        } else {
          let user = this.userDisplayNames.filter((e) => e.id == 'local')[0];

          await this.localTracks[i].mute();

          // ADD LOCAL MUTE / VIDEO OFF SCREEN
          $(`#localVideo${i}`).css('display', 'none');

          $('#localdiv').append(
            `<div id='localmute${i}' style='height:7.21rem; font-size:2rem' class='d-flex justify-content-center align-items-center bg-dark text-white m-1' > <span> ${user.initial} <span> </div>`
          );

          $('.video-section-content p').html('Start Video');
          $('.video-section-content img').remove();
          let imgElement = $(
            '<img src="assets/img/white-video.svg"></img>'
          ).css({
            width: '1.65rem',
          });

          $('.video-section-content .img-wrapper').append(imgElement);
          this.gridViewChange(this.gridType);
        }
      }
    }
  };

  clear() {
    this.canvas.getObjects().forEach((obj) => {
      this.canvas.remove(obj);
    });
    this.canvas.renderAll();
  }

  async userDocumentData() {
    try {
      $('#loader').css('display', 'block');
      let response: any = await this.SAS.userDocumentData();
      if (response) {
        $('#internet-connection-status-modal').modal('hide');
        this.filteredDocs = response.documents;
        this.responseCanvasObjects = response.documents;
        this.whiteboardCommentsAllData = response.documents.comments;
        this.noCommentShow =
          this.whiteboardCommentsAllData.length > 0 ? false : true;
        this.userAccess = response.access;
        this.isOwner = response?.isOwner ?? false;
        this.canvas.setWidth(response?.data?.canvasDimension[0]);
        this.canvas.setHeight(response?.data?.canvasDimension[1]);
        this.zoomPercentage = response.data.zoom;
        $('.canvas-content')[0].scrollLeft = response?.data?.canvasScrollStatus
          ?.onXAxis
          ? response?.data?.canvasScrollStatus?.onXAxis
          : 0;
        $('.canvas-content')[0].scrollTop = response?.data?.canvasScrollStatus
          ?.onYAxis
          ? response?.data?.canvasScrollStatus?.onYAxis
          : 0;
        this.canvas.viewportTransform = response?.data?.viewTransform;
        this.shouldSaveCanvasObjects = false;
        // this.backup(response?.documents);
        backup(response?.documents, null, null, false, this.scopeOfThis());
        this.userAccess = 'full';
        this.documentTitle = response.documents.name;
        // changing project tiltle while opening
        document.title = response.documents.name;
        this.minimap.loadFromJSON(JSON.stringify(this.canvas), () => {
          this.initMinimap();
          this.updateMiniMapVP();
        });
        if (this.userAccess === 'readonly') {
          $('.whiteboard-shareButton').css('display', 'none');
          $('.whiteboard-addPeople').css('display', 'none');
          $('.whiteboard-comment').css('display', 'none');
          $('.main-comment').css('display', 'none');
          this.canvas.getObjects().forEach((obj) => {
            obj.selectable = false;
            this.canvas.renderAll();
          });
        } else if (this.userAccess === 'edit') {
          $('.whiteboard-shareButton').css('display', 'none');
          this.canvas.getObjects().forEach((obj) => {
            obj.selectable = true;
            this.canvas.renderAll();
          });
        } else if (
          this.userAccess === 'full' ||
          this.userAccess === 'editShare'
        ) {
          this.canvas.getObjects().forEach((obj) => {
            obj.selectable = true;
            this.canvas.renderAll();
          });
        }
        $('#loader').css('display', 'none');
        this.updateCanvasState();
        this.updateUndoRedoState(response?.documents.document);

        if (response?.documents?.meeting_status == true) {
          $('.alert-video-call').css('display', 'block');
          $('.live-conference').css('background-color', '#57D45B');
          $('.live-conference-mute-section p').html('Join');
          $('.live-conference-main').css('display', 'flex');

          this.isEndLive = false;

          this.isStartLive = false;

          this.isJoinLive = true;
        }
      }
    } catch (error) {
      // localStorage.clear();
      // this.router.navigate(['/login']);
      this.SDS.apiErrorHandle(error?.status.toString(), error);
    }
  }

  sozoOnlineStatus() {
    return merge<boolean>(
      fromEvent(window, 'offline').pipe(map(() => false)),
      fromEvent(window, 'online').pipe(map(() => true)),
      new Observable((sub: Observer<boolean>) => {
        sub.next(navigator.onLine);
        sub.complete();
      })
    );
  }

  removeComponentState() {
    this.canvas.getObjects().forEach((ob) => {
      this.canvas.remove(ob);
    });
  }

  internetConnectionDisabledHandler() {
    $('#internet-connection-status-modal').modal('show');
    this.isComponentLostInternet = true;
  }

  internetConnectionEnabledHandler() {
    if (this.isComponentLostInternet) {
      this.removeComponentState();
      this.userDocumentData();
    }
  }

  retrieveShapeOnUndoRedo(objects, ob) {
    let text = objects.find((o) => o?.UID === ob?.UID && o?.type === 'textbox');
    if (ob?.objType === 'container-rect') {
      let line = objects.find(
        (o) => o?.UID === ob?.UID && o?.objType === 'container-line'
      );
      retrieveObjectHandler([ob, text, line], true, this.scopeOfThis());
    } else {
      retrieveObjectHandler([ob, text], true, this.scopeOfThis());
    }
  }

  setUndoRedoOnImageObject(objects, ob, image) {
    let retrImage = objects.find((o) => o?.UID === image?.UID);
    Object.keys(ob).forEach((key) => {
      image.set(key, ob[key]);
    });
    this.canvas.requestRenderAll();
    updateImageToolbarState(image, this.scopeOfThis());
  }

  setUndoRedoOnFreeDrawing(objects, ob, freeDrawing) {
    let retrFreeDrawing = objects.find((o) => o?.UID === freeDrawing?.UID);
    Object.keys(ob).forEach((key) => {
      freeDrawing.set(key, ob[key]);
    });
    this.canvas.requestRenderAll();
    updateFreeDrawingToolbarState(freeDrawing, this.scopeOfThis());
  }

  setUndoRedoOnShape(objects, ob, shape) {
    let text = this.canvas
      .getObjects()
      .find((o) => o?.UID === shape?.UID && o?.type === 'textbox');
    let retrText = objects.find(
      (o) => o?.UID === shape?.UID && o?.type === 'textbox'
    );
    Object.keys(ob).forEach((key) => {
      shape.set(key, ob[key]);
    });
    shape.setCoords();
    Object.keys(retrText).forEach((key) => {
      text.set(key, retrText[key]);
    });
    text.setCoords();
    if (ob?.objType === 'container-rect') {
      let line = objectOnCanvasExistOrNot(
        ob?.UID,
        'container-line',
        this.scopeOfThis()
      );
      let retrLine = objects.find(
        (o) => o?.UID === shape?.UID && o?.objType === 'container-line'
      );
      Object.keys(retrLine).forEach((key) => {
        line.set(key, retrLine[key]);
      });
      let rectLine = shape.height / 12;
      let x1 = shape.left;
      let y1 = shape.top + rectLine;
      let x2 = shape.aCoords.tr.x;
      let y2 = shape.top + rectLine;
      line.set({ x1, x2, y1, y2 });
      line.setCoords();
    }
    this.canvas.requestRenderAll();
    updateShapeToolbarState(shape, text, this.scopeOfThis());
  }

  setObjectPositionForUndoRedo(objects) {
    objects?.forEach((ob) => {
      if (isObjectIsShape(ob) || ob?.objType === 'container-rect') {
        let shape = objectOnCanvasExistOrNot(
          ob?.UID,
          ob?.objType,
          this.scopeOfThis()
        );
        if (shape) {
          this.setUndoRedoOnShape(objects, ob, shape);
        } else {
          this.retrieveShapeOnUndoRedo(objects, ob);
        }
      } else if (ob?.objType === 'free-drawing') {
        let freeDrawing = objectOnCanvasExistOrNot(
          ob?.UID,
          ob?.objType,
          this.scopeOfThis()
        );
        if (freeDrawing) {
          this.setUndoRedoOnFreeDrawing(objects, ob, freeDrawing);
        } else {
          drawingObjectRetriever(ob, this.scopeOfThis());
        }
      } else if (
        ob?.objType === 'uploaded-img' ||
        ob?.objType === 'uploaded-gif'
      ) {
        let image = objectOnCanvasExistOrNot(
          ob?.UID,
          ob?.objType,
          this.scopeOfThis()
        );
        if (image) {
          this.setUndoRedoOnImageObject(objects, ob, image);
        } else {
          if (ob?.objType === 'uploaded-img') {
            retrieveObjectHandler(ob, true, this.scopeOfThis());
          } else {
            reCreateGif(ob, this.scopeOfThis());
          }
        }
      }
    });
  }

  addDistanceMeasuringObject(totalDifference, desiredTop, desiredLeft) {
    const text = new fabric.Textbox(totalDifference + ' cm', {
      top: desiredTop,
      left: desiredLeft,
      fontFamily: 'Arial',
      fill: 'grey',
      width: 100,
      fontSize: 15,
      actualFontSize: '20',
      fontWeight: 'normal',
      noScaleCache: false,
      textAlign: 'center',
      objType: 'distance-indicator',
      selectMe: false,
      originX: 'center',
      originY: 'center',
      hasControls: false,
      hasBorders: false,
      matchedLine: false,
    });
    this.canvas.add(text);
    this.canvas.requestRenderAll();
  }

  removeMeasureShowingObject() {
    this.canvas.getObjects().forEach((obj) => {
      if (obj?.objType === 'distance-indicator') {
        this.canvas.remove(obj);
      }
    });
  }

  measureMiddleDistanceBetweenTheObjects(event) {
    const targetElement = event.transform.target;
    if (isObjectIsPartOfMainShape(targetElement)) {
      this.removeMeasureShowingObject();
      const targetElementCenterPoints = targetElement.getCenterPoint();
      this.canvas.getObjects().forEach((obj) => {
        if (
          obj?.UID === targetElement.UID &&
          obj?.objType === targetElement?.objType
        )
          return;
        if (isObjectIsPartOfMainShape(obj)) {
          const objCenterPos = obj.getCenterPoint();
          const startOffsetX =
            targetElementCenterPoints.x - this.objectDisMeasureOff;
          const endOffsetX =
            targetElementCenterPoints.x + this.objectDisMeasureOff;
          const startOffsetY =
            targetElementCenterPoints.y - this.objectDisMeasureOff;
          const endOffsetY =
            targetElementCenterPoints.y + this.objectDisMeasureOff;

          if (objCenterPos.x > startOffsetX && objCenterPos.x < endOffsetX) {
            const desiredLeft = objCenterPos.x;
            const desiredTop =
              (targetElementCenterPoints.y + objCenterPos.y) / 2;

            const totalDifference = JSON.stringify(
              (
                Math.abs(targetElementCenterPoints.y - objCenterPos.y) *
                this.pixelToInchFactor
              ).toFixed(2)
            );
            this.addDistanceMeasuringObject(
              totalDifference,
              desiredTop,
              desiredLeft
            );
          } else if (
            objCenterPos.y > startOffsetY &&
            objCenterPos.y < endOffsetY
          ) {
            const desiredLeft =
              (targetElementCenterPoints.x + objCenterPos.x) / 2;
            const desiredTop = objCenterPos.y;
            const totalDifference = JSON.stringify(
              (
                Math.abs(targetElementCenterPoints.x - objCenterPos.x) *
                this.pixelToInchFactor
              ).toFixed(2)
            );
            this.addDistanceMeasuringObject(
              totalDifference,
              desiredTop,
              desiredLeft
            );
          }
        }
      });
    }
  }

  clearRestCanvasObjects(objects) {
    this.canvas.getObjects().forEach((obj) => {
      if (obj?.objType === 'friend-group') return;
      let isObjectExistInState = objects?.find((o) => o.UID === obj.UID);
      let isObjectExistInServer = this.responseCanvasObjects?.document?.find(
        (o) => o.UID === obj.UID
      );
      if (!isObjectExistInState && !isObjectExistInServer) {
        this.canvas.remove(obj);
        $(`div[id=${obj.UID}]`).remove();
        removeObjectComment(obj, this.scopeOfThis());
      }
    });
    this.canvas.requestRenderAll();
  }

  savedDocs(ret = false) {
    let savedDocument = convertCanvasDataToJson(this.scopeOfThis());
    if (ret) {
      return savedDocument;
    } else {
      let userCanvasData = async () => {
        this.miniImage = new fabric.Canvas('miniImg', {
          containerClass: 'miniImg',
          selection: false,
        });
        this.miniImage.height = 171;
        this.miniImage.width = 300;
        var backgroundImage = new fabric.Image(
          this.canvas.toCanvasElement(
            fabric.util.findScaleToFit(this.canvas, this.miniImage),
            this.miniImage.getRetinaScaling()
          )
        );
        this.miniImage.backgroundColor = 'white';
        this.miniImage.backgroundImage = backgroundImage;
        this.miniImage.renderAll();

        let imgData = this.miniImage.toDataURL({
          format: 'png',
          quality: 0.001,
        });
        try {
          let response: any = await this.SAS.savingUserCanvasData(
            JSON.stringify({
              document: savedDocument.objects,
              name: this.documentTitle,
              comments: this.whiteboardCommentsAllData,
              zoom: this.zoomPercentage,
              canvasDimension: [
                this.canvas.getWidth(),
                this.canvas.getHeight(),
              ],
              canvasScrollStatus: {
                onXAxis: $('.canvas-content')[0]?.scrollLeft,
                onYAxis: $('.canvas-content')[0]?.scrollTop,
              },
              viewTransform: this.canvas.viewportTransform,
              imgData,
            })
          );
        } catch (error) {
          // localStorage.clear();
          // this.router.navigate(['/login']);
          this.SDS.apiErrorHandle(error?.status.toString(), error);
        }
      };
      userCanvasData();
    }
  }

  scopeOfThis() {
    return { fabric, $, scope: this };
  }

  arrowHoldHandler(type) {
    this.whichArrowTypeShouldDraw = type;
  }

  checkObjectForGivenRegion(shape, targetObj) {
    let centerPos = shape.getCenterPoint();
    let shapeCordinates = shape.aCoords;
    let extraLayerNumber = this.shapeConnectionRange;
    let xStart = shapeCordinates.tl.x - extraLayerNumber;
    let xEnd = shapeCordinates.tr.x + extraLayerNumber;
    let yStart = shapeCordinates.tl.y - extraLayerNumber;
    let yEnd = shapeCordinates.bl.y + extraLayerNumber;
    let result = false;
    if (
      isObjectInGivenRegion(
        targetObj.left,
        targetObj.top,
        xStart,
        xEnd,
        yStart,
        shapeCordinates.tl.y
      )
    ) {
      result = true;
    } else if (
      isObjectInGivenRegion(
        targetObj.left,
        targetObj.top,
        shapeCordinates.tr.x,
        xEnd,
        yStart,
        yEnd
      )
    ) {
      result = true;
    } else if (
      isObjectInGivenRegion(
        targetObj.left,
        targetObj.top,
        xStart,
        xEnd,
        shapeCordinates.br.y,
        yEnd
      )
    ) {
      result = true;
    } else if (
      isObjectInGivenRegion(
        targetObj.left,
        targetObj.top,
        xStart,
        shapeCordinates.tl.x,
        yStart,
        yEnd
      )
    ) {
      result = true;
    }
    return result;
  }

  setIndicationOfConnectionBetweenShapesAndArrows(obj) {
    if (
      obj?.label === 'control-point' ||
      obj?.label === 'left-arrow' ||
      obj?.label === 'right-arrow'
    ) {
      let result = false;
      this.canvas.getObjects().forEach((ob) => {
        if (isObjectIsShape(ob) || ob?.objType === 'container-rect') {
          ob.setCoords();
          // obj.setCoords();
          let shape = ob;
          let targetObj = obj;
          result = this.checkObjectForGivenRegion(shape, targetObj);
          if (result) {
            shape.set({
              stroke: 'blue',
            });
          } else {
            setStrokeAndStrokeWidthFromToolbar(shape, this.scopeOfThis());
          }
          this.canvas.requestRenderAll();
        }
      });
      return result;
    }
  }

  setCoordsForAllObjects() {
    this.canvas.getObjects().forEach((obj) => {
      obj.setCoords();
    });
    this.canvas.requestRenderAll();
  }

  ngAfterViewInit() {
    initCenteringGuidelines(this.canvas, this.scopeOfThis());
    initAligningGuidelines(this.canvas, this.scopeOfThis());
    this.freeDrawingToolbarElements.objectToolbar = $('.freedrawing-toolbar');
    this.freeDrawingToolbarElements.objectColorPicker = $(
      '.freedrawing-toolbar-colorpicker'
    );
    this.freeDrawingToolbarElements.objectStroke_1 = $(
      '.freedrawing-toolbar .stroke-width-1'
    );
    this.freeDrawingToolbarElements.objectStroke_2 = $(
      '.freedrawing-toolbar .stroke-width-2'
    );
    this.freeDrawingToolbarElements.objectStroke_3 = $(
      '.freedrawing-toolbar .stroke-width-3'
    );
    this.freeDrawingToolbarElements.objectStroke_4 = $(
      '.freedrawing-toolbar .stroke-width-4'
    );
    this.freeDrawingToolbarElements.objectLockIcon = $(
      '.freedrawing-toolbar-lockicon'
    );

    $('#board-template-modal').on('hidden.bs.modal', () => {
      this.modalTemplateData = false;
      this.allMyDocs = [];
      this.currentModalBoardSelectedDocs = null;
      $('.board-template-body').css({ border: 'none' });
    });

    $('#ShareScreenContainer').css({ display: 'none' });

    this.sozoOnlineStatus().subscribe((isOnline) => {
      if (isOnline) {
        this.internetConnectionEnabledHandler();
      } else {
        this.internetConnectionDisabledHandler();
      }
    });
  }

  ngAfterViewChecked() {
    $('#session-expired-modal').on('hidden.bs.modal', () => {
      this.sessionExpiredRedirect();
    });
    userIdealConditionRedirectHandler(this.scopeOfThis());
  }
  sessionExpiredRedirect() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
  startArrowToDraw() {
    this.shouldDrawArrow = true;
    setContainerNonSelectable(this.scopeOfThis());
  }

  isStartLive = true;
  isEndLive = false;
  isJoinLive = false;
  localTracks = [];

  startLive() {
    $('#videoContainer').empty();
    this.localTracks = [];
    this.userDisplayNames = [];
    this.remoteTracks = {};
    this.isJoined = false;
    this.isStartLive = false;
    this.isEndLive = true;
    this.isJoinLive = false;
    $('.video-call-loader').css('display', 'flex');
    this.createConnection();
  }

  endLive() {
    this.isStartLive = true;
    this.isEndLive = false;
    this.isJoinLive = false;
    this.disconnectLive();
    this.audioSectionReset();
    this.videoSectionReset();
    $('#videoContainer').empty();
    $('#ShareScreenContainer').css({ display: 'none' });
  }

  audioSectionReset = () => {
    $('.audio-section-content p').html('Mute');
    $('.audio-section-content img').remove();
    let imgElement = $(
      '<img src="assets/img/microphone-black-shape.svg"></img>'
    ).css({
      width: '0.9rem',
    });
    $('.audio-section-content .img-wrapper').append(imgElement);
  };

  videoSectionReset = () => {
    $('.video-section-content p').html('Stop Video');
    $('.video-section-content img').remove();
    let imgElement = $('<img src="assets/img/video-camera.svg"></img>').css({
      width: '1.5rem',
    });
    $('.video-section-content .img-wrapper').append(imgElement);
  };

  joinLive() {
    $('video').remove();
    $('audio').remove();
    this.localTracks = [];
    this.userDisplayNames = [];
    this.remoteTracks = {};
    this.isJoined = false;
    this.isStartLive = false;
    this.isEndLive = true;
    this.isJoinLive = false;
    $('.video-call-loader').css('display', 'flex');
    $('.alert-video-call').css('display', 'none');
    this.createConnection();
  }

  onLocalTracks = (tracks) => {
    this.localTracks = tracks;

    for (let i = 0; i < this.localTracks.length; i++) {
      if (this.localTracks[i].getType() === 'video') {
        // GENERATE FIRST VIDEO
        $('#videoContainer').append(
          `
            <div id='localdiv' style='display: contents;'>
         
            <video  autoplay='1' class="m-1" id='localVideo${i}' />
            </div>
            `
        );
        // $('#localdiv').append(
        //   `<span  style="position :absolute; bottom:1rem; margin-left:0.4rem; "><img style="height:1.5rem" id='toggleMuteIcon${i}' src="assets/img/white-microphone.svg" alt=""><span>
        //   `
        // );
        this.localTracks[i].attach($(`#localVideo${i}`)[0]);
        // this.localTracks[i].attach($(`#toggleMuteIcon${i}`)[0]);
        ``;
      } else {
        $('#videoContainer').append(
          `<audio autoplay='1' muted='true' id='localAudio${i}' />`
        );
        this.localTracks[i].attach($(`#localAudio${i}`)[0]);
      }
      if (this.isJoined) {
        this.room.addTrack(this.localTracks[i]);
      }
    }
  };

  // user joined
  onRemoteTrack = (track) => {
    const participant = track.getParticipantId();

    if (!this.remoteTracks[participant]) {
      this.remoteTracks[participant] = [];
    }
    const idx = this.remoteTracks[participant].push(track);

    const id = participant + track.getType() + idx;

    if (track.getType() === 'video') {
      this.videoDynamicID.push(`${participant}video${idx}`);

      // socket js
      this.SSS.socket.on('stop-sharing', (res) => {
        if (res.isShare == true) {
        } else {
          $('#ShareScreenContainer').css({ display: 'none' });
          this.onUserLeft(res.id);
        }
      });

      // GENERATE SECOND VIDEO
      if (track.videoType == 'desktop') {
        $('#ShareScreenContainer').css({ display: 'block' });

        $('#ShareScreenContainer').append(
          `<div class="gridSection"  id='${id}div'>
          <video autoplay='1'  class="m-1 w-100 video"  id='${participant}video${idx}'  /> 
          </div>`
        );
        this.isShareScreenOn = true;
      } else {
        this.isShareScreenOn = false;

        // GENERATE SECOND VIDEO
        $('#videoContainer').append(
          `<div id='${id}div' class="gridSection" style='
        display: contents;'> 
        <video autoplay='1' class="m-1" id='${participant}video${idx}' /> </div>`
        );
      }

      this.audioDynamicID.push(`${id}muted`);

      this.gridViewChange(this.gridType);
    } else {
      $('#videoContainer').append(
        `<audio autoplay='1' id='${participant}audio${idx}' />`
      );
    }
    track.attach($(`#${id}`)[0]);
    this.gridViewChange(this.gridType);

    this.muteIconAppend(track);
  };

  onConferenceJoined = () => {
    $('.video-call-loader').css('display', 'none');
    $('.videocall-clients-container').css('display', 'flex');
    let userDetails = JSON.parse(localStorage.getItem('userDetails'));
    this.isJoined = true;

    for (let i = 0; i < this.localTracks.length; i++) {
      this.room.addTrack(this.localTracks[i]);
    }
    this.userDisplayNames.push({
      id: 'local',
      initial:
        userDetails.firstName[0].toUpperCase() +
        userDetails.lastName[0].toUpperCase(),
      name: userDetails.firstName + ' ' + userDetails.lastName,
    });
  };

  onUserJoined = (id, user) => {
    let initials = user._displayName.split(' ');

    this.userDisplayNames.push({
      id: user._id,
      initial:
        initials[0][0].toUpperCase() + initials[1]
          ? initials[1][0].toUpperCase()
          : '',
      name: user._displayName,
    });
  };

  onUserLeft = (idP) => {
    for (let i = 0; i < this.remoteTracks[idP]?.length ?? 0; i++) {
      const id = idP + this.remoteTracks[idP][i].getType() + (i + 1);

      $(`#${id}`).remove();
      $(`#${id}div`).remove();
      this.remoteTracks[idP][i].detach($(`#${id}`)[0]);
      this.remoteTracks[idP][i].dispose();
    }
    delete this.remoteTracks[idP];

    this.userDisplayNames.splice(
      this.userDisplayNames.findIndex((a) => a.id === idP),
      1
    );
  };

  onConnectionSuccess = () => {
    let userDetails = JSON.parse(localStorage.getItem('userDetails'));

    this.room = this.connection.initJitsiConference(
      this.activatedRoute.snapshot.params.id,
      this.option.conference
    );

    this.room.on(this.jitsi.events.conference.TRACK_ADDED, (track) => {
      !track.isLocal() && this.onRemoteTrack(track);
    });
    this.room.on(
      this.jitsi.events.conference.CONFERENCE_JOINED,
      this.onConferenceJoined
    );
    this.room.on(this.jitsi.events.conference.USER_JOINED, this.onUserJoined);
    this.room.on(this.jitsi.events.conference.USER_LEFT, this.onUserLeft);
    this.room.on(
      this.jitsi.events.conference.TRACK_MUTE_CHANGED,
      this.mutedChange
    );
    this.room.setDisplayName(
      userDetails.firstName + ' ' + userDetails.lastName
    );

    this.room.join();
    this.room.setReceiverVideoConstraint(720);
  };

  // SCREEN OFF DYNAMIC VIDEO1
  mutedChange = (track) => {
    this.muteIconAppend(track);
    if (!track.isLocal()) {
      const participant = track.getParticipantId();
      let user = this.userDisplayNames.filter((e) => e.id == participant)[0];
      if (track.getType() == 'video') {
        if (track.isMuted()) {
          const id = participant + track.getType() + 2;
          $(`#${id}`).css('display', 'none');
          $(`#${id}div`).append(
            `<div id='${id}muted' style='height:7.21rem; font-size:2rem' class='d-flex justify-content-center align-items-center bg-dark text-white m-1'  > <span> ${user.initial} <span> </div>`
          );
        } else {
          const id = participant + track.getType() + 2;
          $(`#${id}muted`).remove();
          $(`#${id}`).css('display', 'flex');
        }
      }
    }
  };

  // mute icon append to video
  muteIconAppend(track: any) {
    const participant = track.getParticipantId();
    const id = participant + track.getType() + 2;
    let stringis = `#${id}div`.replace('audio', 'video');
    let stringis2 = `${id}div`.replace('audio', 'video') + 'i';
    if (track.isMuted()) {
      if (track.getType() == 'audio') {
        $(stringis).append(
          `
          <div id='${stringis2}' style="bottom: 1rem; position:absolute;"><img  class="muteVideoIcon" style="position:relative; height:1.3rem; left:0.4rem;" style="height:1.5rem" src="assets/img/white-microphone.svg" alt="muteIcon"></div>
          </div>
          `
        );

        this.gridViewChange(this.gridType);
      }
    } else {
      let id = stringis + 'i';
      const element = document.getElementById(stringis2);
      if (element) {
        element.remove();
      }
    }
  }

  onConnectionFailed = () => {
    $('.video-call-loader').css('display', 'none');
    $('.alert-video-call').css('display', 'block');
    console.error('Connection Failed!');
    this.disconnectLive();
  };

  disconnect = () => {
    if (this.connection) {
      this.connection.removeEventListener(
        this.jitsi.events.connection.CONNECTION_ESTABLISHED,
        this.onConnectionSuccess
      );
      this.connection.removeEventListener(
        this.jitsi.events.connection.CONNECTION_FAILED,
        this.onConnectionFailed
      );
      this.connection.removeEventListener(
        this.jitsi.events.connection.CONNECTION_DISCONNECTED,
        this.disconnectLive
      );
    }
  };

  disconnectLive = async () => {
    for (let i = 0; i < this.localTracks.length; i++) {
      await this.localTracks[i].dispose();
    }

    if (this.room) {
      await this.room.leave();
      this.room = null;
    }
    this.disconnect();
    if (this.connection) {
      await this.connection.disconnect();
    }

    this.localTracks = [];
    this.userDisplayNames = [];
    this.remoteTracks = {};
    this.isJoined = false;
    $('.video-call-loader').css('display', 'none');
    $('.live-conference-main').css('display', 'none');
    $('.videocall-clients-container').css('display', 'none');
  };

  createServer = () => {
    return new this.jitsi.JitsiConnection(null, null, this.option.connection);
  };

  createConnection = () => {
    this.SSS.socket.on('mute-all', (value) => {
      if (value.muteType == 'audio') {
        this.selfAudioController();
      } else if (value.muteType == 'video') {
        this.selfVideoController();
      }
    });

    this.connection = this.createServer();

    this.connection.addEventListener(
      this.jitsi.events.connection.CONNECTION_ESTABLISHED,
      this.onConnectionSuccess
    );
    this.connection.addEventListener(
      this.jitsi.events.connection.CONNECTION_FAILED,
      this.onConnectionFailed
    );
    this.connection.addEventListener(
      this.jitsi.events.connection.CONNECTION_DISCONNECTED,
      this.disconnectLive
    );

    this.connection.connect();

    this.jitsi
      .createLocalTracks({ devices: ['audio', 'video'] })
      .then(this.onLocalTracks)
      .catch((error) => {
        throw error;
      });
  };

  // mute all Participant
  muteAllAudioParticipant() {
    this.SSS.socket.emit('mute-all', { muteType: 'audio' });

    console.log('participent list', this.room.getParticipants());

    let user = this.room.getParticipants();

    let data = [];
    user.map((item) => {
      data.push(item['_tracks'][0]);
    });

    data.map((item) => {
      item.mute();
    });
  }

  muteAllVideoParticipant() {
    this.SSS.socket.emit('mute-all', { muteType: 'video' });
  }

  // TOOLBAR HIDING ON BUTTON FUNCTIONALITY

  onClickToolbarMinise() {
    if (this.ToolbarMinimiseFlag) {
      $('#audio').hide();
      $('#stopVideo').hide();
      $('#participants').hide();
      $('#cameraView').hide();
      $('#screenShare').hide();
      $('#stopSharingScreen').hide();

      this.ToolbarMinimiseFlag = false;
    } else {
      $('#audio').show();
      $('#stopVideo').show();
      $('#participants').show();
      $('#cameraView').show();
      $('#screenShare').show();
      $('#stopSharingScreen').show();
      this.ToolbarMinimiseFlag = true;
    }
  }

  // GRID VIEW CHANGE OF VIDEO CONTAINER
  gridViewChange(type) {
    this.gridType = type;
    console.log('fun called', type);

    // check type
    if (type == 'temp1') {
      $('#videoContainer').css('display', 'flex');
      $('#videoContainer').css('width', '12rem');
      $('#localmute1').css('width', 'auto');
      $('#localVideo1').css('width', 'auto');

      //adding mute icon on video
      if (document.getElementById('custome_icon_mute')) {
        document.getElementById('custome_icon_mute').style.bottom = '2rem';
      }

      this.videoDynamicID.map((item) => {
        let id = '#' + item;
        $(id).css('width', 'auto');
        $(id).css('display', 'flex');
      });
    } else if (type == 'temp2') {
      $('#videoContainer').css('display', 'inline');
      $('#videoContainer').css('width', '28rem');
      $('#localdiv').css('width', '12rem');
      $('#localVideo1').css('width', '48%');
      $('#localVideo1').css('float', 'left');

      // adding mute icon on video
      if (document.getElementById('custome_icon_mute')) {
        document.getElementById('custome_icon_mute').style.bottom = '-6rem';
      }

      this.videoDynamicID.map((item) => {
        let id = '#' + item;
        $(id).css('width', '48%');
        $(id).css('float', 'left');
        $(id).css('display', 'inline');
      });
      $('#localmute1').css('width', '48%');
      $('#localmute1').css('float', 'left');
      this.audioDynamicID.map((item) => {
        let id = '#' + item;
        let audioIdForMuteIcon = '#' + item.replace('muted', 'divi');

        $(audioIdForMuteIcon).css('right', '12rem');

        $(id).css('width', '48%');
        $(id).css('float', 'left');
      });
    } else if (type == 'temp3') {
      // $('#videoContainer').css('display', 'inline');
      $('#videoContainer').css('width', '40rem');
      $('#localdiv').css('width', '40rem');
      $('#localdiv').css('margin', '0 !important');
      $('#localVideo1').css('width', '99%');
      $('#localVideo1').css('margin', '0 !important');
      $('#localmute1').css('height', '21rem');

      if (document.getElementById('custome_icon_mute')) {
        document.getElementById('custome_icon_mute').style.bottom = '2rem';
      }

      this.videoDynamicID.map((item) => {
        let id = '#' + item;
        $(id).css('display', 'none');
      });
    }

    console.log('on mute', type);
  }

  // share screen functionlaity
  async shareScreen() {
    try {
      var newScreenshareTrack = await this.jitsi.createLocalTracks({
        devices: ['desktop'],
      });

      await this.room.removeTrack(
        this.localTracks[1] ? this.localTracks[1] : this.localTracks[0]
      );
      this.localTracks = [];

      this.screenTracks = newScreenshareTrack;
      await this.room.addTrack(this.screenTracks[0]);
      // this.screenTracks[0].attach($(`#video-track-local`)[0]);
      this.SSS.socket.emit('stop-sharing', {
        isShare: true,
        id: this.screenTracks[0].getParticipantId(),
      });
      this.isScreenShare = true;
    } catch (error) {
      console.log('error starting screenshare: ' + error);
    }
  }

  //

  async stopScreenShare() {
    try {
      this.SSS.socket.emit('stop-sharing', {
        isShare: false,
        id: this.screenTracks[0].getParticipantId(),
      });

      await this.room.removeTrack(this.screenTracks[0]);
      this.screenTracks = [];

      var newLocalTracks = await this.jitsi.createLocalTracks({
        devices: ['video'],
      });

      this.localTracks = newLocalTracks;
      await this.room.addTrack(this.localTracks[0]);
      // this.localTracks[0].attach($(`#video-track-local`)[0]);
      this.isScreenShare = false;
    } catch (error) {
      console.log('error in stopping screenshare: ' + error);
    }
  }

  // make full screen-video
  vidElem = this.elem;

  fullVidScreen(e: any) {
    // function dragElement;
    $('#conferenceControl').css({ top: '570px' });

    let data = document.getElementById('videoContainer');
    let sideBar = document.getElementById('conferenceControl');

    data.requestFullscreen();
    data.appendChild(sideBar);
    // document.getElementById('conferenceControl').requestFullscreen();
    this.showFullScreenVideo = false;
    this.showCloseScreenVideo = true;
    $(this.fullVidScreen).preventDefault();
  }

  // exit full screen video
  closeVidScreen() {
    if (document.exitFullscreen) {
      let data = document.getElementById('videoContainer');
      let sideBar = document.getElementById('conferenceControl');
      document.exitFullscreen();
      data.parentNode.insertBefore(sideBar, data.nextSibling);
    }
    this.showFullScreenVideo = true;
    this.showCloseScreenVideo = false;
  }

  // tansprent background change function..
  backgroundTransprent() {
    objectBackgroundTransparent(this.scopeOfThis());
  }

  // ADDING COMMENTS ON CLICK BUTTON
  addCommentHandlerBtn(event: any) {
    addCommentHandler(this.scopeOfThis());
  }

  warning(data: any) {
    alert(data);
  }

  // minimise and maximise the screen share view
  minimiseShare() {
    $('#ShareScreenContainer').css({ height: '5rem', width: '12rem' });
  }
  maximiseshare() {
    $('#ShareScreenContainer').css({
      height: 'auto',
      width: '80%',
      position: 'fixed',
      top: '3rem',
      left: '3rem',
      right: '3rem',
    });
  }
}
function isAdminUserstatus(arg0: string, isAdminUserstatus: any) {
  throw new Error('Function not implemented.');
}
