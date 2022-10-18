import { createFreeDrawing } from '../objects/free-drawing';
import {
  createdStraightArrow,
  createStraightArrow,
  creatingStraightArrow,
} from '../objects/straight-arrow';
import {
  createdZTypeArrow,
  createZTypeArrow,
  creatingZTypeArrow,
} from '../objects/z-arrow';
import {
  emitMouseMove,
  emitObjectMoving,
  emitObjectRemoved,
  emitObjectScalling,
  emitSelectedAllObjectMouseDown,
} from '../socket-events/socket-emit';
import { createSocketListeners } from '../socket-events/socket-listen';
import { updateAllStraightArrowPoints } from './arrow-helper';
import {
  canvasDynamicSize,
  createObjectOnDblClick,
  createObjectOnMouseDown,
  designToolbarHideHandler,
  handleCreatingControlPointsOnArrows,
  isObjectIsPartOfMainShape,
  isObjectIsShape,
  removeControlPoints,
  removeTextEditingMode,
  setCanvasWidthHeight,
  setContainerSelectable,
  setControlVisibility,
  setPlaceHolderForTextBox,
  setStrokeAndStrokeWidthFromToolbar,
  toolbarPosHandler,
  userIdealConditionRedirectHandler,
  whileMouseDown,
} from './general-helper';
import {
  allObjectsEventsManager,
  selectedObjectsToolbarGenerator,
} from './selected-all-toolbar';
import { objectBackgroundTransparent } from './shape-toolbar';

