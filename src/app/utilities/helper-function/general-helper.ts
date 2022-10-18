import { createCircle } from '../objects/circle';
import { containerOneByOne, reCreateOneByOneContainer } from '../objects/container-onebyone';
import { containerOneByTwo } from '../objects/container-onebytwo';
import { containerTwoByTwo } from '../objects/container-twobytwo';
import { createDiamond } from '../objects/diamond';
import { drawingObjectRetriever } from '../objects/free-drawing';
import { createHexagon } from '../objects/hexagon';
import { createRectangle } from '../objects/rectangle';
import { createSquare } from '../objects/square';
import { createStars } from '../objects/star';
import { createStickyNotes } from '../objects/sticky-notes';
import { reCreateStraightTypeArrow } from '../objects/straight-arrow';
import { createdText } from '../objects/textarea';
import { createTriangle } from '../objects/triangle';
import { reCreateZTypeArrow } from '../objects/z-arrow';
import { emitCanvasComments, emitCommentedObject, emitCreatedArrow, emitMovedArrow, emitObjectAdded, emitObjectImageMoving, emitObjectMoving, emitObjectRemoved } from '../socket-events/socket-emit';
import { addControlPointsForStraightArrow, addControlPointsForZArrow, connectionOfArrowOnMousedownHandler, getTwoArrowHeads, moveArrowTogetherWithShapeHandler, saveArrowPreviousMiddleControlPos, updateArrowLinePosition } from './arrow-helper';
import { backup, retrieveObjectHandler } from './recreate-objects';

export const convertCanvasDataToJson = (helperData) => {
  let savedDocument = helperData.scope.canvas.toDatalessJSON([
    'lockScalingY',
    'lockScalingX',
    'lockRotation',
    'lockMovementY',
    'lockMovementX',
    'arrowType',
    'realStroke',
    'freeDrawing',
    'objType',
    'breakWords',
    'padding',
    'cornerStrokeColor',
    'borderColor',
    'borderType',
    'strokeUniform',
    'noScaleCache',
    'actualFontSize',
    'editable',
    'type',
    'realStrokeDashArray',
    'arrowLineType',
    'uniqueIdentifier',
    'UID',
    'objreferenceLink',
    'id',
    'selectMe',
    'matchedLine',
    'framesLength',
    'delay',
    'frameWidth',
    'label',
    'identity',
    'perPixelTargetFind',
    'cpXPos',
    'cpYPos',
    'pos',
    'strokeLineJoin',
    'arrayLeft',
    'lastMiddleLeftPoint',
    'hasBorders',
    'hasControls',
    'opacity'

  ]);
  return savedDocument;
};

export const designToolbarHideHandler = (helperData) => {
  const { $ } = helperData;
  $('.main-toolbar').css('display', 'none');
  $('.image-main-toolbar').css('display', 'none');
  $('.dropdown-submenu div.dropdown-menu').css('display', 'none');
  $('.container-toolbar').css('display', 'none');
  $('.arrow-toolbar').css('display', 'none');
  $('.link-icon').css('display', 'none');
  $('.view-link').css('display', 'none');
  $('.link-collapse').collapse('hide');
  $('.freedrawing-toolbar').css('display', 'none');
  $('.gifLock').css({
    display: 'none',
  });
};

export const regularPolygonPoints = (sideCount, radius) => {
  let sweep = (Math.PI * 2) / sideCount;
  let cx = radius;
  let cy = radius;
  let points = [];
  for (let i = 0; i < sideCount; i++) {
    let x = cx + radius * Math.cos(i * sweep);
    let y = cy + radius * Math.sin(i * sweep);
    points.push({ x: x, y: y });
  }
  return points;
};

export const starPolygonPoints = (spikeCount, outerRadius, innerRadius) => {
  let cx = outerRadius;
  let cy = outerRadius;
  let sweep = Math.PI / spikeCount;
  let points = [];
  let angle = 60;

  for (let i = 0; i < spikeCount; i++) {
    let x = cx + Math.cos(angle) * outerRadius;
    let y = cy + Math.sin(angle) * outerRadius;
    points.push({ x: x, y: y });
    angle += sweep;

    x = cx + Math.cos(angle) * innerRadius;
    y = cy + Math.sin(angle) * innerRadius;
    points.push({ x: x, y: y });
    angle += sweep;
  }
  return points;
};

export const objectOnCanvasExistOrNot = (UID, objType, helperData) => {
  let object = helperData.scope.canvas
    .getObjects()
    .find((ob) => ob?.UID === UID && ob?.objType === objType);
  return object;
};

export const isObjectIsShape = (ob) => {
  return (
    ob?.objType === 'rect-shape' ||
    ob?.objType === 'circle-shape' ||
    ob?.objType === 'triangle-shape' ||
    ob?.objType === 'star-shape' ||
    ob?.objType === 'square-shape' ||
    ob?.objType === 'hexa-shape' ||
    ob?.objType === 'dia-shape' ||
    ob?.objType === 'sticky-shape' ||
    ob?.objType === 'area-shape'
  );
};

export const removeControlPoints = (helperData) => {
  helperData.scope.canvas.getObjects().forEach((ob) => {
    if (ob?.label === 'control-point') {
      saveArrowPreviousMiddleControlPos(ob, helperData);
      helperData.scope.canvas.remove(ob);
    }
  });
  helperData.scope.canvas.requestRenderAll();
};

export const isObjectIsArrow = (obj) => {
  return (
    obj?.objType === 'straight-arrow-line' ||
    obj?.objType === 'curve-arrow-line' ||
    obj?.objType === 'z-arrow-line'
  );
};

export const isObjectInGivenRegion = (
  leftPos,
  topPos,
  left,
  right,
  top,
  bottom
) => {
  return leftPos > left && leftPos < right && topPos > top && topPos < bottom;
};

export const toolbarPosHandler = (mainToolbarDiv, group, rt, helperData) => {
  const { fabric } = helperData;

  let toolbarWidth = parseInt(mainToolbarDiv.css('width').split('p')[0]);
  let toolbarHeight = parseInt(mainToolbarDiv.css('height').split('p')[0]);
  let centerPos = fabric.util.transformPoint(
    new fabric.Point(group.getCenterPoint().x, group.getCenterPoint().y),
    helperData.scope.canvas.viewportTransform
  );
  let objectTopLeft = fabric.util.transformPoint(
    new fabric.Point(group.aCoords.tl.x, group.aCoords.tl.y),
    helperData.scope.canvas.viewportTransform
  );
  let objectTopRight = fabric.util.transformPoint(
    new fabric.Point(group.aCoords.tr.x, group.aCoords.tr.y),
    helperData.scope.canvas.viewportTransform
  );
  let objectBottomLeft = fabric.util.transformPoint(
    new fabric.Point(group.aCoords.bl.x, group.aCoords.bl.y),
    helperData.scope.canvas.viewportTransform
  );
  let objectBottomRight = fabric.util.transformPoint(
    new fabric.Point(group.aCoords.br.x, group.aCoords.br.y),
    helperData.scope.canvas.viewportTransform
  );
  let maxTop = Math.max(
    objectTopLeft.y,
    objectTopRight.y,
    objectBottomLeft.y,
    objectBottomRight.y
  );
  let minTop = Math.min(
    objectTopLeft.y,
    objectTopRight.y,
    objectBottomLeft.y,
    objectBottomRight.y
  );
  let toolbarYAxisOffset = group?.objType === 'container-rect' ? 70 : 125;

  let toolbarTopPos =
    centerPos.y - (centerPos.y - minTop) - toolbarYAxisOffset * rt;
  let toolbarLeftPos = centerPos.x - toolbarWidth / 2;

  if (toolbarTopPos <= 75 * rt && toolbarLeftPos <= 75 * rt) {
    toolbarTopPos = maxTop + 100 * rt - toolbarHeight;
    toolbarLeftPos = 75 * rt;
  } else if (
    toolbarTopPos <= 75 * rt &&
    toolbarLeftPos + toolbarWidth >=
    helperData.scope.canvas.getWidth() - 50 * rt
  ) {
    toolbarTopPos = maxTop + 100 * rt - toolbarHeight;
    toolbarLeftPos =
      helperData.scope.canvas.getWidth() - 50 * rt - toolbarWidth;
  } else if (toolbarTopPos <= 75 * rt) {
    toolbarTopPos = maxTop + 100 * rt - toolbarHeight;
  } else if (toolbarLeftPos <= 75 * rt) {
    toolbarLeftPos = 75 * rt;
  } else if (
    toolbarLeftPos + toolbarWidth >=
    helperData.scope.canvas.getWidth() - 50 * rt
  ) {
    toolbarLeftPos =
      helperData.scope.canvas.getWidth() - 50 * rt - toolbarWidth;
  }

  if (
    mainToolbarDiv.css('display') !== 'flex' &&
    helperData.scope.userAccess !== 'readonly'
  ) {
    mainToolbarDiv.css({
      top: toolbarTopPos,
      left: toolbarLeftPos,
      display: 'flex',
    });
  }
};

export const hideParticularObjectToolbarById = (id, helperData) => {
  const { $ } = helperData;
  $(`div[id=${id}]`).css('display', 'none');
};

export const removeObjectById = (id, helperData) => {
  helperData.scope.canvas.getObjects().forEach((obj) => {
    if (obj?.UID === id) {
      helperData.scope.canvas.remove(obj);
    }
  });
  helperData.scope.canvas.requestRenderAll();
};

export const updateArrowToolbarForLockedObject = (arrow, helperData) => {
  const { $ } = helperData;
  $(`div[id=${arrow.UID}]`).find('.arrow-color-section').css('display', 'none');
  $(`div[id=${arrow.UID}]`)
    .find('.arrow-dashing-section')
    .css('display', 'none');
  $(`div[id=${arrow.UID}]`)
    .find('.arrow-strokewidth-section')
    .css('display', 'none');
  $(`div[id=${arrow.UID}]`).find('.arrow-bend-section').css('display', 'none');
  $(`div[id=${arrow.UID}]`).find('.arrow-left-section').css('display', 'none');
  $(`div[id=${arrow.UID}]`).find('.arrow-right-section').css('display', 'none');
  $(`div[id=${arrow.UID}]`)
    .find('.arrow-lock-section')
    .css({ 'background-color': '#FA8072' });
  $(`div[id=${arrow.UID}]`).css('display', 'none');
  $(`div[id=${arrow.UID}]`).css('width', '4rem');
};

export const updateArrowToolbarForUnLockedObject = (arrow, helperData) => {
  const { $ } = helperData;
  $(`div[id=${arrow.UID}]`)
    .find('.arrow-color-section')
    .css('display', 'block');
  $(`div[id=${arrow.UID}]`)
    .find('.arrow-dashing-section')
    .css('display', 'block');
  $(`div[id=${arrow.UID}]`)
    .find('.arrow-strokewidth-section')
    .css('display', 'block');
  $(`div[id=${arrow.UID}]`).find('.arrow-bend-section').css('display', 'block');
  $(`div[id=${arrow.UID}]`).find('.arrow-left-section').css('display', 'block');
  $(`div[id=${arrow.UID}]`)
    .find('.arrow-right-section')
    .css('display', 'block');
  $(`div[id=${arrow.UID}]`)
    .find('.arrow-lock-section')
    .css({ 'background-color': 'white' });
  $(`div[id=${arrow.UID}]`).css('display', 'none');
  $(`div[id=${arrow.UID}]`).css('width', '35rem');
};

