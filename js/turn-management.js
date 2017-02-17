/**************************************
                Player
**************************************/

function startPlayerTurn() {
  enablePlayerMoves()
}

function playerTurnSetup() {
  for(var i = 0, length1 = playerSquad.children.length; i < length1; i++){
    playerSquad.children[i].hasMoved = false
    playerSquad.children[i].hasFired = false
  }
}

function checkEndPlayerTurn() {
  let playerDone = checkPlayerDone()
  if (playerDone) {
    playerTurn = false
    enemyTurnSetup()
    startEnemyTurn()
  }
}

function checkPlayerDone() {
  let allPlayersDone = true
  for(var i = 0, length1 = playerSquad.children.length; i < length1; i++){
    if(playerSquad.children[i].hasFired === false) {
      allPlayersDone = false
      return allPlayersDone
    }
  }
  return allPlayersDone
}


/**************************************
                Enemy
**************************************/

function checkEndEnemyTurn() {
  console.log('checking end of enemy turn')
  let enemyDone = checkEnemyDone()
  console.log('enemyDone', enemyDone)
  if (enemyDone) {
    playerTurnSetup()
    startPlayerTurn()
    playerTurn = true
  }
}

function checkEnemyDone() {
  let allEnemiesDone = true
  for(var i = 0, length1 = enemySquad.children.length; i < length1; i++){
    if(enemySquad.children[i].hasFired === false) {
      allEnemiesDone = false
      return allEnemiesDone
    }
  }
  return allEnemiesDone
}

function enemyTurnSetup() {
  for(var i = 0, length1 = enemySquad.children.length; i < length1; i++){
    enemySquad.children[i].hasMoved = false
    enemySquad.children[i].hasFired = false
  }
}


function startEnemyTurn() {
  if (!victory) {
    // console.log('enemyMoveType is called next')
    enemyMoveType()
  }
}
