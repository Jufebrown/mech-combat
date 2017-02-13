function destroyCheck(target) {
  if (target.health <= 0) {
    target.kill()
    target.destroy()
    enemySquad.remove(target)
  }
}

function getWeaponRange() {
  let startCubePosition = offsetToCube(hexPosition().x,hexPosition().y)
  let nRange = currentSprite.weaponRange
  let cubeMoveRange = rangeCalc(startCubePosition, nRange)
  const nextAction = 'fire'
  highlightRange(cubeMoveRange, nextAction)
}

function targetEnable(targetCandidate) {
  game.world.bringToTop(enemySquad)
  targetCandidate.events.onInputDown.add(combat, targetCandidate)
  console.log('targetCandidate', targetCandidate)
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

function critDamage(target) {
  let damage = currentSprite.damage + currentSprite.critDamage
  console.log('damage', damage)
  console.log('target.health before hit', target.health)
  target.health = target.health - damage
  console.log('target.health after hit', target.health)
}

function damage(target) {
  let damage = currentSprite.damage
  console.log('damage', damage)
  console.log('target.health before hit', target.health)
  target.health = target.health - damage
  console.log('target.health after hit', target.health)
}

function miss(target) {
  console.log('miss')
}

function combat(targetCandidate) {
  killHighlight()
  targetDisable(targetCandidate)
  let target = targetCandidate
  if (hitCalc().crit) {
    critDamage(target)
  } else if (hitCalc().hit) {
    damage(target)
  } else {
    miss(target)
  }
  destroyCheck(target)
}
