import { emitSelectedAllObjectsLockStatus } from "../socket-events/socket-emit";
import { getTwoArrowHeads, updateArrowToolbarLockStatus } from "./arrow-helper";
import { isObjectIsShape, objectOnCanvasExistOrNot, toolbarPosHandler, updateShapeToolbarForShapeLock, updateShapeToolbarForShapeUnLock } from "./general-helper";
import { shapesEventManager } from "./shape-toolbar";


export const allObjectsEventsManager = (toolbar, allObjects,helperData) => {
    allObjects.on('mousedown', (e) => {
      toolbarPosHandler(toolbar, allObjects, helperData.scope.currentRatio,helperData);
    });
    allObjects.on('moving', (e) => {
      toolbar.css('display', 'none');
    });
    allObjects.on('moved', (e) => {
      toolbarPosHandler(toolbar, allObjects, helperData.scope.currentRatio,helperData);
    //   updateCanvasState();
      // setCoordsForAllObjects()
      // updateAllStraightArrowPoints()
    });
    allObjects.on('scaling', (e) => {
      toolbar.css('display', 'none');
    });
    allObjects.on('scaled', (e) => {
      toolbarPosHandler(toolbar, allObjects, helperData.scope.currentRatio,helperData);
    });
    allObjects.on('rotating', (e) => {
      toolbar.css('display', 'none');
    });
    allObjects.on('rotated', (e) => {
      toolbarPosHandler(toolbar, allObjects, helperData.scope.currentRatio,helperData);
    });
  }

export const setAllSelectedObjectActionable = (objects,helperData,forContainer = false) => {
    const {$,fabric} = helperData
    const getObjectsContained = (objects)=>{
      return objects.map(obj=>obj.object)
    }
    
    const allObjects = forContainer ? getObjectsContained(objects):objects.getObjects()

    allObjects.forEach((obj) => {
      if (
        isObjectIsShape(obj) || obj?.objType === 'container-rect'
      ) {
        let text = allObjects
          .find((ob) => ob?.UID === obj?.UID && ob?.type === 'textbox');
        obj.set('lockMovementX', false);
        obj.set('lockMovementY', false);
        obj.set('cornerStrokeColor', '#137EF9');
        obj.set('borderColor', '#137EF9');
        obj.set('cornerColor', '#87CEFA');
        obj.set('lockScalingX', false);
        obj.set('lockScalingY', false);
        obj.set('lockRotation', false);
        obj.set('selectMe', true);
        text.set('selectMe', true);
        text.set('editable', true);

        let shapeLockIcon = helperData.scope.canvas
          .getObjects()
          .find(
            (object) =>
              obj.UID === object.UID && object.objType === 'lock-Indication'
          );
        helperData.scope.canvas.remove(shapeLockIcon);

        // if (obj?.objType === 'area-shape') {
        text.set('lockMovementX', false);
        text.set('lockMovementY', false);
        // }
        if (obj?.objType === 'container-rect') {
          let line = objectOnCanvasExistOrNot(obj?.UID, 'container-line',helperData);
          line.set('selectMe', true);
        }
        updateShapeToolbarForShapeUnLock(obj,helperData);
      } else if (
        obj?.objType === 'uploaded-img' ||
        obj?.objType === 'uploaded-gif'
      ) {
        obj.set('lockMovementX', false);
        obj.set('lockMovementY', false);
        obj.set('cornerStrokeColor', '#137EF9');
        obj.set('borderColor', '#137EF9');
        obj.set('cornerColor', '#87CEFA');
        obj.set('lockScalingX', false);
        obj.set('lockScalingY', false);
        obj.set('lockRotation', false);
        obj.set('selectMe', true);

        let shapeLockIcon = helperData.scope.canvas
          .getObjects()
          .find(
            (object) =>
              obj.UID === object.UID && object.objType === 'lock-Indication'
          );
        helperData.scope.canvas.remove(shapeLockIcon);

        $(`div[id=${obj.UID}]`)
          .find('.shape-attach-link')
          .css('display', 'block');
        $(`div[id=${obj.UID}]`)
          .find('.shape-background-color')
          .css({ 'background-color': 'white' });
        $(`div[id=${obj.UID}]`).css('display', 'none');
        $(`div[id=${obj.UID}]`).css('width', '9rem');
      } else if (obj?.objType === 'free-drawing') {
        obj.set('lockMovementX', false);
        obj.set('lockMovementY', false);
        obj.set('cornerStrokeColor', '#137EF9');
        obj.set('borderColor', '#137EF9');
        obj.set('cornerColor', '#87CEFA');
        obj.set('lockScalingX', false);
        obj.set('lockScalingY', false);
        obj.set('lockRotation', false);
        obj.set('selectMe', true);

        let shapeLockIcon = helperData.scope.canvas
          .getObjects()
          .find(
            (object) =>
              obj.UID === object.UID && object.objType === 'lock-Indication'
          );
        helperData.scope.canvas.remove(shapeLockIcon);

        $(`div[id=${obj.UID}]`).find('.stroke-width-1').css('display', 'flex');
        $(`div[id=${obj.UID}]`).find('.stroke-width-2').css('display', 'flex');
        $(`div[id=${obj.UID}]`).find('.stroke-width-3').css('display', 'flex');
        $(`div[id=${obj.UID}]`).find('.stroke-width-4').css('display', 'flex');
        $(`div[id=${obj.UID}]`)
          .find('.freedrawing-toolbar-colorpicker')
          .css('display', 'flex');
        $(`div[id=${obj.UID}]`).css({ width: '18rem' });
        $(`div[id=${obj.UID}]`).css({
          'background-color': 'white',
        });
      }else if(obj?.objType === 'straight-arrow-line' || obj?.objType === 'z-arrow-line'){
        const [start,end] = getTwoArrowHeads(obj,helperData);
        obj.set('lockMovementX', false);
        obj.set('lockMovementY', false);
        obj.set('cornerStrokeColor', '#137EF9');
        obj.set('borderColor', '#137EF9');
        obj.set('cornerColor', '#87CEFA');
        obj.set('lockScalingX', false);
        obj.set('lockScalingY', false);
        obj.set('lockRotation', false);
        obj.set('selectMe', true);
        start && start.set('selectMe',true)
        end && end.set('selectMe',true)
        updateArrowToolbarLockStatus(obj,helperData)
      }
    });
  }
  

