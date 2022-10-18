import { addingToolbarAndControlPointsOfZTypeArrow, getTwoArrowHeads, removeObjectById, updateAngleOfArrowHeads, updatePerpendicularLine } from "../helper-function/arrow-helper";
import { emitCreatedArrow } from "../socket-events/socket-emit";

export const createZTypeArrow = (pointer,helperData) => {
    const {fabric}  = helperData
    helperData.scope.canvas.selection = false;
    helperData.scope.isArrowDrawing = true;
    let UID = new Date().getTime();

    helperData.scope.zTypeArrowLine = new fabric.Path('M 0 0 L 0 0 L 0 0 L 0 0');

    helperData.scope.zTypeArrowLine.set({
      UID,
      objType: 'z-arrow-line',
      fill: '',
      strokeWidth: helperData.scope.strokeWidthOfArrow,
      stroke: 'black',
      left: pointer.x,
      top: pointer.y,
      originX: 'center',
      originY: 'center',
      strokeLineJoin: 'round',
      // selectable: false,
      // selection:false,
      hasControls: false,
      hasBorders: false,
      arrayLeft: [0, 0],
      lastMiddleLeftPoint: null,
      perPixelTargetFind: true,
      selectMe: true,
      strokeDashArray: [],
    });
    helperData.scope.arrowHeadStart = new fabric.Polygon(
      [
        { x: -helperData.scope.arrowHeadLengthFactor * helperData.scope.strokeWidthOfArrow, y: 0 },
        {
          x: 0,
          y: (-helperData.scope.strokeWidthOfArrow * helperData.scope.arrowHeadLengthFactor) / 2,
        },
        { x: 0, y: (helperData.scope.strokeWidthOfArrow * helperData.scope.arrowHeadLengthFactor) / 2 },
      ],
      {
        UID,
        objType: 'arrow-head-start-type-one',
        strokeWidth: helperData.scope.strokeWidthOfArrow,
        stroke: 'black',
        fill: 'black',
        left: pointer.x,
        top: pointer.y,
        originX: 'center',
        originY: 'center',
        // selectable: false,
        lockMovementX: true,
        lockMovementY: true,
        hasControls: false,
        hasBorders: false,
        label: 'left-arrow',
        identity: 'z-type',
        selectMe: true,
      }
    );

    helperData.scope.arrowHeadEnd = new fabric.Polygon(
      [
        { x: helperData.scope.arrowHeadLengthFactor * helperData.scope.strokeWidthOfArrow, y: 0 },
        {
          x: 0,
          y: (-helperData.scope.strokeWidthOfArrow * helperData.scope.arrowHeadLengthFactor) / 2,
        },
        { x: 0, y: (helperData.scope.strokeWidthOfArrow * helperData.scope.arrowHeadLengthFactor) / 2 },
      ],
      {
        UID,
        objType: 'arrow-head-end-type-one',
        strokeWidth: helperData.scope.strokeWidthOfArrow,
        stroke: 'black',
        fill: 'black',
        left: pointer.x,
        top: pointer.y,
        originX: 'center',
        originY: 'center',
        // selectable: false,
        lockMovementX: true,
        lockMovementY: true,
        hasControls: false,
        hasBorders: false,
        label: 'right-arrow',
        identity: 'z-type',
        selectMe: true,
      }
    );

    helperData.scope.arrowHeadStartHollow = new fabric.Polygon(
      [
        { x: -3 * helperData.scope.strokeWidthOfArrow, y: 0 },
        { x: 0, y: -helperData.scope.strokeWidthOfArrow * 1.5 },
        { x: 0, y: helperData.scope.strokeWidthOfArrow * 1.5 },
      ],
      {
        UID,
        objType: 'arrow-head-start-type-two',
        strokeWidth: helperData.scope.strokeWidthOfArrow,
        stroke: 'black',
        fill: 'white',
        left: pointer.x,
        top: pointer.y,
        originX: 'center',
        originY: 'center',
        // selectable: false,
        lockMovementX: true,
        lockMovementY: true,
        hasControls: false,
        hasBorders: false,
        label: 'left-arrow',
        identity: 'z-type',
        selectMe: true,
      }
    );

    helperData.scope.arrowHeadEndHollow = new fabric.Polygon(
      [
        { x: 3 * helperData.scope.strokeWidthOfArrow, y: 0 },
        { x: 0, y: -helperData.scope.strokeWidthOfArrow * 1.5 },
        { x: 0, y: helperData.scope.strokeWidthOfArrow * 1.5 },
      ],
      {
        UID,
        objType: 'arrow-head-end-type-two',
        strokeWidth: helperData.scope.strokeWidthOfArrow,
        stroke: 'black',
        fill: 'white',
        left: pointer.x,
        top: pointer.y,
        originX: 'center',
        originY: 'center',
        // selectable: false,
        lockMovementX: true,
        lockMovementY: true,
        hasControls: false,
        hasBorders: false,
        label: 'right-arrow',
        identity: 'z-type',
        selectMe: true,
      }
    );

    helperData.scope.arrowHeadStartLine = new fabric.Polygon(
      [
        { x: -3 * helperData.scope.strokeWidthOfArrow, y: 0 },
        { x: 0, y: -1.5 * helperData.scope.strokeWidthOfArrow },
        { x: 0, y: -0.75 * helperData.scope.strokeWidthOfArrow },
        { x: -2.25 * helperData.scope.strokeWidthOfArrow, y: 0 },
        { x: 0, y: 0.75 * helperData.scope.strokeWidthOfArrow },
        { x: 0, y: 1.5 * helperData.scope.strokeWidthOfArrow },
      ],
      {
        UID,
        objType: 'arrow-head-start-type-three',
        // strokeWidth: strokeWidthOfPerpendicularLine,
        stroke: 'black',
        fill: 'black',
        left: pointer.x,
        top: pointer.y,
        originX: 'center',
        originY: 'center',
        // selectable: false,
        lockMovementX: true,
        lockMovementY: true,
        hasControls: false,
        hasBorders: false,
        label: 'left-arrow',
        identity: 'z-type',
        selectMe: true,
      }
    );

    helperData.scope.arrowHeadEndLine = new fabric.Polygon(
      [
        { x: 3 * helperData.scope.strokeWidthOfArrow, y: 0 },
        { x: 0, y: -1.5 * helperData.scope.strokeWidthOfArrow },
        { x: 0, y: -0.75 * helperData.scope.strokeWidthOfArrow },
        { x: 2.25 * helperData.scope.strokeWidthOfArrow, y: 0 },
        { x: 0, y: 0.75 * helperData.scope.strokeWidthOfArrow },
        { x: 0, y: 1.5 * helperData.scope.strokeWidthOfArrow },
      ],
      {
        UID,
        objType: 'arrow-head-end-type-three',
        // strokeWidth: strokeWidthOfPerpendicularLine,
        stroke: 'black',
        fill: 'black',
        left: pointer.x,
        top: pointer.y,
        originX: 'center',
        originY: 'center',
        // selectable: false,
        lockMovementX: true,
        lockMovementY: true,
        hasControls: false,
        hasBorders: false,
        label: 'right-arrow',
        identity: 'z-type',
        selectMe: true,
      }
    );

    helperData.scope.canvas.add(
      helperData.scope.zTypeArrowLine,
      helperData.scope.arrowHeadStart,
      helperData.scope.arrowHeadEnd
    );
    helperData.scope.canvas.requestRenderAll();
  }

