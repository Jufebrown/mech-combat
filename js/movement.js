function clearMoveListeners() {
  game.input.onDown.remove(checkHex, currentHex);
  currentSprite.events.onInputDown.remove(getMoveRange, currentSprite)
  killHighlight()
  getWeaponRange()
}

//moves sprite to specified hex
function moveSprite (posX,posY) {
  currentSprite.hasMoved = true
  let endX = hexToPixelX(posX)
  let endY = hexToPixelY(posX,posY)
  moveToCubePos = offsetToCube(hexPosition().x,hexPosition().y)
  currentSprite.rotation = game.physics.arcade.angleToPointer(currentSprite)
  //  300 = 300 pixels per second = the speed the sprite will move at, regardless of the distance it has to travel
  var duration = 1000 //(game.physics.arcade.distanceToPointer(player, pointer) / 300) * 1000;
  tween = game.add.tween(currentSprite).to({ x: endX, y: endY }, duration, Phaser.Easing.Linear.None, true);
  tween.onComplete.add(clearMoveListeners, this)
}

//checks to see what hex the mouse pointer is over and sends info to moveSprite()
function checkHex(){
  currentHex = this
  disablePlayerMoves()
  moveSprite (hexPosition().x, hexPosition().y, currentSprite)
}

function getMoveRange(posX,posY) {
  currentSprite = this
  let startCubePosition = offsetToCube(hexPosition().x,hexPosition().y)
  let nRange = currentSprite.movePoints
  let cubeMoveRange = rangeCalc(startCubePosition, nRange)
  const nextAction = 'move'
  highlightRange(cubeMoveRange, nextAction)
}