export const setAllSelectedObjectNonActionable = (objects,helperData,forContainer = false)=> {
    const {fabric,$} = helperData;
    const getObjectsContained = (objects)=>{
      return objects.map(obj=>obj.object)
    }
    const allObjects = forContainer ? getObjectsContained(objects):objects.getObjects()
    allObjects.forEach((obj) => {
      if (
        isObjectIsShape(obj)
        ||
        obj?.objType === 'container-rect'
      ) {
        let text = allObjects
          .find((ob) => ob?.UID === obj?.UID && ob?.type === 'textbox');
        obj.set('lockMovementX', true);
        obj.set('lockMovementY', true);
        obj.set('cornerStrokeColor', 'red');
        obj.set('borderColor', 'red');
        obj.set('cornerColor', '#87CEFA');
        obj.set('lockScalingX', true);
        obj.set('lockScalingY', true);
        obj.set('lockRotation', true);
        obj.set('selectMe', false);
        text.set('selectMe', false);
        text.set('editable', false);

        helperData.scope.canvas.discardActiveObject();
        let allShapeLockIconIndication: any = new Image();
        allShapeLockIconIndication.src = 'assets/img/lock-pin-icon.svg';
        let allShapePinIconIndication;
        let centerPosObjX = (obj.aCoords.tl.x + obj.aCoords.tr.x) / 2;
        let centerPosObjY = (obj.aCoords.tl.y + obj.aCoords.tr.y) / 2;

        allShapePinIconIndication = new fabric.Image(
          allShapeLockIconIndication
        );
        allShapePinIconIndication.set({
          UID: obj.UID,
          left: centerPosObjX,
          top: centerPosObjY,
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
        helperData.scope.canvas.add(allShapePinIconIndication);

        // if (obj?.objType === 'area-shape') {
        text.set('lockMovementX', true);
        text.set('lockMovementY', true);
        // }
        if (obj?.objType === 'container-rect') {
          let line = objectOnCanvasExistOrNot(obj?.UID, 'container-line',helperData);
          line.set('selectMe', false);
          obj.id = "multiple" 
        }

        if(!forContainer){
          helperData.scope.canvas.setActiveObject(objects);
        helperData.scope.canvas.renderAll();

        let objectToolbar = selectedObjectsToolbarGenerator(objects,helperData);
        objectToolbar.css({ 'background-color': '#FA8072' });
        toolbarPosHandler(objectToolbar, objects, helperData.scope.currentRatio,helperData);
        }

        updateShapeToolbarForShapeLock(obj,helperData);

      } else if (
        obj?.objType === 'uploaded-img' ||
        obj?.objType === 'uploaded-gif'
      ) {
        obj.set('lockMovementX', true);
        obj.set('lockMovementY', true);
        obj.set('cornerStrokeColor', 'red');
        obj.set('borderColor', 'red');
        obj.set('cornerColor', '#87CEFA');
        obj.set('lockScalingX', true);
        obj.set('lockScalingY', true);
        obj.set('lockRotation', true);
        obj.set('selectMe', false);

        helperData.scope.canvas.discardActiveObject();
        let allImageLockIconIndication: any = new Image();
        allImageLockIconIndication.src = 'assets/img/lock-pin-icon.svg';
        let allImagePinIconIndication;
        let centerPosObjX = (obj.aCoords.tl.x + obj.aCoords.tr.x) / 2;
        let centerPosObjY = (obj.aCoords.tl.y + obj.aCoords.tr.y) / 2;

        allImagePinIconIndication = new fabric.Image(
          allImageLockIconIndication
        );

        allImagePinIconIndication.set({
          UID: obj.UID,
          left: centerPosObjX,
          top: centerPosObjY,
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
      if(!forContainer){
        helperData.scope.canvas.add(allImagePinIconIndication);
        helperData.scope.canvas.setActiveObject(objects);
        helperData.scope.canvas.renderAll();

        let allImage = selectedObjectsToolbarGenerator(objects,helperData);
        allImage.css({ 'background-color': '#FA8072' });
        toolbarPosHandler(allImage, objects, helperData.scope.currentRatio,helperData);
      }

        $(`div[id=${obj.UID}]`)
          .find('.shape-attach-link')
          .css('display', 'none');
        $(`div[id=${obj.UID}]`)
          .find('.shape-background-color')
          .css({ 'background-color': '#FA8072' });
        $(`div[id=${obj.UID}]`).css('display', 'none');
        $(`div[id=${obj.UID}]`).css('width', '6rem');


      } else if (obj?.objType === 'free-drawing') {
        obj.set('lockMovementX', true);
        obj.set('lockMovementY', true);
        obj.set('cornerStrokeColor', 'red');
        obj.set('borderColor', 'red');
        obj.set('cornerColor', '#87CEFA');
        obj.set('lockScalingX', true);
        obj.set('lockScalingY', true);
        obj.set('lockRotation', true);
        obj.set('selectMe', false);

        helperData.scope.canvas.discardActiveObject();

        let allFreeDrawLockIconIndication: any = new Image();
        allFreeDrawLockIconIndication.src = 'assets/img/lock-pin-icon.svg';
        let allFreeDrawPinIconIndication;
        let centerPosObjX = (obj.aCoords.tl.x + obj.aCoords.tr.x) / 2;
        let centerPosObjY = (obj.aCoords.tl.y + obj.aCoords.tr.y) / 2;

        allFreeDrawPinIconIndication = new fabric.Image(
          allFreeDrawLockIconIndication
        );
        allFreeDrawPinIconIndication.set({
          UID: obj.UID,
          left: centerPosObjX,
          top: centerPosObjY,
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
        helperData.scope.canvas.add(allFreeDrawPinIconIndication);

       if(!forContainer){ helperData.scope.canvas.setActiveObject(objects);
        helperData.scope.canvas.renderAll();

        let allFreeDrawing = selectedObjectsToolbarGenerator(objects,helperData);
        allFreeDrawing.css({ 'background-color': '#FA8072' });
        toolbarPosHandler(allFreeDrawing, objects, helperData.scope.currentRatio,helperData);}

        $(`div[id=${obj.UID}]`).find('.stroke-width-1').css('display', 'none');
        $(`div[id=${obj.UID}]`).find('.stroke-width-2').css('display', 'none');
        $(`div[id=${obj.UID}]`).find('.stroke-width-3').css('display', 'none');
        $(`div[id=${obj.UID}]`).find('.stroke-width-4').css('display', 'none');
        $(`div[id=${obj.UID}]`)
          .find('.freedrawing-toolbar-colorpicker')
          .css('display', 'none');
        $(`div[id=${obj.UID}]`).css({ width: '3rem' });
        $(`div[id=${obj.UID}]`).css({
          'background-color': '#FA8072',
        });
      }else if(obj?.objType === 'straight-arrow-line' || obj?.objType === 'z-arrow-line'){
        const [start,end] = getTwoArrowHeads(obj,helperData);
        obj.set('lockMovementX', true);
        obj.set('lockMovementY', true);
        obj.set('cornerStrokeColor', 'red');
        obj.set('borderColor', 'red');
        obj.set('cornerColor', '#87CEFA');
        obj.set('lockScalingX', true);
        obj.set('lockScalingY', true);
        obj.set('lockRotation', true);
        obj.set('selectMe', false);
        start && start.set('selectMe',false)
        end && end.set('selectMe',false)
        updateArrowToolbarLockStatus(obj,helperData)
      }
    });
  }

export const selectedObjectsToolbarGenerator = (objects,helperData) => {
    const {$,fabric} = helperData
    // Drawing Div Element
    let mainDrawingDiv = $('.canvas-container');
    let objectsToolbar = $(`<div class='objects-toolbar'></div>`);
    // Shape Toolbar Lock Element
    let shapeToolbarLockIcon = $(`<div role="button"></div>`).css({
      width: '3rem',
    });
    let shapeToolbarLockIconDiv = $(`<div class="d-flex h-100 center"></div>`);
    shapeToolbarLockIconDiv.click(() => {
      $('.link-collapse').collapse('hide');
      if (objects) {
        if (objects.get('lockMovementX', 'lockMovementY') == false) {
          objects.set('lockMovementX', true);
          objects.set('lockMovementY', true);
          objects.set('cornerStrokeColor', 'red');
          objects.set('borderColor', 'red');
          objects.set('cornerColor', '#87CEFA');
          objects.set('lockScalingX', true);
          objects.set('lockScalingY', true);
          objects.set('lockRotation', true);
          shapeToolbarLockIconDiv.css({ 'background-color': '#FA8072' });
          setAllSelectedObjectNonActionable(objects,helperData);
          helperData.scope.canvas.requestRenderAll();
          emitSelectedAllObjectsLockStatus(objects,helperData);
        } else {
          objects.set('lockMovementX', false);
          objects.set('lockMovementY', false);
          objects.set('cornerStrokeColor', '#137EF9');
          objects.set('borderColor', '#137EF9');
          objects.set('cornerColor', '#87CEFA');
          objects.set('lockScalingX', false);
          objects.set('lockScalingY', false);
          objects.set('lockRotation', false);
          shapeToolbarLockIconDiv.css({ 'background-color': 'white' });
          setAllSelectedObjectActionable(objects,helperData);
          helperData.scope.canvas.requestRenderAll();
          emitSelectedAllObjectsLockStatus(objects,helperData);
        }
        // updateCanvasState();
        helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
        helperData.scope.canvas.renderAll();
      }
    });
    let shapeToolbarLockIconImg = $(
      '<img src="assets/img/lock-icon.svg"></img>'
    ).css({ width: '1.4rem' });
    if (objects.selectMe == false) {
      shapeToolbarLockIconDiv.css({ 'background-color': '#FA8072' });
      shapeToolbarLockIconDiv.click(() => {
        objects.set('lockMovementX', false);
        objects.set('lockMovementY', false);
        objects.set('cornerStrokeColor', '#137EF9');
        objects.set('borderColor', '#137EF9');
        objects.set('cornerColor', '#87CEFA');
        objects.set('lockScalingX', false);
        objects.set('lockScalingY', false);
        objects.set('lockRotation', false);
        objects.set('selectMe', false);
        shapeToolbarLockIconDiv.css({ 'background-color': 'white' });
        setAllSelectedObjectActionable(objects,helperData);
        helperData.scope.canvas.requestRenderAll();
        emitSelectedAllObjectsLockStatus(objects,helperData);
      });
    }
    shapeToolbarLockIconDiv.append(shapeToolbarLockIconImg);
    shapeToolbarLockIcon.append(shapeToolbarLockIconDiv);

    objectsToolbar.append(shapeToolbarLockIcon);

    mainDrawingDiv.append(objectsToolbar);
    return objectsToolbar;
  }