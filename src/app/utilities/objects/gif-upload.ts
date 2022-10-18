import { getCurrentMiddlePosOfCanvas } from '../helper-function/general-helper';
import {
  imagesEventManager,
  imageToolbarGenerator,
} from '../helper-function/image-toolbar';
import { emitObjectImageAdded } from '../socket-events/socket-emit';
const [PLAY, PAUSE, STOP] = [0, 1, 2];

export const fabricGif = async (
  gif,
  maxWidth,
  maxHeight,
  maxDuration,
  helperData
) => {
  const { fabric, $ } = helperData;
  const { error, dataUrl, delay, frameWidth, framesLength } =
    await helperData.scope.gifToSprite(gif, maxWidth, maxHeight, maxDuration);

  if (error) return { error };
  return new Promise((resolve) => {
    fabric.Image.fromURL(dataUrl, (img) => {
      const sprite = img.getElement();
      let UID = new Date().getTime();
      let framesIndex = 0;
      let start = performance.now();
      let status;
      let point = getCurrentMiddlePosOfCanvas(helperData)

      img.width = frameWidth;
      img.height = sprite.naturalHeight;
      img.mode = 'image';
      img.top = point.y;
      img.left = point.x;
      img.selectMe = true;
      img.UID = UID;
      img.objType = 'uploaded-gif';
      img.originY = 'center';
      img.originX = 'center';
      img.noScaleCache = false;
      img.strokeUniform = true;
      img.matchedLine = true;
      img.lockScalingFlip = true;
      img.framesLength = framesLength;
      img.delay = delay;
      img.frameWidth = frameWidth;

      img._render = function (ctx) {
        if (status === PAUSE || (status === STOP && framesIndex === 0)) return;
        const now = performance.now();
        const delta = now - start;
        if (delta > delay) {
          start = now;
          framesIndex++;
        }
        if (framesIndex === framesLength || status === STOP) framesIndex = 0;
        ctx.drawImage(
          sprite,
          frameWidth * framesIndex,
          0,
          frameWidth,
          sprite.height,
          -this.width / 2,
          -this.height / 2,
          frameWidth,
          sprite.height
        );
      };
      img.play = function () {
        status = PLAY;
        this.dirty = true;
      };

      img.play();
      resolve(img);
    });
  });
};

export const gifInit = async (fileUrl, helperData) => {
  const { $, fabric } = helperData;
  const gif1 = await fabricGif(fileUrl, 200, 200, null, helperData);
  helperData.scope.canvas.add(gif1);
  let toolbar = imageToolbarGenerator(gif1, null, helperData);
  imagesEventManager(gif1, toolbar, helperData);
  emitObjectImageAdded(gif1, helperData);
  helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
  $('#gifFile').val(null);
  // updateCanvasState();
  const render = () => {
    fabric.util.requestAnimFrame(render);
    helperData.scope.canvas.renderAll();
  };
  fabric.util.requestAnimFrame(render);
};

export const gifUpload = (fileUrl, helperData) => {
  gifInit(fileUrl, helperData);
};

export const uploadGifHandler = (event, helperData) => {
  const { $ } = helperData;
  if (event.target.files.length > 0) {
    const file = event.target.files[0];
    gifUpload(file, helperData);
  }
  $('.dropdown-submenu div.dropdown-menu').css('display', 'none');
};


export const reCreateGif = (gif,helperData) => {
  const {fabric} = helperData
  fabric.Image.fromURL(gif.src, (img) => {
    const sprite = img.getElement();
    let framesIndex = 0;
    let start = performance.now();
    let status;
    img.width = gif.width;
    img.height = sprite.naturalHeight;
    img.mode = 'image';
    img.top = gif.top;
    img.left = gif.left;
    img.selectMe = gif.selectMe;
    img.UID = gif.UID;
    img.objType = gif.objType;
    img.originY = gif.originY;
    img.originX = gif.originX;
    img.noScaleCache = gif.noScaleCache;
    img.strokeUniform = gif.strokeUniform;
    img.matchedLine = gif.strokeUniform;
    img.lockScalingFlip = gif.lockScalingFlip;
    img.framesLength = gif.framesLength;
    img.delay = gif.delay;
    img.frameWidth = gif.frameWidth;
    img.angle = gif.angle;
    img.scaleX = gif.scaleX;
    img.scaleY = gif.scaleY;
    img.lockMovementX = gif.lockMovementX;
    img.objreferenceLink = gif.objreferenceLink;
    img.lockMovementY = gif.lockMovementY;
    img.lockRotation = gif.lockRotation;
    img.lockScalingX = gif.lockScalingX;
    img.lockScalingY = gif.lockScalingY;
    img.cornerStrokeColor = gif.cornerStrokeColor;
    img.borderColor = gif.borderColor;

    img._render = function (ctx) {
      if (status === PAUSE || (status === STOP && framesIndex === 0)) return;
      const now = performance.now();
      const delta = now - start;
      if (delta > gif.delay) {
        start = now;
        framesIndex++;
      }
      if (framesIndex === gif.framesLength || status === STOP)
        framesIndex = 0;
      ctx.drawImage(
        sprite,
        gif.frameWidth * framesIndex,
        0,
        gif.frameWidth,
        sprite.height,
        -this.width / 2,
        -this.height / 2,
        gif.frameWidth,
        sprite.height
      );
    };
    img.play = function () {
      status = PLAY;
     this.dirty = true;
    };

    img.play();
    helperData.scope.canvas.add(img);
    let toolbar = imageToolbarGenerator(img, true,helperData);
    imagesEventManager(img, toolbar,helperData);
    helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    const render = () => {
      fabric.util.requestAnimFrame(render);
      helperData.scope.canvas.renderAll();
    };
    fabric.util.requestAnimFrame(render);
  });
}
