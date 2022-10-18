import {
  getTwoArrowHeads,
  handleChangeOfArrowHeads,
  modifiedOnUserCollaborationArrowHandler,
  moveEveryArrowUpInTheStack,
  moveEveryControlPointUpInTheStack,
  moveOnUserCollaborationArrowHandler,
  resizeStraightArrowOnCollab,
  resizeZArrowOnCollab,
  updateAllStraightArrowPoints,
} from '../helper-function/arrow-helper';
import {
  designToolbarHideHandler,
  getObjectById,
  getUIDList,
  hideObjectToolbar,
  hideParticularObjectToolbarById,
  isObjectIsShape,
  objectOnCanvasExistOrNot,
  removeCanvasObjects,
  removeObjectById,
  removeParticularObjectTextEditingMode,
  setPlaceHolderForTextBox,
  updateArrowToolbarLockStatus,
  updateFreeDrawingToolbarState,
  updateImageToolbarState,
  updateShapeToolbarState,
} from '../helper-function/general-helper';
import { retrieveObjectHandler } from '../helper-function/recreate-objects';
import { reCreateCircle } from '../objects/circle';
import { reCreateOneByOneContainer } from '../objects/container-onebyone';
import { reCreateDiamond } from '../objects/diamond';
import { drawingObjectRetriever } from '../objects/free-drawing';
import { reCreateGif } from '../objects/gif-upload';
import { reCreateHexagon } from '../objects/hexagon';
import { reCreateUploadImg } from '../objects/image-upload';
import { reCreateRectangle } from '../objects/rectangle';
import { reCreateSquare } from '../objects/square';
import { reCreateStar } from '../objects/star';
import { reCreateStraightTypeArrow } from '../objects/straight-arrow';
import { reCreateTriangle } from '../objects/triangle';
import { reCreateZTypeArrow } from '../objects/z-arrow';


export const onCreatedArrow = (data, helperData) => {
  const isArrowExists = data.every((obj) => {
    return objectOnCanvasExistOrNot(obj.UID, obj.objType, helperData);
  });
  if (!isArrowExists) {
    if (data[0]?.objType === 'straight-arrow-line') {
      reCreateStraightTypeArrow(data, helperData);
    } else if (data[0]?.objType === 'z-arrow-line') {
      reCreateZTypeArrow(data, helperData);
    }
  }
};
export const onMovedArrow = (data, helperData) => {
 
  
  hideParticularObjectToolbarById(data[0].UID, helperData);
  moveOnUserCollaborationArrowHandler(data, helperData);
};

export const onModifiedArrow = (data, helperData) => {
  modifiedOnUserCollaborationArrowHandler(data, helperData);
};

export const onArrowHeadChange = (data, helperData) => {
  handleChangeOfArrowHeads(data, helperData);
  moveEveryControlPointUpInTheStack(helperData);
  helperData.scope.canvas.requestRenderAll();
};

export const onArrowResize = (data, helperData) => {
  hideParticularObjectToolbarById(data.objects[0].UID, helperData);
  if (data.objects[0]?.objType === 'straight-arrow-line') {
    resizeStraightArrowOnCollab(data, helperData);
  } else if (data.objects[0]?.objType === 'z-arrow-line') {
    resizeZArrowOnCollab(data, helperData);
  }
};

export const onArrowConverted = (data, helperData) => {
  const { $ } = helperData;
  removeObjectById(data[0].UID, helperData);
  $(`div[id=${data[0].UID}]`).remove();
  if (data[0]?.objType === 'straight-arrow-line') {
    reCreateStraightTypeArrow(data, helperData);
  } else if (data[0]?.objType === 'z-arrow-line') {
    reCreateZTypeArrow(data, helperData);
  }
};

export const onSelectedAllObjectMouseDown = (data, helperData) => {
  data.forEach((obj) => {
    helperData.scope.canvas.getObjects().forEach((ob) => {
      if (ob?.UID === obj?.UID && ob?.objType === obj?.objType) {
        helperData.scope.canvas.bringToFront(ob);
      }
    });
  });
  helperData.scope.canvas.requestRenderAll();
};

