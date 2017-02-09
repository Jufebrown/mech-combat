//finds x,y odd-q coordinates based on mouse position returns object
function hexPosition() {
  let hexPositionObj = {}
  hexPositionObj.candidateX = Math.floor((game.input.worldX-hexagonGroup.x)/sectorWidth);
  hexPositionObj.candidateY = Math.floor((game.input.worldY-hexagonGroup.y)/sectorHeight);
  let deltaX = (game.input.worldX-hexagonGroup.x)%sectorWidth;
  let deltaY = (game.input.worldY-hexagonGroup.y)%sectorHeight;
  if(hexPositionObj.candidateX%2==0){
    if(deltaX<((hexagonWidth/4)-deltaY*gradient)){
      hexPositionObj.candidateX--;
      hexPositionObj.candidateY--;
    }
    if(deltaX<((-hexagonWidth/4)+deltaY*gradient)){
      hexPositionObj.candidateX--;
    }
  } else {
    if(deltaY>=hexagonHeight/2) {
      if(deltaX<(hexagonWidth/2-deltaY*gradient)){
        hexPositionObj.candidateX--;
      }
    } else {
      if(deltaX<deltaY*gradient){
        hexPositionObj.candidateX--;
      } else {
        hexPositionObj.candidateY--;
      }
    }
  }
  return hexPositionObj
}
