import {convertCanvasDataToJson,isObjectIsShape, randomColor} from '../helper-function/general-helper'
export const emitObjectDeleteShapeChange = (data,helperData)=> {
    const Objects = convertCanvasDataToJson(helperData);
    let shapeObjects = [];
    data.forEach((obj) => {
      Objects.objects.forEach((ob) => {
        if (obj?.UID === ob?.UID && obj?.objType === ob?.objType) {
          shapeObjects.push(ob);
        }
      });
    });
    if (shapeObjects.length > 0) {
        helperData.scope.SSS.socket.emit('delete:shape:change', shapeObjects);
    }
  }
  
  export const emitObjectShapeChange = (data,helperData)=>{

    
    const Objects = convertCanvasDataToJson(helperData);
    let shapeObjects = [];
    data.forEach((obj) => {
      Objects.objects.forEach((ob) => {
        if (obj?.UID === ob?.UID && obj?.objType === ob?.objType) {
          shapeObjects.push(ob);
        }
      });
    });
    if (shapeObjects.length > 0) {
        helperData.scope.SSS.socket.emit('shape:change', [shapeObjects, data[2]]);
    }
  }

  export const emitObjectModifying = (data,helperData) => {
    const objects = convertCanvasDataToJson(helperData);

    if (data[0]?.objType === 'textOnly') {
      let object = objects.objects.find(
        (obj) => obj?.UID === data[1]?.UID && obj?.objType === data[1]?.objType
      );
      helperData.scope.SSS.socket.emit('object:modifying', [
        { objType: 'textOnly' },
        object,
      ]);
      return;
    }
    if (data.length === 1) {
    //  console.log("first called");
     
      objects.objects.forEach((ob) => {
        if (ob?.UID === data[0]?.UID && ob?.type === data[0]?.type) {
          helperData.scope.SSS.socket.emit('object:modifying', [ob]);
        }
      });
    } else if (data.length === 2 || data.length === 3) {
      // console.log("secound cllaed");
      let filteredObjects = [];
      data.forEach((obj) => {
        objects.objects.forEach((ob) => {
          if (obj?.UID === ob?.UID && obj?.objType === ob?.objType) {
            filteredObjects.push(ob);
          }
        });
      });

    
      helperData.scope.SSS.socket.emit('object:modifying', filteredObjects);
    }
  }

  export const getEmitFilteredArrowData = (arrowData,helperData)=>{
    const Objects = convertCanvasDataToJson(helperData);
    let filteredObjects = []
    arrowData.forEach(obj=>{
      if(!obj) return; 
      Objects.objects.forEach(ob=>{
        if(ob?.UID === obj?.UID && ob?.objType === obj?.objType){
          filteredObjects.push(ob)
        }
      })
    })
    return filteredObjects;
  }

  export const emitArrowResize = (arrowData,helperData) => {
    const filteredObjects = getEmitFilteredArrowData(arrowData.objects,helperData)
    helperData.scope.SSS.socket.emit('arrow:control:resize',{objects:filteredObjects,pointers:arrowData.pointers,type:arrowData.type})
  }

  export const emitObjectMoving = (e,helperData) => {
    const Objects = convertCanvasDataToJson(helperData);
    if (e?.target?.objType === 'free-drawing') {
      let filteredObejcts = Objects.objects.find(
        (obj) => obj?.UID === e?.target?.UID
      );
      helperData.scope.SSS.sendingCanvasData('object:moving', filteredObejcts);
    }
    if (
      isObjectIsShape(e?.target)
    ) {
      let filteredObejcts = Objects.objects.filter(
        (obj) => obj?.UID === e?.target?.UID
      );
      helperData.scope.SSS.sendingCanvasData('object:moving', filteredObejcts);
      return;
    }

    if (e?.objType === 'container-rect') {
      let containerObject = [];
      Objects.objects.forEach((obj) => {
        e.allContainerObjects.forEach((ob) => {
          if (ob?.UID === obj?.UID && ob?.objType === obj?.objType) {
            containerObject.push(obj);
          }
        });
      });

      helperData.scope.SSS.sendingCanvasData('object:moving', {
        groupObjects: containerObject,
        top: e.top,
        left: e.left,
      });
      return;
    }
    if (e?.target?.objType === 'selected-all') {
      let allObjects = [];
      e?.target?._objects.forEach((el) => {
        Objects.objects.forEach((obj) => {
          if (el?.UID === obj?.UID && el?.objType === obj?.objType) {
            allObjects.push(obj);
          }
        });
      });
      helperData.scope.SSS.sendingCanvasData('object:moving', {
        allObjects,
        top: e.target.top,
        left: e.target.left,
      });
      return;
    }
  }

  export const emitObjectMouseDown = (data,helperData) => {
    helperData.scope.SSS.socket.emit('object:mousedown', {
      UID: data.UID,
      objType: data.objType,
    });
  }

  export const emitObjectAdded = (data,helperData) => {
    const objects = convertCanvasDataToJson(helperData);
    if (data[0]?.objType === 'textarea') {
      let filteredObject = objects.objects.find((element) => {
        return element.UID === data[0].UID;
      });
      helperData.scope.SSS.socket.emit('object:added', filteredObject);
      return;
    }
    if (data?.objType === 'container') {
      let containerObjects = [];
      data.objects.forEach((obj) => {
        objects.objects.forEach((ob) => {
          if (ob?.UID === obj?.UID && ob?.objType === obj?.objType) {
            containerObjects.push(ob);
          }
        });
      });
      helperData.scope.SSS.socket.emit('object:added', {
        objType: 'container',
        objects: containerObjects,
      });
    } else {
      let filteredObjects = objects.objects.filter((element) => {
        return element.UID === data[0].UID;
      });
      helperData.scope.SSS.socket.emit('object:added', filteredObjects);
    }
  }
  export const emitObjectRemoved = (UID,helperData) =>  {
    helperData.scope.SSS.socket.emit('object:removed', UID);
  }

  export const emitObjectImageRotated = (image,helperData) => {
    const Objects = convertCanvasDataToJson(helperData);
    let matchedImage = Objects.objects.find((obj) => obj?.UID === image.UID);
    helperData.scope.SSS.socket.emit('image:rotated', matchedImage);
  }

  export const emitModifiedArrow = (arrowData,helperData) => {
    const filteredObjects = getEmitFilteredArrowData(arrowData,helperData)
    helperData.scope.SSS.socket.emit('arrow:modified',filteredObjects)
  }

  export const emitArrowConverted = (arrowData,helperData) => {
    const filteredObjects = getEmitFilteredArrowData(arrowData,helperData)
    helperData.scope.SSS.socket.emit('arrow:converted',filteredObjects)
  }

  export const emitArrowHeadChange = (arrowData,target,helperData)=>{
    const filteredObjects = getEmitFilteredArrowData(arrowData,helperData)
    helperData.scope.SSS.socket.emit('arrow:head:change',{objects:filteredObjects,target:target})
  }

  export const emitMovedArrow = (arrowData,helperData)=>{
    const filteredObjects = getEmitFilteredArrowData(arrowData,helperData)
    helperData.scope.SSS.socket.emit('arrow:moved',filteredObjects)
  }

  export const emitCreatedArrow = (arrowData,helperData) => {
    const filteredObjects = getEmitFilteredArrowData(arrowData,helperData)
    helperData.scope.SSS.socket.emit('arrow:created',filteredObjects)
  }

  export const emitObjectImageModifying = (image,helperData) => {
    const Objects = convertCanvasDataToJson(helperData);
    let matchedImage = Objects.objects.find((obj) => obj?.UID === image.UID);
    helperData.scope.SSS.socket.emit('image:modifying', matchedImage);
  }

  export const emitObjectImageMoving = (image,helperData) => {
    const Objects = convertCanvasDataToJson(helperData);
    let matchedImage = Objects.objects.find((obj) => obj?.UID === image.UID);
    helperData.scope.SSS.socket.emit('image:moved', matchedImage);
  }

  export const emitObjectImageAdded = (image,helperData) => {
    const Objects = convertCanvasDataToJson(helperData);
    let matchedImage = Objects.objects.find((obj) => obj?.UID === image.UID);
    helperData.scope.SSS.socket.emit('image:add', matchedImage);
  }

  export const emitCanvasComments = (helperData) => {
    let dataToSent = JSON.stringify({
      objects: convertCanvasDataToJson(helperData),
      comments: helperData.scope.whiteboardCommentsAllData,
    });
    helperData.scope.SSS.socket.emit('object:undo:redo', dataToSent);
  }

  export const emitCommentedObject = (object,helperData) => {
    let Objects = convertCanvasDataToJson(helperData);
    if (
      isObjectIsShape(object)
    ) {
      let shape = Objects.objects.find(
        (ob) => ob?.UID === object.UID && ob?.objType === object.objType
      );
      let text = Objects.objects.find(
        (ob) => ob?.UID === object.UID && ob?.type === 'textbox'
      );
      helperData.scope.SSS.socket.emit('commented-object', [shape, text]);
    } else if (object?.objType === 'container-rect') {
      let shape = Objects.objects.find(
        (ob) => ob?.UID === object.UID && ob?.objType === object.objType
      );
      let text = Objects.objects.find(
        (ob) => ob?.UID === object.UID && ob?.type === 'textbox'
      );
      let line = Objects.objects.find(
        (ob) => ob?.UID === object.UID && ob?.objType === 'container-line'
      );
      helperData.scope.SSS.socket.emit('commented-object', [shape, text, line]);
    } else if (object?.objType === 'uploaded-img') {
      let image = Objects.objects.find(
        (ob) => ob?.UID === object.UID && ob?.objType === object.objType
      );
      helperData.scope.SSS.socket.emit('commented-object', [image]);
    } else if (object?.objType === 'uploaded-gif') {
      let gif = Objects.objects.find(
        (ob) => ob?.UID === object.UID && ob?.objType === object.objType
      );
      helperData.scope.SSS.socket.emit('commented-object', [gif]);
    }
  }

 export const emitObjectScalling = (Obj,helperData) => {
  const Objects = convertCanvasDataToJson(helperData);
  if (Obj?.objType === 'textarea') {
    let filteredObjects = Objects.objects.find((ob) => ob?.UID === Obj?.UID);
    helperData.scope.SSS.socket.emit('object:scalling', filteredObjects);
    return;
  }
  if (
    isObjectIsShape(Obj)

  ) {
    let filteredObjects = Objects.objects.filter(
      (ob) => ob?.UID === Obj?.UID
    );
    helperData.scope.SSS.socket.emit('object:scalling', filteredObjects);
    Objects.objects.forEach((element) => {
      if (element.UID == Obj.UID) {
        helperData.scope.SSS.socket.emit('object:scalling', element);
      }
    });
    return;
  } else if (Obj?.objType === 'container-rect') {
    let container = Objects.objects.find(
      (obj) => obj?.UID === Obj?.UID && obj?.objType === 'container-rect'
    );
    let text = Objects.objects.find(
      (obj) => obj?.UID === Obj?.UID && obj?.objType === 'container-text'
    );
    let line = Objects.objects.find(
      (obj) => obj?.UID === Obj?.UID && obj?.objType === 'container-line'
    );
    helperData.scope.SSS.socket.emit('object:scalling', [container, text, line]);
  }
} 

