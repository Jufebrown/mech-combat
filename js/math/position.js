'use strict';

module.exports = function() {
  //finds x,y odd-q coordinates based on mouse position returns object
  function hexPosition() {
    let hexPositionObj = {}
    hexPositionObj.x = Math.floor((game.input.worldX-hexagonGroup.x)/sectorWidth);
    hexPositionObj.y = Math.floor((game.input.worldY-hexagonGroup.y)/sectorHeight);
    let deltaX = (game.input.worldX-hexagonGroup.x)%sectorWidth;
    let deltaY = (game.input.worldY-hexagonGroup.y)%sectorHeight;
    if(hexPositionObj.x%2==0){
      if(deltaX<((hexagonWidth/4)-deltaY*gradient)){
        hexPositionObj.x--;
        hexPositionObj.y--;
      }
      if(deltaX<((-hexagonWidth/4)+deltaY*gradient)){
        hexPositionObj.x--;
      }
    } else {
      if(deltaY>=hexagonHeight/2) {
        if(deltaX<(hexagonWidth/2-deltaY*gradient)){
          hexPositionObj.x--;
        }
      } else {
        if(deltaX<deltaY*gradient){
          hexPositionObj.x--;
        } else {
          hexPositionObj.y--;
        }
      }
    }
    // console.log('hexPositionObj', hexPositionObj)
    return hexPositionObj
  }
  
  function hexPositionFromSpriteCoordinates(spriteX, spriteY) {
    let hexPositionObj = {}
    hexPositionObj.x = Math.floor((spriteX-hexagonGroup.x)/sectorWidth);
    hexPositionObj.y = Math.floor((spriteY-hexagonGroup.y)/sectorHeight);
    let deltaX = (spriteX-hexagonGroup.x)%sectorWidth;
    let deltaY = (spriteY-hexagonGroup.y)%sectorHeight;
    if(hexPositionObj.x%2==0){
      if(deltaX<((hexagonWidth/4)-deltaY*gradient)){
        hexPositionObj.x--;
        hexPositionObj.y--;
      }
      if(deltaX<((-hexagonWidth/4)+deltaY*gradient)){
        hexPositionObj.x--;
      }
    } else {
      if(deltaY>=hexagonHeight/2) {
        if(deltaX<(hexagonWidth/2-deltaY*gradient)){
          hexPositionObj.x--;
        }
      } else {
        if(deltaX<deltaY*gradient){
          hexPositionObj.x--;
        } else {
          hexPositionObj.y--;
        }
      }
    }
    // console.log('hexPositionObj', hexPositionObj)
    return hexPositionObj
  }
}