export const creatingZTypeArrow = (pointer,helperData) => {
    helperData.scope.arrowHeadEnd.set({
      left: pointer.x,
      top: pointer.y,
    });

    helperData.scope.arrowHeadEnd.setCoords();
    let left1, top1, left2, top2;
    left1 = helperData.scope.arrowHeadStart.left;
    top1 = helperData.scope.arrowHeadStart.top;
    left2 = helperData.scope.arrowHeadEnd.left;
    top2 = helperData.scope.arrowHeadEnd.top;
    let height = Math.abs(top2 - top1);
    let width = Math.abs(left2 - left1);
    helperData.scope.zTypeArrowLine.set({ width: width, height: height });
    if (left2 > left1) {
      if (top1 < top2) {
        helperData.scope.zTypeArrowLine.set({
          originY: 'top',
          originX: 'left',
          left: left1,
          top: top1 - helperData.scope.strokeWidthOfArrow / 2,
        });
        updatePerpendicularLine(
          -width / 2 - helperData.scope.strokeWidthOfArrow / 2,
          -height / 2,
          0,
          -height / 2,
          0,
          height / 2,
          width / 2 - helperData.scope.strokeWidthOfArrow / 2,
          height / 2,
          helperData.scope.zTypeArrowLine
        );
        const [start,end] = getTwoArrowHeads(helperData.scope.zTypeArrowLine,helperData)
        updateAngleOfArrowHeads(0, 0,start,end);
      } else if (top1 > top2) {
        helperData.scope.zTypeArrowLine.set({
          originY: 'bottom',
          originX: 'left',
          left: left1,
          top: top1 + helperData.scope.strokeWidthOfArrow / 2,
        });
        updatePerpendicularLine(
          -width / 2 - helperData.scope.strokeWidthOfArrow / 2,
          height / 2,
          0,
          height / 2,
          0,
          -height / 2,
          width / 2 - helperData.scope.strokeWidthOfArrow / 2,
          -height / 2,
          helperData.scope.zTypeArrowLine
        );
        const [start,end] = getTwoArrowHeads(helperData.scope.zTypeArrowLine,helperData)
        updateAngleOfArrowHeads(0, 0,start,end);
      }
    } else if (left2 < left1) {
      if (top1 < top2) {
        helperData.scope.zTypeArrowLine.set({
          originY: 'top',
          originX: 'right',
          left: left1,
          top: top1 - helperData.scope.strokeWidthOfArrow / 2,
        });
        updatePerpendicularLine(
          width / 2 + helperData.scope.strokeWidthOfArrow / 2,
          -height / 2,
          0,
          -height / 2,
          0,
          height / 2,
          -width / 2 + helperData.scope.strokeWidthOfArrow / 2,
          height / 2,
          helperData.scope.zTypeArrowLine
        );
        const [start,end] = getTwoArrowHeads(helperData.scope.zTypeArrowLine,helperData)
        updateAngleOfArrowHeads(180, 180,start,end);
      } else if (top1 > top2) {
        helperData.scope.zTypeArrowLine.set({
          originY: 'bottom',
          originX: 'right',
          left: left1,
          top: top1 + helperData.scope.strokeWidthOfArrow / 2,
        });
        updatePerpendicularLine(
          width / 2 + helperData.scope.strokeWidthOfArrow / 2,
          height / 2,
          0,
          height / 2,
          0,
          -height / 2,
          -width / 2 + helperData.scope.strokeWidthOfArrow / 2,
          -height / 2,
          helperData.scope.zTypeArrowLine
        );
        const [start,end] = getTwoArrowHeads(helperData.scope.zTypeArrowLine,helperData)
        updateAngleOfArrowHeads(180, 180,start,end);
      }
    }
    helperData.scope.canvas.requestRenderAll();
  }

