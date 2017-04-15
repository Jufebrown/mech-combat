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
  // console.log('hitRoll', hitRoll)
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

function critDamage(shooter, target) {
  let damage = shooter.damage + shooter.critDamage
  console.log('damage', damage)
  console.log('target.health before hit', target.health)
  target.health = target.health - damage
  console.log('target.health after hit', target.health)
}

function damage(shooter, target) {
  let damage = shooter.damage
  console.log('damage', damage)
  console.log('target.health before hit', target.health)
  target.health = target.health - damage
  console.log('target.health after hit', target.health)
}

function miss(shooter, target) {
  console.log('miss')
}

function combat(targetCandidate) {
  currentSprite.rotation = game.physics.arcade.angleBetween(currentSprite, targetCandidate)
  currentSprite.hasFired = true
  killHighlight()
  targetDisable(targetCandidate)
  let shooter = currentSprite
  let target = targetCandidate
  if (hitCalc().crit) {
    critDamage(shooter, target)
  } else if (hitCalc().hit) {
    damage(shooter, target)
  } else {
    miss(shooter, target)
  }
  destroyCheck(target)
  enablePlayerMoves()
  checkEndPlayerTurn()
}

function enemyCombat(currentlyMovingEnemy, targetCandidate) {
  console.log('enemyCombat')
  currentlyMovingEnemy.rotation = game.physics.arcade.angleBetween(currentlyMovingEnemy, targetCandidate)
  let shooter = currentlyMovingEnemy
  let target = targetCandidate
  if (hitCalc().crit) {
    critDamage(shooter, target)
  } else if (hitCalc().hit) {
    damage(shooter, target)
  } else {
    miss(shooter, target)
  }
  destroyCheck(target)
  currentlyMovingEnemy.hasFired = true
  currentlyMovingEnemy = {}
  checkEndEnemyTurn()
}
