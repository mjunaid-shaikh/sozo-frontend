import { emitArrowHeadChange, emitModifiedArrow } from "../socket-events/socket-emit";
import { arrowWitdhChangeHandler, convertToBendArrowHandler, convertToStraightArrowHandler, createLeftArrowTypeOne, createLeftArrowTypeTwo, createRightArrowTypeOne, createRightArrowTypeTwo, getTwoArrowHeads, moveEveryControlPointUpInTheStack, removeLeftArrowHeadById, removeRightArrowHeadById, updateAngleAndPositionOfLeftArrowTypeOne, updateAngleAndPositionOfLeftArrowTypeTwo, updateAngleAndPositionOfRightArrowTypeOne, updateAngleAndPositionOfRightArrowTypeTwo } from "./arrow-helper";
import { objectOnCanvasExistOrNot, removeControlPoints } from "./general-helper";

export const arrowToolbarHandler = (arrow, arrowHeadObject,helperData) => {
    const {$} = helperData;
    const [start,end] = getTwoArrowHeads(arrow,helperData)
    let mainDrawingDiv = $('.canvas-container');
    let arrowToolbar = $(`<div class="arrow-toolbar" id=${arrow.UID}></div>`);

    // Arrow Toolbar Logo Icon Element
    let arrowToolbarLogo = $(`<div role="button" class="h-100 arrow-color-section"></div>`).css({
      width: '4rem',
      'border-right': '0.16rem solid #F5F5F5',
    }).css({cursor:"pointer"});

    let arrowToolbarLogoDiv = $(
      `<div class='h-100 w-100 center' data-toggle="dropdown"></div>`
    );
    let arrowToolbarLogoData = $(`<div class="arrow-color"></div>`).css({

      width: '1.65rem',
      height: '1.65rem',
      'border-radius': '50%',
      'background-color': 'black',
    });
    arrowToolbarLogoData.css({ 'background-color': arrow.stroke });
    arrowToolbarLogoDiv.append(arrowToolbarLogoData);

    //color changer dropdown
    let colorChangerDropdown = $(
      '<div class="dropdown-menu p-2" role="button" ></div>'
    ).addClass('colorchanger-dropdown-menu');

    let colorChangerDropdownMenuList = $(
      '<div class="d-flex flex-wrap" ></div>'
    );
    helperData.scope.drawingColorList.forEach((color) => {
      let colorlist = $('<div class="col-3 p-0 center color-list" ></div>').css(
        { height: '3rem' }
      );
      let colorlistDiv = $('<div></div>').css({
        'border-radius': '50%',
        'background-color': `${color}`,
        width: '1.6rem',
        height: '1.6rem',
      });

      colorlist.click(() => {
        $('.link-collapse').collapse('hide');
        arrow.set({
          stroke: color,
        });

        const [start,end] = getTwoArrowHeads(arrow,helperData)
        if (start) {
          start.set({
            stroke: color,
            fill: start.get('fill') === 'white' ? 'white' : color,
          });
        }
        if (end) {
          end.set({
            stroke: color,
            fill: end.get('fill') === 'white' ? 'white' : color,
          });
        }
        helperData.scope.canvas.requestRenderAll();
        arrowToolbarLogoData.css({ 'background-color': color });
        emitModifiedArrow([arrow,start,end],helperData)
      });
      colorlist.append(colorlistDiv);
      colorChangerDropdownMenuList.append(colorlist);
    });
    colorChangerDropdown.append(colorChangerDropdownMenuList);
    arrowToolbarLogo.append(arrowToolbarLogoDiv, colorChangerDropdown);

    // Arrow Toolbar Straight Arrow
    let arrowToolbarStraightArrow = $(
      `<div role="button" class="h-100 arrow-dashing-section"></div>`
    ).css({
      width: '6rem',
      'border-right': '0.16rem solid #F5F5F5',
    });
    let arrowToolbarStraightArrowDiv = $(
      '<div class="arrow-toolbar-straightarrow dropdown h-100"></div>'
    );
    let currentStraightArrowImage;
    if (arrow?.strokeDashArray.length > 0) {
      if (arrow?.strokeDashArray[0] === 20) {
        currentStraightArrowImage = $(
          '<img class="current-straightarrow-image" src="assets/img/Dashedline.svg"></img>'
        ).css({ width: '3.5rem' });
      } else if (arrow?.strokeDashArray[0] === 4) {
        currentStraightArrowImage = $(
          '<img class="current-straightarrow-image" src="assets/img/DottedLine.svg"></img>'
        ).css({ width: '3.5rem' });
      }
    } else {
      currentStraightArrowImage = $(
        '<img class="current-straightarrow-image" src="assets/img/StraightLine.svg"></img>'
      ).css({ width: '3.5rem' });
    }

    let straightArrowDataToggle = $(
      '<div class="dropdown-toggle center h-100" data-toggle="dropdown"></div>'
    );
    straightArrowDataToggle.append(currentStraightArrowImage);

    let straightArrowDropdownMenu = $(
      '<div class="dropdown-menu p-0 id="starightarrow-dropdown-menu"></div>'
    ).addClass('straightarrow-dropdown-menu');
    let straightArrowDropdownMenuList = $(
      '<div class="d-flex flex-column justify-content-between" ></div>'
    ).addClass('straightarrow-menulist');

    let straightArrowStraightLineDiv = $('<div class="center"></div>').css({
      height: '2rem',
      cursor: 'pointer',
    });
    straightArrowStraightLineDiv.click(() => {
      arrow.set({
        strokeDashArray: [],
      });
      helperData.scope.canvas.requestRenderAll();
      currentStraightArrowImage.attr('src', 'assets/img/StraightLine.svg');
      emitModifiedArrow([arrow,start,end],helperData)
    });
    let straightArrowStraightLineImage = $(
      '<img class="straight-line" src="assets/img/StraightLine.svg">'
    ).css({ width: '3rem' });
    straightArrowStraightLineDiv.append(straightArrowStraightLineImage);

    let straightArrowDashedLineDiv = $('<div class="center"></div>').css({
      height: '2rem',
      cursor: 'pointer',
    });
    straightArrowDashedLineDiv.click(() => {
      arrow.set({
        strokeDashArray: [20, 5],
      });
      helperData.scope.canvas.requestRenderAll();
      currentStraightArrowImage.attr('src', 'assets/img/Dashedline.svg');
      emitModifiedArrow([arrow,start,end],helperData)
    });
    let straightArrowDashedLineImage = $(
      '<img class="dashed-line" src="assets/img/Dashedline.svg">'
    ).css({ width: '3rem' });
    straightArrowDashedLineDiv.append(straightArrowDashedLineImage);

    let straightArrowDottedLineDiv = $('<div class="center"></div>').css({
      height: '2rem',
      cursor: 'pointer',
    });
    straightArrowDottedLineDiv.click(() => {
      arrow.set({
        strokeDashArray: [4, 5],
      });
      helperData.scope.canvas.requestRenderAll();
      currentStraightArrowImage.attr('src', 'assets/img/DottedLine.svg');
      emitModifiedArrow([arrow,start,end],helperData)
    });
    let straightArrowDottedLineImage = $(
      '<img class="dotted-line" src="assets/img/DottedLine.svg">'
    ).css({ width: '3rem' });
    straightArrowDottedLineDiv.append(straightArrowDottedLineImage);
    straightArrowDropdownMenuList.append(
      straightArrowStraightLineDiv,
      straightArrowDashedLineDiv,
      straightArrowDottedLineDiv
    );
    straightArrowDropdownMenu.append(straightArrowDropdownMenuList);
    arrowToolbarStraightArrowDiv.append(
      straightArrowDataToggle,
      straightArrowDropdownMenu
    );
    arrowToolbarStraightArrow.append(arrowToolbarStraightArrowDiv);

    //Arrow Toolbar Arrow Width Changer
    let arrowToolbarArrowWidthChanger = $(
      `<div role="button" class="h-100 arrow-strokewidth-section"></div>`
    ).css({
      width: '5rem',
      'border-right': '0.16rem solid #F5F5F5',
    });

    let arrowToolbarArrowWidthChangerDiv = $(
      '<div class="h-100" dropdown"></div>'
    );

    let arrowWidthChangerDataToggle = $(
      `<div class="dropdown-toggle center h-100 pixel-indicator" data-toggle="dropdown">${arrow.strokeWidth}px</div>`
    ).css({ 'font-size': '0.93rem' });
    let arrowWidthChangerDropdownMenu = $(
      '<div class="dropdown-menu p-0" ></div>'
    ).addClass('arrowwidth-changer-dropdown-menu');

    let arrowWidthChangerDropdownMenuList = $(
      '<div class="d-flex flex-column justify-content-between" ></div>'
    ).addClass('arrowwidth-changer-dropdown-menulist');
    helperData.scope.arrowStrokeWidth.forEach((stroke) => {
      let arrowWidthChangerDiffWidth = $(
        `<div class="center arrowwidth-changer-diffwidth">
        ${stroke + 'px'}
        </div>`
      ).css({ height: '2.2rem', cursor: 'pointer', 'font-size': '0.93rem' });
      arrowWidthChangerDiffWidth.click(() => {
        removeControlPoints(helperData);
        let strokeUpdated = parseInt(stroke);

        const arrowHeads = [
          helperData.scope.canvas
            .getObjects()
            .find((ob) => ob?.UID === arrow.UID && ob?.label === 'left-arrow'),
          helperData.scope.canvas
            .getObjects()
            .find((ob) => ob?.UID === arrow.UID && ob?.label === 'right-arrow'),
        ];
        arrowWitdhChangeHandler(arrow, arrowHeads, strokeUpdated,helperData);
        helperData.scope.canvas.requestRenderAll();
        arrowWidthChangerDataToggle.html(`${stroke}px`);
        emitModifiedArrow([arrow,start,end],helperData)
      });
      arrowWidthChangerDropdownMenuList.append(arrowWidthChangerDiffWidth);
    });
    arrowToolbarArrowWidthChangerDiv.append(
      arrowWidthChangerDataToggle,
      arrowWidthChangerDropdownMenu
    );
    arrowToolbarArrowWidthChanger.append(arrowToolbarArrowWidthChangerDiv);

    arrowWidthChangerDropdownMenu.append(arrowWidthChangerDropdownMenuList);

    //Arrow Toolbar Bend Arrow

    let arrowToolbarBendArrow = $(
      `<div role="button" class="h-100 arrow-bend-section"></div>`
    ).css({
      width: '4rem',
      'border-right': '0.16rem solid #F5F5F5',
    });

    let arrowToolbarBendArrowDiv = $(
      '<div class="arrow-toolbar-bendarrow dropdown h-100"></div>'
    );

    let bendArrowDataToggle = $(
      '<div class="bendarrow-datatoggle center h-100" data-toggle="dropdown"></div>'
    ).css({ cursor: 'pointer' });

    let currentBendArrowImage = $(
      '<img class="current-bendarrow-image" src="assets/img/BendArrowLogo.svg"></img>'
    ).css({ width: '1.5rem' });
    bendArrowDataToggle.append(currentBendArrowImage);

    let bendArrowDropdownMenu = $(
      '<div class="dropdown-menu p-0" ></div>'
    ).addClass('bendarrow-dropdown-menu');
    let bendArrowDropdownMenuList = $(
      '<div class="d-flex justify-content-between" ></div>'
    ).addClass('bendarrow-menulist');

    let bendArrowZShapeArrowDiv = $('<div class="center"></div>').css({
      width: '3.3rem',
      height: '3rem',
      cursor: 'pointer',
    });
    let bendArrowZShapeArrowImage = $(
      '<img class="bendarrow-zshapearrow" src="assets/img/BendArrowZShape.svg">'
    ).css({ width: '1.5rem' });
    bendArrowZShapeArrowDiv.append(bendArrowZShapeArrowImage);

    let bendArrowCurveShapeArrowDiv = $('<div class="center"></div>').css({
      width: '3.3rem',
      height: '3rem',
      cursor: 'pointer',
    });
    let bendArrowCurveShapeArrowImage = $(
      '<img class="bendarrow-curveshapearrow" src="assets/img/BendArrowCurveShape.svg">'
    ).css({ width: '1.5rem' });
    bendArrowCurveShapeArrowDiv.append(bendArrowCurveShapeArrowImage);

    let bendArrowStraightShapeArrowDiv = $('<div class="center"></div>').css({
      width: '3.3rem',
      height: '3rem',
      cursor: 'pointer',
    });

    let bendArrowStraightShapeArrowImage = $(
      '<img class="bendarrow-straightarrow" src="assets/img/BendArrowStraightShape.svg">'
    ).css({ width: '1.5rem' });

    bendArrowStraightShapeArrowDiv.append(bendArrowStraightShapeArrowImage);
    bendArrowZShapeArrowDiv.click(() => {
      convertToBendArrowHandler(arrow,helperData);
    });

    bendArrowStraightShapeArrowDiv.click(() => {
      convertToStraightArrowHandler(arrow,helperData);
    });

    bendArrowCurveShapeArrowDiv.click(() => {
      // convertToCurveArrowHandler(arrow);
    });
    bendArrowDropdownMenuList.append(
      bendArrowZShapeArrowDiv,
      // bendArrowCurveShapeArrowDiv, 
      bendArrowStraightShapeArrowDiv
    );
    bendArrowDropdownMenu.append(bendArrowDropdownMenuList);

    arrowToolbarBendArrowDiv.append(bendArrowDataToggle, bendArrowDropdownMenu);
    arrowToolbarBendArrow.append(arrowToolbarBendArrowDiv);

    if (arrow.objType === 'straight-arrow-line') {
      bendArrowStraightShapeArrowDiv.addClass('arrow-active');
    } else if (arrow.objType === 'z-arrow-line') {
      bendArrowZShapeArrowDiv.addClass('arrow-active');
    } else if (arrow.objType === 'curve-arrow-line') {
      bendArrowCurveShapeArrowDiv.addClass('arrow-active');
    }

    //Arrow Toolbar Left Arrow
    let arrowToolbarLeftPointedArrow = $(
      `<div role="button" class="h-100 arrow-left-section"></div>`
    ).css({
      width: '6rem',
      'border-right': '0.16rem solid #F5F5F5',
    });
    let arrowToolbarLeftPointedArrowDiv = $(
      '<div class="arrow-toolbar-leftarrow dropdown h-100"></div>'
    );

    let currentLeftPointedArrowImage;
    if(!start){
      currentLeftPointedArrowImage = $(
          '<div class="leftarrow-none">None</div>'
        ).css({ 'font-size': '0.93rem' });
    }else {
      if(start?.fill === "white"){
        currentLeftPointedArrowImage = $(
          '<img class="leftpointedarrow-type2" src="assets/img/ArrLeft2.svg">'
        ).css({ width: '3rem' });
      }else {
        currentLeftPointedArrowImage = $(
          '<img class="leftpointedarrow-type1" src="assets/img/ArrLeft1.svg">'
        ).css({ width: '3rem' });
      }
    }

    let leftPointedArrowDataToggle = $(
      '<div class="dropdown-toggle leftpointedarrow-datatoggle h-100 center" data-toggle="dropdown"></div>'
    ).css({ cursor: 'pointer' });
    leftPointedArrowDataToggle.append(currentLeftPointedArrowImage);

    let leftPointedArrowDropdownMenu = $(
      '<div class="dropdown-menu p-0" ></div>'
    ).addClass('leftpointedarrow-dropdown-menu');
    let leftPointedArrowDropdownMenuList = $(
      '<div class="d-flex flex-column justify-content-between" ></div>'
    ).addClass('leftpointedarrow-menulist');

    let leftPointedArrowTypeNoneDiv = $('<div class="center"></div>').css({
      height: '2rem',
      cursor: 'pointer',
    });
    let leftPointedArrowTypeNoneDivItem = $(
      '<div class="leftarrow-none">None</div>'
    ).css({
      'font-size': '0.93rem',
    });
    leftPointedArrowTypeNoneDiv.click(() => {

      leftPointedArrowDataToggle.find('img').remove();
      leftPointedArrowDataToggle.find('div').remove();
      let changedLeftArrowDivText = $(
        '<div class="leftarrow-none">None</div>'
      ).css({ 'font-size': '0.93rem' });
      leftPointedArrowDataToggle.append(changedLeftArrowDivText);
      removeLeftArrowHeadById(arrow.UID,helperData);
      helperData.scope.canvas.requestRenderAll();
      const [headOne,headTwo] = getTwoArrowHeads(arrow,helperData)
      emitArrowHeadChange([arrow,headOne,headTwo],'left-none',helperData)
    });
    leftPointedArrowTypeNoneDiv.append(leftPointedArrowTypeNoneDivItem);

    let leftPointedArrowType1Div = $('<div class="center"></div>').css({
      height: '2rem',
      cursor: 'pointer',
    });
    let leftPointedArrowType1Image = $(
      '<img class="leftpointedarrow-type1" src="assets/img/ArrLeft1.svg">'
    ).css({ width: '3rem' });
    leftPointedArrowType1Div.click(() => {
      leftPointedArrowDataToggle.find('img').remove();
      leftPointedArrowDataToggle.find('div').remove();

      // Setting Image to the Left Pointed Arrow section on Arrow Toolbar
      let changedLeftArrowImage = $(
        '<img class="current-leftarrow-image" src="assets/img/ArrLeft1.svg"></img>'
      ).css({ width: '3rem' });
      leftPointedArrowDataToggle.append(changedLeftArrowImage);

      let existance = objectOnCanvasExistOrNot(
        arrow.UID,
        'arrow-head-start-type-one',
        helperData
      );

      if (!existance) {
        removeLeftArrowHeadById(arrow.UID,helperData);
        let arrowHead = createLeftArrowTypeOne(arrow,helperData);
        updateAngleAndPositionOfLeftArrowTypeOne(arrowHead, arrow,helperData);
        moveEveryControlPointUpInTheStack(helperData);
        helperData.scope.canvas.requestRenderAll();
        const [headOne,headTwo] = getTwoArrowHeads(arrow,helperData)
        emitArrowHeadChange([arrow,headOne,headTwo],'left-one',helperData)
      }
    });
    leftPointedArrowType1Div.append(leftPointedArrowType1Image);

    let leftPointedArrowType2Div = $('<div class="center"></div>').css({
      height: '2rem',
      cursor: 'pointer',
    });
    let leftPointedArrowType2Image = $(
      '<img class="leftpointedarrow-type2" src="assets/img/ArrLeft2.svg">'
    ).css({ width: '3rem' });

    leftPointedArrowType2Div.click(() => {
      leftPointedArrowDataToggle.find('img').remove();
      leftPointedArrowDataToggle.find('div').remove();

      // Setting Image to the Left Pointed Arrow section on Arrow Toolbar
      let changedLeftArrowImage = $(
        '<img class="current-leftarrow-image" src="assets/img/ArrLeft2.svg"></img>'
      ).css({ width: '3rem' });
      leftPointedArrowDataToggle.append(changedLeftArrowImage);
      let existance = objectOnCanvasExistOrNot(
        arrow.UID,
        'arrow-head-start-type-two',
        helperData
      );

      if (!existance) {
        removeLeftArrowHeadById(arrow.UID,helperData);
        let arrowHead = createLeftArrowTypeTwo(arrow,helperData);
        updateAngleAndPositionOfLeftArrowTypeTwo(arrowHead, arrow,helperData);
        moveEveryControlPointUpInTheStack(helperData);
        helperData.scope.canvas.requestRenderAll();
        const [headOne,headTwo] = getTwoArrowHeads(arrow,helperData)
      emitArrowHeadChange([arrow,headOne,headTwo],'left-two',helperData)
      }
    });
    leftPointedArrowType2Div.append(leftPointedArrowType2Image);

    let leftPointedArrowType3Div = $('<div class="center"></div>').css({
      height: '2rem',
      cursor: 'pointer',
    });
    let leftPointedArrowType3Image = $(
      '<img class="leftpointedarrow-type3" src="assets/img/ArrLeft3.svg">'
    ).css({ width: '3rem' });
    leftPointedArrowType3Div.click(() => {
      leftPointedArrowDataToggle.find('img').remove();
      leftPointedArrowDataToggle.find('div').remove();

      // Setting Image to the Left Pointed Arrow section on Arrow Toolbar
      let changedLeftArrowImage = $(
        '<img class="current-leftarrow-image" src="assets/img/ArrLeft3.svg"></img>'
      ).css({ width: '3rem' });
      leftPointedArrowDataToggle.append(changedLeftArrowImage);
      let existance = objectOnCanvasExistOrNot(
        arrow.UID,
        'arrow-head-start-type-three',
        helperData
      );

      if (!existance) {
        // removeLeftArrowHeadById(arrow.UID)
        // let arrowHead = createLeftArrowTypeTwo(arrow)
        // updateAngleAndPositionOfLeftArrowTypeOne(arrowHead,arrow)
        // canvas.requestRenderAll();
      }
    });
    leftPointedArrowType3Div.append(leftPointedArrowType3Image);
    if (arrow?.objType === 'straight-arrow-line') {
      leftPointedArrowDropdownMenuList.append(
        leftPointedArrowTypeNoneDiv,
        leftPointedArrowType1Div,
        leftPointedArrowType2Div,
        // leftPointedArrowType3Div
      );
    } else {
      leftPointedArrowDropdownMenuList.append(
        leftPointedArrowType1Div,
        leftPointedArrowType2Div,
        // leftPointedArrowType3Div
      );
    }

    leftPointedArrowDropdownMenu.append(leftPointedArrowDropdownMenuList);

    arrowToolbarLeftPointedArrowDiv.append(
      leftPointedArrowDataToggle,
      leftPointedArrowDropdownMenu
    );
    arrowToolbarLeftPointedArrow.append(arrowToolbarLeftPointedArrowDiv);

    //Arrow Toolbar Right Arrow
    let arrowToolbarRightPointedArrow = $(
      `<div role="button" class="h-100 arrow-right-section"></div>`
    ).css({
      width: '6rem',
      'border-right': '0.16rem solid #F5F5F5',
    });
    let arrowToolbarRightPointedArrowDiv = $(
      '<div class="arrow-toolbar-rightarrow dropdown h-100"></div>'
    );
 
    let currentRightPointedArrowImage 
    if(!end){
      currentRightPointedArrowImage = $(
          '<div class="rightArrow-none">None</div>'
        ).css({ 'font-size': '0.93rem' });
    }else {
      if(end?.fill === "white"){
        currentRightPointedArrowImage = $(
          '<img class="rightpointedarrow-type2" src="assets/img/ArrRight2.svg">'
        ).css({ width: '3rem' });
      }else {
        currentRightPointedArrowImage = $(
          '<img class="rightpointedarrow-type1" src="assets/img/ArrRight1.svg">'
        ).css({ width: '3rem' });
      }
    }

    let rightPointedArrowDataToggle = $(
      '<div class="dropdown-toggle rightpointedarrow-datatoggle h-100 center" data-toggle="dropdown"></div>'
    );
    rightPointedArrowDataToggle.append(currentRightPointedArrowImage);

    let rightPointedArrowDropdownMenu = $(
      '<div class="dropdown-menu p-0" ></div>'
    ).addClass('rightpointedarrow-dropdown-menu');
    let rightPointedArrowDropdownMenuList = $(
      '<div class="d-flex flex-column justify-content-between" ></div>'
    ).addClass('rightpointedarrow-menulist');

    let rightPointedArrowTypeNoneDiv = $('<div class="center"></div>').css({
      height: '2rem',
      cursor: 'pointer',
    });
    let rightPointedArrowTypeNoneDivItem = $(
      '<div class="rightArrow-none" >None</div>'
    ).css({
      'font-size': '0.93rem',
    });
    rightPointedArrowTypeNoneDiv.append(rightPointedArrowTypeNoneDivItem);
    rightPointedArrowTypeNoneDiv.click(() => {
      // Setting None to the Left Pointed Arrow section on Arrow Toolbar
      rightPointedArrowDataToggle.find('img').remove();
      rightPointedArrowDataToggle.find('div').remove();
      let changedRightArrowDivText = $(
        '<div class="rightArrow-none">None</div>'
      ).css({ 'font-size': '0.93rem' });
      rightPointedArrowDataToggle.append(changedRightArrowDivText);
      removeRightArrowHeadById(arrow.UID,helperData);
      helperData.scope.canvas.requestRenderAll();
      const [headOne,headTwo] = getTwoArrowHeads(arrow,helperData)
      emitArrowHeadChange([arrow,headOne,headTwo],'right-none',helperData)
    });
    let rightPointedArrowType1Div = $('<div class="center"></div>').css({
      height: '2rem',
      cursor: 'pointer',
    });
    let rightPointedArrowType1Image = $(
      '<img class="rightpointedarrow-type1" src="assets/img/ArrRight1.svg">'
    ).css({ width: '3rem' });
    rightPointedArrowType1Div.append(rightPointedArrowType1Image);

    rightPointedArrowType1Div.click(() => {
      rightPointedArrowDataToggle.find('img').remove();
      rightPointedArrowDataToggle.find('div').remove();

      // Setting Image to the Right Pointed Arrow section on Arrow Toolbar
      let changedRightArrowImage = $(
        '<img class="current-rightarrow-image" src="assets/img/ArrRight1.svg"></img>'
      ).css({ width: '3rem' });
      rightPointedArrowDataToggle.append(changedRightArrowImage);
      let existance = objectOnCanvasExistOrNot(
        arrow.UID,
        'arrow-head-end-type-one'
        ,helperData
      );

      if (!existance) {
        removeRightArrowHeadById(arrow.UID,helperData);
        let arrowHead = createRightArrowTypeOne(arrow,helperData);
        updateAngleAndPositionOfRightArrowTypeOne(arrowHead, arrow,helperData);
        moveEveryControlPointUpInTheStack(helperData);
        helperData.scope.canvas.requestRenderAll();
        const [headOne,headTwo] = getTwoArrowHeads(arrow,helperData)
        emitArrowHeadChange([arrow,headOne,headTwo],'right-one',helperData)
      }
    });

    let rightPointedArrowType2Div = $('<div class="center"></div>').css({
      height: '2rem',
      cursor: 'pointer',
    });
    let rightPointedArrowType2Image = $(
      '<img class="rightpointedarrow-type2" src="assets/img/ArrRight2.svg">'
    ).css({ width: '3rem' });
    rightPointedArrowType2Div.append(rightPointedArrowType2Image);

    rightPointedArrowType2Div.click(() => {
      rightPointedArrowDataToggle.find('img').remove();
      rightPointedArrowDataToggle.find('div').remove();

      // Setting Image to the Right Pointed Arrow section on Arrow Toolbar
      let changedRightArrowImage = $(
        '<img class="current-rightarrow-image" src="assets/img/ArrRight2.svg"></img>'
      ).css({ width: '3rem' });
      rightPointedArrowDataToggle.append(changedRightArrowImage);
      let existance = objectOnCanvasExistOrNot(
        arrow.UID,
        'arrow-head-end-type-two',
        helperData
      );
      if (!existance) {
        removeRightArrowHeadById(arrow.UID,helperData);
        let arrowHead = createRightArrowTypeTwo(arrow,helperData);
        updateAngleAndPositionOfRightArrowTypeTwo(arrowHead, arrow,helperData);
        moveEveryControlPointUpInTheStack(helperData);
        helperData.scope.canvas.requestRenderAll();
        const [headOne,headTwo] = getTwoArrowHeads(arrow,helperData)
        emitArrowHeadChange([arrow,headOne,headTwo],'right-two',helperData)
      }
    });

    let rightPointedArrowType3Div = $('<div class="center"></div>').css({
      height: '2rem',
      cursor: 'pointer',
    });
    let rightPointedArrowType3Image = $(
      '<img class="rightpointedarrow-type3" src="assets/img/ArrRight3.svg">'
    ).css({ width: '3rem' });
    rightPointedArrowType3Div.append(rightPointedArrowType3Image);

    rightPointedArrowType3Div.click(() => {
      rightPointedArrowDataToggle.find('img').remove();
      rightPointedArrowDataToggle.find('div').remove();

      // Setting Image to the Right Pointed Arrow section on Arrow Toolbar
      let changedRightArrowImage = $(
        '<img class="current-rightarrow-image" src="assets/img/ArrRight3.svg"></img>'
      ).css({ width: '3rem' });
      rightPointedArrowDataToggle.append(changedRightArrowImage);
      let existance = objectOnCanvasExistOrNot(
        arrow.UID,
        'arrow-head-end-type-three',
        helperData
      );

      if (!existance) {
        // removeRightArrowHeadById(arrow.UID)
        // canvas.add(arrowHeadObject.type3[1])
        // canvas.requestRenderAll();
      }
    });
    if (arrow?.objType === 'straight-arrow-line') {
      rightPointedArrowDropdownMenuList.append(
        rightPointedArrowTypeNoneDiv,
        rightPointedArrowType1Div,
        rightPointedArrowType2Div,
        // rightPointedArrowType3Div
      );
    } else {
      rightPointedArrowDropdownMenuList.append(
        rightPointedArrowType1Div,
        rightPointedArrowType2Div,
        // rightPointedArrowType3Div
      );
    }

    rightPointedArrowDropdownMenu.append(rightPointedArrowDropdownMenuList);

    arrowToolbarRightPointedArrowDiv.append(
      rightPointedArrowDataToggle,
      rightPointedArrowDropdownMenu
    );
    arrowToolbarRightPointedArrow.append(arrowToolbarRightPointedArrowDiv);

    //Arrow Lock Icon
    let arrowToolbarLockIcon = $(`<div role="button"></div>`).css({
      width: '4rem',
    });
    let arrowToolbarLockIconDiv = $(
      '<div class="arrow-lock-section h-100 center"></div>'
    );

    let arrowToolbarLockIconImage = $(
      '<img class="current-lockicon-image" src="assets/img/ArrowToolbarLockIcon.svg"></img>'
    ).css({ width: '1.25rem' });
    arrowToolbarLockIconDiv.click(() => {
      removeControlPoints(helperData)
      let arrowLock = helperData.scope.canvas.getActiveObjects();
      if (arrowLock) {
        if (arrowLock[0].get('lockMovementX', 'lockMovementY') == false) {
          arrowLock[0].set('lockMovementX', true);
          arrowLock[0].set('lockMovementY', true);
          arrowLock[0].set('cornerStrokeColor', 'red');
          arrowLock[0].set('borderColor', 'red');
          arrowLock[0].set('cornerColor', '#87CEFA');
          arrowLock[0].set('lockScalingX', true);
          arrowLock[0].set('lockScalingY', true);
          arrowLock[0].set('lockRotation', true);
          arrowToolbarLogo.css({ display: 'none' });
          arrowToolbarStraightArrow.css({ display: 'none' });
          arrowToolbarArrowWidthChanger.css({ display: 'none' });
          arrowToolbarBendArrow.css({ display: 'none' });
          arrowToolbarLeftPointedArrow.css({ display: 'none' });
          arrowToolbarRightPointedArrow.css({ display: 'none' });
          arrowToolbar.css({ display: 'none' });
          arrowToolbar.css({ width: '4rem' });
          arrowToolbarLockIconDiv.css({ 'background-color': '#FA8072' });
          arrow.set('selectMe', false);
          start && start.set('selectMe',false)
          end && end.set('selectMe',false)
        } else {
          arrowLock[0].set('lockMovementX', false);
          arrowLock[0].set('lockMovementY', false);
          arrowLock[0].set('cornerStrokeColor', '#137EF9');
          arrowLock[0].set('borderColor', '#137EF9');
          arrowLock[0].set('cornerColor', '#87CEFA');
          arrowLock[0].set('lockScalingX', false);
          arrowLock[0].set('lockScalingY', false);
          arrowLock[0].set('lockRotation', false);
          arrowToolbarLogo.css({ display: 'block' });
          arrowToolbarStraightArrow.css({ display: 'block' });
          arrowToolbarArrowWidthChanger.css({ display: 'block' });
          arrowToolbarBendArrow.css({ display: 'block' });
          arrowToolbarLeftPointedArrow.css({ display: 'block' });
          arrowToolbarRightPointedArrow.css({ display: 'block' });
          arrowToolbar.css({ display: 'none' });
          arrowToolbar.css({ width: '35rem' });
          arrowToolbarLockIconDiv.css({ 'background-color': 'white' });
          arrow.set('selectMe', true);
          start && start.set('selectMe',true)
          end && end.set('selectMe',true)
        }
        // updateCanvasState();
        helperData.scope.shouldSavedWithImage && helperData.scope.saveMsg();
        helperData.scope.canvas.renderAll();
        emitModifiedArrow([arrow,start,end],helperData)
      }
    });

    arrowToolbarLockIconDiv.append(arrowToolbarLockIconImage);
    arrowToolbarLockIcon.append(arrowToolbarLockIconDiv);

    arrowToolbar.append(
      arrowToolbarLogo,
      arrowToolbarStraightArrow,
      arrowToolbarArrowWidthChanger,
      arrowToolbarBendArrow,
      arrowToolbarLeftPointedArrow,
      arrowToolbarRightPointedArrow,
      arrowToolbarLockIcon
    );

    mainDrawingDiv.append(arrowToolbar);
    return arrowToolbar;
  }