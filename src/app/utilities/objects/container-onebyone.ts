import { containersEventManager, shapeToolbarGeneratorHandler } from "../helper-function/shape-toolbar";
import { emitObjectAdded } from "../socket-events/socket-emit";

export const containerOneByOne = (multiple = false, objectPos = null,helperData) => {
    let top, left;
    if (multiple) {
      if (objectPos?.centerPos === '11') {
        top = objectPos.top - 600 / 2;
        left = objectPos.left - 550 / 2;
      } else if (objectPos?.centerPos === '12') {
        top = objectPos.top - 600 / 2;
        left = objectPos.left - 550 - 10;
      } else if (objectPos?.centerPos === '22') {
        top = objectPos.top - 600 - 10;
        left = objectPos.left - 550 - 10;
      }
    } else {
      top = objectPos.top;
      left = objectPos.left;
    }
    const {fabric} = helperData
    let UID = new Date().getTime();
    let container = new fabric.Rect({
      height: 600,
      width: 550,
      strokeWidth: 2,
      fill: 'white',
      stroke: 'black',
      objType: 'container-rect',
      realStroke: '1',
      hasBorders: false,
      lockScalingFlip: true,
      noScaleCache: false,
      strokeUniform: true,
      top: top,
      left: left,
      lockRotation: true,
      UID,
      selectMe: true,
      matchedLine: true,
    });
    helperData.scope.canvas.add(container);

    let rectLine = container.height / 12;
    let containerInitialCenterPos = container.getCenterPoint();
    let x1 = container.left;
    let y1 = container.top + rectLine;
    let x2 = container.left + container.width;
    let y2 = container.top + rectLine;

    let line = new fabric.Line([x1, y1, x2, y2], {
      stroke: 'black',
      strokeWidth: 2,
      strokeDashArray: [],
      objType: 'container-line',
      hasControls: false,
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true,
      originX: 'center',
      originY: 'center',
      UID,
      selectMe: true,
      matchedLine: false,
    });
    let text = new fabric.Textbox('', {
      fontSize: 20,
      width: container.width - 20,
      objType: 'container-text',
      actualFontSize: 20,
      fontWeight: 'normal',
      textAlign: 'left',
      realStroke: '1',
      top: container.top + rectLine / 2,
      left: containerInitialCenterPos.x,
      hasBorders: false,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true,
      fontFamily: 'Arial',
      originX: 'center',
      originY: 'center',
      UID,
      selectMe: true,
      matchedLine: false,
    });
    helperData.scope.canvas.add(line);
    helperData.scope.canvas.add(text);
    text.enterEditing();
    let mainToolbarDiv = shapeToolbarGeneratorHandler(
      helperData.scope.currentRatio,
      container,
      text,
      null,null,
      helperData
    );
    containersEventManager(
      container,
      text,
      line,
      rectLine,
      mainToolbarDiv,
      helperData
    );
    emitObjectAdded({
      objType: 'container',
      objects: [container, text, line],
    },helperData);
    // shouldSavedWithImage && saveMsg();
    // updateCanvasState();
    return container;
  }

  export const reCreateOneByOneContainer = (group, samePosition = null,helperData) => {
    const [rectData, textData, lineData] = group;
    const {fabric} = helperData
    let container = new fabric.Rect({
      id:rectData.id,
      height: rectData.height,
      width: rectData.width,
      strokeWidth: rectData.strokeWidth,
      fill: rectData.fill,
      stroke: rectData.stroke,
      objType: rectData.objType,
      realStroke: rectData.realStroke,
      objreferenceLink: rectData.objreferenceLink,
      hasBorders: false,
      lockScalingFlip: true,
      noScaleCache: false,
      strokeUniform: true,
      top: rectData.top,
      left: rectData.left,
      UID: rectData.UID,
      selectMe: rectData.selectMe,
      scaleX: rectData.scaleX,
      scaleY: rectData.scaleY,
      lockMovementX: rectData.lockMovementX,
      lockMovementY: rectData.lockMovementY,
      lockRotation: rectData.lockRotation,
      lockScalingX: rectData.lockScalingX,
      lockScalingY: rectData.lockScalingY,
      cornerStrokeColor: rectData.cornerStrokeColor,
      borderColor: rectData.borderColor,
      matchedLine: rectData.matchedLine,
    });
    samePosition
      ? helperData.scope.canvas.insertAt(container, samePosition)
      : helperData.scope.canvas.add(container);
    let rectLine = container.height / 12;
    let containerInitialCenterPos = container.getCenterPoint();
    let x1 = container.left;
    let y1 = container.top + rectLine;
    let x2 = container.aCoords.tr.x;
    let y2 = container.top + rectLine;

    let line = new fabric.Line([x1, y1, x2, y2], {
      stroke: lineData.stroke,
      strokeWidth: lineData.strokeWidth,
      strokeDashArray: lineData.strokeDashArray,
      objType: lineData.objType,
      hasControls: false,
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true,
      originX: lineData.originX,
      originY: lineData.originY,
      UID: lineData.UID,
      selectMe: lineData.selectMe,
      matchedLine: lineData.matchedLine,
    });

    let text = new fabric.Textbox('', {
      fontSize: textData.fontSize,
      width: textData.width,
      objType: textData.objType,
      actualFontSize: textData.actualFontSize,
      fontWeight: textData.fontWeight,
      textAlign: textData.textAlign,
      text: textData.text,
      fill: textData.fill,
      underline: textData.underline,
      realStroke: textData.realStroke,
      top: container.top + rectLine / 2,
      left: containerInitialCenterPos.x,
      hasBorders: false,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true,
      fontFamily: textData.fontFamily,
      originX: textData.originX,
      originY: textData.originY,
      UID: textData.UID,
      selectMe: textData.selectMe,
      matchedLine: textData.matchedLine,
    });
    samePosition
      ? helperData.scope.canvas.insertAt(line, samePosition + 1)
      : helperData.scope.canvas.add(line);
    samePosition
      ? helperData.scope.canvas.insertAt(text, samePosition + 2)
      : helperData.scope.canvas.add(text);
    let mainToolbarDiv = shapeToolbarGeneratorHandler(
      helperData.scope.currentRatio,
      container,
      text,
      null,
      true,
      helperData
    );
    containersEventManager(
      container,
      text,
      line,
      rectLine,
      mainToolbarDiv,
      helperData
    );
  }