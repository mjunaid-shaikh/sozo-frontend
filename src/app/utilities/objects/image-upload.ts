import { getCurrentMiddlePosOfCanvas } from '../helper-function/general-helper';
import {
  imagesEventManager,
  imageToolbarGenerator,
} from '../helper-function/image-toolbar';
import { emitObjectImageAdded } from '../socket-events/socket-emit';

export const uploadImageHandler = (event, helperData) => {
  const { $, fabric } = helperData;
  let point = getCurrentMiddlePosOfCanvas(helperData)
  if (event.target.files.length > 0) {
    let UID = new Date().getTime();
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      let imgObj: any = new Image();
      imgObj.src = event.target.result;
      imgObj.onload = () => {
        let image = new fabric.Image(imgObj);
        image.set({
          UID: UID,
          left: point.x,
          top: point.y,
          objType: 'uploaded-img',
          selectMe: true,
          originY: 'center',
          originX: 'center',
          noScaleCache: false,
          strokeUniform: true,
          matchedLine: true,
          lockScalingFlip: true,
        });
        helperData.scope.canvas.add(image);
        let toolbar = imageToolbarGenerator(image, null, helperData);
        imagesEventManager(image, toolbar, helperData);
        emitObjectImageAdded(image, helperData);
        helperData.scope.canvas.requestRenderAll();
        helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
        $('#file').val(null);
        //   updateCanvasState();
      };
    };
    reader.readAsDataURL(file);
  }

  $('.dropdown-submenu div.dropdown-menu').css('display', 'none');
};

export const reCreateUploadImg = (data,helperData) => {
  const {fabric} = helperData
  let imgObj: any = new Image();
  imgObj.src = data.src;
  imgObj.onload = () => {
    let image = new fabric.Image(imgObj);
    image.set({
      UID: data.UID,
      left: data.left,
      top: data.top,
      objType: data.objType,
      selectMe: data.selectMe,
      originY: data.originY,
      originX: data.originX,
      noScaleCache: false,
      strokeUniform: true,
      matchedLine: data.matchedLine,
      angle: data.angle,
      scaleX: data.scaleX,
      scaleY: data.scaleY,
      lockScalingFlip: true,
      lockMovementX: data.lockMovementX,
      objreferenceLink: data.objreferenceLink,
      lockMovementY: data.lockMovementY,
      lockRotation: data.lockRotation,
      lockScalingX: data.lockScalingX,
      lockScalingY: data.lockScalingY,
      cornerStrokeColor: data.cornerStrokeColor,
      borderColor: data.borderColor,
    });
    helperData.scope.canvas.add(image);
    let toolbar = imageToolbarGenerator(image, true,helperData);
    imagesEventManager(image, toolbar,helperData);
    helperData.scope.canvas.requestRenderAll();
  };
}
