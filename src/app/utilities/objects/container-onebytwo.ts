import { containerOneByOne } from "./container-onebyone";

export const containerOneByTwo = (multiple, objectPos = null,helperData) => {
    let groupData = containerOneByOne(multiple, objectPos,helperData);

    let posData = {
      top: groupData.top,
      left: groupData.left + groupData.width + 20,
    };
    containerOneByOne(false, posData,helperData);
  }