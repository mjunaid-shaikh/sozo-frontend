import {shapeToolbarGeneratorHandler} from '../helper-function/shape-toolbar'
import {shapesEventManager} from "../helper-function/shape-toolbar"
import { emitObjectAdded } from '../socket-events/socket-emit';

export const createTriangle = (
  objectPos = null,
  helperData
) => {
  const {fabric} = helperData
  let UID = new Date().getTime();
  let triangle = new fabric.Triangle({
    top: objectPos.top,
    left: objectPos.left,
    width: 200,
    height: 200,
    stroke: 'black',
    noScaleCache: false,
    strokeUniform: true,
    objType: 'triangle-shape',
    fill: '#fff',
    strokeWidth: 1,
    realStroke: '1',
    originX: 'center',
    originY: 'center',
    borderType: 'straight',
    UID,
    lockScalingFlip: true,
    selectMe: true,
    matchedLine: true,
  });

  let centerPos = triangle.getCenterPoint();
  let text = new fabric.Textbox('', {
    width: triangle.width,
    fontSize: 20,
    originX: 'center',
    fontFamily: 'Arial',
    originY: 'center',
    objType: 'triangle-text',
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
  helperData.scope.canvas.add(triangle, text);
  // shouldSavedWithImage && saveMsg();
  let mainToolbarDiv = shapeToolbarGeneratorHandler(
    helperData.scope.currentRatio,
    triangle,
    text,
    null,null,
    helperData
  );
  shapesEventManager(triangle, text, mainToolbarDiv,helperData);
  text.enterEditing();
  emitObjectAdded([triangle, text],helperData);
  // updateCanvasState();
}
export const reCreateTriangle = (data, actualServer = false,helperData)=> {
    let [shape, textData] = data;
    const {fabric} = helperData
    let triangle = new fabric.Triangle({
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
      selectMe: shape.selectMe,
    });
    let centerPos = triangle.getCenterPoint();

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
    helperData.scope.canvas.add(triangle, text);
    let mainToolbarDiv = shapeToolbarGeneratorHandler(
      helperData.scope.currentRatio,
      triangle,
      text,
      null,
      true,
      helperData
    );
    shapesEventManager(triangle, text, mainToolbarDiv,helperData);
  }