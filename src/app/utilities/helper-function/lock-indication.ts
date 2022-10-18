export const reCreateLockIconIndication = (data,helperData) => {
    const {fabric}  = helperData
    let imgObj: any = new Image();
    imgObj.src = data.src;

    imgObj.onload = () => {
      let image = new fabric.Image(imgObj);
      image.set({
        UID: data.UID,
        left: data.left,
        top: data.top,
        originX: data.originX,
        originY: data.originY,
        objType: data.objType,
        lockScalingFlip: data.lockScalingFlip,
        lockMovementX: data.lockMovementX,
        lockMovementY: data.lockMovementY,
        lockRotation: data.lockRotation,
        lockScalingX: data.lockScalingX,
        lockScalingY: data.lockScalingY,
        hasControls: data.hasControls,
        hasBorders: data.hasBorders,
      });
      helperData.scope.canvas.add(image);
  }
  }