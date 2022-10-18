import {shapeToolbarGeneratorHandler} from '../helper-function/shape-toolbar'
import {shapesEventManager} from "../helper-function/shape-toolbar"
import { emitObjectAdded } from '../socket-events/socket-emit';


export const createSquare = (
  objectPos = null,
  helperData
) => {
  const {fabric} = helperData
  let UID = new Date().getTime();
  let square = new fabric.Rect({
    width: 200,
    height: 200,
    stroke: 'black',
    strokeWidth: 1,
    noScaleCache: false,
    strokeUniform: true,
    objType: 'square-shape',
    fill: '#fff',
    realStroke: '1',
    originX: 'center',
    originY: 'center',
    borderType: 'straight',
    UID,
    top: objectPos.top,
    left: objectPos.left,
    lockScalingFlip: true,
    selectMe: true,
    matchedLine: true,
  });

  let centerPos = square.getCenterPoint();
  let text = new fabric.Textbox('', {
    width: square.width,
    fontSize: 20,
    originX: 'center',
    fontFamily: 'Arial',
    originY: 'center',
    objType: 'square-text',
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
  helperData.scope.canvas.add(square, text);
  // shouldSavedWithImage && saveMsg();
  let mainToolbarDiv = shapeToolbarGeneratorHandler(
    helperData.scope.currentRatio,
    square,
    text,
    null,null,
    helperData
  );
  shapesEventManager(square, text, mainToolbarDiv,helperData);
  text.enterEditing();
  emitObjectAdded([square, text],helperData);
  // updateCanvasState();
}

export const reCreateSquare = (data, actualServer = false,helperData) => {
    let [shape, textData] = data;
    const {fabric} = helperData

    let square = new fabric.Rect({
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
      matchedLine: shape.matchedLine,
    });
    let centerPos = square.getCenterPoint();

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
    helperData.scope.canvas.add(square, text);
    let mainToolbarDiv = shapeToolbarGeneratorHandler(
      helperData.scope.currentRatio,
      square,
      text,
      null,
      true,
      helperData
    );
    shapesEventManager(square, text, mainToolbarDiv,helperData);
  }