export const updateImageToolbarForObjectLock = (image, helperData) => {
  const { $ } = helperData;
  $(`div[id=${image.UID}]`).find('.shape-attach-link').css({ display: 'none' });
  $(`div[id=${image.UID}]`).css({ display: 'none' });
  $(`div[id=${image.UID}]`).css({ width: '6rem' });
  $(`div[id=${image.UID}]`)
    .find('.shape-background-color')
    .css({ 'background-color': '#FA8072' });
};

export const updateImageToolbarForObjectUnLock = (image, helperData) => {
  const { $ } = helperData;
  $(`div[id=${image.UID}]`)
    .find('.shape-attach-link')
    .css({ display: 'block' });
  $(`div[id=${image.UID}]`).css({ display: 'none' });
  $(`div[id=${image.UID}]`).css({ width: '9rem' });
  $(`div[id=${image.UID}]`)
    .find('.shape-background-color')
    .css({ 'background-color': 'white' });
};

export const updateArrowToolbarLockStatus = (arrow, helperData) => {
  if (arrow?.lockMovementX) {
    updateArrowToolbarForLockedObject(arrow, helperData);
  } else {
    updateArrowToolbarForUnLockedObject(arrow, helperData);
  }
};

export const hideObjectToolbar = (object, helperData) => {
  const { $ } = helperData;
  $(`div[id=${object.UID}]`).css('display', 'none');
};

export const updateImageToolbarLockStatus = (image, helperData) => {
  image?.lockMovementX
    ? updateImageToolbarForObjectLock(image, helperData)
    : updateImageToolbarForObjectUnLock(image, helperData);
};

export const updateImageToolbarState = (image, helperData) => {
  updateImageToolbarLockStatus(image, helperData);
};

export const getUIDList = (list) => {
  const UIDList = list.map((el) => {
    return el.UID;
  });
  return UIDList;
};

export const getObjectById = (id, helperData) => {
  const objList = helperData.scope.canvas.getObjects();
  for (var i = 0; i < objList.length; i++) {
    if (objList[i].UID == id) return objList[i];
  }
};

export const removeParticularObjectTextEditingMode = (object, helperData) => {
  if (isObjectIsShape(object) || object?.objType === 'container-rect') {
    const text = helperData.scope.canvas
      .getObjects()
      .find((ob) => ob?.UID === object.UID && ob?.type === 'textbox');
    if (text) {
      text.exitEditing();
    }
  }
};

export const removeObjectComment = (object, helperData) => {
  let copyAllComments = JSON.parse(
    JSON.stringify(helperData.scope.whiteboardCommentsAllData)
  );
  helperData.scope.copyTotalObjectComments = copyAllComments;
  copyAllComments.forEach((com) => {
    if (com?.objectID === object?.UID) {
      let commentIndex = helperData.scope.whiteboardCommentsAllData.findIndex(
        (obj) => {
          return obj.userComment === com.userComment;
        }
      );
      helperData.scope.whiteboardCommentsAllData.splice(commentIndex, 1);
    }
  });
  if (helperData.scope.whiteboardCommentsAllData.length < 1) {
    helperData.scope.noCommentShow = true;
  }
};

export const removeCanvasShapeObject = (object, helperData) => {
  const { $, fabric } = helperData;
  if (isObjectIsShape(object) || object?.objType === 'container-rect') {
    let text = helperData.scope.canvas
      .getObjects()
      .find((o) => o?.UID === object?.UID && o?.type === 'textbox');
    if (!text.isEditing) {
      $(`div[id=${object.UID}]`).remove();
      helperData.scope.canvas.remove(object);
      helperData.scope.canvas.remove(text);
      removeObjectComment(object, helperData);
      if (object?.objType === 'container-rect') {
        let line = helperData.scope.canvas
          .getObjects()
          .find(
            (o) => o?.UID === object?.UID && o?.objType === 'container-line'
          );
        helperData.scope.canvas.remove(line);
      }
      emitObjectRemoved(object.UID, helperData);
    }
  }
};

export const removeCanvasFreeDrawingObject = (object, helperData) => {
  const { $ } = helperData;
  if (object?.objType === 'free-drawing') {
    $(`div[id=${object.UID}]`).remove();
    helperData.scope.canvas.remove(object);
    emitObjectRemoved(object.UID, helperData);
  }
};

export const removeCanvasImageObject = (object, helperData) => {
  const { $ } = helperData;
  if (
    object?.objType === 'uploaded-img' ||
    object?.objType === 'uploaded-gif'
  ) {
    $(`div[id=${object.UID}]`).remove();
    helperData.scope.canvas.remove(object);
    removeObjectComment(object, helperData);
    emitObjectRemoved(object.UID, helperData);
  }
};

export const removeCanvasArrowObject = (object, helperData) => {
  const { $ } = helperData;
  if (
    object?.objType === 'straight-arrow-line' ||
    object?.objType === 'curve-arrow-line' ||
    object?.objType === 'z-arrow-line'
  ) {
    $(`div[id=${object.UID}]`).remove();
    helperData.scope.canvas.getObjects().forEach((o) => {
      if (o?.UID === object?.UID) {
        helperData.scope.canvas.remove(o);
      }
    });
    removeObjectComment(object, helperData);
    emitObjectRemoved(object.UID, helperData);
  }
};

export const removeCanvasObjects = (object, helperData) => {
  removeCanvasShapeObject(object, helperData);
  removeCanvasFreeDrawingObject(object, helperData);
  removeCanvasImageObject(object, helperData);
  removeCanvasArrowObject(object, helperData);
};

export const updateShapeToolbarShapeBorderColorAndType = (
  shape,
  helperData
) => {
  const { $ } = helperData
  $(`div[id=${shape.UID}]`)
    .find('.pixel-indicator')
    .html(`${shape.strokeWidth}` + ' px');

  if (shape?.objType !== 'area-shape') {
    $(`div[id=${shape.UID}]`)
      .find('.border-color-shape')
      .css('border-color', shape.stroke);
  }
  if (shape.borderType === 'dashed') {
    $(`div[id=${shape.UID}]`)
      .find('.border-colorchanger')
      .find('.active')
      .removeClass('active');
    $(`div[id=${shape.UID}]`).find('.dashed-line').addClass('active');
  } else if (shape.borderType === 'dotted') {
    $(`div[id=${shape.UID}]`)
      .find('.border-colorchanger')
      .find('.active')
      .removeClass('active');
    $(`div[id=${shape.UID}]`).find('.dotted-line').addClass('active');
  } else if (shape.borderType === 'straight') {
    $(`div[id=${shape.UID}]`)
      .find('.border-colorchanger')
      .find('.active')
      .removeClass('active');
    $(`div[id=${shape.UID}]`).find('.straight-line').addClass('active');
  }
};

export const updateShapeToolbarShapeBackgroundColor = (shape, helperData) => {
  const { $ } = helperData;
  $(`div[id=${shape.UID}]`)
    .find('.color-changer-shape')
    .css('background-color', shape.fill);
};

export const updateShapeToolbarTextSizeAndFontFamily = (shape, text, helperData) => {
  const { $ } = helperData;
  $(`div[id=${shape.UID}]`)
    .find('.font-family')
    .html(text.fontFamily === 'Times New Roman' ? 'Arial' : text.fontFamily);
  let textFontSize = Math.ceil(text.fontSize);
  $(`div[id=${shape.UID}]`).find('.font-size').val(textFontSize);
}

export const updateShapeToolbarTextBold = (shape, text, helperData) => {
  const { $ } = helperData;
  if (text.fontWeight === 'normal') {
    $(`div[id=${shape.UID}]`)
      .find('.bold-text')
      .css('background-color', 'white');
  } else {
    $(`div[id=${shape.UID}]`)
      .find('.bold-text')
      .css('background-color', '#e3ffdb');
  }
}

export const updateShapeToolbarTextAlign = (shape, text, helperData) => {
  const { $ } = helperData;
  if (text.textAlign === 'center') {
    $(`div[id=${shape.UID}]`)
      .find('.text-alignment-division')
      .find('.active')
      .removeClass('active');
    $(`div[id=${shape.UID}]`).find('.text-middle').addClass('active');
  } else if (text.textAlign === 'left') {
    $(`div[id=${shape.UID}]`)
      .find('.text-alignment-division')
      .find('.active')
      .removeClass('active');
    $(`div[id=${shape.UID}]`).find('.text-left').addClass('active');
  } else if (text.textAlign === 'right') {
    $(`div[id=${shape.UID}]`)
      .find('.text-alignment-division')
      .find('.active')
      .removeClass('active');
    $(`div[id=${shape.UID}]`).find('.text-right').addClass('active');
  }
}

export const updateShapeToolbarTextUnderLine = (shape, text, helperData) => {
  const { $ } = helperData;
  if (text.underline === false) {
    $(`div[id=${shape.UID}]`)
      .find('.underline-text')
      .css('background-color', 'white');
  } else {
    $(`div[id=${shape.UID}]`)
      .find('.underline-text')
      .css('background-color', '#e3ffdb');
  }
}

export const updateShapeToolbarForShapeLock = (shape, helperData) => {
  const { $ } = helperData;
  $(`div[id=${shape.UID}]`)
    .find('.shape-toolbar-logo')
    .css('display', 'none');
  $(`div[id=${shape.UID}]`)
    .find('.shape-toolbar-color-changer')
    .css('display', 'none');
  $(`div[id=${shape.UID}]`).find('.shape-font-family').css('display', 'none');
  $(`div[id=${shape.UID}]`).find('.shape-font-size').css('display', 'none');
  $(`div[id=${shape.UID}]`).find('.shape-bold-italic').css('display', 'none');
  $(`div[id=${shape.UID}]`).find('.shape-attach-link').css('display', 'none');
  if (shape?.objType === 'container-rect') {

    if (shape?.id === "multiple") {

      $(`div[id=${shape.UID}]`)
        .find('.container-lock-icon-allobjects').css({ 'background-color': '#FA8072' });
    } else if (shape?.id === "single") {
      $(`div[id=${shape.UID}]`)
        .find('.container-lock-icon').css({ 'background-color': '#FA8072' });
    }
  } else {
    $(`div[id=${shape.UID}]`)
      .find('.shape-background-color')
      .css({ 'background-color': '#FA8072' });
  }

  $(`div[id=${shape.UID}]`).css('display', 'none');
  $(`div[id=${shape.UID}]`).css('width', '6rem');
}

export const updateShapeToolbarForShapeUnLock = (shape, helperData) => {
  const { $ } = helperData;

  let toolbarWidth = shape?.objType === 'area-shape' ? '39rem' : '45rem';
  $(`div[id=${shape.UID}]`)
    .find('.shape-toolbar-logo')
    .css('display', 'block');
  $(`div[id=${shape.UID}]`)
    .find('.shape-toolbar-color-changer')
    .css('display', 'block');
  $(`div[id=${shape.UID}]`)
    .find('.shape-font-family')
    .css('display', 'block');
  $(`div[id=${shape.UID}]`).find('.shape-font-size').css('display', 'block');
  $(`div[id=${shape.UID}]`)
    .find('.shape-bold-italic')
    .css('display', 'block');
  $(`div[id=${shape.UID}]`)
    .find('.shape-attach-link')
    .css('display', 'block');

  if (shape?.objType === 'container-rect') {

    if (shape?.id === "multiple") {

      $(`div[id=${shape.UID}]`)
        .find('.container-lock-icon-allobjects').css({ 'background-color': 'white' });
    } else if (shape?.id === "single") {
      $(`div[id=${shape.UID}]`)
        .find('.container-lock-icon').css({ 'background-color': 'white' });
    }
  } else {
    $(`div[id=${shape.UID}]`)
      .find('.shape-background-color')
      .css({ 'background-color': 'white' });
  }
  $(`div[id=${shape.UID}]`).css('display', 'none');
  $(`div[id=${shape.UID}]`).css('width', toolbarWidth);
}

