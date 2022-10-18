import { shapeToolbarGeneratorHandler } from '../helper-function/shape-toolbar';
import { shapesEventManager } from '../helper-function/shape-toolbar';
import { emitObjectAdded } from '../socket-events/socket-emit';
export const createStickyNotes = (
  color,
  objectPos = null,
  helperData
) => {
  const {fabric}  = helperData;
  let shadow = new fabric.Shadow({
    color: '#808080',
    blur: 5,
    offsetY: 8,
  });
  let UID = new Date().getTime();
  let stickyNotes = new fabric.Rect({
    fill: color,
    width: 150,
    height: 150,
    originX: 'center',
    originY: 'center',
    objType: 'sticky-shape',
    noScaleCache: false,
    strokeUniform: true,
    top: objectPos.top,
    left: objectPos.left,
    borderType: 'straight',
    strokeWidth: 1,
    realStroke: '1',
    UID,
    shadow,
    lockScalingFlip: true,
    selectMe: true,
    matchedLine: true,
  });
  let centerPos = stickyNotes.getCenterPoint();
  let text = new fabric.Textbox('', {
    width: stickyNotes.width,
    fontSize: 20,
    originX: 'center',
    originY: 'center',
    editable: true,
    objType: 'sticky-text',
    fontFamily: 'Arial',
    actualFontSize: 20,
    fontWeight: 'normal',
    textAlign: 'center',
    top: centerPos.y,
    left: centerPos.x,
    hasControls: false,
    hasBorders: false,
    scaleX: stickyNotes.scaleX,
    scaleY: stickyNotes.scaleY,
    hoverCursor: 'auto',
    UID,
    id: 'text',
    selectMe: true,
    matchedLine: false,
  });
  
  helperData.scope.canvas.add(stickyNotes, text);
  helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
  let mainToolbarDiv = shapeToolbarGeneratorHandler(
    helperData.scope.currentRatio,
    stickyNotes,
    text,
    null,
    null,
    helperData
  );
  shapesEventManager(stickyNotes, text, mainToolbarDiv, helperData);
  text.enterEditing();
  emitObjectAdded([stickyNotes, text],helperData);
  //   // this.updatehelperData.helperData.scope.canvasState();
  //   this.updateUndoRedoState([stickyNotes,text])
};

export const reCreateStickyNotes = (data, actualServer = false, helperData) => {
  let [shape, textData] = data;
  const { fabric } = helperData;

  let shadow = new fabric.Shadow({
    color: '#808080',
    blur: 5,
    offsetY: 8,
  });
  let stickyNotes = new fabric.Rect({
    fill: shape.fill,
    width: shape.width,
    height: shape.height,
    originX: shape.originX,
    originY: shape.originY,
    objType: shape.objType,
    objreferenceLink: shape.objreferenceLink,
    noScaleCache: false,
    strokeUniform: true,
    shadow: shadow,
    strokeDashArray: shape.strokeDashArray,
    strokeWidth: shape.strokeWidth,
    stroke: shape.stroke,
    realStroke: shape.realStroke,
    borderType: shape.borderType,
    UID: shape.UID,
    top: shape.top,
    left: shape.left,
    scaleX: shape.scaleX,
    scaleY: shape.scaleY,
    angle: shape.angle,
    lockScalingFlip: true,
    lockMovementX: shape.lockMovementX,
    lockMovementY: shape.lockMovementY,
    lockRotation: shape.lockRotation,
    lockScalingX: shape.lockScalingX,
    lockScalingY: shape.lockScalingY,
    cornerStrokeColor: shape.cornerStrokeColor,
    borderColor: shape.borderColor,
    editable: shape.editable,
    selectMe: shape.selectMe,
    matchedLine: shape.matchedLine,
  });
  let centerPos = stickyNotes.getCenterPoint();

  let text = new fabric.Textbox(textData.text, {
    width: textData.width,
    fontSize: textData.fontSize,
    originX: textData.originX,
    originY: textData.originY,
    hasBorders: false,
    hasControls: false,
    objType: textData.objType,
    actualFontSize: textData.actualFontSize,
    fontWeight: textData.fontWeight,
    textAlign: textData.textAlign,
    fontFamily: textData.fontFamily,
    realStroke: textData.realStroke,
    underline: textData.underline,
    fill: textData.fill,
    fixedWidth: textData.fixedWidth,
    fixedHeight: textData.fixedHeight,
    UID: textData.UID,
    top: centerPos.y,
    left: centerPos.x,
    stroke: textData.stroke,
    lockMovementX: textData.lockMovementX,
    lockMovementY: textData.lockMovementY,
    id: textData.id,
    editable: textData.editable,
    hoverCursor: textData.hoverCursor,
    scaleX: textData.scaleX,
    scaleY: textData.scaleY,
    angle: textData.angle,
    matchedLine: textData.matchedLine,
    selectMe: shape.selectMe,
  });
  helperData.scope.canvas.add(stickyNotes, text);
  let mainToolbarDiv = shapeToolbarGeneratorHandler(
    helperData.scope.currentRatio,
    stickyNotes,
    text,
    null,
    true,
    helperData
  );
  shapesEventManager(stickyNotes, text, mainToolbarDiv, helperData);
  emitObjectAdded([stickyNotes, text], helperData);
};
