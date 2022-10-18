import { addingToolbarAndControlPointsOfStraightArrow, calcLengthAndAngleOfLine, removeObjectById, updateArrowHeadEnd, updateArrowHeadStart, updateArrowLinePosition } from "../helper-function/arrow-helper";
import { emitCreatedArrow } from "../socket-events/socket-emit";

export const createStraightArrow = (pointer,helperData) => {
    const {fabric} = helperData
    helperData.scope.canvas.selection = false;
    helperData.scope.isArrowDrawing = true;
    let UID = new Date().getTime();
    helperData.scope.arrowLine = new fabric.Line(
      [pointer.x, pointer.y, pointer.x, pointer.y],
      {
        UID,
        objType: 'straight-arrow-line',
        stroke: 'black',
        strokeWidth: helperData.scope.strokeWidthOfArrow,
        hasBorders: false,
        hasControls: false,
        originX: 'center',
        originY: 'center',
        perPixelTargetFind: true,
        selectMe: true,
        strokeDashArray: [],
      }
    );

    helperData.scope.arrowHeadStart = new fabric.Polygon(
      [
        { x: 0, y: 0 },
        {
          x: -helperData.scope.arrowHeadLengthFactor * helperData.scope.strokeWidthOfArrow,
          y: (-helperData.scope.strokeWidthOfArrow * helperData.scope.arrowHeadLengthFactor) / 2,
        },
        {
          x: -helperData.scope.arrowHeadLengthFactor * helperData.scope.strokeWidthOfArrow,
          y: (helperData.scope.strokeWidthOfArrow * helperData.scope.arrowHeadLengthFactor) / 2,
        },
      ],
      {
        UID,
        objType: 'arrow-head-start-type-one',
        stroke: 'black',
        strokeWidth: helperData.scope.strokeWidthOfArrow,
        fill: 'black',
        originX: 'center',
        originY: 'center',
        left: pointer.x,
        top: pointer.y,
        strokeUniform: true,
        // selectable: false,
        lockMovementX: true,
        lockMovementY: true,
        hasBorders: false,
        hasControls: false,
        identity: 'straight-type',
        label: 'left-arrow',
        selectMe: true,
      }
    );
    helperData.scope.arrowHeadEnd = new fabric.Polygon(
      [
        { x: 0, y: 0 },
        {
          x: -helperData.scope.arrowHeadLengthFactor * helperData.scope.strokeWidthOfArrow,
          y: (-helperData.scope.strokeWidthOfArrow * helperData.scope.arrowHeadLengthFactor) / 2,
        },
        {
          x: -helperData.scope.arrowHeadLengthFactor * helperData.scope.strokeWidthOfArrow,
          y: (helperData.scope.strokeWidthOfArrow * helperData.scope.arrowHeadLengthFactor) / 2,
        },
      ],
      {
        UID,
        objType: 'arrow-head-end-type-one',
        stroke: 'black',
        strokeWidth: helperData.scope.strokeWidthOfArrow,
        fill: 'black',
        originX: 'center',
        originY: 'center',
        left: pointer.x,
        top: pointer.y,
        strokeUniform: true,
        // selectable: false,
        lockMovementX: true,
        lockMovementY: true,
        hasBorders: false,
        hasControls: false,
        identity: 'straight-type',
        label: 'right-arrow',
        selectMe: true,
      }
    );
    helperData.scope.arrowHeadEndHollow = new fabric.Polygon(
      [
        { x: 0, y: 0 },
        {
          x: -helperData.scope.arrowLine.strokeWidth * 7,
          y: -helperData.scope.arrowLine.strokeWidth * 2,
        },
        {
          x: -helperData.scope.arrowLine.strokeWidth * 7,
          y: helperData.scope.arrowLine.strokeWidth * 2,
        },
      ],
      {
        stroke: '#black',
        fill: '#fff',
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        objType: 'arrow-straight-line-head-end-hollowtype',
        UID,
        top: pointer.y,
        left: pointer.x,
        originX: 'center',
        originY: 'center',
        selectMe: true,
        strokeWidth: helperData.scope.arrowLine.strokeWidth,
        identity: 'straight-type',
      }
    );

    helperData.scope.arrowHeadStartHollow = new fabric.Polygon(
      [
        { x: 0, y: 0 },
        {
          x: helperData.scope.arrowLine.strokeWidth * 7,
          y: -helperData.scope.arrowLine.strokeWidth * 2,
        },
        {
          x: helperData.scope.arrowLine.strokeWidth * 7,
          y: helperData.scope.arrowLine.strokeWidth * 2,
        },
      ],
      {
        stroke: 'black',
        fill: '#fff',
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        objType: 'arrow-straight-line-head-start-hollowtype',
        UID,
        top: pointer.y,
        left: pointer.x,
        originX: 'center',
        originY: 'center',
        selectMe: true,
        strokeWidth: helperData.scope.arrowLine.strokeWidth,
        identity: 'straight-type',
      }
    );

    helperData.scope.arrowHeadEndLine = new fabric.Polygon(
      [
        { x: 0, y: 0 },
        {
          x: -helperData.scope.arrowLine.strokeWidth * 7,
          y: -helperData.scope.arrowLine.strokeWidth * 2,
        },
        {
          x: -helperData.scope.arrowLine.strokeWidth * 7,
          y: -helperData.scope.arrowLine.strokeWidth * 2 + helperData.scope.arrowLine.strokeWidth,
        },
        { x: -helperData.scope.arrowLine.strokeWidth, y: 0 },
        {
          x: -helperData.scope.arrowLine.strokeWidth * 7,
          y: helperData.scope.arrowLine.strokeWidth * 2 - helperData.scope.arrowLine.strokeWidth,
        },
        {
          x: -helperData.scope.arrowLine.strokeWidth * 7,
          y: helperData.scope.arrowLine.strokeWidth * 2,
        },
        { x: 0, y: 0 },
      ],
      {
        fill: 'black',
        stroke: 'black',
        top: pointer.y,
        left: pointer.x,
        originX: 'center',
        originY: 'center',
        objType: 'arrow-straight-line-head-end-linetype',
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        selectMe: true,
        UID,
        identity: 'straight-type',
      }
    );

    helperData.scope.arrowHeadStartLine = new fabric.Polygon(
      [
        { x: 0, y: 0 },
        {
          x: helperData.scope.arrowLine.strokeWidth * 7,
          y: -helperData.scope.arrowLine.strokeWidth * 2,
        },
        {
          x: helperData.scope.arrowLine.strokeWidth * 7,
          y: -helperData.scope.arrowLine.strokeWidth * 2 + helperData.scope.arrowLine.strokeWidth,
        },
        { x: helperData.scope.arrowLine.strokeWidth, y: 0 },
        {
          x: helperData.scope.arrowLine.strokeWidth * 7,
          y: helperData.scope.arrowLine.strokeWidth * 2 - helperData.scope.arrowLine.strokeWidth,
        },
        {
          x: helperData.scope.arrowLine.strokeWidth * 7,
          y: helperData.scope.arrowLine.strokeWidth * 2,
        },
        { x: 0, y: 0 },
      ],
      {
        fill: 'black',
        stroke: 'black',
        top: pointer.y,
        left: pointer.x,
        originX: 'center',
        originY: 'center',
        objType: 'arrow-straight-line-head-start-linetype',
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        selectMe: true,
        UID,
        identity: 'straight-type',
      }
    );

    helperData.scope.canvas.add(helperData.scope.arrowLine, helperData.scope.arrowHeadStart, helperData.scope.arrowHeadEnd);
    helperData.scope.canvas.requestRenderAll();
  }

  export const creatingStraightArrow = (pointer,helperData) => {
    helperData.scope.arrowLine.set({
      x2: pointer.x,
      y2: pointer.y,
    });
    helperData.scope.arrowHeadEnd.set({
      left: pointer.x,
      top: pointer.y,
    });
    helperData.scope.canvas.requestRenderAll();
    let x1 = helperData.scope.arrowLine.x1;
    let y1 = helperData.scope.arrowLine.y1;
    let x2 = helperData.scope.arrowLine.x2;
    let y2 = helperData.scope.arrowLine.y2;
    let basicAngle = calcLengthAndAngleOfLine(x1, y1, x2, y2);
    helperData.scope.arrowLine.setCoords();
    helperData.scope.arrowHeadEnd.setCoords();
    helperData.scope.arrowHeadStart.setCoords();
    helperData.scope.canvas.requestRenderAll();
    updateArrowHeadStart(x1, y1, x2, y2, basicAngle, helperData.scope.arrowHeadStart);
    updateArrowHeadEnd(x1, y1, x2, y2, basicAngle, helperData.scope.arrowHeadEnd);
  }

 export const createdStraightArrow = (pointer,helperData) => {
    if (
      Math.abs(helperData.scope.arrowHeadStart.left - pointer.x) > 15 ||
      Math.abs(helperData.scope.arrowHeadStart.top - pointer.y) > 15
    ) {
      helperData.scope.canvas.selection = true;
      helperData.scope.isArrowDrawing = false;
      helperData.scope.shouldDrawArrow = false;
      helperData.scope.arrowLine.setCoords();
      helperData.scope.arrowHeadStart.setCoords();
      helperData.scope.arrowHeadEnd.setCoords();

      const arrowHeadData = {
        type1: [helperData.scope.arrowHeadStart, helperData.scope.arrowHeadEnd],
        type2: [helperData.scope.arrowHeadStartHollow, helperData.scope.arrowHeadEndHollow],
        type3: [helperData.scope.arrowHeadStartLine, helperData.scope.arrowHeadEndLine],
      };
      addingToolbarAndControlPointsOfStraightArrow(
        helperData.scope.arrowLine,helperData.scope.
        arrowHeadData,
        helperData
      );
      emitCreatedArrow([helperData.scope.arrowLine,helperData.scope.arrowHeadStart,helperData.scope.arrowHeadEnd],helperData)
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();

    } else {
      removeObjectById(helperData.scope.arrowLine.UID,helperData);
    }
  } 

 export const  reCreateStraightTypeArrow = (arrowData,helperData) => {
   const {fabric}  = helperData
  let [arrowLine, headOne, headTwo] = arrowData;
    let arrow,arrowHeadStart,arrowHeadEnd

    arrow = new fabric.Line();
    Object.keys(arrowLine).forEach((key) => {
      arrow[key] = arrowLine[key];
    });
    helperData.scope.canvas.add(arrow)
    
   let headsData = arrowData.slice(1)
   if(headsData.length > 0){
    headsData.forEach(headData=>{
      if(!headData) return;
      let head = new fabric.Polygon();
      Object.keys(headData).forEach((key) => {
        head[key] = headData[key];
      });
      helperData.scope.canvas.add(head)
    })
   }
    updateArrowLinePosition(arrow)

    helperData.scope.canvas.requestRenderAll();
    
    const arrowHeadData = {
      type1: [arrowHeadStart, arrowHeadEnd],
      type2: [arrowHeadStart, arrowHeadEnd],
      type3: [arrowHeadStart, arrowHeadEnd],
    };
    addingToolbarAndControlPointsOfStraightArrow(arrow, arrowHeadData,helperData);
 
}