export const updateShapeToolbarLockStatus = (shape, helperData) => {
  shape?.lockMovementX
    ? updateShapeToolbarForShapeLock(shape, helperData)
    : updateShapeToolbarForShapeUnLock(shape, helperData);
}

export const updateShapeToolbarState = (shape, text, helperData) => {
  updateShapeToolbarShapeBackgroundColor(shape, helperData);
  updateShapeToolbarShapeBorderColorAndType(shape, helperData);
  updateShapeToolbarTextSizeAndFontFamily(shape, text, helperData);
  updateShapeToolbarTextBold(shape, text, helperData);
  updateShapeToolbarTextAlign(shape, text, helperData);
  updateShapeToolbarTextUnderLine(shape, text, helperData);
  updateShapeToolbarLockStatus(shape, helperData);
};

export const updateFreeDrawingToolbarObjectBackgroundColor = (freeDrawing, helperData) => {
  const { $ } = helperData
  $(`div[id=${freeDrawing.UID}]`)
    .find('.freeDrawing-colorPallete')
    .css('background-color', freeDrawing.stroke);
}

export const updateFreeDrawingToolbarForObjectLock = (freeDrawing, helperData) => {
  const { $ } = helperData
  $(`div[id=${freeDrawing.UID}]`)
    .find('.stroke-width-1')
    .css({ display: 'none' });
  $(`div[id=${freeDrawing.UID}]`)
    .find('.stroke-width-2')
    .css({ display: 'none' });
  $(`div[id=${freeDrawing.UID}]`)
    .find('.stroke-width-3')
    .css({ display: 'none' });
  $(`div[id=${freeDrawing.UID}]`)
    .find('.stroke-width-4')
    .css({ display: 'none' });
  $(`div[id=${freeDrawing.UID}]`)
    .find('.freedrawing-toolbar-colorpicker')
    .css({ display: 'none' });
  $(`div[id=${freeDrawing.UID}]`).css({ width: '3rem' });
  $(`div[id=${freeDrawing.UID}]`).css({
    'background-color': '#FA8072',
  });
}
export const updateFreeDrawingToolbarForObjectUnLock = (freeDrawing, helperData) => {
  const { $ } = helperData

  $(`div[id=${freeDrawing.UID}]`)
    .find('.stroke-width-1')
    .css({ display: 'flex' });
  $(`div[id=${freeDrawing.UID}]`)
    .find('.stroke-width-2')
    .css({ display: 'flex' });
  $(`div[id=${freeDrawing.UID}]`)
    .find('.stroke-width-3')
    .css({ display: 'flex' });
  $(`div[id=${freeDrawing.UID}]`)
    .find('.stroke-width-4')
    .css({ display: 'flex' });
  $(`div[id=${freeDrawing.UID}]`)
    .find('.freedrawing-toolbar-colorpicker')
    .css({ display: 'flex' });
  $(`div[id=${freeDrawing.UID}]`).css({ width: '18rem' });
  $(`div[id=${freeDrawing.UID}]`).css({
    'background-color': 'white',
  });
}

export const updateFreeDrawingToolbarLockStatus = (freeDrawing, helperData) => {
  freeDrawing?.lockMovementX
    ? updateFreeDrawingToolbarForObjectLock(freeDrawing, helperData)
    : updateFreeDrawingToolbarForObjectUnLock(freeDrawing, helperData);
}

export const updateFreeDrawingToolbarState = (freeDrawing, helperData) => {
  updateFreeDrawingToolbarObjectBackgroundColor(freeDrawing, helperData);
  updateFreeDrawingToolbarLockStatus(freeDrawing, helperData);
}

export const setPlaceHolderForTextBox = (obj, helperData) => {
  if (obj?.objType === 'area-text') {
    if (obj.text === 'Text..') {
      obj.text = '';
      obj.exitEditing();
      obj.enterEditing();
      helperData.scope.canvas.renderAll();
    } else {
      obj.fill = 'black';
      helperData.scope.canvas.renderAll();
      helperData.scope.canvas.renderAll();
    }
  }
}

export const userIdealConditionRedirectHandler = (helperData) => {
  const { $ } = helperData
  clearInterval(helperData.scope.userIdealConditionRedirectDeboucingTimer);
  helperData.scope.userIdealConditionRedirectDeboucingTimer = setTimeout(() => {
    $('#session-expired-modal').modal('show')
  }, 7200000);
}


export const addCommentHandler = (helperData) => {
  const { $ } = helperData;
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  let commentInput = $('.comment-input').val();
  if (commentInput) {
    let fullDate = new Date();
    let currentDate = fullDate.getDate();
    let currentYear = fullDate.getFullYear().toString().split('0')[1];
    let currentMonth = monthNames[fullDate.getMonth()];
    let currentHour: any = fullDate.getHours();
    let currentMinute = fullDate.getMinutes().toString();
    let ampm = currentHour >= 12 ? 'Pm' : 'Am';
    currentHour = currentHour % 12;
    currentHour = currentHour ? currentHour : 12;
    currentHour = currentHour.toString();
    if (currentMinute.split('').length < 2) {
      currentMinute = '0' + currentMinute;
    }
    if (currentHour.split('').length < 2) {
      currentHour = '0' + currentHour;
    }
    let strTime = currentHour + ':' + currentMinute + ' ' + ampm;
    let userDetails = JSON.parse(localStorage.getItem('userDetails'));
    helperData.scope.whiteboardCommentsAllData.push({
      objectID: helperData.scope.currentCommentObjectId,
      userName: `${userDetails.firstName} ${userDetails.lastName}`,
      commentDate: `${currentDate} ${currentMonth} ,${currentYear}`,
      commentTime: strTime,
      userComment: commentInput,
      ISODate: fullDate.toISOString(),
    });
    helperData.scope.noCommentShow = false;
    helperData.scope.commentsToBeShown = helperData.scope.whiteboardCommentsAllData.filter((obj) => {
      return obj.objectID === helperData.scope.currentCommentObjectId;
    });
    if (helperData.scope.commentsToBeShown.length > 0) {
      let commentAvailableIndicator = $('<div></div>').css({
        position: 'absolute',
        top: '0.2rem',
        right: '0.2rem',
        width: '0.45rem',
        height: '0.45rem',
        'border-radius': '50%',
        'background-color': 'red',
      });

      $(`div[id=${helperData.scope.currentCommentObjectId}]`)
        .find('.shapetoolbar-comment')
        .append(commentAvailableIndicator);
    }
    $('.comment-input').val('');
    helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    emitCanvasComments(helperData);
    emitCommentedObject(helperData.scope.canvas.getActiveObject(), helperData);


    const commentedData = {
      comments: helperData.scope.whiteboardCommentsAllData,
      id: helperData.scope.projectID,
      user_id: localStorage.getItem('userId'),
      userName: {
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
      }
    }
    helperData.scope.sendCommentedObjectData(JSON.stringify(commentedData))
  }
}

export const undo = (helperData) => {
  designToolbarHideHandler(helperData);
  if (helperData.scope.undoRedoData.currentIndex > 0) {
    backup(
      helperData.scope.undoRedoData.canvasState[helperData.scope.undoRedoData.currentIndex - 1],
      true, true, false, helperData
    );
    helperData.scope.undoRedoData.currentIndex -= 1;
    clearInterval(helperData.scope.undoDeboucingTimer);
    helperData.scope.undoDeboucingTimer = setTimeout(() => {
      helperData.scope.updateMiniMapVP();
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    }, 500);
  }

}

export const redo = (helperData) => {
  designToolbarHideHandler(helperData);
  if (
    helperData.scope.undoRedoData.currentIndex <
    helperData.scope.undoRedoData.canvasState.length - 1
  ) {
    backup(
      helperData.scope.undoRedoData.canvasState[helperData.scope.undoRedoData.currentIndex + 1],
      false,
      true,
      false,
      helperData
    );
    helperData.scope.undoRedoData.currentIndex += 1;
    clearInterval(helperData.scope.redoDeboucingTimer);
    helperData.scope.redoDeboucingTimer = setTimeout(() => {
      helperData.scope.updateMiniMapVP();
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    }, 500);
  }

}

export const textBoldHandler = (helperData) => {
  const { $ } = helperData
  if (helperData.scope.userAccess === 'readonly') {
    return;
  }
  let activeObj = helperData.scope.canvas.getActiveObject();
  let obj = helperData.scope.canvas
    .getObjects()
    .find((ob) => ob?.UID === activeObj.UID && ob?.type === 'textbox');
  let mainToolbarDiv = $(`div[id=${activeObj.UID}]`);
  if (activeObj.lockMovementX || !obj) {
    return;
  }
  if (obj.get('fontWeight') == 'normal') {
    obj.set('fontWeight', 'bold');
    mainToolbarDiv.find('.bold-text').css('background-color', '#e3ffdb');
  } else {
    obj.set('fontWeight', 'normal');
    mainToolbarDiv.find('.bold-text').css('background-color', 'white');
  }

  // updateCanvasState();
  helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();

  helperData.scope.canvas.renderAll();
}

export const textItalicHandler = (helperData) => {
  if (helperData.scope.userAccess === 'readonly') {
    return;
  }

  let activeObj = helperData.scope.canvas.getActiveObject();
  let obj = helperData.scope.canvas
    .getObjects()
    .find((ob) => ob?.UID === activeObj.UID && ob?.type === 'textbox');
  if (activeObj.lockMovementX || !obj) {
    return;
  }
  if (obj.get('fontStyle') == 'normal') {
    obj.set('fontStyle', 'italic');
  } else {
    obj.set('fontStyle', 'normal');
  }

  // updateCanvasState();
  helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();

  helperData.scope.canvas.renderAll();
}

export const textUnderLineHandler = (helperData) => {
  const { $ } = helperData
  if (helperData.scope.userAccess === 'readonly') {
    return;
  }
  let activeObj = helperData.scope.canvas.getActiveObject();
  let obj = helperData.scope.canvas
    .getObjects()
    .find((ob) => ob?.UID === activeObj.UID && ob?.type === 'textbox');
  let mainToolbarDiv = $(`div[id=${activeObj.UID}]`);
  if (activeObj.lockMovementX || !obj) {
    return;
  }
  if (obj.get('underline') == false) {
    obj.set('underline', true);
    mainToolbarDiv.find('.underline-text').css('background-color', '#e3ffdb');
  } else {
    obj.set('underline', false);
    mainToolbarDiv.find('.underline-text').css('background-color', 'white');
  }

  // updateCanvasState();
  helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();

  helperData.scope.canvas.renderAll();
}

