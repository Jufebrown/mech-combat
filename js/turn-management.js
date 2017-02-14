function startPlayerTurn() {
  enablePlayerMoves()
}

function checkEndPlayerTurn() {
  if (checkPlayerDone) {
    enemyTurnSetup()
    startEnemyTurn()
  }
}

function enemyTurnSetup() {
  for(var i = 0, length1 = enemySquad.children.length; i < length1; i++){
    enemySquad.children[i].hasMoved = false
    enemySquad.children[i].hasFired = false
  }
}

function checkPlayerDone() {
  let allPlayersDone = true
  for(var i = 0, length1 = playerSquad.chidren.length; i < length1; i++){
    if(playerSquad.chidren[i].hasFired === false) {
      allPlayersDone = false
    }
  }
  return allPlayersDone
}

function startEnemyTurn() {
  if (!victory) {
    enemyMoveType()
  }
}
