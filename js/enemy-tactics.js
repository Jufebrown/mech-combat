function chargeAtPlayer() {
  let nearestPlayer = findNearestPlayer()
  // console.log('nearestPlayer', nearestPlayer)
  // console.log('currentlyMovingEnemy', currentlyMovingEnemy)
  let positionCurrentEnemy = hexPositionFromSpriteCoordinates(currentlyMovingEnemy.x, currentlyMovingEnemy.y)
  let cubePositionCurrentEnemy = offsetToCube(positionCurrentEnemy.x, positionCurrentEnemy.y)
  //get position of nearest player
  let nearestPlayerHexPos = hexPositionFromSpriteCoordinates(nearestPlayer.x, nearestPlayer.y)
  let cubeNearestPlayerPos = offsetToCube(nearestPlayerHexPos.x, nearestPlayerHexPos.y)
  //get distance to nearest player
  let distanceBetweenEnemyAndNearestPlayer = cubeDistance(cubePositionCurrentEnemy, cubeNearestPlayerPos)
  // console.log('cubeDistanceBetweenEnemyAndNearestPlayer', distanceBetweenEnemyAndNearestPlayer)
  //if nearest player is in weapon range => attack
  if (distanceBetweenEnemyAndNearestPlayer <= currentlyMovingEnemy.weaponRange) {
    // fire on nearestPlayer
    currentlyMovingEnemy.hasMoved = true
    enemyAttack()
  } else { //else move to hex closest to nearest player
    //get enemy move range
    let enemyMoveCubeRangeArray = getEnemyMoveRange(cubePositionCurrentEnemy)
    // console.log('enemyMoveCubeRangeArray', enemyMoveCubeRangeArray)
    //test each range hex to see if it's closest to nearest player
    let cubeNearestHex = findNearestHex(cubeNearestPlayerPos, enemyMoveCubeRangeArray)
    // console.log('cubeNearestHex', cubeNearestHex)
    let offsetNearestHex = cubeToOffset(cubeNearestHex.x, cubeNearestHex.z)
    moveEnemySprite(offsetNearestHex, nearestPlayer)
  }
}

function patrol() {

}

function sentinel() {

}

function objectiveMove() {

}
