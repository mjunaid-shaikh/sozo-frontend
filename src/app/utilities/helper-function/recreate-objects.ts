import { reCreateCircle } from '../objects/circle';
import { reCreateOneByOneContainer } from '../objects/container-onebyone';
import { reCreateDiamond } from '../objects/diamond';
import { drawingObjectRetriever } from '../objects/free-drawing';
import { reCreateGif } from '../objects/gif-upload';
import { reCreateHexagon } from '../objects/hexagon';
import { reCreateUploadImg } from '../objects/image-upload';
import { reCreateRectangle } from '../objects/rectangle';
import { reCreateSquare } from '../objects/square';
import { reCreateStar } from '../objects/star';
import { reCreateStickyNotes } from '../objects/sticky-notes';
import { reCreateStraightTypeArrow } from '../objects/straight-arrow';
import { reCreateText } from '../objects/textarea';
import { reCreateTriangle } from '../objects/triangle';
import { reCreateZTypeArrow } from '../objects/z-arrow';
import { isObjectIsShape, objectOnCanvasExistOrNot } from './general-helper';
import { reCreateLockIconIndication } from './lock-indication';

export const retrieveObjectHandler = (obj, copy = false, helperData) => {
  let rt = helperData.scope.currentRatio;
  let retrFromServerOrNot = copy ? true : false;
  if (obj[0]?.objType === 'rect-shape') {
    reCreateRectangle(obj, retrFromServerOrNot, helperData);
  } else if (obj[0]?.objType === 'circle-shape') {
    reCreateCircle(obj, retrFromServerOrNot, helperData);
  } else if (obj[0]?.objType === 'triangle-shape') {
    reCreateTriangle(obj, retrFromServerOrNot, helperData);
  } else if (obj[0]?.objType === 'hexa-shape') {
    reCreateHexagon(obj, retrFromServerOrNot, helperData);
  } else if (obj[0]?.objType === 'star-shape') {
    reCreateStar(obj, retrFromServerOrNot, helperData);
  } else if (obj[0]?.objType === 'square-shape') {
    reCreateSquare(obj, retrFromServerOrNot, helperData);
  } else if (obj[0]?.objType === 'dia-shape') {
    reCreateDiamond(obj, retrFromServerOrNot, helperData);
  } else if (obj[0]?.objType === 'sticky-shape') {
    reCreateStickyNotes(obj, retrFromServerOrNot, helperData);
  } else if (obj[0]?.objType === 'area-shape') {
    reCreateText(obj, helperData);
  } else if (obj[0]?.objType === 'container-rect') {
    reCreateOneByOneContainer(obj, null, helperData);
  } else if (obj?.objType === 'uploaded-img') {
    reCreateUploadImg(obj, helperData);
  }
  // if are shape is overlap then this function called for prevent overlapping of text shape

  helperData.scope.canvas.forEachObject(function (obj) {
    if (obj.objType == 'area-text') {
      let obj2 = obj
      helperData.scope.canvas.remove(obj);
      helperData.scope.canvas.add(obj2)
    }
  });
};

export const drawAllCanvasObjects = (objects, helperData) => {
  objects.document?.forEach((data) => {
    if (data?.objType === 'free-drawing') {
      drawingObjectRetriever(data, helperData);
    } else if (isObjectIsShape(data)) {
      let text = objects.document?.find((ob) => {
        return ob.type === 'textbox' && ob.UID === data.UID;
      });
      retrieveObjectHandler([data, text], true, helperData);
    } else if (data?.objType === 'container-rect') {
      let text = objects.document?.find((ob) => {
        return ob?.objType === 'container-text' && ob.UID === data.UID;
      });
      let line = objects.document?.find((ob) => {
        return ob?.objType === 'container-line' && ob.UID === data.UID;
      });
      retrieveObjectHandler([data, text, line], true, helperData);
    } else if (data?.objType === 'uploaded-img') {
      retrieveObjectHandler(data, true, helperData);
    } else if (data?.objType === 'uploaded-gif') {
      reCreateGif(data, helperData);
    } else if (data?.objType === 'lock-Indication') {
      reCreateLockIconIndication(data, helperData);
    } else if (data?.objType === 'straight-arrow-line') {
      let arrow = data;
      let arrowHeadStart = objects.document?.find((ob) => {
        return ob?.label === 'left-arrow' && ob.UID === data.UID;
      });
      let arrowHeadEnd = objects.document?.find((ob) => {
        return ob?.label === 'right-arrow' && ob.UID === data.UID;
      });
      reCreateStraightTypeArrow(
        [arrow, arrowHeadStart, arrowHeadEnd],
        helperData
      );
    } else if (data?.objType === 'z-arrow-line') {
      let arrow = data;
      let arrowHeadStart = objects.document?.find((ob) => {
        return ob?.label === 'left-arrow' && ob.UID === data.UID;
      });
      let arrowHeadEnd = objects.document?.find((ob) => {
        return ob?.label === 'right-arrow' && ob.UID === data.UID;
      });
      reCreateZTypeArrow([arrow, arrowHeadStart, arrowHeadEnd], helperData);
    }
    // }else if (data?.objType === 'curve-arrow-line') {
    //   let arrow = data
    //   let arrowHeadStart = objects.document?.find((ob) => {
    //     return ob?.label === 'left-arrow' && ob.UID === data.UID;
    //   });
    //   let arrowHeadEnd = objects.document?.find((ob) => {
    //     return ob?.label === 'right-arrow' && ob.UID === data.UID;
    //   });
    //   reCreateCurveTypeArrow([arrow,arrowHeadStart,arrowHeadEnd])
    // }
  });
};

export const backup = (
  objects = null,
  undo = false,
  redo = false,
  fromSocket = false,
  helperData
) => {
  if (undo || redo) {
    // canvas.discardActiveObject();
    // removeTextEditingMode();
    // clearRestCanvasObjects(objects?.objects);
    // setObjectPositionForUndoRedo(objects);

    if (objects?.length > 0) {
      objects.forEach((obj) => {
        const corresObj = objectOnCanvasExistOrNot(
          obj.UID,
          obj.objType,
          helperData
        );
        Object.keys(obj).forEach((key) => {
          corresObj[key] = obj[key];
        });
      });
    } else {
    }
    helperData.scope.canvas.requestRenderAll();
  } else {
   // console.log(objects)
    if (fromSocket) {
      helperData.scope.shouldEmitObjectAddEvent = false;
    }
    drawAllCanvasObjects(objects, helperData);
    helperData.scope.shouldEmitObjectAddEvent = true;
  }
};
