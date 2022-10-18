import {
onArrowConverted,
  onArrowHeadChange,
  onArrowResize,
  onCanvasUndoRedoStatus,
  onCanvasZoom,
  onCommentedObject,
  onCreatedArrow,
  onModifiedArrow,
  onMouseMove,
  onMovedArrow,
  onObjectAdd,
  onObjectDeleteShapeChange,
  onObjectImageAdded,
  onObjectImageModifying,
  onObjectImageMoving,
  onObjectImageRotated,
  onObjectModify,
  onObjectMouseDown,
  onObjectMoving,
  onObjectRemove,
  onObjectScalling,
  onObjectShapeChange,
  onSelectedAllObjectMouseDown,
  onSelectedAllObjectsLockStatus,
} from './socket-listen-function';


export const createSocketListeners = (helperData) => {
 
  const { $ } = helperData;
  helperData.scope.SSS.socket.on('meeting-started', (data) => {
    $('.alert-video-call').css('display', 'block');
    $('.live-conference').css('background-color', '#57D45B');
    $('.live-conference-mute-section p').html('Join');
    $('.live-conference-main').css('display', 'flex');
    helperData.scope.isEndLive = false;
    helperData.scope.isStartLive = false;
    helperData.scope.isJoinLive = true;
  });

  helperData.scope.SSS.socket.on('arrow:created', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onCreatedArrow(value, helperData);
  });

  helperData.scope.SSS.socket.on('arrow:moved', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onMovedArrow(value, helperData);
  });

  helperData.scope.SSS.socket.on('arrow:modified', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onModifiedArrow(value, helperData);
  });

  helperData.scope.SSS.socket.on('arrow:head:change', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onArrowHeadChange(value, helperData);
  });

  helperData.scope.SSS.socket.on('arrow:control:resize', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onArrowResize(value, helperData);
  });

  helperData.scope.SSS.socket.on('arrow:converted', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onArrowConverted(value,helperData);
  });

  helperData.scope.SSS.socket.on('selected-object-mousedown', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onSelectedAllObjectMouseDown(value,helperData);
  });

  helperData.scope.SSS.socket.on('lock:selected:objects', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onSelectedAllObjectsLockStatus(value,helperData);
  });

  helperData.scope.SSS.socket.on('commented-object', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onCommentedObject(value,helperData);
  });

  helperData.scope.SSS.socket.on('image:add', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onObjectImageAdded(value,helperData);
  });

  helperData.scope.SSS.socket.on('image:rotated', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onObjectImageRotated(value,helperData);
  });

  helperData.scope.SSS.socket.on('image:moved', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onObjectImageMoving(value,helperData);
  });

  helperData.scope.SSS.socket.on('image:modifying', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onObjectImageModifying(value,helperData);
  });

  helperData.scope.SSS.socket.on('object:mousedown', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onObjectMouseDown(value,helperData);
  });

  helperData.scope.SSS.socket.on('saving-whiteboard', (value) => {});

  helperData.scope.SSS.socket.on('object:added', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onObjectAdd(value,helperData);
  });

  helperData.scope.SSS.socket.on('object:moving', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onObjectMoving(value,helperData);
  });

  helperData.scope.SSS.socket.on('canvas:zoom', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onCanvasZoom(value,helperData);
  });

  helperData.scope.SSS.socket.on('object:removed', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onObjectRemove(value,helperData);
  });

  helperData.scope.SSS.socket.on('mouse:move', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onMouseMove(value,helperData);
  });

  helperData.scope.SSS.socket.on('shape:change', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onObjectShapeChange(value,helperData);
  });

  helperData.scope.SSS.socket.on('object:modifying', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onObjectModify(value,helperData);
  });

  helperData.scope.SSS.socket.on('delete:shape:change', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onObjectDeleteShapeChange(value,helperData);
  });

  helperData.scope.SSS.socket.on('object:scalling', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onObjectScalling(value,helperData);
  });

  helperData.scope.SSS.socket.on('object:undo:redo', (value) => {
    helperData.scope.shouldSaveCanvasObjects = false;
    onCanvasUndoRedoStatus(value,helperData);
  });

  helperData.scope.SSS.socket.on('disconnected', (value) => {
    let index = helperData.scope.friendsCursorPointer.findIndex(
      (ob) => ob === value.session_id
    );
    if (index > -1) {
      helperData.scope.friendsCursorPointer.splice(index, 1);
      let cursor = helperData.scope.canvas
        .getObjects()
        .find((o) => o?.UID === value.session_id);
      if (cursor) {
        helperData.scope.canvas.remove(cursor);
      }
      helperData.scope.canvas.requestRenderAll();
    }
  });
};
