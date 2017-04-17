/**************************************
                Player
**************************************/
//moves sprite to specified hex
function moveSprite (posX,posY) {
  currentSprite.hasMoved = true
  let tween
  let endX = hexToPixelX(posX)
  let endY = hexToPixelY(posX,posY)
  // gets cubic coordinate position for end coordinates
  moveToCubePos = offsetToCube(hexPosition().x,hexPosition().y)
  //let facingAngle = Math.round((game.physics.arcade.angleToPointer(currentSprite)*180/Math.PI)/60)*60
  //console.log('pointer angle', game.physics.arcade.angleToPointer(currentSprite))
  // faces sprite toward point where mouse is clicked
  currentSprite.rotation = game.physics.arcade.angleToPointer(currentSprite)//facingAngle
  // plays walk animation at 30 frames/sec
  currentSprite.animations.play('walk', 30, true)
  //  300 = 300 pixels per second = the speed the sprite will move at, regardless of the distance it has to travel
  var duration = 1000 //(game.physics.arcade.distanceToPointer(player, pointer) / 300) * 1000;
  tween = game.add.tween(currentSprite).to({ x: endX, y: endY }, duration, Phaser.Easing.Linear.None, true);
  // after tween completes calls clearMoveListeners on sprite
  tween.onComplete.add(clearMoveListeners, this)
}



/**************************************
                Enemy
**************************************/

// removes click listeners from sprite
function clearMoveListeners() {
  // removes listener when clicked and fires checkHex()
  game.input.onDown.remove(checkHex, currentHex);
  // stops animation
  currentSprite.animations.stop('walk')
  // removes listener on click and fires getMoveRange()
  currentSprite.events.onInputDown.remove(getMoveRange, currentSprite)
  // removes highlight hexes
  killHighlight()
  // gets equiped weapon range
  getWeaponRange()
}


//checks to see what hex the mouse pointer is over and sends info to moveSprite()
function checkHex(){
  // sets current position to clicked unit's position
  currentHex = this
  // removes click listeners on other units
  disablePlayerMoves()
  // fires moveSprite() with position info
  moveSprite(hexPosition().x, hexPosition().y, currentSprite)
}

// gets hexes within movement range of unit
function getMoveRange(posX,posY) {
  // sets currentSprite to the one that is clicked
  currentSprite = this
  let startCubePosition = offsetToCube(hexPosition().x,hexPosition().y)
  let nRange = currentSprite.movePoints
  // gets array of hexes within range
  let cubeMoveRange = rangeCalc(startCubePosition, nRange)
  // sets nextAction to move
  const nextAction = 'move'
  // highights hexes in cubeMoveRange array
  highlightRange(cubeMoveRange, nextAction)
}

//moves enemy sprite to specified hex
function moveEnemySprite(currentlyMovingEnemy, offsetNearestHex, nearestPlayer) {
  // sets enemy sprite's hasMoved property to true
  currentlyMovingEnemy.hasMoved = true
  let hexEndX = offsetNearestHex.col
  let hexEndY = offsetNearestHex.row
  let endX = hexToPixelX(hexEndX)
  let endY = hexToPixelY(hexEndX, hexEndY)
  const duration = 1000
  let tween = game.add.tween(currentlyMovingEnemy).to({ x: endX, y: endY }, duration, Phaser.Easing.Linear.None, true);
  // when tween completes enemy unit looks for targets within weapon's range
  tween.onComplete.add(checkForTargetInWeaponsRange, this)
}

// gets hexes enemy unit could move to
function getEnemyMoveRange(currentlyMovingEnemy, cubePositionCurrentEnemy) {
  let startCubePosition = cubePositionCurrentEnemy
  let nRange = currentlyMovingEnemy.movePoints
  let cubeMoveRange = rangeCalc(startCubePosition, nRange)
  return cubeMoveRange
}

// finds hex within movement range closest to nearest player
function findNearestHex(cubeNearestPlayerPos, enemyMoveCubeRangeArray) {
  //initialize nearestHexDistance to an absurdly high number
  let nearestHexDistance = 100000
  let nearestCubeHex
  // loops through possible moves
  for(var i = 0, length1 = enemyMoveCubeRangeArray.length; i < length1; i++){
    // gets distance between the hex and the nearest player
    let distanceBetweenNearPlayerPosAndHex = cubeDistance(cubeNearestPlayerPos, enemyMoveCubeRangeArray[i])
    // if the distanceBetweenNearPlayerPosAndHex is smaller than nearestHexDistance, nearestHexDistance is set to distanceBetweenNearPlayerPosAndHex and the nearestCubeHex is the hex currently being looped over
    if (nearestHexDistance > distanceBetweenNearPlayerPosAndHex) {
      nearestHexDistance = distanceBetweenNearPlayerPosAndHex
      nearestCubeHex = enemyMoveCubeRangeArray[i]
      // console.log('nearestHexDistance', nearestHexDistance)
    }
  }
  return nearestCubeHex
}

// finds player nearest to enemy unit
function findNearestPlayer(currentlyMovingEnemy) {
  // sets nearestPlayerDistance to absurdly high number
  let nearestPlayerDistance = 100000
  let nearestPlayer
  // loops over player squad
  for(var i = 0, length1 = playerSquad.children.length; i < length1; i++) {
    // if distance between player and enemy is smaller than nearestPlayerDistance, nearestPlayerDistance is set to that distance and nearestPlayer is set to that player unit
    if (game.physics.arcade.distanceBetween(currentlyMovingEnemy, playerSquad.children[i]) < nearestPlayerDistance) {
      nearestPlayerDistance = game.physics.arcade.distanceBetween(currentlyMovingEnemy, playerSquad.children[i])
      nearestPlayer = playerSquad.children[i]
    }
  }
  // console.log('nearestPlayer', nearestPlayer)
  return nearestPlayer
}
