/**************************************
                Player
**************************************/
//moves sprite to specified hex
function moveSprite (posX,posY) {
  currentSprite.hasMoved = true
  let tween
  let endX = hexToPixelX(posX)
  let endY = hexToPixelY(posX,posY)
  moveToCubePos = offsetToCube(hexPosition().x,hexPosition().y)
  //let facingAngle = Math.round((game.physics.arcade.angleToPointer(currentSprite)*180/Math.PI)/60)*60
  //console.log('pointer angle', game.physics.arcade.angleToPointer(currentSprite))
  currentSprite.rotation = game.physics.arcade.angleToPointer(currentSprite)//facingAngle
  //console.log("facingAngle", facingAngle)
  //  300 = 300 pixels per second = the speed the sprite will move at, regardless of the distance it has to travel
  var duration = 1000 //(game.physics.arcade.distanceToPointer(player, pointer) / 300) * 1000;
  tween = game.add.tween(currentSprite).to({ x: endX, y: endY }, duration, Phaser.Easing.Linear.None, true);
  tween.onComplete.add(clearMoveListeners, this)
}



/**************************************
                Enemy
**************************************/

function clearMoveListeners() {
  game.input.onDown.remove(checkHex, currentHex);
  currentSprite.events.onInputDown.remove(getMoveRange, currentSprite)
  killHighlight()
  getWeaponRange()
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

//moves sprite to specified hex
function moveEnemySprite(offsetNearestHex, nearestPlayer) {
  // console.log('offsetNearestHex', offsetNearestHex)
  currentlyMovingEnemy.hasMoved = true
  let hexEndX = offsetNearestHex.col
  let hexEndY = offsetNearestHex.row
  let endX = hexToPixelX(hexEndX)
  let endY = hexToPixelY(hexEndX, hexEndY)
  let tween
  // moveToCubePos = offsetToCube(hexPosition().x,hexPosition().y)
  // currentSprite.rotation = game.physics.arcade.angleToPointer(currentSprite)
  //  300 = 300 pixels per second = the speed the sprite will move at, regardless of the distance it has to travel
  var duration = 1000 //(game.physics.arcade.distanceToPointer(player, pointer) / 300) * 1000;
  tween = game.add.tween(currentlyMovingEnemy).to({ x: endX, y: endY }, duration, Phaser.Easing.Linear.None, true);
  tween.onComplete.add(enemyAttack, this)
}

function getEnemyMoveRange(cubePositionCurrentEnemy) {
  let startCubePosition = cubePositionCurrentEnemy
  let nRange = currentlyMovingEnemy.movePoints
  let cubeMoveRange = rangeCalc(startCubePosition, nRange)
  return cubeMoveRange
}

function findNearestHex(cubeNearestPlayerPos, enemyMoveCubeRangeArray) {
  let nearestHexDistance = 10000
  let nearestCubeHex
  for(var i = 0, length1 = enemyMoveCubeRangeArray.length; i < length1; i++){
    let distanceBetweenNearPlayerPosAndHex = cubeDistance(cubeNearestPlayerPos, enemyMoveCubeRangeArray[i])
    // console.log('distanceBetweenNearPlayerPosAndHex', distanceBetweenNearPlayerPosAndHex)
    if (nearestHexDistance > distanceBetweenNearPlayerPosAndHex) {
      nearestHexDistance = distanceBetweenNearPlayerPosAndHex
      nearestCubeHex = enemyMoveCubeRangeArray[i]
      // console.log('nearestHexDistance', nearestHexDistance)
    }
  }
  return nearestCubeHex
}

function findNearestPlayer() {
  let nearestPlayerDistance = 10000
  let nearestPlayer
  for(var i = 0, length1 = playerSquad.children.length; i < length1; i++) {
    if (game.physics.arcade.distanceBetween(currentlyMovingEnemy, playerSquad.children[i]) < nearestPlayerDistance) {
      nearestPlayerDistance = game.physics.arcade.distanceBetween(currentlyMovingEnemy, playerSquad.children[i])
      nearestPlayer = playerSquad.children[i]
    }
  }
  // console.log('nearestPlayer', nearestPlayer)
  return nearestPlayer
}
