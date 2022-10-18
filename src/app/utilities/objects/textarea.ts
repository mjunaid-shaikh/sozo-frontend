import { shapesEventManager, shapeToolbarGeneratorHandler } from "../helper-function/shape-toolbar";
import { emitObjectAdded } from "../socket-events/socket-emit";

export const createdText = (objectPos = null,helperData) => {
    const {fabric} = helperData
    helperData.scope.canvas.set({ hoverCursor: 'all-scroll' });

    let UID = new Date().getTime();
    let rect = new fabric.Rect({
      width: 180,
      height: 50,
      stroke: 'white',
      strokeWidth: 1,
      realStroke: '1',
      noScaleCache: false,
      strokeUniform: true,
      objType: 'area-shape',
      top: objectPos.top,
      left: objectPos.left,
      fill: 'transparent',
      originX: 'center',
      originY: 'center',
      borderType: 'straight',
      UID,
      selectMe: true,
      lockScalingFlip: true,
      matchedLine: true,
    });
    let centerPos = rect.getCenterPoint();
    let text = new fabric.Textbox('Text..', {
      top: centerPos.y,
      left: centerPos.x,
      fontFamily: 'Arial',
      fill: 'grey',
      width: rect.width,
      fontSize: 20,
      actualFontSize: '20',
      fontWeight: 'normal',
      noScaleCache: false,
      textAlign: 'left',
      objType: 'area-text',
      UID: UID,
      selectMe: true,
      originX: 'center',
      originY: 'center',
      hasControls: false,
      hasBorders: false,
      matchedLine: false,
    });
    helperData.scope.canvas.add(rect, text);
    // helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    emitObjectAdded([rect, text],helperData);
    let mainToolbarDiv = shapeToolbarGeneratorHandler(
      helperData.scope.currentRatio,
      rect,
      text,
      null,
      null,
      helperData
    );
    shapesEventManager(rect, text, mainToolbarDiv,helperData);
    // updateCanvasState();
  }

 export const reCreateText = (data,helperData) => {
  let [rectData, textData] = data;
  const {fabric} = helperData;
  let rect = new fabric.Rect({
    width: rectData.width,
    height: rectData.height,
    stroke: rectData.stroke,
    strokeWidth: rectData.strokeWidth,
    realStroke: rectData.realStroke,
    objreferenceLink: rectData.objreferenceLink,
    noScaleCache: false,
    strokeUniform: true,
    objType: rectData.objType,
    top: rectData.top,
    left: rectData.left,
    fill: rectData.fill,
    originX: rectData.originX,
    originY: rectData.originY,
    borderType: rectData.borderType,
    UID: rectData.UID,
    selectMe: rectData.selectMe,
    lockScalingFlip: true,
    lockMovementX: rectData.lockMovementX,
    lockMovementY: rectData.lockMovementY,
    lockRotation: rectData.lockRotation,
    lockScalingX: rectData.lockScalingX,
    lockScalingY: rectData.lockScalingY,
    cornerStrokeColor: rectData.cornerStrokeColor,
    borderColor: rectData.borderColor,
    scaleX: rectData.scaleX,
    scaleY: rectData.scaleY,
    angle: rectData.angle,
    matchedLine: rectData.matchedLine,
  });
  let centerPos = rect.getCenterPoint();

  let text = new fabric.Textbox(textData.text, {
    top: centerPos.y,
    left: centerPos.x,
    fontFamily: textData.fontFamily,
    fill: textData.fill,
    width: textData.width,
    fontSize: textData.fontSize,
    actualFontSize: textData.actualFontSize,
    fontWeight: textData.fontWeight,
    noScaleCache: textData.noScaleCache,
    textAlign: textData.textAlign,
    objType: textData.objType,
    realStroke: textData.realStroke,
    underline: textData.underline,
    stroke: textData.stroke,
    UID: textData.UID,
    selectMe: textData.selectMe,
    originX: textData.originX,
    originY: textData.originY,
    id: textData.id,
    scaleX: textData.scaleX,
    scaleY: textData.scaleY,
    angle: textData.angle,
    lockScalingFlip: true,
    editable: textData.editable,
    hasControls: textData.hasControls,
    hasBorders: textData.hasBorders,
    lockMovementX: textData.lockMovementX,
    lockMovementY: textData.lockMovementY,
    matchedLine: textData.matchedLine,
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