export const onSelectedAllObjectsLockStatus = (data, helperData) => {
  const { $, fabric } = helperData;
  helperData.scope.canvas.discardActiveObject();
  let allData = [];
  data.forEach((obj) => {
    helperData.scope.canvas.getObjects().forEach((ob) => {
      if (ob?.UID === obj?.UID && ob?.objType === obj?.objType) {
        allData.push(ob);
      }
    });
  });
  if (data[0]?.lockMovementX) {
    allData.forEach((obj) => {
      if (isObjectIsShape(obj) || obj?.objType === 'container-rect') {
        let text = allData.find(
          (ob) => ob?.UID === obj?.UID && ob?.type === 'textbox'
        );
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

        if (obj?.objType === 'area-shape') {
          text.set('lockMovementX', true);
          text.set('lockMovementY', true);
        }
        if (obj?.objType === 'container-rect') {
          let line = objectOnCanvasExistOrNot(
            obj?.UID,
            'container-line',
            helperData
          );
          line.set('selectMe', false);
        }
        $(`div[id=${obj.UID}]`)
          .find('.shape-toolbar-logo')
          .css('display', 'none');
        $(`div[id=${obj.UID}]`)
          .find('.shape-toolbar-color-changer')
          .css('display', 'none');
        $(`div[id=${obj.UID}]`)
          .find('.shape-font-family')
          .css('display', 'none');
        $(`div[id=${obj.UID}]`).find('.shape-font-size').css('display', 'none');
        $(`div[id=${obj.UID}]`)
          .find('.shape-bold-italic')
          .css('display', 'none');
        $(`div[id=${obj.UID}]`)
          .find('.shape-attach-link')
          .css('display', 'none');
        $(`div[id=${obj.UID}]`)
          .find('.shape-background-color')
          .css({ 'background-color': '#FA8072' });
        $(`div[id=${obj.UID}]`).css('display', 'none');
        $(`div[id=${obj.UID}]`).css('width', '6rem');
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
      } else if (
        obj?.objType === 'straight-arrow-line' ||
        obj?.objType === 'z-arrow-line'
      ) {
        const [start, end] = getTwoArrowHeads(obj, helperData);
        obj.set('lockMovementX', true);
        obj.set('lockMovementY', true);
        obj.set('cornerStrokeColor', 'red');
        obj.set('borderColor', 'red');
        obj.set('cornerColor', '#87CEFA');
        obj.set('lockScalingX', true);
        obj.set('lockScalingY', true);
        obj.set('lockRotation', true);
        obj.set('selectMe', false);
        start && start.set('selectMe', false);
        end && end.set('selectMe', false);
        updateArrowToolbarLockStatus(obj, helperData);
      }
    });
  } else {
    allData.forEach((obj) => {
      if (isObjectIsShape(obj) || obj?.objType === 'container-rect') {
        let text = allData.find(
          (ob) => ob?.UID === obj?.UID && ob?.type === 'textbox'
        );
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

        if (obj?.objType === 'area-shape') {
          text.set('lockMovementX', false);
          text.set('lockMovementY', false);
        }
        if (obj?.objType === 'container-rect') {
          let line = objectOnCanvasExistOrNot(
            obj?.UID,
            'container-line',
            helperData
          );
          line.set('selectMe', true);
        }
        let toolbarWidth = obj?.objType === 'area-shape' ? '39rem' : '45rem';
        $(`div[id=${obj.UID}]`)
          .find('.shape-toolbar-logo')
          .css('display', 'block');
        $(`div[id=${obj.UID}]`)
          .find('.shape-toolbar-color-changer')
          .css('display', 'block');
        $(`div[id=${obj.UID}]`)
          .find('.shape-font-family')
          .css('display', 'block');
        $(`div[id=${obj.UID}]`)
          .find('.shape-font-size')
          .css('display', 'block');
        $(`div[id=${obj.UID}]`)
          .find('.shape-bold-italic')
          .css('display', 'block');
        $(`div[id=${obj.UID}]`)
          .find('.shape-attach-link')
          .css('display', 'block');
        $(`div[id=${obj.UID}]`)
          .find('.shape-background-color')
          .css({ 'background-color': 'white' });
        $(`div[id=${obj.UID}]`).css('display', 'none');
        $(`div[id=${obj.UID}]`).css('width', toolbarWidth);
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
      } else if (
        obj?.objType === 'straight-arrow-line' ||
        obj?.objType === 'z-arrow-line'
      ) {
        const [start, end] = getTwoArrowHeads(obj, helperData);
        obj.set('lockMovementX', false);
        obj.set('lockMovementY', false);
        obj.set('cornerStrokeColor', '#137EF9');
        obj.set('borderColor', '#137EF9');
        obj.set('cornerColor', '#87CEFA');
        obj.set('lockScalingX', false);
        obj.set('lockScalingY', false);
        obj.set('lockRotation', false);
        obj.set('selectMe', true);
        start && start.set('selectMe', true);
        end && end.set('selectMe', true);
        updateArrowToolbarLockStatus(obj, helperData);
      }
    });
  }
};