export const arrowKeyObjectMovementHandler = (prop, helperData) => {

  const { $ } = helperData
  let connectionData = [];
  let obj = helperData.scope.canvas.getActiveObject();
  if (!obj?.selectMe) return;
  designToolbarHideHandler(helperData);
  let key;
  let increment;
  if (prop === 'right') {
    key = 'left';
    increment = 50;
  } else if (prop === 'down') {
    key = 'top';
    increment = 50;
  } else if (prop === 'left') {
    key = 'left';
    increment = -50;
  } else if (prop === 'up') {
    key = 'top';
    increment = -50;
  }
  if (
    isObjectIsShape(obj)
  ) {
    connectionData = connectionOfArrowOnMousedownHandler(
      obj,
      connectionData,
      helperData
    );
    let text = helperData.scope.canvas
      .getObjects()
      .find((ob) => ob?.UID === obj?.UID && ob?.type === 'textbox');
    obj[key] = obj[key] + increment;
    text[key] = text[key] + increment;
    obj.setCoords();
    text.setCoords();
    let transformCenterPos = obj.getCenterPoint();

    moveArrowTogetherWithShapeHandler(
      connectionData,
      transformCenterPos,
      helperData
    );
    emitObjectMoving({ target: obj }, helperData);
  } else if (obj?.objType === 'container-rect') {
    helperData.scope.globalMatchedData = [];
    connectionData = connectionOfArrowOnMousedownHandler(
      obj,
      connectionData,
      helperData
    );

    let copyConnectionData = []

    connectionData.forEach(obj => {
      copyConnectionData.push({
        diffX: obj.diffX,
        diffY: obj.diffY,
        object: obj.object,
        status: obj.status,
        centerPos: obj.centerPos
      })
    })

    helperData.scope.globalMatchedData.forEach((obj) => {
      if (isObjectIsArrow(obj.object)) {
        connectionData.forEach(ob => {
          if (obj.object?.UID === ob?.object?.UID) {
            let anotherHead;
            if (ob?.object?.label === "right-arrow") {
              anotherHead = helperData.scope.globalMatchedData.find(p => ob?.object?.UID === p?.object?.UID && p?.object?.label === "left-arrow")
            } else {
              anotherHead = helperData.scope.globalMatchedData.find(p => ob?.object?.UID === p?.object?.UID && p?.object?.label === "right-arrow")
            }
            if (anotherHead) {
              let index = copyConnectionData.findIndex(o => {
                return ob?.object?.UID === o?.object?.UID && ob?.object?.objType === o?.object?.objType
              })
              copyConnectionData.splice(index, 1)
            }
          }
        })
      }
    })

    connectionData = copyConnectionData
    let containerText = helperData.scope.canvas
      .getObjects()
      .find((ob) => ob?.UID === obj?.UID && ob?.type === 'textbox');
    let containerLine = helperData.scope.canvas
      .getObjects()
      .find((ob) => ob?.UID === obj?.UID && ob?.objType === 'container-line');
    obj[key] = obj[key] + increment;
    containerText[key] = containerText[key] + increment;
    containerLine[key] = containerLine[key] + increment;
    let containerCordinates = obj.aCoords;
    let containerIndex = helperData.scope.canvas.getObjects().indexOf(obj);
    let allContainerObjects = [obj, containerText, containerLine];

    let centerPos = obj.getCenterPoint();
    let xStart = containerCordinates.tl.x;
    let xEnd = containerCordinates.tr.x;
    let yStart = containerCordinates.tl.y;
    let yEnd = containerCordinates.bl.y;
    helperData.scope.canvas.getObjects().forEach((obj) => {
      let objectIndex = helperData.scope.canvas.getObjects().indexOf(obj);
      if (containerIndex < objectIndex) {
        if (
          isObjectIsShape(obj)
        ) {
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
              .find((ob) => ob?.UID === obj?.UID && ob?.type === 'textbox');
            allShapeWithText.push(textObj);
            allShapeWithText.forEach((obj) => {
              helperData.scope.globalMatchedData.push({
                diffX: obj.left - centerPos.x,
                diffY: obj.top - centerPos.y,
                object: obj,
              });
              let object = allContainerObjects.find((o) => {
                return o?.UID === obj.UID && o?.objType === obj.objType;
              });
              if (!object) {
                allContainerObjects.push(obj);
                // canvas.bringToFront(obj);
              }
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
                  ob?.UID === obj?.UID && ob?.objType === 'container-text'
              );
            let lineObj = helperData.scope.canvas
              .getObjects()
              .find(
                (ob) =>
                  ob?.UID === obj?.UID && ob?.objType === 'container-line'
              );
            allShapeWithText.push(textObj);
            allShapeWithText.push(lineObj);
            allShapeWithText.forEach((obj) => {
              helperData.scope.globalMatchedData.push({
                diffX: obj.left - centerPos.x,
                diffY: obj.top - centerPos.y,
                object: obj,
              });
              let object = allContainerObjects.find((o) => {
                return o?.UID === obj.UID && o?.objType === obj.objType;
              });
              if (!object) {
                allContainerObjects.push(obj);
                // canvas.bringToFront(obj);
              }
            });
          }
        } else if (
          obj.objType === 'uploaded-img' ||
          obj.objType === 'uploaded-gif' ||
          obj.objType === 'free-drawing'
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
            let object = allContainerObjects.find((o) => {
              return o?.UID === obj.UID && o?.objType === obj.objType;
            });
            if (!object) {
              allContainerObjects.push(obj);
              // canvas.bringToFront(obj);
            }
          }
        } else if (isObjectIsArrow(obj)) {
          let objCoords = obj.aCoords;
          if (
            objCoords.tl.x > xStart &&
            objCoords.tr.x < xEnd &&
            objCoords.tl.y > yStart &&
            objCoords.bl.y < yEnd
          ) {
            helperData.scope.canvas.getObjects().forEach((ob) => {
              if (obj?.UID === ob?.UID) {
                helperData.scope.globalMatchedData.push({
                  diffX: ob.left - centerPos.x,
                  diffY: ob.top - centerPos.y,
                  object: ob,
                });
                let object = allContainerObjects.find((o) => {
                  return o?.UID === ob.UID && o?.objType === ob.objType;
                });
                if (!object) {
                  allContainerObjects.push(ob);
                  // canvas.bringToFront(obj);
                }
              }
            });
          }
        }
      }
    });
    helperData.scope.canvas.bringToFront(obj);
    helperData.scope.canvas.bringToFront(containerText);
    helperData.scope.canvas.bringToFront(containerLine);
    helperData.scope.canvas.getObjects().forEach(obj => {
      if (obj?.objType !== 'container-rect' && obj?.objType !== 'container-text' && obj?.objType !== 'container-line') {
        helperData.scope.canvas.bringToFront(obj);
      }
    })
    let finalObjects = helperData.scope.globalMatchedData.filter((ob) => {
      helperData.scope.canvas.bringToFront(ob.object);
      return ob.object.selectMe;
    });
    finalObjects.forEach((ob) => {
      ob.object[key] = ob.object[key] + increment;
      ob.object.setCoords();
    });
    obj.setCoords();
    containerText.setCoords();
    containerLine.setCoords();

    moveArrowTogetherWithShapeHandler(connectionData, centerPos, helperData);
    emitObjectMoving({
      allContainerObjects,
      objType: 'container-rect',
      top: obj.top,
      left: obj.left,
    }, helperData);
  } else if (obj?.objType === 'free-drawing') {
    connectionData = connectionOfArrowOnMousedownHandler(
      obj,
      connectionData,
      helperData
    );
    obj[key] = obj[key] + increment;
    obj.setCoords();
    let transformCenterPos = obj.getCenterPoint();

    moveArrowTogetherWithShapeHandler(
      connectionData,
      transformCenterPos,
      helperData
    );
    emitObjectMoving({ target: obj }, helperData);
  } else if (
    obj?.objType === 'uploaded-img' ||
    obj?.objType === 'uploaded-gif'
  ) {
    connectionData = connectionOfArrowOnMousedownHandler(
      obj,
      connectionData,
      helperData
    );
    obj[key] = obj[key] + increment;
    obj.setCoords();
    let transformCenterPos = obj.getCenterPoint();
    moveArrowTogetherWithShapeHandler(
      connectionData,
      transformCenterPos,
      helperData
    );
    emitObjectImageMoving(obj, helperData);
  } else if (
    obj?.objType === 'straight-arrow-line' ||
    obj?.objType === 'z-arrow-line'
  ) {
    const [start, end] = getTwoArrowHeads(obj, helperData)
    obj[key] = obj[key] + increment;
    obj.setCoords();
    if (start) {
      start[key] = start[key] + increment;
      start.setCoords();
    }
    if (end) {
      end[key] = end[key] + increment;
      end.setCoords();
    }
    removeControlPoints(helperData)
    obj?.objType === "straight-arrow-line" && updateArrowLinePosition(obj)
    emitMovedArrow([obj, start, end], helperData)
  } else if (obj?.objType === 'selected-all') {
    obj[key] = obj[key] + increment;
    obj.setCoords();
    emitObjectMoving({ target: obj }, helperData);
    $('.objects-toolbar').css('display', 'none');
  }
  helperData.scope.canvas.requestRenderAll();
}

export const copyCommandHandler = (helperData) => {
  let activeObject = helperData.scope.canvas.getActiveObject();
  if (!activeObject?.lockMovementX && activeObject) {
    designToolbarHideHandler(helperData);
    helperData.scope.pasteLockStatus = false;
    helperData.scope.cutObjectData = '';
    helperData.scope.pasteCounter = 20;
    helperData.scope.objectUniqueID = new Date().getTime();

    if (activeObject?.UID) {
      helperData.scope.allSelectedObjectsActive = '';
      activeObject.set('uniqueIdentifier', helperData.scope.objectUniqueID);
    } else {
      helperData.scope.allSelectedObjectsActive = activeObject;
    }
    helperData.scope.canvas.discardActiveObject();
    helperData.scope.canvas.requestRenderAll();
  } else {
    helperData.scope.pasteLockStatus = true;
  }
}

export const deleteCanvasObject = (data = null, helperData) => {
  let activeObject = data ? data : helperData.scope.canvas.getActiveObject();
  if (!activeObject) return;
  if (activeObject?.type === 'textbox' && activeObject?.isEditing) return;
  if (
    isObjectIsShape(activeObject) ||
    activeObject?.objType === 'container-rect'
  ) {
    let text = helperData.scope.canvas
      .getObjects()
      .find((o) => o?.UID === activeObject?.UID && o?.type === 'textbox');
    if (text.isEditing) return;
  }
  if (activeObject?.objType === 'selected-all') {
    let allSelectedObjects = activeObject.getObjects();
    allSelectedObjects.forEach((obj) => {
      if (!obj.selectMe) return;
      removeCanvasObjects(obj, helperData);
    });
    helperData.scope.canvas.discardActiveObject();
  } else {
    if (!activeObject.selectMe) return;
    removeCanvasObjects(activeObject, helperData);
  }
  // updateCanvasState();
  helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
  helperData.scope.canvas.requestRenderAll();
}

