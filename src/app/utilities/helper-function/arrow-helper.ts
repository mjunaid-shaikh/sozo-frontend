import {
  removeControlPoints,
  isObjectInGivenRegion,
  isObjectIsArrow,
  objectOnCanvasExistOrNot,
} from '../helper-function/general-helper';
import {
  emitArrowConverted,
  emitArrowResize,
  emitMovedArrow,
} from '../socket-events/socket-emit';
import { arrowToolbarHandler } from './arrow-toolbar';

const getTwoCorrespondingArrowHeads = (arrow, helperData) => {
  const arrowHeads = [];
  let start = helperData.scope.canvas
    .getObjects()
    .find((ob) => ob?.UID === arrow.UID && ob?.label === 'left-arrow');
  let end = helperData.scope.canvas
    .getObjects()
    .find((ob) => ob?.UID === arrow.UID && ob?.label === 'right-arrow');
  start && arrowHeads.push(start);
  end && arrowHeads.push(end);
  return arrowHeads;
};

export const getTwoArrowHeads = (arrow, helperData) => {
  let start, end;
  getTwoCorrespondingArrowHeads(arrow, helperData).forEach((obj) => {
    if (obj?.label === 'left-arrow') {
      start = obj;
    } else {
      end = obj;
    }
  });
  return [start, end];
};

const zArrowConnectionHandler = (
  xStart,
  xEnd,
  yStart,
  yEnd,
  shapeCordinates,
  centerPos,
  obj,
  connectionData,
  helperData
) => {
  const [start, end] = getTwoArrowHeads(obj, helperData);

  const pushToConnectionArrayHandler = (left, top, status) => {
    connectionData.push({
      diffX: left - centerPos.x,
      diffY: top - centerPos.y,
      object: obj,
      status,
      centerPos: obj.getCenterPoint(),
    });
  };
  // For Connection Of Starting ArrowLine
  if (
    isObjectInGivenRegion(start.left, start.top, xStart, xEnd, yStart, yEnd)
  ) {
    pushToConnectionArrayHandler(start.left, start.top, 'start');
  }

  //For Connection Of Arrow Ending Line
  if (isObjectInGivenRegion(end.left, end.top, xStart, xEnd, yStart, yEnd)) {
    pushToConnectionArrayHandler(end.left, end.top, 'end');
  }
  return connectionData;
};

const straightArrowConnectionHandler = (
  xStart,
  xEnd,
  yStart,
  yEnd,
  shapeCordinates,
  centerPos,
  obj,
  connectionData
) => {
  const pushToConnectionArrayHandler = (left, top, status) => {
    connectionData.push({
      diffX: left - centerPos.x,
      diffY: top - centerPos.y,
      object: obj,
      status,
    });
  };
  // For Connection Of Starting ArrowLine
  if (isObjectInGivenRegion(obj.x1, obj.y1, xStart, xEnd, yStart, yEnd)) {
    pushToConnectionArrayHandler(obj.x1, obj.y1, 'start');
  }

  //For Connection Of Arrow Ending Line
  if (isObjectInGivenRegion(obj.x2, obj.y2, xStart, xEnd, yStart, yEnd)) {
    pushToConnectionArrayHandler(obj.x2, obj.y2, 'end');
  }

  return connectionData;
};

export const connectionOfArrowOnMousedownHandler = (
  shape,
  connectionData,
  helperData
) => {
  removeControlPoints(helperData);
  let centerPos = shape.getCenterPoint();
  let shapeCordinates = shape.aCoords;
  let extraLayerNumber = helperData.scope.shapeConnectionRange;
  let xStart = shapeCordinates.tl.x - extraLayerNumber;
  let xEnd = shapeCordinates.tr.x + extraLayerNumber;
  let yStart = shapeCordinates.tl.y - extraLayerNumber;
  let yEnd = shapeCordinates.bl.y + extraLayerNumber;
  helperData.scope.canvas.getObjects().forEach((obj) => {
    if (obj?.objType === 'straight-arrow-line') {
      connectionData = straightArrowConnectionHandler(
        xStart,
        xEnd,
        yStart,
        yEnd,
        shapeCordinates,
        centerPos,
        obj,
        connectionData
      );
    } else if (obj?.objType === 'z-arrow-line') {
      connectionData = zArrowConnectionHandler(
        xStart,
        xEnd,
        yStart,
        yEnd,
        shapeCordinates,
        centerPos,
        obj,
        connectionData,
        helperData
      );
    } else if (obj?.objType === 'curve-arrow-line') {
    }
  });
  return connectionData;
};

export const getZTypeArrowStartingPoint = (arrow, helperData) => {
  let x = arrow.path[0][1];
  let y = arrow.path[0][2];
  return getZTypeArrowPoint(x, y, arrow, helperData);
};
export const getZTypeArrowEndingPoint = (arrow, helperData) => {
  let x = arrow.path[3][1];
  let y = arrow.path[3][2];
  return getZTypeArrowPoint(x, y, arrow, helperData);
};
export const getZTypeArrowMiddlePoint = (arrow, helperData) => {
  let x = arrow.path[1][1];
  let y = arrow.path[1][2];
  return getZTypeArrowPoint(x, y, arrow, helperData);
};
const getZTypeArrowPoint = (x, y, arrow, helperData) => {
  let point = { x: x, y: y };
  point.x -= arrow.pathOffset.x;
  point.y -= arrow.pathOffset.y;
  let matrix = arrow.calcTransformMatrix();
  let finalPoint = helperData.fabric.util.transformPoint(point, matrix);
  return finalPoint;
};

export const updatePerpendicularLine = (
  value1,
  value2,
  value3,
  value4,
  value5,
  value6,
  value7,
  value8,
  obj
) => {
  obj.path[0][1] = value1;
  obj.path[0][2] = value2;
  obj.path[1][1] = value3;
  obj.path[1][2] = value4;
  obj.path[2][1] = value5;
  obj.path[2][2] = value6;
  obj.path[3][1] = value7;
  obj.path[3][2] = value8;
  obj.setCoords();
};

export const updateZTypeArrowForControlPointOne = (
  arrow,
  leftPosOfArrowHead1,
  topPosOfArrowHead1,
  leftPosOfArrowHead2,
  topPosOfArrowHead2,
  leftPositionOfControlPoint1,
  leftPositionOfControlPoint2,
  leftPositionOfControlPoint3,
  topPositionOfControlPoint1,
  topPositionOfControlPoint2,
  topPositionOfControlPoint3
) => {
  arrow.setCoords();
  if (leftPosOfArrowHead2 > leftPositionOfControlPoint2) {
    if (leftPosOfArrowHead1 < leftPositionOfControlPoint2) {
      let relativeWidthDistance = Math.abs(
        leftPosOfArrowHead1 - leftPositionOfControlPoint2
      );
      let height = Math.abs(topPosOfArrowHead2 - topPosOfArrowHead1);
      let width = Math.abs(leftPosOfArrowHead1 - leftPosOfArrowHead2);
      arrow.set({ width: width, height: height });
      if (topPosOfArrowHead1 < topPosOfArrowHead2) {
        arrow.set({
          originY: 'bottom',
          originX: 'right',
          left: leftPosOfArrowHead2 + arrow.strokeWidth / 2,
          top: topPosOfArrowHead2 + arrow.strokeWidth / 2,
        });
        updatePerpendicularLine(
          width / 2,
          height / 2,
          relativeWidthDistance - width / 2,
          height / 2,
          relativeWidthDistance - width / 2,
          -height / 2,
          -width / 2,
          -height / 2,
          arrow
        );
      } else if (topPosOfArrowHead1 > topPosOfArrowHead2) {
        arrow.set({
          originY: 'top',
          originX: 'right',
          left: leftPosOfArrowHead2 + arrow.strokeWidth / 2,
          top: topPosOfArrowHead2 - arrow.strokeWidth / 2,
        });
        updatePerpendicularLine(
          -width / 2,
          height / 2,
          relativeWidthDistance - width / 2,
          height / 2,
          relativeWidthDistance - width / 2,
          -height / 2,
          width / 2,
          -height / 2,
          arrow
        );
      }
    } else if (leftPosOfArrowHead1 > leftPositionOfControlPoint2) {
      let relativeWidthDistance = Math.abs(
        leftPosOfArrowHead1 - leftPositionOfControlPoint2
      );
      let height = Math.abs(topPosOfArrowHead2 - topPosOfArrowHead1);
      let width = Math.abs(leftPosOfArrowHead2 - leftPositionOfControlPoint2);
      arrow.set({ width: width, height: height });
      if (topPosOfArrowHead1 < topPosOfArrowHead2) {
        arrow.set({
          originY: 'bottom',
          originX: 'right',
          left: leftPosOfArrowHead2 + arrow.strokeWidth / 2,
          top: topPosOfArrowHead2 + arrow.strokeWidth / 2,
        });
        updatePerpendicularLine(
          width / 2,
          height / 2,
          -width / 2,
          height / 2,
          -width / 2,
          -height / 2,
          -width / 2 + relativeWidthDistance,
          -height / 2,
          arrow
        );
      } else if (topPosOfArrowHead1 > topPosOfArrowHead2) {
        arrow.set({
          originY: 'top',
          originX: 'right',
          left: leftPosOfArrowHead2 + arrow.strokeWidth / 2,
          top: topPosOfArrowHead2 - arrow.strokeWidth / 2,
        });
        updatePerpendicularLine(
          width / 2,
          -height / 2,
          -width / 2,
          -height / 2,
          -width / 2,
          height / 2,
          relativeWidthDistance - width / 2,
          height / 2,
          arrow
        );
      }
    }
  } else {
    if (leftPosOfArrowHead1 < leftPositionOfControlPoint2) {
      let relativeWidthDistance = Math.abs(
        leftPosOfArrowHead1 - leftPositionOfControlPoint2
      );
      let height = Math.abs(topPosOfArrowHead2 - topPosOfArrowHead1);
      let width = Math.abs(leftPosOfArrowHead2 - leftPositionOfControlPoint2);
      arrow.set({ width: width, height: height });
      if (topPosOfArrowHead1 < topPosOfArrowHead2) {
        arrow.set({
          originY: 'bottom',
          originX: 'left',
          left: leftPosOfArrowHead2 - arrow.strokeWidth / 2,
          top: topPosOfArrowHead2 + arrow.strokeWidth / 2,
        });
        updatePerpendicularLine(
          -width / 2,
          height / 2,
          width / 2,
          height / 2,
          width / 2,
          -height / 2,
          width / 2 - relativeWidthDistance,
          -height / 2,
          arrow
        );
      } else if (topPosOfArrowHead1 > topPosOfArrowHead2) {
        arrow.set({
          originY: 'top',
          originX: 'left',
          left: leftPosOfArrowHead2 - arrow.strokeWidth / 2,
          top: topPosOfArrowHead2 - arrow.strokeWidth / 2,
        });
        updatePerpendicularLine(
          -width / 2,
          -height / 2,
          width / 2,
          -height / 2,
          width / 2,
          height / 2,
          width / 2 - relativeWidthDistance,
          height / 2,
          arrow
        );
      }
    } else if (leftPosOfArrowHead1 > leftPositionOfControlPoint2) {
      let relativeWidthDistance = Math.abs(
        leftPosOfArrowHead1 - leftPositionOfControlPoint2
      );
      let height = Math.abs(topPosOfArrowHead2 - topPosOfArrowHead1);
      let width = Math.abs(leftPosOfArrowHead2 - leftPositionOfControlPoint2);
      arrow.set({ width: width, height: height });
      if (topPosOfArrowHead1 < topPosOfArrowHead2) {
        arrow.set({
          originY: 'bottom',
          originX: 'left',
          left: leftPosOfArrowHead2 - arrow.strokeWidth / 2,
          top: topPosOfArrowHead2 + arrow.strokeWidth / 2,
        });
        updatePerpendicularLine(
          -width / 2,
          height / 2,
          width / 2,
          height / 2,
          width / 2,
          -height / 2,
          width / 2 + relativeWidthDistance,
          -height / 2,
          arrow
        );
      } else if (topPosOfArrowHead1 > topPosOfArrowHead2) {
        arrow.set({
          originY: 'top',
          originX: 'left',
          left: leftPosOfArrowHead2 - arrow.strokeWidth / 2,
          top: topPosOfArrowHead2 - arrow.strokeWidth / 2,
        });
        updatePerpendicularLine(
          -width / 2,
          -height / 2,
          width / 2,
          -height / 2,
          width / 2,
          height / 2,
          width / 2 + relativeWidthDistance,
          height / 2,
          arrow
        );
      }
    }
  }
  arrow.setCoords();
};