export const onCommentedObject = (data, helperData) => {
  const { $ } = helperData;
  if (isObjectIsShape(data[0])) {
    let shape = helperData.scope.canvas
      .getObjects()
      .find((ob) => ob?.UID === data[0].UID && ob?.objType === data[0].objType);
    let text = helperData.scope.canvas
      .getObjects()
      .find((ob) => ob?.UID === data[0].UID && ob?.type === 'textbox');
    helperData.scope.canvas.remove(shape);
    helperData.scope.canvas.remove(text);
    $(`div[id=${shape.UID}]`).remove();
    retrieveObjectHandler(data, true, helperData);
  } else if (data[0]?.objType === 'container-rect') {
    let shape = helperData.scope.canvas
      .getObjects()
      .find((ob) => ob?.UID === data[0].UID && ob?.objType === data[0].objType);
    let text = helperData.scope.canvas
      .getObjects()
      .find((ob) => ob?.UID === data[0].UID && ob?.type === 'textbox');
    let line = helperData.scope.canvas
      .getObjects()
      .find(
        (ob) => ob?.UID === data[0].UID && ob?.objType === 'container-line'
      );
    helperData.scope.canvas.remove(shape);
    helperData.scope.canvas.remove(text);
    helperData.scope.canvas.remove(line);
    $(`div[id=${shape.UID}]`).remove();
    reCreateOneByOneContainer(data, null, helperData);
  } else if (data[0]?.objType === 'uploaded-img') {
    let image = helperData.scope.canvas
      .getObjects()
      .find((ob) => ob?.UID === data[0].UID && ob?.objType === data[0].objType);
    helperData.scope.canvas.remove(image);
    $(`div[id=${image.UID}]`).remove();
    reCreateUploadImg(data[0], helperData);
  } else if (data[0]?.objType === 'uploaded-gif') {
    let gif = helperData.scope.canvas
      .getObjects()
      .find((ob) => ob?.UID === data[0].UID && ob?.objType === data[0].objType);
    helperData.scope.canvas.remove(gif);
    $(`div[id=${gif.UID}]`).remove();
    reCreateGif(data[0], helperData);
  }
};

export const onObjectImageAdded = (data, helperData) => {
  let image = helperData.scope.canvas
    .getObjects()
    .find((ob) => ob?.UID === data.UID);
  if (!image) {
    if (data.objType === 'uploaded-img') {
      reCreateUploadImg(data, helperData);
      helperData.scope.canvas.requestRenderAll();
    } else if (data.objType === 'uploaded-gif') {
      reCreateGif(data, helperData);
      helperData.scope.canvas.requestRenderAll();
    }
  }
  helperData.scope.canvas.getObjects().forEach((obj) => {
    if (obj?.objType === 'friend-group') {
      helperData.scope.canvas.bringToFront(obj);
    }
  });
};

export const onObjectImageRotated = (data, helperData) => {
  let image = helperData.scope.canvas
    .getObjects()
    .find((ob) => ob?.UID === data.UID);
  if (image) {
    hideObjectToolbar(image, helperData);
    Object.keys(data).forEach((key) => {
      image.set(key, data[key]);
    });
    image.setCoords();
    helperData.scope.canvas.requestRenderAll();
  }
  helperData.scope.canvas.getObjects().forEach((obj) => {
    if (obj?.objType === 'friend-group') {
      helperData.scope.canvas.bringToFront(obj);
    }
  });
};

export const onObjectImageMoving = (data, helperData) => {
  const { $ } = helperData;
  if (data.objType === 'uploaded-gif') return;
  let image = helperData.scope.canvas
    .getObjects()
    .find((ob) => ob?.UID === data.UID);
  if (image) {
    hideObjectToolbar(image, helperData);
    image.set({ top: data.top, left: data.left, angle: data.angle });
    $(`div[id=${image.UID}]`).css('display', 'none');
    helperData.scope.canvas.requestRenderAll();
  }
};

