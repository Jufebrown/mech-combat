/**************************************
TODO: simplify functions, split them up
**************************************/



/**************************************
                Player
**************************************/

function targetEnable(targetCandidate) {
  // brings enemy squad sprite to top display layer so it is clickable for player
  game.world.bringToTop(enemySquad)
  // adds click listener
  targetCandidate.events.onInputDown.add(combat, targetCandidate)
}



/**************************************
                Enemy
**************************************/

// checks to see if unit health is <= 0
function destroyCheck(target) {
  if (target.health <= 0) {
    explodeMech(target)
    // calls kill and destroy (phaser methods)
    target.kill()
    target.destroy()
    // removes unit from group
    if (target.key === 'player') {
      playerSquad.remove(target)
    } else if (target.key === 'enemy') {
      enemySquad.remove(target)
    }
    // calls a check on game over
    gameOverCheck()
  }
}

// function to find hexes within weapon range
function getWeaponRange() {
  let startCubePosition = moveToCubePos
  let nRange = currentSprite.weaponRange
  let cubeFireRange = rangeCalc(startCubePosition, nRange)
  const nextAction = 'fire'
  highlightRange(cubeFireRange, nextAction)
}

// removes click listener
function targetDisable(targetCandidate) {
  targetCandidate.events.onInputDown.remove(combat, targetCandidate)
}

// calculates weapon hit
function hitCalc() {
  // initializes to miss
  let hitResolution = {hit: false, crit: false}
  //gets a random number between 1-100
  let hitRoll = Math.floor(Math.random() * 100) + 1
  console.log('hitRoll', hitRoll)
  // need at least the toHitNumber to hit target
  let toHitNumber = 20
  // critical hit if attack roll is 90+
  if (hitRoll >= 90) {
    hitResolution.hit = true
    hitResolution.crit = true
    return hitResolution
  // hit if attack roll >= toHitNumber
  } else if (hitRoll >= toHitNumber) {
    hitResolution.hit = true
    return hitResolution
  // miss if attack roll lower than toHitNumber
  } else {
    return hitResolution
  }
}

// applies critical damage on target
function critDamage(shooter, target) {
  // adds shooter's damage and critDamage attributes
  let damage = shooter.damage + shooter.critDamage
  console.log('damage', damage)
  console.log('target.health before hit', target.health)
  // subtracts damage from target health
  target.health = target.health - damage
  console.log('target.health after hit', target.health)
}

// applies regular damage from shooter to target
function damage(shooter, target) {
  let damage = shooter.damage
  console.log('damage', damage)
  console.log('target.health before hit', target.health)
  // subtracts damage from target health
  target.health = target.health - damage
  console.log('target.health after hit', target.health)
}

// handles misses
function miss(shooter, target) {
  console.log('miss')
}

// handles combat for player units
function combat(targetCandidate) {
  // rotates attacking sprite to face target
  currentSprite.rotation = game.physics.arcade.angleBetween(currentSprite, targetCandidate)
  // set the attacking sprite to show it has fired so it won't be able to attack again
  currentSprite.hasFired = true
  // removes any highlighted hexes
  killHighlight()
  // removes click listener from target so it can't be attacked again by the same unit
  targetDisable(targetCandidate)
  // sets shooter and target
  let shooter = currentSprite
  let target = targetCandidate
  // checks to see if a critical hit
  if (hitCalc().crit) {
    critDamage(shooter, target)
  // checks for regular hit
  } else if (hitCalc().hit) {
    damage(shooter, target)
  // checks for miss
  } else {
    miss(shooter, target)
  }
  // checks to see if target was destroyed
  destroyCheck(target)
  // reenables listener for player movement
  enablePlayerMoves()
  // checks to see if all players have attacked (turn end)
  checkEndPlayerTurn()
}

// handles combat for enemy units
function enemyCombat(currentlyMovingEnemy, targetCandidate) {
  // console.log('enemyCombat')
  // rotates enemy unit toward player being attacked
  currentlyMovingEnemy.rotation = game.physics.arcade.angleBetween(currentlyMovingEnemy, targetCandidate)
  // sets shooter and target
  let shooter = currentlyMovingEnemy
  let target = targetCandidate
  // checks to see if a critical hit
  if (hitCalc().crit) {
    critDamage(shooter, target)
  // checks for regular hit
  } else if (hitCalc().hit) {
    damage(shooter, target)
  // checks for miss
  } else {
    miss(shooter, target)
  }
  // checks to see if target was destroyed
  destroyCheck(target)
  // lists enemy as having fired
  currentlyMovingEnemy.hasFired = true
  // sets currently moving enemy as empty object
  currentlyMovingEnemy = {}
  // checks to see if enemy turn is over
  checkEndEnemyTurn()
}
