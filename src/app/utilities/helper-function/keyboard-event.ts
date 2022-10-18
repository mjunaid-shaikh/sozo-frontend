import { addCommentHandler, arrowKeyObjectMovementHandler, copyCommandHandler, cutCommandHandler, deleteCanvasObject, designToolbarHideHandler, pasteCommandHandler, redo, textBoldHandler, textItalicHandler, textUnderLineHandler, undo, userIdealConditionRedirectHandler } from "./general-helper";

export const sozoKeyboardEventsHandler = (event,helperData) =>{
    const {fabric,$} = helperData
    userIdealConditionRedirectHandler(helperData)
    if(event.code === 'Tab'){
      helperData.scope.shouldAddBoardInOverlappingOrder = !helperData.scope.shouldAddBoardInOverlappingOrder
    }
    if (event.code === 'Digit1' && event.shiftKey) {
      // helperData.scope.whichArrowTypeShouldDraw = 'straight';
    }
    if (event.code === 'Digit2' && event.shiftKey && event.ctrlKey) {
      // helperData.scope.whichArrowTypeShouldDraw = 'curve2';
    } else if (event.code === 'Digit2' && event.shiftKey) {
      // helperData.scope.whichArrowTypeShouldDraw = 'curve1';
    }
    if (event.code === 'Digit3' && event.shiftKey) {
      // helperData.scope.whichArrowTypeShouldDraw = 'perpend';
    }

    if (helperData.scope.canvas.getActiveObject()) {
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(
          event.code
        ) > -1
      ) {
        event.preventDefault();
      }
    }
    if (event.code === 'Enter') {
      addCommentHandler(helperData);
    }
    if (helperData.scope.onfocusInput) {
      return;
    }
    if (event.code === 'KeyZ' && event.ctrlKey) {
      event.preventDefault();
      undo(helperData);
    }
    if (event.code === 'KeyY' && event.ctrlKey) {
      event.preventDefault();
      redo(helperData);
    }

    if (event.code === 'KeyA' && event.ctrlKey) {
      if (helperData.scope.userAccess === 'readonly') {
        return;
      }
      helperData.scope.canvas.discardActiveObject();
      let canvasData = helperData.scope.canvas.getObjects().filter((obj) => obj.selectMe);
      let allObjects = new fabric.ActiveSelection(canvasData, {
        canvas: helperData.scope.canvas,
      });
      helperData.scope.allObjectSelected = allObjects;
      helperData.scope.canvas.setActiveObject(allObjects);
      helperData.scope.canvas.renderAll();
    }
    if (event.code === 'KeyP' && event.ctrlKey) {
      print();
    }
    if (event.code === 'KeyB' && event.ctrlKey) {
      textBoldHandler(helperData);
    }
    if (event.code === 'KeyI' && event.ctrlKey) {
      textItalicHandler(helperData);
    }
    if (event.code === 'KeyU' && event.ctrlKey) {
      event.preventDefault();
      textUnderLineHandler(helperData);
    }
    if (event.code === 'Escape') {
      helperData.scope.canvas.discardActiveObject();
      helperData.scope.canvas.requestRenderAll();
      designToolbarHideHandler(helperData);
    }
    if (event.code === 'ArrowUp') {
      // $('.canvas-container').css({ position: 'fixed' })
      arrowKeyObjectMovementHandler('up',helperData);
    }
    if (event.code === 'ArrowDown') {
      // $('.canvas-container').css({ position: 'fixed' })
      arrowKeyObjectMovementHandler('down',helperData);
    }
    if (event.code === 'ArrowLeft') {
      // $('.canvas-container').css({ position: 'fixed' }
      arrowKeyObjectMovementHandler('left',helperData);
    }
    if (event.code === 'ArrowRight') {
      // $('.canvas-container').css({ position: 'fixed' })
      arrowKeyObjectMovementHandler('right',helperData);
    }

    if (event.code === 'KeyC' && event.ctrlKey) {
      copyCommandHandler(helperData);
    }
    if (event.code === 'Delete') {
      $('.objects-toolbar').css('display', 'none');
      deleteCanvasObject(null,helperData);
    }
    if (event.code === 'KeyV' && event.ctrlKey) {
      pasteCommandHandler(helperData);
    }

    if (event.code === 'KeyX' && event.ctrlKey) {
      cutCommandHandler(helperData);
    }
    /* Mac code */
    if (event.code === 'KeyZ' && event.metaKey) {
      undo(helperData);
    }
    if (event.code === 'KeyY' && event.metaKey) {
      redo(helperData);
    }

    if (event.code === 'KeyA' && event.metaKey) {
      helperData.scope.canvas.discardActiveObject();
      let canvasData = helperData.scope.canvas.getObjects().filter((obj) => {
        return obj.lockMovementX === false;
      });
      let newArray = helperData.scope.canvas.getObjects().filter((obj) => {
        return obj.objType === 'arrowline';
      });

      let allObjects = new fabric.ActiveSelection(helperData.scope.canvasData.concat(newArray), {
        canvas: helperData.scope.canvas,
      });
      helperData.scope.allObjectSelected = allObjects;
      helperData.scope.canvas.setActiveObject(allObjects);
      helperData.scope.canvas.renderAll();
    }
    if (event.code === 'KeyP' && event.metaKey) {
      print();
    }
    if (event.code === 'KeyB' && event.metaKey) {
      textBoldHandler(helperData);
    }
    if (event.code === 'KeyI' && event.metaKey) {
      textItalicHandler(helperData);
    }
    if (event.code === 'keyU' && event.metaKey) {
      event.preventDefault();
      textUnderLineHandler(helperData);
    }
    if (event.code === 'Backspace') {
      $('.objects-toolbar').css('display', 'none');
      deleteCanvasObject(null,helperData);
    }
    if (event.code === 'KeyC' && event.metaKey) {
      copyCommandHandler(helperData);
    }
    if (event.code === 'KeyV' && event.metaKey) {
      pasteCommandHandler(helperData);
    }
    if (event.code === 'KeyX' && event.metaKey) {
      cutCommandHandler(helperData);
    }
    /*mac code end */
}