export const onObjectImageModifying = (data, helperData) => {
  const { fabric } = helperData;
  let image = helperData.scope.canvas
    .getObjects()
    .find((ob) => ob?.UID === data.UID);
  if (image) {
    Object.keys(data).forEach((key) => {
      image.set(key, data[key]);
    });

    let imageLockIconIndication = document.createElement('img');
    imageLockIconIndication.src = 'assets/img/lock-pin-icon.svg';
    let imagePinIconIndication;

    if (image.lockMovementX == true) {
      let centerPos = image.getCenterPoint();
      imagePinIconIndication = new fabric.Image(imageLockIconIndication);
      imagePinIconIndication.set({
        UID: image.UID,
        left: centerPos.x,
        top: image.aCoords.tl.y + 10,
        objType: 'lock-Indication',
        originX: 'center',
        originY: 'center',
        lockScalingFlip: true,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
      });
      helperData.scope.canvas.add(imagePinIconIndication);
    } else {
      let shapeLockIcon = helperData.scope.canvas
        .getObjects()
        .find(
          (obj) => image.UID === obj.UID && obj.objType === 'lock-Indication'
        );
      helperData.scope.canvas.remove(shapeLockIcon);
    }

    image.setCoords();
    helperData.scope.canvas.requestRenderAll();
    updateImageToolbarState(image, helperData);
  }
  helperData.scope.canvas.getObjects().forEach((obj) => {
    if (obj?.objType === 'friend-group') {
      helperData.scope.canvas.bringToFront(obj);
    }
  });
};

export const onObjectMouseDown = (data, helperData) => {
  if (helperData.scope.canvas.getActiveObject()?.objType === 'selected-all') {
    helperData.scope.canvas.discardActiveObject();
  }
  let filteredData = helperData.scope.canvas
    .getObjects()
    .filter((obj) => obj?.UID === data.UID);
  filteredData.forEach((ob) => {
    helperData.scope.canvas.bringToFront(ob);
  });
  helperData.scope.canvas.getObjects().forEach((obj) => {
    if (obj?.objType === 'friend-group') {
      helperData.scope.canvas.bringToFront(obj);
    }
  });
  helperData.scope.canvas.requestRenderAll();
};

export const onObjectAdd = (data, helperData) => {
  const objList = helperData.scope.canvas.getObjects();
  if (data?.objType === 'container') {
    reCreateOneByOneContainer(data.objects, null, helperData);
    helperData.scope.canvas.getObjects().forEach((obj) => {
      if (obj?.objType === 'friend-group') {
        helperData.scope.canvas.bringToFront(obj);
      }
    });
    return;
  }
  if (objList.length == 0) {
    if (data[0]?.objType === 'free-drawing') {
      drawingObjectRetriever(data[0], helperData);
    } else {
      if (isObjectIsShape(data[0])) {
        retrieveObjectHandler(data, true, helperData);
      } else {
        retrieveObjectHandler(data[0], true, helperData);
      }
    }
  } else {
    const UIDList = getUIDList(objList);
    if (!UIDList.includes(data[0].UID)) {
      if (data[0]?.objType === 'free-drawing') {
        drawingObjectRetriever(data[0], helperData);
      } else {
        if (isObjectIsShape(data[0])) {
          retrieveObjectHandler(data, true, helperData);
        } else {
          retrieveObjectHandler(data[0], true, helperData);
        }
      }
    }
  }
  helperData.scope.canvas.getObjects().forEach((obj) => {
    if (obj?.objType === 'friend-group') {
      helperData.scope.canvas.bringToFront(obj);
    }
  });
};

