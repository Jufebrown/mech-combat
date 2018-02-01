'use strict';

module.exports = function() {
  function chargeAtPlayer(currentlyMovingEnemy) {
    let xPos = currentlyMovingEnemy.x
    let yPos = currentlyMovingEnemy.y
    let positionCurrentEnemy = hexPositionFromSpriteCoordinates(xPos, yPos)
    let cubePositionCurrentEnemy = offsetToCube(positionCurrentEnemy.x, positionCurrentEnemy.y)
    //if nearest player is in weapon range => attack
    if (currentlyMovingEnemy.hasMoved === false) {
      let nearestPlayer = findNearestPlayer(currentlyMovingEnemy)
      //get position of nearest player
      let nearestPlayerHexPos = hexPositionFromSpriteCoordinates(nearestPlayer.x, nearestPlayer.y)
      let cubeNearestPlayerPos = offsetToCube(nearestPlayerHexPos.x, nearestPlayerHexPos.y)
      //get distance to nearest player
      let distanceBetweenEnemyAndNearestPlayer = cubeDistance(cubePositionCurrentEnemy, cubeNearestPlayerPos)
      if (distanceBetweenEnemyAndNearestPlayer <= currentlyMovingEnemy.weaponRange) {
        // fire on nearestPlayer
        currentlyMovingEnemy.hasMoved = true
        // enemyAttack()
        checkForTargetInWeaponsRange(currentlyMovingEnemy)
      } else { //else move to hex closest to nearest player
        //get enemy move range
        let enemyMoveCubeRangeArray = getEnemyMoveRange(currentlyMovingEnemy, cubePositionCurrentEnemy)
        // console.log('enemyMoveCubeRangeArray', enemyMoveCubeRangeArray)
        //test each range hex to see if it's closest to nearest player
        let cubeNearestHex = findNearestHex(cubeNearestPlayerPos, enemyMoveCubeRangeArray)
        // console.log('cubeNearestHex', cubeNearestHex)
        let offsetNearestHex = cubeToOffset(cubeNearestHex.x, cubeNearestHex.z)
        moveEnemySprite(currentlyMovingEnemy, offsetNearestHex, nearestPlayer)
      }
    }
  }
  // function patrol() {
  
  // }
  
  // function sentinel() {
  
  // }
  
  // function objectiveMove() {
  
  // }
}

