/**************************************
                Player
**************************************/

function targetEnable(targetCandidate) {
  game.world.bringToTop(enemySquad)
  targetCandidate.events.onInputDown.add(combat, targetCandidate)
}



/**************************************
                Enemy
**************************************/

function destroyCheck(target) {
  if (target.health <= 0) {
    explodeMech(target)
    target.kill()
    target.destroy()
    if (target.key === 'player') {
      playerSquad.remove(target)
    } else if (target.key === 'enemy') {
      enemySquad.remove(target)
    }
  }
}

function getWeaponRange() {
  let startCubePosition = moveToCubePos
  let nRange = currentSprite.weaponRange
  let cubeFireRange = rangeCalc(startCubePosition, nRange)
  const nextAction = 'fire'
  highlightRange(cubeFireRange, nextAction)
}


function targetDisable(targetCandidate) {
  targetCandidate.events.onInputDown.remove(combat, targetCandidate)
}

function hitCalc() {
  let hitResolution = {hit: false, crit: false}
  let hitRoll = Math.floor(Math.random() * 100) + 1
  console.log('hitRoll', hitRoll)
  let toHitNumber = 20
  if (hitRoll >= 90) {
    hitResolution.hit = true
    hitResolution.crit = true
    return hitResolution
  } else if (hitRoll >= toHitNumber) {
    hitResolution.hit = true
    return hitResolution
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

function enemyCombat(targetCandidate) {
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
  checkEndEnemyTurn()
}

function enemyAttack() {
  checkForTargetInWeaponsRange()
}
