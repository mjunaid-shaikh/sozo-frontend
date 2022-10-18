import { emitObjectDeleteShapeChange } from '../socket-events/socket-emit';
import {
  designToolbarHideHandler,
  objectOnCanvasExistOrNot,
  isObjectIsShape,
  toolbarPosHandler,
  removeControlPoints,
  isObjectIsArrow,
  createObjectOnMouseDown,
  createObjectOnDblClick,
  getObjectsContainedInContainer,
} from '../helper-function/general-helper';
import {
  connectionOfArrowOnMousedownHandler,
  moveArrowTogetherWithShapeHandler,
  getScalingArrowMoveTogetherData,
  moveArrowTogetherWithShapeWhileScaling,
  updateAllStraightArrowPoints,
  moveEveryArrowUpInTheStack,
} from '../helper-function/arrow-helper';
import { reCreateTriangle } from '../objects/triangle';
import { reCreateCircle } from '../objects/circle';
import { reCreateSquare } from '../objects/square';
import { reCreateRectangle } from '../objects/rectangle';
import { reCreateHexagon } from '../objects/hexagon';
import { reCreateDiamond } from '../objects/diamond';
import { reCreateStar } from '../objects/star';
import { reCreateStickyNotes } from '../objects/sticky-notes';
import {
  emitObjectShapeChange,
  emitObjectModifying,
  emitObjectMoving,
  emitObjectMouseDown,
} from '../socket-events/socket-emit';
import { setAllSelectedObjectActionable, setAllSelectedObjectNonActionable } from './selected-all-toolbar';

let transprentText:any;

