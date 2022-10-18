import { emitObjectModifying } from "../socket-events/socket-emit";
import { designToolbarHideHandler } from "./general-helper";

export const freeDrawingToolbarHandler = (id, object, fromServer = false,helperData) => {
    const {$,fabric} = helperData;
    let mainDrawingDiv = $('.canvas-container');
    let freeDrawingMainDiv = $(
      `<div class="freedrawing-toolbar p-0 m-0" id=${id} ></div>`
    );
    let freedrawingToolbarColorpicker = $(
      '<div  class="h-100 center freedrawing-toolbar-colorpicker"></div>'
    ).css({
      width: '3rem',
      'border-right': '0.16rem solid #f5f5f5',
    });
    let freeDrawingColorPallete = $(
      '<div class="freeDrawing-colorPallete" type="button"  data-toggle="dropdown"></div>'
    );

    let colorChangerDropdown = $(
      '<div class="dropdown-menu p-2" role="button" ></div>'
    ).addClass('free-drawing-color');

    let colorChangerDropdownMenuList = $(
      '<div class="d-flex flex-wrap" ></div>'
    );
    helperData.scope.drawingColorList.forEach((color) => {
      let colorlist = $('<div class="col-3 p-0 center color-list" ></div>').css(
        { height: '3rem' }
      );
      let colorlistDiv = $('<div></div>').css({
        'border-radius': '50%',
        'background-color': `${color}`,
        width: '1.6rem',
        height: '1.6rem',
      });

      colorlist.click(() => {
        let activeObject = helperData.scope.canvas.getActiveObject();
        if (activeObject.stroke === color) return;
        freeDrawingColorPallete.css({ 'background-color': color });
        if (activeObject?.objType === 'free-drawing') {
          activeObject.set('stroke', color);
        }
        // updateCanvasState();
        // updateMiniMap();
        helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
        helperData.scope.canvas.renderAll();
        emitObjectModifying([activeObject],helperData);
      });
      colorlist.append(colorlistDiv);
      colorChangerDropdownMenuList.append(colorlist);
    });
    freeDrawingColorPallete.css({ 'background-color': object.stroke });
    colorChangerDropdown.append(colorChangerDropdownMenuList);

    freedrawingToolbarColorpicker.append(
      freeDrawingColorPallete,
      colorChangerDropdown
    );
    let freeDrawingStrokwWidth1 = $(
      '<div class="h-100 center stroke-width-1"></div>'
    ).css({
      width: '3rem',
      'border-right': '0.16rem solid #f5f5f5',
    });
    let freeDrawingStrokwWidthIcon1 = $(
      '<img src="assets/img/strokeWidthOne.svg"></img>'
    ).css({
      width: ' 0.5rem',
    });
    freeDrawingStrokwWidth1.click(() => {
      let activeObj = helperData.scope.canvas.getActiveObject();
      if (activeObj.get('strokeWidth') !== 2) {
        activeObj.set('strokeWidth', 2);
        helperData.scope.canvas.renderAll();
        // updateCanvasState();
        // updateMiniMap();
        helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
        emitObjectModifying([activeObj],helperData);
      }
    });
    freeDrawingStrokwWidth1.append(freeDrawingStrokwWidthIcon1);

    let freeDrawingStrokwWidth2 = $(
      '<div class="h-100 center stroke-width-2"></div>'
    ).css({
      width: '3rem',
      'border-right': '0.16rem solid #f5f5f5',
    });
    let freeDrawingStrokwWidthIcon2 = $(
      '<img src="assets/img/strokeWidthTwo.svg"></img>'
    ).css({
      width: ' 0.9rem',
    });
    freeDrawingStrokwWidth2.click(() => {
      let activeObj = helperData.scope.canvas.getActiveObject();
      if (activeObj.get('strokeWidth') !== 5) {
        activeObj.set('strokeWidth', 5);
        helperData.scope.canvas.renderAll();
        // updateCanvasState();
        // updateMiniMap();
        helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
        emitObjectModifying([activeObj],helperData);
      }
    });
    freeDrawingStrokwWidth2.append(freeDrawingStrokwWidthIcon2);

    let freeDrawingStrokwWidth3 = $(
      '<div class="h-100 center stroke-width-3"></div>'
    ).css({
      width: '3rem',
      'border-right': '0.16rem solid #f5f5f5',
    });
    let freeDrawingStrokwWidthIcon3 = $(
      '<img src="assets/img/strokeWidthThree.svg"></img>'
    ).css({
      width: ' 1.2rem',
    });
    freeDrawingStrokwWidth3.click(() => {
      let activeObj = helperData.scope.canvas.getActiveObject();
      if (activeObj.get('strokeWidth') !== 8) {
        activeObj.set('strokeWidth', 8);
        helperData.scope.canvas.renderAll();
        // updateCanvasState();
        // updateMiniMap();
        helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
        emitObjectModifying([activeObj],helperData);
      }
    });
    freeDrawingStrokwWidth3.append(freeDrawingStrokwWidthIcon3);

    let freeDrawingStrokwWidth4 = $(
      '<div class="h-100 center stroke-width-4"></div>'
    ).css({
      width: '3rem',
      'border-right': '0.16rem solid #f5f5f5',
    });
    let freeDrawingStrokwWidthIcon4 = $(
      '<img src="assets/img/strokeWidthThree.svg"></img>'
    ).css({
      width: ' 1.7rem',
    });
    freeDrawingStrokwWidth4.click(() => {
      let activeObj = helperData.scope.canvas.getActiveObject();
      if (activeObj.get('strokeWidth') !== 16) {
        activeObj.set('strokeWidth', 16);
        helperData.scope.canvas.renderAll();
        // updateCanvasState();
        // updateMiniMap();
        helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
        emitObjectModifying([activeObj],helperData);
      }
    });
    freeDrawingStrokwWidth4.append(freeDrawingStrokwWidthIcon4);

    let freedrawingToolbarLock = $(
      '<div  class="h-100 center freedrawing-toolbar-lockicon"></div>'
    ).css({
      width: '3rem',
    });
    let freedrawingToolbarLockIcon = $('<img src="assets/img/lock-icon.svg"/>');

    let freeDrawingLockIconIndication: any = new Image();
    freeDrawingLockIconIndication.src = 'assets/img/lock-pin-icon.svg';

    let freeDrawingPinIconIndication;

    freedrawingToolbarLock.click(() => {
      designToolbarHideHandler(helperData);
      let activeObject = helperData.scope.canvas.getActiveObjects()[0];
      if (activeObject) {
        if (activeObject.get('lockMovementX', 'lockMovementY') === false) {
          activeObject.set('lockMovementX', true);
          activeObject.set('lockMovementY', true);
          activeObject.set('cornerStrokeColor', 'red');
          activeObject.set('borderColor', 'red');
          activeObject.set('cornerColor', '#87CEFA');
          activeObject.set('lockScalingX', true);
          activeObject.set('lockScalingY', true);
          activeObject.set('lockRotation', true);
          activeObject.set('selectMe', false);

          let centerPosX =
            (activeObject.aCoords.tl.x + activeObject.aCoords.tr.x) / 2;
          let centerPosY =
            (activeObject.aCoords.tl.y + activeObject.aCoords.tr.y) / 2;

          freeDrawingPinIconIndication = new fabric.Image(
            freeDrawingLockIconIndication
          );
          freeDrawingPinIconIndication.set({
            UID: activeObject.UID,
            left: centerPosX,
            top: centerPosY,
            objType: 'lock-Indication',
            originX: 'center',
            originY: 'center',
            lockScalingFlip: true,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            hasControls: false,
            hasBorders: false,
          });
          helperData.scope.canvas.add(freeDrawingPinIconIndication);

          freeDrawingStrokwWidth1.css({ display: 'none' });
          freeDrawingStrokwWidth2.css({ display: 'none' });
          freeDrawingStrokwWidth3.css({ display: 'none' });
          freeDrawingStrokwWidth4.css({ display: 'none' });
          freedrawingToolbarColorpicker.css({ display: 'none' });
          freeDrawingMainDiv.css({ width: '3rem' });
          freeDrawingMainDiv.css({
            'background-color': '#FA8072',
          });
          emitObjectModifying([activeObject],helperData);
        } else {
          activeObject.set('lockMovementX', false);
          activeObject.set('lockMovementY', false);
          activeObject.set('cornerStrokeColor', '#137EF9');
          activeObject.set('borderColor', '#137EF9');
          activeObject.set('cornerColor', '#87CEFA');
          activeObject.set('lockScalingX', false);
          activeObject.set('lockScalingY', false);
          activeObject.set('lockRotation', false);
          activeObject.set('selectMe', true);

          let freeDrawingLockIcon = helperData.scope.canvas
            .getObjects()
            .find(
              (obj) =>
                activeObject.UID === obj.UID &&
                obj.objType === 'lock-Indication'
            );
          helperData.scope.canvas.remove(freeDrawingLockIcon);

          freeDrawingStrokwWidth1.css({ display: 'flex' });
          freeDrawingStrokwWidth2.css({ display: 'flex' });
          freeDrawingStrokwWidth3.css({ display: 'flex' });
          freeDrawingStrokwWidth4.css({ display: 'flex' });
          freedrawingToolbarColorpicker.css({
            display: 'flex',
          });
          // freedrawingToolbarColorpicker.css({ display: 'none' });
          freeDrawingMainDiv.css({ width: '18rem' });
          freeDrawingMainDiv.css({
            'background-color': 'white',
          });
          emitObjectModifying([activeObject],helperData);
        }
        // updateCanvasState();
      }
      helperData.scope.canvas.renderAll();
      // updateCanvasState();
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    });

    if (fromServer) {
      if (object.lockMovementY === true) {
        freeDrawingStrokwWidth1.css({ display: 'none' });
        freeDrawingStrokwWidth2.css({ display: 'none' });
        freeDrawingStrokwWidth3.css({ display: 'none' });
        freeDrawingStrokwWidth4.css({ display: 'none' });
        freedrawingToolbarColorpicker.css({ display: 'none' });
        freeDrawingMainDiv.css({ width: '3rem' });
        freeDrawingMainDiv.css({
          'background-color': '#FA8072',
        });
        object.cornerStrokeColor = 'red';
        object.borderColor = 'red';
        object.cornerColor = '#87CEFA';
      } else {
        freeDrawingStrokwWidth1.css({ display: 'flex' });
        freeDrawingStrokwWidth2.css({ display: 'flex' });
        freeDrawingStrokwWidth3.css({ display: 'flex' });
        freeDrawingStrokwWidth4.css({ display: 'flex' });
        freedrawingToolbarColorpicker.css({
          display: 'flex',
        });
        freeDrawingMainDiv.css({ width: '18rem' });
        freeDrawingMainDiv.css({
          'background-color': 'white',
        });
        object.cornerStrokeColor = '#137EF9';
        object.borderColor = '#137EF9';
        object.cornerColor = '#87CEFA';
      }
      helperData.scope.canvas.renderAll();
    }
    freedrawingToolbarLock.append(freedrawingToolbarLockIcon);
    freeDrawingMainDiv.append(
      freedrawingToolbarColorpicker,
      freeDrawingStrokwWidth1,
      freeDrawingStrokwWidth2,
      freeDrawingStrokwWidth3,
      freeDrawingStrokwWidth4,
      freedrawingToolbarLock
    );
    mainDrawingDiv.append(freeDrawingMainDiv);

    return freeDrawingMainDiv;
  }