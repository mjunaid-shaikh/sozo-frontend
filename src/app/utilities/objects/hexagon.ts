import {shapeToolbarGeneratorHandler} from "../helper-function/shape-toolbar"
import {regularPolygonPoints} from "../helper-function/general-helper"
import {shapesEventManager} from "../helper-function/shape-toolbar"
import { emitObjectAdded } from "../socket-events/socket-emit"

export const createHexagon = (
  objectPos = null,
  helperData
) => {
  const {fabric} = helperData
  let UID = new Date().getTime();
  let points = regularPolygonPoints(6, 80);
  let hexagon = new fabric.Polygon(
    points,
    {
      stroke: 'black',
      strokeWidth: 1,
      noScaleCache: false,
      strokeUniform: true,
      objType: 'hexa-shape',
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
    },
    false
  );

  let centerPos = hexagon.getCenterPoint();
  let text = new fabric.Textbox('', {
    width: hexagon.width,
    fontSize: 20,
    originX: 'center',
    fontFamily: 'Arial',
    originY: 'center',
    objType: 'hexa-text',
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
  helperData.scope.canvas.add(hexagon, text);
  // shouldSavedWithImage && saveMsg();
  let mainToolbarDiv = shapeToolbarGeneratorHandler(
    helperData.scope.currentRatio,
    hexagon,
    text,
    null,null,
    helperData
  );
  shapesEventManager(hexagon, text, mainToolbarDiv,helperData);
  text.enterEditing();
  emitObjectAdded([hexagon, text],helperData);
  // updateCanvasState();
}

export const reCreateHexagon = (data, actualServer = false,helperData)=>  {
    let points = regularPolygonPoints(6, 80);
    let [shape, textData] = data;
    const {fabric} = helperData

    let hexa = new fabric.Polygon(points, {
      fill: shape.fill,
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
    let centerPos = hexa.getCenterPoint();

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
    helperData.scope.canvas.add(hexa, text);
    let mainToolbarDiv = shapeToolbarGeneratorHandler(
        helperData.scope.currentRatio,
      hexa,
      text,
      null,
      true,
      helperData
    );
    shapesEventManager(hexa, text, mainToolbarDiv,helperData);
  }