export const onObjectMoving = (data, helperData) => {
  const { $, fabric } = helperData;
  if (data?.objType === 'free-drawing') {
    let freeDrawing = objectOnCanvasExistOrNot(
      data.UID,
      data.objType,
      helperData
    );
    freeDrawing.top = data.top;
    freeDrawing.left = data.left;
    hideObjectToolbar(freeDrawing, helperData);
    helperData.scope.canvas.requestRenderAll();
    return;
  }
  if (data?.allObjects) {
    helperData.scope.canvas.discardActiveObject();
    let allData = [];
    data?.allObjects.forEach((obj) => {
      helperData.scope.canvas.getObjects().forEach((ob) => {
        if (ob?.UID === obj?.UID && ob?.objType === obj?.objType) {
          allData.push(ob);
          hideObjectToolbar(ob, helperData);
        }
      });
    });

    let allObjects = new fabric.ActiveSelection(allData, {
      canvas: helperData.scope.canvas,
    });
    helperData.scope.canvas.setActiveObject(allObjects);
    allObjects.top = data.top;
    allObjects.left = data.left;
    helperData.scope.canvas.discardActiveObject();
    helperData.scope.canvas.renderAll();
    updateAllStraightArrowPoints(helperData);
    return;
  }
  if (isObjectIsShape(data[0])) {
    let shapeObject = helperData.scope.canvas
      .getObjects()
      .find((ob) => ob.UID === data[0].UID);
    let textObject = helperData.scope.canvas
      .getObjects()
      .find((ob) => ob.UID === data[0].UID && ob?.type === 'textbox');
    hideObjectToolbar(shapeObject, helperData);
    let allObjects = new fabric.ActiveSelection([shapeObject, textObject], {
      canvas: helperData.scope.canvas,
    });
    allObjects.notAllowed = 'not-select';
    helperData.scope.canvas.setActiveObject(allObjects);
    allObjects.originX = 'center';
    allObjects.originY = 'center';
    allObjects.top = data[0]?.top;
    allObjects.left = data[0]?.left;
    helperData.scope.canvas.discardActiveObject();
    helperData.scope.canvas.requestRenderAll();
    return;
  }

  if (data?.groupObjects) {
    let allObjects = [];
    helperData.scope.canvas.getObjects().forEach((obj) => {
      data.groupObjects.forEach((ob) => {
        if (ob?.UID === obj?.UID && ob?.objType === obj?.objType) {
          allObjects.push(obj);
        }
      });
    });

    let container = allObjects.find((ob) => ob.objType === 'container-rect');
    let text = allObjects.find((ob) => ob.objType === 'container-text');
    let line = allObjects.find((ob) => ob.objType === 'container-line');
    helperData.scope.canvas.bringToFront(container);
    helperData.scope.canvas.bringToFront(text);
    helperData.scope.canvas.bringToFront(line);

    $(`div[id=${container.UID}]`).css('display', 'none');
    allObjects.forEach((obj) => {
      if (
        obj !== 'container-rect' &&
        obj !== 'container-text' &&
        obj !== 'container-line'
      ) {
        helperData.scope.canvas.bringToFront(obj);
        hideObjectToolbar(obj, helperData);
      }
    });
    helperData.scope.canvas.getObjects().forEach((obj) => {
      if (obj?.objType === 'friend-group') {
        helperData.scope.canvas.bringToFront(obj);
      }
      if (obj.lockMovementX == true) {
        let lockIndictionIcon = helperData.scope.canvas
          .getObjects()
          .find(
            (object) =>
              obj.UID === object.UID && object?.objType === 'lock-Indication'
          );
        helperData.scope.canvas.bringToFront(lockIndictionIcon);
      }
    });
    let finalObjects = allObjects.filter((ob) => ob.selectMe);
    if (finalObjects.length > 0) {
      let allShape = new fabric.ActiveSelection(finalObjects, {
        canvas: helperData.scope.canvas,
      });
      allShape.notAllowed = 'not-select';
      helperData.scope.canvas.setActiveObject(allShape);
      allShape.left = data.left;
      allShape.top = data.top;
      helperData.scope.canvas.discardActiveObject();
      helperData.scope.canvas.renderAll();
    }
    moveEveryArrowUpInTheStack(helperData);
    helperData.scope.canvas.getObjects().forEach((obj) => {
      if (
        obj?.objType !== 'container-rect' &&
        obj?.objType !== 'container-text' &&
        obj?.objType !== 'container-line'
      ) {
        helperData.scope.canvas.bringToFront(obj);
      }
    });
  }
};

export const onCanvasZoom = (data, helperData) => {
  const { fabric, $ } = helperData;
  if (data.zoomIn) {
    let zoom = helperData.scope.canvas.getZoom();
    zoom = zoom + 0.1;
    if (zoom > 2) zoom = 2;
    let xPos = data.xPos;
    let yPos = data.yPos;

    helperData.scope.canvas.zoomToPoint(new fabric.Point(xPos, yPos), zoom);
    helperData.scope.canvas.renderAll();
    helperData.scope.canvas.calcOffset();
    designToolbarHideHandler(helperData);
    helperData.scope.zoomPercentage = Math.floor(zoom * 100);
  } else {
    let zoom = helperData.scope.canvas.getZoom();
    zoom = zoom - 0.1;
    if (zoom < 0.05) zoom = 0.05;
    let xPos = data.xPos;
    let yPos = data.yPos;
    helperData.scope.canvas.zoomToPoint(new fabric.Point(xPos, yPos), zoom);
    helperData.scope.canvas.renderAll();
    helperData.scope.canvas.calcOffset();

    helperData.scope.zoomPercentage = Math.floor(zoom * 100);
    designToolbarHideHandler(helperData);
  }
  if (data.changedZoom) {
    let changedZoom = data.zoomValue;
    if (changedZoom >= 2) {
      changedZoom = 2;
      $('.zoom-input-handler').val('200');
    }
    if (changedZoom <= 0.05) {
      changedZoom = 0.05;
      $('.zoom-input-handler').val('5');
    }
    helperData.scope.zoomPercentage = JSON.stringify(changedZoom * 100).split(
      '.'
    )[0];
    let xPos = data.xPos;
    let yPos = data.yPos;
    $('.canvas-content')[0].scrollTop +
      window.innerHeight -
      window.innerHeight / 2;
    helperData.scope.canvas.zoomToPoint(
      new fabric.Point(xPos, yPos),
      changedZoom
    );

    helperData.scope.canvas.renderAll();
    helperData.scope.canvas.calcOffset();
  }
};

