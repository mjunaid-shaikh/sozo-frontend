import { connectionOfArrowOnMousedownHandler, getScalingArrowMoveTogetherData, moveArrowTogetherWithShapeHandler, moveArrowTogetherWithShapeWhileScaling } from "../helper-function/arrow-helper";
import { freeDrawingToolbarHandler } from "../helper-function/free-drawing-toolbar";
import { toolbarPosHandler } from "../helper-function/general-helper";
import { emitObjectAdded, emitObjectImageRotated, emitObjectMouseDown, emitObjectRemoved } from "../socket-events/socket-emit";

export const createFreeDrawing = (path,helperData) => {
    const {$} = helperData
    let uniqueId = new Date().getTime();
    path.objType = 'free-drawing';
    path.noScaleCache = false;
    path.strokeUniform = true;
    path.UID = uniqueId;
    path.selectMe = true;
    path.matchedLine = true;
    // updateMiniMap();
    helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    let freeDrawingMainDiv = freeDrawingToolbarHandler(uniqueId, path,null,helperData);
    // updateCanvasState();
    let connectionData = [];
    let scalingConnectionData = []
    path.on('mousedown', () => {
      if (helperData.scope.deletingFreeDrawingObj) {
        helperData.scope.canvas.remove(path);
        emitObjectRemoved(path.UID,helperData);
        $(`div[id=${path.UID}]`).remove();
        return;
      }
      connectionData = [];
      connectionData = connectionOfArrowOnMousedownHandler(
        path,
        connectionData,
        helperData
      );
      scalingConnectionData = getScalingArrowMoveTogetherData(path,connectionData,scalingConnectionData,helperData)
      helperData.scope.canvas.bringToFront(path);
      emitObjectMouseDown(path,helperData);
      toolbarPosHandler(freeDrawingMainDiv, path, helperData.scope.currentRatio,helperData);
    });
    path.on('moving', (e) => {
      let transformCenterPos = e.transform.target.getCenterPoint();
      moveArrowTogetherWithShapeHandler(
        connectionData,
        transformCenterPos,
        helperData
      );
    });
    path.on('moved', () => {
    //   updateCanvasState();
      toolbarPosHandler(freeDrawingMainDiv, path, helperData.scope.currentRatio,helperData);
    });
    path.on('rotated', () => {
    //   updateCanvasState();
      emitObjectImageRotated(path,helperData);
    });
    
    path.on('scaling', (e) => {
      let transformObj = e.transform.target;
      moveArrowTogetherWithShapeWhileScaling(transformObj,scalingConnectionData,helperData)
      
    });
    path.on('scaled', (e) => {
      let transformObj = e.transform.target;
      
      moveArrowTogetherWithShapeWhileScaling(transformObj,scalingConnectionData,helperData)

    //   updateCanvasState();
      emitObjectImageRotated(path,helperData);
    });
    emitObjectAdded([path],helperData);
} 

export const drawingObjectRetriever = (data,helperData) => {
  const {fabric,$} = helperData
  let type = fabric.util.string.camelize(
    fabric.util.string.capitalize(data.type)
  );
  fabric[type].fromObject(data, (object) => {
    let freeDrawingMainDiv = freeDrawingToolbarHandler(
      object.UID,
      object,
      true,
      helperData
    );
    let connectionData = [];
    let scalingConnectionData = [];

    object.on('mousedown', () => {
      if (helperData.scope.deletingFreeDrawingObj) {
        helperData.scope.canvas.remove(object);
        emitObjectRemoved(object.UID,helperData);
        $(`div[id=${object.UID}]`).remove();
        return;
      }
      connectionData = [];
    scalingConnectionData = []

      connectionData = connectionOfArrowOnMousedownHandler(
        object,
        connectionData,
        helperData
      );
      scalingConnectionData = getScalingArrowMoveTogetherData(object,connectionData,scalingConnectionData,helperData)
      helperData.scope.canvas.bringToFront(object);

      let lockIndictionIcon = helperData.scope.canvas
        .getObjects()
        .find(
          (obj) =>
            object.UID === obj.UID && obj?.objType === 'lock-Indication'
        );
      helperData.scope.canvas.bringToFront(lockIndictionIcon);
      emitObjectMouseDown(object,helperData);
      toolbarPosHandler(freeDrawingMainDiv, object, helperData.scope.currentRatio,helperData);
    });
    object.on('moving', (e) => {
      let transformCenterPos = e.transform.target.getCenterPoint();
      moveArrowTogetherWithShapeHandler(
        connectionData,
        transformCenterPos,
        helperData
      );
    });
    object.on('moved', () => {
      toolbarPosHandler(freeDrawingMainDiv, object, helperData.scope.currentRatio,helperData);
    });
    object.on('rotated', () => {
      emitObjectImageRotated(object,helperData);
    });
    object.on('scaling', (e) => {
       let transformObj = e.transform.target;
       moveArrowTogetherWithShapeWhileScaling(transformObj,scalingConnectionData,helperData)
      // emitObjectImageRotated(object);
    });
    object.on('scaled', (e) => {
       let transformObj = e.transform.target;
       moveArrowTogetherWithShapeWhileScaling(transformObj,scalingConnectionData,helperData)
      emitObjectImageRotated(object,helperData);
    });
    helperData.scope.canvas.add(object);
  });
}