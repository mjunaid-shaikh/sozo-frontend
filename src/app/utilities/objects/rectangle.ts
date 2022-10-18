import {shapeToolbarGeneratorHandler} from "../helper-function/shape-toolbar"
import {shapesEventManager} from "../helper-function/shape-toolbar"
import { emitObjectAdded } from "../socket-events/socket-emit";

export const createRectangle = (
  objectPos = null,
  helperData
) => {
  const {fabric} =  helperData;
  let UID = new Date().getTime();
  let rect = new fabric.Rect({
    width: 250,
    height: 125,
    stroke: 'black',
    strokeWidth: 1,
    realStroke: '1',
    noScaleCache: false,
    strokeUniform: true,
    objType: 'rect-shape',
    top: objectPos.top,
    left: objectPos.left,
    fill: '#fff',
    originX: 'center',
    originY: 'center',
    borderType: 'straight',
    UID,
    selectMe: true,
    lockScalingFlip: true,
    matchedLine: true,
  });
  let centerPos = rect.getCenterPoint();
  let text = new fabric.Textbox('', {
    width: rect.width,
    fontSize: 20,
    originX: 'center',
    fontFamily: 'Arial',
    originY: 'center',
    objType: 'rect-text',
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
  helperData.scope.canvas.add(rect, text);
  // shouldSavedWithImage && saveMsg();
  let mainToolbarDiv = shapeToolbarGeneratorHandler(
    helperData.scope.currentRatio,
    rect,
    text,
    null,null,
    helperData
  );
  shapesEventManager(rect, text, mainToolbarDiv,helperData);
  text.enterEditing();
  emitObjectAdded([rect, text],helperData);
  // updateCanvasState();
}
export const reCreateRectangle = (data, actualServer = false,helperData) => {
    let [shape, textData] = data;
    const {fabric} = helperData
  // console.log(shape)
    let rect = new fabric.Rect({
      fill: shape.fill,
      width: shape.width,
      height: shape.height,
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
    });
    let centerPos = rect.getCenterPoint();

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
    helperData.scope.canvas.add(rect, text);
    let mainToolbarDiv = shapeToolbarGeneratorHandler(
      helperData.scope.currentRatio,
      rect,
      text,
      null,
      true,
      helperData
    );
    shapesEventManager(rect, text, mainToolbarDiv,helperData);
  }