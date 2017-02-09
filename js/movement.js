//moves sprite to specified hex
function moveSprite (posX,posY,currentSprite) {
  let endX = hexToPixelX(posX)
  let endY = hexToPixelY(posX,posY)

  // player.rotation = game.physics.arcade.angleToPointer(player, pointer);

  //  300 = 300 pixels per second = the speed the sprite will move at, regardless of the distance it has to travel
  var duration = 1000 //(game.physics.arcade.distanceToPointer(player, pointer) / 300) * 1000;
  tween = game.add.tween(currentSprite).to({ x: endX, y: endY }, duration, Phaser.Easing.Linear.None, true);
  game.input.onDown.remove(checkHex, currentSprite);
  currentSprite.events.onInputDown.remove(makeMove, currentSprite)
}

//checks to see what hex the mouse pointer is over and sends info to moveSprite()
function checkHex(){
  let currentSprite = this
  // placeMarker(x,y);
  moveSprite (hexPosition().x, hexPosition().y, currentSprite)
}

function makeMove() {
  game.input.onDown.add(checkHex, this); //listens for mouse clicks
}
