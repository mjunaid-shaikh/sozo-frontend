import { containerOneByOne } from "./container-onebyone";

export const containerTwoByTwo = (multiple, objectPos = null,helperData) => {
    let groupData = containerOneByOne(multiple, objectPos,helperData);
    let posData = {
      top: groupData.top,
      left: groupData.left + groupData.width + 20,
    };
    containerOneByOne(false, posData,helperData);
    posData.top = groupData.top + groupData.height + 20;
    posData.left = groupData.left;
    containerOneByOne(false, posData,helperData);
    posData.top = groupData.top + groupData.height + 20;
    posData.left = groupData.left + groupData.width + 20;
    containerOneByOne(false, posData,helperData);
  }