export const pasteCommandHandler = (helperData) => {
  if (!helperData.scope.pasteLockStatus) {
    if (!helperData.scope.cutObjectData) {
      designToolbarHideHandler(helperData);
      let allJsonCanvasData = convertCanvasDataToJson(helperData);
      let extractedData = allJsonCanvasData.objects.find((ob) => {
        return ob.uniqueIdentifier === helperData.scope.objectUniqueID;
      });
      if (helperData.scope.allSelectedObjectsActive?._objects?.length > 0) {
        let jsonCanvasData = convertCanvasDataToJson(helperData);
        let allObjects = helperData.scope.allSelectedObjectsActive._objects;
        let shapes = [];
        let freedrawing = [];
        let containerData = [];
        let arrowData = [];
        allObjects.forEach((ob) => {
          if (
            isObjectIsShape(ob)
          ) {
            let shape = ob;
            let text = allObjects.find(
              (obj) => obj?.UID === ob?.UID && obj?.type === 'textbox'
            );
            let jsonShape = jsonCanvasData.objects.find(
              (ob) => ob?.UID === shape.UID && ob?.objType === shape?.objType
            );
            let jsonText = jsonCanvasData.objects.find(
              (ob) => ob?.UID === text.UID && ob?.objType === text?.objType
            );
            shapes.push([jsonShape, jsonText]);
          } else if (ob?.objType === 'free-drawing') {
            let drawing = ob;
            let jsonFreeDrawing = jsonCanvasData.objects.find(
              (ob) =>
                ob?.UID === drawing.UID && ob?.objType === drawing?.objType
            );
            freedrawing.push(jsonFreeDrawing);
          } else if (ob?.objType === 'container-rect') {
            let containerBody = ob;
            let containerText = allObjects.find(
              (obj) =>
                obj?.UID === ob?.UID && obj?.objType === 'container-text'
            );
            let containerLine = allObjects.find(
              (obj) =>
                obj?.UID === ob?.UID && obj?.objType === 'container-line'
            );

            let jsonContainerBody = jsonCanvasData.objects.find(
              (ob) =>
                ob?.UID === containerBody.UID &&
                ob?.objType === containerBody?.objType
            );
            let jsonContainerText = jsonCanvasData.objects.find(
              (ob) =>
                ob?.UID === containerText.UID &&
                ob?.objType === containerText?.objType
            );
            let jsonContainerLine = jsonCanvasData.objects.find(
              (ob) =>
                ob?.UID === containerLine.UID &&
                ob?.objType === containerLine?.objType
            );

            containerData.push([
              jsonContainerBody,
              jsonContainerText,
              jsonContainerLine,
            ]);
          } else if (ob.objType === 'straight-arrow-line' || ob.objType === 'z-arrow-line') {
            let arrowJson = ob;
            let arrow = jsonCanvasData.objects.find(
              (ob) =>
                ob?.UID === arrowJson.UID && ob?.objType === arrowJson.objType
            );
            let start = jsonCanvasData.objects.find(
              (ob) =>
                ob?.UID === arrowJson.UID && ob?.label === "left-arrow"
            );
            let end = jsonCanvasData.objects.find(
              (ob) =>
                ob?.UID === arrowJson.UID && ob?.label === "right-arrow"
            );
            arrowData.push([arrow, start, end]);
          }
        });
        containerData.forEach((obj) => {
          let UID = new Date().getTime();
          obj[0].UID = UID;
          obj[1].UID = UID;
          obj[2].UID = UID;
          obj[0].top = obj[0].top + helperData.scope.pasteCounter;
          obj[0].left = obj[0].left + helperData.scope.pasteCounter;
          reCreateOneByOneContainer(obj, null, helperData);
          emitObjectAdded({
            objType: 'container',
            objects: obj,
          }, helperData);
        });
        shapes.forEach((obj) => {
          let UID = new Date().getTime();
          obj[0].UID = UID;
          obj[1].UID = UID;
          obj[0].top = obj[0].top + helperData.scope.pasteCounter;
          obj[0].left = obj[0].left + helperData.scope.pasteCounter;
          retrieveObjectHandler(obj, true, helperData);
          emitObjectAdded(obj, helperData);
        });
        freedrawing.forEach((obj) => {
          let UID = new Date().getTime();
          obj.UID = UID;
          obj.top = obj.top + helperData.scope.pasteCounter;
          obj.left = obj.left + helperData.scope.pasteCounter;
          drawingObjectRetriever(obj, helperData);
          emitObjectAdded([obj], helperData);
        });
        arrowData.forEach((obj) => {
          let UID = new Date().getTime();
          let arrow = obj[0]
          let start = obj[1]
          let end = obj[2]


          arrow.UID = UID
          arrow.top = arrow.top + helperData.scope.pasteCounter;
          arrow.left = arrow.left + helperData.scope.pasteCounter;

          if (start) {
            start.UID = UID
            start.top = start.top + helperData.scope.pasteCounter;
            start.left = start.left + helperData.scope.pasteCounter;
          }
          if (end) {
            end.UID = UID
            end.top = end.top + helperData.scope.pasteCounter;
            end.left = end.left + helperData.scope.pasteCounter;
          }
          if (arrow?.objType === "straight-arrow-line") {
            reCreateStraightTypeArrow([arrow, start, end], helperData)
          } else {
            reCreateZTypeArrow([arrow, start, end], helperData)
          }
          emitCreatedArrow([arrow, start, end], helperData)
          removeControlPoints(helperData)
        });
        helperData.scope.pasteCounter += 20;
      } else if (
        isObjectIsShape(extractedData)
      ) {
        let UID = new Date().getTime();
        let shape = extractedData;
        let text = allJsonCanvasData.objects.find(
          (ob) => ob?.UID === extractedData.UID && ob?.type === 'textbox'
        );
        shape.top = shape.top + helperData.scope.pasteCounter;
        shape.left = shape.left + helperData.scope.pasteCounter;
        shape.UID = UID;
        text.UID = UID;
        retrieveObjectHandler([shape, text], true, helperData);
        emitObjectAdded([shape, text], helperData);
        // emitObjectAdded([extractedData[0]]);
        helperData.scope.pasteCounter += 20;
        helperData.scope.canvas.discardActiveObject();
      } else if (extractedData?.objType === 'container-rect') {
        let UID = new Date().getTime();
        let containerBody = extractedData;
        let containerText = allJsonCanvasData.objects.find(
          (ob) =>
            ob?.UID === extractedData.UID && ob?.objType === 'container-text'
        );
        let containerLine = allJsonCanvasData.objects.find(
          (ob) =>
            ob?.UID === extractedData.UID && ob?.objType === 'container-line'
        );
        containerBody.UID = UID;
        containerText.UID = UID;
        containerLine.UID = UID;
        containerBody.top = containerBody.top + helperData.scope.pasteCounter;
        containerBody.left = containerBody.left + helperData.scope.pasteCounter;
        retrieveObjectHandler(
          [containerBody, containerText, containerLine],
          true,
          helperData
        );
        // emitObjectAdded(extractedData);
        helperData.scope.pasteCounter += 20;
        helperData.scope.canvas.discardActiveObject();
        emitObjectAdded({
          objType: 'container',
          objects: [containerBody, containerText, containerLine],
        }, helperData);
      } else if (extractedData?.objType === 'free-drawing') {
        let UID = new Date().getTime();
        let drawing = extractedData;
        drawing.UID = UID;
        drawing.top = drawing.top + helperData.scope.pasteCounter;
        drawing.left = drawing.left + helperData.scope.pasteCounter;
        drawingObjectRetriever(drawing, helperData);
        helperData.scope.pasteCounter += 20;
        helperData.scope.canvas.discardActiveObject();
        emitObjectAdded([drawing], helperData);
      } else if (extractedData?.objType === 'straight-arrow-line' || extractedData?.objType === 'z-arrow-line') {
        let UID = new Date().getTime();
        let arrow = extractedData;
        let start = allJsonCanvasData.objects.find(
          (ob) => ob?.UID === extractedData.UID && ob?.label === 'left-arrow'
        );
        let end = allJsonCanvasData.objects.find(
          (ob) => ob?.UID === extractedData.UID && ob?.label === 'right-arrow'
        );

        arrow.UID = UID
        arrow.top = arrow.top + helperData.scope.pasteCounter;
        arrow.left = arrow.left + helperData.scope.pasteCounter;

        if (start) {
          start.UID = UID
          start.top = start.top + helperData.scope.pasteCounter;
          start.left = start.left + helperData.scope.pasteCounter;
        }
        if (end) {
          end.UID = UID
          end.top = end.top + helperData.scope.pasteCounter;
          end.left = end.left + helperData.scope.pasteCounter;
        }
        if (arrow?.objType === "straight-arrow-line") {
          reCreateStraightTypeArrow([arrow, start, end], helperData)
        } else {
          reCreateZTypeArrow([arrow, start, end], helperData)
        }
        emitCreatedArrow([arrow, start, end], helperData)
        removeControlPoints(helperData)
        helperData.scope.pasteCounter += 20;
        helperData.scope.canvas.discardActiveObject();
      }
    } else {
      if (helperData.scope.allSelectedObjectsActive?._objects?.length > 0) {
        let allObjects = helperData.scope.allSelectedObjectsActive._objects;
        let shapes = [];
        let freedrawing = [];
        let containerData = [];
        let arrowData = [];
        allObjects.forEach((ob) => {
          if (
            isObjectIsShape(ob)
          ) {
            let shape = ob;
            let text = allObjects.find(
              (obj) => obj?.UID === ob?.UID && obj?.type === 'textbox'
            );
            shapes.push([shape, text]);
          } else if (ob?.objType === 'free-drawing') {
            let drawing = ob;
            freedrawing.push(drawing);
          } else if (ob?.objType === 'container-rect') {
            let containerBody = ob;
            let containerText = allObjects.find(
              (obj) =>
                obj?.UID === ob?.UID && obj?.objType === 'container-text'
            );
            let containerLine = allObjects.find(
              (obj) =>
                obj?.UID === ob?.UID && obj?.objType === 'container-line'
            );
            containerData.push([containerBody, containerText, containerLine]);
          } else if (ob.objType === 'straight-arrow-line' || ob.objType === 'z-arrow-line') {
            let arrowJson = ob;
            let arrow = allObjects.find(
              (ob) =>
                ob?.UID === arrowJson.UID && ob?.objType === arrowJson.objType
            );
            let start = allObjects.find(
              (ob) =>
                ob?.UID === arrowJson.UID && ob?.label === "left-arrow"
            );
            let end = allObjects.find(
              (ob) =>
                ob?.UID === arrowJson.UID && ob?.label === "right-arrow"
            );
            arrowData.push([arrow, start, end]);
          }
        });
        containerData.forEach((obj) => {
          let UID = new Date().getTime();
          obj[0].UID = UID;
          obj[1].UID = UID;
          obj[2].UID = UID;
          obj[0].top = obj[0].top + 20;
          obj[0].left = obj[0].left + 20;
          reCreateOneByOneContainer(obj, null, helperData);
          emitObjectAdded({
            objType: 'container',
            objects: obj,
          }, helperData);
        });
        shapes.forEach((obj) => {
          let UID = new Date().getTime();
          obj[0].UID = UID;
          obj[1].UID = UID;
          obj[0].top = obj[0].top + 20;
          obj[0].left = obj[0].left + 20;
          retrieveObjectHandler(obj, true, helperData);
          emitObjectAdded(obj, helperData);
        });
        freedrawing.forEach((obj) => {
          let UID = new Date().getTime();
          obj.UID = UID;
          obj.top = obj.top + 20;
          obj.left = obj.left + 20;
          drawingObjectRetriever(obj, helperData);
          emitObjectAdded([obj], helperData);
        });
        arrowData.forEach((obj) => {
          let UID = new Date().getTime();
          let arrow = obj[0]
          let start = obj[1]
          let end = obj[2]

          arrow.UID = UID
          arrow.top = arrow.top + helperData.scope.pasteCounter;
          arrow.left = arrow.left + helperData.scope.pasteCounter;

          if (start) {
            start.UID = UID
            start.top = start.top + helperData.scope.pasteCounter;
            start.left = start.left + helperData.scope.pasteCounter;
          }
          if (end) {
            end.UID = UID
            end.top = end.top + helperData.scope.pasteCounter;
            end.left = end.left + helperData.scope.pasteCounter;
          }
          if (arrow?.objType === "straight-arrow-line") {
            reCreateStraightTypeArrow([arrow, start, end], helperData)
          } else {
            reCreateZTypeArrow([arrow, start, end], helperData)
          }
          emitCreatedArrow([arrow, start, end], helperData)
          removeControlPoints(helperData)
        });
        helperData.scope.pasteCounter += 20;
      } else if (
        isObjectIsShape(helperData.scope.cutObjectData[0])
      ) {
        designToolbarHideHandler(helperData);
        let UID = new Date().getTime();
        let shape = helperData.scope.cutObjectData[0];
        let text = helperData.scope.cutObjectData[1];
        shape.top = shape.top + 20;
        shape.left = shape.left + 20;
        shape.UID = UID;
        text.UID = UID;
        retrieveObjectHandler([shape, text], true, helperData);
        // emitObjectAdded([extractedData[0]]);
        helperData.scope.pasteCounter += 20;
        helperData.scope.canvas.discardActiveObject();
        emitObjectAdded([shape, text], helperData);
      } else if (helperData.scope.cutObjectData[0].objType === 'container-rect') {
        let UID = new Date().getTime();
        let containerBody = helperData.scope.cutObjectData[0];
        let containerText = helperData.scope.cutObjectData[1];
        let containerLine = helperData.scope.cutObjectData[2];
        containerBody.UID = UID;
        containerText.UID = UID;
        containerLine.UID = UID;
        containerBody.top = containerBody.top + 20;
        containerBody.left = containerBody.left + 20;
        retrieveObjectHandler(
          [containerBody, containerText, containerLine],
          true, helperData
        );
        // emitObjectAdded(extractedData);
        helperData.scope.pasteCounter += 20;
        helperData.scope.canvas.discardActiveObject();
        emitObjectAdded({
          objType: 'container',
          objects: [containerBody, containerText, containerLine],
        }, helperData);
      } else if (helperData.scope.cutObjectData[0].objType === 'free-drawing') {
        let UID = new Date().getTime();
        let drawing = helperData.scope.cutObjectData[0];
        drawing.UID = UID;
        drawing.top = drawing.top + 20;
        drawing.left = drawing.left + 20;
        drawingObjectRetriever(drawing, helperData);
        helperData.scope.pasteCounter += 20;
        helperData.scope.canvas.discardActiveObject();
        emitObjectAdded([drawing], helperData);
      } else if (helperData.scope.cutObjectData[0].objType === 'straight-arrow-line' || helperData.scope.cutObjectData[0].objType === 'z-arrow-line') {
        let UID = new Date().getTime();
        let arrow = helperData.scope.cutObjectData[0];
        let start = helperData.scope.cutObjectData[1];
        let end = helperData.scope.cutObjectData[2];
        arrow.UID = UID;
        arrow.top = arrow.top + 20;
        arrow.left = arrow.left + 20;
        if (start) {
          start.UID = UID;
          start.top = start.top + 20;
          start.left = start.left + 20;
        }
        if (end) {
          end.UID = UID;
          end.top = end.top + 20;
          end.left = end.left + 20;
        }
        if (arrow?.objType === "straight-arrow-line") {
          reCreateStraightTypeArrow([arrow, start, end], helperData)
        } else {
          reCreateZTypeArrow([arrow, start, end], helperData)
        }
        helperData.scope.pasteCounter += 20;
        helperData.scope.canvas.discardActiveObject();
        emitCreatedArrow(helperData.scope.cutObjectData, helperData)
      }
    }
  }
}