export const initializeSozo = (helperData) => {
  const { fabric, $ } = helperData;
  if (!localStorage.getItem('userToken')) {
    helperData.scope.router.navigate(['/login']);
  }

  helperData.scope.jitsi?.init();
  helperData.scope.jitsi?.setLogLevel(helperData.scope.jitsi?.logLevels?.ERROR);

  document.onfullscreenchange = (event) => {
    if (document.fullscreenElement) {
      helperData.scope.elem.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => Promise.resolve(err));
      }
      helperData.scope.showFullScreen = true;
      helperData.scope.showCloseScreen = false;
    }
  };

  $(document).keyup((e) => {
    if (helperData.scope.canvas.getActiveObject()) {
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(
          e.originalEvent.code
        ) > -1
      ) {
        let obj = helperData.scope.canvas.getActiveObject();
        obj.selectMe &&
          helperData.scope.shouldSavedWithImage &&
          helperData.scope.saveMsg();
      }
    }
  });

  $('#shareWhiteboardModal').on('hidden.bs.modal', function () {
    $('.input_copy_button').val('');
    $('#userInput').tagsinput('removeAll');
    $('#comments').val('');
    helperData.scope.permissionInviteLink = null;
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
    $('#linkCopyToast').toast('show');
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

  $('.side-active').mousedown(function (event) {
    let sideActive = $('.side-active');
    sideActive.removeClass('active');
    return $(this).addClass('active');
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

  helperData.scope.projectID =
    helperData.scope.activatedRoute.snapshot.params.id;
  helperData.scope.SSS.roomId =
    helperData.scope.activatedRoute.snapshot.params.id;
  helperData.scope.SSS.initializeSocket();

  $('.add_more_user_btn a').click(function () {
    $('.people_drop_button img').remove();
    $('.people_drop_button img').remove();
    let imgNamePush = $(this).find('img:nth-child(2)').attr('src').split('/');

    imgNamePush = imgNamePush[imgNamePush.length - 1];

    let imgToPush = $(`<img src="assets/img/${imgNamePush}">`).css({
      width: '1.1rem',
      'margin-right': '0.62rem',
    });

    let iconToPush = $(
      ' <img src="assets/img/dashboardShareWithDropdown.svg" class="float-right mt-2" width="10">'
    );
    $('.people_drop_button').append(imgToPush, iconToPush);
  });

  $('#color').spectrum({
    color: 'black',
    preferredFormat: 'hex',
    showInput: true,
    showAlpha: true,
  });

  $('.sp-replacer.sp-light').css({
    position: 'absolute',
    top: ' 12.9rem',
    left: '1rem',
  });
  $('.sp-choose').click(() => {
    var value = $('#color').val();
    helperData.scope.newColor = value;
    $('.new-color').css('background-color', value);
    $('#colorPickerDiv').css('background-color', value);
  });

  $('.revision-icon').click(() => {
    $('.revision_history').css('display', 'block');
    $('#canvasMap').css('display', 'none');
  });
  helperData.scope.canvas = new fabric.Canvas('c', {
    selection: true,
    uniformScaling: false,
    preserveObjectStacking: true,
    targetFindTolerance: 5,
  });

  canvasDynamicSize(helperData);
  helperData.scope.canvas.setBackgroundColor(
    { source: helperData.scope.imageSrc, repeat: 'repeat' },
    () => {
      helperData.scope.canvas.renderAll();
    }
  );
  helperData.scope.canvas.renderAll();
  setCanvasWidthHeight(helperData);
  helperData.scope.minimap = new fabric.Canvas('minimap', {
    containerClass: 'minimap',
    selection: false,
  });
  helperData.scope.minimap.height = 160;
  helperData.scope.minimap.width = 260;

  helperData.scope.minimap.renderAll();
  helperData.scope.minimap.loadFromJSON(
    JSON.stringify(helperData.scope.canvas),
    () => {
      helperData.scope.initMinimap();
      helperData.scope.updateMiniMapVP();
    }
  );

  createSocketListeners(helperData);

  let canvasReloadHandler = () => {
    let routeId = helperData.scope.activatedRoute.snapshot.params.id;
    helperData.scope.SDS.set('userID', routeId);
    helperData.scope.userDocumentData();
    helperData.scope.updateMiniMapVP();
  };

  let userData = JSON.parse(localStorage.getItem('userData'));
  helperData.scope.SDS.set('authToken', localStorage.getItem('userToken'));

  if (!userData?.isNew) {
    canvasReloadHandler();
  } else {
    let xPos = (helperData.scope.canvas.getWidth() - window.innerWidth) / 2;
    let yPos = (helperData.scope.canvas.getHeight() - window.innerHeight) / 2;

    $('.canvas-content')[0].scrollLeft = xPos;
    $('.canvas-content')[0].scrollTop = yPos;
    helperData.scope.SDS.set('userID', userData.documentID);
    helperData.scope.zoomPercentage = 75;
    userData.isNew = false;
    localStorage.setItem('userData', JSON.stringify(userData));
    helperData.scope.canvas.zoomToPoint(new fabric.Point(xPos, yPos), 0.75);
    helperData.scope.canvas.renderAll();
    helperData.scope.canvas.calcOffset();
    helperData.scope.newCanvasData();
    helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    // updateCanvasState();
  }
  // checkingVideoCallStatus();
  helperData.scope.updateMiniMapVP();
  $('#documentTitle').focusout(() => {
    // updateCanvasState();
    helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
  });
  $('#documentTitle').click(() => {
    designToolbarHideHandler(helperData);
    helperData.scope.canvas.discardActiveObject();
    helperData.scope.canvas.renderAll();
  });

  $('.drawing-width .common').click(function () {
    $('.drawing-width .common').removeClass('brush-active');
    $(this).addClass('brush-active');
  });

  $('.erase-drawing .erase-common').click(function () {
    helperData.scope.eraserActive = !helperData.scope.eraserActive;
    if (helperData.scope.eraserActive) {
      $('.erase-drawing .erase-common').addClass('erase-active');
    } else {
      $('.erase-drawing .erase-common').removeClass('erase-active');
    }
  });

  $(document).ready(() => {
    $('#summernote').summernote({
      blockquoteBreakingLevel: 0,
      dialogsInBody: true,
      height: 400,
      focus: false,
      toolbar: [
        ['style', ['style', 'checkbox']],
        ['font', ['bold', 'underline', 'italic', 'strikethrough']],
        ['para', ['ul', 'ol']],
        ['insert', ['link', 'checkbox']],
        ['customOptions', ['AddCheckList']],
      ],
      buttons: {
        AddCheckList: helperData.scope.addCheckList,
      },
    });
    $('.note-statusbar').hide();
  });

  $(document).ready(function () {
    $('.dropdown-submenu a.dropdown-item').on('click', function (e) {
      $(this).next('div').toggle();
      e.stopPropagation();
      e.preventDefault();
    });
  });

  $('.zoom-input-handler').focusin(() => {
    helperData.scope.shouldDeleteObject = false;
    helperData.scope.designToolbarHideHandler();
  });

  $('.zoom-input-handler').focusout(() => {
    helperData.scope.shouldDeleteObject = true;
    helperData.scope.designToolbarHideHandler();
  });

  helperData.scope.canvas.on('object:scaled', (e) => {
    emitObjectScalling(e.target, helperData);
  });

  helperData.scope.canvas.on('object:rotated', (e) => {
    emitObjectScalling(e.target, helperData);
  });

  helperData.scope.canvas.on('object:scaling', (e) => {
    // emitObjectScalling(e.target);
    designToolbarHideHandler(helperData);
    let o = e.target;
    if (!o.strokeWidthUnscaled && !o.strokeWidth) {
      o.strokeWidthUnscaled = o.strokeWidth;
    }
    if (o.strokeWidthUnscaled) {
      o.strokeWidth = o.strokeWidthUnscaled / o.scaleX;
    }
  });

  helperData.scope.canvas.on('object:modified', (e) => {
    helperData.scope.updateMiniMap();
    // updateCanvasState();
    helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
  });

  helperData.scope.canvas.on('object:added', (e) => {
    if (e?.target?.UID) {
      e?.target?.objType === 'container-rect'
        ? setControlVisibility(e?.target, false)
        : setControlVisibility(e?.target, true);
    }
    if (isObjectIsPartOfMainShape(e?.target)) {
      e?.target.set('perPixelTargetFind', true);
    }
    helperData.scope.canvas.requestRenderAll();
  });

  helperData.scope.canvas.on('object:removed', (e) => {
    emitObjectRemoved(e, helperData);
  });

  helperData.scope.canvas.on('object:rotating', (e) => {
    designToolbarHideHandler(helperData);
  });

  helperData.scope.canvas.on('path:created', ({ path }) => {
    createFreeDrawing(path, helperData.scope.scopeOfThis());
  });

  helperData.scope.canvas.on('mouse:down', function (opt) {
    let shape = opt.target;
    // store the data for transprent background
    let obj = {
      shape: shape,
      data: helperData,
    };
    // called getter setter method for storing the data
    helperData.scope.SDS.setSelectedShape(obj);

    var evt = opt.e;
    if (evt.altKey === true) {
      this.isDragging = true;
      this.selection = false;
      this.lastPosX = evt.clientX;
      this.lastPosY = evt.clientY;
    }
  });

  helperData.scope.canvas.on('mouse:move', function (opt) {
    if (this.isDragging) {
      var e = opt.e;
      var vpt = this.viewportTransform;
      vpt[4] += e.clientX - this.lastPosX;
      vpt[5] += e.clientY - this.lastPosY;
      this.requestRenderAll();
      this.lastPosX = e.clientX;
      this.lastPosY = e.clientY;
    }
  });

  helperData.scope.canvas.on('mouse:up', function (opt) {
    this.setViewportTransform(this.viewportTransform);
    this.isDragging = false;
    this.selection = true;
  });

  helperData.scope.canvas.on('text:editing:entered', (e) => {
    let obj = e?.target;
    setPlaceHolderForTextBox(obj, helperData);
  });

  helperData.scope.canvas.on('text:changed', (e) => {
    clearInterval(helperData.scope.textDeboucingTimer);
    helperData.scope.textDeboucingTimer = setTimeout(() => {
      //   updateCanvasState();
      helperData.scope.updateMiniMapVP();
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    }, 500);
  });

  helperData.scope.canvas.on('mouse:down', (event) => {
    if (event?.target?.id === 'text' && event?.target?.isEditing) return;
    $('.comment_drop').css('display', 'none');
    $('.objects-toolbar').css('display', 'none');
    designToolbarHideHandler(helperData);
    removeTextEditingMode(helperData);
    helperData.scope.closeSearch();
    helperData.scope.allowSelection = 'allow';
    let originXY = helperData.scope.canvas.getPointer(event.e);
    let objectPos: any = {
      left: originXY.x,
      top: originXY.y,
    };
    // testFunc(originXY)
    if (event.target === null) {
      removeControlPoints(helperData);
    }
    createObjectOnMouseDown(event, objectPos, false, helperData);
    if (helperData.scope.shouldDrawArrow && event.target === null) {
      if (helperData.scope.whichArrowTypeShouldDraw === 'straight') {
        // createStraightArrow(originXY);
        createStraightArrow(originXY, helperData.scope.scopeOfThis());
      } else if (helperData.scope.whichArrowTypeShouldDraw === 'curve1') {
        // createCurveArrow(originXY);
      } else if (helperData.scope.whichArrowTypeShouldDraw === 'curve2') {
        // generateCurveArrow(originXY);
      } else if (helperData.scope.whichArrowTypeShouldDraw === 'perpend') {
        // createZTypeArrow(originXY);
        createZTypeArrow(originXY, helperData.scope.scopeOfThis());
      }
    }
    if (event?.target?.UID) {
      event?.target?.objType === 'container-rect'
        ? setControlVisibility(event?.target, false)
        : setControlVisibility(event?.target, true);
    }
    handleCreatingControlPointsOnArrows(event.target, helperData);

    // if are shape is overlap then this function called for prevent overlapping of text shape
    helperData.scope.canvas.forEachObject(function (obj) {
      if (obj.objType == 'area-text') {
        let obj2 = obj
        helperData.scope.canvas.remove(obj);
        helperData.scope.canvas.add(obj2)
      }
    });

  });

  helperData.scope.canvas.on('mouse:move', (e) => {
    helperData.scope.shouldSaveCanvasObjects = true;

    emitMouseMove(e, helperData);
    userIdealConditionRedirectHandler(helperData);
    if (helperData.scope.isArrowDrawing) {
      let originXY = helperData.scope.canvas.getPointer(e.e);
      if (helperData.scope.whichArrowTypeShouldDraw === 'straight') {
        // creatingStraightArrow(originXY);
        creatingStraightArrow(originXY, helperData.scope.scopeOfThis());
      } else if (helperData.scope.whichArrowTypeShouldDraw === 'curve1') {
        // creatingCurveArrow(originXY);
      } else if (helperData.scope.whichArrowTypeShouldDraw === 'curve2') {
        // generatingCurveArrow(originXY);
      } else if (helperData.scope.whichArrowTypeShouldDraw === 'perpend') {
        // creatingZTypeArrow(originXY);
        creatingZTypeArrow(originXY, helperData.scope.scopeOfThis());
      }
    }
  });

  helperData.scope.canvas.on('mouse:up', (e) => {
    helperData.scope.canvas.isDrawingMode = false;
    helperData.scope.canvas.getObjects().forEach((obj) => {
      if (isObjectIsShape(obj) || obj?.objType === 'container-rect') {
        setStrokeAndStrokeWidthFromToolbar(obj, helperData.scope.scopeOfThis());
      }
    });
    if (helperData.scope.isArrowDrawing) {
      let originXY = helperData.scope.canvas.getPointer(e.e);
      if (helperData.scope.whichArrowTypeShouldDraw === 'straight') {
        // createdStraightArrow(originXY);
        createdStraightArrow(originXY, helperData.scope.scopeOfThis());
      } else if (helperData.scope.whichArrowTypeShouldDraw === 'curve1') {
        // createdCurveArrow();
      } else if (helperData.scope.whichArrowTypeShouldDraw === 'curve2') {
        // generatedCurveArrow();
      } else if (helperData.scope.whichArrowTypeShouldDraw === 'perpend') {
        // createdZTypeArrow(originXY);
        createdZTypeArrow(originXY, helperData.scope.scopeOfThis());
      }
      setContainerSelectable(helperData);
    }
  });

  helperData.scope.canvas.on('mouse:dblclick', (events) => {
    if (helperData.scope.userAccess === 'readonly') {
      return;
    }
    let originXY = helperData.scope.canvas.getPointer(events.e);
    let objectPos: any = {
      left: originXY.x,
      top: originXY.y,
    };
    createObjectOnDblClick(events, objectPos, false, helperData);
    helperData.scope.canvas.requestRenderAll();
  });
  helperData.scope.canvas.on('object:moved', (e) => {
    if (
      e.target.objType !== 'container-rect' &&
      e.target.objType !== 'container-onebytwo' &&
      e.target.objType !== 'container-twobytwo' &&
      e.target?.id !== 'control-pointer'
    ) {
      emitObjectMoving(e, helperData);
    }
    helperData.scope.removeMeasureShowingObject();

    // updateAllStraightArrowPoints()

    // userIdealConditionRedirectHandler()
  });
  helperData.scope.canvas.on('object:moving', (e) => {
    // setIndicationOfConnectionBetweenShapesAndArrows(e.target);
    if (
      e.target.objType !== 'container-rect' &&
      e.target.objType !== 'container-onebytwo' &&
      e.target.objType !== 'container-twobytwo' &&
      e.target?.label !== 'control-point'
    ) {
      emitObjectMoving(e, helperData);
    }
    helperData.scope.measureMiddleDistanceBetweenTheObjects(e);
    designToolbarHideHandler(helperData);
  });

  helperData.scope.canvas.on('before:selection:cleared', (e) => {
    helperData.scope.currentSelectedAllObjectsToolbar?.remove();
  });

  helperData.scope.canvas.on('selection:cleared', (e) => {

    updateAllStraightArrowPoints(helperData)
  });

  ///////////////////////////////
  // object selection ...
  ///////////////////////////////
  helperData.scope.canvas.on('selection:created', (event) => {


    let shape = event.target
    // store the data for transprent background
    let obj = {
      shape: shape,
      data: helperData,
    };
    // called getter setter method for storing the data
    helperData.scope.SDS.setSelectedShape(obj)

    if (event.target?.notAllowed === "not-select") {
      return;
    }
    if (event.selected.length > 1) {
      if (helperData.scope.allowSelection === 'allow') {
        let isContainerExist = false;
        let correspondingObjects = [];
        helperData.scope.canvas.discardActiveObject();

        let canvasData = event.selected;
        canvasData.forEach((ob) => {
          if (isObjectIsShape(ob)) {
            let crsObject = helperData.scope.canvas
              .getObjects()
              .find((o) => o?.UID === ob?.UID && o?.type === 'textbox');
            if (crsObject) {
              let object = canvasData.find((o) => {
                return (
                  o?.UID === crsObject.UID && o?.objType === crsObject.objType
                );
              });
              !object && correspondingObjects.push(crsObject);
            }
          } else if (ob?.objType === 'container-rect') {
            isContainerExist = true;
            helperData.scope.globalMatchedData = [];
            let containerCordinates = ob.aCoords;
            let containerIndex = helperData.scope.canvas
              .getObjects()
              .indexOf(ob);
            let centerPos = ob.getCenterPoint();
            let xStart = containerCordinates.tl.x;
            let xEnd = containerCordinates.tr.x;
            let yStart = containerCordinates.tl.y;
            let yEnd = containerCordinates.bl.y;
            helperData.scope.canvas.getObjects().forEach((o) => {
              if (o?.UID === ob?.UID && o?.objType !== 'container-rect') {
                let object = canvasData.find((ob) => {
                  return ob?.UID === o.UID && ob?.objType === o.objType;
                });
                !object && correspondingObjects.push(o);
              }
            });
            helperData.scope.canvas.getObjects().forEach((obj) => {
              let objectIndex = helperData.scope.canvas
                .getObjects()
                .indexOf(obj);
              if (containerIndex < objectIndex) {
                if (isObjectIsShape(obj)) {
                  let objCoords = obj.aCoords;
                  if (
                    objCoords.tl.x > xStart &&
                    objCoords.tr.x < xEnd &&
                    objCoords.tl.y > yStart &&
                    objCoords.bl.y < yEnd
                  ) {
                    let allShapeWithText = [obj];
                    let textObj = helperData.scope.canvas
                      .getObjects()
                      .find(
                        (ob) => ob?.UID === obj?.UID && ob?.type === 'textbox'
                      );
                    allShapeWithText.push(textObj);
                    allShapeWithText.forEach((obj) => {
                      helperData.scope.globalMatchedData.push({
                        diffX: obj.left - centerPos.x,
                        diffY: obj.top - centerPos.y,
                        object: obj,
                      });
                    });
                  }
                } else if (obj.objType === 'container-rect') {
                  let objCoords = obj.aCoords;
                  if (
                    objCoords.tl.x > xStart &&
                    objCoords.tr.x < xEnd &&
                    objCoords.tl.y > yStart &&
                    objCoords.bl.y < yEnd
                  ) {
                    let allShapeWithText = [obj];
                    let textObj = helperData.scope.canvas
                      .getObjects()
                      .find(
                        (ob) =>
                          ob?.UID === obj?.UID &&
                          ob?.objType === 'container-text'
                      );
                    let lineObj = helperData.scope.canvas
                      .getObjects()
                      .find(
                        (ob) =>
                          ob?.UID === obj?.UID &&
                          ob?.objType === 'container-line'
                      );
                    allShapeWithText.push(textObj);
                    allShapeWithText.push(lineObj);
                    allShapeWithText.forEach((obj) => {
                      helperData.scope.globalMatchedData.push({
                        diffX: obj.left - centerPos.x,
                        diffY: obj.top - centerPos.y,
                        object: obj,
                      });
                    });
                  }
                } else if (
                  obj.objType === 'uploaded-img' ||
                  obj.objType === 'uploaded-gif'
                ) {
                  let objCoords = obj.aCoords;
                  if (
                    objCoords.tl.x > xStart &&
                    objCoords.tr.x < xEnd &&
                    objCoords.tl.y > yStart &&
                    objCoords.bl.y < yEnd
                  ) {
                    helperData.scope.globalMatchedData.push({
                      diffX: obj.left - centerPos.x,
                      diffY: obj.top - centerPos.y,
                      object: obj,
                    });
                  }
                }
              }
            });
            helperData.scope.globalMatchedData.forEach((match) => {
              let object = canvasData.find(
                (obb) =>
                  obb?.UID === match?.object?.UID &&
                  obb?.objType === match?.object?.objType
              );
              if (!object) {
                let element = correspondingObjects.find(
                  (obb) =>
                    obb?.UID === match?.object?.UID &&
                    obb?.objType === match?.object?.objType
                );
                !element && correspondingObjects.push(match.object);
              }
            });
          } else if (ob?.objType === 'straight-arrow-line') {
            correspondingObjects.push(ob);
            helperData.scope.canvas.getObjects().forEach((obj) => {
              if (obj.UID === ob.UID) {
                correspondingObjects.push(obj);
              }
            });
          } else if (ob?.objType === 'curve-arrow-line') {
            correspondingObjects.push(ob);
            helperData.scope.canvas.getObjects().forEach((obj) => {
              if (obj.UID === ob.UID) {
                correspondingObjects.push(obj);
              }
            });
          } else if (ob?.objType === 'z-arrow-line') {
            correspondingObjects.push(ob);
            helperData.scope.canvas.getObjects().forEach((obj) => {
              if (obj.UID === ob.UID) {
                correspondingObjects.push(obj);
              }
            });
          }
        });
        canvasData = canvasData.filter(
          (obj) => obj?.label !== 'left-arrow' && obj?.label !== 'right-arrow'
        );
        let toltalObjects = canvasData.concat(correspondingObjects);
        const uniqueArray = toltalObjects.filter(
          (object, index) =>
            index ===
            toltalObjects.findIndex(
              (obj) => JSON.stringify(obj) === JSON.stringify(object)
            )
        );

        let allObjects;
        let allUnlockedObj = uniqueArray.filter((obj) => obj.selectMe === true);

        if (allUnlockedObj.length > 0) {
          allObjects = new fabric.ActiveSelection(allUnlockedObj, {
            canvas: helperData.scope.canvas,
          });
          allObjects.set('lockMovementX', false);
          allObjects.set('lockMovementY', false);
          allObjects.set('cornerStrokeColor', '#137EF9');
          allObjects.set('borderColor', '#137EF9');
          allObjects.set('cornerColor', '#87CEFA');
          allObjects.set('lockScalingX', false);
          allObjects.set('lockScalingY', false);
          allObjects.set('lockRotation', false);
          allObjects.set('selectMe', true);
        } else {
          allObjects = new fabric.ActiveSelection(uniqueArray, {
            canvas: helperData.scope.canvas,
          });
          allObjects.set('lockMovementX', true);
          allObjects.set('lockMovementY', true);
          allObjects.set('cornerStrokeColor', 'red');
          allObjects.set('borderColor', 'red');
          allObjects.set('cornerColor', '#87CEFA');
          allObjects.set('lockScalingX', true);
          allObjects.set('lockScalingY', true);
          allObjects.set('lockRotation', true);
          allObjects.set('selectMe', false);
        }
        isContainerExist
          ? setControlVisibility(allObjects, false)
          : setControlVisibility(allObjects, true);
        helperData.scope.allowSelection = '';
        helperData.scope.canvas.setActiveObject(allObjects);
        allObjects.objType = 'selected-all';
        allObjects.perPixelTargetFind = true;
        let toolbar = selectedObjectsToolbarGenerator(allObjects, helperData);
        helperData.scope.currentSelectedAllObjectsToolbar = toolbar;
        toolbarPosHandler(
          toolbar,
          allObjects,
          helperData.scope.currentRatio,
          helperData
        );
        allObjectsEventsManager(toolbar, allObjects, helperData);
        // allObjects.getObjects().forEach((ob) => {
        //   canvas.bringToFront(ob);
        // });
        designToolbarHideHandler(helperData);

        emitSelectedAllObjectMouseDown(allObjects, helperData);
        helperData.scope.canvas.renderAll();
      }
    }
  });

  helperData.scope.canvas.on('mouse:wheel', (opt) => {
    $('.objects-toolbar').css('display', 'none');
    if (opt.e.ctrlKey) {
      opt.e.preventDefault();
      opt.e.stopPropagation();
      var delta = opt.e.deltaY;
      var zoom = helperData.scope.canvas.getZoom();

      if (zoom >= 2) {
        zoom = 2;
      } else if (zoom <= 0.05) {
        zoom = 0.05;
      }
      helperData.scope.zoomPercentage = parseInt(
        JSON.stringify(zoom * 100).split('.')[0]
      );
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      helperData.scope.canvas.zoomToPoint(
        { x: opt.e.offsetX, y: opt.e.offsetY },
        zoom
      );
      // canvas.setZoom(zoom);
      // emitCanvasZoom({
      //   xPos: opt.e.offsetX,
      //   yPos: opt.e.offsetY,
      //   changedZoom: true,
      //   zoomValue: zoom,
      // });
    } else {
      if (opt.e.deltaY < 0 && opt.e.deltaX == 0) {
        whileMouseDown('top', helperData);
      }
      if (opt.e.deltaY > 0 && opt.e.deltaX == 0) {
        whileMouseDown('bottom', helperData);
      }
      if (opt.e.deltaX < 0 && opt.e.deltaY == 0) {
        whileMouseDown('left', helperData);
      }
      if (opt.e.deltaX > 0 && opt.e.deltaY == 0) {
        whileMouseDown('right', helperData);
      }
    }
    designToolbarHideHandler(helperData);
    helperData.scope.updateMiniMapVP();
  });
};
