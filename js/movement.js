function clearMoveListeners() {
  game.input.onDown.remove(checkHex, currentHex);
  currentSprite.events.onInputDown.remove(getMoveRange, currentSprite)
  for(var i = 0, length1 = highlightSpriteArray.length; i < length1; i++){
    highlightSpriteArray[i].visible = false
  }
  highlightSpriteArray = []
}

//moves sprite to specified hex
function moveSprite (posX,posY) {
  let endX = hexToPixelX(posX)
  let endY = hexToPixelY(posX,posY)

  //  300 = 300 pixels per second = the speed the sprite will move at, regardless of the distance it has to travel
  var duration = 1000 //(game.physics.arcade.distanceToPointer(player, pointer) / 300) * 1000;
  tween = game.add.tween(currentSprite).to({ x: endX, y: endY }, duration, Phaser.Easing.Linear.None, true);
  tween.onComplete.add(clearMoveListeners, this)
}

//checks to see what hex the mouse pointer is over and sends info to moveSprite()
function checkHex(){
  currentHex = this
  // placeMarker(x,y);
  moveSprite (hexPosition().x, hexPosition().y, currentSprite)
}

function highlightPossibleMoves(cubeMoveRange) {
  highlightGroup = game.add.group()
  highlightGroup.x = hexagonGroup.x
  highlightGroup.y = hexagonGroup.y
  for(var i = 0, length1 = cubeMoveRange.length; i < length1; i++){
    highlightSpriteArray[i] = game.add.sprite(0,0,"highlight");
    highlightSpriteArray[i].anchor.setTo(0.5, .5);
    highlightSpriteArray[i].alpha = .3
    highlightSpriteArray[i].visible = true;
    let currentHex = cubeToOffset(cubeMoveRange[i].x, cubeMoveRange[i].z)
    highlightSpriteArray[i].x = hexToPixelX(currentHex.col)
    highlightSpriteArray[i].y = hexToPixelY(currentHex.col,currentHex.row)
    highlightGroup.add(highlightSpriteArray[i]);
    highlightSpriteArray[i].inputEnabled = true
    highlightSpriteArray[i].events.onInputDown.add(checkHex, highlightSpriteArray[i])
  }
}

function getMoveRange(posX,posY) {
  currentSprite = this
  let startCubePosition = offsetToCube(hexPosition().x,hexPosition().y)
  let nRange = currentSprite.movePoints
  let cubeMoveRange = rangeCalc(startCubePosition, nRange)
  highlightPossibleMoves(cubeMoveRange)
}

// function makeMove() {
//   game.input.onDown.add(getMoveRange, this); //listens for mouse clicks
// }