export const cutCommandHandler = (helperData) => {
  const { $ } = helperData
  designToolbarHideHandler(helperData);
  let activeObject = helperData.scope.canvas.getActiveObject();
  if (!activeObject?.lockMovementX && activeObject?.UID) {
    helperData.scope.pasteLockStatus = false;
    helperData.scope.pasteCounter = 20;
    helperData.scope.objectUniqueID = new Date().getTime();
    helperData.scope.canvas.discardActiveObject();
    // updateCanvasState();
    helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    let allData = convertCanvasDataToJson(helperData);
    $(`div[id=${activeObject.UID}]`).remove();
    if (
      isObjectIsShape(activeObject)
    ) {
      helperData.scope.allSelectedObjectsActive = '';
      let shape = allData.objects.find(
        (ob) =>
          ob?.UID === activeObject.UID && ob?.objType === activeObject.objType
      );
      let text = allData.objects.find(
        (ob) => ob?.UID === activeObject.UID && ob?.type === 'textbox'
      );
      let shapeObj = helperData.scope.canvas
        .getObjects()
        .find((ob) => ob?.UID === shape.UID && ob?.objType === shape.objType);
      let textObj = helperData.scope.canvas
        .getObjects()
        .find((ob) => ob?.UID === text.UID && ob?.objType === text.objType);
      deleteCanvasObject(shapeObj, helperData);
      deleteCanvasObject(textObj, helperData);
      emitObjectRemoved(shapeObj.UID, helperData);
      emitObjectRemoved(textObj.UID, helperData);

      helperData.scope.cutObjectData = [shape, text];
    } else if (activeObject?.objType === 'container-rect') {
      helperData.scope.allSelectedObjectsActive = '';
      let containerBody = allData.objects.find(
        (ob) =>
          ob?.UID === activeObject.UID && ob?.objType === activeObject.objType
      );
      let containerText = allData.objects.find(
        (ob) =>
          ob?.UID === activeObject.UID && ob?.objType === 'container-text'
      );
      let containerLine = allData.objects.find(
        (ob) =>
          ob?.UID === activeObject.UID && ob?.objType === 'container-line'
      );
      let containerBodyObj = helperData.scope.canvas
        .getObjects()
        .find(
          (ob) =>
            ob?.UID === containerBody.UID &&
            ob?.objType === containerBody.objType
        );
      let containerTextObj = helperData.scope.canvas
        .getObjects()
        .find(
          (ob) =>
            ob?.UID === containerText.UID &&
            ob?.objType === containerText.objType
        );
      let containerLineObj = helperData.scope.canvas
        .getObjects()
        .find(
          (ob) =>
            ob?.UID === containerLine.UID &&
            ob?.objType === containerLine.objType
        );
      deleteCanvasObject(containerBodyObj, helperData);
      helperData.scope.cutObjectData = [containerBody, containerText, containerLine];
    } else if (activeObject?.objType === 'free-drawing') {
      helperData.scope.allSelectedObjectsActive = '';
      let drawing = allData.objects.find(
        (ob) => ob?.UID === activeObject.UID
      );
      deleteCanvasObject(activeObject, helperData);

      helperData.scope.cutObjectData = [drawing];
    } else if (activeObject?.objType === 'straight-arrow-line' || activeObject?.objType === 'z-arrow-line') {
      helperData.scope.allSelectedObjectsActive = '';
      let arrow = allData.objects.find(
        (ob) => ob?.UID === activeObject.UID && ob?.objType === activeObject.objType
      );
      let start = allData.objects.find(
        (ob) => ob?.UID === activeObject.UID && ob?.label === "left-arrow"
      );
      let end = allData.objects.find(
        (ob) => ob?.UID === activeObject.UID && ob?.label === "right-arrow"
      );
      deleteCanvasObject(arrow, helperData);

      helperData.scope.cutObjectData = [arrow, start, end];
    }
  } else if (activeObject && !activeObject?.UID) {
    helperData.scope.allSelectedObjectsActive = activeObject;
    helperData.scope.canvas.discardActiveObject();
    helperData.scope.cutObjectData = convertCanvasDataToJson(helperData);
    activeObject.getObjects().forEach((obj) => {
      deleteCanvasObject(obj, helperData);
    });
    helperData.scope.canvas.requestRenderAll();
  } else {
    helperData.scope.cutObjectData = '';
    helperData.scope.pasteLockStatus = true;
  }
}