const moveZTypeArrowTogetherWithShapeFromStart = (
  data,
  transformCenterPos,
  helperData
) => {
  let arrow = data.object;
  let midPos = getZTypeArrowMiddlePoint(arrow, helperData);
  const [start, end] = getTwoArrowHeads(arrow, helperData);
  start.set({
    left: transformCenterPos.x + data.diffX,
    top: transformCenterPos.y + data.diffY,
    angle: transformCenterPos.x + data.diffX < midPos.x ? 0 : 180,
  });
  start.setCoords();
  let arrowHeadStartTypeOne = start;
  let leftPosOfArrowHeadStartTypeOne = arrowHeadStartTypeOne.left;
  let topPosOfArrowHeadStartTypeOne = arrowHeadStartTypeOne.top;

  let leftPosOfArrowHeadEndTypeOne = end.left;
  let topPosOfArrowHeadEndTypeOne = end.top;

  updateZTypeArrowForControlPointOne(
    arrow,
    leftPosOfArrowHeadStartTypeOne,
    topPosOfArrowHeadStartTypeOne,
    leftPosOfArrowHeadEndTypeOne,
    topPosOfArrowHeadEndTypeOne,
    leftPosOfArrowHeadStartTypeOne,
    midPos.x,
    leftPosOfArrowHeadEndTypeOne,
    topPosOfArrowHeadStartTypeOne,
    data.centerPos.y,
    topPosOfArrowHeadEndTypeOne
  );
  helperData.scope.canvas.requestRenderAll();

  emitArrowResize(
    {
      objects: [arrow, start, end],
      pointers: {
        start: {
          x: leftPosOfArrowHeadStartTypeOne,
          y: topPosOfArrowHeadStartTypeOne,
        },
        mid: {
          x: midPos.x,
          y: data.centerPos.y,
        },
        end: {
          x: leftPosOfArrowHeadEndTypeOne,
          y: topPosOfArrowHeadEndTypeOne,
        },
      },
      type: 'control-one',
    },
    helperData
  );
};
export const updateArrowHeadEnd = (x1, y1, x2, y2, basicAngle, arrowHead2) => {
  if (x2 > x1) {
    if (y2 < y1) {
      arrowHead2.set({ angle: 360 - basicAngle });
    } else if (y2 === y1) {
      arrowHead2.set({ angle: 0 });
    } else if (y2 > y1) {
      arrowHead2.set({ angle: basicAngle });
    }
  } else if (x2 < x1) {
    if (y2 > y1) {
      arrowHead2.set({ angle: 180 - basicAngle });
    } else if (y2 === y1) {
      arrowHead2.set({ angle: 180 });
    } else if (y2 < y1) {
      arrowHead2.set({ angle: 180 + basicAngle });
    }
  } else if (x2 === x1) {
    if (y2 < y1) {
      arrowHead2.set({ angle: 270 });
    } else if (y2 > y1) {
      arrowHead2.set({ angle: 90 });
    }
  }
  arrowHead2.setCoords();
};

export const updateArrowHeadStart = (
  x1,
  y1,
  x2,
  y2,
  basicAngle,
  arrowHead1
) => {
  if (x2 > x1) {
    if (y2 < y1) {
      arrowHead1.set({ angle: 180 - basicAngle });
    } else if (y2 === y1) {
      arrowHead1.set({ angle: 180 });
    } else if (y2 > y1) {
      arrowHead1.set({ angle: 180 + basicAngle });
    }
  } else if (x2 < x1) {
    if (y2 > y1) {
      arrowHead1.set({ angle: 360 - basicAngle });
    } else if (y2 === y1) {
      arrowHead1.set({ angle: 0 });
    } else if (y2 < y1) {
      arrowHead1.set({ angle: basicAngle });
    }
  } else if (x2 === x1) {
    if (y2 < y1) {
      arrowHead1.set({ angle: 90 });
    } else if (y2 > y1) {
      arrowHead1.set({ angle: 270 });
    }
  }
  arrowHead1.setCoords();
};

export const calcLengthAndAngleOfLine = (x1, y1, x2, y2) => {
  let verticalLength = Math.abs(y2 - y1);
  let horizontalLength = Math.abs(x2 - x1);
  let lengthOfLine = Math.sqrt(
    Math.pow(verticalLength, 2) + Math.pow(horizontalLength, 2)
  );
  let tanRatio = verticalLength / horizontalLength;
  let basicAngle = (Math.atan(tanRatio) * 180) / Math.PI;
  return basicAngle;
};

export const moveStraightTypeArrowTogetherWithShapeFromStart = (
  data,
  transformCenterPos,
  helperData
) => {
  data.object.set({
    x1: transformCenterPos.x + data.diffX,
    y1: transformCenterPos.y + data.diffY,
  });
  data.object.setCoords();

  let arrow = data.object;
  let [x1, y1, x2, y2] = [arrow.x1, arrow.y1, arrow.x2, arrow.y2];
  let basicAngle = calcLengthAndAngleOfLine(x1, y1, x2, y2);

  const [start, end] = getTwoArrowHeads(arrow, helperData);

  if (start) {
    start.setCoords();
    start.set({
      left: transformCenterPos.x + data.diffX,
      top: transformCenterPos.y + data.diffY,
    });

    updateArrowHeadStart(x1, y1, x2, y2, basicAngle, start);
  }
  end && updateArrowHeadEnd(x1, y1, x2, y2, basicAngle, end);

  emitArrowResize(
    {
      objects: [arrow, start, end],
      pointers: {
        start: {
          x: x1,
          y: y1,
        },
        mid: {},
        end: {
          x: x2,
          y: y2,
        },
      },
      type: 'control-one',
    },
    helperData
  );
};

export const updateZTypeArrowForControlPointTwo = (
  arrow,
  leftPosOfArrowHead1,
  topPosOfArrowHead1,
  leftPosOfArrowHead2,
  topPosOfArrowHead2,
  leftPositionOfControlPoint1,
  leftPositionOfControlPoint2,
  leftPositionOfControlPoint3,
  topPositionOfControlPoint1,
  topPositionOfControlPoint2,
  topPositionOfControlPoint3
) => {
  arrow.setCoords();
  if (leftPosOfArrowHead1 < leftPositionOfControlPoint2) {
    if (leftPosOfArrowHead2 > leftPositionOfControlPoint2) {
      let relativeWidthDistance = Math.abs(
        leftPosOfArrowHead2 - leftPositionOfControlPoint2
      );
      let height = Math.abs(topPosOfArrowHead2 - topPosOfArrowHead1);
      let width = Math.abs(leftPosOfArrowHead2 - leftPosOfArrowHead1);
      arrow.set({ width: width, height: height });
      if (topPosOfArrowHead2 > topPosOfArrowHead1) {
        arrow.set({
          originY: 'top',
          originX: 'left',
          left: leftPosOfArrowHead1 - arrow.strokeWidth / 2,
          top: topPosOfArrowHead1 - arrow.strokeWidth / 2,
        });
        updatePerpendicularLine(
          -width / 2,
          -height / 2,
          width / 2 - relativeWidthDistance,
          -height / 2,
          width / 2 - relativeWidthDistance,
          height / 2,
          width / 2,
          height / 2,
          arrow
        );
      } else if (topPosOfArrowHead2 < topPosOfArrowHead1) {
        arrow.set({
          originY: 'bottom',
          originX: 'left',
          left: leftPosOfArrowHead1 - arrow.strokeWidth / 2,
          top: topPosOfArrowHead1 + arrow.strokeWidth / 2,
        });
        updatePerpendicularLine(
          -width / 2,
          height / 2,
          width / 2 - relativeWidthDistance,
          height / 2,
          width / 2 - relativeWidthDistance,
          -height / 2,
          width / 2,
          -height / 2,
          arrow
        );
      }
    } else if (leftPosOfArrowHead2 < leftPositionOfControlPoint2) {
      let relativeWidthDistance = Math.abs(
        leftPosOfArrowHead2 - leftPositionOfControlPoint2
      );
      let height = Math.abs(topPosOfArrowHead2 - topPosOfArrowHead1);
      let width = Math.abs(leftPosOfArrowHead1 - leftPositionOfControlPoint2);
      arrow.set({ width: width, height: height });
      if (topPosOfArrowHead2 > topPosOfArrowHead1) {
        arrow.set({
          originY: 'top',
          originX: 'left',
          left: leftPosOfArrowHead1 - arrow.strokeWidth / 2,
          top: topPosOfArrowHead1 - arrow.strokeWidth / 2,
        });
        updatePerpendicularLine(
          -width / 2,
          -height / 2,
          width / 2,
          -height / 2,
          width / 2,
          height / 2,
          width / 2 - relativeWidthDistance,
          height / 2,
          arrow
        );
      } else if (topPosOfArrowHead2 < topPosOfArrowHead1) {
        arrow.set({
          originY: 'bottom',
          originX: 'left',
          left: leftPosOfArrowHead1 - arrow.strokeWidth / 2,
          top: topPosOfArrowHead1 + arrow.strokeWidth / 2,
        });
        updatePerpendicularLine(
          -width / 2,
          height / 2,
          width / 2,
          height / 2,
          width / 2,
          -height / 2,
          width / 2 - relativeWidthDistance,
          -height / 2,
          arrow
        );
      }
    }
  } else {
    if (leftPosOfArrowHead2 > leftPositionOfControlPoint2) {
      let relativeWidthDistance = Math.abs(
        leftPosOfArrowHead2 - leftPositionOfControlPoint2
      );
      let height = Math.abs(topPosOfArrowHead2 - topPosOfArrowHead1);
      let width = Math.abs(leftPosOfArrowHead1 - leftPositionOfControlPoint2);
      arrow.set({ width: width, height: height });
      if (topPosOfArrowHead2 > topPosOfArrowHead1) {
        arrow.set({
          originY: 'top',
          originX: 'right',
          left: leftPosOfArrowHead1 + arrow.strokeWidth / 2,
          top: topPosOfArrowHead1 - arrow.strokeWidth / 2,
        });
        updatePerpendicularLine(
          width / 2,
          -height / 2,
          -width / 2,
          -height / 2,
          -width / 2,
          height / 2,
          -width / 2 + relativeWidthDistance,
          height / 2,
          arrow
        );
      } else if (topPosOfArrowHead2 < topPosOfArrowHead1) {
        arrow.set({
          originY: 'bottom',
          originX: 'right',
          left: leftPosOfArrowHead1 + arrow.strokeWidth / 2,
          top: topPosOfArrowHead1 + arrow.strokeWidth / 2,
        });
        updatePerpendicularLine(
          width / 2,
          height / 2,
          -width / 2,
          height / 2,
          -width / 2,
          -height / 2,
          -width / 2 + relativeWidthDistance,
          -height / 2,
          arrow
        );
      }
    } else if (leftPosOfArrowHead2 < leftPositionOfControlPoint2) {
      let relativeWidthDistance = Math.abs(
        leftPosOfArrowHead2 - leftPositionOfControlPoint2
      );
      let height = Math.abs(topPosOfArrowHead2 - topPosOfArrowHead1);
      let width = Math.abs(leftPosOfArrowHead1 - leftPositionOfControlPoint2);
      arrow.set({ width: width, height: height });
      if (topPosOfArrowHead2 > topPosOfArrowHead1) {
        arrow.set({
          originY: 'top',
          originX: 'right',
          left: leftPosOfArrowHead1 + arrow.strokeWidth / 2,
          top: topPosOfArrowHead1 - arrow.strokeWidth / 2,
        });
        updatePerpendicularLine(
          width / 2,
          -height / 2,
          -width / 2,
          -height / 2,
          -width / 2,
          height / 2,
          -width / 2 - relativeWidthDistance,
          height / 2,
          arrow
        );
      } else if (topPosOfArrowHead2 < topPosOfArrowHead1) {
        arrow.set({
          originY: 'bottom',
          originX: 'right',
          left: leftPosOfArrowHead1 + arrow.strokeWidth / 2,
          top: topPosOfArrowHead1 + arrow.strokeWidth / 2,
        });
        updatePerpendicularLine(
          width / 2,
          height / 2,
          -width / 2,
          height / 2,
          -width / 2,
          -height / 2,
          -width / 2 - relativeWidthDistance,
          -height / 2,
          arrow
        );
      }
    }
  }
  arrow.setCoords();
};

export const moveZTypeArrowTogetherWithShapeFromEnd = (
  data,
  transformCenterPos,
  helperData
) => {
  let arrow = data.object;
  let midPos = getZTypeArrowMiddlePoint(arrow, helperData);
  const [start, end] = getTwoArrowHeads(arrow, helperData);
  end.set({
    left: transformCenterPos.x + data.diffX,
    top: transformCenterPos.y + data.diffY,
    angle: transformCenterPos.x + data.diffX > midPos.x ? 0 : 180,
  });
  end.setCoords();
  let arrowHeadEndTypeOne = end;

  let leftPosOfArrowHeadEndTypeOne = arrowHeadEndTypeOne.left;
  let topPosOfArrowHeadEndTypeOne = arrowHeadEndTypeOne.top;

  let leftPosOfArrowHeadStartTypeOne = start.left;
  let topPosOfArrowHeadStartTypeOne = start.top;

  updateZTypeArrowForControlPointTwo(
    arrow,
    leftPosOfArrowHeadStartTypeOne,
    topPosOfArrowHeadStartTypeOne,
    leftPosOfArrowHeadEndTypeOne,
    topPosOfArrowHeadEndTypeOne,
    leftPosOfArrowHeadStartTypeOne,
    midPos.x,
    leftPosOfArrowHeadEndTypeOne,
    topPosOfArrowHeadStartTypeOne,
    data.centerPos.y,
    topPosOfArrowHeadEndTypeOne
  );

  emitArrowResize(
    {
      objects: [arrow, start, end],
      pointers: {
        start: {
          x: leftPosOfArrowHeadStartTypeOne,
          y: topPosOfArrowHeadStartTypeOne,
        },
        mid: {
          x: midPos.x,
          y: data.centerPos.y,
        },
        end: {
          x: leftPosOfArrowHeadEndTypeOne,
          y: topPosOfArrowHeadEndTypeOne,
        },
      },
      type: 'control-two',
    },
    helperData
  );
};