export const emitMouseMove = (e,helperData) => {
  let userDetails = JSON.parse(localStorage.getItem('userDetails'));
  const userName = `${userDetails.firstName} ${userDetails.lastName.charAt(
    0
  )}`;
  helperData.scope.SSS.socket.emit('mouse:move', {
    x: e.absolutePointer.x,
    y: e.absolutePointer.y,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    color: randomColor(),
    userName: userName,
  });
}


export const emitSelectedAllObjectsLockStatus = (objects,helperData) => {
  const Objects = convertCanvasDataToJson(helperData);
  let allData = [];
  objects.getObjects().forEach((obj) => {
    Objects.objects.forEach((ob) => {
      if (ob?.UID === obj?.UID && ob?.objType === obj?.objType) {
        allData.push(ob);
      }
    });
  });
  helperData.scope.SSS.socket.emit('lock:selected:objects', allData);
}

export const emitSelectedAllObjectMouseDown = (allObjects,helperData) => {
  const Objects = convertCanvasDataToJson(helperData);
  let allData = [];
  allObjects.getObjects().forEach((obj) => {
    Objects.objects.forEach((ob) => {
      if (ob?.UID === obj?.UID && ob?.objType === obj?.objType) {
        allData.push(ob);
      }
    });
  });
  helperData.scope.SSS.socket.emit('selected-object-mousedown', allData);
}