export const initAligningGuidelines = (canvas, helperData) => {
  const { fabric } = helperData
  var ctx = canvas.getSelectionContext(),
    aligningLineOffset = 5,
    aligningLineMargin = 4,
    aligningLineWidth = 1,
    aligningLineColor = '#137ef9',
    viewportTransform,
    zoom = 1;

  function drawVerticalLine(coords) {
    drawLine(
      coords.x + 0.5,
      coords.y1 > coords.y2 ? coords.y2 : coords.y1,
      coords.x + 0.5,
      coords.y2 > coords.y1 ? coords.y2 : coords.y1
    );
  }

  function drawHorizontalLine(coords) {
    drawLine(
      coords.x1 > coords.x2 ? coords.x2 : coords.x1,
      coords.y + 0.5,
      coords.x2 > coords.x1 ? coords.x2 : coords.x1,
      coords.y + 0.5
    );
  }

  function drawLine(x1, y1, x2, y2) {
    var originXY = fabric.util.transformPoint(
      new fabric.Point(x1, y1),
      canvas.viewportTransform
    ),
      dimensions = fabric.util.transformPoint(
        new fabric.Point(x2, y2),
        canvas.viewportTransform
      );

    ctx.save();
    ctx.lineWidth = aligningLineWidth;
    ctx.strokeStyle = aligningLineColor;
    ctx.beginPath();
    ctx.moveTo(originXY.x, originXY.y);
    ctx.lineTo(dimensions.x, dimensions.y);
    ctx.stroke();
    ctx.restore();
  }

  function isInRange(value1, value2) {
    value1 = Math.round(value1);
    value2 = Math.round(value2);
    for (
      var i = value1 - aligningLineMargin, len = value1 + aligningLineMargin;
      i <= len;
      i++
    ) {
      if (i === value2) {
        return true;
      }
    }
    return false;
  }

  var verticalLines = [],
    horizontalLines = [];

  canvas.on('mouse:down', function () {
    viewportTransform = canvas.viewportTransform;
    zoom = canvas.getZoom();
  });

  canvas.on('object:moving', function (e) {



    var activeObject = e.target,
      canvasObjects = [],
      activeObjectCenter = activeObject.getCenterPoint(),
      activeObjectLeft = activeObjectCenter.x,
      activeObjectTop = activeObjectCenter.y,
      activeObjectBoundingRect = activeObject.getBoundingRect(),
      activeObjectHeight =
        activeObjectBoundingRect.height / viewportTransform[3],
      activeObjectWidth =
        activeObjectBoundingRect.width / viewportTransform[0],
      horizontalInTheRange = false,
      verticalInTheRange = false,
      transform = canvas._currentTransform;
    canvas.getObjects().forEach((element) => {
      if (element.matchedLine) {
        canvasObjects.push(element);
      }
    });



    if (!transform) return;

    for (var i = canvasObjects.length; i--;) {
      if (canvasObjects[i] === activeObject) continue;

      var objectCenter = canvasObjects[i].getCenterPoint(),
        objectLeft = objectCenter.x,
        objectTop = objectCenter.y,
        objectBoundingRect = canvasObjects[i].getBoundingRect(),
        objectHeight = objectBoundingRect.height / viewportTransform[3],
        objectWidth = objectBoundingRect.width / viewportTransform[0];


      // snap by the horizontal center line
      if (isInRange(objectLeft, activeObjectLeft)) {
        verticalInTheRange = true;
        verticalLines.push({
          x: objectLeft,
          y1:
            objectTop < activeObjectTop
              ? objectTop - objectHeight / 2 - aligningLineOffset
              : objectTop + objectHeight / 2 + aligningLineOffset,
          y2:
            activeObjectTop > objectTop
              ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
              : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(objectLeft, activeObjectTop),
          'center',
          'center'
        );
      }

      // snap by the left edge
      if (
        isInRange(
          objectLeft - objectWidth / 2,
          activeObjectLeft - activeObjectWidth / 2
        )
      ) {
        verticalInTheRange = true;
        verticalLines.push({
          x: objectLeft - objectWidth / 2,
          y1:
            objectTop < activeObjectTop
              ? objectTop - objectHeight / 2 - aligningLineOffset
              : objectTop + objectHeight / 2 + aligningLineOffset,
          y2:
            activeObjectTop > objectTop
              ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
              : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(
            objectLeft - objectWidth / 2 + activeObjectWidth / 2,
            activeObjectTop
          ),
          'center',
          'center'
        );
      }

      // snap by the right edge
      if (
        isInRange(
          objectLeft + objectWidth / 2,
          activeObjectLeft + activeObjectWidth / 2
        )
      ) {
        verticalInTheRange = true;
        verticalLines.push({
          x: objectLeft + objectWidth / 2,
          y1:
            objectTop < activeObjectTop
              ? objectTop - objectHeight / 2 - aligningLineOffset
              : objectTop + objectHeight / 2 + aligningLineOffset,
          y2:
            activeObjectTop > objectTop
              ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
              : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(
            objectLeft + objectWidth / 2 - activeObjectWidth / 2,
            activeObjectTop
          ),
          'center',
          'center'
        );
      }

      // snap by the vertical center line
      if (isInRange(objectTop, activeObjectTop)) {
        horizontalInTheRange = true;
        horizontalLines.push({
          y: objectTop,
          x1:
            objectLeft < activeObjectLeft
              ? objectLeft - objectWidth / 2 - aligningLineOffset
              : objectLeft + objectWidth / 2 + aligningLineOffset,
          x2:
            activeObjectLeft > objectLeft
              ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
              : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(activeObjectLeft, objectTop),
          'center',
          'center'
        );
      }

      // snap by the top edge
      if (
        isInRange(
          objectTop - objectHeight / 2,
          activeObjectTop - activeObjectHeight / 2
        )
      ) {
        horizontalInTheRange = true;
        horizontalLines.push({
          y: objectTop - objectHeight / 2,
          x1:
            objectLeft < activeObjectLeft
              ? objectLeft - objectWidth / 2 - aligningLineOffset
              : objectLeft + objectWidth / 2 + aligningLineOffset,
          x2:
            activeObjectLeft > objectLeft
              ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
              : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(
            activeObjectLeft,
            objectTop - objectHeight / 2 + activeObjectHeight / 2
          ),
          'center',
          'center'
        );
      }

      // snap by the bottom edge
      if (
        isInRange(
          objectTop + objectHeight / 2,
          activeObjectTop + activeObjectHeight / 2
        )
      ) {
        horizontalInTheRange = true;
        horizontalLines.push({
          y: objectTop + objectHeight / 2,
          x1:
            objectLeft < activeObjectLeft
              ? objectLeft - objectWidth / 2 - aligningLineOffset
              : objectLeft + objectWidth / 2 + aligningLineOffset,
          x2:
            activeObjectLeft > objectLeft
              ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
              : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
        });
        activeObject.setPositionByOrigin(
          new fabric.Point(
            activeObjectLeft,
            objectTop + objectHeight / 2 - activeObjectHeight / 2
          ),
          'center',
          'center'
        );
      }
    }

    if (!horizontalInTheRange) {
      horizontalLines.length = 0;
    }

    if (!verticalInTheRange) {
      verticalLines.length = 0;
    }

    vennCricleColorChange(e);
  });


  // venn diagram color change of circle
  function vennCricleColorChange(selectedObj) {

    selectedObj.target.setCoords();
    console.log("selected obj", selectedObj.target.objType);

    if (selectedObj.target.objType == 'circle-shape') {

      canvas.forEachObject(function (obj) {

        if (obj === selectedObj.target) return;
        if (selectedObj.target.intersectsWithObject(obj) && (obj != selectedObj.target) && (obj.objType == 'circle-shape')) {
          obj.set('opacity', selectedObj.target.intersectsWithObject(obj) ? '0.7' : '1');
          selectedObj.target.set('opacity', selectedObj.target.intersectsWithObject(obj) ? '0.7' : '1');
          obj.set('stroke', selectedObj.target.intersectsWithObject(obj) ? 'transprent' : 'black');
          selectedObj.target.set('stroke', selectedObj.target.intersectsWithObject(obj) ? 'transprent' : 'black');


        }


        // if are shape is overlap then this function called for prevent overlapping of text shape
        if (obj.objType == 'area-text') {
          let obj2 = obj
          canvas.remove(obj);
          canvas.add(obj2)
        }

      })
    }



  }

  canvas.on('before:render', function () {
    canvas?.clearContext(ctx);
  });

  canvas.on('after:render', function () {
    for (var i = verticalLines.length; i--;) {
      drawVerticalLine(verticalLines[i]);
    }
    for (var i = horizontalLines.length; i--;) {
      drawHorizontalLine(horizontalLines[i]);
    }

    verticalLines.length = horizontalLines.length = 0;
  });

  canvas.on('mouse:up', function () {
    verticalLines.length = horizontalLines.length = 0;
    canvas.renderAll();
  });
}

export const initCenteringGuidelines = (canvas, helperData) => {
  const { fabric } = helperData;
  var canvasWidth = canvas.getWidth(),
    canvasHeight = canvas.getHeight(),
    canvasWidthCenter = canvasWidth / 2,
    canvasHeightCenter = canvasHeight / 2,
    canvasWidthCenterMap = {},
    canvasHeightCenterMap = {},
    centerLineMargin = 4,
    centerLineColor = '#137ef9',
    centerLineWidth = 1,
    ctx = canvas.getSelectionContext(),
    viewportTransform;

  for (
    var i = canvasWidthCenter - centerLineMargin,
    len = canvasWidthCenter + centerLineMargin;
    i <= len;
    i++
  ) {
    canvasWidthCenterMap[Math.round(i)] = true;
  }
  for (
    var i = canvasHeightCenter - centerLineMargin,
    len = canvasHeightCenter + centerLineMargin;
    i <= len;
    i++
  ) {
    canvasHeightCenterMap[Math.round(i)] = true;
  }

  function showVerticalCenterLine() {
    showCenterLine(
      canvasWidthCenter + 0.5,
      0,
      canvasWidthCenter + 0.5,
      canvasHeight
    );
  }

  function showHorizontalCenterLine() {
    showCenterLine(
      0,
      canvasHeightCenter + 0.5,
      canvasWidth,
      canvasHeightCenter + 0.5
    );
  }

  function showCenterLine(x1, y1, x2, y2) {
    ctx.save();
    ctx.strokeStyle = centerLineColor;
    ctx.lineWidth = centerLineWidth;
    ctx.beginPath();
    ctx.moveTo(x1 * viewportTransform[0], y1 * viewportTransform[3]);
    ctx.lineTo(x2 * viewportTransform[0], y2 * viewportTransform[3]);
    ctx.stroke();
    ctx.restore();
  }

  var afterRenderActions = [],
    isInVerticalCenter,
    isInHorizontalCenter;

  canvas.on('mouse:down', function () {
    viewportTransform = canvas.viewportTransform;
  });

  canvas.on('object:moving', function (e) {

    var object = e.target,
      objectCenter = object.getCenterPoint(),
      transform = canvas._currentTransform;

    if (!transform) return;

    (isInVerticalCenter = Math.round(objectCenter.x) in canvasWidthCenterMap),
      (isInHorizontalCenter =
        Math.round(objectCenter.y) in canvasHeightCenterMap);

    if (isInHorizontalCenter || isInVerticalCenter) {
      object.setPositionByOrigin(
        new fabric.Point(
          isInVerticalCenter ? canvasWidthCenter : objectCenter.x,
          isInHorizontalCenter ? canvasHeightCenter : objectCenter.y
        ),
        'center',
        'center'
      );
    }
  });

  canvas.on('before:render', function () {
    canvas?.clearContext(ctx);
  });

  canvas.on('after:render', function () {
    if (isInVerticalCenter) {
      showVerticalCenterLine();
    }
    if (isInHorizontalCenter) {
      showHorizontalCenterLine();
    }
  });

  canvas.on('mouse:up', function () {
    // clear these values, to stop drawing guidelines once mouse is up
    isInVerticalCenter = isInHorizontalCenter = null;
    canvas.renderAll();
  });
}

export const canvasDynamicSize = (helperData) => {
  const { fabric } = helperData;
  if (window.innerWidth >= 800) {
    helperData.scope.currentRatio = 0.586;
    fabric.Object.prototype.cornerSize = 10 * 0.586;
  }
  if (window.innerWidth >= 1024) {
    helperData.scope.currentRatio = 0.75;
    fabric.Object.prototype.cornerSize = 10 * 0.75;
  }
  if (window.innerWidth >= 1280) {
    helperData.scope.currentRatio = 0.937;
    fabric.Object.prototype.cornerSize = 10 * 0.937;
  }

  if (window.innerWidth >= 1366) {
    helperData.scope.currentRatio = 1;
    fabric.Object.prototype.cornerSize = 10;
  }
  if (window.innerWidth >= 1400) {
    helperData.scope.currentRatio = 1.025;
    fabric.Object.prototype.cornerSize = 10 * 1.025;
  }
  if (window.innerWidth >= 1536) {
    helperData.scope.currentRatio = 1.124;
    fabric.Object.prototype.cornerSize = 10 * 1.124;
  }
  if (window.innerWidth >= 1600) {
    helperData.scope.currentRatio = 1.171;
    fabric.Object.prototype.cornerSize = 10 * 1.171;
  }
  if (window.innerWidth >= 1920) {
    helperData.scope.currentRatio = 1.405;
    fabric.Object.prototype.cornerSize = 10 * 1.405;
  }
  if (window.innerWidth >= 2560) {
    helperData.scope.currentRatio = 1.874;
    fabric.Object.prototype.cornerSize = 10 * 1.874;
  }
  if (window.innerWidth >= 3840) {
    helperData.scope.currentRatio = 2.811;
    fabric.Object.prototype.cornerSize = 10 * 2.811;
  }
}

export const setCanvasWidthHeight = (helperData) => {
  helperData.scope.canvas.setWidth(1200 * 4);
  helperData.scope.canvas.setHeight(700 * 4);
}

export const setControlVisibility = (object, rotate) => {
  object.setControlsVisibility({
    bl: true,
    br: true,
    tl: true,
    tr: true,
    mb: false,
    ml: false,
    mr: false,
    mt: false,
    mtr: rotate,
  });
}

export const isObjectIsPartOfMainShape = (obj) => {
  return (
    isObjectIsShape(obj) ||
    isObjectIsArrow(obj) ||
    obj?.objType === 'container-rect' ||
    obj?.objType === 'free-drawing' ||
    obj?.objType === 'uploaded-img' ||
    obj?.objType === 'uploaded-gif'
  );
}

export const removeTextEditingMode = (helperData) => {
  helperData.scope.canvas.getObjects().forEach((obj) => {
    if (obj?.objType === 'area-text') {
      if (obj.text === '') {
        obj.fill = 'grey';
        obj.text = 'Text..';
      }
    }
    if (obj?.type === 'textbox' && obj?.isEditing) {
      obj.exitEditing();
    }
  });
  helperData.scope.canvas.requestRenderAll();
}

export const createObjectOnMouseDown = (event, objectPos, onContainer = false, helperData) => {
  let permissionToDrawObject;
  if (onContainer) {
    permissionToDrawObject = true;
  } else {
    permissionToDrawObject = event.target === null ? true : false;
  }
  if (permissionToDrawObject) {
    if (helperData.scope.objectDataToBeFormedSingle === 'rect-group') {
      createRectangle(objectPos, helperData.scope.scopeOfThis());
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.objectDataToBeFormedSingle = '';
    } else if (helperData.scope.objectDataToBeFormedSingle === 'circle-group') {
      createCircle(objectPos, helperData.scope.scopeOfThis());
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.objectDataToBeFormedSingle = '';
    } else if (helperData.scope.objectDataToBeFormedSingle === 'triangle-group') {
      createTriangle(objectPos, helperData.scope.scopeOfThis());
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.objectDataToBeFormedSingle = '';
    } else if (helperData.scope.objectDataToBeFormedSingle === 'star-group') {
      createStars(objectPos, helperData.scope.scopeOfThis());
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.objectDataToBeFormedSingle = '';
    } else if (helperData.scope.objectDataToBeFormedSingle === 'square-group') {
      createSquare(objectPos, helperData.scope.scopeOfThis());
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.objectDataToBeFormedSingle = '';
    } else if (helperData.scope.objectDataToBeFormedSingle === 'hexagon-group') {
      createHexagon(objectPos, helperData.scope.scopeOfThis());
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.objectDataToBeFormedSingle = '';
    } else if (helperData.scope.objectDataToBeFormedSingle === 'diamond-group') {
      createDiamond(objectPos, helperData.scope.scopeOfThis());
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.objectDataToBeFormedSingle = '';
    } else if (helperData.scope.objectDataToBeFormedSingle === 'sticky-group') {
      createStickyNotes(helperData.scope.stickyInitialColor, objectPos, helperData.scope.scopeOfThis())
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.objectDataToBeFormedSingle = '';
    } else if (helperData.scope.objectDataToBeFormedSingle === 'textarea') {
      createdText(objectPos, helperData.scope.scopeOfThis());
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.objectDataToBeFormedSingle = '';
    } else if (helperData.scope.objectDataToBeFormedSingle === 'container-rect') {
      objectPos.centerPos = '11';
      containerOneByOne(true, objectPos, helperData.scope.scopeOfThis());
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.objectDataToBeFormedSingle = '';
    } else if (helperData.scope.objectDataToBeFormedSingle === 'container-onebytwo') {
      objectPos.centerPos = '12';
      containerOneByTwo(true, objectPos, helperData.scope.scopeOfThis());
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.objectDataToBeFormedSingle = '';
    } else if (helperData.scope.objectDataToBeFormedSingle === 'container-twobytwo') {
      objectPos.centerPos = '22';
      containerTwoByTwo(true, objectPos, helperData.scope.scopeOfThis());
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.objectDataToBeFormedSingle = '';
    }
  }
  helperData.scope.updateMiniMap();
}
export const createObjectOnDblClick = (events, objectPos, onContainer = false, helperData) => {
  let permissionToDrawObject;
  if (onContainer) {
    permissionToDrawObject = true;
  } else {
    permissionToDrawObject = events.target === null ? true : false;
  }
  if (permissionToDrawObject) {
    if (helperData.scope.objectDataToBeFormed === 'rect-group') {
      createRectangle(objectPos, helperData.scope.scopeOfThis());
    } else if (helperData.scope.objectDataToBeFormed === 'circle-group') {
      createCircle(objectPos, helperData.scope.scopeOfThis());
    } else if (helperData.scope.objectDataToBeFormed === 'triangle-group') {
      createTriangle(objectPos, helperData.scope.scopeOfThis());
    } else if (helperData.scope.objectDataToBeFormed === 'star-group') {
      createStars(objectPos, helperData.scope.scopeOfThis());
    } else if (helperData.scope.objectDataToBeFormed === 'square-group') {
      createSquare(objectPos, helperData.scope.scopeOfThis());;
    } else if (helperData.scope.objectDataToBeFormed === 'hexagon-group') {
      createHexagon(objectPos, helperData.scope.scopeOfThis());
    } else if (helperData.scope.objectDataToBeFormed === 'diamond-group') {
      createDiamond(objectPos, helperData.scope.scopeOfThis());
    } else if (helperData.scope.objectDataToBeFormed === 'sticky-group') {
      createStickyNotes(helperData.scope.stickyInitialColor, objectPos, helperData.scope.scopeOfThis())
    } else if (helperData.scope.objectDataToBeFormed === 'textarea') {
      createdText(objectPos, helperData.scope.scopeOfThis());
    } else if (helperData.scope.objectDataToBeFormed === 'container-rect') {
      objectPos.centerPos = '11';
      containerOneByOne(true, objectPos, helperData.scope.scopeOfThis());
    } else if (helperData.scope.objectDataToBeFormed === 'container-onebytwo') {
      objectPos.centerPos = '12';
      containerOneByTwo(true, objectPos, helperData.scope.scopeOfThis());
    } else if (helperData.scope.objectDataToBeFormed === 'container-twobytwo') {
      objectPos.centerPos = '22';
      containerTwoByTwo(true, objectPos, helperData.scope.scopeOfThis());
    }

    clearInterval(helperData.scope.objectCreateOnDblClickDeboucingTimer);
    helperData.scope.objectCreateOnDblClickDeboucingTimer = setTimeout(() => {
      helperData.scope.updateMiniMap();
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    }, 800);
  }
}

export const handleCreatingControlPointsOnArrows = (object, helperData) => {
  if (object?.identity === "straight-type") {
    const arrow = objectOnCanvasExistOrNot(object.UID, "straight-arrow-line", helperData)
    addControlPointsForStraightArrow(arrow, helperData)
  } else if (object?.identity === "z-type") {
    const arrow = objectOnCanvasExistOrNot(object.UID, "z-arrow-line", helperData)
    addControlPointsForZArrow(arrow, helperData)
  }
}

export const setStrokeAndStrokeWidthFromToolbar = (shape, helperData) => {
  const { $ } = helperData;
  let stroke = $(`div[id=${shape.UID}]`).find('.border-color-shape').css('border-color')
  if (stroke === "rgb(33, 37, 41)") {
    shape.set({
      stroke: null
    })
  } else {
    shape.set({
      stroke: stroke
    })
  }

}

export const setContainerNonSelectable = (helperData) => {
  helperData.scope.canvas.getObjects().forEach((obj) => {
    if (obj?.objType === 'container-rect') {
      obj.set({ selectable: false, evented: false });
    }
  });
  helperData.scope.canvas.requestRenderAll();
}

export const setContainerSelectable = (helperData) => {
  helperData.scope.canvas.getObjects().forEach((obj) => {
    if (obj?.objType === 'container-rect') {
      obj.set({ selectable: true, evented: true });
    }
  });
  helperData.scope.canvas.requestRenderAll();
}


export const whileMouseDown = (caseType, helperData) => {
  const { fabric } = helperData
  const units = 10;
  let delta;
  if (caseType == 'right') {
    delta = new fabric.Point(-units, 0);
  }
  if (caseType == 'left') {
    delta = new fabric.Point(units, 0);
  }
  if (caseType == 'bottom') {
    delta = new fabric.Point(0, -units);
  }
  if (caseType == 'top') {
    delta = new fabric.Point(0, units);
  }
  helperData.scope.canvas.relativePan(delta);
}

export const randomColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  const hexcolor = '#' + randomColor;
  const r = parseInt(hexcolor.substr(1, 2), 16);
  const g = parseInt(hexcolor.substr(3, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 40 ? '#2980b9' : hexcolor;
}

export const getObjectsContainedInContainer = (container, matchedData, allContainerObjects, helperData) => {
  let centerPos = container.getCenterPoint();
  let containerCordinates = container.aCoords;

  let xStart = containerCordinates.tl.x;
  let xEnd = containerCordinates.tr.x;
  let yStart = containerCordinates.tl.y;
  let yEnd = containerCordinates.bl.y;

  let containerIndex = helperData.scope.canvas.getObjects().indexOf(container);
  helperData.scope.canvas.getObjects().forEach((obj) => {
    let objectIndex = helperData.scope.canvas.getObjects().indexOf(obj);

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
            .find((ob) => ob?.UID === obj?.UID && ob?.type === 'textbox');
          allShapeWithText.push(textObj);
          allShapeWithText.forEach((obj) => {
            matchedData.push({
              diffX: obj.left - centerPos.x,
              diffY: obj.top - centerPos.y,
              object: obj,
            });
            let object = allContainerObjects.find((o) => {
              return o?.UID === obj.UID && o?.objType === obj.objType;
            });
            if (!object) {
              allContainerObjects.push(obj);
              // helperData.scope.canvas.bringToFront(obj);
            }
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
              (ob) => ob?.UID === obj?.UID && ob?.objType === 'container-text'
            );
          let lineObj = helperData.scope.canvas
            .getObjects()
            .find(
              (ob) => ob?.UID === obj?.UID && ob?.objType === 'container-line'
            );
          allShapeWithText.push(textObj);
          allShapeWithText.push(lineObj);
          allShapeWithText.forEach((obj) => {
            matchedData.push({
              diffX: obj.left - centerPos.x,
              diffY: obj.top - centerPos.y,
              object: obj,
            });
            let object = allContainerObjects.find((o) => {
              return o?.UID === obj.UID && o?.objType === obj.objType;
            });
            if (!object) {
              allContainerObjects.push(obj);
              // helperData.scope.canvas.bringToFront(obj);
            }
          });
        }
      } else if (
        obj.objType === 'uploaded-img' ||
        obj.objType === 'uploaded-gif' ||
        obj.objType === 'free-drawing'
      ) {
        let objCoords = obj.aCoords;
        if (
          objCoords.tl.x > xStart &&
          objCoords.tr.x < xEnd &&
          objCoords.tl.y > yStart &&
          objCoords.bl.y < yEnd
        ) {
          matchedData.push({
            diffX: obj.left - centerPos.x,
            diffY: obj.top - centerPos.y,
            object: obj,
          });
          let object = allContainerObjects.find((o) => {
            return o?.UID === obj.UID && o?.objType === obj.objType;
          });
          if (!object) {
            allContainerObjects.push(obj);
            // helperData.scope.canvas.bringToFront(obj);
          }
        }
      } else if (isObjectIsArrow(obj)) {
        let objCoords = obj.aCoords;
        if (
          objCoords.tl.x > xStart &&
          objCoords.tr.x < xEnd &&
          objCoords.tl.y > yStart &&
          objCoords.bl.y < yEnd
        ) {
          helperData.scope.canvas.getObjects().forEach((ob) => {
            if (obj?.UID === ob?.UID) {
              matchedData.push({
                diffX: ob.left - centerPos.x,
                diffY: ob.top - centerPos.y,
                object: ob,
              });
              let object = allContainerObjects.find((o) => {
                return o?.UID === ob.UID && o?.objType === ob.objType;
              });
              if (!object) {
                allContainerObjects.push(ob);
                // helperData.scope.canvas.bringToFront(obj);
              }
            }
          });
        }
      }
    }
  });

  return matchedData;
}

export const getCurrentMiddlePosOfCanvas = (helperData) => {
  const { $, fabric } = helperData
  let leftPos =
    $('.canvas-content')[0].scrollLeft +
    window.innerWidth -
    window.innerWidth / 2;
  let topPos =
    $('.canvas-content')[0].scrollTop +
    window.innerHeight -
    window.innerHeight / 2;
  let point = fabric.util.transformPoint(
    new fabric.Point(leftPos, topPos),
    fabric.util.invertTransform(helperData.scope.canvas.viewportTransform)
  );
  return point;
}