export const onObjectRemove = (data, helperData) => {
  const object = getObjectById(data, helperData);
  if (object) {
    removeParticularObjectTextEditingMode(object, helperData);
    removeCanvasObjects(object, helperData);
    helperData.scope.canvas.discardActiveObject();
  }
};

export const onMouseMove = (data, helperData) => {
  const {  fabric } = helperData;
  let currentId = data.session_id;
  let userCursorAlreadyExists = helperData.scope.friendsCursorPointer.find(
    (id) => id === currentId
  );

  if (userCursorAlreadyExists) {
    let cursor = helperData.scope.canvas
      .getObjects()
      .find((ob) => ob?.UID === currentId && ob?.objType === 'friend-group');
    if (!cursor) return;
    cursor.set({ left: data.coords.x, top: data.coords.y });
    cursor.setCoords();
    helperData.scope.canvas.bringToFront(cursor);
    helperData.scope.canvas.requestRenderAll();
  } else {
    helperData.scope.friendsCursorPointer.push(currentId);
    let userCursor: any = new Image();
    userCursor.src = 'assets/img/cursor.svg';
    userCursor.onload = () => {
      let image = new fabric.Image(userCursor);
      image
        .set({
          UID: currentId,
          left: data.coords.x,
          top: data.coords.y,
          objType: 'friend-cursor',
          selectMe: false,
          noScaleCache: false,
          strokeUniform: true,
          matchedLine: false,
          lockScalingFlip: true,
          selectable: false,
        })
        .scale(0.65);
      let coords = image.aCoords;
      let rect = new fabric.Rect({
        UID: currentId,
        width: 100,
        height: 35,
        stroke: 'white',
        strokeWidth: 1,
        realStroke: '1',
        noScaleCache: false,
        strokeUniform: true,
        objType: 'friend-cursor-container',
        top: coords.br.y,
        left: coords.br.x,
        borderType: 'straight',
        lockScalingFlip: true,
        matchedLine: false,
        selectable: false,
        fill: data.color,
        rx: 5,
        ry: 5,
      });
      let centerPos = rect.getCenterPoint();
      let text = new fabric.Textbox(data.name, {
        UID: currentId,
        top: centerPos.y,
        left: centerPos.x,
        fontFamily: 'Arial',
        // stroke: 'black',
        fill: 'white',
        width: rect.width,
        height: rect.height,
        fontSize: 16,
        actualFontSize: '20',
        fontWeight: 'normal',
        noScaleCache: false,
        textAlign: 'center',
        objType: 'friend-cursor-text',
        selectMe: false,
        originX: 'center',
        originY: 'center',
        hasControls: false,
        hasBorders: false,
        borderColor: 'yellow',
        matchedLine: false,
        selectable: false,
      });
      let friendGroup = new fabric.Group([image, rect, text], {
        UID: currentId,
        left: data.coords.x,
        top: data.coords.y,
        objType: 'friend-group',
        matchedLine: false,
        selectable: false,
        selectMe: false,
        // ignoreZoom: true
      });
      helperData.scope.canvas.add(friendGroup);
      helperData.scope.canvas.requestRenderAll();
    };
  }
};

export const onObjectShapeChange = (data,helperData) => {
    if (data[1] === 'triangle') {
      reCreateTriangle(data[0],false,helperData);
    } else if (data[1] === 'circle') {
      reCreateCircle(data[0],false,helperData);
    } else if (data[1] === 'square') {
      reCreateSquare(data[0],false,helperData);
    } else if (data[1] === 'rect') {
      reCreateRectangle(data[0],false,helperData);
    } else if (data[1] === 'polygon') {
      reCreateHexagon(data[0],false,helperData);
    } else if (data[1] === 'star') {
      reCreateStar(data[0],false,helperData);
    } else if (data[1] === 'diamond') {
      reCreateDiamond(data[0],false,helperData);
    }
    helperData.scope.canvas.requestRenderAll();
  }