export const moveStraightTypeArrowTogetherWithShapeFromEnd = (
  data,
  transformCenterPos,
  helperData
) => {
  data.object.set({
    x2: transformCenterPos.x + data.diffX,
    y2: transformCenterPos.y + data.diffY,
  });
  data.object.setCoords();

  let arrow = data.object;
  const [start, end] = getTwoArrowHeads(arrow, helperData);

  let [x1, y1, x2, y2] = [arrow.x1, arrow.y1, arrow.x2, arrow.y2];
  let basicAngle = calcLengthAndAngleOfLine(x1, y1, x2, y2);

  if (end) {
    end.setCoords();
    end.set({
      left: transformCenterPos.x + data.diffX,
      top: transformCenterPos.y + data.diffY,
    });

    updateArrowHeadEnd(x1, y1, x2, y2, basicAngle, end);
  }
  start && updateArrowHeadStart(x1, y1, x2, y2, basicAngle, start);
  emitArrowResize(
    {
      objects: [arrow, start, end],
      pointers: {
        start: {
          x: x1,
          y: y1,
        },
        mid: {},
        end: {
          x: x2,
          y: y2,
        },
      },
      type: 'control-two',
    },
    helperData
  );
};
export const moveArrowTogetherWithShapeHandler = (
  connectionData,
  transformCenterPos,
  helperData
) => {
  // console.log(connectionData)
  if (connectionData.length > 0) {
    connectionData.forEach((data) => {
      if (data.status === 'start') {
        if (data.object.objType === 'z-arrow-line') {
          moveZTypeArrowTogetherWithShapeFromStart(
            data,
            transformCenterPos,
            helperData
          );
        } else if (data.object.objType === 'curve-arrow-line') {
          // moveCurveTypeArrowTogetherWithShapeFromStart(
          //   data,
          //   transformCenterPos
          // );
        } else if (data.object.objType === 'straight-arrow-line') {
          moveStraightTypeArrowTogetherWithShapeFromStart(
            data,
            transformCenterPos,
            helperData
          );
        }
      } else if (data.status === 'end') {
        if (data.object.objType === 'z-arrow-line') {
          moveZTypeArrowTogetherWithShapeFromEnd(
            data,
            transformCenterPos,
            helperData
          );
        } else if (data.object.objType === 'curve-arrow-line') {
          // moveCurveTypeArrowTogetherWithShapeFromEnd(data,transformCenterPos)
        } else if (data.object.objType === 'straight-arrow-line') {
          moveStraightTypeArrowTogetherWithShapeFromEnd(
            data,
            transformCenterPos,
            helperData
          );
        }
      }
    });
  }
};

export const getScalingArrowMoveTogetherData = (
  shape,
  connectionData,
  scalingConnectionData,
  helperData
) => {
  let shapeCordinates = shape.aCoords;
  let extraLayerNumber = helperData.scope.shapeConnectionRange;
  let xStart = shapeCordinates.tl.x - extraLayerNumber;
  let xEnd = shapeCordinates.tr.x + extraLayerNumber;
  let yStart = shapeCordinates.tl.y - extraLayerNumber;
  let yEnd = shapeCordinates.bl.y + extraLayerNumber;
  connectionData.forEach((con) => {
    if (con.status === 'start') {
      if (con.object?.objType === 'straight-arrow-line') {
        const xNumerator = con.object.x1 - xStart;
        const xDinominator = xEnd - xStart;
        const xPercent = xNumerator / xDinominator;

        const yNumerator = con.object.y1 - yStart;
        const yDinominator = yEnd - yStart;
        const yPercent = yNumerator / yDinominator;

        scalingConnectionData.push({
          object: con.object,
          xPercent,
          yPercent,
          status: con.status,
        });
      } else if (con.object?.objType === 'z-arrow-line') {
        const [start, end] = getTwoArrowHeads(con.object, helperData);
        const xNumerator = start.left - xStart;
        const xDinominator = xEnd - xStart;
        const xPercent = xNumerator / xDinominator;

        const yNumerator = start.top - yStart;
        const yDinominator = yEnd - yStart;
        const yPercent = yNumerator / yDinominator;

        scalingConnectionData.push({
          object: con.object,
          xPercent,
          yPercent,
          status: con.status,
          centerPos: con.centerPos,
        });
      }
    } else {
      if (con.object?.objType === 'straight-arrow-line') {
        const xNumerator = con.object.x2 - xStart;
        const xDinominator = xEnd - xStart;
        const xPercent = xNumerator / xDinominator;

        const yNumerator = con.object.y2 - yStart;
        const yDinominator = yEnd - yStart;
        const yPercent = yNumerator / yDinominator;

        scalingConnectionData.push({
          object: con.object,
          xPercent,
          yPercent,
          status: con.status,
        });
      } else if (con.object?.objType === 'z-arrow-line') {
        const [start, end] = getTwoArrowHeads(con.object, helperData);
        const xNumerator = end.left - xStart;
        const xDinominator = xEnd - xStart;
        const xPercent = xNumerator / xDinominator;

        const yNumerator = end.top - yStart;
        const yDinominator = yEnd - yStart;
        const yPercent = yNumerator / yDinominator;

        scalingConnectionData.push({
          object: con.object,
          xPercent,
          yPercent,
          status: con.status,
          centerPos: con.centerPos,
        });
      }
    }
  });
  return scalingConnectionData;
};

export const moveArrowTogetherWithShapeWhileScaling = (
  shape,
  scalingConnectionData,
  helperData
) => {
  let shapeCordinates = shape.aCoords;
  let extraLayerNumber = helperData.scope.shapeConnectionRange;
  let xStart = shapeCordinates.tl.x - extraLayerNumber;
  let xEnd = shapeCordinates.tr.x + extraLayerNumber;
  let yStart = shapeCordinates.tl.y - extraLayerNumber;
  let yEnd = shapeCordinates.bl.y + extraLayerNumber;
  scalingConnectionData.forEach((con) => {
    if (con.status === 'start') {
      if (con.object?.objType === 'straight-arrow-line') {
        const xLength = xEnd - xStart;
        const yLength = yEnd - yStart;
        const xPercent = con.xPercent;
        const yPercent = con.yPercent;

        const xToAdd = xLength * xPercent;
        const yToAdd = yLength * yPercent;

        con.object.set({
          x1: xStart + xToAdd,
          y1: yStart + yToAdd,
        });
        con.object.setCoords();
        let arrow = con.object;
        let [x1, y1, x2, y2] = [arrow.x1, arrow.y1, arrow.x2, arrow.y2];
        let basicAngle = calcLengthAndAngleOfLine(x1, y1, x2, y2);

        const [start, end] = getTwoArrowHeads(arrow, helperData);

        if (start) {
          start.setCoords();
          start.set({
            left: xStart + xToAdd,
            top: yStart + yToAdd,
          });

          updateArrowHeadStart(x1, y1, x2, y2, basicAngle, start);
        }
        end && updateArrowHeadEnd(x1, y1, x2, y2, basicAngle, end);

        emitArrowResize(
          {
            objects: [arrow, start, end],
            pointers: {
              start: {
                x: x1,
                y: y1,
              },
              mid: {},
              end: {
                x: x2,
                y: y2,
              },
            },
            type: 'control-one',
          },
          helperData
        );
      } else if (con.object?.objType === 'z-arrow-line') {
        const arrow = con.object;
        arrow.setCoords();
        let midPos = getZTypeArrowMiddlePoint(arrow, helperData);
        const [start, end] = getTwoArrowHeads(arrow, helperData);
        const xLength = xEnd - xStart;
        const yLength = yEnd - yStart;
        const xPercent = con.xPercent;
        const yPercent = con.yPercent;

        const xToAdd = xLength * xPercent;
        const yToAdd = yLength * yPercent;

        start.set({
          left: xStart + xToAdd,
          top: yStart + yToAdd,
          angle: xStart + xToAdd < midPos.x ? 0 : 180,
        });

        let arrowHeadStartTypeOne = start;
        let leftPosOfArrowHeadStartTypeOne = arrowHeadStartTypeOne.left;
        let topPosOfArrowHeadStartTypeOne = arrowHeadStartTypeOne.top;

        let leftPosOfArrowHeadEndTypeOne = end.left;
        let topPosOfArrowHeadEndTypeOne = end.top;

        updateZTypeArrowForControlPointOne(
          arrow,
          leftPosOfArrowHeadStartTypeOne,
          topPosOfArrowHeadStartTypeOne,
          leftPosOfArrowHeadEndTypeOne,
          topPosOfArrowHeadEndTypeOne,
          leftPosOfArrowHeadStartTypeOne,
          midPos.x,
          leftPosOfArrowHeadEndTypeOne,
          topPosOfArrowHeadStartTypeOne,
          con.centerPos.y,
          topPosOfArrowHeadEndTypeOne
        );
        helperData.scope.canvas.requestRenderAll();

        emitArrowResize(
          {
            objects: [arrow, start, end],
            pointers: {
              start: {
                x: leftPosOfArrowHeadStartTypeOne,
                y: topPosOfArrowHeadStartTypeOne,
              },
              mid: {
                x: midPos.x,
                y: con.centerPos.y,
              },
              end: {
                x: leftPosOfArrowHeadEndTypeOne,
                y: topPosOfArrowHeadEndTypeOne,
              },
            },
            type: 'control-one',
          },
          helperData
        );
      }
    } else {
      if (con.object?.objType === 'straight-arrow-line') {
        const xLength = xEnd - xStart;
        const yLength = yEnd - yStart;
        const xPercent = con.xPercent;
        const yPercent = con.yPercent;

        const xToAdd = xLength * xPercent;
        const yToAdd = yLength * yPercent;

        con.object.set({
          x2: xStart + xToAdd,
          y2: yStart + yToAdd,
        });

        con.object.setCoords();
        let arrow = con.object;
        const [start, end] = getTwoArrowHeads(arrow, helperData);

        let [x1, y1, x2, y2] = [arrow.x1, arrow.y1, arrow.x2, arrow.y2];
        let basicAngle = calcLengthAndAngleOfLine(x1, y1, x2, y2);

        if (end) {
          end.setCoords();
          end.set({
            left: xStart + xToAdd,
            top: yStart + yToAdd,
          });

          updateArrowHeadEnd(x1, y1, x2, y2, basicAngle, end);
        }
        start && updateArrowHeadStart(x1, y1, x2, y2, basicAngle, start);

        emitArrowResize(
          {
            objects: [arrow, start, end],
            pointers: {
              start: {
                x: x1,
                y: y1,
              },
              mid: {},
              end: {
                x: x2,
                y: y2,
              },
            },
            type: 'control-two',
          },
          helperData
        );
      } else if (con.object?.objType === 'z-arrow-line') {
        const arrow = con.object;
        arrow.setCoords();
        let midPos = getZTypeArrowMiddlePoint(arrow, helperData);
        const [start, end] = getTwoArrowHeads(arrow, helperData);
        const xLength = xEnd - xStart;
        const yLength = yEnd - yStart;
        const xPercent = con.xPercent;
        const yPercent = con.yPercent;

        const xToAdd = xLength * xPercent;
        const yToAdd = yLength * yPercent;

        end.set({
          left: xStart + xToAdd,
          top: yStart + yToAdd,
          angle: xStart + xToAdd > midPos.x ? 0 : 180,
        });

        end.setCoords();
        let arrowHeadEndTypeOne = end;

        let leftPosOfArrowHeadEndTypeOne = arrowHeadEndTypeOne.left;
        let topPosOfArrowHeadEndTypeOne = arrowHeadEndTypeOne.top;

        let leftPosOfArrowHeadStartTypeOne = start.left;
        let topPosOfArrowHeadStartTypeOne = start.top;

        updateZTypeArrowForControlPointTwo(
          arrow,
          leftPosOfArrowHeadStartTypeOne,
          topPosOfArrowHeadStartTypeOne,
          leftPosOfArrowHeadEndTypeOne,
          topPosOfArrowHeadEndTypeOne,
          leftPosOfArrowHeadStartTypeOne,
          midPos.x,
          leftPosOfArrowHeadEndTypeOne,
          topPosOfArrowHeadStartTypeOne,
          con.centerPos.y,
          topPosOfArrowHeadEndTypeOne
        );

        emitArrowResize(
          {
            objects: [arrow, start, end],
            pointers: {
              start: {
                x: leftPosOfArrowHeadStartTypeOne,
                y: topPosOfArrowHeadStartTypeOne,
              },
              mid: {
                x: midPos.x,
                y: con.centerPos.y,
              },
              end: {
                x: leftPosOfArrowHeadEndTypeOne,
                y: topPosOfArrowHeadEndTypeOne,
              },
            },
            type: 'control-two',
          },
          helperData
        );
      }
    }
  });
};

export const updateArrowLinePosition = (obj) => {
  let centerPointX = obj.getCenterPoint().x;
  let centerPointY = obj.getCenterPoint().y;
  let objectOffset = obj.calcLinePoints();
  let offsetX1 = objectOffset.x1;
  let offsetY1 = objectOffset.y1;
  let offsetX2 = objectOffset.x2;
  let offsetY2 = objectOffset.y2;
  obj.set({
    x1: centerPointX + offsetX1,
    y1: centerPointY + offsetY1,
    x2: centerPointX + offsetX2,
    y2: centerPointY + offsetY2,
  });
  obj.setCoords();
};

export const updateAllStraightArrowPoints = (helperData) => {
  helperData.scope.canvas.getObjects().forEach((obj) => {
    if (obj?.objType === 'straight-arrow-line') {
      updateArrowLinePosition(obj);
    }
  });
};

export const moveEveryArrowUpInTheStack = (helperData) => {
  helperData.scope.canvas.getObjects().forEach((obj) => {
    if (isObjectIsArrow(obj)) {
      helperData.scope.canvas.getObjects().forEach((ob) => {
        if (ob?.UID === obj?.UID) {
          helperData.scope.canvas.bringToFront(ob);
        }
      });
    }
  });
  helperData.scope.canvas.requestRenderAll();
};

export const removeRightArrowHeadById = (id, helperData) => {
  helperData.scope.canvas.getObjects().forEach((obj) => {
    if (obj?.UID === id && obj?.label === 'right-arrow') {
      helperData.scope.canvas.remove(obj);
      helperData.scope.prevRightArrowHead = obj;
    }
  });
  helperData.scope.canvas.requestRenderAll();
};

