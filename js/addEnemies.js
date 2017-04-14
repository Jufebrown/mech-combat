// function to add enemy squad to map. Plan on having squad array in level data
function addEnemySquad() {
  let startingEnemySquadArray = [
    {positionX: 6, positionY: 0},
    {positionX: 4, positionY: 0},
    {positionX: 8, positionY: 0}
    ]

  // loops over array and puts each unit on x,y coordinates
  for(let i = 0, length1 = startingEnemySquadArray.length; i < length1; i++){
    let startX = hexToPixelX(startingEnemySquadArray[i].positionX)
    let startY = hexToPixelY(startingEnemySquadArray[i].positionX,startingEnemySquadArray[i].positionY)
    new EnemyScout(game, startX, startY)
    //allows squad units to be clickable
    enemySquad.children[i].inputEnabled = true
  }
}