export const  onObjectModify = (data,helperData)=> {
    const {fabric} =  helperData
    const object = getObjectById(data[0].UID,helperData);
    if (
      isObjectIsShape(data[0])
    ) {
      let shapeObj = objectOnCanvasExistOrNot(
        data[0].UID,
        data[0].objType,
        helperData
      );

      let textObj;
      if(data.length==2)
      {
  
        textObj = objectOnCanvasExistOrNot(data[1].UID, data[1].objType,helperData);
        Object.keys(data[0]).forEach((key) => {
          shapeObj.set(key, data[0][key]);
        });
        Object.keys(data[1]).forEach((key) => {
          textObj.set(key, data[1][key]);
        });
      }
    

      let shapeLockIconIndication = document.createElement('img');
      shapeLockIconIndication.src = 'assets/img/lock-pin-icon.svg';
      let shapePinIconIndication;

      if (data[0].lockMovementX == true) {
        let centerPosX = (shapeObj.aCoords.tl.x + shapeObj.aCoords.tr.x) / 2;
        let centerPosY = (shapeObj.aCoords.tl.y + shapeObj.aCoords.tr.y) / 2;
        shapePinIconIndication = new fabric.Image(shapeLockIconIndication);
        shapePinIconIndication.set({
          UID: shapeObj.UID,
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
        });
        helperData.scope.canvas.add(shapePinIconIndication);
      } else {
        let shapeLockIcon = helperData.scope.canvas
          .getObjects()
          .find(
            (obj) =>
              data[0].UID === obj.UID && obj.objType === 'lock-Indication'
          );
        helperData.scope.canvas.remove(shapeLockIcon);
      }

      shapeObj.setCoords();
      textObj.setCoords();
      helperData.scope.canvas.requestRenderAll();
      updateShapeToolbarState(shapeObj, textObj,helperData);
      return;
    } else if (data[0]?.objType === 'container-rect') {
      let shapeObj = objectOnCanvasExistOrNot(
        data[0].UID,
        data[0].objType,
        helperData
      );
      let textObj = objectOnCanvasExistOrNot(data[1].UID, data[1].objType,helperData);
      let lineObj = objectOnCanvasExistOrNot(data[2].UID, data[2].objType,helperData);

      Object.keys(data[0]).forEach((key) => {
        shapeObj.set(key, data[0][key]);
      });

      let shapeLockIconIndication = document.createElement('img');
      shapeLockIconIndication.src = 'assets/img/lock-pin-icon.svg';
      let shapePinIconIndication;
      if (data[0].lockMovementX == true) {
        let centerPos = shapeObj.getCenterPoint();
        shapePinIconIndication = new fabric.Image(shapeLockIconIndication);
        shapePinIconIndication.set({
          UID: shapeObj.UID,
          left: centerPos.x,
          top: shapeObj.aCoords.tl.y + 10,
          objType: 'lock-Indication',
          originX: 'center',
          originY: 'center',
          lockScalingFlip: true,
          lockMovementX: true,
          lockMovementY: true,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
        });
        helperData.scope.canvas.add(shapePinIconIndication);
      } else {
        let shapeLockIcon = helperData.scope.canvas
          .getObjects()
          .find(
            (obj) =>
              data[0].UID === obj.UID && obj.objType === 'lock-Indication'
          );
        helperData.scope.canvas.remove(shapeLockIcon);
      }

      shapeObj.setCoords();
      Object.keys(data[2]).forEach((key) => {
        lineObj.set(key, data[2][key]);
      });
      let rectLine = shapeObj.height / 12;
      let x1 = shapeObj.left;
      let y1 = shapeObj.top + rectLine;
      let x2 = shapeObj.aCoords.tr.x;
      let y2 = shapeObj.top + rectLine;
      lineObj.set({ x1, x2, y1, y2 });
      Object.keys(data[1]).forEach((key) => {
        textObj.set(key, data[1][key]);
      });
      lineObj.setCoords();
      textObj.setCoords();
      helperData.scope.canvas.requestRenderAll();
      updateShapeToolbarState(shapeObj, textObj,helperData);
      return;
    } else if (data[0]?.objects || data[0]?.objType === 'free-drawing') {
      if (object) {
        let freeObj = objectOnCanvasExistOrNot(
          data[0].UID,
          data[0].objType,
          helperData
        );
        Object.keys(data[0]).forEach((key) => {
          freeObj.set(key, data[0][key]);
        });

        let shapeLockIconIndication = document.createElement('img');
        shapeLockIconIndication.src = 'assets/img/lock-pin-icon.svg';
        let shapePinIconIndication;
        if (data[0].lockMovementX == true) {
          let centerPosX = (freeObj.aCoords.tl.x + freeObj.aCoords.tr.x) / 2;
          let centerPosY = (freeObj.aCoords.tl.y + freeObj.aCoords.tr.y) / 2;
          shapePinIconIndication = new fabric.Image(shapeLockIconIndication);
          shapePinIconIndication.set({
            UID: freeObj.UID,
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
          });
          helperData.scope.canvas.add(shapePinIconIndication);
        } else {
          let shapeLockIcon = helperData.scope.canvas
            .getObjects()
            .find((obj) => obj.UID && obj.objType === 'lock-Indication');
          helperData.scope.canvas.remove(shapeLockIcon);
        }

        helperData.scope.canvas.requestRenderAll();
        updateFreeDrawingToolbarState(freeObj,helperData);
      }
    } else if (
      data[0]?.objType === 'rect-text' ||
      data[0]?.objType === 'circle-text' ||
      data[0]?.objType === 'triangle-text' ||
      data[0]?.objType === 'star-text' ||
      data[0]?.objType === 'square-text' ||
      data[0]?.objType === 'hexa-text' ||
      data[0]?.objType === 'dia-text' ||
      data[0]?.objType === 'sticky-text' ||
      data[0]?.objType === 'container-text' ||
      data[0]?.objType === 'area-text'
    ) {
      let findObject = helperData.scope.canvas
        .getObjects()
        .find(
          (obj) =>
            obj?.UID === data[0]?.UID && obj?.objType === data[0]?.objType
        );
      findObject.set('text', data[0].text);
      setPlaceHolderForTextBox(findObject,helperData);
    }
    helperData.scope.canvas.renderAll();
  }  

 export const  onObjectDeleteShapeChange = (data,helperData) => {
     const {$} = helperData
    let shapeObj = objectOnCanvasExistOrNot(data[0].UID, data[0].objType,helperData);
    let textObj = objectOnCanvasExistOrNot(data[1].UID, data[1].objType,helperData);
    helperData.scope.canvas.remove(shapeObj);
    $(`div[id=${shapeObj.UID}]`).remove();
    helperData.scope.canvas.remove(textObj);
  } 

 export const onObjectScalling = (data,helperData) => {
    if (
      isObjectIsShape(data[0])
    ) {
      let shapeData = helperData.scope.canvas
        .getObjects()
        .find((ob) => ob?.UID === data[0]?.UID && ob?.type === data[0]?.type);
      let textData = helperData.scope.canvas
        .getObjects()
        .find((ob) => ob?.UID === data[1]?.UID && ob?.type === data[1]?.type);
      Object.keys(data[0]).forEach((key) => {
        shapeData.set(key, data[0][key]);
      });
      Object.keys(data[1]).forEach((key) => {
        textData.set(key, data[1][key]);
      });
      shapeData.setCoords();
      textData.setCoords();
      helperData.scope.canvas.requestRenderAll();
      return;
    }

    if (data[0]?.objType === 'container-rect') {
      let shapeData = helperData.scope.canvas
        .getObjects()
        .find((ob) => ob?.UID === data[0]?.UID && ob?.type === data[0]?.type);
      let textData = helperData.scope.canvas
        .getObjects()
        .find((ob) => ob?.UID === data[1]?.UID && ob?.type === data[1]?.type);
      let lineData = helperData.scope.canvas
        .getObjects()
        .find((ob) => ob?.UID === data[2]?.UID && ob?.type === data[2]?.type);

      Object.keys(data[0]).forEach((key) => {
        shapeData.set(key, data[0][key]);
      });
      Object.keys(data[2]).forEach((key) => {
        lineData.set(key, data[2][key]);
      });
      shapeData.setCoords();
      let rectLine = shapeData.height / 12;
      let x1 = shapeData.left;
      let y1 = shapeData.top + rectLine;
      let x2 = shapeData.aCoords.tr.x;
      let y2 = shapeData.top + rectLine;
      lineData.set({ x1, x2, y1, y2 });
      Object.keys(data[1]).forEach((key) => {
        textData.set(key, data[1][key]);
      });
      shapeData.setCoords();
      lineData.setCoords();
      textData.setCoords();
      helperData.scope.canvas.requestRenderAll();
      return;
    }
  }
  
 export const onCanvasUndoRedoStatus = (data,helperData) => {
    const { objects, comments } = JSON.parse(data);
    helperData.scope.whiteboardCommentsAllData = comments;
    if (helperData.scope.whiteboardCommentsAllData.length > 0) {
      helperData.scope.noCommentShow = false;
    }
  } 
