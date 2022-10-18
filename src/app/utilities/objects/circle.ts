import { shapeToolbarGeneratorHandler } from '../helper-function/shape-toolbar';
import { shapesEventManager } from '../helper-function/shape-toolbar';
import { emitObjectAdded } from '../socket-events/socket-emit';
export const createCircle = (
  objectPos = null,
  helperData
) => {
  const {fabric} = helperData
  let UID = new Date().getTime();
  let circle = new fabric.Circle({
    objType: 'circle-shape',
    top: objectPos.top,
    left: objectPos.left,
    fill: '#fff',
    radius: 100,
    stroke: 'black',
    noScaleCache: false,
    strokeUniform: true,
    strokeWidth: 1,
    realStroke: '1',
    borderType: 'straight',
    originX: 'center',
    originY: 'center',
    strokeDashArray: '',
    UID,
    lockScalingFlip: true,
    selectMe: true,
    matchedLine: true,
  });
  let centerPos = circle.getCenterPoint();
  let text = new fabric.Textbox('', {
    width: circle.radius * 2,
    fontSize: 20,
    originX: 'center',
    fontFamily: 'Arial',
    originY: 'center',
    objType: 'circle-text',
    actualFontSize: 20,
    fontWeight: 'normal',
    textAlign: 'center',
    top: centerPos.y,
    left: centerPos.x,
    realStroke: '1',
    hasControls: false,
    hasBorders: false,
    // lockMovementX: true,
    // lockMovementY: true,
    hoverCursor: 'auto',
    UID,
    id: 'text',
    selectMe: true,
    matchedLine: false,
  });
  helperData.scope.canvas.add(circle, text);
  // shouldSavedWithImage && saveMsg();
  let mainToolbarDiv = shapeToolbarGeneratorHandler(
    helperData.scope.currentRatio,
    circle,
    text,
    null,null,
    helperData
  );
  shapesEventManager(circle, text, mainToolbarDiv,helperData);
  text.enterEditing();
  emitObjectAdded([circle, text],helperData);
  // updateCanvasState();
}

export const reCreateCircle = (data, actualServer = false, helperData) => {
  let [shape, textData] = data;
  const { fabric } = helperData;

  let circle = new fabric.Circle({
    fill: shape.fill,
    radius: shape?.radius ? shape?.radius : shape.width / 2,
    originX: shape.originX,
    originY: shape.originY,
    objType: shape.objType,
    objreferenceLink: shape.objreferenceLink,
    noScaleCache: false,
    strokeUniform: true,
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
    opacity:shape.opacity,
  });
  let centerPos = circle.getCenterPoint();

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
    matchedLine: textData.matchedLine,
    selectMe: shape.selectMe,
  });
  helperData.scope.canvas.add(circle, text);
  let mainToolbarDiv = shapeToolbarGeneratorHandler(
    helperData.scope.currentRatio,
    circle,
    text,
    null,
    true,
    helperData
  );
  shapesEventManager(circle, text, mainToolbarDiv, helperData);
};
