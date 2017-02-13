function addEnemySquad() {
  let startingEnemySquadArray = [
    {positionX: 10, positionY: 9},
    {positionX: 4, positionY: 0},
    {positionX: 18, positionY: 0}
    ]

  for(let i = 0, length1 = startingEnemySquadArray.length; i < length1; i++){
    let startX = hexToPixelX(startingEnemySquadArray[i].positionX)
    let startY = hexToPixelY(startingEnemySquadArray[i].positionX,startingEnemySquadArray[i].positionY)
    new EnemyScout(game, startX, startY)
  }
}
