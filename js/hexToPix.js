// functions to convert odd-q hex coodinates to pixel coordinates
// converts x coordinate
function hexToPixelX(posX) {
  let pixelX = (hexagonWidth/4)*3*posX+hexagonWidth/2;
  return pixelX
}

// converts y coordinate
function hexToPixelY(posX, posY) {
  let pixelY = hexagonHeight*posY;
  if(posX%2==0){
    pixelY += hexagonHeight/2;
  }
  else{
    pixelY += hexagonHeight;
  }
  return pixelY
}
