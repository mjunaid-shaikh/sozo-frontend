import { emitObjectImageModifying, emitObjectImageMoving, emitObjectImageRotated, emitObjectMouseDown } from "../socket-events/socket-emit";
import { connectionOfArrowOnMousedownHandler, getScalingArrowMoveTogetherData, moveArrowTogetherWithShapeHandler, moveArrowTogetherWithShapeWhileScaling } from "./arrow-helper";
import { designToolbarHideHandler, toolbarPosHandler } from "./general-helper";

export const imageToolbarGenerator = (image, fromServer = false,helperData) => {
    const {$,fabric} = helperData
    let linkShow = () => {
      let activeObjectLink = image;
      let linkShowDiv = $(`<div class="link-icon"></div>`).css({
        'margin-top': '4rem ',
        'background-color': '#fff',
        width: 'max-content',
        padding: '0.5rem',
        cursor: 'pointer',
        display: 'flex',
        'box-shadow': '0.18rem 0.18rem 0.18rem rgb(144 144 144 / 50%)',
      });

      let linkIcon = $('<img src="assets/img/invitie-link.svg"></img>').css({
        width: '1.4rem',
      });
      linkShowDiv.append(linkIcon);
      let viewLink = $(`<div class="view-link"></div>`).css({
        display: 'none',
      });
      helperData.scopelinkAddTextbox = linkInput.val();

      let valueCheck = helperData.scopelinkAddTextbox.split('//')[0];

      if (valueCheck === 'http:') {
        helperData.scopelinkAddTextbox = helperData.scopelinkAddTextbox;
      } else {
        helperData.scopelinkAddTextbox = 'http://' + helperData.scopelinkAddTextbox;
      }
      let linkOpenDiv = $(
        `<a href="${helperData.scopelinkAddTextbox}" id="linkRef" target="_blank">${helperData.scopelinkAddTextbox}</a>`
      ).css({
        overflow: 'hidden',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap',
        display: 'inline-block',
        width: '6rem',
        'margin-left': '0.8rem',
      });
      let copyLink = $('<img src="assets/img/copy-link-icon.svg"></img>').css({
        width: '1.4rem',
        margin: '0rem 0.5rem',
        cursor: 'pointer',
      });
      let editLink = $('<img src="assets/img/edit-link-icon.svg"></img>').css({
        width: '1.4rem',
        margin: '0rem 0.5rem',
        cursor: 'pointer',
      });
      let deleteLink = $(
        '<img src="assets/img/delete-link-icon.svg"></img>'
      ).css({
        width: '1.4rem',
        margin: '0rem 0.5rem',
        cursor: 'pointer',
      });
      viewLink.append(linkOpenDiv);
      viewLink.append(copyLink);
      viewLink.append(editLink);
      viewLink.append(deleteLink);
      linkIcon.click(() => {
        viewLink.toggle();
      });
      linkOpenDiv.text(helperData.scope.linkAddTextbox);
      copyLink.click(() => {
        $('#linkCopyToast').toast('show');
        let linkCopy = linkOpenDiv.html();
        document.addEventListener(
          'copy',
          function (e) {
            e.clipboardData.setData('text/plain', linkCopy);
            e.preventDefault();
          },
          true
        );
        document.execCommand('copy');
      });
      editLink.click(() => {
        if (activeObjectLink.lockMovementX) {
          return;
        } else {
          // viewLink.toggle();
          linkMainDiv.css('display', 'block');
          linkShowDiv.remove();
          viewLink.remove();
          linkApply.click(() => {
            linkOpenDiv.text(helperData.scope.linkAddTextbox);
            linkOpenDiv.attr('href', helperData.scope.linkAddTextbox);
            linkMainDiv.css('display', 'none');
          });
        }
      });
      deleteLink.click(() => {
        linkShowDiv.remove();
        viewLink.remove();
      });
      linkShowDiv.append(viewLink);
      mainToolbarDiv.append(linkShowDiv);

      // activeObject.get('top');
      // $('.link-collapse').collapse('show');
      helperData.scope.canvas.renderAll();
    };
    // Drawing Div Element
    let mainDrawingDiv = $('.canvas-container');
    let mainToolbarDiv = $(
      `<div class="flex-column image-main-toolbar" id=${image.UID}></div>`
    ).css('width', '9rem');
    let imageToolbar = $(`<div class='image-toolbar'></div>`);

    // Shape Toolbar Attachment Link Element
    let shapeToolbarAttachLink = $(
      `<div role="button" data-toggle="collapse" data-target="#linkCollapse" class="shape-attach-link"></div>`
    ).css({
      width: '3rem',
      'border-right': '0.16rem solid #F5F5F5',
    });
    let shapeToolbarAttachLinkDiv = $(
      `<div class="d-flex h-100 center"></div>`
    ).css({ position: 'relative' });
    let linkMainDiv = $(
      '<div class="collapse link-collapse" id="linkCollapse"></div>'
    ).css({
      position: 'absolute',
      top: '3.5rem',
      width: '19rem',
    });
    let linkLabelDiv = $(' <div class="card card-body"></div>');
    linkLabelDiv.click((e) => {
      e.stopPropagation();
    });
    let linkLabel = $('<label>Link</label>');
    let linkAdd = $('<div></div');
    let linkInput = $('<input type="text" id="addLink">');
    linkInput.focusin(() => {
        helperData.scope.onfocusInput = true;
    });
    linkInput.focusout(() => {
        helperData.scope.onfocusInput = false;
    });
    let linkApply = $(
      '<button class="btn btn-success ml-2" id="applyLink">Apply</button>'
    ).css({
      padding: '0rem 1rem 0.2rem 1rem',
      'margin-bottom': '0.2rem',
      ' font-size': '0.95rem',
    });
    linkApply.click(() => {
      image.set('objreferenceLink', linkInput.val());
      linkMainDiv.toggle();
      linkShow();
      helperData.scope.canvas.requestRenderAll();
      emitObjectImageModifying(image,helperData);
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    });

    linkAdd.append(linkInput, linkApply);
    linkLabelDiv.append(linkLabel, linkAdd);
    linkMainDiv.append(linkLabelDiv);
    shapeToolbarAttachLinkDiv.append(linkMainDiv);
    let shapeToolbarAttachLinkImg = $(
      '<img src="assets/img/invitie-link.svg"></img>'
    ).css({ width: '1.4rem' });
    shapeToolbarAttachLinkDiv.append(shapeToolbarAttachLinkImg);
    shapeToolbarAttachLink.append(shapeToolbarAttachLinkDiv);

    // Shape Toolbar Comment Element
    let shapeToolbarCommentIcon = $(
      `<div role="button" class="shapetoolbar-comment"></div>`
    ).css({
      width: '3rem',
      'border-right': '0.16rem solid #F5F5F5',
      position: 'relative',
    });

    let availableComment = helperData.scope.whiteboardCommentsAllData.filter((obj) => {
      return obj.objectID === image.UID;
    });
    if (availableComment.length > 0) {
      let commentAvailableIndicator = $('<div></div>').css({
        position: 'absolute',
        top: '0.2rem',
        right: '0.2rem',
        width: '0.45rem',
        height: '0.45rem',
        'border-radius': '50%',
        'background-color': 'red',
      });
      shapeToolbarCommentIcon.append(commentAvailableIndicator);
    }

    let shapeToolbarCommentIconDiv = $(
      `<div class="d-flex h-100 center"></div>`
    );
    shapeToolbarCommentIconDiv.click(() => {
      if ($('.comment_drop').css('display') === 'none') {
        helperData.scope.shouldAddComment = true;
        helperData.scope.currentCommentObjectId = image.UID;
        helperData.scope.commentsToBeShown = helperData.scope.whiteboardCommentsAllData.filter(
          (obj) => {
            return obj.objectID === helperData.scope.currentCommentObjectId;
          }
        );
        $('.comment_drop').css('display', 'block');
        $('.comment-input').focus();
      } else {
        $('.comment_drop').css('display', 'none');
      }
    });
    let shapeToolbarCommentIconImg = $(
      '<img src="assets/img/toolbar-comment.svg"></img>'
    ).css({ width: '1.4rem' });
    shapeToolbarCommentIconDiv.append(shapeToolbarCommentIconImg);
    shapeToolbarCommentIcon.append(shapeToolbarCommentIconDiv);

    // Shape Toolbar Lock Element
    let shapeToolbarLockIcon = $(`<div role="button"></div>`).css({
      width: '3rem',
    });
    let shapeToolbarLockIconDiv = $(
      `<div class="d-flex h-100 center shape-background-color"></div>`
    );
    let imageLockIconIndication: any = new Image();
    imageLockIconIndication.src = 'assets/img/lock-pin-icon.svg';
    let imagePinIconIndication;

    shapeToolbarLockIconDiv.click(() => {
      $('.link-collapse').collapse('hide');
      if (image) {
        if (image.get('lockMovementX', 'lockMovementY') == false) {
          image.set('lockMovementX', true);
          image.set('lockMovementY', true);
          image.set('cornerStrokeColor', 'red');
          image.set('borderColor', 'red');
          image.set('cornerColor', '#87CEFA');
          image.set('lockScalingX', true);
          image.set('lockScalingY', true);
          image.set('lockRotation', true);
          image.set('selectMe', false);

          let centerPosX = (image.aCoords.tl.x + image.aCoords.tr.x) / 2;
          let centerPosY = (image.aCoords.tl.y + image.aCoords.tr.y) / 2;

          imagePinIconIndication = new fabric.Image(imageLockIconIndication);
          imagePinIconIndication.set({
            UID: image.UID,
            left: centerPosX,
            top: centerPosY,
            objType: 'lock-Indication',
            originX: 'center',
            originY: 'center',
            lockScalingFlip: true,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            hasControls: false,
            hasBorders: false,
          });
          helperData.scope.canvas.add(imagePinIconIndication);
          shapeToolbarAttachLink.css({ display: 'none' });
          mainToolbarDiv.css({ display: 'none' });
          mainToolbarDiv.css({ width: '6rem' });
          shapeToolbarLockIconDiv.css({ 'background-color': '#FA8072' });
        } else {
          image.set('lockMovementX', false);
          image.set('lockMovementY', false);
          image.set('cornerStrokeColor', '#137EF9');
          image.set('borderColor', '#137EF9');
          image.set('cornerColor', '#87CEFA');
          image.set('lockScalingX', false);
          image.set('lockScalingY', false);
          image.set('lockRotation', false);
          image.set('selectMe', true);
          // shape.set('selectable', true);
          let imageLockIcon = helperData.scope.canvas
            .getObjects()
            .find(
              (obj) =>
                image.UID === obj.UID && obj.objType === 'lock-Indication'
            );
          helperData.scope.canvas.remove(imageLockIcon);
          shapeToolbarAttachLink.css({ display: 'block' });
          mainToolbarDiv.css({ display: 'none' });
          mainToolbarDiv.css({ width: '9rem' });
          shapeToolbarLockIconDiv.css({ 'background-color': 'white' });
        }
        // updateCanvasState();
        helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
        helperData.scope.canvas.renderAll();
        emitObjectImageModifying(image,helperData);
      }
    });
    let shapeToolbarLockIconImg = $(
      '<img src="assets/img/lock-icon.svg"></img>'
    ).css({ width: '1.4rem' });
    shapeToolbarLockIconDiv.append(shapeToolbarLockIconImg);
    shapeToolbarLockIcon.append(shapeToolbarLockIconDiv);

    imageToolbar.append(
      shapeToolbarAttachLink,
      shapeToolbarCommentIcon,
      shapeToolbarLockIcon
    );

    mainToolbarDiv.append(imageToolbar);

    // Appending on the Main Div ELement
    mainDrawingDiv.append(mainToolbarDiv);
    if (fromServer) {
      if (image.objreferenceLink) {
        linkInput.val(image.objreferenceLink);
        linkShow();
      }
      if (image?.lockMovementY) {
        shapeToolbarAttachLink.css({ display: 'none' });
        mainToolbarDiv.css({ display: 'none' });
        mainToolbarDiv.css({ width: '6rem' });
        shapeToolbarLockIconDiv.css({ 'background-color': '#FA8072' });
      } else {
        shapeToolbarAttachLink.css({ display: 'block' });
        mainToolbarDiv.css({ display: 'none' });
        mainToolbarDiv.css({ width: '9rem' });
        shapeToolbarLockIconDiv.css({ 'background-color': 'white' });
      }
    }
    return mainToolbarDiv;
  }

 export const imagesEventManager = (image, toolbar,helperData) => {
     const {$} = helperData
    let connectionData = [];
    let scalingConnectionData = [];
    image.on('mousedown', (e) => {
      helperData.scope.canvas.bringToFront(image);

      let lockIndictionIcon = helperData.scope.canvas
        .getObjects()
        .find(
          (obj) => image.UID === obj.UID && obj?.objType === 'lock-Indication'
        );
      helperData.scope.canvas.bringToFront(lockIndictionIcon);
      emitObjectMouseDown(image,helperData);
      connectionData = [];
      scalingConnectionData = [];
      connectionData = connectionOfArrowOnMousedownHandler(
        image,
        connectionData,
        helperData
      );
      scalingConnectionData = getScalingArrowMoveTogetherData(image,connectionData,scalingConnectionData,helperData)
      toolbarPosHandler(toolbar, image, helperData.scope.currentRatio,helperData);
      $('.link-icon').css({
        display: 'flex',
      });
      $('.view-link').css({
        display: 'none',
      });
    });
    image.on('moved', (e) => {
      toolbarPosHandler(toolbar, image, helperData.scope.currentRatio,helperData);
      image.objType === 'uploaded-gif' && emitObjectImageRotated(image,helperData);
    //   updateCanvasState();
    });
    image.on('moving', (e) => {
      let transformCenterPos = e.transform.target.getCenterPoint();
      moveArrowTogetherWithShapeHandler(
        connectionData,
        transformCenterPos,
        helperData
      );
      designToolbarHideHandler(helperData);
      emitObjectImageMoving(image,helperData);
    });
    image.on('rotated', (e) => {
      emitObjectImageRotated(image,helperData);
    //   updateCanvasState();
    });
    image.on('scaling', (e) => {
      let transformObj = e.transform.target;
      moveArrowTogetherWithShapeWhileScaling(transformObj,scalingConnectionData,helperData)
    });
    image.on('scaled', (e) => {
      let transformObj = e.transform.target;
      moveArrowTogetherWithShapeWhileScaling(transformObj,scalingConnectionData,helperData)
      emitObjectImageRotated(image,helperData);
    //   updateCanvasState();
    });
  } 