export const removeLeftArrowHeadById = (id, helperData) => {
  helperData.scope.canvas.getObjects().forEach((obj) => {
    if (obj?.UID === id && obj?.label === 'left-arrow') {
      helperData.scope.canvas.remove(obj);
      helperData.scope.prevLeftArrowHead = obj;
    }
  });
  helperData.scope.canvas.requestRenderAll();
};

export const createLeftArrowTypeOne = (arrow, helperData) => {
  const { fabric } = helperData;
  let arrowHead = new fabric.Polygon(
    [
      { x: 0, y: 0 },
      {
        x: -helperData.scope.arrowHeadLengthFactor * arrow.strokeWidth,
        y: (-arrow.strokeWidth * helperData.scope.arrowHeadLengthFactor) / 2,
      },
      {
        x: -helperData.scope.arrowHeadLengthFactor * arrow.strokeWidth,
        y: (arrow.strokeWidth * helperData.scope.arrowHeadLengthFactor) / 2,
      },
    ],
    {
      UID: arrow.UID,
      objType: 'arrow-head-start-type-one',
      stroke: arrow.stroke,
      strokeWidth: arrow.strokeWidth,
      fill: arrow.stroke,
      originX: 'center',
      originY: 'center',
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
  return arrowHead;
};

export const getClosestPoint = (head, arrow, helperData) => {
  let headLeft = head.left;
  let headTop = head.top;

  const leftPos = getZTypeArrowStartingPoint(arrow, helperData);
  const rightPos = getZTypeArrowEndingPoint(arrow, helperData);
  const centerPos = getZTypeArrowMiddlePoint(arrow, helperData);

  let xData = [];
  let yData = [];

  let paths = [leftPos, centerPos, rightPos];

  paths.forEach((path) => {
    xData.push({
      diffX: Math.abs(path.x - headLeft),
      actualValue: path.x,
    });
    yData.push({
      diffY: Math.abs(path.y - headTop),
      actualValue: path.y,
    });
  });

  const actualXData = xData.sort((p1, p2) => {
    return p1.diffX - p2.diffX;
  });

  const actualYData = yData.sort((p1, p2) => {
    return p1.diffY - p2.diffY;
  });

  return {
    left: actualXData[0].actualValue,
    top: actualYData[0].actualValue,
  };
};

export const updateAngleAndPositionOfLeftArrowTypeOne = (
  head,
  arrow,
  helperData
) => {
  if (arrow?.objType === 'straight-arrow-line') {
    head.set({
      left: arrow.x1,
      top: arrow.y1,
    });
    helperData.scope.canvas.add(head);
    let x1 = arrow.x1;
    let y1 = arrow.y1;
    let x2 = arrow.x2;
    let y2 = arrow.y2;
    let basicAngle = calcLengthAndAngleOfLine(x1, y1, x2, y2);
    updateArrowHeadStart(x1, y1, x2, y2, basicAngle, head);
  } else if (arrow?.objType === 'curve-arrow-line') {
  } else if (arrow?.objType === 'z-arrow-line') {
    let data = getClosestPoint(
      helperData.scope.prevLeftArrowHead,
      arrow,
      helperData
    );
    helperData.scope.canvas.add(helperData.scope.prevLeftArrowHead);

    helperData.scope.prevLeftArrowHead.set({
      points: [
        {
          x: -helperData.scope.arrowHeadLengthFactor * arrow.get('strokeWidth'),
          y: 0,
        },
        {
          x: 0,
          y:
            (-arrow.get('strokeWidth') *
              helperData.scope.arrowHeadLengthFactor) /
            2,
        },
        {
          x: 0,
          y:
            (arrow.get('strokeWidth') *
              helperData.scope.arrowHeadLengthFactor) /
            2,
        },
      ],
      fill: arrow.get('stroke'),
      objType: 'arrow-head-start-type-one',
      strokeWidth: arrow.get('strokeWidth'),
      left: data.left,
      top: data.top,
    });
    helperData.scope.canvas.requestRenderAll();
  }
};

export const createLeftArrowTypeTwo = (arrow, helperData) => {
  const { fabric } = helperData;
  let arrowHead = new fabric.Polygon(
    [
      { x: 0, y: 0 },
      {
        x: -helperData.scope.arrowHeadLengthFactor * arrow.strokeWidth,
        y: (-arrow.strokeWidth * helperData.scope.arrowHeadLengthFactor) / 2,
      },
      {
        x: -helperData.scope.arrowHeadLengthFactor * arrow.strokeWidth,
        y: (arrow.strokeWidth * helperData.scope.arrowHeadLengthFactor) / 2,
      },
    ],
    {
      UID: arrow.UID,
      objType: 'arrow-head-start-type-two',
      stroke: arrow.stroke,
      strokeWidth: arrow.strokeWidth,
      fill: 'white',
      originX: 'center',
      originY: 'center',
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
  return arrowHead;
};

export const updateAngleAndPositionOfLeftArrowTypeTwo = (
  head,
  arrow,
  helperData
) => {
  if (arrow?.objType === 'straight-arrow-line') {
    head.set({
      left: arrow.x1,
      top: arrow.y1,
    });
    helperData.scope.canvas.add(head);
    let x1 = arrow.x1;
    let y1 = arrow.y1;
    let x2 = arrow.x2;
    let y2 = arrow.y2;
    let basicAngle = calcLengthAndAngleOfLine(x1, y1, x2, y2);
    updateArrowHeadStart(x1, y1, x2, y2, basicAngle, head);
  } else if (arrow?.objType === 'curve-arrow-line') {
  } else if (arrow?.objType === 'z-arrow-line') {
    let data = getClosestPoint(
      helperData.scope.prevLeftArrowHead,
      arrow,
      helperData
    );
    helperData.scope.canvas.add(helperData.scope.prevLeftArrowHead);
    helperData.scope.prevLeftArrowHead.set({
      points: [
        {
          x: -helperData.scope.arrowHeadLengthFactor * arrow.get('strokeWidth'),
          y: 0,
        },
        {
          x: 0,
          y:
            (-arrow.get('strokeWidth') *
              helperData.scope.arrowHeadLengthFactor) /
            2,
        },
        {
          x: 0,
          y:
            (arrow.get('strokeWidth') *
              helperData.scope.arrowHeadLengthFactor) /
            2,
        },
      ],
      fill: 'white',
      objType: 'arrow-head-start-type-two',
      strokeWidth: arrow.get('strokeWidth'),
      left: data.left,
      top: data.top,
    });
    helperData.scope.canvas.requestRenderAll();
  }
};

export const createRightArrowTypeOne = (arrow, helperData) => {
  const { fabric } = helperData;
  let arrowHead = new fabric.Polygon(
    [
      { x: 0, y: 0 },
      {
        x: -helperData.scope.arrowHeadLengthFactor * arrow.strokeWidth,
        y: (-arrow.strokeWidth * helperData.scope.arrowHeadLengthFactor) / 2,
      },
      {
        x: -helperData.scope.arrowHeadLengthFactor * arrow.strokeWidth,
        y: (arrow.strokeWidth * helperData.scope.arrowHeadLengthFactor) / 2,
      },
    ],
    {
      UID: arrow.UID,
      objType: 'arrow-head-end-type-one',
      stroke: arrow.stroke,
      strokeWidth: arrow.strokeWidth,
      fill: arrow.stroke,
      originX: 'center',
      originY: 'center',
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
  return arrowHead;
};

export const updateAngleAndPositionOfRightArrowTypeOne = (
  head,
  arrow,
  helperData
) => {
  if (arrow?.objType === 'straight-arrow-line') {
    head.set({
      left: arrow.x2,
      top: arrow.y2,
    });
    helperData.scope.canvas.add(head);
    let x1 = arrow.x1;
    let y1 = arrow.y1;
    let x2 = arrow.x2;
    let y2 = arrow.y2;
    let basicAngle = calcLengthAndAngleOfLine(x1, y1, x2, y2);
    updateArrowHeadEnd(x1, y1, x2, y2, basicAngle, head);
  } else if (arrow?.objType === 'curve-arrow-line') {
  } else if (arrow?.objType === 'z-arrow-line') {
    let data = getClosestPoint(
      helperData.scope.prevRightArrowHead,
      arrow,
      helperData
    );
    helperData.scope.canvas.add(helperData.scope.prevRightArrowHead);
    helperData.scope.prevRightArrowHead.set({
      points: [
        {
          x: helperData.scope.arrowHeadLengthFactor * arrow.get('strokeWidth'),
          y: 0,
        },
        {
          x: 0,
          y:
            (-arrow.get('strokeWidth') *
              helperData.scope.arrowHeadLengthFactor) /
            2,
        },
        {
          x: 0,
          y:
            (arrow.get('strokeWidth') *
              helperData.scope.arrowHeadLengthFactor) /
            2,
        },
      ],
      fill: arrow.get('stroke'),
      objType: 'arrow-head-end-type-one',
      strokeWidth: arrow.get('strokeWidth'),
      left: data.left,
      top: data.top,
    });
    helperData.scope.canvas.requestRenderAll();
  }
};

export const createRightArrowTypeTwo = (arrow, helperData) => {
  const { fabric } = helperData;
  let arrowHead = new fabric.Polygon(
    [
      { x: 0, y: 0 },
      {
        x: -helperData.scope.arrowHeadLengthFactor * arrow.strokeWidth,
        y: (-arrow.strokeWidth * helperData.scope.arrowHeadLengthFactor) / 2,
      },
      {
        x: -helperData.scope.arrowHeadLengthFactor * arrow.strokeWidth,
        y: (arrow.strokeWidth * helperData.scope.arrowHeadLengthFactor) / 2,
      },
    ],
    {
      UID: arrow.UID,
      objType: 'arrow-head-end-type-two',
      stroke: arrow.stroke,
      strokeWidth: arrow.strokeWidth,
      fill: 'white',
      originX: 'center',
      originY: 'center',
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
  return arrowHead;
};

export const updateAngleAndPositionOfRightArrowTypeTwo = (
  head,
  arrow,
  helperData
) => {
  if (arrow?.objType === 'straight-arrow-line') {
    head.set({
      left: arrow.x2,
      top: arrow.y2,
    });
    helperData.scope.canvas.add(head);
    let x1 = arrow.x1;
    let y1 = arrow.y1;
    let x2 = arrow.x2;
    let y2 = arrow.y2;
    let basicAngle = calcLengthAndAngleOfLine(x1, y1, x2, y2);
    updateArrowHeadEnd(x1, y1, x2, y2, basicAngle, head);
  } else if (arrow?.objType === 'curve-arrow-line') {
  } else if (arrow?.objType === 'z-arrow-line') {
    let data = getClosestPoint(
      helperData.scope.prevRightArrowHead,
      arrow,
      helperData
    );
    helperData.scope.canvas.add(helperData.scope.prevRightArrowHead);
    helperData.scope.prevRightArrowHead.set({
      points: [
        {
          x: helperData.scope.arrowHeadLengthFactor * arrow.get('strokeWidth'),
          y: 0,
        },
        {
          x: 0,
          y:
            (-arrow.get('strokeWidth') *
              helperData.scope.arrowHeadLengthFactor) /
            2,
        },
        {
          x: 0,
          y:
            (arrow.get('strokeWidth') *
              helperData.scope.arrowHeadLengthFactor) /
            2,
        },
      ],
      fill: 'white',
      objType: 'arrow-head-end-type-two',
      strokeWidth: arrow.get('strokeWidth'),
      left: data.left,
      top: data.top,
    });
    helperData.scope.canvas.requestRenderAll();
  }
};

export const moveEveryControlPointUpInTheStack = (helperData) => {
  helperData.scope.canvas.getObjects().forEach((ob) => {
    if (ob?.label === 'control-point') {
      helperData.scope.canvas.bringToFront(ob);
    }
  });
  helperData.scope.canvas.requestRenderAll();
};

export const zTypeArrowWidthChanger = (
  arrow,
  arrowHeads,
  strokeUpdated,
  helperData
) => {
  removeLeftArrowHeadById(arrow.UID, helperData);
  removeRightArrowHeadById(arrow.UID, helperData);
  if (arrowHeads[0]?.objType.split('-')[4] === 'one') {
    let arrowHead = createLeftArrowTypeOne(arrow, helperData);
    updateAngleAndPositionOfLeftArrowTypeOne(arrowHead, arrow, helperData);
  } else if (arrowHeads[0]?.objType.split('-')[4] === 'two') {
    let arrowHead = createLeftArrowTypeTwo(arrow, helperData);
    updateAngleAndPositionOfLeftArrowTypeTwo(arrowHead, arrow, helperData);
  } else if (arrowHeads[0]?.objType.split('-')[4] === 'three') {
  }

  if (arrowHeads[1]?.objType.split('-')[4] === 'one') {
    let arrowHead = createRightArrowTypeOne(arrow, helperData);
    updateAngleAndPositionOfRightArrowTypeOne(arrowHead, arrow, helperData);
  } else if (arrowHeads[1]?.objType.split('-')[4] === 'two') {
    let arrowHead = createRightArrowTypeTwo(arrow, helperData);
    updateAngleAndPositionOfRightArrowTypeTwo(arrowHead, arrow, helperData);
  } else if (arrowHeads[1]?.objType.split('-')[4] === 'three') {
  }
  moveEveryControlPointUpInTheStack(helperData);
  helperData.scope.canvas.requestRenderAll();
};

export const straightArrowWidthChanger = (
  arrow,
  arrowHeads,
  strokeUpdated,
  helperData
) => {
  // updateArrowLinePosition(arrow);
  let x1 = arrow.x1;
  let y1 = arrow.y1;
  let x2 = arrow.x2;
  let y2 = arrow.y2;
  let basicAngle = calcLengthAndAngleOfLine(x1, y1, x2, y2);
  if (arrowHeads[0] !== undefined) {
    arrowHeads[0].set({
      points: [
        { x: 0, y: 0 },
        {
          x: -helperData.scope.arrowHeadLengthFactor * strokeUpdated,
          y: (-strokeUpdated * helperData.scope.arrowHeadLengthFactor) / 2,
        },
        {
          x: -helperData.scope.arrowHeadLengthFactor * strokeUpdated,
          y: (strokeUpdated * helperData.scope.arrowHeadLengthFactor) / 2,
        },
      ],
      top: arrow.y1,
      left: arrow.x1,
      strokeWidth: strokeUpdated,
    });
    updateArrowHeadStart(x1, y1, x2, y2, basicAngle, arrowHeads[0]);
  }

  if (arrowHeads[1] !== undefined) {
    arrowHeads[1].set({
      points: [
        { x: 0, y: 0 },
        {
          x: -helperData.scope.arrowHeadLengthFactor * strokeUpdated,
          y: (-strokeUpdated * helperData.scope.arrowHeadLengthFactor) / 2,
        },
        {
          x: -helperData.scope.arrowHeadLengthFactor * strokeUpdated,
          y: (strokeUpdated * helperData.scope.arrowHeadLengthFactor) / 2,
        },
      ],
      top: arrow.y2,
      left: arrow.x2,
      strokeWidth: strokeUpdated,
    });

    updateArrowHeadEnd(x1, y1, x2, y2, basicAngle, arrowHeads[1]);
  }
};

export const updateAngleOfArrowHeads = (angle1, angle2, headOne, headTwo) => {
  headOne?.set({ angle: angle1 });
  headTwo?.set({ angle: angle2 });
  headOne?.setCoords();
  headTwo?.setCoords();
};
export const toBendArrowConvertor = (arrow, helperData) => {
  if (arrow) {
    const { $, fabric } = helperData;
    removeControlPoints(helperData);
    const [start, end] = getTwoArrowHeads(arrow, helperData);
    $(`div[id=${arrow.UID}]`).remove();
    helperData.scope.canvas.remove(arrow);
    helperData.scope.canvas.remove(start);
    helperData.scope.canvas.remove(end);
    let id = arrow.UID;
    let strokeWidth = arrow.get('strokeWidth');
    let strokeColor = arrow.get('stroke');
    let strokeDashArray = arrow.get('strokeDashArray');

    const [x1, y1, x2, y2] = [
      arrow.get('x1'),
      arrow.get('y1'),
      arrow.get('x2'),
      arrow.get('y2'),
    ];

    let bendArrow = new fabric.Path('M 0 0 L 0 0 L 0 0 L 0 0');

    bendArrow.set({
      UID: id,
      objType: 'z-arrow-line',
      fill: '',
      strokeWidth,
      stroke: strokeColor,
      left: x1,
      top: y1,
      originX: 'center',
      originY: 'center',
      strokeLineJoin: 'round',
      selectable: true,
      hasControls: false,
      hasBorders: false,
      arrayLeft: [0, 0],
      lastMiddleLeftPoint: null,
      strokeDashArray,
      perPixelTargetFind: true,
      selectMe: true,
    });

    let arrowHeadStartGenTypeOne = new fabric.Polygon(
      [
        { x: -helperData.scope.arrowHeadLengthFactor * strokeWidth, y: 0 },
        {
          x: 0,
          y: (-strokeWidth * helperData.scope.arrowHeadLengthFactor) / 2,
        },
        { x: 0, y: (strokeWidth * helperData.scope.arrowHeadLengthFactor) / 2 },
      ],
      {
        UID: id,
        objType: 'arrow-head-start-type-one',
        strokeWidth,
        stroke: strokeColor,
        fill: start?.fill ? start?.fill : strokeColor,
        left: x1,
        top: y1,
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

    let arrowHeadEndGenTypeOne = new fabric.Polygon(
      [
        { x: helperData.scope.arrowHeadLengthFactor * strokeWidth, y: 0 },
        {
          x: 0,
          y: (-strokeWidth * helperData.scope.arrowHeadLengthFactor) / 2,
        },
        { x: 0, y: (strokeWidth * helperData.scope.arrowHeadLengthFactor) / 2 },
      ],
      {
        UID: id,
        objType: 'arrow-head-end-type-one',
        strokeWidth: strokeWidth,
        stroke: strokeColor,
        fill: end?.fill ? end?.fill : strokeColor,
        left: x2,
        top: y2,
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

    const [left1, top1, left2, top2] = [x1, y1, x2, y2];
    let height = Math.abs(top2 - top1);
    let width = Math.abs(left2 - left1);
    bendArrow.set({ width: width, height: height });
    if (left2 > left1) {
      if (top1 < top2) {
        bendArrow.set({
          originY: 'top',
          originX: 'left',
          left: left1,
          top: top1 - strokeWidth / 2,
        });
        updatePerpendicularLine(
          -width / 2 - strokeWidth / 2,
          -height / 2,
          0,
          -height / 2,
          0,
          height / 2,
          width / 2 - strokeWidth / 2,
          height / 2,
          bendArrow
        );
        const [start, end] = getTwoArrowHeads(bendArrow, helperData);
        updateAngleOfArrowHeads(0, 0, start, end);
      } else if (top1 > top2) {
        bendArrow.set({
          originY: 'bottom',
          originX: 'left',
          left: left1,
          top: top1 + strokeWidth / 2,
        });
        updatePerpendicularLine(
          -width / 2 - strokeWidth / 2,
          height / 2,
          0,
          height / 2,
          0,
          -height / 2,
          width / 2 - strokeWidth / 2,
          -height / 2,
          bendArrow
        );
        const [start, end] = getTwoArrowHeads(bendArrow, helperData);
        updateAngleOfArrowHeads(0, 0, start, end);
      }
    } else if (left2 < left1) {
      if (top1 < top2) {
        bendArrow.set({
          originY: 'top',
          originX: 'right',
          left: left1,
          top: top1 - strokeWidth / 2,
        });
        updatePerpendicularLine(
          width / 2 + strokeWidth / 2,
          -height / 2,
          0,
          -height / 2,
          0,
          height / 2,
          -width / 2 + strokeWidth / 2,
          height / 2,
          bendArrow
        );
        const [start, end] = getTwoArrowHeads(bendArrow, helperData);
        updateAngleOfArrowHeads(180, 180, start, end);
      } else if (top1 > top2) {
        bendArrow.set({
          originY: 'bottom',
          originX: 'right',
          left: left1,
          top: top1 + strokeWidth / 2,
        });
        updatePerpendicularLine(
          width / 2 + strokeWidth / 2,
          height / 2,
          0,
          height / 2,
          0,
          -height / 2,
          -width / 2 + strokeWidth / 2,
          -height / 2,
          bendArrow
        );
        const [start, end] = getTwoArrowHeads(bendArrow, helperData);
        updateAngleOfArrowHeads(180, 180, start, end);
      }
    }
    helperData.scope.canvas.add(
      bendArrow,
      arrowHeadStartGenTypeOne,
      arrowHeadEndGenTypeOne
    );
    const arrowHeadData = {
      type1: [arrowHeadStartGenTypeOne, arrowHeadEndGenTypeOne],
      type2: [arrowHeadStartGenTypeOne, arrowHeadEndGenTypeOne],
      type3: [arrowHeadStartGenTypeOne, arrowHeadEndGenTypeOne],
    };
    addingToolbarAndControlPointsOfZTypeArrow(
      bendArrow,
      arrowHeadData,
      helperData
    );

    helperData.scope.canvas.requestRenderAll();
    arrowToolbarPosHandler(
      $(`div[id=${id}]`),
      bendArrow,
      arrowHeadData,
      helperData
    );
    emitArrowConverted(
      [bendArrow, arrowHeadStartGenTypeOne, arrowHeadEndGenTypeOne],
      helperData
    );
  }
};

export const convertToBendArrowHandler = (arrow, helperData) => {
  toBendArrowConvertor(arrow, helperData);
};

export const arrowWitdhChangeHandler = (
  arrow,
  arrowHeads,
  strokeUpdated,
  helperData
) => {
  arrow.set({
    strokeWidth: strokeUpdated,
  });
  arrow.setCoords();
  helperData.scope.canvas.requestRenderAll();
  if (arrow?.objType === 'straight-arrow-line') {
    straightArrowWidthChanger(arrow, arrowHeads, strokeUpdated, helperData);
  } else if (arrow?.objType === 'z-arrow-line') {
    zTypeArrowWidthChanger(arrow, arrowHeads, strokeUpdated, helperData);
  } else if (arrow?.objType === 'curve-arrow-line') {
  }
};

export const arrowToolbarPosHandler = (
  toolbar,
  arrow,
  arrowHeadObject,
  helperData
) => {
  const { fabric } = helperData;
  let toolbarWidth = parseInt(toolbar.css('width').split('p')[0]);
  let toolbarHeight = parseInt(toolbar.css('height').split('p')[0]);
  let rt = helperData.scope.currentRatio;
  let arrowY1, arrowY2, arrowX1, arrowX2;

  const [start, end] = getTwoArrowHeads(arrow, helperData);
  if (arrow?.objType === 'straight-arrow-line') {
    arrowY1 = arrow.get('y1');
    arrowY2 = arrow.get('y2');
    arrowX1 = arrow.get('x1');
    arrowX2 = arrow.get('x2');
  } else {
    arrowY1 = start.get('top');
    arrowY2 = end.get('top');
    arrowX1 = start.get('left');
    arrowX2 = end.get('left');
  }

  let lowestTopPos = arrowY1 < arrowY2 ? arrowY1 : arrowY2;
  let greatestTopPos = arrowY1 > arrowY2 ? arrowY1 : arrowY2;
  let lowestLeftPos = arrowX1 < arrowX2 ? arrowX1 : arrowX2;
  let greatestLeftPos = arrowX1 > arrowX2 ? arrowX1 : arrowX2;
  let centerPos = fabric.util.transformPoint(
    new fabric.Point(arrow.getCenterPoint().x, arrow.getCenterPoint().y),
    helperData.scope.canvas.viewportTransform
  );
  let lowestPoint = fabric.util.transformPoint(
    new fabric.Point(lowestLeftPos, lowestTopPos),
    helperData.scope.canvas.viewportTransform
  );
  let greatestPoint = fabric.util.transformPoint(
    new fabric.Point(greatestLeftPos, greatestTopPos),
    helperData.scope.canvas.viewportTransform
  );
  let minTop = lowestPoint.y;
  let maxTop = greatestPoint.y;
  let toolbarTopPos = minTop - 100 * rt;
  let toolbarLeftPos = centerPos.x - toolbarWidth / 2;
  if (toolbarTopPos <= 75 * rt && toolbarLeftPos <= 75 * rt) {
    toolbarTopPos = maxTop + 100 * rt - toolbarHeight;
    toolbarLeftPos = 75 * rt;
  } else if (
    toolbarTopPos <= 75 * rt &&
    toolbarLeftPos + toolbarWidth >=
      helperData.scope.canvas.getWidth() - 50 * rt
  ) {
    toolbarTopPos = maxTop + 100 * rt - toolbarHeight;
    toolbarLeftPos =
      helperData.scope.canvas.getWidth() - 50 * rt - toolbarWidth;
  } else if (toolbarTopPos <= 75 * rt) {
    toolbarTopPos = maxTop + 100 * rt - toolbarHeight;
  } else if (toolbarLeftPos <= 75 * rt) {
    toolbarLeftPos = 75 * rt;
  } else if (
    toolbarLeftPos + toolbarWidth >=
    helperData.scope.canvas.getWidth() - 50 * rt
  ) {
    toolbarLeftPos =
      helperData.scope.canvas.getWidth() - 50 * rt - toolbarWidth;
  }

  if (
    toolbar.css('display') !== 'flex' &&
    helperData.scope.userAccess !== 'readonly'
  ) {
    toolbar.css({
      top: toolbarTopPos,
      left: toolbarLeftPos,
      display: 'flex',
    });
  }
};

export const toStraightArrowConvertor = (arrow, helperData) => {
  if (arrow) {
    const { $, fabric } = helperData;
    removeControlPoints(helperData);
    const [start, end] = getTwoArrowHeads(arrow, helperData);
    $(`div[id=${arrow.UID}]`).remove();
    helperData.scope.canvas.remove(arrow);
    helperData.scope.canvas.remove(start);
    helperData.scope.canvas.remove(end);
    let id = arrow.UID;
    let strokeWidth = arrow.get('strokeWidth');
    let strokeColor = arrow.get('stroke');
    let strokeDashArray = arrow.get('strokeDashArray');

    const [x1, y1, x2, y2] = [
      start.get('left'),
      start.get('top'),
      end.get('left'),
      end.get('top'),
    ];

    let straightArrow = new fabric.Line([x1, y1, x1, y2], {
      UID: id,
      objType: 'straight-arrow-line',
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      hasBorders: false,
      hasControls: false,
      originX: 'center',
      originY: 'center',
      strokeDashArray,
      perPixelTargetFind: true,
      selectMe: true,
    });

    let arrowHeadStartGenTypeOne = new fabric.Polygon(
      [
        { x: 0, y: 0 },
        {
          x: -helperData.scope.arrowHeadLengthFactor * strokeWidth,
          y: (-strokeWidth * helperData.scope.arrowHeadLengthFactor) / 2,
        },
        {
          x: -helperData.scope.arrowHeadLengthFactor * strokeWidth,
          y: (strokeWidth * helperData.scope.arrowHeadLengthFactor) / 2,
        },
      ],
      {
        UID: id,
        objType: 'arrow-head-start-type-one',
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        fill: start?.fill ? start?.fill : strokeColor,
        originX: 'center',
        originY: 'center',
        left: x1,
        top: y1,
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
    let arrowHeadEndGenTypeOne = new fabric.Polygon(
      [
        { x: 0, y: 0 },
        {
          x: -helperData.scope.arrowHeadLengthFactor * strokeWidth,
          y: (-strokeWidth * helperData.scope.arrowHeadLengthFactor) / 2,
        },
        {
          x: -helperData.scope.arrowHeadLengthFactor * strokeWidth,
          y: (strokeWidth * helperData.scope.arrowHeadLengthFactor) / 2,
        },
      ],
      {
        UID: id,
        objType: 'arrow-head-end-type-one',
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        fill: end?.fill ? end?.fill : strokeColor,
        originX: 'center',
        originY: 'center',
        left: x2,
        top: y2,
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
    helperData.scope.canvas.add(
      straightArrow,
      arrowHeadStartGenTypeOne,
      arrowHeadEndGenTypeOne
    );

    straightArrow.set({
      x2: x2,
      y2: y2,
    });

    arrowHeadEndGenTypeOne.set({
      left: x2,
      top: y2,
    });
    helperData.scope.canvas.requestRenderAll();

    let basicAngle = calcLengthAndAngleOfLine(x1, y1, x2, y2);
    straightArrow.setCoords();
    arrowHeadEndGenTypeOne.setCoords();
    arrowHeadStartGenTypeOne.setCoords();
    helperData.scope.canvas.requestRenderAll();
    updateArrowHeadStart(x1, y1, x2, y2, basicAngle, arrowHeadStartGenTypeOne);
    updateArrowHeadEnd(x1, y1, x2, y2, basicAngle, arrowHeadEndGenTypeOne);

    const arrowHeadData = {
      type1: [arrowHeadStartGenTypeOne, arrowHeadEndGenTypeOne],
      type2: [arrowHeadStartGenTypeOne, arrowHeadEndGenTypeOne],
      type3: [arrowHeadStartGenTypeOne, arrowHeadEndGenTypeOne],
    };

    addingToolbarAndControlPointsOfStraightArrow(
      straightArrow,
      arrowHeadData,
      helperData
    );

    arrowToolbarPosHandler(
      $(`div[id=${id}]`),
      straightArrow,
      arrowHeadData,
      helperData
    );
    emitArrowConverted(
      [straightArrow, arrowHeadStartGenTypeOne, arrowHeadEndGenTypeOne],
      helperData
    );
  }
};

export const convertToStraightArrowHandler = (arrow, helperData) => {
  toStraightArrowConvertor(arrow, helperData);
};

export const addingEventsOnControlPointsOfStraightArrow = (
  arrow,
  arrowHeadObject,
  controlPoints,
  helperData
) => {
  const [controlOne, controlTwo] = controlPoints;
  let leftPositionOfControlPoint1 = controlOne.left;
  let topPositionOfControlPoint1 = controlOne.top;
  let leftPositionOfControlPoint2 = controlTwo.left;
  let topPositionOfControlPoint2 = controlTwo.top;

  controlOne.on('moving', (e) => {
    const [start, end] = getTwoArrowHeads(arrow, helperData);
    let obj = e.transform.target;
    obj.setCoords();
    leftPositionOfControlPoint1 = obj.left;
    topPositionOfControlPoint1 = obj.top;

    arrow.set({
      x1: leftPositionOfControlPoint1,
      y1: topPositionOfControlPoint1,
      x2: leftPositionOfControlPoint2,
      y2: topPositionOfControlPoint2,
    });
    arrow.setCoords();
    let [x1, y1, x2, y2] = [arrow.x1, arrow.y1, arrow.x2, arrow.y2];
    let basicAngle = calcLengthAndAngleOfLine(x1, y1, x2, y2);

    if (start) {
      start.setCoords();
      start.set({
        left: leftPositionOfControlPoint1,
        top: topPositionOfControlPoint1,
      });

      updateArrowHeadStart(x1, y1, x2, y2, basicAngle, start);
    }
    end && updateArrowHeadEnd(x1, y1, x2, y2, basicAngle, end);

    emitArrowResize(
      {
        objects: [arrow, start, end],
        pointers: {
          start: {
            x: leftPositionOfControlPoint1,
            y: topPositionOfControlPoint1,
          },
          mid: {},
          end: {
            x: leftPositionOfControlPoint2,
            y: topPositionOfControlPoint2,
          },
        },
        type: 'control-one',
      },
      helperData
    );
  });

  controlTwo.on('moving', (e) => {
    const [start, end] = getTwoArrowHeads(arrow, helperData);
    let obj = e.transform.target;
    obj.setCoords();
    leftPositionOfControlPoint2 = obj.left;
    topPositionOfControlPoint2 = obj.top;

    arrow.set({
      x1: leftPositionOfControlPoint1,
      y1: topPositionOfControlPoint1,
      x2: leftPositionOfControlPoint2,
      y2: topPositionOfControlPoint2,
    });
    arrow.setCoords();
    let [x1, y1, x2, y2] = [arrow.x1, arrow.y1, arrow.x2, arrow.y2];
    let basicAngle = calcLengthAndAngleOfLine(x1, y1, x2, y2);
    if (end) {
      end.setCoords();
      end.set({
        left: leftPositionOfControlPoint2,
        top: topPositionOfControlPoint2,
      });

      updateArrowHeadEnd(x1, y1, x2, y2, basicAngle, end);
    }
    start && updateArrowHeadStart(x1, y1, x2, y2, basicAngle, start);
    emitArrowResize(
      {
        objects: [arrow, start, end],
        pointers: {
          start: {
            x: leftPositionOfControlPoint1,
            y: topPositionOfControlPoint1,
          },
          mid: {},
          end: {
            x: leftPositionOfControlPoint2,
            y: topPositionOfControlPoint2,
          },
        },
        type: 'control-two',
      },
      helperData
    );
  });
};

export const addControlPointsForStraightArrow = (arrow, helperData) => {
  const { fabric } = helperData;
  const arrowHeadObject = '';
  const headTypes = ['start', 'end'];
  const isControlExists = headTypes.every((type) => {
    return objectOnCanvasExistOrNot(
      arrow.UID,
      `straight-control-${type}`,
      helperData
    );
  });

  if (!isControlExists && arrow.selectMe) {
    removeControlPoints(helperData);
    let controlPointStart = new fabric.Circle({
      UID: arrow.UID,
      label: 'control-point',
      objType: 'straight-control-start',
      radius: helperData.scope.sizeOfControlPoint,
      fill: helperData.scope.fillColorOfControlPoint,
      hasBorders: false,
      hasControls: false,
      originX: 'center',
      originY: 'center',
      left: arrow.x1,
      top: arrow.y1,
    });

    let controlPointEnd = new fabric.Circle({
      UID: arrow.UID,
      label: 'control-point',
      objType: 'straight-control-end',
      radius: helperData.scope.sizeOfControlPoint,
      fill: helperData.scope.fillColorOfControlPoint,
      hasBorders: false,
      hasControls: false,
      originX: 'center',
      originY: 'center',
      left: arrow.x2,
      top: arrow.y2,
    });

    const controlPoints = [controlPointStart, controlPointEnd];

    helperData.scope.canvas.add(controlPointStart, controlPointEnd);
    helperData.scope.canvas.requestRenderAll();
    addingEventsOnControlPointsOfStraightArrow(
      arrow,
      arrowHeadObject,
      controlPoints,
      helperData
    );
  }
};

export const addingControlPointsOnStraightArrow = (
  arrow,
  arrowHeadObject,
  arrowToolbar,
  helperData
) => {
  let objectsToMoveTogether = [];
  let centerPointMidDiff = null;
  let shouldCallOnce = true;

  arrow.on('mousedown', (e) => {
    objectsToMoveTogether = [];
    let arrowLine = e.target;
    let centerPos = e.target.getCenterPoint();

    const arrowHeads = getTwoCorrespondingArrowHeads(arrowLine, helperData);
    moveEveryArrowUpInTheStack(helperData);
    if (arrowHeads.length > 0) {
      arrowHeads.forEach((obj) => {
        objectsToMoveTogether.push({
          diffX: obj.left - centerPos.x,
          diffY: obj.top - centerPos.y,
          object: obj,
        });
      });
    }
    arrowToolbarPosHandler(arrowToolbar, arrow, arrowHeadObject, helperData);
    addControlPointsForStraightArrow(arrowLine, helperData);
  });
  arrow.on('moving', (e) => {
    let obj = e.transform.target;
    let centerPointX = obj.getCenterPoint().x;
    let centerPointY = obj.getCenterPoint().y;
    let objectOffset = obj.calcLinePoints();
    let offsetX1 = objectOffset.x1;
    let offsetY1 = objectOffset.y1;
    let offsetX2 = objectOffset.x2;
    let offsetY2 = objectOffset.y2;
    obj.set({
      x1: centerPointX + offsetX1,
      y1: centerPointY + offsetY1,
      x2: centerPointX + offsetX2,
      y2: centerPointY + offsetY2,
    });
    obj.setCoords();
    if (shouldCallOnce) {
      removeControlPoints(helperData);
      shouldCallOnce = false;
    }
    let updatedArrow = e.transform.target;
    updatedArrow.setCoords();
    let centerPos = e.transform.target.getCenterPoint();
    if (objectsToMoveTogether.length > 0) {
      objectsToMoveTogether.forEach((data) => {
        data.object.set({
          left: centerPos.x + data.diffX,
          top: centerPos.y + data.diffY,
        });
        data.object.setCoords();
      });
    }
    helperData.scope.canvas.requestRenderAll();
    // let result = false;
    // result = setIndicationOfConnectionBetweenShapesAndArrows({left:arrow.x1,top:arrow.y1,label:'left-arrow'});

    // !result && setIndicationOfConnectionBetweenShapesAndArrows({left:arrow.x2,top:arrow.y2,label:'right-arrow'});
    const [start, end] = getTwoArrowHeads(arrow, helperData);
    emitMovedArrow([arrow, start, end], helperData);
  });
  arrow.on('moved', (e) => {
    let updatedArrow = e.transform.target;
    updatedArrow.setCoords();
    shouldCallOnce = true;
    arrowToolbarPosHandler(arrowToolbar, arrow, arrowHeadObject, helperData);
  });
};

export const addingEventsOnControlPointsOfZTypeArrow = (
  arrow,
  arrowHeadObject,
  controlPoints,
  helperData
) => {
  const [controlOne, controlMiddle, controlTwo] = controlPoints;
  let leftPosOfArrowHead1,
    topPosOfArrowHead1,
    leftPosOfArrowHead2,
    topPosOfArrowHead2;
  let leftPositionOfControlPoint1 = controlOne.left;
  let topPositionOfControlPoint1 = controlOne.top;
  let leftPositionOfControlPoint2 = controlMiddle.left;
  let topPositionOfControlPoint2 = controlMiddle.top;
  let leftPositionOfControlPoint3 = controlTwo.left;
  let topPositionOfControlPoint3 = controlTwo.top;

  controlOne.on('moving', (e) => {
    let midPos;
    const [start, end] = getTwoArrowHeads(arrow, helperData);

    let obj = e.transform.target;
    obj.setCoords();
    leftPositionOfControlPoint1 = obj.left;
    topPositionOfControlPoint1 = obj.top;
    midPos = getZTypeArrowMiddlePoint(arrow, helperData);
    if (start) {
      start.setCoords();
      start.set({
        left: leftPositionOfControlPoint1,
        top: topPositionOfControlPoint1,
        angle: leftPositionOfControlPoint1 < midPos.x ? 0 : 180,
      });
      start.setCoords();
    }
    if (end) {
      end.setCoords();
    }
    controlMiddle.setCoords();
    let middleTopPosOfControlPoint2 =
      (topPositionOfControlPoint1 + topPositionOfControlPoint3) / 2;
    controlMiddle.set({ top: middleTopPosOfControlPoint2 });
    controlMiddle.setCoords();

    updateZTypeArrowForControlPointOne(
      arrow,
      leftPositionOfControlPoint1,
      topPositionOfControlPoint1,
      leftPositionOfControlPoint3,
      topPositionOfControlPoint3,
      leftPositionOfControlPoint1,
      leftPositionOfControlPoint2,
      leftPositionOfControlPoint3,
      topPositionOfControlPoint1,
      topPositionOfControlPoint2,
      topPositionOfControlPoint3
    );
    helperData.scope.canvas.requestRenderAll();

    emitArrowResize(
      {
        objects: [arrow, start, end],
        pointers: {
          start: {
            x: leftPositionOfControlPoint1,
            y: topPositionOfControlPoint1,
          },
          mid: {
            x: leftPositionOfControlPoint2,
            y: topPositionOfControlPoint2,
          },
          end: {
            x: leftPositionOfControlPoint3,
            y: topPositionOfControlPoint3,
          },
        },
        type: 'control-one',
      },
      helperData
    );
  });
  controlMiddle.on('moving', (e) => {
    const [start, end] = getTwoArrowHeads(arrow, helperData);
    let obj = e.transform.target;
    obj.setCoords();
    leftPositionOfControlPoint2 = obj.left;
    topPositionOfControlPoint2 = obj.top;

    if (start) {
      start.setCoords();
      start.set({
        left: leftPositionOfControlPoint1,
        top: topPositionOfControlPoint1,
        angle: start.left < leftPositionOfControlPoint2 ? 0 : 180,
      });
      start.setCoords();
    }
    if (end) {
      end.setCoords();
      end.set({
        left: leftPositionOfControlPoint3,
        top: topPositionOfControlPoint3,
        angle: end.left > leftPositionOfControlPoint2 ? 0 : 180,
      });
      end.setCoords();
    }

    updateZTypeArrowForControlPointOne(
      arrow,
      leftPositionOfControlPoint1,
      topPositionOfControlPoint1,
      leftPositionOfControlPoint3,
      topPositionOfControlPoint3,
      leftPositionOfControlPoint1,
      leftPositionOfControlPoint2,
      leftPositionOfControlPoint3,
      topPositionOfControlPoint1,
      topPositionOfControlPoint2,
      topPositionOfControlPoint3
    );
    helperData.scope.canvas.requestRenderAll();
    emitArrowResize(
      {
        objects: [arrow, start, end],
        pointers: {
          start: {
            x: leftPositionOfControlPoint1,
            y: topPositionOfControlPoint1,
          },
          mid: {
            x: leftPositionOfControlPoint2,
            y: topPositionOfControlPoint2,
          },
          end: {
            x: leftPositionOfControlPoint3,
            y: topPositionOfControlPoint3,
          },
        },
        type: 'control-mid',
      },
      helperData
    );
  });
  controlTwo.on('moving', (e) => {
    let midPos;
    const [start, end] = getTwoArrowHeads(arrow, helperData);
    let obj = e.transform.target;
    obj.setCoords();
    leftPositionOfControlPoint3 = obj.left;
    topPositionOfControlPoint3 = obj.top;
    midPos = getZTypeArrowMiddlePoint(arrow, helperData);
    if (start) {
      start.setCoords();
    }
    if (end) {
      end.setCoords();
      end.set({
        left: leftPositionOfControlPoint3,
        top: topPositionOfControlPoint3,
        angle: leftPositionOfControlPoint3 > midPos.x ? 0 : 180,
      });
      end.setCoords();
    }

    controlMiddle.setCoords();
    let middleTopPosOfControlPoint2 =
      (topPositionOfControlPoint1 + topPositionOfControlPoint3) / 2;
    controlMiddle.set({ top: middleTopPosOfControlPoint2 });
    controlMiddle.setCoords();

    updateZTypeArrowForControlPointTwo(
      arrow,
      leftPositionOfControlPoint1,
      topPositionOfControlPoint1,
      leftPositionOfControlPoint3,
      topPositionOfControlPoint3,
      leftPositionOfControlPoint1,
      leftPositionOfControlPoint2,
      leftPositionOfControlPoint3,
      topPositionOfControlPoint1,
      topPositionOfControlPoint2,
      topPositionOfControlPoint3
    );
    helperData.scope.canvas.requestRenderAll();
    emitArrowResize(
      {
        objects: [arrow, start, end],
        pointers: {
          start: {
            x: leftPositionOfControlPoint1,
            y: topPositionOfControlPoint1,
          },
          mid: {
            x: leftPositionOfControlPoint2,
            y: topPositionOfControlPoint2,
          },
          end: {
            x: leftPositionOfControlPoint3,
            y: topPositionOfControlPoint3,
          },
        },
        type: 'control-two',
      },
      helperData
    );
  });
};

export const addControlPointsForZArrow = (arrow, helperData) => {
  const { fabric } = helperData;
  const headTypes = ['start', 'middle', 'end'];
  const arrowHeadObject = '';
  const isControlExists = headTypes.every((type) => {
    return objectOnCanvasExistOrNot(
      arrow.UID,
      `z-type-control-${type}`,
      helperData
    );
  });
  if (!isControlExists && arrow.selectMe) {
    removeControlPoints(helperData);
    let arrowCenterPos = arrow.getCenterPoint();
    const [start, end] = getTwoArrowHeads(arrow, helperData);
    const centerPos = getZTypeArrowMiddlePoint(arrow, helperData);
    let middleTopPosOfPerpendicularLine = arrowCenterPos.y;
    let middleLeftPosOfPerpendicularLine;
    middleLeftPosOfPerpendicularLine = centerPos.x;

    let controlPointStart = new fabric.Circle({
      UID: arrow.UID,
      label: 'control-point',
      objType: 'z-type-control-start',
      radius: helperData.scope.sizeOfControlPoint,
      fill: helperData.scope.fillColorOfControlPoint,
      stroke: helperData.scope.strokeColorOfControlPoint,
      strokeWidth: helperData.scope.strokeWidthOfControlPoint,
      hasControls: false,
      hasBorders: false,
      left: start.left,
      top: start.top,
      originX: 'center',
      originY: 'center',
    });
    let controlPointMiddle = new fabric.Circle({
      UID: arrow.UID,
      label: 'control-point',
      objType: 'z-type-control-middle',
      radius: helperData.scope.sizeOfControlPoint,
      fill: helperData.scope.fillColorOfControlPoint,
      stroke: helperData.scope.strokeColorOfControlPoint,
      strokeWidth: helperData.scope.strokeWidthOfControlPoint,
      hasControls: false,
      hasBorders: false,
      left: middleLeftPosOfPerpendicularLine,
      top: middleTopPosOfPerpendicularLine,
      originX: 'center',
      originY: 'center',
      lockMovementY: true,
      hoverCursor: 'ew-resize',
      moveCursor: 'ew-resize',
    });
    let controlPointEnd = new fabric.Circle({
      UID: arrow.UID,
      label: 'control-point',
      objType: 'z-type-control-end',
      radius: helperData.scope.sizeOfControlPoint,
      fill: helperData.scope.fillColorOfControlPoint,
      stroke: helperData.scope.strokeColorOfControlPoint,
      strokeWidth: helperData.scope.strokeWidthOfControlPoint,
      hasControls: false,
      hasBorders: false,
      left: end.left,
      top: end.top,
      originX: 'center',
      originY: 'center',
    });

    const controlPoints = [
      controlPointStart,
      controlPointMiddle,
      controlPointEnd,
    ];

    helperData.scope.canvas.add(
      controlPointStart,
      controlPointMiddle,
      controlPointEnd
    );

    helperData.scope.canvas.requestRenderAll();
    addingEventsOnControlPointsOfZTypeArrow(
      arrow,
      arrowHeadObject,
      controlPoints,
      helperData
    );
  }
};

export const addingControlPointsOnZTypeArrow = (
  arrow,
  arrowHeadObject,
  arrowToolbar,
  helperData
) => {
  let objectsToMoveTogether = [];
  let centerPointMidDiff = null;
  let shouldCallOnce = true;

  arrow.on('mousedown', (e) => {
    objectsToMoveTogether = [];
    let arrowLine = e.target;
    let arrowCenterPos = e.target.getCenterPoint();
    const arrowHeads = getTwoCorrespondingArrowHeads(arrowLine, helperData);
    moveEveryArrowUpInTheStack(helperData);
    if (arrowHeads.length > 0) {
      arrowHeads.forEach((obj) => {
        objectsToMoveTogether.push({
          diffX: obj.left - arrowCenterPos.x,
          diffY: obj.top - arrowCenterPos.y,
          object: obj,
        });
      });
    }
    arrowToolbarPosHandler(arrowToolbar, arrow, arrowHeadObject, helperData);
    addControlPointsForZArrow(arrow, helperData);
  });
  arrow.on('moving', (e) => {
    if (shouldCallOnce) {
      removeControlPoints(helperData);
      shouldCallOnce = false;
    }
    let updatedArrow = e.transform.target;
    updatedArrow.setCoords();
    let centerPos = e.transform.target.getCenterPoint();
    if (objectsToMoveTogether.length > 0) {
      objectsToMoveTogether.forEach((data) => {
        data.object.set({
          left: centerPos.x + data.diffX,
          top: centerPos.y + data.diffY,
        });
        data.object.setCoords();
      });
    }
    const [start, end] = getTwoArrowHeads(arrow, helperData);
    // let result = false;
    // if(start){
    //   result = setIndicationOfConnectionBetweenShapesAndArrows(start)
    // }
    // if(end && !result){
    //   setIndicationOfConnectionBetweenShapesAndArrows(end)
    // }
    helperData.scope.canvas.requestRenderAll();
    emitMovedArrow([arrow, start, end], helperData);
  });
  arrow.on('moved', (e) => {
    shouldCallOnce = true;
    arrowToolbarPosHandler(arrowToolbar, arrow, arrowHeadObject, helperData);
  });
};

export const addingToolbarAndControlPointsOfZTypeArrow = (
  arrow,
  arrowHeadObject,
  helperData
) => {
  let arrowToolbar = arrowToolbarHandler(arrow, arrowHeadObject, helperData);
  addingControlPointsOnZTypeArrow(
    arrow,
    arrowHeadObject,
    arrowToolbar,
    helperData
  );
};

export const addingToolbarAndControlPointsOfStraightArrow = (
  arrow,
  arrowHeadObject,
  helperData
) => {
  let arrowToolbar = arrowToolbarHandler(arrow, arrowHeadObject, helperData);
  addingControlPointsOnStraightArrow(
    arrow,
    arrowHeadObject,
    arrowToolbar,
    helperData
  );
};

export const removeObjectById = (id, helperData) => {
  helperData.scope.canvas.getObjects().forEach((obj) => {
    if (obj?.UID === id) {
      helperData.scope.canvas.remove(obj);
    }
  });
  helperData.scope.canvas.requestRenderAll();
};

export const moveOnUserCollaborationArrowHandler = (data,helperData) => {
  removeControlPoints(helperData)
  data.forEach(obj=>{
    let object = objectOnCanvasExistOrNot(obj.UID,obj.objType,helperData)
    if(object){
      Object.keys(obj).forEach((key) => {
        object[key] = obj[key];
      });
      object.setCoords()
      object?.objType === "straight-arrow-line" && updateArrowLinePosition(object)
    }
  })
  helperData.scope.canvas.requestRenderAll()
}

export const updateArrowToolbarForUnLockedObject = (arrow,helperData) => {
  const {$} = helperData
  $(`div[id=${arrow.UID}]`).find('.arrow-color-section').css('display','block')
  $(`div[id=${arrow.UID}]`).find('.arrow-dashing-section').css('display','block')
  $(`div[id=${arrow.UID}]`).find('.arrow-strokewidth-section').css('display','block')
  $(`div[id=${arrow.UID}]`).find('.arrow-bend-section').css('display','block')
  $(`div[id=${arrow.UID}]`).find('.arrow-left-section').css('display','block')
  $(`div[id=${arrow.UID}]`).find('.arrow-right-section').css('display','block')
  $(`div[id=${arrow.UID}]`).find('.arrow-lock-section').css({'background-color': 'white'})
  $(`div[id=${arrow.UID}]`).css('display','none')
  $(`div[id=${arrow.UID}]`).css('width','35rem')
}

export const updateArrowToolbarForLockedObject = (arrow,helperData)=>{
  const {$} = helperData
  $(`div[id=${arrow.UID}]`).find('.arrow-color-section').css('display','none')
  $(`div[id=${arrow.UID}]`).find('.arrow-dashing-section').css('display','none')
  $(`div[id=${arrow.UID}]`).find('.arrow-strokewidth-section').css('display','none')
  $(`div[id=${arrow.UID}]`).find('.arrow-bend-section').css('display','none')
  $(`div[id=${arrow.UID}]`).find('.arrow-left-section').css('display','none')
  $(`div[id=${arrow.UID}]`).find('.arrow-right-section').css('display','none')
  $(`div[id=${arrow.UID}]`).find('.arrow-lock-section').css({'background-color': '#FA8072'})
  $(`div[id=${arrow.UID}]`).css('display','none')
  $(`div[id=${arrow.UID}]`).css('width','4rem')
}

export const updateArrowToolbarLockStatus = (arrow,helperData) => {
  if(arrow?.lockMovementX){
    updateArrowToolbarForLockedObject(arrow,helperData)
  }else {
    updateArrowToolbarForUnLockedObject(arrow,helperData)
  }
}

export const updateArrowToolbarColorStrokeWidthAndPixelIndicator = (arrow,helperData)=>{
  const {$} = helperData
  $(`div[id=${arrow.UID}]`).find('.arrow-color').css('background-color',arrow.get('stroke'))
   
  if(arrow.get('strokeDashArray')?.length > 0){
    if(arrow.get('strokeDashArray')[0] === 20){
     $(`div[id=${arrow.UID}]`).find('.current-straightarrow-image').attr('src','assets/img/Dashedline.svg')
    }else {
     $(`div[id=${arrow.UID}]`).find('.current-straightarrow-image').attr('src','assets/img/DottedLine.svg')
    }
  }else {
   $(`div[id=${arrow.UID}]`).find('.current-straightarrow-image').attr('src','assets/img/StraightLine.svg')
  }

 $(`div[id=${arrow.UID}]`).find('.pixel-indicator').html(`${arrow.get('strokeWidth')}px`)
}

export const updateArrowToolbarState = (arrow,helperData) => {
  updateArrowToolbarColorStrokeWidthAndPixelIndicator(arrow,helperData)
  updateArrowToolbarLockStatus(arrow,helperData)
}

export const modifiedOnUserCollaborationArrowHandler = (data,helperData) => {
  data.forEach(obj=>{
    let object = objectOnCanvasExistOrNot(obj.UID,obj.objType,helperData)
    if(object){
      Object.keys(obj).forEach((key) => {
        object[key] = obj[key];
      });
      if(object?.objType === "straight-arrow-line"){
        updateArrowLinePosition(object)
        updateArrowToolbarState(object,helperData)
      }else if(object?.objType === "z-arrow-line"){
        updateArrowToolbarState(object,helperData)
      }
      object.setCoords()
    }
  })
  helperData.scope.canvas.requestRenderAll()
}

export const updateArrowToolbarLeftArrow = (arrow,data,helperData)=>{
  const {$} = helperData
  if(data.target === "left-none"){
    const leftArrowDiv = $(`div[id=${arrow.UID}]`).find('.leftpointedarrow-datatoggle')
    leftArrowDiv.find('img').remove()
    leftArrowDiv.find('div').remove()
    const leftArrow =$(
      '<div class="leftarrow-none">None</div>'
    ).css({ 'font-size': '0.93rem' });
    leftArrowDiv.append(leftArrow)
  }else if(data.target === "left-one"){
    const leftArrowDiv = $(`div[id=${arrow.UID}]`).find('.leftpointedarrow-datatoggle')
    leftArrowDiv.find('img').remove()
    leftArrowDiv.find('div').remove()
    const leftArrow = $(
      '<img class="leftpointedarrow-type1" src="assets/img/ArrLeft1.svg">'
    ).css({ width: '3rem' });
    leftArrowDiv.append(leftArrow)
  }else if(data.target === "left-two"){
    const leftArrowDiv = $(`div[id=${arrow.UID}]`).find('.leftpointedarrow-datatoggle')
    leftArrowDiv.find('img').remove()
    leftArrowDiv.find('div').remove()
    const leftArrow = $(
      '<img class="leftpointedarrow-type2" src="assets/img/ArrLeft2.svg">'
    ).css({ width: '3rem' });
    leftArrowDiv.append(leftArrow)
  }

}

export const updateArrowToolbarRightArrow = (arrow,data,helperData)=>{
  const {$}  = helperData
  if(data.target === "right-none"){
    const rightArrowDiv = $(`div[id=${arrow.UID}]`).find('.rightpointedarrow-datatoggle')
    rightArrowDiv.find('img').remove()
    rightArrowDiv.find('div').remove()
    const rightArrow = $(
     '<div class="rightArrow-none">None</div>'
   ).css({ 'font-size': '0.93rem' });
    rightArrowDiv.append(rightArrow)
  }else if(data.target === "right-one"){
    const rightArrowDiv = $(`div[id=${arrow.UID}]`).find('.rightpointedarrow-datatoggle')
    rightArrowDiv.find('img').remove()
    rightArrowDiv.find('div').remove()
    const rightArrow = $(
     '<img class="rightpointedarrow-type1" src="assets/img/ArrRight1.svg">'
   ).css({ width: '3rem' });
    rightArrowDiv.append(rightArrow)
  }else if(data.target === "right-two"){
    const rightArrowDiv = $(`div[id=${arrow.UID}]`).find('.rightpointedarrow-datatoggle')
    rightArrowDiv.find('img').remove()
    rightArrowDiv.find('div').remove()
    const rightArrow =$(
     '<img class="rightpointedarrow-type2" src="assets/img/ArrRight2.svg">'
   ).css({ width: '3rem' });
    rightArrowDiv.append(rightArrow)
  }
}

export const addingHeadRightOfArrow =  (data,helperData) =>{
  const {fabric} = helperData
  let arrow = objectOnCanvasExistOrNot(data.objects[0].UID,data.objects[0].objType,helperData)
  updateArrowToolbarRightArrow(arrow,data,helperData)
  if(data.target.split('-')[1] === "none") return;

  let head = new fabric.Polygon()
  let headData = data.objects[2]
  Object.keys(headData).forEach((key) => {
    head[key] = headData[key];
  });
  helperData.scope.canvas.add(head)
  helperData.scope.canvas.requestRenderAll();
}
export const addingHeadLeftOfArrow = (data,helperData) => {
  const {fabric} = helperData
  let arrow = objectOnCanvasExistOrNot(data.objects[0].UID,data.objects[0].objType,helperData)
  updateArrowToolbarLeftArrow(arrow,data,helperData)
  if(data.target.split('-')[1] === "none") return;

  let head = new fabric.Polygon()
  let headData = data.objects[1]
  Object.keys(headData).forEach((key) => {
    head[key] = headData[key];
  });
  helperData.scope.canvas.add(head)
  helperData.scope.canvas.requestRenderAll();

}

export const handleChangeOfArrowHeads = (data,helperData) =>{
  if(data.target.split('-')[0] === "left"){
    removeLeftArrowHeadById(data.objects[0].UID,helperData);
    addingHeadLeftOfArrow(data,helperData)
  }else {
    removeRightArrowHeadById(data.objects[0].UID,helperData);
    addingHeadRightOfArrow(data,helperData)
  }
}

export const resizeStraightArrowOnCollabWithControlTwo = (data,helperData)=>{
  let arrow = objectOnCanvasExistOrNot(data.objects[0].UID,data.objects[0].objType,helperData)
  const [start,end] = getTwoArrowHeads(arrow,helperData)
  let leftPositionOfControlPoint1 = data.pointers.start.x;
  let topPositionOfControlPoint1 = data.pointers.start.y;
  let leftPositionOfControlPoint2 = data.pointers.end.x;
  let topPositionOfControlPoint2 = data.pointers.end.y;
  
  arrow.set({
    x1: leftPositionOfControlPoint1,
    y1: topPositionOfControlPoint1,
    x2: leftPositionOfControlPoint2,
    y2: topPositionOfControlPoint2,
  });
  arrow.setCoords();
  let [x1, y1, x2, y2] = [arrow.x1, arrow.y1, arrow.x2, arrow.y2];
  let basicAngle = calcLengthAndAngleOfLine(x1, y1, x2, y2);
  if (end) {
    end.setCoords();
    end.set({
      left: leftPositionOfControlPoint2,
      top: topPositionOfControlPoint2,
    });

    updateArrowHeadEnd(x1, y1, x2, y2, basicAngle, end);
  }
  start && updateArrowHeadStart(x1, y1, x2, y2, basicAngle, start);

}

export const resizeStraightArrowOnCollabWithControlOne = (data,helperData)=>{
  let arrow = objectOnCanvasExistOrNot(data.objects[0].UID,data.objects[0].objType,helperData)
  const [start,end] = getTwoArrowHeads(arrow,helperData)
  let leftPositionOfControlPoint1 = data.pointers.start.x;
  let topPositionOfControlPoint1 = data.pointers.start.y;
  let leftPositionOfControlPoint2 = data.pointers.end.x;
  let topPositionOfControlPoint2 = data.pointers.end.y;
  arrow.set({
    x1: leftPositionOfControlPoint1,
    y1: topPositionOfControlPoint1,
    x2: leftPositionOfControlPoint2,
    y2: topPositionOfControlPoint2,
  });
  arrow.setCoords();
  let [x1, y1, x2, y2] = [arrow.x1, arrow.y1, arrow.x2, arrow.y2];
  let basicAngle = calcLengthAndAngleOfLine(x1, y1, x2, y2);

  if (start) {
    start.setCoords();
    start.set({
      left: leftPositionOfControlPoint1,
      top: topPositionOfControlPoint1,
    });

    updateArrowHeadStart(x1, y1, x2, y2, basicAngle, start);
  }
  end && updateArrowHeadEnd(x1, y1, x2, y2, basicAngle, end);
}

export const resizeStraightArrowOnCollab = (data,helperData) => {
  removeControlPoints(helperData)
  if(data.type === "control-one"){
    resizeStraightArrowOnCollabWithControlOne(data,helperData)
  }else {
    resizeStraightArrowOnCollabWithControlTwo(data,helperData)
  }
}

export const resizeZArrowOnCollabWithControlOne = (data,helperData)=>{
  let arrow = objectOnCanvasExistOrNot(data.objects[0].UID,data.objects[0].objType,helperData)

  const [start,end] = getTwoArrowHeads(arrow,helperData)

  let leftPositionOfControlPoint1 = data.pointers.start.x;
  let topPositionOfControlPoint1 = data.pointers.start.y;
  let leftPositionOfControlPoint2 = data.pointers.mid.x;
  let topPositionOfControlPoint2 = data.pointers.mid.y;
  let leftPositionOfControlPoint3 = data.pointers.end.x;
  let topPositionOfControlPoint3 = data.pointers.end.y;

  let midPos = getZTypeArrowMiddlePoint(arrow,helperData);

  if (start) {
    start.setCoords();
    start.set({
      left: leftPositionOfControlPoint1,
      top: topPositionOfControlPoint1,
      angle: leftPositionOfControlPoint1 < midPos.x ? 0 : 180,
    });
    start.setCoords();
  }
  if (end) {
    end.setCoords();
  }

  updateZTypeArrowForControlPointOne(
    arrow,
    leftPositionOfControlPoint1,
    topPositionOfControlPoint1,
    leftPositionOfControlPoint3,
    topPositionOfControlPoint3,
    leftPositionOfControlPoint1,
    leftPositionOfControlPoint2,
    leftPositionOfControlPoint3,
    topPositionOfControlPoint1,
    topPositionOfControlPoint2,
    topPositionOfControlPoint3
  );
  helperData.scope.canvas.requestRenderAll();
}

export const  resizeZArrowOnCollabWithControlMid = (data,helperData) =>{
  let arrow = objectOnCanvasExistOrNot(data.objects[0].UID,data.objects[0].objType,helperData)

  const [start,end] = getTwoArrowHeads(arrow,helperData)

  let leftPositionOfControlPoint1 = data.pointers.start.x;
  let topPositionOfControlPoint1 = data.pointers.start.y;
  let leftPositionOfControlPoint2 = data.pointers.mid.x;
  let topPositionOfControlPoint2 = data.pointers.mid.y;
  let leftPositionOfControlPoint3 = data.pointers.end.x;
  let topPositionOfControlPoint3 = data.pointers.end.y;

  if (start) {
    start.setCoords();
    start.set({
      left: leftPositionOfControlPoint1,
      top: topPositionOfControlPoint1,
      angle: start.left < leftPositionOfControlPoint2 ? 0 : 180,
    });
    start.setCoords();
  }
  if (end) {
    end.setCoords();
    end.set({
      left: leftPositionOfControlPoint3,
      top: topPositionOfControlPoint3,
      angle: end.left > leftPositionOfControlPoint2 ? 0 : 180,
    });
    end.setCoords();
  }

  updateZTypeArrowForControlPointOne(
    arrow,
    leftPositionOfControlPoint1,
    topPositionOfControlPoint1,
    leftPositionOfControlPoint3,
    topPositionOfControlPoint3,
    leftPositionOfControlPoint1,
    leftPositionOfControlPoint2,
    leftPositionOfControlPoint3,
    topPositionOfControlPoint1,
    topPositionOfControlPoint2,
    topPositionOfControlPoint3
  );
  helperData.scope.canvas.requestRenderAll();
}

export const resizeZArrowOnCollabWithControlTwo = (data,helperData) => {
  let arrow = objectOnCanvasExistOrNot(data.objects[0].UID,data.objects[0].objType,helperData)

  const [start,end] = getTwoArrowHeads(arrow,helperData)

  let leftPositionOfControlPoint1 = data.pointers.start.x;
  let topPositionOfControlPoint1 = data.pointers.start.y;
  let leftPositionOfControlPoint2 = data.pointers.mid.x;
  let topPositionOfControlPoint2 = data.pointers.mid.y;
  let leftPositionOfControlPoint3 = data.pointers.end.x;
  let topPositionOfControlPoint3 = data.pointers.end.y;

  let midPos = getZTypeArrowMiddlePoint(arrow,helperData);

  if (start) {
    start.setCoords();
  }
  if (end) {
    end.setCoords();
    end.set({
      left: leftPositionOfControlPoint3,
      top: topPositionOfControlPoint3,
      angle: leftPositionOfControlPoint3 > midPos.x ? 0 : 180,
    });
    end.setCoords();
  }

  updateZTypeArrowForControlPointTwo(
    arrow,
    leftPositionOfControlPoint1,
    topPositionOfControlPoint1,
    leftPositionOfControlPoint3,
    topPositionOfControlPoint3,
    leftPositionOfControlPoint1,
    leftPositionOfControlPoint2,
    leftPositionOfControlPoint3,
    topPositionOfControlPoint1,
    topPositionOfControlPoint2,
    topPositionOfControlPoint3
  );
  helperData.scope.canvas.requestRenderAll();

}

export const resizeZArrowOnCollab = (data,helperData)=>{
  removeControlPoints(helperData)
  if(data.type === "control-one"){
    resizeZArrowOnCollabWithControlOne(data,helperData)
  }else if(data.type === "control-mid"){
    resizeZArrowOnCollabWithControlMid(data,helperData)
  }else if(data.type === "control-two"){
    resizeZArrowOnCollabWithControlTwo(data,helperData)
  }
}

export const saveArrowPreviousMiddleControlPos = (ob,helperData) => {
  if (ob?.objType === 'z-type-control-middle') {
    let arrow = objectOnCanvasExistOrNot(ob?.UID, 'z-arrow-line',helperData);
    let controlEnd = objectOnCanvasExistOrNot(
      ob?.UID,
      'z-type-control-end',helperData
    );
    arrow.arrayLeft[0] = controlEnd.left - ob.left;
    arrow.arrayLeft[1] = controlEnd.left;
    arrow.lastMiddleLeftPoint = ob.left - arrow.getCenterPoint().x;
    controlEnd.setCoords();
    arrow.setCoords();
    ob.setCoords();
  } else if (ob?.objType === 'curve-control-middle') {
    let left = [];
    let top = [];
    let id = ob.UID;
    let arrowHead1Left, arrowHead1Top;
    helperData.scope.canvas.getObjects().forEach((o) => {
      if (o?.objType === 'arrow-head-start-type-one' && o?.UID === id) {
        arrowHead1Left = o.left;
        arrowHead1Top = o.top;
      }
    });
    // canvas.getObjects().forEach(o => {
    //     if(o.label==='control-points-b') {
    //         left.push(o.left-arrowHead1Left);
    //         top.push(o.top-arrowHead1Top);
    //     }
    // });
    left.push(ob.left - arrowHead1Left);
    top.push(ob.top - arrowHead1Top);
    let length = left.length;
    helperData.scope.canvas.getObjects().forEach((o) => {
      if (o?.objType === 'curve-arrow-line' && o?.UID === id) {
        for (let i = 0; i < length; i++) {
          o.cpXPos[i] = left[i];
          o.cpYPos[i] = top[i];
        }
      }
    });
  }
}