export const createdZTypeArrow = (pointer,helperData) => {
    if (
      Math.abs(helperData.scope.arrowHeadStart.left - pointer.x) > 15 ||
      Math.abs(helperData.scope.arrowHeadStart.top - pointer.y) > 15
    ) {
      helperData.scope.canvas.selection = true;
      helperData.scope.isArrowDrawing = false;
      helperData.scope.shouldDrawArrow = false;
      // groupArrowHeadsAndPerpendicularLine();
      // canvas.discardActiveObject();
      const arrowHeadData = {
        type1: [helperData.scope.arrowHeadStart, helperData.scope.arrowHeadEnd],
        type2: [helperData.scope.arrowHeadStartHollow, helperData.scope.arrowHeadEndHollow],
        type3: [helperData.scope.arrowHeadStartLine, helperData.scope.arrowHeadEndLine],
      };
      addingToolbarAndControlPointsOfZTypeArrow(
        helperData.scope.zTypeArrowLine,
        arrowHeadData,
        helperData
      );
      emitCreatedArrow([helperData.scope.zTypeArrowLine,helperData.scope.arrowHeadStart,helperData.scope.arrowHeadEnd],helperData)
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    } else {
      removeObjectById(helperData.scope.zTypeArrowLine.UID,helperData);
    }
  }  

export const reCreateZTypeArrow = (arrowData,helperData) => {
  const {fabric} = helperData
  let [arrowLine, headOne, headTwo] = arrowData;
  if (arrowLine && headOne && headTwo) {
    let arrow = new fabric.Path();
    Object.keys(arrowLine).forEach((key) => {
      arrow[key] = arrowLine[key];
    });

    let arrowHeadStart = new fabric.Polygon();
    Object.keys(headOne).forEach((key) => {
      arrowHeadStart[key] = headOne[key];
    });

    let arrowHeadEnd = new fabric.Polygon();
    Object.keys(headTwo).forEach((key) => {
      arrowHeadEnd[key] = headTwo[key];
    });

    helperData.scope.canvas.add(arrow, arrowHeadStart, arrowHeadEnd);
    helperData.scope.canvas.requestRenderAll();
    const arrowHeadData = {
      type1: [arrowHeadStart, arrowHeadEnd],
      type2: [arrowHeadStart, arrowHeadEnd],
      type3: [arrowHeadStart, arrowHeadEnd],
    };
    addingToolbarAndControlPointsOfZTypeArrow(arrow, arrowHeadData,helperData);
  }
}  