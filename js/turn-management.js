/**************************************
                Player
**************************************/

function startPlayerTurn(playerTurnText) {
  playerTurnText.destroy()
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
  console.log('checking player turn end', playerDone)
  if (playerDone) {
    // gameOverCheck()
    if (!gameOver) {
      playerTurn = false
      enemyTurnSetup()
      let enemyTurnText = game.add.text(300, 200, "Enemy Turn Start");
      enemyTurnText.anchor.set(0.5);
      enemyTurnText.align = 'center';
      enemyTurnText.font = 'Arial';
      enemyTurnText.fontWeight = 'bold';
      enemyTurnText.fontSize = 40;
      enemyTurnText.fill = '#ffffff';
      enemyTurnText.fixedToCamera = true
      game.time.events.add(Phaser.Timer.SECOND * 1, startEnemyTurn, this, enemyTurnText);
    }
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
  let enemyDone = checkEnemyDone()
  console.log('enemyDone', enemyDone)
  if (enemyDone) {
    // gameOverCheck()
    if (!gameOver) {
      playerTurn = true
      playerTurnSetup()
      let playerTurnText = game.add.text(300, 200, "Player Turn Start");
      playerTurnText.anchor.set(0.5);
      playerTurnText.align = 'center';
      playerTurnText.font = 'Arial';
      playerTurnText.fontWeight = 'bold';
      playerTurnText.fontSize = 40;
      playerTurnText.fill = '#ffffff';
      playerTurnText.fixedToCamera = true
      game.time.events.add(Phaser.Timer.SECOND * 1, startPlayerTurn, this, playerTurnText);
    }
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


function startEnemyTurn(enemyTurnText) {
  if (!victory) {
    // console.log('enemyMoveType is called next')
    enemyTurnText.destroy()
    enemyMoveType()
  }
}