export const shapeToolbarGeneratorHandler = (
  rt,
  shape,
  text,
  obj = null,
  fromServer = null,
  helperData
) => {
  transprentText=text;

  const { fabric, $ } = helperData;
  let linkShow = () => {
    let activeObjectLink = shape;
    let linkShowDiv = $(`<div class="link-icon"></div>`).css({
      'margin-top': '4rem ',
      'background-color': '#fff',
      width: 'fit-content',
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
    helperData.scope.linkAddTextbox = linkInput.val();

    let valueCheck = helperData.scope.linkAddTextbox.split('//')[0];

    if (valueCheck === 'http:') {
      helperData.scope.linkAddTextbox = helperData.scope.linkAddTextbox;
    } else {
      helperData.scope.linkAddTextbox =
        'http://' + helperData.scope.linkAddTextbox;
    }
    let linkOpenDiv = $(
      `<a href="${helperData.scope.linkAddTextbox}" id="linkRef" target="_blank">${helperData.scope.linkAddTextbox}</a>`
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
    let deleteLink = $('<img src="assets/img/delete-link-icon.svg"></img>').css(
      {
        width: '1.4rem',
        margin: '0rem 0.5rem',
        cursor: 'pointer',
      }
    );
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
  let shapeLogoDynamicHandler = (shapeLogo, imgName) => {
    shapeLogo.click(() => {
      shapeToolbarLogoDiv.find('img').remove();
      let newImageToPush = $(`<img src="assets/img/${imgName}">`).css({
        width: '2rem',
      });
      shapeToolbarLogoDiv.append(newImageToPush);
      let newShapeToForm = imgName.split('_')[0];
      if (newShapeToForm === 'triangle') {
        $(`div[id=${shape.UID}]`).remove();
        emitObjectDeleteShapeChange([shape, text], helperData);
        helperData.scope.canvas.remove(shape);
        helperData.scope.canvas.remove(text);
        designToolbarHideHandler(helperData);
        shape.objType = 'triangle-shape';
        text.objType = 'triangle-text';
        reCreateTriangle([shape, text], null, helperData);
        emitObjectShapeChange([shape, text, newShapeToForm], helperData);
        helperData.scope.canvas.renderAll();
        //   updatehelperData.scope.canvasState();
      } else if (newShapeToForm === 'circle') {
        $(`div[id=${shape.UID}]`).remove();
        emitObjectDeleteShapeChange([shape, text], helperData);
        helperData.scope.canvas.remove(shape);
        helperData.scope.canvas.remove(text);
        designToolbarHideHandler(helperData);
        shape.objType = 'circle-shape';
        text.objType = 'circle-text';
        reCreateCircle([shape, text], null, helperData);
        emitObjectShapeChange([shape, text, newShapeToForm], helperData);
        helperData.scope.canvas.renderAll();
        //   updatehelperData.scope.canvasState();
      } else if (newShapeToForm === 'square') {
        $(`div[id=${shape.UID}]`).remove();
        emitObjectDeleteShapeChange([shape, text], helperData);
        helperData.scope.canvas.remove(shape);
        helperData.scope.canvas.remove(text);
        designToolbarHideHandler(helperData);
        shape.objType = 'square-shape';
        text.objType = 'square-text';
        reCreateSquare([shape, text], null, helperData);
        emitObjectShapeChange([shape, text, newShapeToForm], helperData);
        helperData.scope.canvas.renderAll();
        //   updatehelperData.scope.canvasState();
      } else if (newShapeToForm === 'rect') {
        $(`div[id=${shape.UID}]`).remove();
        emitObjectDeleteShapeChange([shape, text], helperData);
        helperData.scope.canvas.remove(shape);
        helperData.scope.canvas.remove(text);
        designToolbarHideHandler(helperData);
        shape.objType = 'rect-shape';
        text.objType = 'rect-text';
        reCreateRectangle([shape, text], null, helperData);
        emitObjectShapeChange([shape, text, newShapeToForm], helperData);
        helperData.scope.canvas.renderAll();
        //   updatehelperData.scope.canvasState();
      } else if (newShapeToForm === 'polygon') {
        $(`div[id=${shape.UID}]`).remove();
        emitObjectDeleteShapeChange([shape, text], helperData);
        helperData.scope.canvas.remove(shape);
        helperData.scope.canvas.remove(text);
        designToolbarHideHandler(helperData);
        shape.objType = 'hexa-shape';
        text.objType = 'hexa-text';
        reCreateHexagon([shape, text], null, helperData);
        emitObjectShapeChange([shape, text, newShapeToForm], helperData);
        helperData.scope.canvas.renderAll();
        //   updatehelperData.scope.canvasState();
      } else if (newShapeToForm === 'star') {
        $(`div[id=${shape.UID}]`).remove();
        emitObjectDeleteShapeChange([shape, text], helperData);
        helperData.scope.canvas.remove(shape);
        helperData.scope.canvas.remove(text);
        designToolbarHideHandler(helperData);
        shape.objType = 'star-shape';
        text.objType = 'star-text';
        reCreateStar([shape, text], null, helperData);
        emitObjectShapeChange([shape, text, newShapeToForm], helperData);
        helperData.scope.canvas.renderAll();
        //   updatehelperData.scope.canvasState();
      } else if (newShapeToForm === 'color') {
        $(`div[id=${shape.UID}]`).remove();
        emitObjectDeleteShapeChange([shape, text], helperData);
        helperData.scope.canvas.remove(shape);
        helperData.scope.canvas.remove(text);
        designToolbarHideHandler(helperData);
        reCreateStickyNotes([shape, text], null, helperData);
        emitObjectModifying([shape, text], helperData);
        helperData.scope.canvas.renderAll();
        //   updatehelperData.scope.canvasState();
      } else if (newShapeToForm === 'diamond') {
        $(`div[id=${shape.UID}]`).remove();
        emitObjectDeleteShapeChange([shape, text], helperData);
        helperData.scope.canvas.remove(shape);
        helperData.scope.canvas.remove(text);
        designToolbarHideHandler(helperData);
        reCreateDiamond([shape, text], null, helperData);
        emitObjectModifying([shape, text], helperData);
        helperData.scope.canvas.renderAll();
        //   updatehelperData.scope.canvasState();
      }
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    });
  };


  // Drawing Div Element
  let mainDrawingDiv = $('.canvas-container');
  // Main Toolbar Div Element
  let toolbarWidth = shape?.objType === 'area-shape' ? '39rem' : '45rem';
  let mainToolbarDiv = $(
    `<div class="flex-column main-toolbar" id=${shape.UID}></div>`
  ).css('width', toolbarWidth);
  // Shape Toolbar Div Element

  let shapeToolbar = $(`<div class='shape-toolbar'></div>`);

  // Shape Toolbar Logo Icon Element
  let shapeToolbarLogo = $(
    `<div role="button" class="shape-toolbar-logo"></div>`
  ).css({
    width: '4rem',
    'border-right': '0.16rem solid #F5F5F5',
  });

  // Logo Data Toggle
  let shapeToolbarLogoDiv = $('<div class="center w-100 h-100"></div>');
  let shapeToolbarImage;

  if (shape.objType === 'rect-shape') {
    shapeToolbarImage = $('<img src="assets/img/rect_shape.svg">').css({
      width: '2rem',
    });
  } else if (shape.objType === 'circle-shape') {
    shapeToolbarImage = $('<img src="assets/img/circle_shape.svg">').css({
      width: '2rem',
    });
  } else if (shape.objType === 'triangle-shape') {
    shapeToolbarImage = $('<img src="assets/img/triangle_shape.svg">').css({
      width: '2rem',
    });
  } else if (shape.objType === 'star-shape') {
    shapeToolbarImage = $('<img src="assets/img/star_shape.svg">').css({
      width: '2rem',
    });
  } else if (shape.objType === 'square-shape') {
    shapeToolbarImage = $('<img src="assets/img/square_shape.svg">').css({
      width: '2rem',
    });
  } else if (shape.objType === 'hexa-shape') {
    shapeToolbarImage = $('<img src="assets/img/polygon_shape.svg">').css({
      width: '2rem',
    });
  } else if (shape.objType === 'dia-shape') {
    shapeToolbarImage = $('<img src="assets/img/diamond_shape.svg">').css({
      width: '2rem',
    });
  } else if (shape.objType === 'area-shape') {
    shapeToolbarImage = $('<img src="assets/img/text_icon.svg">').css({
      width: '2rem',
    });
  } else if (shape.objType === 'sticky-shape') {
    shapeToolbarImage = $('<img src="assets/img/color_palette_icon.svg">').css({
      width: '2rem',
      transform: 'rotate(90deg)',
    });
  } else if (shape.objType === 'container-rect') {
    shapeToolbarImage = $('<img src="assets/img/screen1.svg">').css({
      width: '2rem',
    });
  } else if (shape.objType === 'container-onebytwo') {
    shapeToolbarImage = $('<img src="assets/img/screen2.svg">').css({
      width: '2rem',
    });
  } else if (shape.objType === 'container-twobytwo') {
    shapeToolbarImage = $('<img src="assets/img/screen3.svg">').css({
      width: '2rem',
    });
  }

  shapeToolbarLogoDiv.append(shapeToolbarImage);

  // Logo Dropdown
  let shapeToolbarLogoDropdown = $(
    '<div class="dropdown-menu p-0" role="button" ></div>'
  ).addClass('shapetoolbarlogo-dropdown-menu');

  let shapeToolbarLogoDropdownMenuList = $(
    '<div class="d-flex flex-wrap p-2" ></div>'
  ).addClass('shapetoolbar-menulist');

  let rectLogo = $('<div class="center col-3 p-0 logo"></div>').css({
    height: '2.5rem',
  });
  let rectLogoImg = $('<img src="assets/img/rect_shape.svg">').css({
    width: '2rem',
  });
  rectLogo.append(rectLogoImg);

  let squareLogo = $('<div class="center col-3 p-0 logo"></div>').css({
    height: '2.5rem',
  });
  let squareLogoImg = $('<img src="assets/img/square_shape.svg">').css({
    width: '1.8rem',
  });
  squareLogo.append(squareLogoImg);

  let circleLogo = $('<div class="center col-3 p-0 logo"></div>').css({
    height: '2.5rem',
  });
  let circleLogoImg = $('<img src="assets/img/circle_shape.svg">').css({
    width: '2rem',
  });
  circleLogo.append(circleLogoImg);

  let diaLogo = $('<div class="center col-3 p-0 logo"></div>').css({
    height: '2.5rem',
  });
  let diaLogoImg = $('<img src="assets/img/diamond_shape.svg">').css({
    width: '2rem',
  });
  diaLogo.append(diaLogoImg);

  let triaLogo = $('<div class="center col-3 p-0 logo"></div>').css({
    height: '2.5rem',
  });
  let triaLogoImg = $('<img src="assets/img/triangle_shape.svg">').css({
    width: '2rem',
  });
  triaLogo.append(triaLogoImg);

  let starLogo = $('<div class="center col-3 p-0 logo"></div>').css({
    height: '2.5rem',
  });
  let starLogoImg = $('<img src="assets/img/star_shape.svg">').css({
    width: '2rem',
  });
  starLogo.append(starLogoImg);

  let hexaLogo = $('<div class="center col-3 p-0 logo"></div>').css({
    height: '2.5rem',
  });
  let hexaLogoImg = $('<img src="assets/img/polygon_shape.svg">').css({
    width: '2rem',
  });
  hexaLogo.append(hexaLogoImg);

  shapeLogoDynamicHandler(rectLogo, 'rect_shape.svg');
  shapeLogoDynamicHandler(squareLogo, 'square_shape.svg');
  shapeLogoDynamicHandler(circleLogo, 'circle_shape.svg');
  shapeLogoDynamicHandler(diaLogo, 'diamond_shape.svg');
  shapeLogoDynamicHandler(triaLogo, 'triangle_shape.svg');
  shapeLogoDynamicHandler(starLogo, 'star_shape.svg');
  shapeLogoDynamicHandler(hexaLogo, 'polygon_shape.svg');
  // shapeLogoDynamicHandler(textLogo, 'text_icon.svg');
  // shapeLogoDynamicHandler(stickyLogo, 'color_palette_icon.svg');

  shapeToolbarLogoDropdownMenuList.append(
    rectLogo,
    circleLogo,
    diaLogo,
    triaLogo,
    starLogo,
    squareLogo,
    hexaLogo
    // textLogo,
    // stickyLogo
  );
  shapeToolbarLogoDropdown.append(shapeToolbarLogoDropdownMenuList);


  if (
    shape.objType === 'sticky-shape' ||
    shape.objType === 'area-shape' ||
    shape.objType === 'container-rect' ||
    shape.objType === 'container-onebytwo' ||
    shape.objType === 'container-twobytwo'
  ) {
    shapeToolbarLogo.append(shapeToolbarLogoDiv);
  } else {
    shapeToolbarLogoDiv.attr('data-toggle', 'dropdown');
    shapeToolbarLogo.append(shapeToolbarLogoDiv, shapeToolbarLogoDropdown);
  }

  // Shape Toolbar Color Changer Element
  let shapeToolbarColorChanger = $(
    `<div role="button" class="shape-toolbar-color-changer"></div>`
  ).css({
    width: '6rem',
    'border-right': '0.16rem solid #F5F5F5',
  });

  let shapeToolbarColorChangerDiv = $('<div class="d-flex h-100" ></div>');
  //color changer Data Toggle
  let colorChanger = $('<div class="h-100 center col-6 p-0" ></div>');
  let colorChangerDiv = $(
    '<div data-toggle="dropdown" class="color-changer-shape"></div>'
  ).css({
    width: '1.6rem',
    height: '1.6rem',
    'border-radius': '50%',
    'background-color': 'white',
    border: '0.14rem solid black',
  });

  if (shape.objType === 'sticky-shape') {
    colorChangerDiv.css({ 'background-color': shape.fill });
  }

  //color changer dropdown
  let colorChangerDropdown = $(
    '<div class="dropdown-menu p-2" role="button" ></div>'
  ).addClass('colorchanger-dropdown-menu');


  let colorChangerDropdownMenuList = $('<div class="d-flex flex-wrap" ></div>');
  helperData.scope.drawingColorList.forEach((color) => {
    let colorlist = $('<div class="col-3 p-0 center color-list" ></div>').css({
      height: '3rem',
    });

    let colorlistDiv = $('<div data-toggle="tooltip" ></div>').css({
      'border-radius': '50%',
      'background-color': `${color}`,
      'border': '1px solid black',
      width: '1.6rem',
      height: '1.6rem',
    });

    colorlistDiv.attr('title', color == 'rgba(255,255,255, .1)' ? 'Transparent' : color);

    colorlist.click(() => {

      $('.link-collapse').collapse('hide');
      if (shape.fill === color) return;
      if (shape?.objType === 'area-shape') return;
      colorChangerDiv.css({ 'background-color': color });
      shape.set('fill', color);
      shape.set('opacity', 1);
      if (shape?.objType === 'container-rect') {
       // console.log("function called 1");
        
        let line = objectOnCanvasExistOrNot(
          shape.UID,
          'container-line',
          helperData
        );
        emitObjectModifying([shape, text, line], helperData);
      } else {
       // console.log("function called 2");
        emitObjectModifying([shape, text], helperData);
      }
      // updateMiniMap();
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.canvas.requestRenderAll();
      
      // updatehelperData.scope.canvasState();

    });
    colorlist.append(colorlistDiv);

    colorChangerDropdownMenuList.append(colorlist);


  });



  let colorPickerDiv = $('<div id="colorPickerDiv"></div>').css({
    'border-radius': '50%',
    'background-color': '#000',
    width: '1.6rem',
    height: '1.6rem',
    margin: '0.7rem',
  });

  let colorSpect = $('<input type="text" name="colorDropDown" />');
  colorChangerDropdownMenuList.append(colorPickerDiv, colorSpect);

  colorChangerDropdown.append(colorChangerDropdownMenuList);
  colorChanger.append(colorChangerDiv, colorChangerDropdown);
  // Border Color Changer Data Toggle
  let borderColorChanger = $('<div class="h-100 center col-6 p-0"></div>');
  let borderColorChangerDiv = $(
    '<div data-toggle="dropdown" class="border-color-shape"></div>'
  ).css({
    width: '1.6rem',
    height: '1.6rem',
    'border-radius': '50%',
    border: `0.4rem solid ${shape.stroke}`,
  });

  // Border Color Changer Dropdown

  let borderColorChangerDropdown = $(
    '<div class="dropdown-menu p-0 border-colorchanger" role="button" ></div>'
  ).addClass('bordercolorchanger-dropdown-menu');

  let borderColorChangerDropdownMenuList = $(
    '<div class="d-flex flex-column" ></div>'
  );

  let borderChangerFirstSection = $('<div class="d-flex pt-2" ></div>').css({
    height: '5rem',
    'border-bottom': '0.16rem solid #F5F5F5',

  });

  let borderChangerMinusSection = $(
    '<div class="col-4 p-0 d-flex flex-column" ></div>'
  );
  let borderChangerIndicatorSection = $(
    '<div class="col-4 p-0 d-flex flex-column" ></div>'
  );
  let borderChangerPlusSection = $(
    '<div class="col-4 p-0 d-flex flex-column" ></div>'
  );

  let minusLogo = $('<div class="center h-50"></div>');
  let minusLogoImg = $('<img src="assets/img/minusSignBorder.svg"></img>').css({
    width: '1.5rem',
  });
  minusLogo.append(minusLogoImg);
  minusLogo.click(() => {
    $('.link-collapse').collapse('hide');
    if (shape?.objType === 'area-shape') return;
    if (shape?.strokeWidth === 1) return;

    let newStrokeWidth =
      pixelIndicatorLogoDiv.html() === '1 px'
        ? 1
        : parseInt(pixelIndicatorLogoDiv.html().split(' ')[0]) - 1;
    pixelIndicatorLogoDiv.html(`${newStrokeWidth}` + ' px');
    let activeObject = helperData.scope.canvas.getActiveObject();

    let updatedStrokeWidth = newStrokeWidth;
    let realStroke = newStrokeWidth.toString();
    if (activeObject.objType === 'textarea') {
      activeObject.set({
        strokeWidth: updatedStrokeWidth,
        realStroke: realStroke,
      });
    } else {
      let line = objectOnCanvasExistOrNot(
        shape.UID,
        'container-line',
        helperData
      );
      if (line) {
        line.set({
          strokeWidth: updatedStrokeWidth,
          realStroke: realStroke,
        });
      }
      shape.set({
        strokeWidth: updatedStrokeWidth,
        realStroke: realStroke,
      });
    }
    // updatehelperData.scope.canvasState();
    //   updateMiniMap();
    helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    helperData.scope.canvas.requestRenderAll();
    //   updatehelperData.scope.canvasState();
    if (shape?.objType === 'container-rect') {
      let line = objectOnCanvasExistOrNot(
        shape.UID,
        'container-line',
        helperData
      );
      emitObjectModifying([shape, text, line], helperData);
    } else {
      emitObjectModifying([shape, text], helperData);
    }
  });

  let straightLine = $('<div class="center active h-50 straight-line"></div>');
  let straightLineImg = $(
    '<img src="assets/img/straighLineBorder.svg"></img>'
  ).css({ width: '1.5rem' });
  straightLine.append(straightLineImg);

  straightLine.click(() => {
    $('.link-collapse').collapse('hide');
    if (shape?.objType === 'area-shape') return;
    if (shape?.borderType === 'straight') return;

    borderColorChangerDropdown.find('.active').removeClass('active');
    straightLine.addClass('active');
    let activeObject = helperData.scope.canvas.getActiveObject();

    if (activeObject.objType === 'textarea') {
      activeObject.set({ strokeDashArray: '', borderType: 'straight' });
    } else {
      // activeObject.getObjects().forEach((obj) => {
      //   if (obj.objType === 'rect' || obj.objType === 'container-line') {
      //     obj.set({ strokeDashArray: '', borderType: 'straight' });
      //   }
      // });
      let line = objectOnCanvasExistOrNot(
        shape.UID,
        'container-line',
        helperData
      );
      if (line) {
        line.set({
          strokeDashArray: '',
          borderType: 'straight',
        });
      }
      shape.set({ strokeDashArray: '', borderType: 'straight' });
    }
    // updatehelperData.scope.canvasState();
    //   updateMiniMap();
    helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    helperData.scope.canvas.requestRenderAll();
    //   updatehelperData.scope.canvasState();
    if (shape?.objType === 'container-rect') {
      let line = objectOnCanvasExistOrNot(
        shape.UID,
        'container-line',
        helperData
      );
      emitObjectModifying([shape, text, line], helperData);
    } else {
      emitObjectModifying([shape, text], helperData);
    }
  });

  borderChangerMinusSection.append(minusLogo, straightLine);

  let pixelIndicatorLogo = $('<div class="center h-50"></div>');
  let pixelIndicatorLogoDiv = $(
    '<div class="text-center pixel-indicator">1 px</div>'
  ).css({
    width: '3rem',
    'background-color': '#e3ffdb',
    height: '1.8rem',
  });
  pixelIndicatorLogo.append(pixelIndicatorLogoDiv);

  let dashedLine = $('<div class="center dashed-line h-50"></div>');
  let dashedLineImg = $(
    '<img src="assets/img/dashedLineBorder.svg"></img>'
  ).css({ width: '1.5rem' });
  dashedLine.append(dashedLineImg);

  dashedLine.click(() => {
    $('.link-collapse').collapse('hide');
    if (shape?.objType === 'area-shape') return;
    if (shape?.borderType === 'dashed') return;
    borderColorChangerDropdown.find('.active').removeClass('active');
    dashedLine.addClass('active');
    let activeObject = helperData.scope.canvas.getActiveObject();

    if (activeObject.objType === 'textarea') {
      activeObject.set({
        strokeDashArray: [20, 5],
        borderType: 'dashed',
      });
    } else {
      // activeObject.getObjects().forEach((obj) => {
      //   if (obj.objType === 'rect' || obj.objType === 'container-line') {
      //     obj.set({
      //       strokeDashArray: [20 * rt, 5 * rt],
      //       borderType: 'dashed',
      //     });
      //   }
      // });
      let line = objectOnCanvasExistOrNot(
        shape.UID,
        'container-line',
        helperData
      );
      if (line) {
        line.set({
          strokeDashArray: [20, 5],
          borderType: 'dashed',
        });
      }
      shape.set({
        strokeDashArray: [20, 5],
        borderType: 'dashed',
      });
    }
    // updatehelperData.scope.canvasState();
    //   updateMiniMap();
    helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    helperData.scope.canvas.requestRenderAll();
    //   updatehelperData.scope.canvasState();
    if (shape?.objType === 'container-rect') {
      let line = objectOnCanvasExistOrNot(
        shape.UID,
        'container-line',
        helperData
      );
      emitObjectModifying([shape, text, line], helperData);
    } else {
      emitObjectModifying([shape, text], helperData);
    }
  });

  borderChangerIndicatorSection.append(pixelIndicatorLogo, dashedLine);

  let plusLogo = $('<div class="center h-50"></div>');
  let plusLogoImg = $('<img src="assets/img/plusSignBorder.svg"></img>').css({
    width: '1.5rem',
  });
  plusLogo.click(() => {
    $('.link-collapse').collapse('hide');
    if (shape?.objType === 'area-shape') return;
    if (shape?.strokeWidth === 5) return;
    let newStrokeWidth =
      pixelIndicatorLogoDiv.html() === '5 px'
        ? 5
        : parseInt(pixelIndicatorLogoDiv.html().split(' ')[0]) + 1;
    pixelIndicatorLogoDiv.html(`${newStrokeWidth}` + ' px');
    let activeObject = helperData.scope.canvas.getActiveObject();
    let updatedStrokeWidth = newStrokeWidth;
    let realStroke = newStrokeWidth.toString();
    if (activeObject.objType === 'textarea') {
      activeObject.set({
        strokeWidth: updatedStrokeWidth,
        realStroke: realStroke,
      });
    } else {
      let line = objectOnCanvasExistOrNot(
        shape.UID,
        'container-line',
        helperData
      );
      if (line) {
        line.set({
          strokeWidth: updatedStrokeWidth,
          realStroke: realStroke,
        });
      }
      shape.set({
        strokeWidth: updatedStrokeWidth,
        realStroke: realStroke,
      });
    }
    // updatehelperData.scope.canvasState();
    //   updateMiniMap();
    helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    helperData.scope.canvas.requestRenderAll();
    //   updatehelperData.scope.canvasState();
    if (shape?.objType === 'container-rect') {
      let line = objectOnCanvasExistOrNot(
        shape.UID,
        'container-line',
        helperData
      );
      emitObjectModifying([shape, text, line], helperData);
    } else {
      emitObjectModifying([shape, text], helperData);
    }
  });
  plusLogo.append(plusLogoImg);

  let dottedLine = $('<div class="center h-50 dotted-line></div>');
  let dottedLineImg = $(
    '<img src="assets/img/dottedLineBorder.svg"></img>'
  ).css({ width: '1.5rem' });
  dottedLine.append(dottedLineImg);

  dottedLine.click(() => {
    $('.link-collapse').collapse('hide');
    if (shape?.objType === 'area-shape') return;
    if (shape?.borderType === 'dotted') return;
    borderColorChangerDropdown.find('.active').removeClass('active');
    dottedLine.addClass('active');
    let activeObject = helperData.scope.canvas.getActiveObject();

    if (activeObject.objType === 'textarea') {
      activeObject.set({
        strokeDashArray: [4, 5],
        borderType: 'dotted',
      });
    } else {
      // activeObject.getObjects().forEach((obj) => {
      //   if (obj.objType === 'rect' || obj.objType === 'container-line') {
      //     obj.set({
      //       strokeDashArray: [4, 5 ],
      //       borderType: 'dotted',
      //     });
      //   }
      // });
      let line = objectOnCanvasExistOrNot(
        shape.UID,
        'container-line',
        helperData
      );
      if (line) {
        line.set({
          strokeDashArray: [4, 5],
          borderType: 'dotted',
        });
      }
      shape.set({
        strokeDashArray: [4, 5],
        borderType: 'dotted',
      });
    }
    // updatehelperData.scope.canvasState();
    //   updateMiniMap();
    helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    helperData.scope.canvas.requestRenderAll();
    //   updatehelperData.scope.canvasState();
    if (shape?.objType === 'container-rect') {
      let line = objectOnCanvasExistOrNot(
        shape.UID,
        'container-line',
        helperData
      );
      emitObjectModifying([shape, text, line], helperData);
    } else {
      emitObjectModifying([shape, text], helperData);
    }
  });
  borderChangerPlusSection.append(plusLogo, dottedLine);
  borderChangerFirstSection.append(
    borderChangerMinusSection,
    borderChangerIndicatorSection,
    borderChangerPlusSection
  );

  let borderChangerSecondSection = $('<div class="d-flex flex-wrap" ></div>');
  helperData.scope.drawingColorList.forEach((color) => {
    let borderColorlist = $(
      '<div class="col-3 p-0 center border-color-list" ></div>'
    ).css({ height: '3rem' });
    let borderColorlistDiv = $('<div></div>').css({
      'border-radius': '50%',
      border: `0.4rem solid ${color}`,
      width: '1.6rem',
      height: '1.6rem',
    });
    borderColorlist.click(() => {
      $('.link-collapse').collapse('hide');
      if (shape?.objType === 'area-shape') return;
      if (shape?.stroke === color) return;
      borderColorChangerDiv.css({ border: `0.4rem solid ${color}` });
      let activeObject = helperData.scope.canvas.getActiveObject();

      if (activeObject.objType === 'textarea') {
        activeObject.set('stroke', color);
      } else {
        // activeObject.getObjects().forEach((obj) => {
        //   if (obj.objType === 'rect' || obj.objType === 'container-line') {
        //     obj.set('stroke', color);
        //   }
        // });
        let line = objectOnCanvasExistOrNot(
          shape.UID,
          'container-line',
          helperData
        );
        if (line) {
          line.set('stroke', color);
        }
        shape.set('stroke', color);
      }
      // updatehelperData.scope.canvasState();
      // updateMiniMap();
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.canvas.requestRenderAll();
      // updatehelperData.scope.canvasState();
      if (shape?.objType === 'container-rect') {
        let line = objectOnCanvasExistOrNot(
          shape.UID,
          'container-line',
          helperData
        );
        emitObjectModifying([shape, text, line], helperData);
      } else {
        emitObjectModifying([shape, text], helperData);
      }
    });
    borderColorlist.append(borderColorlistDiv);
    borderChangerSecondSection.append(borderColorlist);
  });

  borderColorChangerDropdownMenuList.append(
    borderChangerFirstSection,
    borderChangerSecondSection
  );
  borderColorChangerDropdown.append(borderColorChangerDropdownMenuList);
  borderColorChanger.append(borderColorChangerDiv, borderColorChangerDropdown);

  shapeToolbarColorChangerDiv.append(colorChanger, borderColorChanger);
  shapeToolbarColorChanger.append(shapeToolbarColorChangerDiv);

  // Shape Toolbar Font Family Element
  let shapeToolbarFontFamily = $(
    `<div class="px-3 shape-font-family" role="button"></div>`
  ).css({ width: '10rem', 'border-right': '0.16rem solid #F5F5F5' });

  //font family Data Toggle
  let shapeToolbarFontFamilyDiv = $(
    `<div class="d-flex h-100" data-toggle="dropdown"></div>`
  );

  let fontFamilyElem = $(
    '<div class="col-10 p-0 center justify-content-start"></div>'
  );
  let fontFamilyElemPara = $('<p class="m-0 text-bold font-family">Arial</p>');
  fontFamilyElem.append(fontFamilyElemPara);
  let fontFamilyDrop = $('<div class="col-2 center p-0" ></div>');
  let fontFamilyDropImg = $('<img src="assets/img/dropdownImg.svg"></img>').css(
    { width: '0.7rem' }
  );
  fontFamilyDrop.append(fontFamilyDropImg);
  shapeToolbarFontFamilyDiv.append(fontFamilyElem, fontFamilyDrop);

  //Font family dropdown
  let fontFamilyDropdown = $(
    '<div class="dropdown-menu p-0" role="button" ></div>'
  ).addClass('fontfamily-dropdown-menu');

  let fontFamilyDropdownMenuList = $('<div class="d-flex flex-column" ></div>');
  helperData.scope.fontFamilies.sort().forEach((fontFamily) => {
    let fontFamilyElem = $(
      '<div class="center justify-content-start pl-3 fontfamily-item" ></div>'
    ).css({ height: '2rem' });
    let fontFamilyPara = $(`<p class="m-0">${fontFamily}</p>`);
    fontFamilyElem.append(fontFamilyPara);
    fontFamilyElem.click(() => {
      $('.link-collapse').collapse('hide');
      if (text?.fontFamily === fontFamily) return;

      if (text.text !== '') {
        if (text?.objType === 'textarea') {
          text.set({
            fontFamily: fontFamily,
          });
          helperData.scope.canvas.requestRenderAll();
          emitObjectModifying([{ objType: 'textOnly' }, text], helperData);
          return;
        } else {
          fontFamilyElemPara.html(`${fontFamily}`);
          text.set({
            fontFamily: fontFamily,
          });
          // updatehelperData.scope.canvasState();
        }
        //   updateMiniMap();
        helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
        helperData.scope.canvas.requestRenderAll();
        if (shape?.objType === 'container-rect') {
          let line = objectOnCanvasExistOrNot(
            shape.UID,
            'container-line',
            helperData
          );
          emitObjectModifying([shape, text, line], helperData);
        } else {
          emitObjectModifying([shape, text], helperData);
        }
      }
    });
    fontFamilyDropdownMenuList.append(fontFamilyElem);
  });

  fontFamilyDropdown.append(fontFamilyDropdownMenuList);
  shapeToolbarFontFamily.append(shapeToolbarFontFamilyDiv, fontFamilyDropdown);

  // Shape Toolbar Font Size Element
  let shapeToolbarFontSize = $(
    `<div class="px-3 shape-font-size" role="button"></div>`
  ).css({
    width: '6rem',
    'border-right': '0.16rem solid #F5F5F5',
  });

  //font Size Data Toggle
  let shapeToolbarFontSizeDiv = $(
    `<div class="d-flex h-100" data-toggle="dropdown"></div>`
  );

  let fontSizeElem = $(
    '<div class="col-10 p-0 center justify-content-start"></div>'
  );
  let fontSizeElemPara = $(
    '<input type="text" class="m-0 text-bold font-size" value="20 " />'
  ).css({
    width: '1.5rem',
    outline: 'none',
    border: 'none',
  });
  let fontPoint = $('<span>pt</span>');
  fontSizeElemPara.focusin(() => {
    helperData.scope.onfocusInput = true;
  });
  fontSizeElemPara.focusout(() => {
    helperData.scope.onfocusInput = false;
  });
  fontSizeElemPara.change(() => {
    let activeObject = helperData.scope.canvas.getActiveObject();
    let textObj = helperData.scope.canvas
      .getObjects()
      .find((obj) => obj.UID === activeObject.UID && obj.type == 'textbox');
    let val = fontSizeElemPara.val();
    textObj.set('fontSize', val);
    textObj.set('actualFontSize', val);
    if (val > 56) {
      fontSizeElemPara.val('56');
    }
    textObj.fontSize = parseInt(val);
    textObj.actualFontSize = parseInt(val);
    if (fontSizeElemPara.val() == '') {
      fontSizeElemPara.val('20');
      textObj.fontSize = 20;
      textObj.actualFontSize = 20;
    }
    helperData.scope.canvas.renderAll();
  });

  fontSizeElem.append(fontSizeElemPara, fontPoint);
  let fontSizeDrop = $('<div class="col-2 center p-0" ></div>');
  let fontSizeDropImg = $('<img src="assets/img/dropdownImg.svg"></img>').css({
    width: '0.7rem',
  });
  fontSizeDrop.append(fontSizeDropImg);
  shapeToolbarFontSizeDiv.append(fontSizeElem, fontSizeDrop);

  //font Size Dropdown
  let fontSizeDropdown = $(
    '<div class="dropdown-menu p-0" role="button" ></div>'
  ).addClass('fontsize-dropdown-menu');

  let fontSizeDropdownMenuList = $('<div class="d-flex flex-column" ></div>');

  helperData.scope.fontSizes.forEach((fontSize) => {
    let fontSizeElem = $(
      '<div class="center justify-content-start pl-3 fontsize-item" ></div>'
    ).css({ height: '2rem' });
    let fontSizePara =
      $(`<input class="m-0 font-value d-none" name="fontSize" value="${fontSize}" disabled/>
      <label for="fontSize">${fontSize}</label>`).css({
        width: '4rem',
        outline: 'none',
        border: 'none',
      });
    fontSizeElem.append(fontSizePara);
    fontSizeElem.click(() => {
      $('.link-collapse').collapse('hide');
      if (text?.fontSize == fontSize) return;
      if (text.text) {
        fontSizeElemPara.val(`${fontSize}`);
        text.fontSize = parseInt(fontSize);
        text.actualFontSize = fontSize;
        //   updatehelperData.scope.canvasState();

        //   updateMiniMap();
        helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
        helperData.scope.canvas.requestRenderAll();
        if (shape?.objType === 'container-rect') {
          let line = objectOnCanvasExistOrNot(
            shape.UID,
            'container-line',
            helperData
          );
          emitObjectModifying([shape, text, line], helperData);
        } else {
          emitObjectModifying([shape, text], helperData);
        }
      }
    });
    fontSizeDropdownMenuList.append(fontSizeElem);
  });

  fontSizeDropdown.append(fontSizeDropdownMenuList);
  shapeToolbarFontSize.append(shapeToolbarFontSizeDiv, fontSizeDropdown);

  // Shape Toolbar TextColor Bold Italic And Text Placement Element
  let shapeToolbarBoldItalicText = $(
    `<div class="shape-bold-italic"></div>`
  ).css({
    width: '10rem',
    'border-right': '0.16rem solid #F5F5F5',
  });

  let shapeToolbarBoldItalicTextDiv = $(
    '<div class="d-flex h-100" role="button"></div>'
  );

  //Text Color
  let textColor = $('<div class="col-3 p-0 h-100"><td1v>');

  //TextColor Data Toggle
  let textColorDiv = $(
    '<div class="h-100 center pt-1" data-toggle="dropdown" data-target="textColorChanger"></div>'
  );
  let textColorImg = $(
    '<img src="assets/img/grouptTextColorChanger.svg"></img>'
  ).css({
    width: '0.9rem',
  });
  textColorDiv.append(textColorImg);

  //TextColor Dropdown
  let textColorDropdown = $(
    '<div class="dropdown-menu p-2" id="textColorChanger" role="button" ></div>'
  ).addClass('colorchanger-dropdown-menu');

  let textColorDropdownMenuList = $('<div class="d-flex flex-wrap" ></div>');
  helperData.scope.drawingColorList.forEach((color) => {
    let colorlist = $('<div class="col-3 p-0 center color-list" ></div>').css({
      height: '3rem',
    });
    let colorlistDiv = $('<div></div>').css({
      'border-radius': '50%',
      'background-color': `${color}`,
      width: '1.6rem',
      height: '1.6rem',
    });
    colorlist.click(() => {
      $('.link-collapse').collapse('hide');
      if (text.fill === color) return;
      if (text.text) {
        if (text.objType === 'textarea') {
          text.set('fill', color);
          helperData.scope.canvas.requestRenderAll();
          emitObjectModifying([{ objType: 'textOnly' }, text], helperData);
          return;
        } else {
          text.set('fill', color);
          // updatehelperData.scope.canvasState();
        }
        // updatehelperData.scope.canvasState();
        //   updateMiniMap();
        helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
        helperData.scope.canvas.requestRenderAll();
        if (shape?.objType === 'container-rect') {
          let line = objectOnCanvasExistOrNot(
            shape.UID,
            'container-line',
            helperData
          );
          emitObjectModifying([shape, text, line], helperData);
        } else {
          emitObjectModifying([shape, text], helperData);
        }
      }
    });
    colorlist.append(colorlistDiv);
    textColorDropdownMenuList.append(colorlist);
  });
  textColorDropdown.append(textColorDropdownMenuList);
  textColor.append(textColorDiv, textColorDropdown);

  //Bold text
  let boldText = $('<div class="col-3 p-0 h-100 p-1"></div>');
  let boldTextDiv = $('<div class=" h-100 center bold-text"></div>');
  let boldTextImg = $('<img src="assets/img/bold_text_notes.svg"></img>').css({
    width: '1.2rem',
  });
  boldTextDiv.append(boldTextImg);
  boldText.append(boldTextDiv);
  boldText.click(() => {
    $('.link-collapse').collapse('hide');
    if (text.objType === 'textarea') {
      if (text.fontWeight === 'normal') {
        text.set('fontWeight', 'bold');
        boldTextDiv.css('background-color', '#e3ffdb');
      } else {
        text.set('fontWeight', 'normal');
        boldTextDiv.css('background-color', 'white');
      }
      helperData.scope.canvas.requestRenderAll();
      emitObjectModifying([{ objType: 'textOnly' }, text], helperData);
      return;
    } else {
      if (text.text) {
        if (text.fontWeight === 'normal') {
          text.set('fontWeight', 'bold');
          boldTextDiv.css('background-color', '#e3ffdb');
        } else {
          // obj.fontWeight = 'normal';
          text.set('fontWeight', 'normal');
          boldTextDiv.css('background-color', 'white');
        }
        //   updatehelperData.scope.canvasState();
      }
    }
    // updatehelperData.scope.canvasState();
    //   updateMiniMap();
    helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    helperData.scope.canvas.requestRenderAll();
    if (shape?.objType === 'container-rect') {
      let line = objectOnCanvasExistOrNot(
        shape.UID,
        'container-line',
        helperData
      );
      emitObjectModifying([shape, text, line], helperData);
    } else {
      emitObjectModifying([shape, text], helperData);
    }
  });

  let movementText = $('<div class="col-3 p-0 h-100"></div>');

  //movemnet text Data Toggle
  let movementTextDiv = $(
    '<div class="h-100 center" data-toggle="dropdown"></div>'
  );
  let movementTextImg = $(
    '<img src="assets/img/text-center-icon.svg"></img>'
  ).css({ width: '1rem' });
  movementTextDiv.append(movementTextImg);

  //movemnet text Dropdown
  let movementTextDropdown = $(
    '<div class="dropdown-menu p-0" role="button" ></div>'
  ).addClass('movementtext-dropdown-menu');

  let movementTextDropdownMenuList = $(
    '<div class="d-flex h-100 text-alignment-division" ></div>'
  );
  let textToLeft = $(
    '<div class="col-4 p-0 center text-alignment text-left"></div>'
  );
  let textToLeftImg = $('<img src="assets/img/left-align-text.svg"></img>').css(
    { width: '1.4rem' }
  );
  textToLeft.append(textToLeftImg);
  textToLeft.click(() => {
    $('.link-collapse').collapse('hide');
    if (text.textAlign === 'left') return;
    if (text.text) {
      movementTextDropdownMenuList.find('.active').removeClass('active');
      textToLeft.addClass('active');
      if (text.get('textAlign') === 'center') {
        text.set('textAlign', 'left');
      } else if (text.get('textAlign') === 'right') {
        text.set('textAlign', 'left');
      }
      // updatehelperData.scope.canvasState();
      // updateMiniMap();
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.canvas.requestRenderAll();

      if (shape?.objType === 'container-rect') {
        let line = objectOnCanvasExistOrNot(
          shape.UID,
          'container-line',
          helperData
        );
        emitObjectModifying([shape, text, line], helperData);
      } else {
        emitObjectModifying([shape, text], helperData);
      }
    }
  });

  let textToMiddle = $(
    '<div class="col-4 p-0 center text-alignment text-middle active "></div>'
  );
  let textToMiddleImg = $(
    '<img src="assets/img/text-center-icon.svg"></img>'
  ).css({ width: '1rem' });
  textToMiddle.append(textToMiddleImg);
  textToMiddle.click(() => {
    $('.link-collapse').collapse('hide');
    if (text.textAlign === 'center') return;

    if (text.text) {
      movementTextDropdownMenuList.find('.active').removeClass('active');
      textToMiddle.addClass('active');
      if (text.get('textAlign') === 'left') {
        text.set('textAlign', 'center');
      } else if (text.get('textAlign') === 'right') {
        text.set('textAlign', 'center');
      }
      // updatehelperData.scope.canvasState();

      // updateMiniMap();
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.canvas.requestRenderAll();
      if (shape?.objType === 'container-rect') {
        let line = objectOnCanvasExistOrNot(
          shape.UID,
          'container-line',
          helperData
        );
        emitObjectModifying([shape, text, line], helperData);
      } else {
        emitObjectModifying([shape, text], helperData);
      }
    }
  });

  let textToRight = $(
    '<div class="col-4 p-0 text-alignment text-right center"></div>'
  );
  let textToRightImg = $(
    '<img src="assets/img/right-align-text.svg"></img>'
  ).css({ width: '1.4rem' });
  textToRight.append(textToRightImg);
  textToRight.click(() => {
    $('.link-collapse').collapse('hide');
    if (text.textAlign === 'right') return;
    if (text.text) {
      movementTextDropdownMenuList.find('.active').removeClass('active');
      textToRight.addClass('active');
      if (text.get('textAlign') === 'left') {
        text.set('textAlign', 'right');
      } else if (text.get('textAlign') === 'center') {
        text.set('textAlign', 'right');
      }
      // updatehelperData.scope.canvasState();

      // updateMiniMap();
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.canvas.requestRenderAll();
      if (shape?.objType === 'container-rect') {
        let line = objectOnCanvasExistOrNot(
          shape.UID,
          'container-line',
          helperData
        );
        emitObjectModifying([shape, text, line], helperData);
      } else {
        emitObjectModifying([shape, text], helperData);
      }
    }
  });

  movementTextDropdownMenuList.append(textToLeft, textToMiddle, textToRight);
  movementTextDropdown.append(movementTextDropdownMenuList);
  movementText.append(movementTextDiv, movementTextDropdown);

  //underlineText text
  let underLineText = $('<div class="col-3 p-0 h-100 p-1"></div>');
  let underLineTextDiv = $('<div class="h-100 center underline-text"></div>');
  let underlineTextImg = $(
    '<img src="assets/img/underLineIcon.svg"></img>'
  ).css({ width: '1rem' });
  underLineText.click(() => {
    $('.link-collapse').collapse('hide');
    if (text.text) {
      if (text.get('underline') === false) {
        text.set('underline', true);
        underLineTextDiv.css('background-color', '#e3ffdb');
      } else {
        text.set('underline', false);
        underLineTextDiv.css('background-color', 'white');
      }
      // updatehelperData.scope.canvasState();
    }
    //   updateMiniMap();
    helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    helperData.scope.canvas.renderAll();
    if (shape?.objType === 'container-rect') {
      let line = objectOnCanvasExistOrNot(
        shape.UID,
        'container-line',
        helperData
      );
      emitObjectModifying([shape, text, line], helperData);
    } else {
      emitObjectModifying([shape, text], helperData);
    }
  });
  underLineTextDiv.append(underlineTextImg);
  underLineText.append(underLineTextDiv);

  shapeToolbarBoldItalicTextDiv.append(
    textColor,
    boldText,
    underLineText,
    movementText
  );
  shapeToolbarBoldItalicText.append(shapeToolbarBoldItalicTextDiv);

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
    if (isObjectIsShape(shape) || shape?.objType === 'container-rect') {
      shape.set('objreferenceLink', linkInput.val());
    }

    linkMainDiv.toggle();
    linkShow();
    // updatehelperData.scope.canvasState();
    helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
    if (shape?.objType === 'container-rect') {
      let line = objectOnCanvasExistOrNot(
        shape.UID,
        'container-line',
        helperData
      );
      emitObjectModifying([shape, text, line], helperData);
    } else {
      emitObjectModifying([shape, text], helperData);
    }
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

  // // Shape Toolbar Tag Element
  // let shapeToolbarTag = $(`<div role="button"></div>`).css({
  //   width: '3rem',
  //   'border-right': '0.16rem solid #F5F5F5',
  // });
  // let shapeToolbarTagDiv = $(`<div class="d-flex h-100 center"></div>`);
  // let shapeToolbarTagImg = $(
  //   '<img src="assets/img/label_shapes.svg"></img>'
  // ).css({ width: '1.4rem' });
  // shapeToolbarTagDiv.append(shapeToolbarTagImg);
  // shapeToolbarTag.append(shapeToolbarTagDiv);

  // Shape Toolbar Comment Element

  let shapeToolbarCommentIcon = $(
    `<div role="button" class="shapetoolbar-comment"></div>`
  ).css({
    width: '3rem',
    'border-right': '0.16rem solid #F5F5F5',
    position: 'relative',
  });

  let availableComment = helperData.scope.whiteboardCommentsAllData.filter(
    (obj) => {
      return obj.objectID === shape.UID;
    }
  );
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

  let shapeToolbarCommentIconDiv = $(`<div class="d-flex h-100 center"></div>`);
  shapeToolbarCommentIconDiv.click(() => {
    if ($('.comment_drop').css('display') === 'none') {
      helperData.scope.shouldAddComment = true;
      helperData.scope.currentCommentObjectId = shape.UID;
      helperData.scope.commentsToBeShown =
        helperData.scope.whiteboardCommentsAllData.filter((obj) => {
          return obj.objectID === helperData.scope.currentCommentObjectId;
        });
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

  let shapeLockIconIndication: any = new Image();
  shapeLockIconIndication.src = 'assets/img/lock-pin-icon.svg';
  let shapePinIconIndication;

  // Shape Toolbar Lock Element
  let shapeToolbarLockIcon = $(`<div role="button"></div>`).css({
    width: '3rem',
  });

  let shapeToolbarLockIconDiv;
  let shapeToolbarContainerLockWithAllObjects;
  let shapeToolbarContainerLock;

  if (shape?.objType === 'container-rect') {
    shapeToolbarLockIconDiv = $(
      `<div class="d-flex h-100 center shape-background-color dropdown"></div>`
    );

    let shapeToolbarLockIconImg = $(
      '<img src="assets/img/lock-icon.svg" data-toggle="dropdown"></img>'
    ).css({ width: '1.4rem' });

    let shapeToolbarLockIconDropMenu = $(
      `<div class="container-dropdown-menu dropdown-menu"></div>`
    ).css({});

    let shapeToolbarDropMenuList = $(
      `<div class="d-flex container-menu-list"></div>`
    )

    shapeToolbarContainerLock = $(
      `<div class="h-100 center container-lock-icon"></div>`
    ).css({ flex: 1 });

    let shapeToolbarContainerLockImg = $(
      '<img src="assets/img/lock-icon.svg"></img>'
    ).css({ width: '1.4rem' });
    shapeToolbarContainerLock.append(shapeToolbarContainerLockImg)
    let matchedData = [];
    let allContainerObjects;
    shapeToolbarContainerLock.click(() => {
      let shapeLockIcon = helperData.scope.canvas
        .getObjects()
        .find(
          (obj) =>
            shape.UID === obj.UID && obj.objType === 'lock-Indication'
        );
      helperData.scope.canvas.remove(shapeLockIcon);
      if (shapeToolbarContainerLockWithAllObjects.css('background-color') === "rgb(250, 128, 114)") {
        setAllSelectedObjectActionable(matchedData, helperData, true)
      }
      $('.link-collapse').collapse('hide');
      if (shapeToolbarContainerLock.css('background-color') !== "rgb(250, 128, 114)") {
        shape.id = "single"
        shape.set('lockMovementX', true);
        shape.set('lockMovementY', true);
        shape.set('cornerStrokeColor', 'red');
        shape.set('borderColor', 'red');
        shape.set('cornerColor', '#87CEFA');
        shape.set('lockScalingX', true);
        shape.set('lockScalingY', true);
        shape.set('lockRotation', true);
        // shape.set('selectable', false);
        // if (shape?.objType === 'area-shape') {
        text.set('lockMovementX', true);
        text.set('lockMovementY', true);
        // }
        text.set('editable', false);
        shape.set('selectMe', false);
        text.set('selectMe', false);
        if (shape?.objType === 'container-rect') {
          let line = objectOnCanvasExistOrNot(
            shape?.UID,
            'container-line',
            helperData
          );
          line.set('selectMe', false);
        }

        let centerPosX = (shape.aCoords.tl.x + shape.aCoords.tr.x) / 2;
        let centerPosY = (shape.aCoords.tl.y + shape.aCoords.tr.y) / 2;

        shapePinIconIndication = new fabric.Image(shapeLockIconIndication);
        shapePinIconIndication.set({
          UID: shape.UID,
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
        helperData.scope.canvas.add(shapePinIconIndication);

        shapeToolbarLogo.css({ display: 'none' });
        shapeToolbarColorChanger.css({ display: 'none' });
        shapeToolbarFontFamily.css({ display: 'none' });
        shapeToolbarFontSize.css({ display: 'none' });
        shapeToolbarBoldItalicText.css({ display: 'none' });
        shapeToolbarAttachLink.css({ display: 'none' });
        mainToolbarDiv.css({ display: 'none' });
        mainToolbarDiv.css({ width: '6rem' });
        shapeToolbarContainerLock.css({ 'background-color': '#FA8072' });
        shapeToolbarContainerLockWithAllObjects.css({ 'background-color': 'white' });
      } else {
        shape.id = "none"
        shape.set('lockMovementX', false);
        shape.set('lockMovementY', false);
        shape.set('cornerStrokeColor', '#137EF9');
        shape.set('borderColor', '#137EF9');
        shape.set('cornerColor', '#87CEFA');
        shape.set('lockScalingX', false);
        shape.set('lockScalingY', false);
        shape.set('lockRotation', false);
        text.set('editable', true);
        shape.set('selectMe', true);
        text.set('selectMe', true);
        // if (shape?.objType === 'area-shape') {
        text.set('lockMovementX', false);
        text.set('lockMovementY', false);
        // }
        if (shape?.objType === 'container-rect') {
          let line = objectOnCanvasExistOrNot(
            shape?.UID,
            'container-line',
            helperData
          );
          line.set('selectMe', true);
        }
        // shape.set('selectable', true);
        let shapeLockIcon = helperData.scope.canvas
          .getObjects()
          .find(
            (obj) =>
              shape.UID === obj.UID && obj.objType === 'lock-Indication'
          );
        helperData.scope.canvas.remove(shapeLockIcon);

        shapeToolbarLogo.css({ display: 'block' });
        shapeToolbarColorChanger.css({ display: 'block' });
        shapeToolbarFontFamily.css({ display: 'block' });
        shapeToolbarFontSize.css({ display: 'block' });
        shapeToolbarBoldItalicText.css({ display: 'block' });
        shapeToolbarAttachLink.css({ display: 'block' });

        mainToolbarDiv.css({ display: 'none' });
        mainToolbarDiv.css({ width: toolbarWidth });
        shapeToolbarContainerLock.css({ 'background-color': 'white' });
        shapeToolbarContainerLockWithAllObjects.css({ 'background-color': 'white' });
      }
      // updatehelperData.scope.canvasState();
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.canvas.renderAll();

      if (shape?.objType === 'container-rect') {
        let line = objectOnCanvasExistOrNot(
          shape.UID,
          'container-line',
          helperData
        );
        shape.setControlsVisibility({
          mtr: false,
        });
        helperData.scope.canvas.renderAll();
        emitObjectModifying([shape, text, line], helperData);
      } else {
        emitObjectModifying([shape, text], helperData);
      }

    })

    shapeToolbarContainerLockWithAllObjects = $(
      `<div class="h-100 container-lock-icon-allobjects center"></div>`
    ).css({ flex: 1 });

    let shapeToolbarContainerLockWithAllObjectsImg = $(
      '<img src="assets/img/container-lock-all.svg"></img>'
    ).css({ width: '1.4rem' });

    shapeToolbarContainerLockWithAllObjects.click(() => {
      let shapeLockIcon = helperData.scope.canvas
        .getObjects()
        .find(
          (obj) =>
            shape.UID === obj.UID && obj.objType === 'lock-Indication'
        );
      helperData.scope.canvas.remove(shapeLockIcon);
      $('.link-collapse').collapse('hide');
      matchedData = [];
      allContainerObjects = [shape, text, objectOnCanvasExistOrNot(shape.UID, 'container-line', helperData)]
      matchedData = getObjectsContainedInContainer(shape, matchedData, allContainerObjects, helperData)
      if (shapeToolbarContainerLockWithAllObjects.css('background-color') !== "rgb(250, 128, 114)") {
        shape.id = "multiple"
        shape.set('lockMovementX', true);
        shape.set('lockMovementY', true);
        shape.set('cornerStrokeColor', 'red');
        shape.set('borderColor', 'red');
        shape.set('cornerColor', '#87CEFA');
        shape.set('lockScalingX', true);
        shape.set('lockScalingY', true);
        shape.set('lockRotation', true);
        // shape.set('selectable', false);
        // if (shape?.objType === 'area-shape') {
        text.set('lockMovementX', true);
        text.set('lockMovementY', true);
        // }
        text.set('editable', false);
        shape.set('selectMe', false);
        text.set('selectMe', false);
        if (shape?.objType === 'container-rect') {
          let line = objectOnCanvasExistOrNot(
            shape?.UID,
            'container-line',
            helperData
          );
          line.set('selectMe', false);
        }
        setAllSelectedObjectNonActionable(matchedData, helperData, true)
        let centerPosX = (shape.aCoords.tl.x + shape.aCoords.tr.x) / 2;
        let centerPosY = (shape.aCoords.tl.y + shape.aCoords.tr.y) / 2;

        shapePinIconIndication = new fabric.Image(shapeLockIconIndication);
        shapePinIconIndication.set({
          UID: shape.UID,
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
        helperData.scope.canvas.add(shapePinIconIndication);

        shapeToolbarLogo.css({ display: 'none' });
        shapeToolbarColorChanger.css({ display: 'none' });
        shapeToolbarFontFamily.css({ display: 'none' });
        shapeToolbarFontSize.css({ display: 'none' });
        shapeToolbarBoldItalicText.css({ display: 'none' });
        shapeToolbarAttachLink.css({ display: 'none' });
        mainToolbarDiv.css({ display: 'none' });
        mainToolbarDiv.css({ width: '6rem' });
        shapeToolbarContainerLockWithAllObjects.css({ 'background-color': '#FA8072' });
        shapeToolbarContainerLock.css({ 'background-color': 'white' });
      } else {
        shape.id = "none"
        shape.set('lockMovementX', false);
        shape.set('lockMovementY', false);
        shape.set('cornerStrokeColor', '#137EF9');
        shape.set('borderColor', '#137EF9');
        shape.set('cornerColor', '#87CEFA');
        shape.set('lockScalingX', false);
        shape.set('lockScalingY', false);
        shape.set('lockRotation', false);
        text.set('editable', true);
        shape.set('selectMe', true);
        text.set('selectMe', true);
        // if (shape?.objType === 'area-shape') {
        text.set('lockMovementX', false);
        text.set('lockMovementY', false);
        // }

        setAllSelectedObjectActionable(matchedData, helperData, true)
        if (shape?.objType === 'container-rect') {
          let line = objectOnCanvasExistOrNot(
            shape?.UID,
            'container-line',
            helperData
          );
          line.set('selectMe', true);
        }
        // shape.set('selectable', true);
        let shapeLockIcon = helperData.scope.canvas
          .getObjects()
          .find(
            (obj) =>
              shape.UID === obj.UID && obj.objType === 'lock-Indication'
          );
        helperData.scope.canvas.remove(shapeLockIcon);

        shapeToolbarLogo.css({ display: 'block' });
        shapeToolbarColorChanger.css({ display: 'block' });
        shapeToolbarFontFamily.css({ display: 'block' });
        shapeToolbarFontSize.css({ display: 'block' });
        shapeToolbarBoldItalicText.css({ display: 'block' });
        shapeToolbarAttachLink.css({ display: 'block' });

        mainToolbarDiv.css({ display: 'none' });
        mainToolbarDiv.css({ width: toolbarWidth });
        shapeToolbarContainerLockWithAllObjects.css({ 'background-color': 'white' });
        shapeToolbarContainerLock.css({ 'background-color': 'white' });
      }
      // updatehelperData.scope.canvasState();
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.canvas.renderAll();

      if (shape?.objType === 'container-rect') {
        let line = objectOnCanvasExistOrNot(
          shape.UID,
          'container-line',
          helperData
        );
        shape.setControlsVisibility({
          mtr: false,
        });
        helperData.scope.canvas.renderAll();
        emitObjectModifying([shape, text, line], helperData);
      } else {
        emitObjectModifying([shape, text], helperData);
      }

    })

    shapeToolbarContainerLockWithAllObjects.append(shapeToolbarContainerLockWithAllObjectsImg)


    shapeToolbarDropMenuList.append(
      shapeToolbarContainerLock,
      shapeToolbarContainerLockWithAllObjects
    );
    shapeToolbarLockIconDropMenu.append(shapeToolbarDropMenuList);

    shapeToolbarLockIconDiv.append(
      shapeToolbarLockIconImg,
      shapeToolbarLockIconDropMenu
    );

  } else {
    shapeToolbarLockIconDiv = $(
      `<div class="d-flex h-100 center shape-background-color"></div>`
    );

    shapeToolbarLockIconDiv.click(() => {
      $('.link-collapse').collapse('hide');
      if (shape) {
        if (shape.get('lockMovementX', 'lockMovementY') == false) {
          shape.set('lockMovementX', true);
          shape.set('lockMovementY', true);
          shape.set('cornerStrokeColor', 'red');
          shape.set('borderColor', 'red');
          shape.set('cornerColor', '#87CEFA');
          shape.set('lockScalingX', true);
          shape.set('lockScalingY', true);
          shape.set('lockRotation', true);
          // shape.set('selectable', false);
          // if (shape?.objType === 'area-shape') {
          text.set('lockMovementX', true);
          text.set('lockMovementY', true);
          // }
          text.set('editable', false);
          shape.set('selectMe', false);
          text.set('selectMe', false);
          if (shape?.objType === 'container-rect') {
            let line = objectOnCanvasExistOrNot(
              shape?.UID,
              'container-line',
              helperData
            );
            line.set('selectMe', false);
          }

          let centerPosX = (shape.aCoords.tl.x + shape.aCoords.tr.x) / 2;
          let centerPosY = (shape.aCoords.tl.y + shape.aCoords.tr.y) / 2;

          shapePinIconIndication = new fabric.Image(shapeLockIconIndication);
          shapePinIconIndication.set({
            UID: shape.UID,
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
          helperData.scope.canvas.add(shapePinIconIndication);

          shapeToolbarLogo.css({ display: 'none' });
          shapeToolbarColorChanger.css({ display: 'none' });
          shapeToolbarFontFamily.css({ display: 'none' });
          shapeToolbarFontSize.css({ display: 'none' });
          shapeToolbarBoldItalicText.css({ display: 'none' });
          shapeToolbarAttachLink.css({ display: 'none' });
          mainToolbarDiv.css({ display: 'none' });
          mainToolbarDiv.css({ width: '6rem' });
          shapeToolbarLockIconDiv.css({ 'background-color': '#FA8072' });
        } else {
          shape.set('lockMovementX', false);
          shape.set('lockMovementY', false);
          shape.set('cornerStrokeColor', '#137EF9');
          shape.set('borderColor', '#137EF9');
          shape.set('cornerColor', '#87CEFA');
          shape.set('lockScalingX', false);
          shape.set('lockScalingY', false);
          shape.set('lockRotation', false);
          text.set('editable', true);
          shape.set('selectMe', true);
          text.set('selectMe', true);
          // if (shape?.objType === 'area-shape') {
          text.set('lockMovementX', false);
          text.set('lockMovementY', false);
          // }
          if (shape?.objType === 'container-rect') {
            let line = objectOnCanvasExistOrNot(
              shape?.UID,
              'container-line',
              helperData
            );
            line.set('selectMe', true);
          }
          // shape.set('selectable', true);
          let shapeLockIcon = helperData.scope.canvas
            .getObjects()
            .find(
              (obj) =>
                shape.UID === obj.UID && obj.objType === 'lock-Indication'
            );
          helperData.scope.canvas.remove(shapeLockIcon);

          shapeToolbarLogo.css({ display: 'block' });
          shapeToolbarColorChanger.css({ display: 'block' });
          shapeToolbarFontFamily.css({ display: 'block' });
          shapeToolbarFontSize.css({ display: 'block' });
          shapeToolbarBoldItalicText.css({ display: 'block' });
          shapeToolbarAttachLink.css({ display: 'block' });

          mainToolbarDiv.css({ display: 'none' });
          mainToolbarDiv.css({ width: toolbarWidth });
          shapeToolbarLockIconDiv.css({ 'background-color': 'white' });
        }
        // updatehelperData.scope.canvasState();
        helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
        helperData.scope.canvas.renderAll();

        if (shape?.objType === 'container-rect') {
          let line = objectOnCanvasExistOrNot(
            shape.UID,
            'container-line',
            helperData
          );
          shape.setControlsVisibility({
            mtr: false,
          });
          helperData.scope.canvas.renderAll();
          emitObjectModifying([shape, text, line], helperData);
        } else {
          emitObjectModifying([shape, text], helperData);
        }
      }
    });
    let shapeToolbarLockIconImg = $(
      '<img src="assets/img/lock-icon.svg"></img>'
    ).css({ width: '1.4rem' });
    shapeToolbarLockIconDiv.append(shapeToolbarLockIconImg);
  }
  shapeToolbarLockIcon.append(shapeToolbarLockIconDiv);

  // Append on the Shape Toolbar
  shape?.objType === 'area-shape'
    ? shapeToolbar.append(
      shapeToolbarLogo,
      shapeToolbarFontFamily,
      shapeToolbarFontSize,
      shapeToolbarBoldItalicText,
      shapeToolbarAttachLink,
      shapeToolbarCommentIcon,
      shapeToolbarLockIcon
    )
    : shapeToolbar.append(
      shapeToolbarLogo,
      shapeToolbarColorChanger,
      shapeToolbarFontFamily,
      shapeToolbarFontSize,
      shapeToolbarBoldItalicText,
      shapeToolbarAttachLink,
      shapeToolbarCommentIcon,
      shapeToolbarLockIcon
    );

  if (shape.objType === 'area-shape') {
    colorChangerDiv.css('background-color', 'black');
  }

  if (fromServer) {
    if (isObjectIsShape(shape) || shape?.objType === 'container-rect') {
      if (shape.objreferenceLink) {
        linkInput.val(shape.objreferenceLink);
        linkShow();
      }
      if (shape?.lockMovementY) {
        shapeToolbarLogo.css({ display: 'none' });
        shapeToolbarColorChanger.css({ display: 'none' });
        shapeToolbarFontFamily.css({ display: 'none' });
        shapeToolbarFontSize.css({ display: 'none' });
        shapeToolbarBoldItalicText.css({ display: 'none' });
        shapeToolbarAttachLink.css({ display: 'none' });
        mainToolbarDiv.css({ display: 'none' });
        mainToolbarDiv.css({ width: '6rem' });
        if (shape?.objType === 'container-rect') {

          if (shape?.id === "multiple") {
            shapeToolbarContainerLockWithAllObjects.css({ 'background-color': '#FA8072' });
          } else if (shape?.id === "single") {
            shapeToolbarContainerLock.css({ 'background-color': '#FA8072' });
          }
        } else {
          shapeToolbarLockIconDiv.css({ 'background-color': '#FA8072' });
        }

      } else {
        shapeToolbarLogo.css({ display: 'block' });
        shapeToolbarColorChanger.css({ display: 'block' });
        shapeToolbarFontFamily.css({ display: 'block' });
        shapeToolbarFontSize.css({ display: 'block' });
        shapeToolbarBoldItalicText.css({ display: 'block' });
        shapeToolbarAttachLink.css({ display: 'block' });

        mainToolbarDiv.css({ display: 'none' });
        mainToolbarDiv.css({ width: toolbarWidth });
        if (shape?.objType === 'container-rect') {

        } else {
          shapeToolbarLockIconDiv.css({ 'background-color': 'white' });
        }

      }
    }

    if (isObjectIsShape(shape) || shape.objType === 'container-rect') {
      let rectData = shape;
      let textData = text;
      colorChangerDiv.css('background-color', rectData.fill);
      pixelIndicatorLogoDiv.html(`${rectData.strokeWidth} px`);
      if (shape?.objType !== 'area-shape') {
        borderColorChangerDiv.css('border-color', rectData.stroke);
      }
      if (rectData.borderType === 'dashed') {
        borderColorChangerDropdown.find('.active').removeClass('active');
        dashedLine.addClass('active');
      } else if (rectData.borderType === 'dotted') {
        borderColorChangerDropdown.find('.active').removeClass('active');
        dottedLine.addClass('active');
      }
      fontFamilyElemPara.html(
        textData.fontFamily === 'Times New Roman'
          ? 'Arial'
          : textData.fontFamily
      );
      let textFontSize = Math.ceil(textData.fontSize);
      fontSizeElemPara.val(textFontSize);
      //Bold functionality
      if (textData.fontWeight === 'normal') {
        boldTextDiv.css('background-color', 'white');
      } else {
        boldTextDiv.css('background-color', '#e3ffdb');
      }

      //Text Align Functionality
      if (textData.textAlign === 'center') {
        movementTextDropdownMenuList.find('.active').removeClass('active');
        textToMiddle.addClass('active');
      } else if (textData.textAlign === 'left') {
        movementTextDropdownMenuList.find('.active').removeClass('active');
        textToLeft.addClass('active');
      } else if (textData.textAlign === 'right') {
        movementTextDropdownMenuList.find('.active').removeClass('active');
        textToRight.addClass('active');
      }

      //UnderLine Functionality
      if (textData.underline === false) {
        underLineTextDiv.css('background-color', 'white');
      } else {
        underLineTextDiv.css('background-color', '#e3ffdb');
      }
    }

    fromServer = false;
  }
  // Appending shape toolbar in main Toolbar div
  mainToolbarDiv.append(shapeToolbar);

  // Appending on the Main Div ELement
  mainDrawingDiv.append(mainToolbarDiv);
  colorSpect.spectrum({
    color: 'black',
    preferredFormat: 'hex',
    showInput: true,
    showAlpha: true,
  });
  $('.sp-choose').click(() => {
    var value = colorSpect.val();
    colorPickerDiv.css('background-color', value);
  });
  colorPickerDiv.click(() => {
    let value = colorPickerDiv.css('background-color');
    colorChangerDiv.css({ 'background-color': value });
    if (isObjectIsShape(shape) || shape.objType === 'container-rect') {
      shape.set('fill', value);
      if (shape?.objType === 'container-rect') {
        let line = objectOnCanvasExistOrNot(
          shape.UID,
          'container-line',
          helperData
        );
        emitObjectModifying([shape, text, line], helperData);
      } else {
        emitObjectModifying([shape, text], helperData);
      }
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.canvas.requestRenderAll();
    }
  });
  return mainToolbarDiv;
};



// //////////////////////////////////////
// setting background transprent to all  object
// //////////////////////////////////////
export const objectBackgroundTransparent = (helperData) => {
  let color = 'rgba(255,255,255, .1)'
  let data = helperData.scope.SDS.getSelectedShape();
  if(data){
    let shape = data['shape']

    if (shape) {
      if (shape.fill === color) return;
      if (shape?.objType === 'area-shape') return;
      shape.set('fill', color);
      if (shape?.objType === 'container-rect') {
      
        let line = objectOnCanvasExistOrNot(
          shape.UID,
          'container-line',
          helperData
        );
        emitObjectModifying([shape,transprentText], helperData);
      } else {
      
        emitObjectModifying([shape,transprentText], helperData);
      }
     
      helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
      helperData.scope.canvas.requestRenderAll();
  
    }
  
  }
 
}
export const shapesEventManager = (shape, text, toolbar, helperData) => {

  let { fabric, $ } = helperData;
  let connectionData = [];
  let scalingConnectionData = [];
  let shouldCallOnce = true;
  text.on('changed', (e) => {
    emitObjectModifying([text], helperData);
  });
  text.on('mousedown', (e) => {

    $('.link-icon').css({
      display: 'flex',
    });
    $('.view-link').css({
      display: 'none',
    });
    helperData.scope.canvas.bringToFront(shape);
    helperData.scope.canvas.bringToFront(text);
    let lockIndictionIcon = helperData.scope.canvas
      .getObjects()
      .find(
        (obj) => shape.UID === obj.UID && obj?.objType === 'lock-Indication'
      );
    helperData.scope.canvas.bringToFront(lockIndictionIcon);
    connectionData = [];
    connectionData = connectionOfArrowOnMousedownHandler(
      shape,
      connectionData,
      helperData
    );
    toolbarPosHandler(
      toolbar,
      shape,
      helperData.scope.currentRatio,
      helperData
    );
    // helperData.scope.canvas.setActiveObject(shape);
    if (e.target.id !== "text") {
      helperData.scope.canvas.setActiveObject(shape);
    }
    helperData.scope.canvas.requestRenderAll();
  });
  text.on('moving', (e) => {
    let transformCenterPos = e.transform.target.getCenterPoint();
    shape.set({
      top: transformCenterPos.y,
      left: transformCenterPos.x,
    });
    moveArrowTogetherWithShapeHandler(
      connectionData,
      transformCenterPos,
      helperData
    );
    emitObjectMoving({ target: shape }, helperData);
  });
  text.on('moved', (e) => {
    toolbarPosHandler(
      toolbar,
      shape,
      helperData.scope.currentRatio,
      helperData
    );
    helperData.scope.canvas.setActiveObject(shape);
    helperData.scope.canvas.requestRenderAll();
    // updatehelperData.scope.canvasState();
  });

  text.on('mousedblclick', (e) => {
    if (!shape?.lockMovementX) {
      text.enterEditing();
    }
    helperData.scope.canvas.requestRenderAll();
  });

  shape.on('mousedown', (e) => {
    emitObjectMouseDown(shape, helperData);
    $('.link-icon').css({
      display: 'flex',
    });
    $('.view-link').css({
      display: 'none',
    });
    helperData.scope.canvas.bringToFront(shape);
    helperData.scope.canvas.bringToFront(text);

    let lockIndictionIcon = helperData.scope.canvas
      .getObjects()
      .find(
        (obj) => shape.UID === obj.UID && obj?.objType === 'lock-Indication'
      );
    helperData.scope.canvas.bringToFront(lockIndictionIcon);
    connectionData = [];
    scalingConnectionData = [];

    connectionData = connectionOfArrowOnMousedownHandler(
      shape,
      connectionData,
      helperData
    );
    scalingConnectionData = getScalingArrowMoveTogetherData(
      shape,
      connectionData,
      scalingConnectionData,
      helperData
    );

    if (text.isEditing) {
      text.exitEditing();
    }
    helperData.scope.canvas.requestRenderAll();
    toolbarPosHandler(
      toolbar,
      shape,
      helperData.scope.currentRatio,
      helperData
    );
  });

  shape.on('mousedblclick', (e) => {
    if (!shape?.lockMovementX) {
      text.enterEditing();
    }
    designToolbarHideHandler(helperData);
    helperData.scope.canvas.requestRenderAll();
  });

  shape.on('scaling', (e) => {
    let transformCenterPos = e.transform.target.getCenterPoint();
    let transformObj = e.transform.target;
    text.set({
      top: transformCenterPos.y,
      left: transformCenterPos.x,
      width: shape.scaleX * shape.width,
    });

    moveArrowTogetherWithShapeWhileScaling(
      transformObj,
      scalingConnectionData,
      helperData
    );

    text.setCoords();

    helperData.scope.canvas.requestRenderAll();
  });

  shape.on('scaled', (e) => {
    let transformCenterPos = e.transform.target.getCenterPoint();
    let transformObj = e.transform.target;

    text.set({
      top: transformCenterPos.y,
      left: transformCenterPos.x,
      width: shape.scaleX * shape.width,
    });

    moveArrowTogetherWithShapeWhileScaling(
      transformObj,
      scalingConnectionData,
      helperData
    );

    text.setCoords();

    helperData.scope.canvas.requestRenderAll();
  });

  shape.on('moving', (e) => {
    let transformCenterPos = e.transform.target.getCenterPoint();
    text.set({
      top: transformCenterPos.y,
      left: transformCenterPos.x,
    });
    text.setCoords();
    moveArrowTogetherWithShapeHandler(
      connectionData,
      transformCenterPos,
      helperData
    );
    if (shouldCallOnce) {
      removeControlPoints(helperData);
      shouldCallOnce = false;
    }
    helperData.scope.canvas.requestRenderAll();
  });

  shape.on('moved', (e) => {
    const transformedObj = e.transform.target;
    toolbarPosHandler(
      toolbar,
      shape,
      helperData.scope.currentRatio,
      helperData
    );
    // updatehelperData.scope.canvasState();
    // updateUndoRedoState([transformedObj, text]);
    shouldCallOnce = true;
  });
  shape.on('scaled', (e) => {
    // updatehelperData.scope.canvasState();
  });
  shape.on('rotated', (e) => {
    // updatehelperData.scope.canvasState();
  });
  shape.on('rotating', (e) => {
    text.set({
      angle: e.transform.target.angle,
    });

    text.setCoords();
    helperData.scope.canvas.requestRenderAll();
  });
};

export const containersEventManager = (
  container,
  text,
  line,
  rectLine,
  toolbar,
  helperData
) => {

  const { $ } = helperData;
  let matchedData = [];
  let scalingConnectionData = [];
  let containerCordinates;
  let containerWidthWithScale;
  let allContainerObjects;
  let connectionData = [];
  let shouldCallOnce = true;

  text.on('changed', (e) => {
    emitObjectModifying([text], helperData);
  });
  container.on('mousedown', (e) => {
    let containerIndex = helperData.scope.canvas.getObjects().indexOf(e.target);
    $('.link-icon').css({
      display: 'flex',
    });
    $('.view-link').css({
      display: 'none',
    });
    matchedData = [];
    allContainerObjects = [container, text, line];
    let originXY = helperData.scope.canvas.getPointer(e.e);
    let objectPos: any = {
      left: originXY.x,
      top: originXY.y,
    };
    connectionData = [];
    scalingConnectionData = [];
    createObjectOnMouseDown(e, objectPos, true, helperData);
    let centerPos = e?.target.getCenterPoint();
    containerCordinates = container.aCoords;
    containerWidthWithScale = centerPos.x + (centerPos.x - e.target.left);

    let xStart = containerCordinates.tl.x;
    let xEnd = containerCordinates.tr.x;
    let yStart = containerCordinates.tl.y;
    let yEnd = containerCordinates.bl.y;

    helperData.scope.canvas.getObjects().forEach((obj) => {
      let objectIndex = helperData.scope.canvas.getObjects().indexOf(obj);
      if (containerIndex < objectIndex) {
        if (isObjectIsShape(obj)) {
          let objCoords = obj.aCoords;
          if (
            objCoords.tl.x > xStart &&
            objCoords.tr.x < xEnd &&
            objCoords.tl.y > yStart &&
            objCoords.bl.y < yEnd
          ) {
            let allShapeWithText = [obj];
            let textObj = helperData.scope.canvas
              .getObjects()
              .find((ob) => ob?.UID === obj?.UID && ob?.type === 'textbox');
            allShapeWithText.push(textObj);
            allShapeWithText.forEach((obj) => {
              matchedData.push({
                diffX: obj.left - centerPos.x,
                diffY: obj.top - centerPos.y,
                object: obj,
              });
              let object = allContainerObjects.find((o) => {
                return o?.UID === obj.UID && o?.objType === obj.objType;
              });
              if (!object) {
                allContainerObjects.push(obj);
                // helperData.scope.canvas.bringToFront(obj);
              }
            });
          }
        } else if (obj.objType === 'container-rect') {
          let objCoords = obj.aCoords;
          if (
            objCoords.tl.x > xStart &&
            objCoords.tr.x < xEnd &&
            objCoords.tl.y > yStart &&
            objCoords.bl.y < yEnd
          ) {
            let allShapeWithText = [obj];
            let textObj = helperData.scope.canvas
              .getObjects()
              .find(
                (ob) => ob?.UID === obj?.UID && ob?.objType === 'container-text'
              );
            let lineObj = helperData.scope.canvas
              .getObjects()
              .find(
                (ob) => ob?.UID === obj?.UID && ob?.objType === 'container-line'
              );
            allShapeWithText.push(textObj);
            allShapeWithText.push(lineObj);
            allShapeWithText.forEach((obj) => {
              matchedData.push({
                diffX: obj.left - centerPos.x,
                diffY: obj.top - centerPos.y,
                object: obj,
              });
              let object = allContainerObjects.find((o) => {
                return o?.UID === obj.UID && o?.objType === obj.objType;
              });
              if (!object) {
                allContainerObjects.push(obj);
                // helperData.scope.canvas.bringToFront(obj);
              }
            });
          }
        } else if (
          obj.objType === 'uploaded-img' ||
          obj.objType === 'uploaded-gif' ||
          obj.objType === 'free-drawing'
        ) {
          let objCoords = obj.aCoords;
          if (
            objCoords.tl.x > xStart &&
            objCoords.tr.x < xEnd &&
            objCoords.tl.y > yStart &&
            objCoords.bl.y < yEnd
          ) {
            matchedData.push({
              diffX: obj.left - centerPos.x,
              diffY: obj.top - centerPos.y,
              object: obj,
            });
            let object = allContainerObjects.find((o) => {
              return o?.UID === obj.UID && o?.objType === obj.objType;
            });
            if (!object) {
              allContainerObjects.push(obj);
              // helperData.scope.canvas.bringToFront(obj);
            }
          }
        } else if (isObjectIsArrow(obj)) {
          let objCoords = obj.aCoords;
          if (
            objCoords.tl.x > xStart &&
            objCoords.tr.x < xEnd &&
            objCoords.tl.y > yStart &&
            objCoords.bl.y < yEnd
          ) {
            helperData.scope.canvas.getObjects().forEach((ob) => {
              if (obj?.UID === ob?.UID) {
                matchedData.push({
                  diffX: ob.left - centerPos.x,
                  diffY: ob.top - centerPos.y,
                  object: ob,
                });
                let object = allContainerObjects.find((o) => {
                  return o?.UID === ob.UID && o?.objType === ob.objType;
                });
                if (!object) {
                  allContainerObjects.push(ob);
                  // helperData.scope.canvas.bringToFront(obj);
                }
              }
            });
          }
        }
      }
    });

    connectionData = connectionOfArrowOnMousedownHandler(
      container,
      connectionData,
      helperData
    );

    let copyConnectionData = [];

    connectionData.forEach((obj) => {
      copyConnectionData.push({
        diffX: obj.diffX,
        diffY: obj.diffY,
        object: obj.object,
        status: obj.status,
        centerPos: obj.centerPos,
      });
    });

    matchedData.forEach((obj) => {
      if (isObjectIsArrow(obj.object)) {
        connectionData.forEach((ob) => {
          if (obj.object?.UID === ob?.object?.UID) {
            let anotherHead;
            if (ob?.object?.label === 'right-arrow') {
              anotherHead = matchedData.find(
                (p) =>
                  ob?.object?.UID === p?.object?.UID &&
                  p?.object?.label === 'left-arrow'
              );
            } else {
              anotherHead = matchedData.find(
                (p) =>
                  ob?.object?.UID === p?.object?.UID &&
                  p?.object?.label === 'right-arrow'
              );
            }
            if (anotherHead) {
              let index = copyConnectionData.findIndex((o) => {
                return (
                  ob?.object?.UID === o?.object?.UID &&
                  ob?.object?.objType === o?.object?.objType
                );
              });
              copyConnectionData.splice(index, 1);
            }
          }
        });
      }
    });

    connectionData = copyConnectionData;

    scalingConnectionData = getScalingArrowMoveTogetherData(
      container,
      connectionData,
      scalingConnectionData,
      helperData
    );
    toolbarPosHandler(
      toolbar,
      container,
      helperData.scope.currentRatio,
      helperData
    );
    removeControlPoints(helperData);
  });
  container.on('moving', (e) => {
    $('.link-icon').css({
      display: 'flex',
    });
    $('.view-link').css({
      display: 'none',
    });
    let transformedObject = e.transform.target;
    let centerPos = e.transform.target.getCenterPoint();
    helperData.scope.canvas.bringToFront(container);
    helperData.scope.canvas.bringToFront(text);
    helperData.scope.canvas.bringToFront(line);
    helperData.scope.canvas.getObjects().forEach((obj) => {
      if (
        obj?.objType !== 'container-rect' &&
        obj?.objType !== 'container-text' &&
        obj?.objType !== 'container-line'
      ) {
        helperData.scope.canvas.bringToFront(obj);
      }
    });
    let finalMatchedData = matchedData.filter((ob) => {
      helperData.scope.canvas.bringToFront(ob.object);
      if (ob.object.lockMovementX == true) {
        let lockIndictionIcon = helperData.scope.canvas
          .getObjects()
          .find(
            (obj) =>
              ob.object.UID === obj.UID && obj?.objType === 'lock-Indication'
          );
        helperData.scope.canvas.bringToFront(lockIndictionIcon);
      }
      return ob.object.selectMe;
    });
    if (finalMatchedData.length > 0) {
      finalMatchedData.forEach((data) => {
        data.object.set({
          left: centerPos.x + data.diffX,
          top: centerPos.y + data.diffY,
        });
        data.object.setCoords();
      });
    }

    moveArrowTogetherWithShapeHandler(connectionData, centerPos, helperData);

    removeControlPoints(helperData);

    line.set({
      x1: transformedObject.left,
      y1: transformedObject.top + rectLine,
      x2: centerPos.x + (centerPos.x - transformedObject.left),
      y2: transformedObject.top + rectLine,
    });
    text.set({
      top: container.top + rectLine / 2,
      left: centerPos.x,
    });
    line.setCoords();
    text.setCoords();
    helperData.scope.canvas.requestRenderAll();
    emitObjectMoving(
      {
        allContainerObjects,
        objType: 'container-rect',
        top: transformedObject.top,
        left: transformedObject.left,
      },
      helperData
    );
    moveEveryArrowUpInTheStack(helperData);
  });
  container.on('moved', (e) => {
    toolbarPosHandler(
      toolbar,
      container,
      helperData.scope.currentRatio,
      helperData
    );
    // updateCanvasState();
    shouldCallOnce = true;
    updateAllStraightArrowPoints(helperData);
  });
  container.on('scaling', (e) => {
    let transformedObject = e.transform.target;
    transformedObject.setCoords();
    let centerPosObj = e.transform.target.getCenterPoint();

    if (e.transform?.corner === 'tr' || e.transform?.corner === 'br') {
      let offsetX = centerPosObj.x - transformedObject.left;
      line.set({
        x1: centerPosObj.x - offsetX,
        y1: transformedObject.top + rectLine,
        x2: centerPosObj.x + offsetX,
        y2: transformedObject.top + rectLine,
      });
      text.set({
        top: container.top + rectLine / 2,
        left: centerPosObj.x,
        width: offsetX * 2 - 20,
      });
    } else if (e.transform?.corner === 'tl' || e.transform?.corner === 'bl') {
      let offsetX = containerWidthWithScale - centerPosObj.x;
      line.set({
        x1: centerPosObj.x - offsetX,
        y1: transformedObject.top + rectLine,
        x2: centerPosObj.x + offsetX,
        y2: transformedObject.top + rectLine,
      });
      text.set({
        top: container.top + rectLine / 2,
        left: centerPosObj.x,
        width: offsetX * 2 - 20,
      });
    }
    line.setCoords();
    text.setCoords();
    moveArrowTogetherWithShapeWhileScaling(
      transformedObject,
      scalingConnectionData,
      helperData
    );
  });
  container.on('scaled', (e) => {
    let transformedObject = e.transform.target;
    let centerPosObj = e.transform.target.getCenterPoint();
    if (e.transform?.corner === 'tr' || e.transform?.corner === 'br') {
      let offsetX = centerPosObj.x - transformedObject.left;
      line.set({
        x1: centerPosObj.x - offsetX,
        y1: transformedObject.top + rectLine,
        x2: centerPosObj.x + offsetX,
        y2: transformedObject.top + rectLine,
      });
    } else if (e.transform?.corner === 'tl' || e.transform?.corner === 'bl') {
      let offsetX = containerWidthWithScale - centerPosObj.x;
      line.set({
        x1: centerPosObj.x - offsetX,
        y1: transformedObject.top + rectLine,
        x2: centerPosObj.x + offsetX,
        y2: transformedObject.top + rectLine,
      });
      text.set({
        top: container.top + rectLine / 2,
        left: centerPosObj.x,
        width: offsetX * 2 - 20,
      });
    }
    moveArrowTogetherWithShapeWhileScaling(
      transformedObject,
      scalingConnectionData,
      helperData
    );
    line.setCoords();
    text.setCoords();
    // updateCanvasState();
  });
  container.on('rotated', (e) => {
    // updateCanvasState();
  });
  container.on('mousedblclick', (e) => {
    let originXY = helperData.scope.canvas.getPointer(e.e);
    let objectPos: any = {
      left: originXY.x,
      top: originXY.y,
    };
    createObjectOnDblClick(e, objectPos, true, helperData);
  });
};
